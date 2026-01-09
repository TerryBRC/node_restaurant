import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const RestaurantConfig = sequelize.define('RestaurantConfig', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombreRestaurante: {
            type: DataTypes.STRING(200),
            allowNull: false,
            defaultValue: 'Mi Restaurante'
        },
        logo: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Ruta del archivo de logo'
        },
        porcentajeServicio: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 10.00,
            validate: {
                min: 0,
                max: 100
            }
        },
        servicioActivo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Si está activo, se aplicará el porcentaje de servicio'
        },
        moneda: {
            type: DataTypes.STRING(10),
            defaultValue: 'MXN'
        },
        timezone: {
            type: DataTypes.STRING(50),
            defaultValue: 'America/Mexico_City'
        }
    }, {
        tableName: 'configuracion_restaurante'
    });

    return RestaurantConfig;
};
