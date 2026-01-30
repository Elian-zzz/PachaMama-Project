// src/app/screens/Customers.tsx
import { useState } from "react";
import { useClientes } from "../../../hooks/useSupabaseData";
import { Cliente } from "../../../services/supabase";

export function ClientesScreen() {
  const { clientes, loading, crear, actualizar, eliminar } = useClientes();
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevoCliente, setNuevoCliente] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nombre: "",
    telefono: "",
    direccion: "",
    notas: "",
  });
  const [busqueda, setBusqueda] = useState("");

  const handleGuardar = async () => {
    // Validación básica
    if (!formData.nombre?.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    if (!formData.telefono?.trim()) {
      alert("El teléfono es obligatorio");
      return;
    }

    if (editando) {
      const resultado = await actualizar(editando, formData);
      if (resultado.success) {
        setEditando(null);
        resetForm();
      } else {
        alert("Error: " + resultado.error);
      }
    } else {
      const resultado = await crear(
        formData as Omit<Cliente, "id" | "created_at">,
      );
      if (resultado.success) {
        setNuevoCliente(false);
        resetForm();
      } else {
        alert("Error: " + resultado.error);
      }
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Seguro que querés eliminar a ${nombre}?`)) return;

    const resultado = await eliminar(id);
    if (!resultado.success) {
      alert("Error: " + resultado.error);
    }
  };

  const iniciarEdicion = (cliente: Cliente) => {
    setEditando(cliente.id);
    setFormData(cliente);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      telefono: "",
      direccion: "",
      notas: "",
    });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoCliente(false);
    resetForm();
  };

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.telefono.includes(busqueda),
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={() => setNuevoCliente(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          + Agregar Cliente
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Formulario */}
      {(nuevoCliente || editando) && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-green-500">
          <h3 className="text-lg font-semibold mb-4">
            {editando ? "Editar Cliente" : "Nuevo Cliente"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono (WhatsApp) *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: +598 99 123 456"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Av. 18 de Julio 1234, Apto 5"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
                placeholder="Ej: Tocar timbre 2 veces, paga siempre en efectivo..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleGuardar}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              onClick={cancelarEdicion}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Grid de Clientes */}
      {clientesFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          {busqueda ? (
            <>
              <p className="text-lg mb-2">No se encontraron clientes</p>
              <p className="text-sm">Probá con otra búsqueda</p>
            </>
          ) : (
            <>
              <p className="text-lg mb-2">Aún no hay clientes</p>
              <p className="text-sm">
                Agregá el primero haciendo click en "+ Agregar Cliente"
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesFiltrados.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-5 border border-gray-200"
            >
              {/* Avatar y nombre */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-lg">
                    {cliente.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {cliente.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">Cliente</p>
                  </div>
                </div>
              </div>

              {/* Información */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">📱</span>
                  <a
                    href={`https://wa.me/${cliente.telefono.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-green-600 hover:underline"
                  >
                    {cliente.telefono}
                  </a>
                </div>
                {cliente.direccion && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-400">📍</span>
                    <p className="text-gray-600 flex-1">{cliente.direccion}</p>
                  </div>
                )}
                {cliente.notas && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-400">📝</span>
                    <p className="text-gray-600 flex-1 italic">
                      {cliente.notas}
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => iniciarEdicion(cliente)}
                  className="flex-1 text-sm text-green-600 hover:bg-green-50 py-2 rounded-lg transition-colors"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleEliminar(cliente.id, cliente.nombre)}
                  className="flex-1 text-sm text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contador */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {busqueda ? (
          <>
            Mostrando {clientesFiltrados.length} de {clientes.length} clientes
          </>
        ) : (
          <>Total: {clientes.length} clientes</>
        )}
      </div>
    </div>
  );
}
