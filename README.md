# Sistema de Gestión de Restaurante

Sistema completo de gestión para restaurantes con frontend React y backend Node.js/Express/MySQL.

## 🚀 Características Principales

### Gestión de Usuarios
- **3 Roles**: Administradores, Cajeros y Meseros
- Autenticación JWT
- Control de acceso basado en roles

### Gestión de Mesas
- Organización por áreas (Barra, Comedor, Terraza, etc.)
- Estados: Disponible, Ocupada, Reservada
- Transferencia de órdenes entre mesas
- Cierre de mesa con motivos registrados

### Gestión de Órdenes
- Crear y modificar órdenes
- Agregar/eliminar productos
- Envío a cocina con impresión térmica
- Cancelación de items con motivos
- División de cuenta (múltiples órdenes en misma mesa)
- Notas especiales por producto

### Sistema de Pagos
- Pagos completos y parciales
- División de cuenta
- Múltiples métodos: Efectivo, Tarjeta, Transferencia
- Integración con caja registradora

### Caja Registradora
- Apertura obligatoria antes de operar
- Múltiples cierres en el día
- Cálculo automático de diferencias
- Totales por método de pago

### Impresión Térmica
- Órdenes para cocina (ESC/POS)
- Tickets de consumo
- Cancelaciones
- Compatible con impresoras USB y red

### Reportes
- Ventas por período
- Cierres de caja
- Productos más vendidos
- Ranking de meseros

### Tiempo Real
- Actualización automática de estados
- Socket.io para sincronización
- Notificaciones de eventos

## 📁 Estructura del Proyecto

```
shadow-kilonova/
├── backend/                 # API Node.js/Express
│   ├── models/             # Modelos Sequelize
│   ├── routes/             # Rutas de la API
│   ├── middleware/         # Middleware (auth, errores)
│   ├── uploads/            # Archivos subidos
│   ├── server.js           # Punto de entrada
│   ├── package.json
│   └── .env.example
│
└── frontend/               # Aplicación React
    ├── src/
    │   ├── pages/          # Páginas de la aplicación
    │   ├── components/     # Componentes reutilizables
    │   ├── services/       # API y Socket.io
    │   ├── context/        # Contextos de React
    │   ├── App.jsx         # Componente principal
    │   └── main.jsx        # Punto de entrada
    ├── package.json
    └── vite.config.js
```

## 🛠️ Tecnologías

### Backend
- **Node.js** + **Express.js** - Framework web
- **MySQL** - Base de datos
- **Sequelize** - ORM
- **JWT** - Autenticación
- **Socket.io** - Tiempo real
- **node-thermal-printer** - Impresión térmica ESC/POS

### Frontend
- **React 19** - Framework UI
- **Vite** - Build tool
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **Socket.io Client** - Tiempo real
- **Lucide React** - Iconos

## 📦 Instalación

### Requisitos Previos
- Node.js 16+
- MySQL 5.7+
- npm o yarn

### 1. Clonar el Repositorio
```bash
cd shadow-kilonova
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=restaurant_db
DB_USER=root
DB_PASSWORD=tu_password
JWT_SECRET=tu_clave_secreta_muy_segura
```

Crear base de datos:
```sql
CREATE DATABASE restaurant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Iniciar servidor (creará las tablas automáticamente):
```bash
npm run dev
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 👤 Usuarios Iniciales

Después de iniciar el backend, crear un usuario admin manualmente:

```javascript
// Ejecutar en consola de Node o crear script
import { User } from './models/index.js';

await User.create({
  nombre: 'Administrador',
  usuario: 'admin',
  password: 'admin123',
  rol: 'admin'
});

await User.create({
  nombre: 'Cajero Principal',
  usuario: 'cajero',
  password: 'cajero123',
  rol: 'cajero'
});

await User.create({
  nombre: 'Mesero 1',
  usuario: 'mesero',
  password: 'mesero123',
  rol: 'mesero'
});
```

## 🖨️ Configuración de Impresora

### Impresora USB
Editar `.env`:
```env
PRINTER_INTERFACE=usb
PRINTER_VENDOR_ID=0x04b8
PRINTER_PRODUCT_ID=0x0e15
```

### Impresora de Red
Editar `.env`:
```env
PRINTER_INTERFACE=tcp
PRINTER_IP=192.168.1.100
PRINTER_PORT=9100
```

## 📱 Uso del Sistema

### Como Administrador
1. Iniciar sesión con usuario `admin`
2. Configurar restaurante (nombre, logo, porcentaje de servicio)
3. Crear usuarios (cajeros y meseros)
4. Configurar áreas y mesas
5. Agregar productos al menú

### Como Cajero
1. Iniciar sesión
2. **Abrir caja** (obligatorio antes de operar)
3. Procesar pagos de órdenes
4. Cerrar mesa cuando sea necesario
5. Cerrar caja al final del turno
6. Generar reportes

### Como Mesero
1. Iniciar sesión
2. Verificar que haya caja abierta
3. Seleccionar mesa disponible
4. Crear orden y agregar productos
5. Enviar a cocina (se imprime automáticamente)
6. Transferir órdenes si es necesario
7. Cancelar items con motivo si es requerido

## 🔄 Flujo de Trabajo Típico

1. **Cajero abre caja** con monto inicial
2. **Mesero selecciona mesa** y crea orden
3. **Mesero agrega productos** a la orden
4. **Mesero envía a cocina** → Se imprime en cocina
5. **Cocina prepara** los productos
6. **Mesero entrega** al cliente
7. **Cliente solicita cuenta** → Mesero notifica a cajero
8. **Cajero procesa pago** (completo o parcial)
9. **Mesa se libera** automáticamente al pagar completo
10. **Cajero cierra caja** al final del día

## 📊 Características Avanzadas

### División de Cuenta
- Crear múltiples órdenes en la misma mesa
- Cada orden se paga por separado
- Útil para grupos que pagan individual

### Pagos Parciales
- Permitir pagos en partes
- Registrar cada pago
- Calcular pendiente automáticamente

### Transferencia de Mesa
- Mover orden completa a otra mesa
- Actualiza estados automáticamente
- Registra el cambio

### Cancelaciones
- Cancelar items individuales o completos
- Registrar motivo obligatorio
- Imprimir notificación a cocina
- Recalcular totales automáticamente

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT
- Tokens con expiración
- Validación de roles en cada endpoint
- Protección contra inyección SQL (Sequelize)

## 🌐 API Endpoints

Ver documentación completa en [backend/README.md](backend/README.md)

## 🐛 Solución de Problemas

### Error de conexión a MySQL
- Verificar que MySQL esté corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos exista

### Error de impresora
- Verificar conexión física
- Verificar configuración en `.env`
- Probar con comando de prueba

### Error de Socket.io
- Verificar que el backend esté corriendo
- Verificar CORS en servidor
- Verificar puerto en frontend

## 📝 Próximas Características

- [ ] Reservaciones de mesas
- [ ] Inventario de productos
- [ ] Propinas por mesero
- [ ] Descuentos y promociones
- [ ] Integración con delivery
- [ ] App móvil para meseros
- [ ] Dashboard de métricas en tiempo real

## 🤝 Contribuir

Este es un proyecto de demostración. Para producción, considerar:
- Agregar tests unitarios e integración
- Implementar CI/CD
- Agregar logs estructurados
- Implementar rate limiting
- Agregar monitoreo y alertas
- Implementar backups automáticos

## 📄 Licencia

MIT

## 👨‍💻 Autor

Sistema desarrollado para gestión de restaurantes.

---

**Nota**: Este sistema está diseñado para uso en restaurantes pequeños y medianos. Para restaurantes grandes o cadenas, considerar escalabilidad adicional y características enterprise.
