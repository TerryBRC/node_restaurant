import { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import {
    UserPlus,
    Edit2,
    Trash2,
    Check,
    X,
    AlertCircle,
    Search,
    Loader2,
    Lock,
    Unlock
} from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        usuario: '',
        password: '',
        rol: 'mesero'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAll();
            setUsers(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar usuarios. Por favor, intenta de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                nombre: user.nombre,
                usuario: user.usuario,
                password: '', // No mostrar password existente
                rol: user.rol
            });
        } else {
            setCurrentUser(null);
            setFormData({
                nombre: '',
                usuario: '',
                password: '',
                rol: 'mesero'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
        setFormData({
            nombre: '',
            usuario: '',
            password: '',
            rol: 'mesero'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (currentUser) {
                // Si la contraseña está vacía, no la enviamos para no cambiarla
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await userService.update(currentUser.id, updateData);
            } else {
                await userService.create(formData);
            }
            await fetchUsers();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar usuario');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
            try {
                await userService.delete(id);
                fetchUsers();
            } catch (err) {
                setError(err.response?.data?.error || 'Error al desactivar usuario');
            }
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            await userService.update(user.id, { activo: !user.activo });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al cambiar estado');
        }
    };

    const filteredUsers = users.filter(user =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.usuario.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (rol) => {
        switch (rol) {
            case 'admin':
                return <span className="badge bg-purple-100 text-purple-800">Admin</span>;
            case 'cajero':
                return <span className="badge bg-blue-100 text-blue-800">Cajero</span>;
            case 'mesero':
                return <span className="badge bg-green-100 text-green-800">Mesero</span>;
            default:
                return <span className="badge badge-gray">{rol}</span>;
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                        <p className="text-gray-600">Administra el personal del restaurante y sus permisos.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn btn-primary flex items-center gap-2 self-start md:self-auto"
                    >
                        <UserPlus className="w-5 h-5" />
                        Nuevo Usuario
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="ml-auto">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="card mb-6 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o usuario..."
                                className="input pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold flex-shrink-0">
                                                    {user.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{user.nombre}</p>
                                                    <p className="text-sm text-gray-500 truncate">@{user.usuario}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {getRoleBadge(user.rol)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.activo ? (
                                                <span className="badge badge-success flex items-center gap-1 w-fit">
                                                    <Check className="w-3 h-3" /> Activo
                                                </span>
                                            ) : (
                                                <span className="badge badge-danger flex items-center gap-1 w-fit">
                                                    <X className="w-3 h-3" /> Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-sm">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`p-2 rounded-lg transition-colors ${user.activo ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    title={user.activo ? "Desactivar" : "Activar"}
                                                >
                                                    {user.activo ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Desactivar permanentemente"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                                            {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'No hay usuarios registrados.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Usuario */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {currentUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    placeholder="Ej. Juan Pérez"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    placeholder="Ej. jperez"
                                    value={formData.usuario}
                                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña {currentUser && <span className="text-xs font-normal text-gray-500 block">(Dejar en blanco para no cambiar)</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!currentUser}
                                    className="input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select
                                    className="input"
                                    value={formData.rol}
                                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                >
                                    <option value="mesero">Mesero</option>
                                    <option value="cajero">Cajero</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn btn-secondary flex-1"
                                    disabled={submitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <span>{currentUser ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
