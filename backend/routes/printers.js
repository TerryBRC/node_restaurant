import express from 'express';
import { Printer } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las impresoras
router.get('/', authenticate, authorize('admin', 'cajero'), async (req, res, next) => {
    try {
        const printers = await Printer.findAll();
        res.json(printers);
    } catch (error) {
        next(error);
    }
});

// Obtener impresora por ID
router.get('/:id', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const printer = await Printer.findByPk(req.params.id);
        if (!printer) {
            return res.status(404).json({ error: 'Impresora no encontrada' });
        }
        res.json(printer);
    } catch (error) {
        next(error);
    }
});

// Crear impresora
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { nombre, tipo, interface: interface_, categorias, esTicketera, anchoPapel } = req.body;

        const newPrinter = await Printer.create({
            nombre,
            tipo,
            interface: interface_,
            categorias: categorias ? JSON.stringify(categorias) : null,
            esTicketera,
            anchoPapel
        });

        res.status(201).json(newPrinter);
    } catch (error) {
        next(error);
    }
});

// Actualizar impresora
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const printer = await Printer.findByPk(req.params.id);
        if (!printer) {
            return res.status(404).json({ error: 'Impresora no encontrada' });
        }

        const { nombre, tipo, interface: interface_, categorias, esTicketera, anchoPapel } = req.body;

        await printer.update({
            nombre,
            tipo,
            interface: interface_,
            categorias: categorias ? JSON.stringify(categorias) : null,
            esTicketera,
            anchoPapel
        });

        res.json(printer);
    } catch (error) {
        next(error);
    }
});

// Eliminar impresora
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const printer = await Printer.findByPk(req.params.id);
        if (!printer) {
            return res.status(404).json({ error: 'Impresora no encontrada' });
        }

        await printer.destroy();
        res.json({ message: 'Impresora eliminada correctamente' });
    } catch (error) {
        next(error);
    }
});

export default router;
