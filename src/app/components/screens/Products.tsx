// src/app/screens/Products.tsx
import { useState } from "react";
import { useProductos } from "../../../hooks/useSupabaseData";
import { Producto } from "../../../services/supabase";

export function Products() {
  const { productos, loading, crear, actualizar, eliminar } = useProductos();
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevoProducto, setNuevoProducto] = useState(false);
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: "",
    precio: 0,
    unidad: "kg",
    disponible: true,
    observaciones: "",
  });

  const handleGuardar = async () => {
    if (editando) {
      // Actualizar existente
      const resultado = await actualizar(editando, formData);
      if (resultado.success) {
        setEditando(null);
        setFormData({});
      } else {
        alert("Error: " + resultado.error);
      }
    } else {
      // Crear nuevo
      const resultado = await crear(
        formData as Omit<Producto, "id" | "created_at">,
      );
      if (resultado.success) {
        setNuevoProducto(false);
        setFormData({
          nombre: "",
          precio: 0,
          unidad: "kg",
          disponible: true,
          observaciones: "",
        });
      } else {
        alert("Error: " + resultado.error);
      }
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este producto?")) return;

    const resultado = await eliminar(id);
    if (!resultado.success) {
      alert("Error: " + resultado.error);
    }
  };

  const handleToggleDisponible = async (id: string, disponible: boolean) => {
    await actualizar(id, { disponible });
  };

  const iniciarEdicion = (producto: Producto) => {
    setEditando(producto.id);
    setFormData(producto);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoProducto(false);
    setFormData({
      nombre: "",
      precio: 0,
      unidad: "kg",
      disponible: true,
      observaciones: "",
    });
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Lista de Productos</h1>
        <div className="flex gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            📢 Publicar Lista a WhatsApp
          </button>
          <button
            onClick={() => setNuevoProducto(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 flex items-center gap-2"
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* Formulario de nuevo producto */}
      {(nuevoProducto || editando) && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-green-500">
          <h3 className="text-lg font-semibold mb-4">
            {editando ? "Editar Producto" : "Nuevo Producto"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Papa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <input
                type="number"
                value={formData.precio || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    precio: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="150"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad
              </label>
              <select
                value={formData.unidad}
                onChange={(e) =>
                  setFormData({ ...formData, unidad: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="kg">kg</option>
                <option value="unidad">unidad</option>
                <option value="atado">atado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.disponible ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    disponible: e.target.value === "true",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="true">Disponible</option>
                <option value="false">No disponible</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
                placeholder="Ej: Variedad nueva, tamaño grande..."
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

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disponible
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Observaciones
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No hay productos. Agregá el primero haciendo click en "+ Nuevo
                  Producto"
                </td>
              </tr>
            ) : (
              productos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {producto.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${producto.precio}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {producto.unidad}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleToggleDisponible(
                          producto.id,
                          !producto.disponible,
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        producto.disponible
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {producto.disponible ? "✓ Disponible" : "✗ No disponible"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {producto.observaciones || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => iniciarEdicion(producto)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(producto.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
