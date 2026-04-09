// src/app/components/modals/GestorOfertasModal.tsx
import { useState } from "react";
import { useOfertas, useProductos } from "../../../hooks/useSupabaseData";

interface Props {
  onClose: () => void;
}

export function GestorOfertasModal({ onClose }: Props) {
  const { ofertas, loading, crearOferta, toggleOferta, eliminarOferta } =
    useOfertas();
  const { productos } = useProductos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    producto_id: "",
    tipo_oferta: "exacta" as "exacta" | "minima",
    cantidad_condicion: "",
    precio_oferta: "",
    descripcion: "",
  });

  const productoSeleccionado = productos.find((p) => p.id === form.producto_id);

  const resetForm = () => {
    setForm({
      producto_id: "",
      tipo_oferta: "exacta",
      cantidad_condicion: "",
      precio_oferta: "",
      descripcion: "",
    });
    setError(null);
  };

  const handleCrear = async () => {
    setError(null);
    if (!form.producto_id) return setError("Seleccioná un producto.");
    const cant = parseFloat(form.cantidad_condicion);
    const precio = parseFloat(form.precio_oferta);
    if (isNaN(cant) || cant <= 0)
      return setError("Ingresá una cantidad válida.");
    if (isNaN(precio) || precio <= 0)
      return setError("Ingresá un precio válido.");

    setGuardando(true);
    const resultado = await crearOferta({
      producto_id: form.producto_id,
      tipo_oferta: form.tipo_oferta,
      cantidad_condicion: cant,
      precio_oferta: precio,
      activa: true,
      descripcion: form.descripcion || generarDescripcion(),
    });
    setGuardando(false);

    if (resultado.success) {
      resetForm();
      setMostrarFormulario(false);
    } else {
      setError(resultado.error || "Error al guardar.");
    }
  };

  const generarDescripcion = () => {
    if (!productoSeleccionado) return "";
    const cant = form.cantidad_condicion;
    const precio = form.precio_oferta;
    const unidad = productoSeleccionado.unidad;
    if (form.tipo_oferta === "exacta")
      return `${cant} ${unidad} por $${precio}`;
    return `A partir de ${cant} ${unidad} → $${precio}/${unidad}`;
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminás esta oferta del historial?")) return;
    await eliminarOferta(id);
  };

  // Preview del precio con oferta
  const precioNormalPreview = () => {
    if (!productoSeleccionado || !form.cantidad_condicion) return null;
    const cant = parseFloat(form.cantidad_condicion);
    if (isNaN(cant)) return null;
    return productoSeleccionado.precio * cant;
  };

  const precioOfertaPreview = () => {
    if (!form.precio_oferta) return null;
    const precio = parseFloat(form.precio_oferta);
    if (isNaN(precio)) return null;
    if (form.tipo_oferta === "exacta") return precio;
    const cant = parseFloat(form.cantidad_condicion);
    return isNaN(cant) ? null : precio * cant;
  };

  const formatMoney = (n: number) =>
    n.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              🏷️ Gestión de Ofertas
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Creá, activá o desactivá ofertas por producto
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!mostrarFormulario && (
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                + Nueva oferta
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Formulario nueva oferta */}
          {mostrarFormulario && (
            <div className="bg-gray-50 rounded-xl border-2 border-green-400 p-5 space-y-4">
              <h3 className="font-semibold text-gray-800">Nueva oferta</h3>

              {/* Tipo de oferta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de oferta
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setForm({ ...form, tipo_oferta: "exacta" })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium text-left transition-colors ${
                      form.tipo_oferta === "exacta"
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-base">🎯</span>
                    <span className="block font-semibold mt-1">
                      Cantidad exacta
                    </span>
                    <span className="text-xs opacity-75">
                      Solo aplica al número exacto de unidades
                    </span>
                    <span className="text-xs italic mt-1 block">
                      Ej: 3 atados = $80 total
                    </span>
                  </button>
                  <button
                    onClick={() => setForm({ ...form, tipo_oferta: "minima" })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium text-left transition-colors ${
                      form.tipo_oferta === "minima"
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-base">📈</span>
                    <span className="block font-semibold mt-1">
                      Cantidad mínima
                    </span>
                    <span className="text-xs opacity-75">
                      Aplica a partir de X unidades
                    </span>
                    <span className="text-xs italic mt-1 block">
                      Ej: 3+ atados = $25/atado
                    </span>
                  </button>
                </div>
              </div>

              {/* Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <select
                  value={form.producto_id}
                  onChange={(e) =>
                    setForm({ ...form, producto_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleccioná un producto...</option>
                  {productos
                    .filter((p) => p.disponible)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — ${p.precio}/{p.unidad}
                      </option>
                    ))}
                </select>
              </div>

              {/* Cantidad y precio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {form.tipo_oferta === "exacta"
                      ? "Cantidad exacta"
                      : "Cantidad mínima"}{" "}
                    {productoSeleccionado
                      ? `(${productoSeleccionado.unidad})`
                      : ""}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.cantidad_condicion}
                    onChange={(e) =>
                      setForm({ ...form, cantidad_condicion: e.target.value })
                    }
                    placeholder="Ej: 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {form.tipo_oferta === "exacta"
                      ? "Precio total oferta ($)"
                      : "Precio por unidad ($)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.precio_oferta}
                    onChange={(e) =>
                      setForm({ ...form, precio_oferta: e.target.value })
                    }
                    placeholder="Ej: 80"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Preview ahorro */}
              {precioNormalPreview() !== null &&
                precioOfertaPreview() !== null && (
                  <div className="bg-white border border-green-200 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">
                        Precio normal ({form.cantidad_condicion}{" "}
                        {productoSeleccionado?.unidad})
                      </span>
                      <span className="line-through text-gray-400">
                        {formatMoney(precioNormalPreview()!)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-green-700 font-medium">
                        Precio con oferta
                      </span>
                      <span className="text-green-700 font-bold text-base">
                        {formatMoney(precioOfertaPreview()!)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-green-100">
                      <span className="text-green-600 font-medium">
                        Ahorro del cliente
                      </span>
                      <span className="text-green-600 font-bold">
                        {formatMoney(
                          precioNormalPreview()! - precioOfertaPreview()!,
                        )}
                      </span>
                    </div>
                  </div>
                )}

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiqueta visible (opcional)
                </label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  placeholder={
                    generarDescripcion() || "Se genera automáticamente"
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
                  ❌ {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    resetForm();
                  }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrear}
                  disabled={guardando}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60"
                >
                  {guardando ? "Guardando..." : "Crear oferta"}
                </button>
              </div>
            </div>
          )}

          {/* Lista de ofertas */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : ofertas.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🏷️</p>
              <p className="font-medium text-gray-500">
                No hay ofertas cargadas
              </p>
              <p className="text-sm mt-1">
                Creá tu primera oferta con el botón de arriba
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Ofertas registradas ({ofertas.length})
              </h3>
              {ofertas.map((oferta) => (
                <div
                  key={oferta.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    oferta.activa
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                >
                  {/* Badge tipo */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      oferta.tipo_oferta === "exacta"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {oferta.tipo_oferta === "exacta"
                      ? "🎯 Exacta"
                      : "📈 Mínima"}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {oferta.productos?.nombre ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {oferta.tipo_oferta === "exacta"
                        ? `${oferta.cantidad_condicion} ${oferta.productos?.unidad ?? ""} → $${oferta.precio_oferta} total`
                        : `≥${oferta.cantidad_condicion} ${oferta.productos?.unidad ?? ""} → $${oferta.precio_oferta}/${oferta.productos?.unidad ?? ""}`}
                    </p>
                    {oferta.descripcion && (
                      <p className="text-xs text-green-700 font-medium mt-0.5">
                        {oferta.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Toggle activa */}
                  <button
                    onClick={() => toggleOferta(oferta.id, !oferta.activa)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      oferta.activa
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {oferta.activa ? "Activa" : "Inactiva"}
                  </button>

                  {/* Eliminar */}
                  <button
                    onClick={() => handleEliminar(oferta.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar oferta"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
