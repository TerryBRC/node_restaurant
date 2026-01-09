import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const router = express.Router();

// Login
router.post('/login', async (req, res, next) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({
                error: 'Usuario y contraseña son requeridos'
            });
        }

        // Buscar usuario (incluir password para verificación)
        const user = await User.findOne({
            where: { usuario },
            attributes: { include: ['password'] }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        if (!user.activo) {
            return res.status(403).json({
                error: 'Usuario inactivo. Contacte al administrador'
            });
        }

        // Verificar password
        const passwordValido = await user.verificarPassword(password);
        if (!passwordValido) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Generar token
        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Remover password de la respuesta
        const userResponse = user.toJSON();

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: userResponse
        });
    } catch (error) {
        next(error);
    }
});

// Verificar token (para mantener sesión)
router.get('/verify', async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user || !user.activo) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        res.json({
            valido: true,
            usuario: user
        });
    } catch (error) {
        next(error);
    }
});

export default router;
