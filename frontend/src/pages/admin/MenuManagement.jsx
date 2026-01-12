import { useState, useEffect } from 'react';
import { productService } from '../../services/api';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Filter,
    Loader2,
    Check,
    X,
    AlertCircle,
    Utensils,
    Clock,
    Eye,
    EyeOff,
    Tag,
    ChevronDown
} from 'lucide-react';

export default function MenuManagement() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: '',
        requierePreparacion: true,
        tiempoPreparacion: '',
        disponible: true,
        stock: 0,
        controlarStock: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                productService.getAll(),
                productService.getCategories()
            ]);
            setProducts(productsRes.data);
            setCategories(['Todas', ...categoriesRes.data]);
            setError(null);
        } catch (err) {
            setError('Error al cargar datos del menú.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                nombre: product.nombre,
                descripcion: product.descripcion || '',
                precio: product.precio,
                categoria: product.categoria || '',
                requierePreparacion: product.requierePreparacion,
                tiempoPreparacion: product.tiempoPreparacion || '',
                disponible: product.disponible,
                stock: product.stock || 0,
                controlarStock: product.controlarStock !== undefined ? product.controlarStock : true
            });
        } else {
            setCurrentProduct(null);
            setFormData({
                nombre: '',
                descripcion: '',
                precio: '',
                categoria: '',
                requierePreparacion: true,
                tiempoPreparacion: '',
                disponible: true,
                stock: 0,
                controlarStock: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (currentProduct) {
                await productService.update(currentProduct.id, formData);
            } else {
                await productService.create(formData);
            }
            await fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar producto');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            try {
                await productService.delete(id);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.error || 'Error al eliminar producto');
            }
        }
    };

    const handleToggleAvailability = async (product) => {
        try {
            await productService.update(product.id, { disponible: !product.disponible });
            fetchData();
        } catch (err) {
            setError('Error al cambiar disponibilidad');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'Todas' || product.categoria === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Menú</h1>
                        <p className="text-gray-600">Administra los productos, categorías y precios de tu restaurante.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Producto
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            className="input pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            className="input pl-10 pr-10 appearance-none bg-white"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className={`card card-hover flex flex-col ${!product.disponible ? 'opacity-75' : ''}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-primary-50 rounded-lg">
                                    <Utensils className="w-6 h-6 text-primary-600" />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleToggleAvailability(product)}
                                        className={`p-2 rounded-lg transition-colors ${product.disponible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                        title={product.disponible ? "Disponible" : "No disponible"}
                                    >
                                        {product.disponible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(product)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Tag className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{product.categoria || 'Sin Categoría'}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.nombre}</h3>
                                {product.descripcion && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.descripcion}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {product.controlarStock ? (
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' :
                                            product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            Stock: {product.stock}
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-bold">
                                            Stock Infinito
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xl font-bold text-primary-600">${parseFloat(product.precio).toFixed(2)}</span>
                                {product.requierePreparacion && (
                                    <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                        <Clock className="w-3 h-3" />
                                        <span>{product.tiempoPreparacion || '10'} min</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12 card bg-gray-50 border-dashed">
                        <p className="text-gray-500">No se encontraron productos que coincidan con los criterios.</p>
                    </div>
                )}
            </div>

            {/* Modal de Producto */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        placeholder="Ej. Tacos al Pastor"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        className="input min-h-[80px]"
                                        placeholder="Ingredientes, porción, etc."
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="input"
                                        placeholder="0.00"
                                        value={formData.precio}
                                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <input
                                        type="text"
                                        list="category-suggestions"
                                        className="input"
                                        placeholder="Ej. Platos Fuertes"
                                        value={formData.categoria}
                                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                    />
                                    <datalist id="category-suggestions">
                                        {categories.filter(c => c !== 'Todas').map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>

                                <div className="flex items-center gap-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="requierePreparacion"
                                        checked={formData.requierePreparacion}
                                        onChange={(e) => setFormData({ ...formData, requierePreparacion: e.target.checked })}
                                        className="w-4 h-4 text-primary-600 rounded"
                                    />
                                    <label htmlFor="requierePreparacion" className="text-sm text-gray-700">Requiere preparación en cocina</label>
                                </div>

                                {formData.requierePreparacion && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo (min)</label>
                                        <input
                                            type="number"
                                            className="input"
                                            placeholder="15"
                                            value={formData.tiempoPreparacion}
                                            onChange={(e) => setFormData({ ...formData, tiempoPreparacion: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={handleCloseModal} className="btn btn-secondary flex-1" disabled={submitting}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary flex-1 flex items-center justify-center gap-2" disabled={submitting}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (currentProduct ? 'Guardar Cambios' : 'Crear Producto')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
