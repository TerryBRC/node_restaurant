import { useState, useEffect } from 'react';
import { printerService, productService } from '../../services/api';
import {
    Printer,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Server,
    Monitor,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';

export default function PrinterManagement() {
    const [printers, setPrinters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPrinter, setCurrentPrinter] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'network',
        interface: '',
        categorias: [],
        esTicketera: false,
        anchoPapel: 58
    });
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [printersRes, categoriesRes] = await Promise.all([
                printerService.getAll(),
                productService.getCategories()
            ]);
            setPrinters(printersRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (printer = null) => {
        if (printer) {
            setCurrentPrinter(printer);
            setFormData({
                nombre: printer.nombre,
                tipo: printer.tipo,
                interface: printer.interface,
                categorias: printer.categorias ? JSON.parse(printer.categorias) : [],
                esTicketera: printer.esTicketera,
                anchoPapel: printer.anchoPapel
            });
        } else {
            setCurrentPrinter(null);
            setFormData({
                nombre: '',
                tipo: 'network',
                interface: '',
                categorias: [],
                esTicketera: false,
                anchoPapel: 58
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (currentPrinter) {
                await printerService.update(currentPrinter.id, formData);
            } else {
                await printerService.create(formData);
            }
            await fetchInitialData();
            setIsModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar impresora');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta impresora?')) return;
        try {
            await printerService.delete(id);
            await fetchInitialData();
        } catch (err) {
            setError('Error al eliminar');
        }
    };

    const toggleCategory = (category) => {
        setFormData(prev => ({
            ...prev,
            categorias: prev.categorias.includes(category)
                ? prev.categorias.filter(c => c !== category)
                : [...prev.categorias, category]
        }));
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Printer className="w-8 h-8 text-primary-600" />
                        Gestión de Impresoras
                    </h1>
                    <p className="text-gray-500 mt-1">Configura múltiples impresoras y ruteo por categorías.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Impresora
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {printers.map(printer => (
                    <div key={printer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${printer.esTicketera ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                    <Printer className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{printer.nombre}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                        {printer.tipo === 'network' ? <Server className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                                        <span className="uppercase">{printer.tipo}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{printer.interface}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleOpenModal(printer)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(printer.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Categorías Asignadas</p>
                                <div className="flex flex-wrap gap-2">
                                    {printer.categorias && JSON.parse(printer.categorias).length > 0 ? (
                                        JSON.parse(printer.categorias).map(cat => (
                                            <span key={cat} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold border border-gray-200">
                                                {cat}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Sin categorías asignadas (Usará predeterminada)</span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                                <span className={`px-2.5 py-1 rounded-full font-bold ${printer.esTicketera ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {printer.esTicketera ? 'Imprime Tickets Pagos' : 'Solo Comandas'}
                                </span>
                                <span className="text-gray-400 font-medium">{printer.anchoPapel}mm</span>
                            </div>
                        </div>
                    </div>
                ))}

                {printers.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Printer className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900 text-lg">No hay impresoras configuradas</h3>
                        <p className="text-gray-500 text-sm mt-1 mb-6">Agrega tu primera impresora para comenzar a gestionar comandas.</p>
                        <button onClick={() => handleOpenModal()} className="btn btn-outline text-sm">
                            Agregar Impresora
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <form onSubmit={handleSubmit} className="flex flex-col h-full">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                    {currentPrinter ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-green-500" />}
                                    {currentPrinter ? 'Editar Impresora' : 'Nueva Impresora'}
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre Identificador</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej: Cocina Principal, Barra Bebidas, Caja 1"
                                            className="input w-full"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Conexión</label>
                                        <select
                                            className="input w-full"
                                            value={formData.tipo}
                                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        >
                                            <option value="network">Red (Ethernet/WiFi)</option>
                                            <option value="usb">USB / Serial</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {formData.tipo === 'network' ? 'Dirección IP' : 'Puerto / Ruta'}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder={formData.tipo === 'network' ? '192.168.1.200' : 'COM3  /dev/usb/lp0'}
                                            className="input w-full font-mono text-sm"
                                            value={formData.interface}
                                            onChange={(e) => setFormData({ ...formData, interface: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Ancho de Papel</label>
                                        <select
                                            className="input w-full"
                                            value={formData.anchoPapel}
                                            onChange={(e) => setFormData({ ...formData, anchoPapel: parseInt(e.target.value) })}
                                        >
                                            <option value={58}>58mm (Estándar)</option>
                                            <option value={80}>80mm (Ancho)</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3 pt-8">
                                        <div
                                            onClick={() => setFormData({ ...formData, esTicketera: !formData.esTicketera })}
                                            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${formData.esTicketera ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${formData.esTicketera ? 'translate-x-5' : ''}`} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Imprime Tickets de Cuenta y Cierre</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h3 className="font-bold text-gray-900 text-md">Categorías a Imprimir</h3>
                                    <p className="text-sm text-gray-500 -mt-2 mb-4">Selecciona qué productos se enviarán a esta impresora.</p>

                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => toggleCategory(cat)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${formData.categorias.includes(cat)
                                                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                                    }`}
                                            >
                                                {cat}
                                                {formData.categorias.includes(cat) && <CheckCircle2 className="w-3.5 h-3.5 inline-block ml-2" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                    Guardar Configuración
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
