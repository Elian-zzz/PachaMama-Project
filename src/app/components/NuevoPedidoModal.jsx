// src/app/components/NuevoPedidoModal.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";

export function NuevoPedidoModal({ onClose, onPedidoCreado }) {
  const [step, setStep] = useState(1); // 1: cliente, 2: productos, 3: confirmar
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [items, setItems] = useState([]); // { producto, cantidad }
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Cargar clientes y productos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [{ data: cls }, { data: prds }] = await Promise.all([
      supabase.from("clientes").select("*").order("nombre"),
      supabase
        .from("productos")
        .select("*")
        .eq("disponible", true)
        .order("nombre"),
    ]);
    setClientes(cls || []);
    setProductos(prds || []);
  };

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      c.telefono.includes(busquedaCliente),
  );

  // Agregar o actualizar item en la lista
  const handleCantidadChange = (producto, cantidad) => {
    const cant = parseFloat(cantidad) || 0;

    if (cant <= 0) {
      // Remover item si cantidad es 0
      setItems((prev) => prev.filter((i) => i.producto.id !== producto.id));
      return;
    }

    setItems((prev) => {
      const existe = prev.find((i) => i.producto.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: cant } : i,
        );
      }
      return [...prev, { producto, cantidad: cant }];
    });
  };

  const getCantidad = (productoId) => {
    const item = items.find((i) => i.producto.id === productoId);
    return item ? item.cantidad : "";
  };

  // Calcular total
  const total = items.reduce(
    (sum, i) => sum + i.cantidad * i.producto.precio,
    0,
  );

  // Guardar pedido en Supabase
  const handleGuardar = async () => {
    if (!clienteSeleccionado) {
      alert("Seleccioná un cliente");
      return;
    }
    if (items.length === 0) {
      alert("Agregá al menos un producto");
      return;
    }

    setGuardando(true);
    try {
      // 1. Crear el pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          cliente_id: clienteSeleccionado.id,
          estado: "confirmado",
          total,
          tipo: "convencional",
          observaciones: observaciones || null,
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // 2. Insertar los items
      const itemsInsert = items.map((i) => ({
        pedido_id: pedido.id,
        producto_id: i.producto.id,
        cantidad: i.cantidad,
        precio_unitario: i.producto.precio,
      }));

      const { error: itemsError } = await supabase
        .from("pedido_items")
        .insert(itemsInsert);

      if (itemsError) throw itemsError;

      // 3. Éxito
      if (onPedidoCreado) onPedidoCreado(pedido);
      onClose();
    } catch (error) {
      console.error("Error creando pedido:", error);
      alert("Error al crear el pedido: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Nuevo Pedido Manual
            </h2>
            {/* Steps */}
            <div className="flex items-center gap-2 mt-2">
              {["Cliente", "Productos", "Confirmar"].map((label, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step > idx + 1
                        ? "bg-green-600 text-white"
                        : step === idx + 1
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > idx + 1 ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-xs ${step === idx + 1 ? "text-green-700 font-medium" : "text-gray-400"}`}
                  >
                    {label}
                  </span>
                  {idx < 2 && <span className="text-gray-300 text-xs">→</span>}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* ─── STEP 1: SELECCIONAR CLIENTE ─── */}
          {step === 1 && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="🔍 Buscar cliente por nombre o teléfono..."
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {clientesFiltrados.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    No se encontraron clientes
                  </p>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <div
                      key={cliente.id}
                      onClick={() => setClienteSeleccionado(cliente)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        clienteSeleccionado?.id === cliente.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
                          {cliente.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {cliente.nombre}
                          </p>
                          <p className="text-sm text-gray-500">
                            📱 {cliente.telefono}
                          </p>
                          {cliente.direccion && (
                            <p className="text-xs text-gray-400">
                              📍 {cliente.direccion}
                            </p>
                          )}
                        </div>
                        {clienteSeleccionado?.id === cliente.id && (
                          <span className="ml-auto text-green-600 text-xl">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── STEP 2: AGREGAR PRODUCTOS ─── */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-3">
                Ingresá la cantidad de cada producto. Dejá en blanco los que no
                van.
              </p>

              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    getCantidad(producto.id)
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {producto.nombre}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${producto.precio}/{producto.unidad}
                    </p>
                    {getCantidad(producto.id) > 0 && (
                      <p className="text-xs text-green-700 font-medium mt-0.5">
                        Subtotal: $
                        {(getCantidad(producto.id) * producto.precio).toFixed(
                          0,
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        const actual =
                          parseFloat(getCantidad(producto.id)) || 0;
                        if (actual > 0)
                          handleCantidadChange(producto, actual - 1);
                      }}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 font-bold"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={getCantidad(producto.id)}
                      onChange={(e) =>
                        handleCantidadChange(producto, e.target.value)
                      }
                      placeholder="0"
                      className="w-16 text-center px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        const actual =
                          parseFloat(getCantidad(producto.id)) || 0;
                        handleCantidadChange(producto, actual + 1);
                      }}
                      className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white font-bold"
                    >
                      +
                    </button>
                    <span className="text-xs text-gray-400 w-8">
                      {producto.unidad}
                    </span>
                  </div>
                </div>
              ))}

              {/* Total parcial */}
              {items.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {items.length} producto(s) seleccionado(s)
                    </span>
                    <span className="font-bold text-green-700 text-lg">
                      Total: ${total.toLocaleString("es-UY")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3: CONFIRMAR ─── */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Cliente */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                  Cliente
                </p>
                <p className="font-semibold text-gray-900">
                  {clienteSeleccionado?.nombre}
                </p>
                <p className="text-sm text-gray-600">
                  {clienteSeleccionado?.telefono}
                </p>
                {clienteSeleccionado?.direccion && (
                  <p className="text-sm text-gray-500">
                    📍 {clienteSeleccionado?.direccion}
                  </p>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Productos
                </p>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.producto.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.cantidad} {item.producto.unidad} × $
                          {item.producto.precio}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        $
                        {(item.cantidad * item.producto.precio).toLocaleString(
                          "es-UY",
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="font-bold text-gray-800">TOTAL</span>
                <span className="text-2xl font-bold text-green-700">
                  ${total.toLocaleString("es-UY")}
                </span>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Entregar en portería, paga con transferencia..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones de navegación */}
        <div className="p-5 border-t flex justify-between items-center">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            {step === 1 ? "Cancelar" : "← Volver"}
          </button>

          <div className="flex items-center gap-3">
            {/* Resumen rápido en footer */}
            {items.length > 0 && step < 3 && (
              <span className="text-sm text-green-700 font-medium">
                {items.length} item(s) · ${total.toLocaleString("es-UY")}
              </span>
            )}

            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && !clienteSeleccionado) {
                    alert("Seleccioná un cliente para continuar");
                    return;
                  }
                  if (step === 2 && items.length === 0) {
                    alert("Agregá al menos un producto");
                    return;
                  }
                  setStep(step + 1);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {guardando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  "✅ Confirmar Pedido"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

            


  );
}
