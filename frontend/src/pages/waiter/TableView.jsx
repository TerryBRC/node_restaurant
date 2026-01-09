import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { areaService, tableService, orderService } from '../../services/api';
import {
    Loader2,
    AlertCircle,
    Users,
    MapPin,
    Clock,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';

export default function TableView() {
    const navigate = useNavigate();
    const [areas, setAreas] = useState([]);
    const [tables, setTables] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [selectedArea, setSelectedArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedArea) {
            fetchTables(selectedArea.id);
        }
    }, [selectedArea]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [areasRes, ordersRes] = await Promise.all([
                areaService.getAll(),
                orderService.getAll({ estado: ['abierta', 'enviada', 'en_preparacion', 'lista', 'entregada'] })
            ]);

            setAreas(areasRes.data);
            setActiveOrders(ordersRes.data);

            if (areasRes.data.length > 0 && !selectedArea) {
                setSelectedArea(areasRes.data[0]);
            }
            setError(null);
        } catch (err) {
            setError('Error al cargar la vista de mesas.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTables = async (areaId) => {
        try {
            const response = await tableService.getAll(areaId);
            setTables(response.data);
        } catch (err) {
            console.error('Error al cargar mesas:', err);
        }
    };

    const getTableStatus = (tableId) => {
        const order = activeOrders.find(o => o.mesaId === tableId);
        if (order) {
            return {
                status: 'occupied',
                orderId: order.id,
                time: new Date(order.fechaApertura).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                total: order.total
            };
        }
        return { status: 'available' };
    };

    const handleTableClick = (table) => {
        const statusInfo = getTableStatus(table.id);
        if (statusInfo.status === 'occupied') {
            navigate(`/mesero/pedidos/${statusInfo.orderId}`);
        } else {
            // Ir a crear nueva orden para esta mesa
            navigate(`/mesero/pedidos/nuevo?mesaId=${table.id}`);
        }
    };

    const filteredTables = tables.filter(table =>
        table.numero.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && areas.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vista de Mesas</h1>
                        <p className="text-gray-600">Monitorea y gestiona el servicio en tiempo real.</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Disponible</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-gray-600">Ocupada</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Tabs de Áreas */}
                <div className="flex flex-nowrap overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
                    {areas.map((area) => (
                        <button
                            key={area.id}
                            onClick={() => setSelectedArea(area)}
                            className={`px-4 py-2.5 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-2 border ${selectedArea?.id === area.id
                                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
                                }`}
                        >
                            <MapPin className={`w-4 h-4 ${selectedArea?.id === area.id ? 'text-white' : 'text-gray-400'}`} />
                            {area.nombre}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <div className="mb-6 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar mesa por número..."
                                className="input pl-10 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredTables.map((table) => {
                                const statusInfo = getTableStatus(table.id);
                                const isOccupied = statusInfo.status === 'occupied';

                                return (
                                    <button
                                        key={table.id}
                                        onClick={() => handleTableClick(table)}
                                        className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all hover:scale-105 ${isOccupied
                                                ? 'bg-white border-red-500 shadow-md ring-1 ring-red-500/20'
                                                : 'bg-white border-green-200 hover:border-green-400 opacity-90'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isOccupied ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                            <Users className="w-6 h-6" />
                                        </div>

                                        <span className="text-xl font-black text-gray-900 mb-1">{table.numero}</span>
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            <span>Cap: {table.capacidad}</span>
                                        </div>

                                        {isOccupied && (
                                            <div className="mt-2 pt-2 border-t border-red-100 w-full flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{statusInfo.time}</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">${parseFloat(statusInfo.total).toFixed(2)}</span>
                                            </div>
                                        )}

                                        {!isOccupied && (
                                            <div className="mt-2 pt-2 border-t border-green-50 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex items-center justify-center gap-1 text-[10px] text-green-600 font-bold uppercase">
                                                    <span>Nueva</span>
                                                    <ChevronRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {filteredTables.length === 0 && (
                            <div className="text-center py-24 card bg-white border-dashed">
                                <p className="text-gray-500 font-medium">No se encontraron mesas en esta área.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
