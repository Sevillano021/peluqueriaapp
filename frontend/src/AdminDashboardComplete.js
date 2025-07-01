import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reservas, setReservas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    reservas_hoy: 0,
    ingresos_hoy: 0,
    gastos_mes: 0,
    productos_bajo_stock: 0,
    empleados_activos: 0,
    ganancia_mes: 0
  });

  // Estados para formularios
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '', contacto: '', telefono: '', email: '', direccion: '', categoria: ''
  });
  const [nuevoGasto, setNuevoGasto] = useState({
    concepto: '', categoria: '', monto: '', fecha: '', proveedor_id: '', descripcion: '', metodo_pago: 'efectivo'
  });
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '', categoria: '', stock_actual: '', stock_minimo: '', precio_compra: '', precio_venta: '', proveedor_id: ''
  });
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: '', telefono: '', email: '', puesto: '', salario: '', fecha_ingreso: '', horario: '', comision_porcentaje: ''
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [
        reservasRes, proveedoresRes, gastosRes, 
        inventarioRes, empleadosRes, estadisticasRes
      ] = await Promise.all([
        fetch(`${BACKEND_URL}/api/reservas`),
        fetch(`${BACKEND_URL}/api/proveedores`),
        fetch(`${BACKEND_URL}/api/gastos`),
        fetch(`${BACKEND_URL}/api/inventario`),
        fetch(`${BACKEND_URL}/api/empleados`),
        fetch(`${BACKEND_URL}/api/estadisticas/resumen`)
      ]);

      const [
        reservasData, proveedoresData, gastosData,
        inventarioData, empleadosData, estadisticasData
      ] = await Promise.all([
        reservasRes.json(), proveedoresRes.json(), gastosRes.json(),
        inventarioRes.json(), empleadosRes.json(), estadisticasRes.json()
      ]);

      setReservas(reservasData.reservas || []);
      setProveedores(proveedoresData.proveedores || []);
      setGastos(gastosData.gastos || []);
      setInventario(inventarioData.inventario || []);
      setEmpleados(empleadosData.empleados || []);
      setEstadisticas(estadisticasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const crearProveedor = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/proveedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProveedor)
      });
      
      if (response.ok) {
        alert('Proveedor creado exitosamente');
        setNuevoProveedor({
          nombre: '', contacto: '', telefono: '', email: '', direccion: '', categoria: ''
        });
        cargarDatos();
      }
    } catch (error) {
      console.error('Error creando proveedor:', error);
      alert('Error al crear proveedor');
    }
  };

  const crearGasto = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoGasto,
          monto: parseFloat(nuevoGasto.monto)
        })
      });
      
      if (response.ok) {
        alert('Gasto registrado exitosamente');
        setNuevoGasto({
          concepto: '', categoria: '', monto: '', fecha: '', proveedor_id: '', descripcion: '', metodo_pago: 'efectivo'
        });
        cargarDatos();
      }
    } catch (error) {
      console.error('Error registrando gasto:', error);
      alert('Error al registrar gasto');
    }
  };

  const crearProducto = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoProducto,
          stock_actual: parseInt(nuevoProducto.stock_actual),
          stock_minimo: parseInt(nuevoProducto.stock_minimo),
          precio_compra: parseFloat(nuevoProducto.precio_compra),
          precio_venta: nuevoProducto.precio_venta ? parseFloat(nuevoProducto.precio_venta) : null
        })
      });
      
      if (response.ok) {
        alert('Producto añadido al inventario');
        setNuevoProducto({
          nombre: '', categoria: '', stock_actual: '', stock_minimo: '', precio_compra: '', precio_venta: '', proveedor_id: ''
        });
        cargarDatos();
      }
    } catch (error) {
      console.error('Error añadiendo producto:', error);
      alert('Error al añadir producto');
    }
  };

  const crearEmpleado = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/empleados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoEmpleado,
          salario: parseFloat(nuevoEmpleado.salario),
          comision_porcentaje: nuevoEmpleado.comision_porcentaje ? parseFloat(nuevoEmpleado.comision_porcentaje) : null
        })
      });
      
      if (response.ok) {
        alert('Empleado registrado exitosamente');
        setNuevoEmpleado({
          nombre: '', telefono: '', email: '', puesto: '', salario: '', fecha_ingreso: '', horario: '', comision_porcentaje: ''
        });
        cargarDatos();
      }
    } catch (error) {
      console.error('Error registrando empleado:', error);
      alert('Error al registrar empleado');
    }
  };

  const getHoy = () => {
    return new Date().toISOString().split('T')[0];
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
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión - Peluquería Élite</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ← Volver al Cliente
              </Link>
              <button
                onClick={cargarDatos}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'reservas', name: 'Reservas', icon: '📅' },
              { id: 'proveedores', name: 'Proveedores', icon: '🏢' },
              { id: 'gastos', name: 'Gastos', icon: '💰' },
              { id: 'inventario', name: 'Inventario', icon: '📦' },
              { id: 'empleados', name: 'Empleados', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Reservas Hoy</p>
                    <p className="text-2xl font-semibold text-gray-900">{estadisticas.reservas_hoy}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">💶</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ingresos Hoy</p>
                    <p className="text-2xl font-semibold text-gray-900">{estadisticas.ingresos_hoy}€</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Gastos Mes</p>
                    <p className="text-2xl font-semibold text-gray-900">{estadisticas.gastos_mes}€</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                    <p className="text-2xl font-semibold text-gray-900">{estadisticas.productos_bajo_stock}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Empleados</p>
                    <p className="text-2xl font-semibold text-gray-900">{estadisticas.empleados_activos}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ganancia Mes</p>
                    <p className={`text-2xl font-semibold ${estadisticas.ganancia_mes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {estadisticas.ganancia_mes}€
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium">Reservas de Hoy</h3>
                </div>
                <div className="p-6">
                  {reservas.filter(r => r.fecha === getHoy()).slice(0, 5).map((reserva, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">{reserva.cliente_nombre}</p>
                        <p className="text-sm text-gray-600">{reserva.servicio} • {reserva.hora}</p>
                      </div>
                      <span className="text-sm text-gray-500">{reserva.peluquero}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium">Productos con Bajo Stock</h3>
                </div>
                <div className="p-6">
                  {inventario.filter(p => p.stock_actual <= p.stock_minimo).slice(0, 5).map((producto, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">{producto.nombre}</p>
                        <p className="text-sm text-gray-600">{producto.categoria}</p>
                      </div>
                      <span className="text-sm text-red-600">Stock: {producto.stock_actual}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reservas Tab */}
        {activeTab === 'reservas' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium">Gestión de Reservas</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peluquero</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservas.map((reserva) => (
                      <tr key={reserva.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {reserva.cliente_nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reserva.servicio}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reserva.fecha}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reserva.hora}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reserva.peluquero}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reserva.cliente_telefono}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Proveedores Tab */}
        {activeTab === 'proveedores' && (
          <div className="space-y-8">
            {/* Formulario nuevo proveedor */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Nuevo Proveedor</h3>
              </div>
              <div className="p-6">
                <form onSubmit={crearProveedor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre del proveedor"
                    value={nuevoProveedor.nombre}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, nombre: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Persona de contacto"
                    value={nuevoProveedor.contacto}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, contacto: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={nuevoProveedor.telefono}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, telefono: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={nuevoProveedor.email}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, email: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Dirección"
                    value={nuevoProveedor.direccion}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, direccion: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={nuevoProveedor.categoria}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, categoria: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="productos">Productos</option>
                    <option value="servicios">Servicios</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="otros">Otros</option>
                  </select>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Crear Proveedor
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Lista de proveedores */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Lista de Proveedores</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {proveedores.map((proveedor) => (
                    <div key={proveedor.id} className="border rounded-lg p-4">
                      <h4 className="font-medium text-lg">{proveedor.nombre}</h4>
                      <p className="text-gray-600">Contacto: {proveedor.contacto}</p>
                      <p className="text-gray-600">Teléfono: {proveedor.telefono}</p>
                      <p className="text-gray-600">Categoría: {proveedor.categoria}</p>
                      {proveedor.email && <p className="text-gray-600">Email: {proveedor.email}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gastos Tab */}
        {activeTab === 'gastos' && (
          <div className="space-y-8">
            {/* Formulario nuevo gasto */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Registrar Gasto</h3>
              </div>
              <div className="p-6">
                <form onSubmit={crearGasto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Concepto del gasto"
                    value={nuevoGasto.concepto}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, concepto: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <select
                    value={nuevoGasto.categoria}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, categoria: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="productos">Productos</option>
                    <option value="servicios">Servicios</option>
                    <option value="sueldos">Sueldos</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="alquiler">Alquiler</option>
                    <option value="otros">Otros</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Monto"
                    value={nuevoGasto.monto}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="date"
                    value={nuevoGasto.fecha}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, fecha: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <select
                    value={nuevoGasto.proveedor_id}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, proveedor_id: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sin proveedor</option>
                    {proveedores.map((proveedor) => (
                      <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
                    ))}
                  </select>
                  <select
                    value={nuevoGasto.metodo_pago}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, metodo_pago: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                  <div className="md:col-span-2">
                    <textarea
                      placeholder="Descripción (opcional)"
                      value={nuevoGasto.descripcion}
                      onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Registrar Gasto
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Lista de gastos */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Historial de Gastos</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método Pago</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {gastos.slice(0, 10).map((gasto) => (
                        <tr key={gasto.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gasto.fecha}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gasto.concepto}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gasto.categoria}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{gasto.monto}€</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gasto.metodo_pago}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventario Tab */}
        {activeTab === 'inventario' && (
          <div className="space-y-8">
            {/* Formulario nuevo producto */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Añadir Producto</h3>
              </div>
              <div className="p-6">
                <form onSubmit={crearProducto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={nuevoProducto.nombre}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <select
                    value={nuevoProducto.categoria}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="shampoo">Shampoo</option>
                    <option value="tinte">Tinte</option>
                    <option value="herramientas">Herramientas</option>
                    <option value="accesorios">Accesorios</option>
                    <option value="otros">Otros</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Stock actual"
                    value={nuevoProducto.stock_actual}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, stock_actual: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock mínimo"
                    value={nuevoProducto.stock_minimo}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, stock_minimo: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Precio de compra"
                    value={nuevoProducto.precio_compra}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, precio_compra: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Precio de venta (opcional)"
                    value={nuevoProducto.precio_venta}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, precio_venta: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                  />
                  <div className="md:col-span-2">
                    <select
                      value={nuevoProducto.proveedor_id}
                      onChange={(e) => setNuevoProducto({...nuevoProducto, proveedor_id: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="">Seleccionar proveedor (opcional)</option>
                      {proveedores.map((proveedor) => (
                        <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Añadir Producto
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Lista de inventario */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Inventario</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Mínimo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Compra</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventario.map((producto) => (
                        <tr key={producto.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {producto.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.categoria}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.stock_actual}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.stock_minimo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.precio_compra}€</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {producto.stock_actual <= producto.stock_minimo ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Stock Bajo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empleados Tab */}
        {activeTab === 'empleados' && (
          <div className="space-y-8">
            {/* Formulario nuevo empleado */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Registrar Empleado</h3>
              </div>
              <div className="p-6">
                <form onSubmit={crearEmpleado} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={nuevoEmpleado.nombre}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, nombre: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={nuevoEmpleado.telefono}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, telefono: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={nuevoEmpleado.email}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, email: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={nuevoEmpleado.puesto}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, puesto: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Seleccionar puesto</option>
                    <option value="peluquero">Peluquero</option>
                    <option value="recepcionista">Recepcionista</option>
                    <option value="limpieza">Limpieza</option>
                    <option value="gerente">Gerente</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Salario"
                    value={nuevoEmpleado.salario}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, salario: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="date"
                    placeholder="Fecha de ingreso"
                    value={nuevoEmpleado.fecha_ingreso}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, fecha_ingreso: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Horario (ej: L-V 9-17h)"
                    value={nuevoEmpleado.horario}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, horario: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="% Comisión (opcional)"
                    value={nuevoEmpleado.comision_porcentaje}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, comision_porcentaje: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                  />
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Registrar Empleado
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Lista de empleados */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Lista de Empleados</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {empleados.map((empleado) => (
                    <div key={empleado.id} className="border rounded-lg p-4">
                      <h4 className="font-medium text-lg">{empleado.nombre}</h4>
                      <p className="text-gray-600">Puesto: {empleado.puesto}</p>
                      <p className="text-gray-600">Salario: {empleado.salario}€</p>
                      <p className="text-gray-600">Teléfono: {empleado.telefono}</p>
                      <p className="text-gray-600">Ingreso: {empleado.fecha_ingreso}</p>
                      {empleado.horario && <p className="text-gray-600">Horario: {empleado.horario}</p>}
                      {empleado.comision_porcentaje && (
                        <p className="text-gray-600">Comisión: {empleado.comision_porcentaje}%</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
