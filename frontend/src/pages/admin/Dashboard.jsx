import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Settings, Users, Utensils, LayoutGrid, Printer, Table, Calculator, BarChart3, Flame, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        {
            title: 'Configuración del Restaurante',
            description: 'Nombre, logo, porcentaje de servicio',
            icon: Settings,
            path: '/admin/configuracion',
            color: 'bg-blue-500'
        },
        {
            title: 'Gestión de Usuarios',
            description: 'Administradores, cajeros y meseros',
            icon: Users,
            path: '/admin/usuarios',
            color: 'bg-green-500'
        },
        {
            title: 'Menú y Productos',
            description: 'Gestionar productos y categorías',
            icon: Utensils,
            path: '/admin/menu',
            color: 'bg-orange-500'
        },
        {
            title: 'Áreas y Mesas',
            description: 'Configurar áreas y mesas del restaurante',
            icon: LayoutGrid,
            path: '/admin/areas-mesas',
            color: 'bg-purple-500'
        },
        {
            title: 'Gestión de Impresoras',
            description: 'Configurar impresoras y ruteo',
            icon: Printer,
            path: '/admin/impresoras',
            color: 'bg-indigo-500'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="card card-hover text-left p-6 transition-all duration-200 hover:scale-105"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`${item.color} p-3 rounded-lg`}>
                                    {Icon && <Icon className="w-6 h-6 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Módulos Operativos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button onClick={() => navigate('/mesero/mesas')} className="card card-hover text-left p-6 hover:scale-105 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-teal-500 p-3 rounded-lg"><Table className="w-6 h-6 text-white" /></div>
                        <div><h3 className="font-bold text-gray-900">Vista de Mesas</h3><p className="text-sm text-gray-500">Gestión de mesas y pedidos</p></div>
                    </div>
                </button>
                <button onClick={() => navigate('/cajero/caja')} className="card card-hover text-left p-6 hover:scale-105 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-pink-500 p-3 rounded-lg"><Calculator className="w-6 h-6 text-white" /></div>
                        <div><h3 className="font-bold text-gray-900">Caja Registradora</h3><p className="text-sm text-gray-500">Control de caja y movimientos</p></div>
                    </div>
                </button>
                <button onClick={() => navigate('/cajero/pagos')} className="card card-hover text-left p-6 hover:scale-105 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-500 p-3 rounded-lg"><ClipboardList className="w-6 h-6 text-white" /></div>
                        <div><h3 className="font-bold text-gray-900">Cobros y Pagos</h3><p className="text-sm text-gray-500">Procesar pagos de órdenes</p></div>
                    </div>
                </button>
                <button onClick={() => navigate('/cajero/reportes')} className="card card-hover text-left p-6 hover:scale-105 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-500 p-3 rounded-lg"><BarChart3 className="w-6 h-6 text-white" /></div>
                        <div><h3 className="font-bold text-gray-900">Reportes</h3><p className="text-sm text-gray-500">Ventas y estadísticas</p></div>
                    </div>
                </button>
                <button onClick={() => navigate('/cocina')} className="card card-hover text-left p-6 hover:scale-105 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-500 p-3 rounded-lg"><Flame className="w-6 h-6 text-white" /></div>
                        <div><h3 className="font-bold text-gray-900">Cocina (KDS)</h3><p className="text-sm text-gray-500">Pantalla de comandas</p></div>
                    </div>
                </button>
            </div>

            {/* Info Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <h4 className="text-sm font-medium opacity-90">Sistema</h4>
                    <p className="text-2xl font-bold mt-2">Activo</p>
                    <p className="text-sm opacity-75 mt-1">Funcionando correctamente</p>
                </div>

                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <h4 className="text-sm font-medium opacity-90">Rol</h4>
                    <p className="text-2xl font-bold mt-2">Administrador</p>
                    <p className="text-sm opacity-75 mt-1">Acceso completo</p>
                </div>

                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <h4 className="text-sm font-medium opacity-90">Usuario</h4>
                    <p className="text-2xl font-bold mt-2">{user?.usuario}</p>
                    <p className="text-sm opacity-75 mt-1">{user?.nombre}</p>
                </div>
            </div>
        </div>
    );
}
