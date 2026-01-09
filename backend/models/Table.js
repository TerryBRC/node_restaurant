import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Table = sequelize.define('Table', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        numero: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: 'Número o nombre de la mesa'
        },
        areaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'areas',
                key: 'id'
            }
        },
        capacidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 4,
            validate: {
                min: 1
            }
        },
        estado: {
            type: DataTypes.ENUM('disponible', 'ocupada', 'reservada'),
            defaultValue: 'disponible'
        },
        activa: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        posicionX: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Posición X para visualización en plano'
        },
        posicionY: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Posición Y para visualización en plano'
        }
    }, {
        tableName: 'mesas',
        indexes: [
            {
                unique: true,
                fields: ['numero', 'areaId']
            }
        ]
    });

    return Table;
};
