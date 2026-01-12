import express from 'express';
import { Order, OrderItem, Table, User, Product, RestaurantConfig, OrderCancellation } from '../models/index.js';
import { authenticate, authorize, requireOpenCashRegister } from '../middleware/auth.js';
import { io } from '../server.js';

const router = express.Router();

// Obtener todas las órdenes
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { mesaId, estado, meseroId } = req.query;

        const where = {};
        if (mesaId) where.mesaId = mesaId;
        if (estado) where.estado = estado;
        if (meseroId) where.meseroId = meseroId;

        const ordenes = await Order.findAll({
            where,
            include: [
                {
                    model: Table,
                    as: 'mesa',
                    attributes: ['id', 'numero', 'areaId']
                },
                {
                    model: User,
                    as: 'mesero',
                    attributes: ['id', 'nombre']
                },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'producto'
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(ordenes);
    } catch (error) {
        next(error);
    }
});

// Obtener orden por ID
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const orden = await Order.findByPk(req.params.id, {
            include: [
                {
                    model: Table,
                    as: 'mesa'
                },
                {
                    model: User,
                    as: 'mesero',
                    attributes: ['id', 'nombre']
                },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'producto'
                    }]
                }
            ]
        });

        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        res.json(orden);
    } catch (error) {
        next(error);
    }
});

// Crear nueva orden (meseros y cajeros)
router.post('/', authenticate, authorize('mesero', 'cajero', 'admin'), requireOpenCashRegister, async (req, res, next) => {
    try {
        const { mesaId, items, notas } = req.body;

        if (!mesaId || !items || items.length === 0) {
            return res.status(400).json({
                error: 'Mesa e items son requeridos'
            });
        }

        // Verificar que la mesa existe
        const mesa = await Table.findByPk(mesaId);
        if (!mesa) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        // Obtener configuración para porcentaje de servicio
        const config = await RestaurantConfig.findOne();

        // Determinar subOrden (para dividir cuenta)
        const ordenesExistentes = await Order.findAll({
            where: { mesaId, estado: ['abierta', 'enviada', 'en_preparacion'] }
        });
        const subOrden = ordenesExistentes.length + 1;

        // Crear orden
        const nuevaOrden = await Order.create({
            mesaId,
            meseroId: req.user.id,
            subOrden,
            porcentajeServicio: config?.servicioActivo ? config.porcentajeServicio : 0,
            notas
        });

        // Crear items
        let subtotal = 0;
        for (const item of items) {
            const producto = await Product.findByPk(item.productoId);
            if (!producto) {
                await nuevaOrden.destroy();
                return res.status(404).json({
                    error: `Producto con ID ${item.productoId} no encontrado`
                });
            }

            if (!producto.disponible) {
                await nuevaOrden.destroy();
                return res.status(400).json({
                    error: `Producto "${producto.nombre}" no está disponible`
                });
            }

            // Validar stock
            if (producto.controlarStock && producto.stock < item.cantidad) {
                await nuevaOrden.destroy();
                return res.status(400).json({
                    error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`
                });
            }

            // Descontar stock
            if (producto.controlarStock) {
                await producto.update({ stock: producto.stock - item.cantidad });
            }

            const itemSubtotal = producto.precio * item.cantidad;
            subtotal += itemSubtotal;

            await OrderItem.create({
                ordenId: nuevaOrden.id,
                productoId: producto.id,
                cantidad: item.cantidad,
                precioUnitario: producto.precio,
                subtotal: itemSubtotal,
                notas: item.notas
            });
        }

        // Calcular totales
        const montoServicio = (subtotal * nuevaOrden.porcentajeServicio) / 100;
        const total = subtotal + montoServicio;

        await nuevaOrden.update({
            subtotal,
            montoServicio,
            total
        });

        // Actualizar estado de mesa
        await mesa.update({ estado: 'ocupada' });

        // Recargar orden con relaciones
        const ordenCompleta = await Order.findByPk(nuevaOrden.id, {
            include: [
                { model: Table, as: 'mesa' },
                { model: User, as: 'mesero', attributes: ['id', 'nombre'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'producto' }]
                }
            ]
        });

        // Emitir evento Socket.io
        io.emit('nueva-orden', ordenCompleta);
        io.to(`table-${mesaId}`).emit('orden-actualizada', ordenCompleta);

        res.status(201).json({
            mensaje: 'Orden creada exitosamente',
            orden: ordenCompleta
        });
    } catch (error) {
        next(error);
    }
});

// Agregar items a orden existente
router.post('/:id/items', authenticate, authorize('mesero', 'cajero', 'admin'), async (req, res, next) => {
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Items son requeridos' });
        }

        const orden = await Order.findByPk(req.params.id);
        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        if (['pagada', 'cancelada'].includes(orden.estado)) {
            return res.status(400).json({
                error: 'No se pueden agregar items a una orden pagada o cancelada'
            });
        }

        let subtotalAdicional = 0;

        for (const item of items) {
            const producto = await Product.findByPk(item.productoId);
            if (!producto || !producto.disponible) {
                continue;
            }

            // Validar stock
            if (producto.controlarStock && producto.stock < item.cantidad) {
                return res.status(400).json({
                    error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`
                });
            }

            // Descontar stock
            if (producto.controlarStock) {
                await producto.update({ stock: producto.stock - item.cantidad });
            }

            const itemSubtotal = producto.precio * item.cantidad;
            subtotalAdicional += itemSubtotal;

            await OrderItem.create({
                ordenId: orden.id,
                productoId: producto.id,
                cantidad: item.cantidad,
                precioUnitario: producto.precio,
                subtotal: itemSubtotal,
                notas: item.notas
            });
        }

        // Actualizar totales
        const nuevoSubtotal = parseFloat(orden.subtotal) + subtotalAdicional;
        const montoServicio = (nuevoSubtotal * orden.porcentajeServicio) / 100;
        const total = nuevoSubtotal + montoServicio;

        await orden.update({
            subtotal: nuevoSubtotal,
            montoServicio,
            total
        });

        // Recargar orden
        const ordenActualizada = await Order.findByPk(orden.id, {
            include: [
                { model: Table, as: 'mesa' },
                { model: User, as: 'mesero', attributes: ['id', 'nombre'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'producto' }]
                }
            ]
        });

        io.to(`table-${orden.mesaId}`).emit('orden-actualizada', ordenActualizada);

        res.json({
            mensaje: 'Items agregados exitosamente',
            orden: ordenActualizada
        });
    } catch (error) {
        next(error);
    }
});

// Enviar items a cocina
router.post('/:id/enviar-cocina', authenticate, authorize('mesero', 'cajero', 'admin'), async (req, res, next) => {
    try {
        const orden = await Order.findByPk(req.params.id, {
            include: [{
                model: OrderItem,
                as: 'items',
                where: { estado: 'pendiente', impreso: false },
                required: false,
                include: [{ model: Product, as: 'producto' }]
            }]
        });

        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        if (!orden.items || orden.items.length === 0) {
            return res.status(400).json({
                error: 'No hay items pendientes para enviar a cocina'
            });
        }

        // Actualizar items
        for (const item of orden.items) {
            await item.update({
                estado: 'enviado_cocina',
                fechaEnvioCocina: new Date()
            });
        }

        // Actualizar estado de orden
        if (orden.estado === 'abierta') {
            await orden.update({ estado: 'enviada' });
        }

        io.emit('items-cocina', { ordenId: orden.id, items: orden.items });

        res.json({
            mensaje: 'Items enviados a cocina',
            items: orden.items
        });
    } catch (error) {
        next(error);
    }
});

// Transferir orden a otra mesa
router.post('/:id/transferir', authenticate, authorize('mesero', 'cajero', 'admin'), async (req, res, next) => {
    try {
        const { nuevaMesaId } = req.body;

        if (!nuevaMesaId) {
            return res.status(400).json({ error: 'Nueva mesa es requerida' });
        }

        const orden = await Order.findByPk(req.params.id);
        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        const mesaAnterior = await Table.findByPk(orden.mesaId);
        const nuevaMesa = await Table.findByPk(nuevaMesaId);

        if (!nuevaMesa) {
            return res.status(404).json({ error: 'Nueva mesa no encontrada' });
        }

        const mesaAnteriorId = orden.mesaId;

        // Transferir orden
        await orden.update({ mesaId: nuevaMesaId });

        // Actualizar estado de mesas
        await nuevaMesa.update({ estado: 'ocupada' });

        // Verificar si la mesa anterior tiene más órdenes
        const ordenesRestantes = await Order.findAll({
            where: {
                mesaId: mesaAnteriorId,
                estado: ['abierta', 'enviada', 'en_preparacion']
            }
        });

        if (ordenesRestantes.length === 0) {
            await mesaAnterior.update({ estado: 'disponible' });
        }

        io.to(`table-${mesaAnteriorId}`).emit('mesa-liberada');
        io.to(`table-${nuevaMesaId}`).emit('orden-transferida', orden);

        res.json({
            mensaje: 'Orden transferida exitosamente',
            orden
        });
    } catch (error) {
        next(error);
    }
});

// Cancelar item de orden
router.post('/items/:itemId/cancelar', authenticate, authorize('mesero', 'cajero', 'admin'), async (req, res, next) => {
    try {
        const { motivo, notas, cantidad } = req.body;

        if (!motivo) {
            return res.status(400).json({ error: 'Motivo es requerido' });
        }

        const item = await OrderItem.findByPk(req.params.itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item no encontrado' });
        }

        const cantidadCancelar = cantidad || item.cantidad;

        if (cantidadCancelar > item.cantidad) {
            return res.status(400).json({
                error: 'Cantidad a cancelar excede la cantidad del item'
            });
        }

        // Registrar cancelación
        await OrderCancellation.create({
            itemId: item.id,
            usuarioId: req.user.id,
            motivo,
            notas,
            cantidadCancelada: cantidadCancelar
        });

        // Devolver stock si aplica
        const items = Array.isArray(item) ? item : [item]; // Por si acaso manejo múltiple (futuro)

        // Cargar producto para verificar si controla stock
        const producto = await Product.findByPk(item.productoId);

        if (producto && producto.controlarStock) {
            await producto.update({ stock: producto.stock + cantidadCancelar });
        }

        if (cantidadCancelar === item.cantidad) {
            // Cancelar item completo
            await item.update({ estado: 'cancelado' });
        } else {
            // Reducir cantidad
            const nuevaCantidad = item.cantidad - cantidadCancelar;
            const nuevoSubtotal = item.precioUnitario * nuevaCantidad;
            await item.update({
                cantidad: nuevaCantidad,
                subtotal: nuevoSubtotal
            });
        }

        // Recalcular totales de la orden
        const orden = await Order.findByPk(item.ordenId, {
            include: [{
                model: OrderItem,
                as: 'items',
                where: { estado: ['pendiente', 'enviado_cocina', 'en_preparacion', 'listo', 'entregado'] },
                required: false
            }]
        });

        let nuevoSubtotal = 0;
        if (orden.items) {
            nuevoSubtotal = orden.items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
        }

        const montoServicio = (nuevoSubtotal * orden.porcentajeServicio) / 100;
        const total = nuevoSubtotal + montoServicio;

        await orden.update({
            subtotal: nuevoSubtotal,
            montoServicio,
            total
        });

        io.emit('item-cancelado', { itemId: item.id, ordenId: orden.id });

        res.json({
            mensaje: 'Item cancelado exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
