import { useState, useEffect } from 'react';
import { areaService, tableService } from '../../services/api';
import {
    Plus,
    Edit2,
    Trash2,
    LayoutGrid,
    Square,
    Users,
    Loader2,
    X,
    AlertCircle,
    ChevronRight,
    MapPin,
    Hash
} from 'lucide-react';

export default function AreaTableSetup() {
    const [areas, setAreas] = useState([]);
    const [tables, setTables] = useState([]);
    const [selectedArea, setSelectedArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para Modales
    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [currentArea, setCurrentArea] = useState(null);
    const [currentTable, setCurrentTable] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [areaForm, setAreaForm] = useState({ nombre: '', descripcion: '', orden: 0 });
    const [tableForm, setTableForm] = useState({ numero: '', capacidad: 4, areaId: '' });

    useEffect(() => {
        fetchAreas();
    }, []);

    useEffect(() => {
        if (selectedArea) {
            fetchTables(selectedArea.id);
        } else {
            setTables([]);
        }
    }, [selectedArea]);

    const fetchAreas = async () => {
        try {
            setLoading(true);
            const response = await areaService.getAll();
            setAreas(response.data);
            if (response.data.length > 0 && !selectedArea) {
                setSelectedArea(response.data[0]);
            }
            setError(null);
        } catch (err) {
            setError('Error al cargar áreas.');
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

    // Handlers para Áreas
    const handleOpenAreaModal = (area = null) => {
        if (area) {
            setCurrentArea(area);
            setAreaForm({ nombre: area.nombre, descripcion: area.descripcion || '', orden: area.orden || 0 });
        } else {
            setCurrentArea(null);
            setAreaForm({ nombre: '', descripcion: '', orden: areas.length });
        }
        setIsAreaModalOpen(true);
    };

    const handleAreaSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (currentArea) {
                await areaService.update(currentArea.id, areaForm);
            } else {
                await areaService.create(areaForm);
            }
            await fetchAreas();
            setIsAreaModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar área');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAreaDelete = async (area) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el área "${area.nombre}"?`)) {
            try {
                await areaService.delete(area.id);
                if (selectedArea?.id === area.id) setSelectedArea(null);
                fetchAreas();
            } catch (err) {
                setError(err.response?.data?.error || 'Error al eliminar área');
            }
        }
    };

    // Handlers para Mesas
    const handleOpenTableModal = (table = null) => {
        if (table) {
            setCurrentTable(table);
            setTableForm({ numero: table.numero, capacidad: table.capacidad, areaId: table.areaId });
        } else {
            setCurrentTable(null);
            setTableForm({ numero: '', capacidad: 4, areaId: selectedArea?.id || '' });
        }
        setIsTableModalOpen(true);
    };

    const handleTableSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (currentTable) {
                await tableService.update(currentTable.id, tableForm);
            } else {
                await tableService.create(tableForm);
            }
            await fetchTables(selectedArea.id);
            setIsTableModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar mesa');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTableDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta mesa?')) {
            try {
                await tableService.delete(id);
                fetchTables(selectedArea.id);
            } catch (err) {
                setError(err.response?.data?.error || 'Error al eliminar mesa');
            }
        }
    };

    if (loading && areas.length === 0) {
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
                        <h1 className="text-3xl font-bold text-gray-900">Áreas y Mesas</h1>
                        <p className="text-gray-600">Configura la distribución física de tu restaurante.</p>
                    </div>
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Panel de Áreas */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary-600" />
                                Áreas
                            </h2>
                            <button
                                onClick={() => handleOpenAreaModal()}
                                className="p-1 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200"
                                title="Nueva Área"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {areas.map((area) => (
                                <div
                                    key={area.id}
                                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedArea?.id === area.id
                                            ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300'
                                        }`}
                                    onClick={() => setSelectedArea(area)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <LayoutGrid className={`w-5 h-5 flex-shrink-0 ${selectedArea?.id === area.id ? 'text-white' : 'text-gray-400'}`} />
                                        <div className="truncate">
                                            <p className="font-semibold text-sm truncate">{area.nombre}</p>
                                            {area.descripcion && <p className={`text-xs truncate ${selectedArea?.id === area.id ? 'text-primary-100' : 'text-gray-500'}`}>{area.descripcion}</p>}
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${selectedArea?.id === area.id ? 'text-white' : 'text-gray-400'}`}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenAreaModal(area); }}
                                            className="p-1 hover:bg-white/20 rounded saturate-150"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleAreaDelete(area); }}
                                            className="p-1 hover:bg-white/20 rounded saturate-150"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            ))}
                            {areas.length === 0 && (
                                <p className="text-center py-8 text-gray-400 text-sm italic">No hay áreas configuradas.</p>
                            )}
                        </div>
                    </div>

                    {/* Panel de Mesas */}
                    <div className="lg:col-span-3">
                        {selectedArea ? (
                            <div className="card h-full min-h-[400px]">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Mesas en {selectedArea.nombre}</h2>
                                        <p className="text-sm text-gray-500">Distribución y capacidad de las mesas configuradas.</p>
                                    </div>
                                    <button
                                        onClick={() => handleOpenTableModal()}
                                        className="btn btn-primary flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Agregar Mesa
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {tables.map((table) => (
                                        <div key={table.id} className="group relative bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center transition-all hover:border-primary-400 hover:shadow-md hover:-translate-y-1">
                                            <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenTableModal(table)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleTableDelete(table.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mb-3">
                                                <Square className="w-6 h-6" />
                                            </div>

                                            <p className="font-bold text-gray-900 mb-1">{table.numero}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-full">
                                                <Users className="w-3 h-3" />
                                                Cap: {table.capacidad}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => handleOpenTableModal()}
                                        className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-3 group-hover:border-primary-400 transition-colors">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-semibold">Nueva Mesa</p>
                                    </button>
                                </div>

                                {tables.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="max-w-xs mx-auto text-gray-400">
                                            <Hash className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p className="font-medium text-gray-500">No hay mesas en esta área</p>
                                            <p className="text-sm mt-1">Comienza agregando mesas para que los meseros puedan registrar órdenes.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="card flex flex-col items-center justify-center py-24 text-gray-400 border-dashed">
                                <MapPin className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Selecciona una área para ver sus mesas</p>
                                <p className="text-sm">O crea una nueva área usando el botón del panel lateral.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Área */}
            {isAreaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {currentArea ? 'Editar Área' : 'Nueva Área'}
                            </h2>
                            <button onClick={() => setIsAreaModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAreaSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Área</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    placeholder="Ej. Comedor Principal"
                                    value={areaForm.nombre}
                                    onChange={(e) => setAreaForm({ ...areaForm, nombre: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    className="input"
                                    placeholder="Opcional..."
                                    value={areaForm.descripcion}
                                    onChange={(e) => setAreaForm({ ...areaForm, descripcion: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Orden de Visualización</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={areaForm.orden}
                                    onChange={(e) => setAreaForm({ ...areaForm, orden: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsAreaModalOpen(false)} className="btn btn-secondary flex-1" disabled={submitting}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (currentArea ? 'Guardar' : 'Crear')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Mesa */}
            {isTableModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {currentTable ? 'Editar Mesa' : 'Nueva Mesa'}
                            </h2>
                            <button onClick={() => setIsTableModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleTableSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Número o Nombre de Mesa</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    placeholder="Ej. Mesa 1 o M-01"
                                    value={tableForm.numero}
                                    onChange={(e) => setTableForm({ ...tableForm, numero: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                                <select
                                    className="input"
                                    required
                                    value={tableForm.areaId}
                                    onChange={(e) => setTableForm({ ...tableForm, areaId: e.target.value })}
                                >
                                    <option value="" disabled>Selecciona un área</option>
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id}>{area.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (Personas)</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    className="input"
                                    value={tableForm.capacidad}
                                    onChange={(e) => setTableForm({ ...tableForm, capacidad: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsTableModalOpen(false)} className="btn btn-secondary flex-1" disabled={submitting}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (currentTable ? 'Guardar' : 'Crear')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
