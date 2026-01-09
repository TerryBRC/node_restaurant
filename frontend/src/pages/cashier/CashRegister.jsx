import { useState, useEffect } from 'react';
import { cashRegisterService } from '../../services/api';
import {
    Lock,
    Unlock,
    DollarSign,
    CreditCard,
    TrendingUp,
    AlertCircle,
    Loader2,
    CheckCircle2,
    StickyNote,
    History
} from 'lucide-react';

export default function CashRegister() {
    const [cajaActual, setCajaActual] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Form data
    const [montoApertura, setMontoApertura] = useState('');
    const [notasApertura, setNotasApertura] = useState('');
    const [montoCierre, setMontoCierre] = useState('');
    const [notasCierre, setNotasCierre] = useState('');

    useEffect(() => {
        fetchCaja();
    }, []);

    const fetchCaja = async () => {
        try {
            setLoading(true);
            const res = await cashRegisterService.getCurrent();
            setCajaActual(res.data);
            setError(null);
        } catch (err) {
            if (err.response?.status === 404) {
                setCajaActual(null);
            } else {
                setError('Error al conectar con el servidor de caja.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAbrirCaja = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await cashRegisterService.open({
                montoApertura: parseFloat(montoApertura),
                notasApertura
            });
            await fetchCaja();
            setMontoApertura('');
            setNotasApertura('');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al abrir caja');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCerrarCaja = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await cashRegisterService.close({
                montoCierre: parseFloat(montoCierre),
                notasCierre
            });
            await fetchCaja();
            setMontoCierre('');
            setNotasCierre('');
            alert('Caja cerrada con éxito. Diferencia: $' + parseFloat(res.data.resumen.diferencia).toFixed(2));
        } catch (err) {
            setError(err.response?.data?.error || 'Error al cerrar caja');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-display">Caja Registradora</h1>
                        <p className="text-gray-500">Control de flujo de efectivo y ventas diarias.</p>
                    </div>
                    {cajaActual ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                            <Unlock className="w-4 h-4" />
                            Caja Abierta
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-600 rounded-full font-bold text-sm">
                            <Lock className="w-4 h-4" />
                            Caja Cerrada
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                )}

                {!cajaActual ? (
                    /* Vista Apertura */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="card p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Unlock className="w-6 h-6 text-primary-600" />
                                Apertura de Caja
                            </h2>
                            <form onSubmit={handleAbrirCaja} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Inicial (Efectivo)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="input pl-10 h-12 text-lg font-bold"
                                            placeholder="0.00"
                                            value={montoApertura}
                                            onChange={(e) => setMontoApertura(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 italic">Ingresa el dinero disponible en caja al inicio del turno.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas de Apertura</label>
                                    <textarea
                                        className="input"
                                        placeholder="Opcional..."
                                        value={notasApertura}
                                        onChange={(e) => setNotasApertura(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-primary w-full h-12 text-lg font-bold shadow-lg shadow-primary-200"
                                >
                                    {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Abrir Turno'}
                                </button>
                            </form>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-primary-600 rounded-3xl p-6 text-white shadow-xl">
                                <h3 className="font-bold text-lg mb-2">Consejo de Usuario</h3>
                                <p className="text-primary-100 text-sm leading-relaxed">
                                    Asegúrate de contar el efectivo disponible antes de abrir la caja. Esto garantiza que los reportes de descuadre sean precisos al final del día.
                                </p>
                            </div>
                            <div className="card p-6 flex items-center gap-4">
                                <div className="p-3 bg-gray-100 rounded-2xl text-gray-500">
                                    <History className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Historial de Turnos</h4>
                                    <p className="text-sm text-gray-500">Consulta los cierres de días anteriores.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Vista Resumen y Cierre */
                    <div className="space-y-8">
                        {/* Dashboard rápido */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="card p-5 border-l-4 border-l-blue-500">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Efectivo Inicial</p>
                                <p className="text-2xl font-black text-gray-900">${parseFloat(cajaActual.montoApertura).toFixed(2)}</p>
                            </div>
                            <div className="card p-5 border-l-4 border-l-green-500">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Ventas Efectivo</p>
                                <p className="text-2xl font-black text-green-600">+ ${parseFloat(cajaActual.totalEfectivo).toFixed(2)}</p>
                            </div>
                            <div className="card p-5 border-l-4 border-l-purple-500">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Ventas Tarjeta</p>
                                <p className="text-2xl font-black text-purple-600">+ ${parseFloat(cajaActual.totalTarjeta).toFixed(2)}</p>
                            </div>
                            <div className="card p-5 bg-primary-600 text-white">
                                <p className="text-xs font-bold text-primary-200 uppercase mb-1">Total en Caja (Efec)</p>
                                <p className="text-2xl font-black text-white">
                                    ${(parseFloat(cajaActual.montoApertura) + parseFloat(cajaActual.totalEfectivo)).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 card p-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                    Balance de Ventas Actual
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-600 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> Total Bruto Ventas
                                        </span>
                                        <span className="font-bold text-lg">${parseFloat(cajaActual.totalVentas).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 italic text-sm text-gray-500">
                                        <span>Abierta por:</span>
                                        <span className="font-medium">{cajaActual.cajero?.nombre}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 italic text-sm text-gray-500">
                                        <span>Fecha Apertura:</span>
                                        <span className="font-medium">{new Date(cajaActual.fechaApertura).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-8 border-t-8 border-t-red-500 bg-red-50/20">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-700">
                                    <Lock className="w-5 h-5" />
                                    Cierre de Turno
                                </h3>
                                <form onSubmit={handleCerrarCaja} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-red-900 mb-1">Efectivo Real en Caja</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="input h-12 text-center text-xl font-black border-red-200 focus:border-red-500"
                                            placeholder="Cuenta el dinero..."
                                            value={montoCierre}
                                            onChange={(e) => setMontoCierre(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-red-900 mb-1">Notas de Cierre</label>
                                        <textarea
                                            className="input text-sm border-red-200"
                                            placeholder="Incidentes, observaciones..."
                                            value={notasCierre}
                                            onChange={(e) => setNotasCierre(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn bg-red-600 hover:bg-red-700 text-white w-full h-12 font-bold shadow-lg shadow-red-200"
                                    >
                                        {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Cerrar Caja'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
