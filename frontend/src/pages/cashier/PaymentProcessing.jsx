import { useState, useEffect } from 'react';
import {
    orderService,
    paymentService,
    printService,
    cashRegisterService
} from '../../services/api';
import {
    Search,
    Receipt,
    Clock,
    CreditCard,
    DollarSign,
    ArrowRight,
    Loader2,
    AlertCircle,
    X,
    CheckCircle2,
    Utensils,
    Printer,
    Coins,
    Banknote
} from 'lucide-react';

export default function PaymentProcessing() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCashRegister, setActiveCashRegister] = useState(null);

    // Modal state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        monto: 0,
        metodoPago: 'efectivo',
        referencia: '',
        esParcial: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, cashRes] = await Promise.all([
                orderService.getAll({ estado: ['enviada', 'en_preparacion', 'lista', 'entregada'] }),
                cashRegisterService.getCurrent()
            ]);
            setOrders(ordersRes.data);
            setActiveCashRegister(cashRes.data);
            setError(null);
        } catch (err) {
            if (err.response?.status === 404 && err.response?.data?.requiereApertura) {
                setActiveCashRegister(null);
            } else {
                setError('Error al cargar órdenes activas.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPayment = (order) => {
        setSelectedOrder(order);
        setPaymentForm({
            monto: parseFloat(order.total),
            metodoPago: 'efectivo',
            referencia: '',
            esParcial: false
        });
    };

    const handleProcessPayment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await paymentService.process({
                ordenId: selectedOrder.id,
                ...paymentForm
            });
            await fetchData();
            setSelectedOrder(null);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al procesar el pago');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrintTicket = async (orderId) => {
        try {
            await printService.ticket(orderId);
            alert('Ticket enviado a la impresora');
        } catch (err) {
            console.error('Error al imprimir:', err);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.mesa?.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && orders.length === 0) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" /></div>;

    if (!activeCashRegister) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
                <div className="card p-12 text-center max-w-md shadow-2xl">
                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Caja Cerrada</h2>
                    <p className="text-gray-500 mb-8">Debes abrir el turno de caja antes de poder procesar pagos en el sistema.</p>
                    <button
                        onClick={() => window.location.href = '/cajero/caja'}
                        className="btn btn-primary w-full h-12 text-lg font-bold"
                    >
                        Ir a Apertura de Caja
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Cobro de Cuentas</h1>
                        <p className="text-gray-600">Procesa pagos y libera mesas activas.</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por mesa u orden..."
                            className="input pl-10 h-12 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="card card-hover flex flex-col justify-between overflow-hidden group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-primary-50 px-3 py-1 rounded-full text-primary-700 font-black text-xs uppercase">
                                        Mesa {order.mesa?.numero}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">#{order.numeroOrden.split('-').slice(-1)}</span>
                                </div>
                                <div className="space-y-3 mb-6">
                                    {order.items?.slice(0, 3).map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-gray-600 font-medium">{item.cantidad}x {item.producto?.nombre}</span>
                                            <span className="text-gray-400 font-bold">${parseFloat(item.subtotal).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {order.items?.length > 3 && (
                                        <p className="text-[10px] text-primary-500 font-bold text-center uppercase tracking-widest">+ {order.items.length - 3} items más</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs text-gray-500">{new Date(order.fechaApertura).toLocaleTimeString()}</span>
                                    <div className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.estado === 'lista' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {order.estado}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleOpenPayment(order)}
                                className="w-full bg-primary-600 hover:bg-primary-700 p-4 text-white flex items-center justify-between font-bold transition-colors group-hover:pr-6"
                            >
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] text-primary-200 uppercase mb-1">Total a Pagar</span>
                                    <span className="text-xl">${parseFloat(order.total).toFixed(2)}</span>
                                </div>
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    ))}
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-24 card bg-white border-dashed">
                        <Receipt className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="text-gray-500 font-medium text-lg">No hay cuentas pendientes por cobrar.</p>
                        <p className="text-gray-400 text-sm mt-1">Cuando los meseros envíen órdenes, aparecerán aquí.</p>
                    </div>
                )}
            </div>

            {/* Modal de Pago */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in duration-200 h-[90vh] md:h-auto max-h-[90vh]">
                        {/* Summary side (left-top) */}
                        <div className="w-full md:w-2/5 bg-gray-50 p-8 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-2xl text-gray-900">Total</h3>
                                <button onClick={() => setSelectedOrder(null)} className="md:hidden"><X /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                                {selectedOrder.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm group">
                                        <span className="text-gray-600"><b className="text-primary-600">{item.cantidad}</b> {item.producto?.nombre}</span>
                                        <span className="font-bold text-gray-400 group-hover:text-gray-900 transition-colors">${parseFloat(item.subtotal).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-gray-200">
                                <div className="flex justify-between text-gray-500">
                                    <span className="font-medium">Subtotal</span>
                                    <span className="font-bold">${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span className="font-medium">Propina ({selectedOrder.porcentajeServicio}%)</span>
                                    <span className="font-bold">${parseFloat(selectedOrder.montoServicio).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <span className="font-black text-gray-900 text-xl leading-none">TOTAL</span>
                                    <span className="text-3xl font-black text-primary-600 leading-none">${parseFloat(selectedOrder.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment form side (right-bottom) */}
                        <div className="flex-1 p-8 bg-white relative">
                            <button onClick={() => setSelectedOrder(null)} className="hidden md:block absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>

                            <h3 className="font-bold text-xl text-gray-900 mb-8">Procesar Pago</h3>

                            <form onSubmit={handleProcessPayment} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 text-center uppercase tracking-widest">Método de Pago</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'efectivo', icon: Banknote, label: 'Efectivo' },
                                            { id: 'tarjeta', icon: CreditCard, label: 'Tarjeta' },
                                            { id: 'transferencia', icon: DollarSign, label: 'Transfer.' },
                                            { id: 'otro', icon: Coins, label: 'Otro' },
                                        ].map(method => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setPaymentForm({ ...paymentForm, metodoPago: method.id })}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold ${paymentForm.metodoPago === method.id
                                                        ? 'bg-primary-600 border-primary-600 text-white white shadow-lg scale-[1.02]'
                                                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                                    }`}
                                            >
                                                <method.icon className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-sm">{method.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Monto a Recibir</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="input h-16 text-center text-3xl font-black rounded-3xl border-gray-100 focus:border-primary-500"
                                            value={paymentForm.monto}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, monto: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {(paymentForm.metodoPago === 'tarjeta' || paymentForm.metodoPago === 'transferencia') && (
                                    <div className="animate-in slide-in-from-top-2 duration-200">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Referencia / Comprobante</label>
                                        <input
                                            type="text"
                                            className="input h-12"
                                            placeholder="Últimos 4 dígitos o folio"
                                            value={paymentForm.referencia}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, referencia: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => handlePrintTicket(selectedOrder.id)}
                                        className="btn btn-secondary flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-bold"
                                    >
                                        <Printer className="w-5 h-5" />
                                        Ticket
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn btn-primary flex-[2] h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-lg shadow-xl shadow-primary-100"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                                        Finalizar Pago
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
