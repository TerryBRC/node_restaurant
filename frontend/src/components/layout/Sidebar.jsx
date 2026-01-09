import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Utensils,
    LayoutGrid,
    Settings,
    Table as TableIcon,
    Calculator,
    BarChart3,
    LogOut,
    Menu,
    X,
    ClipboardList
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
    const { user, logout } = useAuth();

    const adminLinks = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
        { to: '/admin/menu', icon: Utensils, label: 'Menú' },
        { to: '/admin/areas-mesas', icon: LayoutGrid, label: 'Áreas y Mesas' },
        { to: '/admin/configuracion', icon: Settings, label: 'Configuración' },
    ];

    const waiterLinks = [
        { to: '/mesero/mesas', icon: TableIcon, label: 'Vista de Mesas' },
    ];

    const cashierLinks = [
        { to: '/cajero/caja', icon: Calculator, label: 'Caja' },
        { to: '/cajero/pagos', icon: ClipboardList, label: 'Cobros' },
        { to: '/cajero/reportes', icon: BarChart3, label: 'Reportes' },
    ];

    const getLinks = () => {
        if (!user) return [];
        if (user.rol === 'admin') return [...adminLinks, ...waiterLinks, ...cashierLinks];
        if (user.rol === 'mesero') return waiterLinks;
        if (user.rol === 'cajero') return cashierLinks;
        return [];
    };

    const links = getLinks();

    // No renderizar si no hay usuario (el layout se encargará de esto)
    if (!user) return null;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 transform
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
                            <Utensils className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xl font-black text-gray-900 tracking-tighter">RESTO</span>
                            <span className="text-primary-600 font-bold ml-0.5">APP</span>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-gray-50 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all
                                ${isActive
                                    ? 'bg-primary-50 text-primary-600 shadow-sm shadow-primary-100/50'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                            `}
                        >
                            <link.icon className="w-5 h-5" />
                            <span className="text-sm">{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                    <div className="flex items-center gap-3 p-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-black">
                            {user.nombre?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{user.nombre || 'Usuario'}</p>
                            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{user.rol || 'Rol'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all font-display"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
