# 🏪 Sistema de Gestión Integral para Peluquería

Una aplicación web completa para gestionar todos los aspectos de una peluquería moderna, desde las reservas de clientes hasta la administración interna completa.

## 🚀 Características Principales

### 🎨 **Interfaz de Cliente**
- **Reserva de Citas Online**: Sistema intuitivo paso a paso
- **Catálogo de Servicios**: Cortes, tintes, tratamientos, barba
- **Selección de Peluquero**: Andrés, Alejandro, Adrián
- **Confirmación Inmediata**: Con todos los detalles de la cita

### 🔧 **Panel de Administración Completo**

#### 📊 **Dashboard Principal**
- **Métricas en Tiempo Real**:
  - Reservas del día actual
  - Ingresos diarios
  - Gastos mensuales
  - Productos con bajo stock
  - Empleados activos
  - Ganancias del mes
- **Alertas del Sistema**: Notificaciones importantes
- **Resumen Visual**: Tarjetas informativas con iconos

#### 📅 **Gestión de Reservas**
- Listado completo de todas las citas
- Estados: Confirmada, Cancelada, Completada
- Información del cliente y contacto
- Gestión de horarios y disponibilidad
- Cancelación y edición de reservas

#### 🏢 **Gestión de Proveedores**
- **Registro Completo**:
  - Datos de contacto
  - Categorías de productos/servicios
  - Historial de compras
- **Funciones**: Crear, editar, eliminar proveedores
- **Organización**: Por categorías (productos, servicios, etc.)

#### 💰 **Control de Gastos**
- **Registro Detallado**:
  - Concepto y categoría del gasto
  - Monto y fecha
  - Método de pago
  - Proveedor asociado
- **Categorías**: Productos, sueldos, mantenimiento, servicios
- **Reportes**: Gastos por mes y categoría

#### 📦 **Gestión de Inventario**
- **Control de Stock**:
  - Stock actual vs. stock mínimo
  - Alertas de productos bajo mínimo
  - Precios de compra y venta
- **Categorías**: Shampoos, tintes, herramientas, etc.
- **Proveedores**: Vinculación con proveedores
- **Rentabilidad**: Cálculo automático de márgenes

#### 👥 **Gestión de Empleados**
- **Información Personal**:
  - Datos de contacto completos
  - Puesto y responsabilidades
  - Salario base
- **Estados**: Activo, inactivo
- **Comisiones**: Porcentajes por servicios
- **Horarios**: Gestión de turnos

## 🛠 **Tecnologías Utilizadas**

### **Backend (FastAPI)**
- **Framework**: FastAPI (Python)
- **Base de Datos**: MongoDB
- **APIs RESTful**: Endpoints completos para todas las funciones
- **Validación**: Pydantic models
- **CORS**: Configurado para desarrollo

### **Frontend (React)**
- **Framework**: React 18+ con Hooks
- **Routing**: React Router DOM
- **Estilos**: Tailwind CSS
- **Componentes**: Funcionales con estado
- **Responsive**: Diseño adaptativo

### **Características Técnicas**
- **Arquitectura**: Separación frontend/backend
- **API REST**: Comunicación JSON
- **Tiempo Real**: Actualizaciones dinámicas
- **Escalable**: Estructura modular
- **Segura**: Validaciones en backend

## 📁 **Estructura del Proyecto**

```
pelu/
├── backend/
│   ├── server.py          # Servidor FastAPI principal
│   ├── requirements.txt   # Dependencias Python
│   └── README.md         # Documentación backend
├── frontend/
│   ├── src/
│   │   ├── App.js                    # Componente principal
│   │   ├── ClientReservation.js     # Interfaz cliente
│   │   ├── AdminDashboard.js        # Panel admin básico
│   │   └── AdminDashboardComplete.js # Panel admin completo
│   ├── public/
│   │   └── index.html    # HTML principal
│   ├── package.json      # Dependencias Node.js
│   └── README.md        # Documentación frontend
├── demo.html            # Demo independiente
└── README.md           # Este archivo
```

## 🚀 **Instalación y Ejecución**

### **Requisitos Previos**
- Python 3.8+
- Node.js 16+
- MongoDB (local o cloud)

### **1. Backend (FastAPI)**

```bash
cd backend
pip install -r requirements.txt
python server.py
```

El servidor estará disponible en: `http://localhost:8001`

### **2. Frontend (React)**

```bash
cd frontend
npm install
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

### **3. Demo Independiente**

Abre directamente el archivo `demo.html` en tu navegador para ver una versión de demostración con datos de ejemplo.

## 📱 **Navegación de la Aplicación**

### **Rutas Principales**
- `/` - Interfaz de cliente (reservas)
- `/admin` - Panel de administración

### **Tabs del Panel Admin**
- **📊 Dashboard** - Resumen y métricas
- **📅 Reservas** - Gestión de citas
- **🏢 Proveedores** - Gestión de proveedores
- **💰 Gastos** - Control financiero
- **📦 Inventario** - Control de stock
- **👥 Empleados** - Gestión de personal

## 🔄 **API Endpoints**

### **Reservas**
- `GET /api/reservas` - Listar reservas
- `POST /api/reservas` - Crear reserva
- `DELETE /api/reservas/{id}` - Cancelar reserva

### **Proveedores**
- `GET /api/proveedores` - Listar proveedores
- `POST /api/proveedores` - Crear proveedor
- `PUT /api/proveedores/{id}` - Actualizar proveedor
- `DELETE /api/proveedores/{id}` - Eliminar proveedor

### **Gastos**
- `GET /api/gastos` - Listar gastos
- `POST /api/gastos` - Registrar gasto
- `DELETE /api/gastos/{id}` - Eliminar gasto

### **Inventario**
- `GET /api/inventario` - Listar productos
- `POST /api/inventario` - Añadir producto
- `PUT /api/inventario/{id}` - Actualizar producto
- `DELETE /api/inventario/{id}` - Eliminar producto

### **Empleados**
- `GET /api/empleados` - Listar empleados
- `POST /api/empleados` - Registrar empleado
- `PUT /api/empleados/{id}` - Actualizar empleado
- `DELETE /api/empleados/{id}` - Dar de baja

### **Estadísticas**
- `GET /api/estadisticas/resumen` - Métricas generales

## 🎯 **Funcionalidades Destacadas**

### **Para Clientes**
- ✅ Reserva intuitiva paso a paso
- ✅ Selección de servicios con precios
- ✅ Elección de peluquero preferido
- ✅ Calendario de disponibilidad
- ✅ Confirmación inmediata

### **Para Administradores**
- ✅ Dashboard con métricas clave
- ✅ Gestión completa de reservas
- ✅ Control de proveedores y gastos
- ✅ Inventario con alertas de stock
- ✅ Gestión de empleados y nóminas
- ✅ Reportes financieros automáticos

## 🔮 **Próximas Mejoras**

### **Funcionalidades Planeadas**
- 🔐 **Autenticación**: Login seguro para admin
- 📧 **Notificaciones**: Email/SMS automáticos
- 📊 **Reportes Avanzados**: Gráficos y estadísticas
- 💳 **Pagos Online**: Integración con pasarelas
- 📱 **App Móvil**: React Native
- 🔔 **Recordatorios**: Notificaciones de citas
- 📈 **Analytics**: Métricas de negocio avanzadas

### **Mejoras Técnicas**
- 🔒 **Seguridad**: JWT, encriptación
- 🚀 **Performance**: Caché, optimizaciones
- 📱 **PWA**: Progressive Web App
- 🌐 **Multiidioma**: Soporte internacional
- ☁️ **Cloud**: Deploy automático

## 👨‍💻 **Soporte y Desarrollo**

Este sistema está diseñado para ser:
- **Escalable**: Fácil agregar nuevas funciones
- **Mantenible**: Código limpio y documentado
- **Extensible**: Arquitectura modular
- **Moderno**: Tecnologías actuales y mejores prácticas

## 📞 **Datos de la Peluquería**

### **Equipo de Peluqueros**
- 👨‍🦲 **Andrés** - Peluquero Senior
- ✂️ **Alejandro** - Especialista en Cortes
- 💇‍♂️ **Adrián** - Experto en Color

### **Servicios Disponibles**
- **Corte de Cabello**: 15€ - 25€
- **Arreglo de Barba**: 10€ - 20€
- **Tinte**: 45€
- **Mechas**: 60€
- **Peinados**: 20€

### **Horarios**
- **Lunes a Viernes**: 10:00 - 19:00
- **Sábados**: 10:00 - 14:00
- **Domingos**: Cerrado

---

**🏪 Peluquería Deluxe - Tu estilo, nuestra pasión**

*Sistema desarrollado con las mejores prácticas de desarrollo web moderno*