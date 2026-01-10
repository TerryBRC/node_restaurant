import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, loading } = useAuth();

    // Determinar el título de la página según la ruta
    const getPageTitle = () => {
        const path = location.pathname || '';
        if (path.includes('/admin/dashboard')) return 'Dashboard';
        if (path.includes('/admin/usuarios')) return 'Gestión de Usuarios';
        if (path.includes('/admin/menu')) return 'Administración de Menú';
        if (path.includes('/admin/areas-mesas')) return 'Distribución de Mesas';
        if (path.includes('/admin/configuracion')) return 'Configuración';
        if (path.includes('/mesero/mesas')) return 'Vista de Mesas';
        if (path.includes('/mesero/pedidos')) return 'Gestión de Pedido';
        if (path.includes('/cajero/caja')) return 'Control de Caja';
        if (path.includes('/cajero/pagos')) return 'Cobro de Cuentas';
        if (path.includes('/cajero/reportes')) return 'Reportes';
        return 'RestoApp';
    };

    // Si está cargando el auth inicial, no mostrar nada todavía para evitar flashes
    if (loading && !user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Component */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${user ? 'lg:ml-72' : ''}`}>
                {/* Mobile Header (Solo visible si hay usuario) */}
                {user && (
                    <header className="lg:hidden bg-white border-b border-gray-100 p-4 sticky top-0 z-30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <h1 className="font-black text-lg text-gray-900">{getPageTitle()}</h1>
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <div className="flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
