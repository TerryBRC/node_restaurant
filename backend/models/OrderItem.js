import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const OrderItem = sequelize.define('OrderItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ordenId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ordenes',
                key: 'id'
            }
        },
        productoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'productos',
                key: 'id'
            }
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1
            }
        },
        precioUnitario: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        estado: {
            type: DataTypes.ENUM('pendiente', 'enviado_cocina', 'en_preparacion', 'listo', 'entregado', 'cancelado'),
            defaultValue: 'pendiente'
        },
        notas: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Notas especiales del cliente (sin cebolla, etc.)'
        },
        impreso: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Si ya se imprimió en cocina'
        },
        fechaEnvioCocina: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'orden_items',
        hooks: {
            beforeSave: (item) => {
                item.subtotal = item.cantidad * item.precioUnitario;
            }
        }
    });

    return OrderItem;
};
