import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reservas, setReservas] = useState([]);
  const [reservasHoy, setReservasHoy] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    reservas_hoy: 0,
    ingresos_hoy: 0,
    gastos_mes: 0,
    productos_bajo_stock: 0,
    empleados_activos: 0,
    ganancia_mes: 0
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // Obtener fecha de hoy
  const getHoy = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fechaHoy = getHoy();
    setFechaSeleccionada(fechaHoy);
    cargarDatos();
    cargarReservasHoy(fechaHoy);
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/reservas`);
      const data = await response.json();
      setReservas(data.reservas || []);
      calcularEstadisticas(data.reservas || []);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarReservasHoy = async (fecha) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reservas/${fecha}`);
      const data = await response.json();
      setReservasHoy(data.reservas || []);
    } catch (error) {
      console.error('Error cargando reservas del día:', error);
    }
  };

  const calcularEstadisticas = (reservasData) => {
    const hoy = getHoy();
    const reservasDeHoy = reservasData.filter(r => r.fecha === hoy);
    
    // Precios de servicios (deberían venir del backend)
    const precios = {
      'Corte de cabello': 15,
      'Arreglo de barba': 10,
      'Tinte': 45,
      'Corte mujer': 25,
      'Peinado': 20,
      'Mechas': 60
    };

    const ingresosDia = reservasDeHoy.reduce((total, reserva) => {
      return total + (precios[reserva.servicio] || 0);
    }, 0);

    // Servicio más popular
    const servicios = {};
    reservasData.forEach(reserva => {
      servicios[reserva.servicio] = (servicios[reserva.servicio] || 0) + 1;
    });
    
    const servicioPopular = Object.keys(servicios).reduce((a, b) => 
      servicios[a] > servicios[b] ? a : b, ''
    );

    setStatsData({
      totalReservas: reservasData.length,
      reservasHoy: reservasDeHoy.length,
      ingresosDia,
      servicioPopular
    });
  };

  const handleFechaChange = (fecha) => {
    setFechaSeleccionada(fecha);
    cargarReservasHoy(fecha);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const eliminarReserva = async (reservaId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      // TODO: Implementar endpoint DELETE en el backend
      alert('Funcionalidad de eliminación pendiente de implementar en el backend');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Peluquería Élite
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Ver Sitio Web
              </button>
              <button
                onClick={cargarDatos}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Reservas</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{statsData.totalReservas}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Reservas Hoy</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{statsData.reservasHoy}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Ingresos Hoy</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{statsData.ingresosDia}€</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l6-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm10-9c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Servicio Popular</dt>
                    <dd className="text-sm font-semibold text-gray-900">{statsData.servicioPopular}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selector de fecha y reservas del día */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reservas del día seleccionado */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Reservas del Día</h3>
                <input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(e) => handleFechaChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {formatearFecha(fechaSeleccionada)}
              </p>
            </div>
            <div className="overflow-hidden">
              {reservasHoy.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No hay reservas para esta fecha
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {reservasHoy.map((reserva) => (
                    <li key={reserva.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {reserva.hora}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {reserva.cliente_nombre}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reserva.servicio} • {reserva.peluquero}
                            </div>
                            <div className="text-sm text-gray-500">
                              📞 {reserva.cliente_telefono}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {reserva.estado}
                          </span>
                          <button
                            onClick={() => eliminarReserva(reserva.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Todas las reservas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Todas las Reservas</h3>
              <p className="mt-1 text-sm text-gray-600">
                Vista general de todas las citas programadas
              </p>
            </div>
            <div className="overflow-hidden max-h-96 overflow-y-auto">
              {reservas.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No hay reservas registradas
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {reservas.slice(0, 10).map((reserva) => (
                    <li key={reserva.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {reserva.cliente_nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reserva.fecha} • {reserva.hora} • {reserva.peluquero}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reserva.servicio}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {reserva.estado}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Vista por peluquero */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Reservas por Peluquero</h3>
            <p className="mt-1 text-sm text-gray-600">
              Distribución de citas por cada profesional
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Andrés', 'Alejandro', 'Adrián'].map((peluquero) => {
                const reservasPeluquero = reservas.filter(r => r.peluquero === peluquero);
                return (
                  <div key={peluquero} className="border rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{peluquero}</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {reservasPeluquero.length}
                    </div>
                    <div className="text-sm text-gray-500">
                      reservas totales
                    </div>
                    <div className="mt-3">
                      <div className="text-sm text-gray-500">
                        Próximas citas:
                      </div>
                      {reservasPeluquero
                        .filter(r => new Date(r.fecha + 'T' + r.hora) >= new Date())
                        .slice(0, 3)
                        .map((reserva, index) => (
                          <div key={index} className="text-xs text-gray-600 mt-1">
                            {reserva.fecha} {reserva.hora} - {reserva.cliente_nombre}
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
