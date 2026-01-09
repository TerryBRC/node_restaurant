# Restaurant Management System - Backend

Sistema de gestión de restaurante con Node.js, Express y MySQL.

## Requisitos

- Node.js 16+ 
- MySQL 5.7+
- npm o yarn

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de MySQL y configuración.

3. Crear base de datos MySQL:
```sql
CREATE DATABASE restaurant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Iniciar servidor (creará las tablas automáticamente):
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
backend/
├── models/           # Modelos de Sequelize
├── routes/           # Rutas de la API
├── middleware/       # Middleware (auth, errores)
├── uploads/          # Archivos subidos (logos)
├── server.js         # Punto de entrada
├── package.json
└── .env.example      # Plantilla de variables de entorno
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

### Usuarios (Admin)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Desactivar usuario

### Configuración (Admin)
- `GET /api/config` - Obtener configuración
- `PUT /api/config` - Actualizar configuración
- `POST /api/config/logo` - Subir logo

### Áreas
- `GET /api/areas` - Listar áreas
- `POST /api/areas` - Crear área (Admin)
- `PUT /api/areas/:id` - Actualizar área (Admin)
- `DELETE /api/areas/:id` - Eliminar área (Admin)

### Mesas
- `GET /api/tables` - Listar mesas
- `POST /api/tables` - Crear mesa (Admin)
- `PUT /api/tables/:id` - Actualizar mesa (Admin)
- `DELETE /api/tables/:id` - Eliminar mesa (Admin)

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/categorias` - Listar categorías
- `POST /api/products` - Crear producto (Admin)
- `PUT /api/products/:id` - Actualizar producto (Admin)
- `DELETE /api/products/:id` - Eliminar producto (Admin)

### Órdenes
- `GET /api/orders` - Listar órdenes
- `POST /api/orders` - Crear orden
- `POST /api/orders/:id/items` - Agregar items
- `POST /api/orders/:id/enviar-cocina` - Enviar a cocina
- `POST /api/orders/:id/transferir` - Transferir mesa
- `POST /api/orders/items/:itemId/cancelar` - Cancelar item

### Caja
- `GET /api/cash-register/actual` - Caja actual
- `POST /api/cash-register/abrir` - Abrir caja
- `POST /api/cash-register/cerrar` - Cerrar caja
- `GET /api/cash-register/historial` - Historial

### Pagos
- `POST /api/payments` - Procesar pago
- `POST /api/payments/cerrar-mesa` - Cerrar mesa
- `GET /api/payments/orden/:ordenId` - Pagos de orden

### Reportes
- `GET /api/reports/ventas` - Reporte de ventas
- `GET /api/reports/cierre-caja/:cajaId` - Reporte de cierre
- `GET /api/reports/cierres-dia` - Cierres del día
- `GET /api/reports/meseros` - Ranking de meseros

### Impresión
- `POST /api/print/cocina/:ordenId` - Imprimir orden cocina
- `POST /api/print/ticket/:ordenId` - Imprimir ticket
- `POST /api/print/cancelacion` - Imprimir cancelación

## Roles de Usuario

- **admin**: Acceso completo
- **cajero**: Gestión de pagos, cajas y reportes
- **mesero**: Gestión de órdenes y mesas

## Socket.io Eventos

- `nueva-orden` - Nueva orden creada
- `orden-actualizada` - Orden modificada
- `items-cocina` - Items enviados a cocina
- `mesa-liberada` - Mesa disponible
- `orden-transferida` - Orden transferida
- `pago-procesado` - Pago realizado
- `item-cancelado` - Item cancelado
- `mesa-cerrada` - Mesa cerrada

## Configuración de Impresora

Para impresora USB, configurar en `.env`:
```
PRINTER_INTERFACE=usb
PRINTER_VENDOR_ID=0x04b8
PRINTER_PRODUCT_ID=0x0e15
```

Para impresora de red:
```
PRINTER_INTERFACE=tcp
PRINTER_IP=192.168.1.100
PRINTER_PORT=9100
```

## Usuarios de Prueba

Para crear usuarios de prueba automáticamente, ejecutar:

```bash
npm run seed:users
```

Este comando creará los siguientes usuarios:

| Rol     | Usuario | Contraseña  |
|---------|---------|-------------|
| Admin   | admin   | admin123    |
| Cajero  | cajero  | cajero123   |
| Mesero  | mesero  | mesero123   |

**Nota:** El script verificará si ya existen usuarios en la base de datos antes de crear nuevos.


## Licencia

MIT
