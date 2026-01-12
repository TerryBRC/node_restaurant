import express from 'express';
import { Product } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los productos
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { categoria, disponible } = req.query;

        const where = {};
        if (categoria) {
            where.categoria = categoria;
        }
        if (disponible !== undefined) {
            where.disponible = disponible === 'true';
        }

        const productos = await Product.findAll({
            where,
            order: [['categoria', 'ASC'], ['nombre', 'ASC']]
        });

        res.json(productos);
    } catch (error) {
        next(error);
    }
});

// Obtener categorías únicas
router.get('/categorias', authenticate, async (req, res, next) => {
    try {
        const productos = await Product.findAll({
            attributes: ['categoria'],
            group: ['categoria'],
            raw: true
        });

        const categorias = productos
            .map(p => p.categoria)
            .filter(c => c !== null);

        res.json(categorias);
    } catch (error) {
        next(error);
    }
});

// Obtener producto por ID
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const producto = await Product.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(producto);
    } catch (error) {
        next(error);
    }
});

// Crear producto (solo admin)
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { nombre, descripcion, precio, categoria, requierePreparacion, tiempoPreparacion, stock, controlarStock } = req.body;

        if (!nombre || !precio) {
            return res.status(400).json({
                error: 'Nombre y precio son requeridos'
            });
        }

        const nuevoProducto = await Product.create({
            nombre,
            descripcion,
            precio,
            categoria,
            requierePreparacion,
            tiempoPreparacion,
            stock: stock || 0,
            controlarStock: controlarStock !== undefined ? controlarStock : true
        });

        res.status(201).json({
            mensaje: 'Producto creado exitosamente',
            producto: nuevoProducto
        });
    } catch (error) {
        next(error);
    }
});

// Actualizar producto (solo admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const producto = await Product.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const { nombre, descripcion, precio, categoria, disponible, requierePreparacion, tiempoPreparacion, stock, controlarStock } = req.body;

        await producto.update({
            ...(nombre && { nombre }),
            ...(descripcion !== undefined && { descripcion }),
            ...(precio !== undefined && { precio }),
            ...(categoria !== undefined && { categoria }),
            ...(disponible !== undefined && { disponible }),
            ...(requierePreparacion !== undefined && { requierePreparacion }),
            ...(tiempoPreparacion !== undefined && { tiempoPreparacion }),
            ...(stock !== undefined && { stock }),
            ...(controlarStock !== undefined && { controlarStock })
        });

        res.json({
            mensaje: 'Producto actualizado exitosamente',
            producto
        });
    } catch (error) {
        next(error);
    }
});

// Eliminar producto (solo admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const producto = await Product.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await producto.destroy();

        res.json({
            mensaje: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
