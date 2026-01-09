import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Utensils } from 'lucide-react';

export default function Login() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login({ usuario, password });

            // Redirigir según rol
            switch (user.rol) {
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'cajero':
                    navigate('/cajero/caja');
                    break;
                case 'mesero':
                    navigate('/mesero/mesas');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo y título */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
                        <Utensils className="w-10 h-10 text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Sistema de Restaurante
                    </h1>
                    <p className="text-primary-100">
                        Ingresa tus credenciales para continuar
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-2">
                                Usuario
                            </label>
                            <input
                                id="usuario"
                                type="text"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                className="input"
                                placeholder="Ingresa tu usuario"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>

                    {/* Información de prueba */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            Usuarios de prueba: admin/admin123, cajero/cajero123, mesero/mesero123
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-primary-100 text-sm mt-6">
                    © 2026 Sistema de Gestión de Restaurante
                </p>
            </div>
        </div>
    );
}
