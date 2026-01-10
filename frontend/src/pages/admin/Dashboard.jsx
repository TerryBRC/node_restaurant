import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Settings, Users, Utensils, LayoutGrid } from 'lucide-react';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
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
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                            <p className="text-sm text-gray-600 mt-1">Bienvenido, {user?.nombre}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            </main>
        </div>
    );
}
