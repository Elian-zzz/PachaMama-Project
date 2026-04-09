// src/app/components/NuevoPedidoModal.jsx
// VERSIÓN ACTUALIZADA — con descuento de stock al confirmar y aplicación de ofertas
import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";

export function NuevoPedidoModal({ onClose, onPedidoCreado }) {
  const [step, setStep] = useState(1); // 1: cliente, 2: productos, 3: confirmar
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [items, setItems] = useState([]); // { producto, cantidad, ofertaAplicada: null | Oferta }
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [{ data: cls }, { data: prds }, { data: ofs }] = await Promise.all([
      supabase.from("clientes").select("*").order("nombre"),
      supabase
        .from("productos")
        .select("*")
        .eq("disponible", true)
        .order("nombre"),
      supabase
        .from("ofertas")
        .select("*, productos(id, nombre, precio, unidad)")
        .eq("activa", true),
    ]);
    setClientes(cls || []);
    setProductos(prds || []);
    setOfertas(ofs || []);
  };

  // ---- Lógica de ofertas ----
  const evaluarOfertaParaItem = (producto, cantidad) => {
    if (!cantidad || cantidad <= 0) return null;
    const ofertaAplicable = ofertas.find((o) => {
      if (o.producto_id !== producto.id) return false;
      if (o.tipo_oferta === "exacta") return cantidad === o.cantidad_condicion;
      if (o.tipo_oferta === "minima") return cantidad >= o.cantidad_condicion;
      return false;
    });
    return ofertaAplicable || null;
  };

  const calcularPrecioItem = (item) => {
    if (!item.ofertaAplicada) return item.cantidad * item.producto.precio;
    if (item.ofertaAplicada.tipo_oferta === "exacta")
      return item.ofertaAplicada.precio_oferta;
    return item.ofertaAplicada.precio_oferta * item.cantidad;
  };

  const calcularAhorroItem = (item) => {
    const precioNormal = item.cantidad * item.producto.precio;
    const precioConOferta = calcularPrecioItem(item);
    return precioNormal - precioConOferta;
  };

  // ---- Manejo de items ----
  const handleCantidadChange = (producto, cantidad) => {
    const cant = parseFloat(cantidad) || 0;
    if (cant <= 0) {
      setItems((prev) => prev.filter((i) => i.producto.id !== producto.id));
      return;
    }

    // Evaluar oferta automáticamente
    const oferta = evaluarOfertaParaItem(producto, cant);

    setItems((prev) => {
      const existe = prev.find((i) => i.producto.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.producto.id === producto.id
            ? { ...i, cantidad: cant, ofertaAplicada: oferta }
            : i,
        );
      }
      return [...prev, { producto, cantidad: cant, ofertaAplicada: oferta }];
    });
  };

  const toggleOfertaManual = (productoId) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.producto.id !== productoId) return i;
        const oferta = evaluarOfertaParaItem(i.producto, i.cantidad);
        // Si ya tiene oferta → quitarla; si no → aplicarla
        return { ...i, ofertaAplicada: i.ofertaAplicada ? null : oferta };
      }),
    );
  };

  const getCantidad = (productoId) => {
    const item = items.find((i) => i.producto.id === productoId);
    return item ? item.cantidad : "";
  };

  const getOfertaDisponible = (producto, cantidad) => {
    if (!cantidad || cantidad <= 0) return null;
    return evaluarOfertaParaItem(producto, parseFloat(cantidad));
  };

  // Total general
  const total = items.reduce((sum, i) => sum + calcularPrecioItem(i), 0);
  const ahorroTotal = items.reduce((sum, i) => sum + calcularAhorroItem(i), 0);

  const formatMoney = (n) =>
    n.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });

  // ---- Guardar pedido con descuento de stock ----
  const handleGuardar = async () => {
    if (!clienteSeleccionado) return alert("Seleccioná un cliente");
    if (items.length === 0) return alert("Agregá al menos un producto");

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

      // 2. Insertar items (con precio de oferta si aplica)
      const itemsInsert = items.map((i) => ({
        pedido_id: pedido.id,
        producto_id: i.producto.id,
        cantidad: i.cantidad,
        precio_unitario: i.ofertaAplicada
          ? calcularPrecioItem(i) / i.cantidad // precio efectivo por unidad
          : i.producto.precio,
      }));

      const { error: itemsError } = await supabase
        .from("pedido_items")
        .insert(itemsInsert);

      if (itemsError) throw itemsError;

      // 3. Descontar stock por cada producto del pedido
      for (const item of items) {
        // Registrar movimiento de salida
        await supabase.from("stock_movimientos").insert([
          {
            producto_id: item.producto.id,
            tipo: "salida",
            cantidad: item.cantidad,
            pedido_id: pedido.id,
            notas: "Salida por pedido confirmado",
          },
        ]);

        // Actualizar stock del producto
        const { data: prod } = await supabase
          .from("productos")
          .select("stock")
          .eq("id", item.producto.id)
          .single();

        const stockActual = prod?.stock ?? 0;
        await supabase
          .from("productos")
          .update({ stock: stockActual - item.cantidad })
          .eq("id", item.producto.id);
      }

      if (onPedidoCreado) onPedidoCreado(pedido);
      onClose();
    } catch (error) {
      console.error("Error creando pedido:", error);
      alert("Error al crear el pedido: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  // ---- Cancelar pedido existente (devolver stock) ----
  // Esta función se llama desde PedidosScreen al cambiar estado a "cancelado"
  // Está implementada en el hook useStock como devolverStockPorCancelacion(pedido_id)

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      c.telefono.includes(busquedaCliente),
  );

  return (
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
                    className={`text-xs ${step === idx + 1 ? "text-green-600 font-medium" : "text-gray-400"}`}
                  >
                    {label}
                  </span>
                  {idx < 2 && <span className="text-gray-300 text-xs">›</span>}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* ---- STEP 1: Cliente ---- */}
          {step === 1 && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="🔍 Buscar cliente..."
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => setClienteSeleccionado(cliente)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      clienteSeleccionado?.id === cliente.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium text-gray-900">
                      {cliente.nombre}
                    </p>
                    <p className="text-sm text-gray-500">{cliente.telefono}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---- STEP 2: Productos ---- */}
          {step === 2 && (
            <div className="space-y-3">
              {productos.map((producto) => {
                const cantidad = getCantidad(producto.id);
                const item = items.find((i) => i.producto.id === producto.id);
                const ofertaDisponible = getOfertaDisponible(
                  producto,
                  cantidad,
                );
                const ofertaAplicada = item?.ofertaAplicada;

                return (
                  <div
                    key={producto.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      cantidad
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {producto.nombre}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-gray-500">
                          ${producto.precio}/{producto.unidad}
                        </p>
                        {/* Botón aplicar/quitar oferta */}
                        {ofertaDisponible && (
                          <button
                            onClick={() => toggleOfertaManual(producto.id)}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                              ofertaAplicada
                                ? "bg-green-600 text-white"
                                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            }`}
                          >
                            {ofertaAplicada
                              ? `✅ Oferta: ${ofertaDisponible.descripcion || ""}`
                              : `🏷️ Aplicar oferta`}
                          </button>
                        )}
                        {ofertaAplicada && (
                          <p className="text-xs text-green-600 font-medium">
                            Ahorro: {formatMoney(calcularAhorroItem(item))}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={cantidad}
                        onChange={(e) =>
                          handleCantidadChange(producto, e.target.value)
                        }
                        placeholder="0"
                        className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-400 w-8">
                        {producto.unidad}
                      </span>
                      {cantidad ? (
                        <span className="text-sm font-semibold text-green-700 w-16 text-right">
                          {formatMoney(item ? calcularPrecioItem(item) : 0)}
                        </span>
                      ) : (
                        <span className="w-16" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---- STEP 3: Confirmar ---- */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </p>
                <p className="font-semibold text-gray-900">
                  {clienteSeleccionado?.nombre}
                </p>
                <p className="text-sm text-gray-500">
                  {clienteSeleccionado?.telefono}
                </p>
              </div>

              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <p className="text-sm font-semibold text-gray-700">
                    Resumen del pedido
                  </p>
                </div>
                {items.map((item) => (
                  <div
                    key={item.producto.id}
                    className="flex justify-between items-center px-4 py-2.5 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.producto.nombre}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.cantidad} {item.producto.unidad}
                        {item.ofertaAplicada && (
                          <span className="ml-2 text-green-600 font-medium">
                            🏷️{" "}
                            {item.ofertaAplicada.descripcion ||
                              "Oferta aplicada"}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatMoney(calcularPrecioItem(item))}
                      </p>
                      {item.ofertaAplicada && (
                        <p className="text-xs text-green-600">
                          -{formatMoney(calcularAhorroItem(item))}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {ahorroTotal > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex justify-between items-center">
                  <span className="text-sm text-green-700 font-medium">
                    🏷️ Ahorro total por ofertas
                  </span>
                  <span className="text-sm font-bold text-green-700">
                    -{formatMoney(ahorroTotal)}
                  </span>
                </div>
              )}

              <div className="bg-gray-900 rounded-lg px-4 py-3 flex justify-between items-center">
                <span className="text-white font-semibold">
                  Total del pedido
                </span>
                <span className="text-xl font-bold text-green-400">
                  {formatMoney(total)}
                </span>
              </div>

              <textarea
                placeholder="Observaciones (opcional)..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Footer con navegación */}
        <div className="border-t p-5 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              ← Atrás
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Cancelar
            </button>
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              disabled={!clienteSeleccionado}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Elegir productos →
            </button>
          )}

          {step === 2 && (
            <div className="flex items-center gap-4">
              {items.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{items.length}</span> producto
                  {items.length > 1 ? "s" : ""} —{" "}
                  <span className="font-bold text-green-700">
                    {formatMoney(total)}
                  </span>
                </p>
              )}
              <button
                onClick={() => setStep(3)}
                disabled={items.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Revisar pedido →
              </button>
            </div>
          )}

          {step === 3 && (
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm font-medium"
            >
              {guardando ? "Guardando..." : "✅ Confirmar pedido"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
