import express from 'express';
import { CashRegister, User } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Obtener caja actual (abierta)
router.get('/actual', authenticate, authorize('cajero', 'admin'), async (req, res, next) => {
    try {
        const cajaAbierta = await CashRegister.findOne({
            where: { estado: 'abierta' },
            include: [{
                model: User,
                as: 'cajero',
                attributes: ['id', 'nombre']
            }],
            order: [['createdAt', 'DESC']]
        });

        if (!cajaAbierta) {
            return res.status(404).json({
                error: 'No hay caja abierta',
                requiereApertura: true
            });
        }

        res.json(cajaAbierta);
    } catch (error) {
        next(error);
    }
});

// Obtener historial de cajas
router.get('/historial', authenticate, authorize('cajero', 'admin'), async (req, res, next) => {
    try {
        const { fechaInicio, fechaFin, cajeroId } = req.query;

        const where = {};
        if (cajeroId) where.cajeroId = cajeroId;
        if (fechaInicio && fechaFin) {
            where.fechaApertura = {
                [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
            };
        }

        const cajas = await CashRegister.findAll({
            where,
            include: [{
                model: User,
                as: 'cajero',
                attributes: ['id', 'nombre']
            }],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json(cajas);
    } catch (error) {
        next(error);
    }
});

// Abrir caja
router.post('/abrir', authenticate, authorize('cajero', 'admin'), async (req, res, next) => {
    try {
        const { montoApertura, notasApertura } = req.body;

        if (montoApertura === undefined || montoApertura < 0) {
            return res.status(400).json({
                error: 'Monto de apertura es requerido y debe ser mayor o igual a 0'
            });
        }

        // Verificar que no haya caja abierta
        const cajaAbierta = await CashRegister.findOne({
            where: { estado: 'abierta' }
        });

        if (cajaAbierta) {
            return res.status(400).json({
                error: 'Ya existe una caja abierta. Debe cerrarla antes de abrir una nueva'
            });
        }

        const nuevaCaja = await CashRegister.create({
            cajeroId: req.user.id,
            montoApertura,
            notasApertura,
            fechaApertura: new Date()
        });

        const cajaCompleta = await CashRegister.findByPk(nuevaCaja.id, {
            include: [{
                model: User,
                as: 'cajero',
                attributes: ['id', 'nombre']
            }]
        });

        res.status(201).json({
            mensaje: 'Caja abierta exitosamente',
            caja: cajaCompleta
        });
    } catch (error) {
        next(error);
    }
});

// Cerrar caja
router.post('/cerrar', authenticate, authorize('cajero', 'admin'), async (req, res, next) => {
    try {
        const { montoCierre, notasCierre } = req.body;

        if (montoCierre === undefined || montoCierre < 0) {
            return res.status(400).json({
                error: 'Monto de cierre es requerido y debe ser mayor o igual a 0'
            });
        }

        // Buscar caja abierta
        const caja = await CashRegister.findOne({
            where: { estado: 'abierta' },
            order: [['createdAt', 'DESC']]
        });

        if (!caja) {
            return res.status(404).json({
                error: 'No hay caja abierta para cerrar'
            });
        }

        // Calcular diferencia
        const esperado = parseFloat(caja.montoApertura) + parseFloat(caja.totalEfectivo);
        const diferencia = montoCierre - esperado;

        await caja.update({
            estado: 'cerrada',
            montoCierre,
            diferencia,
            notasCierre,
            fechaCierre: new Date()
        });

        res.json({
            mensaje: 'Caja cerrada exitosamente',
            caja,
            resumen: {
                montoApertura: caja.montoApertura,
                totalEfectivo: caja.totalEfectivo,
                totalTarjeta: caja.totalTarjeta,
                totalVentas: caja.totalVentas,
                esperado,
                montoCierre,
                diferencia
            }
        });
    } catch (error) {
        next(error);
    }
});

// Obtener caja por ID
router.get('/:id', authenticate, authorize('cajero', 'admin'), async (req, res, next) => {
    try {
        const caja = await CashRegister.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'cajero',
                attributes: ['id', 'nombre']
            }]
        });

        if (!caja) {
            return res.status(404).json({ error: 'Caja no encontrada' });
        }

        res.json(caja);
    } catch (error) {
        next(error);
    }
});

export default router;
