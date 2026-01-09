import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const CashRegister = sequelize.define('CashRegister', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        cajeroId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        estado: {
            type: DataTypes.ENUM('abierta', 'cerrada'),
            defaultValue: 'abierta'
        },
        montoApertura: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            },
            comment: 'Monto inicial en efectivo'
        },
        montoCierre: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Monto final en efectivo al cerrar'
        },
        totalEfectivo: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            comment: 'Total de ventas en efectivo'
        },
        totalTarjeta: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            comment: 'Total de ventas con tarjeta'
        },
        totalVentas: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        diferencia: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Diferencia entre esperado y real al cierre'
        },
        notasApertura: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        notasCierre: {
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
        tableName: 'cajas'
    });

    return CashRegister;
};
