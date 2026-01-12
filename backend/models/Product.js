import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        categoria: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Ej: Bebidas, Entradas, Platos Fuertes, Postres'
        },
        imagen: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        disponible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        requierePreparacion: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Si requiere envío a cocina para preparación'
        },
        tiempoPreparacion: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Tiempo estimado en minutos'
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        controlarStock: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Si activado, descuenta stock al vender'
        }
    }, {
        tableName: 'productos'
    });

    return Product;
};
