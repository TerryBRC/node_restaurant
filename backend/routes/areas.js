import express from 'express';
import { Area } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las áreas (requiere autenticación)
router.get('/', authenticate, async (req, res, next) => {
    try {
        const areas = await Area.findAll({
            order: [['orden', 'ASC'], ['nombre', 'ASC']]
        });

        res.json(areas);
    } catch (error) {
        next(error);
    }
});

// Obtener área por ID
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const area = await Area.findByPk(req.params.id);

        if (!area) {
            return res.status(404).json({ error: 'Área no encontrada' });
        }

        res.json(area);
    } catch (error) {
        next(error);
    }
});

// Crear área (solo admin)
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { nombre, descripcion, orden } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const nuevaArea = await Area.create({
            nombre,
            descripcion,
            orden
        });

        res.status(201).json({
            mensaje: 'Área creada exitosamente',
            area: nuevaArea
        });
    } catch (error) {
        next(error);
    }
});

// Actualizar área (solo admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const area = await Area.findByPk(req.params.id);

        if (!area) {
            return res.status(404).json({ error: 'Área no encontrada' });
        }

        const { nombre, descripcion, activa, orden } = req.body;

        await area.update({
            ...(nombre && { nombre }),
            ...(descripcion !== undefined && { descripcion }),
            ...(activa !== undefined && { activa }),
            ...(orden !== undefined && { orden })
        });

        res.json({
            mensaje: 'Área actualizada exitosamente',
            area
        });
    } catch (error) {
        next(error);
    }
});

// Eliminar área (solo admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const area = await Area.findByPk(req.params.id);

        if (!area) {
            return res.status(404).json({ error: 'Área no encontrada' });
        }

        await area.destroy();

        res.json({
            mensaje: 'Área eliminada exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
