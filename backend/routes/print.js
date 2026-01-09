import express from 'express';
import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { Order, OrderItem, Product, Table, RestaurantConfig } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configurar impresora
const getPrinter = () => {
    const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: process.env.PRINTER_INTERFACE === 'usb'
            ? `usb://${process.env.PRINTER_VENDOR_ID}:${process.env.PRINTER_PRODUCT_ID}`
            : `tcp://${process.env.PRINTER_IP}:${process.env.PRINTER_PORT}`,
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
        lineCharacter: '-',
        options: {
            timeout: 5000
        }
    });

    return printer;
};

// Imprimir orden para cocina
router.post('/cocina/:ordenId', authenticate, authorize('mesero', 'cajero', 'admin'), async (req, res, next) => {
    try {
        const orden = await Order.findByPk(req.params.ordenId, {
            include: [
                {
                    model: Table,
                    as: 'mesa',
                    include: [{ model: Area, as: 'area' }]
                },
                {
                    model: OrderItem,
                    as: 'items',
                    where: {
                        estado: 'enviado_cocina',
                        impreso: false
                    },
                    required: false,
                    include: [{
                        model: Product,
                        as: 'producto'
                    }]
                }
            ]
        });

        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        if (!orden.items || orden.items.length === 0) {
            return res.status(400).json({
                error: 'No hay items para imprimir'
            });
        }

        const config = await RestaurantConfig.findOne();
        const printer = getPrinter();

        // Encabezado
        printer.alignCenter();
        printer.bold(true);
        printer.println(config?.nombreRestaurante || 'RESTAURANTE');
        printer.bold(false);
        printer.println('ORDEN DE COCINA');
        printer.drawLine();

        // Información de la orden
        printer.alignLeft();
        printer.println(`Mesa: ${orden.mesa.numero} (${orden.mesa.area?.nombre || 'N/A'})`);
        printer.println(`Orden: ${orden.numeroOrden}`);
        if (orden.subOrden > 1) {
            printer.println(`Sub-orden: ${orden.subOrden}`);
        }
        printer.println(`Fecha: ${new Date().toLocaleString('es-MX')}`);
        printer.drawLine();

        // Items
        printer.bold(true);
        printer.println('ITEMS:');
        printer.bold(false);

        orden.items.forEach(item => {
            printer.println(`${item.cantidad}x ${item.producto.nombre}`);
            if (item.notas) {
                printer.println(`   Nota: ${item.notas}`);
            }
        });

        printer.drawLine();
        printer.alignCenter();
        printer.println('*** FIN DE ORDEN ***');
        printer.cut();

        // Ejecutar impresión
        await printer.execute();

        // Marcar items como impresos
        for (const item of orden.items) {
            await item.update({ impreso: true });
        }

        res.json({
            mensaje: 'Orden impresa exitosamente',
            itemsImpresos: orden.items.length
        });
    } catch (error) {
        console.error('Error al imprimir:', error);

        // Si falla la impresión, devolver error pero no marcar como impreso
        res.status(500).json({
            error: 'Error al imprimir. Verifique la conexión de la impresora',
            detalles: error.message
        });
    }
});

// Imprimir ticket de pago
router.post('/ticket/:ordenId', authenticate, authorize('cajero', 'admin'), async (req, res, next) => {
    try {
        const orden = await Order.findByPk(req.params.ordenId, {
            include: [
                {
                    model: Table,
                    as: 'mesa'
                },
                {
                    model: OrderItem,
                    as: 'items',
                    where: { estado: ['enviado_cocina', 'en_preparacion', 'listo', 'entregado'] },
                    required: false,
                    include: [{
                        model: Product,
                        as: 'producto'
                    }]
                },
                {
                    model: User,
                    as: 'mesero',
                    attributes: ['nombre']
                }
            ]
        });

        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        const config = await RestaurantConfig.findOne();
        const printer = getPrinter();

        // Encabezado
        printer.alignCenter();
        printer.bold(true);
        printer.setTextSize(1, 1);
        printer.println(config?.nombreRestaurante || 'RESTAURANTE');
        printer.setTextNormal();
        printer.bold(false);
        printer.println('TICKET DE CONSUMO');
        printer.drawLine();

        // Información
        printer.alignLeft();
        printer.println(`Mesa: ${orden.mesa.numero}`);
        printer.println(`Mesero: ${orden.mesero.nombre}`);
        printer.println(`Orden: ${orden.numeroOrden}`);
        printer.println(`Fecha: ${new Date().toLocaleString('es-MX')}`);
        printer.drawLine();

        // Items
        printer.tableCustom([
            { text: 'Cant', align: 'LEFT', width: 0.15 },
            { text: 'Producto', align: 'LEFT', width: 0.55 },
            { text: 'Total', align: 'RIGHT', width: 0.30 }
        ]);
        printer.drawLine();

        orden.items.forEach(item => {
            if (item.estado !== 'cancelado') {
                printer.tableCustom([
                    { text: item.cantidad.toString(), align: 'LEFT', width: 0.15 },
                    { text: item.producto.nombre, align: 'LEFT', width: 0.55 },
                    { text: `$${parseFloat(item.subtotal).toFixed(2)}`, align: 'RIGHT', width: 0.30 }
                ]);
            }
        });

        printer.drawLine();

        // Totales
        printer.alignRight();
        printer.println(`Subtotal: $${parseFloat(orden.subtotal).toFixed(2)}`);

        if (parseFloat(orden.montoServicio) > 0) {
            printer.println(`Servicio (${orden.porcentajeServicio}%): $${parseFloat(orden.montoServicio).toFixed(2)}`);
        }

        printer.bold(true);
        printer.setTextSize(1, 1);
        printer.println(`TOTAL: $${parseFloat(orden.total).toFixed(2)}`);
        printer.setTextNormal();
        printer.bold(false);

        printer.drawLine();
        printer.alignCenter();
        printer.println('¡Gracias por su preferencia!');
        printer.cut();

        await printer.execute();

        res.json({
            mensaje: 'Ticket impreso exitosamente'
        });
    } catch (error) {
        console.error('Error al imprimir:', error);
        res.status(500).json({
            error: 'Error al imprimir. Verifique la conexión de la impresora',
            detalles: error.message
        });
    }
});

// Imprimir cancelación
router.post('/cancelacion', authenticate, authorize('mesero', 'cajero', 'admin'), async (req, res, next) => {
    try {
        const { itemId, motivo, cantidad } = req.body;

        const item = await OrderItem.findByPk(itemId, {
            include: [
                {
                    model: Product,
                    as: 'producto'
                },
                {
                    model: Order,
                    as: 'orden',
                    include: [{
                        model: Table,
                        as: 'mesa'
                    }]
                }
            ]
        });

        if (!item) {
            return res.status(404).json({ error: 'Item no encontrado' });
        }

        const config = await RestaurantConfig.findOne();
        const printer = getPrinter();

        printer.alignCenter();
        printer.bold(true);
        printer.println(config?.nombreRestaurante || 'RESTAURANTE');
        printer.bold(false);
        printer.println('CANCELACIÓN');
        printer.drawLine();

        printer.alignLeft();
        printer.println(`Mesa: ${item.orden.mesa.numero}`);
        printer.println(`Orden: ${item.orden.numeroOrden}`);
        printer.println(`Fecha: ${new Date().toLocaleString('es-MX')}`);
        printer.drawLine();

        printer.bold(true);
        printer.println('ITEM CANCELADO:');
        printer.bold(false);
        printer.println(`${cantidad || item.cantidad}x ${item.producto.nombre}`);
        printer.println(`Motivo: ${motivo}`);

        printer.drawLine();
        printer.alignCenter();
        printer.println('*** CANCELACIÓN ***');
        printer.cut();

        await printer.execute();

        res.json({
            mensaje: 'Cancelación impresa exitosamente'
        });
    } catch (error) {
        console.error('Error al imprimir:', error);
        res.status(500).json({
            error: 'Error al imprimir. Verifique la conexión de la impresora',
            detalles: error.message
        });
    }
});

export default router;
