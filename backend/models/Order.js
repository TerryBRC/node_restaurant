import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mesaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'mesas',
                key: 'id'
            }
        },
        meseroId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        numeroOrden: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'Número único de orden generado automáticamente'
        },
        subOrden: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            comment: 'Para dividir cuenta en la misma mesa'
        },
        estado: {
            type: DataTypes.ENUM('abierta', 'enviada', 'en_preparacion', 'lista', 'entregada', 'pagada', 'cancelada'),
            defaultValue: 'abierta'
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        porcentajeServicio: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00
        },
        montoServicio: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        notas: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        fechaApertura: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        fechaCierre: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'ordenes',
        hooks: {
            beforeCreate: async (order) => {
                // Generar número de orden único
                if (!order.numeroOrden) {
                    const timestamp = Date.now();
                    const random = Math.floor(Math.random() * 1000);
                    order.numeroOrden = `ORD-${timestamp}-${random}`;
                }
            }
        }
    });

    return Order;
};
