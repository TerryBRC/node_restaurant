import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { sequelize } from './models/index.js';
import errorHandler from './middleware/errorHandler.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import configRoutes from './routes/config.js';
import areaRoutes from './routes/areas.js';
import tableRoutes from './routes/tables.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import cashRegisterRoutes from './routes/cashRegister.js';
import paymentRoutes from './routes/payments.js';
import reportRoutes from './routes/reports.js';
import printRoutes from './routes/print.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Hacer io disponible en las rutas
app.set('io', io);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/config', configRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cash-register', cashRegisterRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/print', printRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Manejo de errores
app.use(errorHandler);

// Socket.io eventos
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });

    // Unirse a sala de mesa específica
    socket.on('join-table', (tableId) => {
        socket.join(`table-${tableId}`);
        console.log(`Socket ${socket.id} se unió a table-${tableId}`);
    });

    // Salir de sala de mesa
    socket.on('leave-table', (tableId) => {
        socket.leave(`table-${tableId}`);
        console.log(`Socket ${socket.id} salió de table-${tableId}`);
    });
});

// Exportar io para usar en controladores
export { io };

// Sincronizar base de datos e iniciar servidor
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: false })
    .then(() => {
        console.log('✓ Base de datos conectada y sincronizada');
        httpServer.listen(PORT, () => {
            console.log(`✓ Servidor corriendo en puerto ${PORT}`);
            console.log(`✓ Ambiente: ${process.env.NODE_ENV}`);
        });
    })
    .catch(err => {
        console.error('✗ Error al conectar con la base de datos:', err);
        process.exit(1);
    });
