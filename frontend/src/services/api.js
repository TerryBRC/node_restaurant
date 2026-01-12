import axios from 'axios';

// Crear instancia de axios
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Servicios de autenticación
export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    verify: () => api.get('/auth/verify'),
};

// Servicios de usuarios
export const userService = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

// Servicios de configuración
export const configService = {
    get: () => api.get('/config'),
    update: (data) => api.put('/config', data),
    uploadLogo: (formData) => api.post('/config/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Servicios de áreas
export const areaService = {
    getAll: () => api.get('/areas'),
    getById: (id) => api.get(`/areas/${id}`),
    create: (data) => api.post('/areas', data),
    update: (id, data) => api.put(`/areas/${id}`, data),
    delete: (id) => api.delete(`/areas/${id}`),
};

// Servicios de mesas
export const tableService = {
    getAll: (areaId) => api.get('/tables', { params: { areaId } }),
    getById: (id) => api.get(`/tables/${id}`),
    create: (data) => api.post('/tables', data),
    update: (id, data) => api.put(`/tables/${id}`, data),
    delete: (id) => api.delete(`/tables/${id}`),
};

// Servicios de productos
export const productService = {
    getAll: (params) => api.get('/products', { params }),
    getCategories: () => api.get('/products/categorias'),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

// Servicios de órdenes
export const orderService = {
    getAll: (params) => api.get('/orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    addItems: (id, items) => api.post(`/orders/${id}/items`, { items }),
    sendToKitchen: (id) => api.post(`/orders/${id}/enviar-cocina`),
    transfer: (id, nuevaMesaId) => api.post(`/orders/${id}/transferir`, { nuevaMesaId }),
    cancelItem: (itemId, data) => api.post(`/orders/items/${itemId}/cancelar`, data),
};

// Servicios de caja
export const cashRegisterService = {
    getCurrent: () => api.get('/cash-register/actual'),
    getHistory: (params) => api.get('/cash-register/historial', { params }),
    getById: (id) => api.get(`/cash-register/${id}`),
    open: (data) => api.post('/cash-register/abrir', data),
    close: (data) => api.post('/cash-register/cerrar', data),
};

// Servicios de pagos
export const paymentService = {
    process: (data) => api.post('/payments', data),
    closeTable: (data) => api.post('/payments/cerrar-mesa', data),
    getByOrder: (ordenId) => api.get(`/payments/orden/${ordenId}`),
};

// Servicios de reportes
export const reportService = {
    getSales: (params) => api.get('/reports/ventas', { params }),
    getCashRegisterClosure: (cajaId) => api.get(`/reports/cierre-caja/${cajaId}`),
    getDailyClosures: (params) => api.get('/reports/cierres-dia', { params }),
    getWaiters: (params) => api.get('/reports/meseros', { params }),
};

// Servicios de impresión
export const printService = {
    kitchen: (ordenId) => api.post(`/print/cocina/${ordenId}`),
    ticket: (ordenId) => api.post(`/print/ticket/${ordenId}`),
    cancellation: (data) => api.post('/print/cancelacion', data),
};

// Servicios de gestión de impresoras
export const printerService = {
    getAll: () => api.get('/printers'),
    getById: (id) => api.get(`/printers/${id}`),
    create: (data) => api.post('/printers', data),
    update: (id, data) => api.put(`/printers/${id}`, data),
    delete: (id) => api.delete(`/printers/${id}`),
};

export default api;
