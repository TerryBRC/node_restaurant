import express from 'express';
import { Payment, Order, CashRegister, Table, TableClosure } from '../models/index.js';
import { authenticate, authorize, requireOpenCashRegister } from '../middleware/auth.js';
import { io } from '../server.js';

const router = express.Router();

// Procesar pago
router.post('/', authenticate, authorize('cajero', 'admin'), requireOpenCashRegister, async (req, res, next) => {
    try {
        const { ordenId, monto, metodoPago, referencia, notas, esParcial } = req.body;

        if (!ordenId || !monto || !metodoPago) {
            return res.status(400).json({
                error: 'Orden, monto y método de pago son requeridos'
            });
        }

        if (monto <= 0) {
            return res.status(400).json({
                error: 'El monto debe ser mayor a 0'
            });
        }

        // Verificar orden
        const orden = await Order.findByPk(ordenId);
        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        if (orden.estado === 'pagada') {
            return res.status(400).json({
                error: 'Esta orden ya está pagada'
            });
        }

        if (orden.estado === 'cancelada') {
            return res.status(400).json({
                error: 'No se puede pagar una orden cancelada'
            });
        }

        // Calcular total pagado hasta ahora
        const pagosAnteriores = await Payment.findAll({
            where: { ordenId }
        });

        const totalPagado = pagosAnteriores.reduce((sum, p) => sum + parseFloat(p.monto), 0);
        const pendiente = parseFloat(orden.total) - totalPagado;

        if (monto > pendiente) {
            return res.status(400).json({
                error: `El monto excede el pendiente. Pendiente: $${pendiente.toFixed(2)}`
            });
        }

        // Crear pago
        const nuevoPago = await Payment.create({
            ordenId,
            cajaId: req.cashRegister.id,
            procesadoPorId: req.user.id,
            monto,
            metodoPago,
            referencia,
            notas,
            esParcial: esParcial || monto < pendiente
        });

        // Actualizar totales de caja
        const caja = req.cashRegister;
        const nuevoTotalVentas = parseFloat(caja.totalVentas) + monto;

        let updateData = {
            totalVentas: nuevoTotalVentas
        };

        if (metodoPago === 'efectivo') {
            updateData.totalEfectivo = parseFloat(caja.totalEfectivo) + monto;
        } else if (metodoPago === 'tarjeta') {
            updateData.totalTarjeta = parseFloat(caja.totalTarjeta) + monto;
        }

        await caja.update(updateData);

        // Verificar si la orden está completamente pagada
        const nuevoTotalPagado = totalPagado + monto;
        if (nuevoTotalPagado >= parseFloat(orden.total)) {
            await orden.update({
                estado: 'pagada',
                fechaCierre: new Date()
            });

            // Verificar si se debe liberar la mesa
            const ordenesActivas = await Order.findAll({
                where: {
                    mesaId: orden.mesaId,
                    estado: ['abierta', 'enviada', 'en_preparacion']
                }
            });

            if (ordenesActivas.length === 0) {
                const mesa = await Table.findByPk(orden.mesaId);
                await mesa.update({ estado: 'disponible' });

                io.to(`table-${orden.mesaId}`).emit('mesa-liberada');
            }
        }

        io.emit('pago-procesado', { ordenId, pago: nuevoPago });

        res.status(201).json({
            mensaje: 'Pago procesado exitosamente',
            pago: nuevoPago,
            totalPagado: nuevoTotalPagado,
            pendiente: parseFloat(orden.total) - nuevoTotalPagado,
            ordenPagada: nuevoTotalPagado >= parseFloat(orden.total)
        });
    } catch (error) {
        next(error);
    }
});

// Cerrar mesa (liberar sin orden activa)
router.post('/cerrar-mesa', authenticate, authorize('mesero', 'cajero', 'admin'), async (req, res, next) => {
    try {
        const { mesaId, motivo, notas } = req.body;

        if (!mesaId || !motivo) {
            return res.status(400).json({
                error: 'Mesa y motivo son requeridos'
            });
        }

        const mesa = await Table.findByPk(mesaId);
        if (!mesa) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        // Verificar que no haya órdenes activas
        const ordenesActivas = await Order.findAll({
            where: {
                mesaId,
                estado: ['abierta', 'enviada', 'en_preparacion']
            }
        });

        if (ordenesActivas.length > 0) {
            return res.status(400).json({
                error: 'No se puede cerrar la mesa. Hay órdenes activas'
            });
        }

        // Registrar cierre
        await TableClosure.create({
            mesaId,
            usuarioId: req.user.id,
            motivo,
            notas
        });

        // Liberar mesa
        await mesa.update({ estado: 'disponible' });

        io.to(`table-${mesaId}`).emit('mesa-cerrada', { motivo, notas });

        res.json({
            mensaje: 'Mesa cerrada exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

// Obtener pagos de una orden
router.get('/orden/:ordenId', authenticate, async (req, res, next) => {
    try {
        const pagos = await Payment.findAll({
            where: { ordenId: req.params.ordenId },
            order: [['createdAt', 'ASC']]
        });

        const totalPagado = pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);

        res.json({
            pagos,
            totalPagado
        });
    } catch (error) {
        next(error);
    }
});

export default router;
