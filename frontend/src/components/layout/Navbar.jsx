import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Utensils, Home } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null;

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Home */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary-600 p-2 rounded-lg text-white group-hover:bg-primary-700 transition">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-black text-xl text-gray-900 leading-none">RESTO</span>
                            <span className="font-bold text-primary-600 text-xl leading-none">APP</span>
                        </div>
                    </Link>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                                {user.nombre?.charAt(0) || 'U'}
                            </div>
                            <div className="text-sm">
                                <p className="font-bold text-gray-900 leading-tight">{user.nombre}</p>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{user.rol}</p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Breadcrumb / Page Title (Optional) */}
            <div className="bg-gray-50 border-b border-gray-200 py-2 px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-sm text-gray-500">
                <Link to="/" className="hover:text-primary-600"><Home className="w-4 h-4" /></Link>
                <span>/</span>
                <span className="font-medium text-gray-900 capitalize">{location.pathname.split('/').pop().replace('-', ' ')}</span>
            </div>
        </header>
    );
}
