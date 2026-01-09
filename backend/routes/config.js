import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { RestaurantConfig } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para subida de logo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, svg)'));
        }
    }
});

// Obtener configuración (público para mostrar nombre del restaurante)
router.get('/', async (req, res, next) => {
    try {
        let config = await RestaurantConfig.findOne();

        // Si no existe configuración, crear una por defecto
        if (!config) {
            config = await RestaurantConfig.create({});
        }

        res.json(config);
    } catch (error) {
        next(error);
    }
});

// Actualizar configuración (solo admin)
router.put('/', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { nombreRestaurante, porcentajeServicio, servicioActivo, moneda, timezone } = req.body;

        let config = await RestaurantConfig.findOne();

        if (!config) {
            config = await RestaurantConfig.create({});
        }

        await config.update({
            ...(nombreRestaurante && { nombreRestaurante }),
            ...(porcentajeServicio !== undefined && { porcentajeServicio }),
            ...(servicioActivo !== undefined && { servicioActivo }),
            ...(moneda && { moneda }),
            ...(timezone && { timezone })
        });

        res.json({
            mensaje: 'Configuración actualizada exitosamente',
            config
        });
    } catch (error) {
        next(error);
    }
});

// Subir logo (solo admin)
router.post('/logo', authenticate, authorize('admin'), upload.single('logo'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó archivo' });
        }

        let config = await RestaurantConfig.findOne();

        if (!config) {
            config = await RestaurantConfig.create({});
        }

        const logoPath = `/uploads/${req.file.filename}`;
        await config.update({ logo: logoPath });

        res.json({
            mensaje: 'Logo actualizado exitosamente',
            logo: logoPath
        });
    } catch (error) {
        next(error);
    }
});

export default router;
