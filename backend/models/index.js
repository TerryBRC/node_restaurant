import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Sequelize
const isTest = process.env.NODE_ENV === 'test';

export const sequelize = new Sequelize(
    process.env.DB_NAME || 'restaurant_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    isTest ? {
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
    } : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false
        }
    }
);

// Importar modelos
import User from './User.js';
import RestaurantConfig from './RestaurantConfig.js';
import Area from './Area.js';
import Table from './Table.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import CashRegister from './CashRegister.js';
import Payment from './Payment.js';
import TableClosure from './TableClosure.js';
import OrderCancellation from './OrderCancellation.js';
import Printer from './Printer.js';

// Inicializar modelos
const models = {
    User: User(sequelize),
    RestaurantConfig: RestaurantConfig(sequelize),
    Area: Area(sequelize),
    Table: Table(sequelize),
    Product: Product(sequelize),
    Order: Order(sequelize),
    OrderItem: OrderItem(sequelize),
    CashRegister: CashRegister(sequelize),
    Payment: Payment(sequelize),
    TableClosure: TableClosure(sequelize),
    OrderCancellation: OrderCancellation(sequelize),
    Printer: Printer(sequelize)
};

// Definir asociaciones
const {
    User: UserModel,
    RestaurantConfig: RestaurantConfigModel,
    Area: AreaModel,
    Table: TableModel,
    Product: ProductModel,
    Order: OrderModel,
    OrderItem: OrderItemModel,
    CashRegister: CashRegisterModel,
    Payment: PaymentModel,
    TableClosure: TableClosureModel,
    OrderCancellation: OrderCancellationModel
} = models;

// Area - Table
AreaModel.hasMany(TableModel, { foreignKey: 'areaId', as: 'mesas' });
TableModel.belongsTo(AreaModel, { foreignKey: 'areaId', as: 'area' });

// Table - Order
TableModel.hasMany(OrderModel, { foreignKey: 'mesaId', as: 'ordenes' });
OrderModel.belongsTo(TableModel, { foreignKey: 'mesaId', as: 'mesa' });

// User (mesero) - Order
UserModel.hasMany(OrderModel, { foreignKey: 'meseroId', as: 'ordenes' });
OrderModel.belongsTo(UserModel, { foreignKey: 'meseroId', as: 'mesero' });

// Order - OrderItem
OrderModel.hasMany(OrderItemModel, { foreignKey: 'ordenId', as: 'items' });
OrderItemModel.belongsTo(OrderModel, { foreignKey: 'ordenId', as: 'orden' });

// Product - OrderItem
ProductModel.hasMany(OrderItemModel, { foreignKey: 'productoId', as: 'ordenItems' });
OrderItemModel.belongsTo(ProductModel, { foreignKey: 'productoId', as: 'producto' });

// CashRegister - User (cajero)
UserModel.hasMany(CashRegisterModel, { foreignKey: 'cajeroId', as: 'cajas' });
CashRegisterModel.belongsTo(UserModel, { foreignKey: 'cajeroId', as: 'cajero' });

// Order - Payment
OrderModel.hasMany(PaymentModel, { foreignKey: 'ordenId', as: 'pagos' });
PaymentModel.belongsTo(OrderModel, { foreignKey: 'ordenId', as: 'orden' });

// CashRegister - Payment
CashRegisterModel.hasMany(PaymentModel, { foreignKey: 'cajaId', as: 'pagos' });
PaymentModel.belongsTo(CashRegisterModel, { foreignKey: 'cajaId', as: 'caja' });

// User (procesador) - Payment
UserModel.hasMany(PaymentModel, { foreignKey: 'procesadoPorId', as: 'pagos' });
PaymentModel.belongsTo(UserModel, { foreignKey: 'procesadoPorId', as: 'procesadoPor' });

// Table - TableClosure
TableModel.hasMany(TableClosureModel, { foreignKey: 'mesaId', as: 'cierres' });
TableClosureModel.belongsTo(TableModel, { foreignKey: 'mesaId', as: 'mesa' });

// User - TableClosure
UserModel.hasMany(TableClosureModel, { foreignKey: 'usuarioId', as: 'cierresMesa' });
TableClosureModel.belongsTo(UserModel, { foreignKey: 'usuarioId', as: 'usuario' });

// OrderItem - OrderCancellation
OrderItemModel.hasMany(OrderCancellationModel, { foreignKey: 'itemId', as: 'cancelaciones' });
OrderCancellationModel.belongsTo(OrderItemModel, { foreignKey: 'itemId', as: 'item' });

// User - OrderCancellation
UserModel.hasMany(OrderCancellationModel, { foreignKey: 'usuarioId', as: 'cancelaciones' });
OrderCancellationModel.belongsTo(UserModel, { foreignKey: 'usuarioId', as: 'usuario' });

// Exportar modelos y sequelize
export {
    UserModel as User,
    RestaurantConfigModel as RestaurantConfig,
    AreaModel as Area,
    TableModel as Table,
    ProductModel as Product,
    OrderModel as Order,
    OrderItemModel as OrderItem,
    CashRegisterModel as CashRegister,
    PaymentModel as Payment,
    TableClosureModel as TableClosure,
    TableClosureModel as TableClosure,
    OrderCancellationModel as OrderCancellation,
    Printer as PrinterModel
};
