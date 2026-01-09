import { useState, useEffect, useRef } from 'react';
import { configService } from '../../services/api';
import {
    Store,
    Upload,
    Percent,
    DollarSign,
    Clock,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Image as ImageIcon,
    X
} from 'lucide-react';

export default function RestaurantConfig() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        nombreRestaurante: '',
        porcentajeServicio: '',
        servicioActivo: true,
        moneda: 'MXN',
        timezone: 'America/Mexico_City'
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await configService.get();
            const data = response.data;
            setConfig(data);
            setFormData({
                nombreRestaurante: data.nombreRestaurante || '',
                porcentajeServicio: data.porcentajeServicio || '0',
                servicioActivo: data.servicioActivo ?? true,
                moneda: data.moneda || 'MXN',
                timezone: data.timezone || 'America/Mexico_City'
            });
            setError(null);
        } catch (err) {
            setError('Error al cargar la configuración. Por favor, intenta de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(null);
        setError(null);
        try {
            await configService.update(formData);
            setSuccess('Configuración guardada exitosamente.');
            setTimeout(() => setSuccess(null), 3000);
            fetchConfig();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen es demasiado grande. Máximo 5MB.');
            return;
        }

        const logoFormData = new FormData();
        logoFormData.append('logo', file);

        setUploadingLogo(true);
        setError(null);
        try {
            const response = await configService.uploadLogo(logoFormData);
            setConfig({ ...config, logo: response.data.logo });
            setSuccess('Logo actualizado exitosamente.');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al subir el logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Configuración del Restaurante</h1>
                    <p className="text-gray-600">Personaliza la información y ajustes generales del sistema.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p>{success}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sección Logo */}
                    <div className="lg:col-span-1">
                        <div className="card text-center sticky top-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo del Restaurante</h3>
                            <div className="group relative w-48 h-48 mx-auto mb-6 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all hover:border-primary-400">
                                {config?.logo ? (
                                    <>
                                        <img
                                            src={config.logo}
                                            alt="Logo Restaurante"
                                            className="w-full h-full object-contain p-2"
                                            onError={(e) => {
                                                e.target.src = '';
                                                e.target.parentElement.classList.add('bg-red-50');
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                                                disabled={uploadingLogo}
                                            >
                                                {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                Cambiar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-400 flex flex-col items-center">
                                        {uploadingLogo ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                                <p className="text-xs px-4">Haz clic para subir un logo</p>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="mt-4 text-primary-600 text-sm font-semibold hover:underline"
                                                >
                                                    Seleccionar archivo
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                Recomendado: PNG con fondo transparente. Máximo 5MB.
                            </p>
                        </div>
                    </div>

                    {/* Formulario de Configuración */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card">
                            <form onSubmit={handleSaveConfig} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Store className="w-4 h-4 text-gray-400" />
                                            Nombre del Restaurante
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="input"
                                            placeholder="Nombre comercial"
                                            value={formData.nombreRestaurante}
                                            onChange={(e) => setFormData({ ...formData, nombreRestaurante: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Percent className="w-4 h-4 text-gray-400" />
                                            Porcentaje de Servicio (%)
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                required
                                                className="input flex-1"
                                                placeholder="Ej. 10"
                                                value={formData.porcentajeServicio}
                                                onChange={(e) => setFormData({ ...formData, porcentajeServicio: e.target.value })}
                                            />
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.servicioActivo}
                                                    onChange={(e) => setFormData({ ...formData, servicioActivo: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-600">{formData.servicioActivo ? 'Activo' : 'Inactivo'}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                            Símbolo de Moneda
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Símbolo (ej. $, MXN, USD)"
                                            value={formData.moneda}
                                            onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            Zona Horaria
                                        </label>
                                        <select
                                            className="input"
                                            value={formData.timezone}
                                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                        >
                                            <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                                            <option value="America/Monterrey">Monterrey</option>
                                            <option value="America/Tijuana">Tijuana</option>
                                            <option value="America/New_York">New York (GMT-5)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex items-center gap-2 px-8"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Guardando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                <span>Guardar Configuración</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Card de información adicional */}
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <h4 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Sobre el Porcentaje de Servicio
                            </h4>
                            <p className="text-blue-700 text-sm leading-relaxed">
                                El porcentaje de servicio se calculará automáticamente sobre el subtotal de cada orden cuando el estado esté "Activo". Puedes activarlo o desactivarlo según sea necesario (por ejemplo, para eventos especiales o días feriados).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
