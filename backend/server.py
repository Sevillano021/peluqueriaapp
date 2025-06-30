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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)