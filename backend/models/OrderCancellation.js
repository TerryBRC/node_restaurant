import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const OrderCancellation = sequelize.define('OrderCancellation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        itemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'orden_items',
                key: 'id'
            }
        },
        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        motivo: {
            type: DataTypes.ENUM(
                'cliente_cancelo',
                'producto_no_disponible',
                'error_orden',
                'demora_excesiva',
                'otro'
            ),
            allowNull: false
        },
        notas: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        cantidadCancelada: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        tableName: 'cancelaciones_orden'
    });

    return OrderCancellation;
};
