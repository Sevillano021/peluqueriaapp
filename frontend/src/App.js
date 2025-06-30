import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    servicio: '',
    peluquero: '',
    fecha: '',
    hora: '',
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_email: ''
  });
  
  const [servicios, setServicios] = useState([]);
  const [peluqueros, setPeluqueros] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reservaCreada, setReservaCreada] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [serviciosRes, peluquerosRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/servicios`),
          fetch(`${BACKEND_URL}/api/peluqueros`)
        ]);
        
        const serviciosData = await serviciosRes.json();
        const peluquerosData = await peluquerosRes.json();
        
        setServicios(serviciosData.servicios || []);
        setPeluqueros(peluquerosData.peluqueros || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    
    cargarDatos();
  }, [BACKEND_URL]);

  // Cargar horarios disponibles cuando se selecciona fecha y peluquero
  useEffect(() => {
    const cargarHorarios = async () => {
      if (formData.fecha && formData.peluquero) {
        setLoading(true);
        try {
          const response = await fetch(
            `${BACKEND_URL}/api/horarios-disponibles/${formData.fecha}/${formData.peluquero}`
          );
          const data = await response.json();
          setHorariosDisponibles(data.horarios || []);
        } catch (error) {
          console.error('Error cargando horarios:', error);
          setHorariosDisponibles([]);
        }
        setLoading(false);
      }
    };
    
    cargarHorarios();
  }, [formData.fecha, formData.peluquero, BACKEND_URL]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setReservaCreada(data.reserva);
        setShowConfirmation(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Error creando reserva:', error);
      alert('Error al crear la reserva. Inténtalo de nuevo.');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      servicio: '',
      peluquero: '',
      fecha: '',
      hora: '',
      cliente_nombre: '',
      cliente_telefono: '',
      cliente_email: ''
    });
    setCurrentStep(1);
    setShowConfirmation(false);
    setReservaCreada(null);
  };

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Obtener precio del servicio seleccionado
  const getPrecioServicio = () => {
    const servicio = servicios.find(s => s.nombre === formData.servicio);
    return servicio ? servicio.precio : 0;
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Reserva Confirmada!</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p><strong>Cliente:</strong> {reservaCreada?.cliente_nombre}</p>
            <p><strong>Servicio:</strong> {reservaCreada?.servicio}</p>
            <p><strong>Peluquero:</strong> {reservaCreada?.peluquero}</p>
            <p><strong>Fecha:</strong> {reservaCreada?.fecha}</p>
            <p><strong>Hora:</strong> {reservaCreada?.hora}</p>
            <p><strong>Teléfono:</strong> {reservaCreada?.cliente_telefono}</p>
          </div>
          <button
            onClick={resetForm}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            Nueva Reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1600948836101-f9ffda59d250')`
      }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Peluquería Élite</h1>
            <p className="text-xl mb-8">Tu estilo, nuestra pasión</p>
            <p className="text-lg">Andrés • Alejandro • Adrián</p>
          </div>
        </div>
      </div>

      {/* Formulario de Reserva */}
      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Progress Bar */}
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600 text-center">
                {currentStep === 1 && 'Selecciona tu servicio'}
                {currentStep === 2 && 'Elige peluquero y fecha'}
                {currentStep === 3 && 'Selecciona la hora'}
                {currentStep === 4 && 'Tus datos de contacto'}
              </div>
            </div>

            <div className="p-6">
              {/* Step 1: Selección de Servicio */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">¿Qué servicio necesitas?</h3>
                  <div className="grid gap-3">
                    {servicios.map((servicio) => (
                      <button
                        key={servicio.nombre}
                        onClick={() => handleInputChange('servicio', servicio.nombre)}
                        className={`p-4 rounded-lg border-2 text-left transition duration-200 ${
                          formData.servicio === servicio.nombre
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{servicio.nombre}</span>
                          <span className="text-blue-600 font-semibold">{servicio.precio}€</span>
                        </div>
                        <div className="text-sm text-gray-500">{servicio.duracion} minutos</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Peluquero y Fecha */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Selecciona tu peluquero</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {peluqueros.map((peluquero) => (
                        <button
                          key={peluquero}
                          onClick={() => handleInputChange('peluquero', peluquero)}
                          className={`p-3 rounded-lg border-2 text-center transition duration-200 ${
                            formData.peluquero === peluquero
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {peluquero}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">¿Qué día prefieres?</h3>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => handleInputChange('fecha', e.target.value)}
                      min={getMinDate()}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Selección de Hora */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Horarios disponibles</h3>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Cargando horarios...</p>
                    </div>
                  ) : horariosDisponibles.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {horariosDisponibles.map((hora) => (
                        <button
                          key={hora}
                          onClick={() => handleInputChange('hora', hora)}
                          className={`p-3 rounded-lg border-2 text-center transition duration-200 ${
                            formData.hora === hora
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No hay horarios disponibles para esta fecha y peluquero.
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Datos del Cliente */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Tus datos de contacto</h3>
                  
                  {/* Resumen de la reserva */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-2">Resumen de tu reserva:</h4>
                    <p><strong>Servicio:</strong> {formData.servicio} - {getPrecioServicio()}€</p>
                    <p><strong>Peluquero:</strong> {formData.peluquero}</p>
                    <p><strong>Fecha:</strong> {formData.fecha}</p>
                    <p><strong>Hora:</strong> {formData.hora}</p>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Tu nombre completo"
                      value={formData.cliente_nombre}
                      onChange={(e) => handleInputChange('cliente_nombre', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    
                    <input
                      type="tel"
                      placeholder="Tu teléfono"
                      value={formData.cliente_telefono}
                      onChange={(e) => handleInputChange('cliente_telefono', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    
                    <input
                      type="email"
                      placeholder="Tu email (opcional)"
                      value={formData.cliente_email}
                      onChange={(e) => handleInputChange('cliente_email', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Botones de navegación */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Anterior
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !formData.servicio) ||
                      (currentStep === 2 && (!formData.peluquero || !formData.fecha)) ||
                      (currentStep === 3 && !formData.hora)
                    }
                    className={`px-6 py-3 rounded-lg font-semibold transition duration-200 ml-auto ${
                      (currentStep === 1 && !formData.servicio) ||
                      (currentStep === 2 && (!formData.peluquero || !formData.fecha)) ||
                      (currentStep === 3 && !formData.hora)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !formData.cliente_nombre || !formData.cliente_telefono}
                    className={`px-6 py-3 rounded-lg font-semibold transition duration-200 ml-auto ${
                      loading || !formData.cliente_nombre || !formData.cliente_telefono
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {loading ? 'Creando reserva...' : 'Confirmar Reserva'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuestros Servicios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <img 
                src="https://images.pexels.com/photos/3993447/pexels-photo-3993447.jpeg"
                alt="Corte de cabello"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Cortes Profesionales</h3>
              <p className="text-gray-600">Los mejores cortes de cabello para hombres y mujeres</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.pexels.com/photos/4783286/pexels-photo-4783286.jpeg"
                alt="Servicios de belleza"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Tratamientos Capilares</h3>
              <p className="text-gray-600">Tintes, mechas y tratamientos para el cuidado del cabello</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.pexels.com/photos/7755510/pexels-photo-7755510.jpeg"
                alt="Peinados"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Peinados y Barba</h3>
              <p className="text-gray-600">Peinados exclusivos y arreglo de barba profesional</p>
            </div>
          </div>
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-gray-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Horarios de Atención</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-lg"><strong>Lunes a Viernes:</strong> 10:00 - 19:00</p>
            </div>
            <div>
              <p className="text-lg"><strong>Sábados:</strong> 10:00 - 14:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;