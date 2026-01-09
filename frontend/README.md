# Restaurant Frontend

Aplicación React para el sistema de gestión de restaurante.

## Instalación

```bash
npm install
npm run dev
```

## Estructura

```
src/
├── pages/              # Páginas de la aplicación
│   ├── Login.jsx      # Página de inicio de sesión
│   ├── admin/         # Páginas de administrador
│   ├── waiter/        # Páginas de mesero
│   └── cashier/       # Páginas de cajero
├── components/         # Componentes reutilizables (por implementar)
├── services/          # Servicios
│   ├── api.js         # Cliente API con Axios
│   └── socket.js      # Cliente Socket.io
├── context/           # Contextos de React
│   └── AuthContext.jsx # Contexto de autenticación
├── App.jsx            # Componente principal con rutas
├── main.jsx           # Punto de entrada
└── index.css          # Estilos globales con Tailwind
```

## Rutas

### Públicas
- `/login` - Inicio de sesión

### Administrador
- `/admin/dashboard` - Panel principal
- `/admin/configuracion` - Configuración del restaurante
- `/admin/usuarios` - Gestión de usuarios
- `/admin/menu` - Gestión de menú
- `/admin/areas-mesas` - Configuración de áreas y mesas

### Mesero
- `/mesero/mesas` - Vista de mesas
- `/mesero/orden/:mesaId` - Gestión de órdenes

### Cajero
- `/cajero/caja` - Caja registradora
- `/cajero/pago/:ordenId` - Procesar pago
- `/cajero/reportes` - Reportes

## Componentes Principales

### AuthContext
Maneja autenticación, roles y sesión del usuario.

### API Service
Cliente Axios configurado con interceptores para JWT.

### Socket Service
Cliente Socket.io para actualizaciones en tiempo real.

## Estilos

Usando Tailwind CSS con clases personalizadas:
- `.btn` - Botones
- `.input` - Campos de entrada
- `.card` - Tarjetas
- `.badge` - Etiquetas
- `.mesa-disponible/ocupada/reservada` - Estados de mesa

## Variables de Entorno

Crear `.env` si es necesario:
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## Desarrollo

El proyecto usa Vite con proxy configurado para `/api` y `/uploads`.

## Estado Actual

✅ Estructura base completa
✅ Autenticación y rutas protegidas
✅ Servicios de API y Socket.io
✅ Login funcional
✅ Dashboard de admin

🚧 Páginas en desarrollo:
- Configuración de restaurante
- Gestión de usuarios
- Gestión de menú
- Áreas y mesas
- Vista de mesas (mesero)
- Gestión de órdenes
- Caja registradora
- Procesamiento de pagos
- Reportes

## Próximos Pasos

1. Implementar páginas de administración
2. Implementar vista de mesas para meseros
3. Implementar gestión de órdenes
4. Implementar procesamiento de pagos
5. Implementar reportes
6. Agregar componentes reutilizables
7. Agregar validación de formularios
8. Agregar notificaciones toast
9. Agregar modales para confirmaciones
10. Optimizar para móviles
