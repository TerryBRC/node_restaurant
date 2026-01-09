import express from 'express';
import { Table, Area } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las mesas con sus áreas
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { areaId } = req.query;

        const where = {};
        if (areaId) {
            where.areaId = areaId;
        }

        const mesas = await Table.findAll({
            where,
            include: [{
                model: Area,
                as: 'area',
                attributes: ['id', 'nombre']
            }],
            order: [['areaId', 'ASC'], ['numero', 'ASC']]
        });

        res.json(mesas);
    } catch (error) {
        next(error);
    }
});

// Obtener mesa por ID
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const mesa = await Table.findByPk(req.params.id, {
            include: [{
                model: Area,
                as: 'area'
            }]
        });

        if (!mesa) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        res.json(mesa);
    } catch (error) {
        next(error);
    }
});

// Crear mesa (solo admin)
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { numero, areaId, capacidad, posicionX, posicionY } = req.body;

        if (!numero || !areaId) {
            return res.status(400).json({
                error: 'Número y área son requeridos'
            });
        }

        // Verificar que el área existe
        const area = await Area.findByPk(areaId);
        if (!area) {
            return res.status(404).json({ error: 'Área no encontrada' });
        }

        const nuevaMesa = await Table.create({
            numero,
            areaId,
            capacidad,
            posicionX,
            posicionY
        });

        res.status(201).json({
            mensaje: 'Mesa creada exitosamente',
            mesa: nuevaMesa
        });
    } catch (error) {
        next(error);
    }
});

// Actualizar mesa (solo admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const mesa = await Table.findByPk(req.params.id);

        if (!mesa) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        const { numero, areaId, capacidad, estado, activa, posicionX, posicionY } = req.body;

        // Si se cambia el área, verificar que existe
        if (areaId && areaId !== mesa.areaId) {
            const area = await Area.findByPk(areaId);
            if (!area) {
                return res.status(404).json({ error: 'Área no encontrada' });
            }
        }

        await mesa.update({
            ...(numero && { numero }),
            ...(areaId && { areaId }),
            ...(capacidad && { capacidad }),
            ...(estado && { estado }),
            ...(activa !== undefined && { activa }),
            ...(posicionX !== undefined && { posicionX }),
            ...(posicionY !== undefined && { posicionY })
        });

        res.json({
            mensaje: 'Mesa actualizada exitosamente',
            mesa
        });
    } catch (error) {
        next(error);
    }
});

// Eliminar mesa (solo admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const mesa = await Table.findByPk(req.params.id);

        if (!mesa) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        await mesa.destroy();

        res.json({
            mensaje: 'Mesa eliminada exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
