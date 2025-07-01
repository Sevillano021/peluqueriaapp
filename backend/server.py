from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from pymongo import MongoClient
from datetime import datetime, timedelta
from typing import Optional, List
import os
import uuid
import json

# Configuración de MongoDB
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client.peluqueria
reservas_collection = db.reservas
proveedores_collection = db.proveedores
gastos_collection = db.gastos
inventario_collection = db.inventario
empleados_collection = db.empleados

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class ReservaCreate(BaseModel):
    cliente_nombre: str
    cliente_telefono: str
    cliente_email: Optional[str] = None
    servicio: str
    peluquero: str
    fecha: str  # formato YYYY-MM-DD
    hora: str   # formato HH:MM

class Reserva(BaseModel):
    id: str
    cliente_nombre: str
    cliente_telefono: str
    cliente_email: Optional[str] = None
    servicio: str
    peluquero: str
    fecha: str
    hora: str
    estado: str = "confirmada"
    fecha_creacion: str

# Nuevos modelos para gestión completa
class ProveedorCreate(BaseModel):
    nombre: str
    contacto: str
    telefono: str
    email: Optional[str] = None
    direccion: Optional[str] = None
    categoria: str  # productos, servicios, mantenimiento, etc.

class GastoCreate(BaseModel):
    concepto: str
    categoria: str  # productos, servicios, sueldos, mantenimiento, etc.
    monto: float
    fecha: str
    proveedor_id: Optional[str] = None
    descripcion: Optional[str] = None
    metodo_pago: str  # efectivo, tarjeta, transferencia

class ProductoInventario(BaseModel):
    nombre: str
    categoria: str  # shampoo, tinte, herramientas, etc.
    stock_actual: int
    stock_minimo: int
    precio_compra: float
    precio_venta: Optional[float] = None
    proveedor_id: Optional[str] = None
    fecha_ultima_compra: Optional[str] = None

class EmpleadoCreate(BaseModel):
    nombre: str
    telefono: str
    email: Optional[str] = None
    puesto: str  # peluquero, recepcionista, limpieza
    salario: float
    fecha_ingreso: str
    horario: Optional[str] = None
    comision_porcentaje: Optional[float] = None

# Datos de configuración
PELUQUEROS = ["Andrés", "Alejandro", "Adrián"]
SERVICIOS = [
    {"nombre": "Corte de cabello", "duracion": 30, "precio": 15},
    {"nombre": "Arreglo de barba", "duracion": 20, "precio": 10},
    {"nombre": "Tinte", "duracion": 90, "precio": 45},
    {"nombre": "Corte mujer", "duracion": 45, "precio": 25},
    {"nombre": "Peinado", "duracion": 30, "precio": 20},
    {"nombre": "Mechas", "duracion": 120, "precio": 60}
]

HORARIOS = {
    "lunes": {"inicio": "10:00", "fin": "19:00"},
    "martes": {"inicio": "10:00", "fin": "19:00"},
    "miercoles": {"inicio": "10:00", "fin": "19:00"},
    "jueves": {"inicio": "10:00", "fin": "19:00"},
    "viernes": {"inicio": "10:00", "fin": "19:00"},
    "sabado": {"inicio": "10:00", "fin": "14:00"}
}

def generar_horarios_disponibles(fecha: str, peluquero: str):
    """Genera horarios disponibles para una fecha y peluquero específico"""
    try:
        fecha_obj = datetime.strptime(fecha, "%Y-%m-%d")
        day_name = fecha_obj.strftime("%A").lower()
        
        # Mapear nombres de días al español
        dias_semana = {
            "monday": "lunes",
            "tuesday": "martes", 
            "wednesday": "miercoles",
            "thursday": "jueves",
            "friday": "viernes",
            "saturday": "sabado",
            "sunday": "domingo"
        }
        
        dia_esp = dias_semana.get(day_name)
        
        if dia_esp not in HORARIOS:
            return []
        
        horario = HORARIOS[dia_esp]
        inicio = datetime.strptime(horario["inicio"], "%H:%M")
        fin = datetime.strptime(horario["fin"], "%H:%M")
        
        # Generar slots cada 30 minutos
        horarios = []
        current = inicio
        while current < fin:
            horarios.append(current.strftime("%H:%M"))
            current += timedelta(minutes=30)
        
        # Filtrar horarios ya ocupados
        reservas_existentes = list(reservas_collection.find({
            "fecha": fecha,
            "peluquero": peluquero
        }))
        
        horarios_ocupados = [r["hora"] for r in reservas_existentes]
        horarios_disponibles = [h for h in horarios if h not in horarios_ocupados]
        
        return horarios_disponibles
        
    except Exception as e:
        return []

@app.get("/api/")
async def root():
    return {"message": "API Peluquería funcionando correctamente"}

@app.get("/api/servicios")
async def get_servicios():
    return {"servicios": SERVICIOS}

@app.get("/api/peluqueros")
async def get_peluqueros():
    return {"peluqueros": PELUQUEROS}

@app.get("/api/horarios-disponibles/{fecha}/{peluquero}")
async def get_horarios_disponibles(fecha: str, peluquero: str):
    if peluquero not in PELUQUEROS:
        raise HTTPException(status_code=400, detail="Peluquero no válido")
    
    horarios = generar_horarios_disponibles(fecha, peluquero)
    return {"horarios": horarios}

@app.post("/api/reservas")
async def crear_reserva(reserva: ReservaCreate):
    # Validaciones
    if reserva.peluquero not in PELUQUEROS:
        raise HTTPException(status_code=400, detail="Peluquero no válido")
    
    servicios_validos = [s["nombre"] for s in SERVICIOS]
    if reserva.servicio not in servicios_validos:
        raise HTTPException(status_code=400, detail="Servicio no válido")
    
    # Verificar disponibilidad del horario
    horarios_disponibles = generar_horarios_disponibles(reserva.fecha, reserva.peluquero)
    if reserva.hora not in horarios_disponibles:
        raise HTTPException(status_code=400, detail="Horario no disponible")
    
    # Crear la reserva - solo datos simples sin objetos complejos
    reserva_id = str(uuid.uuid4())
    nueva_reserva = {
        "id": reserva_id,
        "cliente_nombre": str(reserva.cliente_nombre),
        "cliente_telefono": str(reserva.cliente_telefono),
        "cliente_email": str(reserva.cliente_email) if reserva.cliente_email else None,
        "servicio": str(reserva.servicio),
        "peluquero": str(reserva.peluquero),
        "fecha": str(reserva.fecha),
        "hora": str(reserva.hora),
        "estado": "confirmada",
        "fecha_creacion": datetime.now().isoformat()
    }
    
    try:
        # Insertar en MongoDB
        result = reservas_collection.insert_one(nueva_reserva)
        
        if result.inserted_id:
            # Crear respuesta limpia sin ObjectId
            reserva_respuesta = {
                "id": reserva_id,
                "cliente_nombre": nueva_reserva["cliente_nombre"],
                "cliente_telefono": nueva_reserva["cliente_telefono"],
                "cliente_email": nueva_reserva["cliente_email"],
                "servicio": nueva_reserva["servicio"],
                "peluquero": nueva_reserva["peluquero"],
                "fecha": nueva_reserva["fecha"],
                "hora": nueva_reserva["hora"],
                "estado": nueva_reserva["estado"],
                "fecha_creacion": nueva_reserva["fecha_creacion"]
            }
            
            return {
                "message": "Reserva creada exitosamente", 
                "reserva": reserva_respuesta
            }
        else:
            raise HTTPException(status_code=500, detail="Error al crear la reserva")
            
    except Exception as e:
        print(f"Error creating reservation: {str(e)}")
        print(f"Reservation data: {nueva_reserva}")
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {str(e)[:100]}")

@app.get("/api/reservas")
async def get_reservas():
    try:
        reservas = list(reservas_collection.find({}, {"_id": 0}).sort("fecha", 1).sort("hora", 1))
        return {"reservas": reservas}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener reservas: {str(e)}")

@app.get("/api/reservas/{fecha}")
async def get_reservas_fecha(fecha: str):
    try:
        reservas = list(reservas_collection.find({"fecha": fecha}, {"_id": 0}).sort("hora", 1))
        return {"reservas": reservas}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener reservas: {str(e)}")

# ========== ENDPOINTS PARA PROVEEDORES ==========
@app.post("/api/proveedores")
async def crear_proveedor(proveedor: ProveedorCreate):
    proveedor_id = str(uuid.uuid4())
    nuevo_proveedor = {
        "id": proveedor_id,
        "nombre": str(proveedor.nombre),
        "contacto": str(proveedor.contacto),
        "telefono": str(proveedor.telefono),
        "email": str(proveedor.email) if proveedor.email else None,
        "direccion": str(proveedor.direccion) if proveedor.direccion else None,
        "categoria": str(proveedor.categoria),
        "fecha_creacion": datetime.now().isoformat()
    }
    
    try:
        result = proveedores_collection.insert_one(nuevo_proveedor)
        if result.inserted_id:
            proveedor_respuesta = {key: value for key, value in nuevo_proveedor.items()}
            return {"message": "Proveedor creado exitosamente", "proveedor": proveedor_respuesta}
        else:
            raise HTTPException(status_code=500, detail="Error al crear el proveedor")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {str(e)}")

@app.get("/api/proveedores")
async def get_proveedores():
    try:
        proveedores = list(proveedores_collection.find({}, {"_id": 0}).sort("nombre", 1))
        return {"proveedores": proveedores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener proveedores: {str(e)}")

@app.put("/api/proveedores/{proveedor_id}")
async def actualizar_proveedor(proveedor_id: str, proveedor: ProveedorCreate):
    try:
        resultado = proveedores_collection.update_one(
            {"id": proveedor_id},
            {"$set": {
                "nombre": str(proveedor.nombre),
                "contacto": str(proveedor.contacto),
                "telefono": str(proveedor.telefono),
                "email": str(proveedor.email) if proveedor.email else None,
                "direccion": str(proveedor.direccion) if proveedor.direccion else None,
                "categoria": str(proveedor.categoria)
            }}
        )
        
        if resultado.matched_count == 0:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        
        return {"message": "Proveedor actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar proveedor: {str(e)}")

@app.delete("/api/proveedores/{proveedor_id}")
async def eliminar_proveedor(proveedor_id: str):
    try:
        resultado = proveedores_collection.delete_one({"id": proveedor_id})
        
        if resultado.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        
        return {"message": "Proveedor eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar proveedor: {str(e)}")

# ========== ENDPOINTS PARA GASTOS ==========
@app.post("/api/gastos")
async def crear_gasto(gasto: GastoCreate):
    gasto_id = str(uuid.uuid4())
    nuevo_gasto = {
        "id": gasto_id,
        "concepto": str(gasto.concepto),
        "categoria": str(gasto.categoria),
        "monto": float(gasto.monto),
        "fecha": str(gasto.fecha),
        "proveedor_id": str(gasto.proveedor_id) if gasto.proveedor_id else None,
        "descripcion": str(gasto.descripcion) if gasto.descripcion else None,
        "metodo_pago": str(gasto.metodo_pago),
        "fecha_creacion": datetime.now().isoformat()
    }
    
    try:
        result = gastos_collection.insert_one(nuevo_gasto)
        if result.inserted_id:
            gasto_respuesta = {key: value for key, value in nuevo_gasto.items()}
            return {"message": "Gasto registrado exitosamente", "gasto": gasto_respuesta}
        else:
            raise HTTPException(status_code=500, detail="Error al registrar el gasto")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {str(e)}")

@app.get("/api/gastos")
async def get_gastos():
    try:
        gastos = list(gastos_collection.find({}, {"_id": 0}).sort("fecha", -1))
        return {"gastos": gastos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener gastos: {str(e)}")

@app.get("/api/gastos/{mes}")
async def get_gastos_mes(mes: str):
    try:
        # mes formato YYYY-MM
        gastos = list(gastos_collection.find(
            {"fecha": {"$regex": f"^{mes}"}}, 
            {"_id": 0}
        ).sort("fecha", -1))
        return {"gastos": gastos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener gastos del mes: {str(e)}")

@app.delete("/api/gastos/{gasto_id}")
async def eliminar_gasto(gasto_id: str):
    try:
        resultado = gastos_collection.delete_one({"id": gasto_id})
        
        if resultado.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Gasto no encontrado")
        
        return {"message": "Gasto eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar gasto: {str(e)}")

# ========== ENDPOINTS PARA INVENTARIO ==========
@app.post("/api/inventario")
async def crear_producto(producto: ProductoInventario):
    producto_id = str(uuid.uuid4())
    nuevo_producto = {
        "id": producto_id,
        "nombre": str(producto.nombre),
        "categoria": str(producto.categoria),
        "stock_actual": int(producto.stock_actual),
        "stock_minimo": int(producto.stock_minimo),
        "precio_compra": float(producto.precio_compra),
        "precio_venta": float(producto.precio_venta) if producto.precio_venta else None,
        "proveedor_id": str(producto.proveedor_id) if producto.proveedor_id else None,
        "fecha_ultima_compra": str(producto.fecha_ultima_compra) if producto.fecha_ultima_compra else None,
        "fecha_creacion": datetime.now().isoformat()
    }
    
    try:
        result = inventario_collection.insert_one(nuevo_producto)
        if result.inserted_id:
            producto_respuesta = {key: value for key, value in nuevo_producto.items()}
            return {"message": "Producto añadido al inventario", "producto": producto_respuesta}
        else:
            raise HTTPException(status_code=500, detail="Error al añadir producto")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {str(e)}")

@app.get("/api/inventario")
async def get_inventario():
    try:
        productos = list(inventario_collection.find({}, {"_id": 0}).sort("nombre", 1))
        return {"inventario": productos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener inventario: {str(e)}")

@app.get("/api/inventario/bajo-stock")
async def get_productos_bajo_stock():
    try:
        productos = list(inventario_collection.find(
            {"$expr": {"$lte": ["$stock_actual", "$stock_minimo"]}},
            {"_id": 0}
        ).sort("stock_actual", 1))
        return {"productos_bajo_stock": productos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener productos con bajo stock: {str(e)}")

@app.put("/api/inventario/{producto_id}")
async def actualizar_producto(producto_id: str, producto: ProductoInventario):
    try:
        resultado = inventario_collection.update_one(
            {"id": producto_id},
            {"$set": {
                "nombre": str(producto.nombre),
                "categoria": str(producto.categoria),
                "stock_actual": int(producto.stock_actual),
                "stock_minimo": int(producto.stock_minimo),
                "precio_compra": float(producto.precio_compra),
                "precio_venta": float(producto.precio_venta) if producto.precio_venta else None,
                "proveedor_id": str(producto.proveedor_id) if producto.proveedor_id else None
            }}
        )
        
        if resultado.matched_count == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        return {"message": "Producto actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar producto: {str(e)}")

@app.delete("/api/inventario/{producto_id}")
async def eliminar_producto(producto_id: str):
    try:
        resultado = inventario_collection.delete_one({"id": producto_id})
        
        if resultado.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        return {"message": "Producto eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar producto: {str(e)}")

# ========== ENDPOINTS PARA EMPLEADOS ==========
@app.post("/api/empleados")
async def crear_empleado(empleado: EmpleadoCreate):
    empleado_id = str(uuid.uuid4())
    nuevo_empleado = {
        "id": empleado_id,
        "nombre": str(empleado.nombre),
        "telefono": str(empleado.telefono),
        "email": str(empleado.email) if empleado.email else None,
        "puesto": str(empleado.puesto),
        "salario": float(empleado.salario),
        "fecha_ingreso": str(empleado.fecha_ingreso),
        "horario": str(empleado.horario) if empleado.horario else None,
        "comision_porcentaje": float(empleado.comision_porcentaje) if empleado.comision_porcentaje else None,
        "estado": "activo",
        "fecha_creacion": datetime.now().isoformat()
    }
    
    try:
        result = empleados_collection.insert_one(nuevo_empleado)
        if result.inserted_id:
            empleado_respuesta = {key: value for key, value in nuevo_empleado.items()}
            return {"message": "Empleado registrado exitosamente", "empleado": empleado_respuesta}
        else:
            raise HTTPException(status_code=500, detail="Error al registrar empleado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {str(e)}")

@app.get("/api/empleados")
async def get_empleados():
    try:
        empleados = list(empleados_collection.find({}, {"_id": 0}).sort("nombre", 1))
        return {"empleados": empleados}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener empleados: {str(e)}")

@app.put("/api/empleados/{empleado_id}")
async def actualizar_empleado(empleado_id: str, empleado: EmpleadoCreate):
    try:
        resultado = empleados_collection.update_one(
            {"id": empleado_id},
            {"$set": {
                "nombre": str(empleado.nombre),
                "telefono": str(empleado.telefono),
                "email": str(empleado.email) if empleado.email else None,
                "puesto": str(empleado.puesto),
                "salario": float(empleado.salario),
                "fecha_ingreso": str(empleado.fecha_ingreso),
                "horario": str(empleado.horario) if empleado.horario else None,
                "comision_porcentaje": float(empleado.comision_porcentaje) if empleado.comision_porcentaje else None
            }}
        )
        
        if resultado.matched_count == 0:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
        
        return {"message": "Empleado actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar empleado: {str(e)}")

@app.delete("/api/empleados/{empleado_id}")
async def eliminar_empleado(empleado_id: str):
    try:
        resultado = empleados_collection.update_one(
            {"id": empleado_id},
            {"$set": {"estado": "inactivo"}}
        )
        
        if resultado.matched_count == 0:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
        
        return {"message": "Empleado dado de baja exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al dar de baja empleado: {str(e)}")

@app.delete("/api/reservas/{reserva_id}")
async def cancelar_reserva(reserva_id: str):
    try:
        resultado = reservas_collection.update_one(
            {"id": reserva_id},
            {"$set": {"estado": "cancelada"}}
        )
        
        if resultado.matched_count == 0:
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        
        return {"message": "Reserva cancelada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cancelar reserva: {str(e)}")

# ========== ENDPOINTS PARA ESTADÍSTICAS ==========
@app.get("/api/estadisticas/resumen")
async def get_estadisticas_resumen():
    try:
        hoy = datetime.now().strftime("%Y-%m-%d")
        mes_actual = datetime.now().strftime("%Y-%m")
        
        # Reservas del día
        reservas_hoy = reservas_collection.count_documents({"fecha": hoy})
        
        # Ingresos del día
        reservas_hoy_data = list(reservas_collection.find({"fecha": hoy}, {"_id": 0}))
        precios = {
            'Corte de cabello': 15, 'Arreglo de barba': 10, 'Tinte': 45,
            'Corte mujer': 25, 'Peinado': 20, 'Mechas': 60
        }
        ingresos_hoy = sum(precios.get(r.get('servicio', ''), 0) for r in reservas_hoy_data)
        
        # Gastos del mes
        gastos_mes = list(gastos_collection.find(
            {"fecha": {"$regex": f"^{mes_actual}"}}, {"_id": 0}
        ))
        total_gastos_mes = sum(g.get('monto', 0) for g in gastos_mes)
        
        # Productos bajo stock
        productos_bajo_stock = inventario_collection.count_documents(
            {"$expr": {"$lte": ["$stock_actual", "$stock_minimo"]}}
        )
        
        # Total empleados activos
        empleados_activos = empleados_collection.count_documents({"estado": "activo"})
        
        return {
            "reservas_hoy": reservas_hoy,
            "ingresos_hoy": ingresos_hoy,
            "gastos_mes": total_gastos_mes,
            "productos_bajo_stock": productos_bajo_stock,
            "empleados_activos": empleados_activos,
            "ganancia_mes": sum(precios.get(r.get('servicio', ''), 0) 
                               for r in reservas_collection.find(
                                   {"fecha": {"$regex": f"^{mes_actual}"}}, {"_id": 0}
                               )) - total_gastos_mes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener estadísticas: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)