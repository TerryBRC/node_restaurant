import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../services/api';
import { io } from 'socket.io-client';
import { Clock, CheckCircle, Flame, AlertCircle } from 'lucide-react';

const KitchenDisplay = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        fetchOrders();

        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('nueva-orden', (orden) => {
            // Only add if it has items for kitchen
            // For simplicity, we just refetch to be sure or append if we validate logic
            // Given the complex include structure, refetching is safer for MVP
            fetchOrders();
        });

        newSocket.on('items-cocina', () => {
            fetchOrders();
        });

        newSocket.on('kitchen-update', (data) => {
            // Optimistic update could happen here, or just refetch
            // We'll update state locally to avoid full refetch flicker
            setOrders(prevOrders => {
                return prevOrders.map(order => {
                    if (order.id !== data.orderId) return order;
                    return {
                        ...order,
                        items: order.items.map(item => {
                            if (item.id !== data.itemId) return item;
                            return { ...item, estado: data.estado };
                        })
                    };
                });
            });
        });

        return () => newSocket.disconnect();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/kitchen/pending');
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching kitchen orders:', err);
            setError('Error al cargar órdenes');
            setLoading(false);
        }
    };

    const updateItemStatus = async (itemId, newJsonState) => {
        try {
            await axios.post(`/api/kitchen/items/${itemId}/status`, { estado: newJsonState });
            // State update handled by socket event 'kitchen-update'
        } catch (err) {
            console.error('Error updating item:', err);
            alert('Error al actualizar estado');
        }
    };

    const getUrgencyColor = (dateString) => {
        const diff = new Date() - new Date(dateString);
        const minutes = Math.floor(diff / 60000);
        if (minutes > 20) return 'bg-red-100 border-red-500';
        if (minutes > 10) return 'bg-yellow-100 border-yellow-500';
        return 'bg-white border-gray-200';
    };

    if (loading) return <div className="p-8 text-center">Cargando KDS...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Flame className="text-orange-500" />
                    Cocina - Pedidos Pendientes
                </h1>
                <div className="text-sm text-gray-500">
                    Usuario: {user?.nombre}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                        <p>¡Todo listo! No hay pedidos pendientes.</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div
                            key={order.id}
                            className={`border-l-4 rounded-lg shadow-sm p-4 ${getUrgencyColor(order.updatedAt)}`}
                        >
                            <div className="flex justify-between items-start mb-3 border-b pb-2">
                                <div>
                                    <span className="font-bold text-lg">Mesa {order.mesa.numero}</span>
                                    <div className="text-xs text-gray-500">Orden #{order.id}</div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center text-xs text-gray-600">
                                        <Clock size={12} className="mr-1" />
                                        {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="text-xs font-semibold text-blue-600">
                                        {order.mesero.nombre}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                                        <div className="flex-1">
                                            <div className="font-medium flex items-center">
                                                <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-2">
                                                    {item.cantidad}x
                                                </span>
                                                {item.producto.nombre}
                                            </div>
                                            {item.notas && (
                                                <div className="text-xs text-red-500 mt-1 italic flex items-start">
                                                    <AlertCircle size={10} className="mt-0.5 mr-1 flex-shrink-0" />
                                                    {item.notas}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-2">
                                            {item.estado === 'enviado_cocina' && (
                                                <button
                                                    onClick={() => updateItemStatus(item.id, 'en_preparacion')}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                                    title="Empezar a preparar"
                                                >
                                                    <Flame size={18} />
                                                </button>
                                            )}
                                            {item.estado === 'en_preparacion' && (
                                                <button
                                                    onClick={() => updateItemStatus(item.id, 'listo')}
                                                    className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                                    title="Marcar como listo"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default KitchenDisplay;
