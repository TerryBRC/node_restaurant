import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Area = sequelize.define('Area', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: 'Ej: Barra, Comedor, Terraza, Salón Principal'
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        activa: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        orden: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Orden de visualización'
        }
    }, {
        tableName: 'areas'
    });

    return Area;
};
