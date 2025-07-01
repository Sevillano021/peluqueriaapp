# 🚀 Guía de Despliegue en GitHub Pages

## 📋 **Pasos para Lanzar la Demo**

### **1. 📤 Subir a GitHub (Si no lo has hecho)**

Si aún no tienes el proyecto en GitHub:

```bash
# Crear repositorio en GitHub.com primero
# Luego conectar tu proyecto local:

git remote add origin https://github.com/TU-USUARIO/NOMBRE-REPO.git
git branch -M main
git push -u origin main
```

### **2. 🌐 Configurar GitHub Pages**

1. **Ve a tu repositorio en GitHub.com**
2. **Click en "Settings"** (última pestaña)
3. **Scroll down hasta "Pages"** (menú lateral izquierdo)
4. **Configura las opciones**:
   - **Source**: "Deploy from a branch"
   - **Branch**: "main"
   - **Folder**: "/ (root)"
5. **Click "Save"**

### **3. ⏰ Esperar el Deploy**

- GitHub tardará **2-5 minutos** en procesar
- Recibirás una notificación cuando esté listo
- Tu demo estará en: `https://TU-USUARIO.github.io/NOMBRE-REPO`

### **4. 📱 Acceder a la Demo**

**URL Principal**: `https://tu-usuario.github.io/nombre-repo`

**Opciones de Acceso**:
- **`/index.html`** - Demo principal optimizada
- **`/demo.html`** - Demo alternativa (mismo contenido)

## 🎯 **Características de la Demo Online**

### **🎨 Interfaz de Cliente**
- ✅ Diseño responsive y moderno
- ✅ Navegación fluida
- ✅ Catálogo de servicios con precios
- ✅ Información de contacto y horarios
- ✅ Botón directo al panel admin

### **🔧 Panel de Administración**
- ✅ **Dashboard** con métricas en tiempo real
- ✅ **Reservas** con gestión completa
- ✅ **Proveedores** con información detallada
- ✅ **Gastos** con control financiero
- ✅ **Inventario** con alertas de stock
- ✅ **Empleados** con datos completos

### **📊 Datos de Demostración**
- 📅 **12 reservas** del día actual
- 🏢 **3 proveedores** con información completa
- 💰 **Gastos** categorizados por mes
- 📦 **4 productos** en inventario con alertas
- 👥 **3 empleados** activos con detalles

## 🛠 **Personalización**

### **Cambiar Datos de la Peluquería**
Edita el archivo `index.html` y modifica:

```javascript
// Busca estas líneas y personaliza:
<h1>Peluquería Deluxe</h1>  // Cambia el nombre
<p>Tu estilo, nuestra pasión</p>  // Cambia el slogan

// Peluqueros (línea ~150)
<span>👨‍🦲 Andrés</span>  // Cambia nombres
<span>✂️ Alejandro</span>
<span>💇‍♂️ Adrián</span>

// Servicios y precios (línea ~200)
{ nombre: "Corte de cabello", precio: 15, duracion: 30 }
```

### **Cambiar Colores y Estilo**
```javascript
// En el archivo index.html, busca:
tailwind.config = {
    theme: {
        extend: {
            colors: {
                'salon-blue': '#3b82f6',     // Color principal
                'salon-purple': '#8b5cf6'    // Color secundario
            }
        }
    }
}
```

## 🔗 **URLs de Ejemplo**

Una vez configurado, tendrás estas URLs:

- **🏠 Principal**: `https://usuario.github.io/repo`
- **📱 Cliente**: `https://usuario.github.io/repo/index.html`
- **🔧 Admin**: `https://usuario.github.io/repo/index.html` (botón "Panel Admin")

## 📈 **Ventajas de GitHub Pages**

- ✅ **Gratis** y sin límites de tráfico
- ✅ **HTTPS** automático y seguro
- ✅ **CDN** global para velocidad
- ✅ **Custom domains** disponibles
- ✅ **Actualizaciones automáticas** con cada push
- ✅ **Sin servidor** necesario

## 🚀 **Actualizaciones Futuras**

Para actualizar la demo:

```bash
# Hacer cambios en los archivos
git add .
git commit -m "Actualización: descripción del cambio"
git push origin main

# GitHub Pages se actualiza automáticamente en 2-5 minutos
```

## 🎯 **Promoción de la Demo**

### **Para Clientes**
- "Prueba nuestro sistema de reservas online"
- "Reserva tu cita desde cualquier dispositivo"

### **Para Desarrolladores**
- "Sistema completo de gestión empresarial"
- "Demo funcional con React + FastAPI"
- "Código abierto y personalizable"

---

**¡Tu sistema de gestión para peluquería ya está online! 🎉**
