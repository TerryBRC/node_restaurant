import { sequelize, User } from '../models/index.js';

/**
 * Script para crear usuarios de prueba en la base de datos
 * Ejecutar con: npm run seed:users
 */

async function seedUsers() {
    try {
        console.log('🔄 Conectando a la base de datos...');

        // Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión establecida correctamente');

        // Sincronizar modelos (crear tablas si no existen)
        await sequelize.sync();
        console.log('✅ Modelos sincronizados');

        console.log('\n🌱 Creando usuarios de prueba...\n');

        // Verificar si ya existen usuarios
        const existingUsers = await User.count();
        if (existingUsers > 0) {
            console.log('⚠️  Ya existen usuarios en la base de datos.');
            console.log('   ¿Desea continuar y crear usuarios adicionales? (Ctrl+C para cancelar)');
            // Esperar 3 segundos antes de continuar
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Crear usuario administrador
        const admin = await User.create({
            nombre: 'Administrador',
            usuario: 'admin',
            password: 'admin123',
            rol: 'admin',
            activo: true
        });
        console.log('✅ Usuario creado:', {
            id: admin.id,
            nombre: admin.nombre,
            usuario: admin.usuario,
            rol: admin.rol
        });

        // Crear usuario cajero
        const cajero = await User.create({
            nombre: 'Cajero Principal',
            usuario: 'cajero',
            password: 'cajero123',
            rol: 'cajero',
            activo: true
        });
        console.log('✅ Usuario creado:', {
            id: cajero.id,
            nombre: cajero.nombre,
            usuario: cajero.usuario,
            rol: cajero.rol
        });

        // Crear usuario mesero
        const mesero = await User.create({
            nombre: 'Mesero 1',
            usuario: 'mesero',
            password: 'mesero123',
            rol: 'mesero',
            activo: true
        });
        console.log('✅ Usuario creado:', {
            id: mesero.id,
            nombre: mesero.nombre,
            usuario: mesero.usuario,
            rol: mesero.rol
        });

        console.log('\n🎉 ¡Usuarios de prueba creados exitosamente!\n');
        console.log('📋 Credenciales de acceso:');
        console.log('   Admin    - Usuario: admin   | Password: admin123');
        console.log('   Cajero   - Usuario: cajero  | Password: cajero123');
        console.log('   Mesero   - Usuario: mesero  | Password: mesero123\n');

    } catch (error) {
        console.error('❌ Error al crear usuarios:', error.message);
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error('   Uno o más usuarios ya existen en la base de datos.');
        }
        process.exit(1);
    } finally {
        // Cerrar conexión
        await sequelize.close();
        console.log('🔌 Conexión cerrada');
        process.exit(0);
    }
}

// Ejecutar el script
seedUsers();
