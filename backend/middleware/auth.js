import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Middleware de autenticación
export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        if (!user.activo) {
            return res.status(403).json({ error: 'Usuario inactivo' });
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware de autorización por rol
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                error: 'No tienes permisos para realizar esta acción'
            });
        }

        next();
    };
};

// Verificar si hay caja abierta (para meseros y cajeros)
export const requireOpenCashRegister = async (req, res, next) => {
    try {
        const { CashRegister } = await import('../models/index.js');

        const openRegister = await CashRegister.findOne({
            where: {
                estado: 'abierta'
            },
            order: [['createdAt', 'DESC']]
        });

        if (!openRegister) {
            return res.status(400).json({
                error: 'Debe abrir una caja antes de realizar esta operación'
            });
        }

        req.cashRegister = openRegister;
        next();
    } catch (error) {
        next(error);
    }
};
