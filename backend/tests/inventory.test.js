
import request from 'supertest';
import { app } from '../server.js';
import { sequelize, Product, User, Table, Area, CashRegister } from '../models/index.js';
import jwt from 'jsonwebtoken';

describe('Inventory Management', () => {
    let adminToken;
    let waiterToken;
    let tableId;

    beforeAll(async () => {
        // Sincronizar DB en memoria
        await sequelize.sync({ force: true });

        // Crear usuario admin para crear productos
        const admin = await User.create({
            nombre: 'Admin Test',
            usuario: 'admin_test',
            password: 'password123',
            rol: 'admin'
        });

        // Generar token
        adminToken = jwt.sign({ id: admin.id, rol: admin.rol }, process.env.JWT_SECRET || 'secreto_super_seguro', { expiresIn: '1d' });

        // Crear usuario mesero para pedidos
        const waiter = await User.create({
            nombre: 'Waiter Test',
            usuario: 'waiter_test',
            password: 'password123',
            rol: 'mesero'
        });

        waiterToken = jwt.sign({ id: waiter.id, rol: waiter.rol }, process.env.JWT_SECRET || 'secreto_super_seguro', { expiresIn: '1d' });

        // Crear area y mesa
        const area = await Area.create({ nombre: 'Salon' });
        const table = await Table.create({ numero: '1', capacidad: 4, areaId: area.id });
        tableId = table.id;

        // Abrir caja (requerido para crear órdenes)
        await CashRegister.create({
            cajeroId: admin.id,
            montoApertura: 1000,
            estado: 'abierta',
            fechaApertura: new Date()
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should create a product with stock', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                nombre: 'Coca Cola',
                precio: 2.50,
                categoria: 'Bebidas',
                stock: 10,
                controlarStock: true,
                disponible: true
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.producto.stock).toEqual(10);
    });

    it('defuct stock when creating an order', async () => {
        // Encontrar producto
        const product = await Product.findOne({ where: { nombre: 'Coca Cola' } });

        // Crear orden con 2 unidades
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${waiterToken}`)
            .send({
                mesaId: tableId,
                items: [
                    {
                        productoId: product.id,
                        cantidad: 2,
                        precio: product.precio
                    }
                ]
            });

        if (res.statusCode !== 201) {
            console.error('Create Order Error:', res.body);
        }
        expect(res.statusCode).toEqual(201);

        // Verificar stock actualizado en DB
        const updatedProduct = await Product.findByPk(product.id);
        expect(updatedProduct.stock).toEqual(8); // 10 - 2
    });

    it('should prevent order if insufficient stock', async () => {
        const product = await Product.findOne({ where: { nombre: 'Coca Cola' } });
        // Stock actual es 8. Intentar pedir 10.

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${waiterToken}`)
            .send({
                mesaId: tableId,
                items: [
                    {
                        productoId: product.id,
                        cantidad: 10,
                        precio: product.precio
                    }
                ]
            });

        // Esperamos 400 Bad Request o similar (segun implementación)
        expect(res.statusCode).not.toEqual(201);

        // El stock debe seguir en 8
        const unchangedProduct = await Product.findByPk(product.id);
        expect(unchangedProduct.stock).toEqual(8);
    });
});
