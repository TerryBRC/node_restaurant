import { sequelize } from './models/index.js';

async function inspect() {
    try {
        const table = await sequelize.getQueryInterface().describeTable('productos');
        console.log('PRODUCTOS TABLE SCHEMA:', JSON.stringify(table, null, 2));
    } catch (error) {
        console.error('ERROR INSPECTING TABLE:', error);
    } finally {
        await sequelize.close();
    }
}

inspect();
