import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Payment = sequelize.define('Payment', {
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
        cajaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'cajas',
                key: 'id'
            }
        },
        procesadoPorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            },
            comment: 'Usuario (cajero) que procesó el pago'
        },
        monto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0.01
            }
        },
        metodoPago: {
            type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'otro'),
            allowNull: false,
            defaultValue: 'efectivo'
        },
        referencia: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Número de referencia para tarjeta/transferencia'
        },
        notas: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        esParcial: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Si es pago parcial de la cuenta'
        }
    }, {
        tableName: 'pagos'
    });

    return Payment;
};
