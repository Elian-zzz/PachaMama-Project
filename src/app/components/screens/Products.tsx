// src/app/components/screens/Products.tsx
import { useState } from "react";
import { useProductos } from "../../../hooks/useSupabaseData";
import { Producto } from "../../../services/supabase";
import { GestorStockModal } from "../modals/GestorStockModal";
import { GestorOfertasModal } from "../modals/GestorOfertasModal";
import { AlertaStockNegativo } from "../alerts/AlertaStockNegativo";
import { ListaWhatsappModal } from "../ListaWhatsappModal";

type Tab = "productos" | "stock" | "ofertas";

export function Products() {
  const { productos, loading, crear, actualizar, eliminar, refetch } =
    useProductos();
  const [tabActiva, setTabActiva] = useState<Tab>("productos");

  // Estado ABM productos
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevoProducto, setNuevoProducto] = useState(false);
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: "",
    precio: 0,
    unidad: "kg",
    disponible: true,
    observaciones: "",
  });

  // Estado modales
  const [productoStockSeleccionado, setProductoStockSeleccionado] =
    useState<Producto | null>(null);
  const [mostrarModalOfertas, setMostrarModalOfertas] = useState(false);
  const [mostrarListaModal, setMostrarListaModal] = useState(false);

  // Contadores de alerta stock
  const productosConStockNegativo = productos.filter((p) => (p.stock ?? 0) < 0);

  // -------- Toggle disponible (click directo en la tabla) --------
  const handleToggleDisponible = async (
    id: string,
    disponibleActual: boolean,
  ) => {
    await actualizar(id, { disponible: !disponibleActual });
  };

  // -------- ABM Productos --------
  const handleGuardar = async () => {
    if (editando) {
      const resultado = await actualizar(editando, formData);
      if (resultado.success) {
        setEditando(null);
        setFormData({});
      } else {
        alert("Error: " + resultado.error);
      }
    } else {
      const resultado = await crear({
        ...(formData as Omit<Producto, "id" | "created_at">),
        stock: 0, // stock inicial siempre en 0
      });
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
    if (!resultado.success) alert("Error: " + resultado.error);
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
      {/* Alerta global de stock negativo */}
      <AlertaStockNegativo />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        {tabActiva === "productos" && (
          <div className="flex gap-3">
            <button
              onClick={() => setMostrarListaModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
            >
              📢 Publicar Lista a WhatsApp
            </button>
            <button
              onClick={() => setNuevoProducto(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 flex items-center gap-2 text-sm"
            >
              + Nuevo producto
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTabActiva("productos")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tabActiva === "productos"
              ? "bg-white shadow text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📦 Productos
        </button>

        <button
          onClick={() => setTabActiva("stock")}
          className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tabActiva === "stock"
              ? "bg-white shadow text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📊 Stock
          {productosConStockNegativo.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
              {productosConStockNegativo.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setTabActiva("ofertas")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tabActiva === "ofertas"
              ? "bg-white shadow text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🏷️ Ofertas
        </button>
      </div>

      {/* ===== TAB: PRODUCTOS ===== */}
      {tabActiva === "productos" && (
        <>
          {/* Formulario nuevo/editar */}
          {(nuevoProducto || editando) && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-green-500">
              <h3 className="text-lg font-semibold mb-4">
                {editando ? "Editar producto" : "Nuevo producto"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Acelga, Papa, Nuez moscada..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio *
                  </label>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        precio: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidad *
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
                    <option value="litro">litro</option>
                    <option value="docena">docena</option>
                    <option value="bandeja">bandeja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disponible
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
                      setFormData({
                        ...formData,
                        observaciones: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                    placeholder="Ej: Variedad nueva, tamaño grande..."
                  />
                </div>
              </div>
              {!editando && (
                <p className="text-xs text-gray-400 mt-2">
                  ℹ️ El stock inicial se establece en 0. Podés cargarlo desde la
                  pestaña <strong>Stock</strong>.
                </p>
              )}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Disponible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Observaciones
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No hay productos. Agregá el primero.
                    </td>
                  </tr>
                ) : (
                  productos.map((producto) => {
                    const stockNegativo = (producto.stock ?? 0) < 0;
                    return (
                      <tr key={producto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {producto.nombre}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          ${producto.precio}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {producto.unidad}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${stockNegativo ? "text-red-600" : "text-gray-700"}`}
                          >
                            {stockNegativo && "⚠️ "}
                            {producto.stock ?? 0} {producto.unidad}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleToggleDisponible(
                                producto.id,
                                producto.disponible,
                              )
                            }
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              producto.disponible
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {producto.disponible
                              ? "✓ Disponible"
                              : "✗ No disponible"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {producto.observaciones || "—"}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===== TAB: STOCK ===== */}
      {tabActiva === "stock" && (
        <>
          {productosConStockNegativo.length > 0 && (
            <div className="mb-5 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-red-700">
                  {productosConStockNegativo.length} producto
                  {productosConStockNegativo.length > 1 ? "s" : ""} con stock
                  negativo
                </p>
                <p className="text-sm text-red-600 mt-0.5">
                  Necesitás comprar mercadería antes del próximo reparto. Usá el
                  botón de cada producto para registrar la entrada de stock.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock actual
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Gestionar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No hay productos cargados.
                    </td>
                  </tr>
                ) : (
                  // Ordenar: negativos primero
                  [...productos]
                    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
                    .map((producto) => {
                      const stock = producto.stock ?? 0;
                      const negativo = stock < 0;
                      return (
                        <tr
                          key={producto.id}
                          className={`hover:bg-gray-50 ${negativo ? "bg-red-50" : ""}`}
                        >
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">
                              {producto.nombre}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {producto.unidad}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-lg font-bold ${negativo ? "text-red-600" : "text-gray-800"}`}
                            >
                              {negativo && "⚠️ "}
                              {stock} {producto.unidad}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() =>
                                setProductoStockSeleccionado(producto)
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                negativo
                                  ? "bg-red-600 text-white hover:bg-red-700"
                                  : "bg-green-600 text-white hover:bg-green-700"
                              }`}
                            >
                              {negativo ? "🛒 Reponer stock" : "📦 Gestionar"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===== TAB: OFERTAS ===== */}
      {tabActiva === "ofertas" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <span className="text-6xl">🏷️</span>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">
              Gestión de Ofertas
            </h2>
            <p className="text-gray-500 mt-1 text-sm max-w-sm">
              Creá y administrá ofertas por producto. Las ofertas se aplican
              automáticamente al hacer pedidos.
            </p>
          </div>
          <button
            onClick={() => setMostrarModalOfertas(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 font-medium flex items-center gap-2"
          >
            🏷️ Abrir gestor de ofertas
          </button>
        </div>
      )}

      {/* Modal stock por producto */}
      {productoStockSeleccionado && (
        <GestorStockModal
          producto={productoStockSeleccionado}
          onClose={() => setProductoStockSeleccionado(null)}
          onStockActualizado={() => {
            setProductoStockSeleccionado(null);
            refetch();
          }}
        />
      )}

      {/* Modal ofertas */}
      {mostrarModalOfertas && (
        <GestorOfertasModal onClose={() => setMostrarModalOfertas(false)} />
      )}

      {/* Modal Lista WhatsApp */}
      {mostrarListaModal && (
        <ListaWhatsappModal
          productos={productos}
          onClose={() => setMostrarListaModal(false)}
        />
      )}
    </div>
  );
}
