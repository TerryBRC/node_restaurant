import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verificar token al cargar
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    const response = await authService.verify();
                    setUser(response.data.usuario);

                    // Conectar socket
                    socketService.connect();
                } catch (err) {
                    console.error('Error verificando token:', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }

            setLoading(false);
        };

        verifyToken();
    }, []);

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authService.login(credentials);
            const { token, usuario } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(usuario));
            setUser(usuario);

            // Conectar socket
            socketService.connect();

            return usuario;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al iniciar sesión';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);

        // Desconectar socket
        socketService.disconnect();
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.rol === 'admin',
        isCajero: user?.rol === 'cajero',
        isMesero: user?.rol === 'mesero',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};
