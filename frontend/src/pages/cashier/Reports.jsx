import { useState, useEffect } from 'react';
import { reportService, cashRegisterService } from '../../services/api';
import {
    BarChart3,
    Calendar,
    TrendingUp,
    Package,
    Users,
    Download,
    ChevronRight,
    Loader2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingBag,
    History,
    Search
} from 'lucide-react';

export default function Reports() {
    const today = new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({ inicio: today, fin: today });
    const [salesReport, setSalesReport] = useState(null);
    const [cashHistory, setCashHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'history'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [dateRange, activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'sales') {
                const res = await reportService.getSales({
                    fechaInicio: dateRange.inicio,
                    fechaFin: dateRange.fin
                });
                setSalesReport(res.data);
            } else {
                const res = await cashRegisterService.getHistory({
                    fechaInicio: dateRange.inicio,
                    fechaFin: dateRange.fin
                });
                setCashHistory(res.data);
            }
            setError(null);
        } catch (err) {
            setError('Error al cargar la información del reporte.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ state }) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${state === 'cerrada' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
            }`}>
            {state}
        </span>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-display">Reportes y Estadísticas</h1>
                        <p className="text-gray-500">Analiza el rendimiento de tu restaurante.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 px-3 border-r border-gray-100">
                            <Calendar className="w-4 h-4 text-primary-500" />
                            <input
                                type="date"
                                className="bg-transparent text-sm font-bold focus:outline-none"
                                value={dateRange.inicio}
                                onChange={(e) => setDateRange({ ...dateRange, inicio: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2 px-3">
                            <span className="text-xs text-gray-400 font-bold">AL</span>
                            <input
                                type="date"
                                className="bg-transparent text-sm font-bold focus:outline-none"
                                value={dateRange.fin}
                                onChange={(e) => setDateRange({ ...dateRange, fin: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-200 p-1 rounded-xl w-fit mb-8">
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'sales' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <BarChart3 className="w-4 h-4 inline-block mr-2" />
                        Ventas
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <History className="w-4 h-4 inline-block mr-2" />
                        Historial de Caja
                    </button>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary-600 w-10 h-10" /></div>
                ) : error ? (
                    <div className="card p-6 border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
                        <AlertCircle /> {error}
                    </div>
                ) : activeTab === 'sales' && salesReport ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="card p-6 bg-primary-600 text-white shadow-xl shadow-primary-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
                                    <span className="text-xs font-black bg-white/20 px-2 py-1 rounded-lg">TOTAL NETO</span>
                                </div>
                                <p className="text-3xl font-black">${parseFloat(salesReport.resumen.totalVentas).toFixed(2)}</p>
                                <p className="text-xs text-primary-100 mt-2">Ventas pagadas en el periodo</p>
                            </div>
                            <div className="card p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ShoppingBag className="w-6 h-6" /></div>
                                    <span className="text-xs font-black text-blue-400 uppercase">Ordenes</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900">{salesReport.resumen.totalOrdenes}</p>
                                <p className="text-xs text-gray-400 mt-2">Ticket promedio: ${(salesReport.resumen.totalVentas / (salesReport.resumen.totalOrdenes || 1)).toFixed(2)}</p>
                            </div>
                            <div className="card p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><Package className="w-6 h-6" /></div>
                                    <span className="text-xs font-black text-green-400 uppercase">Subtotal</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900">${parseFloat(salesReport.resumen.totalSubtotal).toFixed(2)}</p>
                                <p className="text-xs text-gray-400 mt-2">Base sin servicios/propinas</p>
                            </div>
                            <div className="card p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Users className="w-6 h-6" /></div>
                                    <span className="text-xs font-black text-orange-400 uppercase">Servicio</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900">${parseFloat(salesReport.resumen.totalServicio).toFixed(2)}</p>
                                <p className="text-xs text-gray-400 mt-2">Total recaudado por servicio</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Products */}
                            <div className="card overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary-500" />
                                        Productos más Vendidos
                                    </h2>
                                    <button className="text-xs font-bold text-primary-600 hover:underline">Ver todos</button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {salesReport.topProductos.map((item, i) => (
                                        <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-400">
                                                    #{i + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-gray-900">{item.producto}</h3>
                                                    <p className="text-xs text-gray-400">{item.categoria}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900">{item.cantidad} <span className="text-[10px] text-gray-400 font-bold uppercase">Uds</span></p>
                                                <p className="text-[11px] text-primary-600 font-bold">${parseFloat(item.total).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {salesReport.topProductos.length === 0 && (
                                        <div className="p-12 text-center text-gray-400 italic text-sm">No hay ventas registradas en este periodo.</div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Orders List */}
                            <div className="card overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5 text-blue-500" />
                                        Últimas Órdenes Pagadas
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                                                <th className="px-6 py-4">Orden</th>
                                                <th className="px-6 py-4">Monto</th>
                                                <th className="px-6 py-4">Mesero</th>
                                                <th className="px-6 py-4">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {salesReport.ordenes.slice(0, 8).map((orden) => (
                                                <tr key={orden.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-sm">#{orden.numeroOrden.split('-').pop()}</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-black text-sm text-gray-900">${parseFloat(orden.total).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{orden.mesero?.nombre}</td>
                                                    <td className="px-6 py-4 text-[10px] text-gray-400 font-mono">{new Date(orden.fechaCierre).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Cash History Tab */
                    <div className="card overflow-hidden animate-in fade-in duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                                        <th className="px-6 py-4 text-center">Estado</th>
                                        <th className="px-6 py-4">Cajero</th>
                                        <th className="px-6 py-4">Apertura</th>
                                        <th className="px-6 py-4">Cierre</th>
                                        <th className="px-6 py-4 text-right">Diferencia</th>
                                        <th className="px-6 py-4 text-right">Venta Total</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cashHistory.map((caja) => (
                                        <tr key={caja.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 text-center"><StatusBadge state={caja.estado} /></td>
                                            <td className="px-6 py-4 font-bold text-sm">{caja.cajero?.nombre}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500">{new Date(caja.fechaApertura).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500">{caja.fechaCierre ? new Date(caja.fechaCierre).toLocaleString() : '-'}</td>
                                            <td className={`px-6 py-4 text-right font-bold text-sm ${parseFloat(caja.diferencia) < 0 ? 'text-red-500' :
                                                    parseFloat(caja.diferencia) > 0 ? 'text-green-500' : 'text-gray-400'
                                                }`}>
                                                ${parseFloat(caja.diferencia || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-primary-600 text-sm">
                                                ${parseFloat(caja.totalVentas).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-primary-600 transition-colors">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {cashHistory.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="py-20 text-center text-gray-400 font-medium">No se encontraron cierres de caja en este rango.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
