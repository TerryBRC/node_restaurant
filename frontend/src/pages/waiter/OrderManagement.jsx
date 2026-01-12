import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    orderService,
    productService,
    tableService,
    printService
} from '../../services/api';
import {
    Plus,
    Minus,
    Trash2,
    Send,
    Loader2,
    Search,
    ChevronLeft,
    Clock,
    AlertCircle,
    CheckCircle2,
    StickyNote,
    ArrowRightLeft,
    Receipt,
    Utensils,
    X
} from 'lucide-react';
import { io } from 'socket.io-client';

export default function OrderManagement() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const mesaId = searchParams.get('mesaId');

    const [order, setOrder] = useState(null);
    const [table, setTable] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['Todas']);
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Estado para items locales (antes de guardarlos en el servidor)
    const [cart, setCart] = useState([]);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [availableTables, setAvailableTables] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [productsRes, categoriesRes] = await Promise.all([
                    productService.getAll({ disponible: true }),
                    productService.getCategories()
                ]);
                setProducts(productsRes.data);
                setCategories(['Todas', ...categoriesRes.data]);

                if (id) {
                    // Cargar orden existente
                    const orderRes = await orderService.getById(id);
                    setOrder(orderRes.data);
                    setTable(orderRes.data.mesa);
                } else if (mesaId) {
                    // Cargar info de la mesa para nueva orden
                    const tableRes = await tableService.getById(mesaId);
                    setTable(tableRes.data);
                }
            } catch (err) {
                setError('Error al cargar la orden.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

        socket.on('orden-actualizada', (updatedOrder) => {
            if (id && updatedOrder.id === parseInt(id)) {
                setOrder(updatedOrder);
            } else if (mesaId && updatedOrder.mesaId === parseInt(mesaId)) {
                // Si estamos creando orden y alguien más la crea/actualiza para esta mesa
                // Podríamos redirigir o actualizar. Por ahora, si hay ID en URL es suficiente.
            }
        });

        socket.on('kitchen-update', (data) => {
            if (order && data.orderId === order.id) {
                // Refetch easier than deep merge for now
                orderService.getById(order.id).then(res => setOrder(res.data));
            }
        });

        socket.on('item-cancelado', (data) => {
            if (order && data.ordenId === order.id) {
                orderService.getById(order.id).then(res => setOrder(res.data));
            }
        });

        return () => socket.disconnect();
    }, [id, mesaId, order]);

    const addToCart = (product) => {
        if (product.controlarStock && product.stock <= 0) return; // No permitir si no hay stock

        const existingItem = cart.find(item => item.productoId === product.id);
        const currentQty = existingItem ? existingItem.cantidad : 0;

        if (product.controlarStock && currentQty + 1 > product.stock) {
            alert(`Solo quedan ${product.stock} unidades de ${product.nombre}`);
            return;
        }

        if (existingItem) {
            setCart(cart.map(item =>
                item.productoId === product.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productoId: product.id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: 1,
                notas: ''
            }]);
        }
    };

    const updateQuantity = (productId, delta) => {
        const product = products.find(p => p.id === productId);
        setCart(cart.map(item => {
            if (item.productoId === productId) {
                const newQty = Math.max(1, item.cantidad + delta);

                if (delta > 0 && product && product.controlarStock && newQty > product.stock) {
                    // No permitir subir más allá del stock
                    return item;
                }

                return { ...item, cantidad: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productoId !== productId));
    };

    const handleUpdateNotes = (productId, notes) => {
        setCart(cart.map(item =>
            item.productoId === productId ? { ...item, notas: notes } : item
        ));
    };

    const handleSaveOrder = async () => {
        if (cart.length === 0) return;
        setSubmitting(true);
        try {
            if (order) {
                // Agregar items a orden existente
                const res = await orderService.addItems(order.id, cart);
                setOrder(res.data);
            } else {
                // Crear nueva orden
                const res = await orderService.create({
                    mesaId: table.id,
                    items: cart
                });
                navigate(`/mesero/pedidos/${res.data.orden.id}`, { replace: true });
            }
            setCart([]);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar la orden');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendToKitchen = async () => {
        setSubmitting(true);
        try {
            await orderService.sendToKitchen(order.id);
            const res = await orderService.getById(order.id);
            setOrder(res.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al enviar a cocina');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || p.categoria === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const calculateCartSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/mesero/mesas')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">
                            {table ? `Mesa ${table.numero}` : 'Cargando...'}
                        </h1>
                        <p className="text-xs text-gray-500">
                            {order ? `Orden #${order.numeroOrden}` : 'Nueva Orden'}
                        </p>
                    </div>
                </div>
                {order && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsTransferModalOpen(true)}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl"
                            title="Transferir Mesa"
                        >
                            <ArrowRightLeft className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Product Selection Area */}
                <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 bg-white border-b border-gray-200 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                className="input pl-10 h-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors ${selectedCategory === cat
                                        ? 'bg-primary-600 border-primary-600 text-white'
                                        : 'bg-white border-gray-200 text-gray-600'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-white p-3 rounded-2xl border border-gray-200 text-left flex flex-col hover:border-primary-400 hover:shadow-sm transition-all active:scale-95"
                            >
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-primary-500 uppercase">{product.categoria}</span>
                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mt-0.5">{product.nombre}</h3>
                                </div>
                                <div className="mt-3 font-black text-primary-600 flex justify-between items-end">
                                    <span>${parseFloat(product.precio).toFixed(2)}</span>
                                    {product.controlarStock && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${product.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {product.stock === 0 ? 'AGOTADO' : `Stock: ${product.stock}`}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Order Items */}
                <div className="w-full max-w-md bg-white border-l border-gray-200 flex flex-col shadow-2xl relative z-10">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-gray-400" />
                            Detalle del Pedido
                        </h2>
                        {cart.length > 0 && (
                            <button onClick={() => setCart([])} className="text-red-500 text-xs font-bold hover:underline">
                                Vaciar Carrito
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {error && (
                            <div className="m-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Existing Items in Order */}
                        {order && order.items && order.items.length > 0 && (
                            <div className="p-4 space-y-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1">Items en Cuenta</p>
                                {order.items.map((item, idx) => (
                                    <div key={`existing-${idx}`} className="flex justify-between items-start group">
                                        <div className="flex-1 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-primary-700">{item.cantidad}x</span>
                                                <h4 className="font-semibold text-gray-900">{item.producto?.nombre}</h4>
                                            </div>
                                            {item.notas && <p className="text-xs text-gray-500 italic mt-0.5 ml-7">"{item.notas}"</p>}
                                            <div className="flex items-center gap-2 mt-1 ml-7">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${item.estado === 'pendiente' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                    item.estado === 'enviado_cocina' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                        'bg-green-50 text-green-600 border border-green-100'
                                                    }`}>
                                                    {item.estado.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">${parseFloat(item.subtotal).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New Items in Cart */}
                        {cart.length > 0 && (
                            <div className="p-4 bg-primary-50/30 space-y-4">
                                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest border-b border-primary-100 pb-1">Nuevos a agregar</p>
                                {cart.map((item) => (
                                    <div key={`cart-${item.productoId}`} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                                    <button onClick={() => updateQuantity(item.productoId, -1)} className="p-1 px-2 hover:bg-gray-50 border-r border-gray-100">
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="px-2.5 font-black text-sm">{item.cantidad}</span>
                                                    <button onClick={() => updateQuantity(item.productoId, 1)} className="p-1 px-2 hover:bg-gray-50 border-l border-gray-100">
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.nombre}</h4>
                                            </div>
                                            <button onClick={() => removeFromCart(item.productoId)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-gray-100">
                                            <StickyNote className="w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Nota (Ej. Sin cebolla)"
                                                className="bg-transparent text-xs w-full focus:outline-none placeholder:text-gray-300"
                                                value={item.notas}
                                                onChange={(e) => handleUpdateNotes(item.productoId, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(!order || !order.items || order.items.length === 0) && cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 px-10 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Plus className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="font-bold text-sm">Carrito Vacío</p>
                                <p className="text-xs mt-1">Selecciona productos de la izquierda para comenzar la orden.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Summary */}
                    <div className="p-5 border-t border-gray-200 bg-white shadow-inner">
                        <div className="space-y-1 mb-4">
                            {order && (
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>Subtotal actual:</span>
                                    <span className="font-semibold">${parseFloat(order.subtotal).toFixed(2)}</span>
                                </div>
                            )}
                            {cart.length > 0 && (
                                <div className="flex justify-between items-center text-sm text-primary-600 font-medium">
                                    <span>Nuevos items:</span>
                                    <span>+${calculateCartSubtotal().toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-2">
                                <span className="font-black text-gray-900 uppercase tracking-tighter text-sm">Gran Total:</span>
                                <span className="text-2xl font-black text-primary-600 leading-none">
                                    ${order ? (parseFloat(order.total) + (calculateCartSubtotal() * (1 + (order.porcentajeServicio / 100)))).toFixed(2) : calculateCartSubtotal().toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {cart.length > 0 ? (
                                <button
                                    onClick={handleSaveOrder}
                                    disabled={submitting}
                                    className="col-span-2 btn btn-primary h-12 flex items-center justify-center gap-2 rounded-xl text-md font-bold"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : <Plus className="w-5 h-5" />}
                                    {order ? 'Agregar a la Cuenta' : 'Empezar Orden'}
                                </button>
                            ) : order && order.items?.some(i => i.estado === 'pendiente') ? (
                                <button
                                    onClick={handleSendToKitchen}
                                    disabled={submitting}
                                    className="col-span-2 bg-orange-500 hover:bg-orange-600 text-white h-12 flex items-center justify-center gap-2 rounded-xl text-md font-bold shadow-lg shadow-orange-200 transition-all active:scale-95"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
                                    Enviar a Cocina
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="col-span-2 opacity-50 bg-gray-200 text-gray-400 h-12 flex items-center justify-center gap-2 rounded-xl text-md font-bold cursor-not-allowed"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Orden al día
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Transferencia */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    {/* ... Implementación del modal de transferencia si es necesario ... */}
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-black text-xl text-gray-900">Transferir Mesa</h3>
                            <button onClick={() => setIsTransferModalOpen(false)}><X /></button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 mb-4">Selecciona la mesa destino para la orden <b>{order.numeroOrden}</b>.</p>
                            {/* Aquí se cargarían las mesas disponibles */}
                            <div className="text-center py-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-xs text-gray-400">Funcionalidad en desarrollo</p>
                            </div>
                            <button onClick={() => setIsTransferModalOpen(false)} className="btn btn-secondary w-full mt-6 h-12 rounded-xl font-bold">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
