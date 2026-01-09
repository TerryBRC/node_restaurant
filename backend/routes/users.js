import express from 'express';
import { User } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticate);
router.use(authorize('admin'));

// Obtener todos los usuarios
router.get('/', async (req, res, next) => {
    try {
        const usuarios = await User.findAll({
            order: [['nombre', 'ASC']]
        });

        res.json(usuarios);
    } catch (error) {
        next(error);
    }
});

// Obtener usuario por ID
router.get('/:id', async (req, res, next) => {
    try {
        const usuario = await User.findByPk(req.params.id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        next(error);
    }
});

// Crear usuario
router.post('/', async (req, res, next) => {
    try {
        const { nombre, usuario, password, rol } = req.body;

        if (!nombre || !usuario || !password || !rol) {
            return res.status(400).json({
                error: 'Todos los campos son requeridos'
            });
        }

        if (!['admin', 'cajero', 'mesero'].includes(rol)) {
            return res.status(400).json({
                error: 'Rol inválido. Debe ser: admin, cajero o mesero'
            });
        }

        const nuevoUsuario = await User.create({
            nombre,
            usuario,
            password,
            rol
        });

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: nuevoUsuario
        });
    } catch (error) {
        next(error);
    }
});

// Actualizar usuario
router.put('/:id', async (req, res, next) => {
    try {
        const usuario = await User.findByPk(req.params.id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { nombre, usuario: nombreUsuario, password, rol, activo } = req.body;

        if (rol && !['admin', 'cajero', 'mesero'].includes(rol)) {
            return res.status(400).json({
                error: 'Rol inválido. Debe ser: admin, cajero o mesero'
            });
        }

        await usuario.update({
            ...(nombre && { nombre }),
            ...(nombreUsuario && { usuario: nombreUsuario }),
            ...(password && { password }),
            ...(rol && { rol }),
            ...(activo !== undefined && { activo })
        });

        res.json({
            mensaje: 'Usuario actualizado exitosamente',
            usuario
        });
    } catch (error) {
        next(error);
    }
});

// Eliminar usuario (desactivar)
router.delete('/:id', async (req, res, next) => {
    try {
        const usuario = await User.findByPk(req.params.id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // No permitir eliminar el propio usuario
        if (usuario.id === req.user.id) {
            return res.status(400).json({
                error: 'No puedes desactivar tu propio usuario'
            });
        }

        await usuario.update({ activo: false });

        res.json({
            mensaje: 'Usuario desactivado exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
