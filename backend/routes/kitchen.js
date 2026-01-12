import express from 'express';
import { Order, OrderItem, Product, Table, User } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { io } from '../server.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get active kitchen orders
router.get('/pending', authenticate, authorize('admin', 'cocinero', 'mesero'), async (req, res, next) => {
    try {
        const orders = await Order.findAll({
            where: {
                estado: {
                    [Op.in]: ['enviada', 'en_preparacion']
                }
            },
            include: [
                {
                    model: Table,
                    as: 'mesa',
                    attributes: ['numero', 'id']
                },
                {
                    model: User,
                    as: 'mesero',
                    attributes: ['nombre']
                },
                {
                    model: OrderItem,
                    as: 'items',
                    where: {
                        estado: {
                            [Op.in]: ['enviado_cocina', 'en_preparacion']
                        }
                    },
                    required: true, // Only orders with kitchen items
                    include: [{
                        model: Product,
                        as: 'producto',
                        attributes: ['nombre', 'requierePreparacion']
                    }]
                }
            ],
            order: [['updatedAt', 'ASC']] // Oldest first
        });

        res.json(orders);
    } catch (error) {
        next(error);
    }
});

// Update item status
router.post('/items/:id/status', authenticate, authorize('admin', 'cocinero'), async (req, res, next) => {
    try {
        const { estado } = req.body;
        const itemId = req.params.id;

        if (!['en_preparacion', 'listo'].includes(estado)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        const item = await OrderItem.findByPk(itemId, {
            include: [{ model: Order, as: 'orden' }]
        });

        if (!item) {
            return res.status(404).json({ error: 'Item no encontrado' });
        }

        const previousState = item.estado;
        await item.update({ estado });

        // Emit socket event
        io.emit('kitchen-update', {
            itemId: item.id,
            orderId: item.ordenId,
            estado,
            previousState
        });

        // Check if all items in order are ready to potentially update order status
        // logic could be added here, but for now just item update is enough

        res.json(item);
    } catch (error) {
        next(error);
    }
});

export default router;
