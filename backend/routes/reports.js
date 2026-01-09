import express from 'express';
import { Op } from 'sequelize';
import { CashRegister, Payment, Order, OrderItem, Product, User, Table } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Reporte de ventas por rango de fechas
router.get('/ventas', authenticate, authorize('cajero', 'admin'), async (req, res, next) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({
                error: 'Fecha de inicio y fin son requeridas'
            });
        }

        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);

        // Obtener órdenes pagadas en el rango
        const ordenes = await Order.findAll({
            where: {
                estado: 'pagada',
                fechaCierre: {
                    [Op.between]: [inicio, fin]
                }
            },
            include: [
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
                        as: 'producto',
                        attributes: ['id', 'nombre', 'categoria']
                    }]
                }
            ]
        });

        // Calcular totales
        const totalVentas = ordenes.reduce((sum, o) => sum + parseFloat(o.total), 0);
        const totalSubtotal = ordenes.reduce((sum, o) => sum + parseFloat(o.subtotal), 0);
        const totalServicio = ordenes.reduce((sum, o) => sum + parseFloat(o.montoServicio), 0);

        // Productos más vendidos
        const productosVendidos = {};
        ordenes.forEach(orden => {
            orden.items.forEach(item => {
                if (item.estado !== 'cancelado') {
                    const key = item.productoId;
                    if (!productosVendidos[key]) {
                        productosVendidos[key] = {
                            producto: item.producto.nombre,
                            categoria: item.producto.categoria,
                            cantidad: 0,
                            total: 0
                        };
                    }
                    productosVendidos[key].cantidad += item.cantidad;
                    productosVendidos[key].total += parseFloat(item.subtotal);
                }
            });
        });

        const topProductos = Object.values(productosVendidos)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 10);

        res.json({
            periodo: {
                inicio: fechaInicio,
                fin: fechaFin
            },
            resumen: {
                totalOrdenes: ordenes.length,
                totalVentas,
                totalSubtotal,
                totalServicio
            },
            topProductos,
            ordenes
        });
    } catch (error) {
        next(error);
    }
});

// Reporte de cierre de caja
router.get('/cierre-caja/:cajaId', authenticate, authorize('cajero', 'admin'), async (req, res, next) => {
    try {
        const caja = await CashRegister.findByPk(req.params.cajaId, {
            include: [{
                model: User,
                as: 'cajero',
                attributes: ['id', 'nombre']
            }]
        });

        if (!caja) {
            return res.status(404).json({ error: 'Caja no encontrada' });
        }

        // Obtener pagos de esta caja
        const pagos = await Payment.findAll({
            where: { cajaId: caja.id },
            include: [
                {
                    model: Order,
                    as: 'orden',
                    include: [{
                        model: Table,
                        as: 'mesa',
                        attributes: ['numero']
                    }]
                },
                {
                    model: User,
                    as: 'procesadoPor',
                    attributes: ['nombre']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        // Agrupar por método de pago
        const porMetodo = {
            efectivo: 0,
            tarjeta: 0,
            transferencia: 0,
            otro: 0
        };

        pagos.forEach(pago => {
            porMetodo[pago.metodoPago] = (porMetodo[pago.metodoPago] || 0) + parseFloat(pago.monto);
        });

        res.json({
            caja,
            pagos,
            resumen: {
                montoApertura: caja.montoApertura,
                montoCierre: caja.montoCierre,
                totalEfectivo: caja.totalEfectivo,
                totalTarjeta: caja.totalTarjeta,
                totalVentas: caja.totalVentas,
                diferencia: caja.diferencia,
                porMetodo
            }
        });
    } catch (error) {
        next(error);
    }
});

// Reporte de cierres del día
router.get('/cierres-dia', authenticate, authorize('cajero', 'admin'), async (req, res, next) => {
    try {
        const { fecha } = req.query;

        const fechaBusqueda = fecha ? new Date(fecha) : new Date();
        const inicio = new Date(fechaBusqueda);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(fechaBusqueda);
        fin.setHours(23, 59, 59, 999);

        const cajas = await CashRegister.findAll({
            where: {
                fechaApertura: {
                    [Op.between]: [inicio, fin]
                }
            },
            include: [{
                model: User,
                as: 'cajero',
                attributes: ['id', 'nombre']
            }],
            order: [['fechaApertura', 'ASC']]
        });

        const totalVentasDia = cajas.reduce((sum, c) => sum + parseFloat(c.totalVentas || 0), 0);
        const totalEfectivoDia = cajas.reduce((sum, c) => sum + parseFloat(c.totalEfectivo || 0), 0);
        const totalTarjetaDia = cajas.reduce((sum, c) => sum + parseFloat(c.totalTarjeta || 0), 0);

        res.json({
            fecha: fechaBusqueda.toISOString().split('T')[0],
            cajas,
            resumen: {
                totalCierres: cajas.filter(c => c.estado === 'cerrada').length,
                cajasAbiertas: cajas.filter(c => c.estado === 'abierta').length,
                totalVentasDia,
                totalEfectivoDia,
                totalTarjetaDia
            }
        });
    } catch (error) {
        next(error);
    }
});

// Reporte de meseros
router.get('/meseros', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        const where = {
            estado: 'pagada'
        };

        if (fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            fin.setHours(23, 59, 59, 999);

            where.fechaCierre = {
                [Op.between]: [inicio, fin]
            };
        }

        const ordenes = await Order.findAll({
            where,
            include: [{
                model: User,
                as: 'mesero',
                attributes: ['id', 'nombre']
            }]
        });

        // Agrupar por mesero
        const porMesero = {};
        ordenes.forEach(orden => {
            const meseroId = orden.meseroId;
            if (!porMesero[meseroId]) {
                porMesero[meseroId] = {
                    mesero: orden.mesero.nombre,
                    totalOrdenes: 0,
                    totalVentas: 0
                };
            }
            porMesero[meseroId].totalOrdenes++;
            porMesero[meseroId].totalVentas += parseFloat(orden.total);
        });

        const ranking = Object.values(porMesero)
            .sort((a, b) => b.totalVentas - a.totalVentas);

        res.json({
            periodo: fechaInicio && fechaFin ? { inicio: fechaInicio, fin: fechaFin } : 'Todo el tiempo',
            ranking
        });
    } catch (error) {
        next(error);
    }
});

export default router;
