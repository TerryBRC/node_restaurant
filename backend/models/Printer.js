import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Printer = sequelize.define('Printer', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        tipo: {
            type: DataTypes.ENUM('network', 'usb'),
            defaultValue: 'network'
        },
        interface: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'IP address o puerto USB (ej: 192.168.1.200 o COM3)'
        },
        categorias: {
            type: DataTypes.TEXT, // Almacenaremos JSON string
            allowNull: true,
            comment: 'Array de categorías asignadas (JSON)'
        },
        esTicketera: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Si es true, imprime tickets de cuenta/corte'
        },
        anchoPapel: {
            type: DataTypes.INTEGER,
            defaultValue: 58,
            comment: 'Ancho en mm (58 o 80)'
        }
    }, {
        tableName: 'impresoras'
    });

    return Printer;
};
