import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const TableClosure = sequelize.define('TableClosure', {
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
        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        motivo: {
            type: DataTypes.ENUM('cliente_se_fue', 'accidente', 'limpieza', 'mantenimiento', 'otro'),
            allowNull: false,
            defaultValue: 'cliente_se_fue'
        },
        notas: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'cierres_mesa'
    });

    return TableClosure;
};
