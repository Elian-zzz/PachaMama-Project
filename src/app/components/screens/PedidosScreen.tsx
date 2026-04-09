// src/app/components/screens/PedidosScreen.tsx
import { useState } from "react";
import { NuevoPedidoModal } from "../NuevoPedidoModal";
import { usePedidos, useStock } from "../../../hooks/useSupabaseData";
import { Pedido } from "../../../services/supabase";

type EstadoFilter = "todos" | Pedido["estado"];

export function PedidosScreen() {
  const { pedidos, loading, cambiarEstado, refetch } = usePedidos();
  const { devolverStockPorCancelacion } = useStock();

  const [filtroEstado, setFiltroEstado] = useState<EstadoFilter>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null,
  );
  const [mostrarModal, setMostrarModal] = useState(false);

  // ─── Handler de cambio de estado con devolución de stock al cancelar ───
  const handleCambiarEstado = async (
    pedidoId: string,
    nuevoEstado: Pedido["estado"],
  ) => {
    // Si se cancela un pedido que ya tenía stock descontado → devolver stock
    if (nuevoEstado === "cancelado") {
      const pedidoActual = pedidos.find((p) => p.id === pedidoId);
      const estadosConStockDescontado: Pedido["estado"][] = [
        "confirmado",
        "preparado",
      ];
      if (
        pedidoActual &&
        estadosConStockDescontado.includes(pedidoActual.estado)
      ) {
        await devolverStockPorCancelacion(pedidoId);
      }
    }

    const resultado = await cambiarEstado(pedidoId, nuevoEstado);
    if (!resultado.success) {
      alert("Error al cambiar estado: " + resultado.error);
    }
  };

  // ─── Filtrado ───
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const matchEstado =
      filtroEstado === "todos" || pedido.estado === filtroEstado;
    const matchBusqueda =
      pedido.clientes?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.clientes?.telefono.includes(busqueda);
    return matchEstado && matchBusqueda;
  });

  // ─── Helpers visuales ───
  const getEstadoBadge = (estado: Pedido["estado"]) => {
    const estilos: Record<Pedido["estado"], string> = {
      borrador: "bg-gray-100 text-gray-800",
      confirmado: "bg-yellow-100 text-yellow-800",
      preparado: "bg-blue-100 text-blue-800",
      entregado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
    };
    const iconos: Record<Pedido["estado"], string> = {
      borrador: "📝",
      confirmado: "✅",
      preparado: "📦",
      entregado: "🚚",
      cancelado: "❌",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${estilos[estado]}`}
      >
        {iconos[estado]} {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  // Opciones de transición de estado válidas por estado actual
  const getSiguientesEstados = (
    estadoActual: Pedido["estado"],
  ): Pedido["estado"][] => {
    const transiciones: Record<Pedido["estado"], Pedido["estado"][]> = {
      borrador: ["confirmado", "cancelado"],
      confirmado: ["preparado", "cancelado"],
      preparado: ["entregado", "cancelado"],
      entregado: [],
      cancelado: [],
    };
    return transiciones[estadoActual] ?? [];
  };

  const formatMoney = (n: number) =>
    n.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });

  // ─── Loading ───
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
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <button
          onClick={() => setMostrarModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
        >
          + Nuevo Pedido Manual
        </button>

        {mostrarModal && (
          <NuevoPedidoModal
            onClose={() => setMostrarModal(false)}
            onPedidoCreado={() => {
              setMostrarModal(false);
              refetch();
            }}
          />
        )}
      </div>

      {/* ── Filtros ── */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Buscar por cliente, teléfono o ID..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="todos">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="confirmado">Confirmado</option>
          <option value="preparado">Preparado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* ── Tabs rápidos de estado ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(["todos", "confirmado", "preparado", "entregado"] as const).map(
          (estado) => {
            const count =
              estado === "todos"
                ? pedidos.length
                : pedidos.filter((p) => p.estado === estado).length;
            return (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado as EstadoFilter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filtroEstado === estado
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {estado.charAt(0).toUpperCase() + estado.slice(1)} ({count})
              </button>
            );
          },
        )}
      </div>

      {/* ── Tabla ── */}
      {pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <p className="text-lg mb-2">No hay pedidos</p>
          <p className="text-sm">
            {busqueda || filtroEstado !== "todos"
              ? "Probá con otros filtros"
              : "Los pedidos aparecerán acá"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50">
                  {/* ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-500">
                      {pedido.id.slice(0, 8)}...
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {pedido.clientes?.nombre || "Sin nombre"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pedido.clientes?.telefono}
                    </div>
                  </td>

                  {/* Productos */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {pedido.pedido_items?.length || 0} producto
                      {(pedido.pedido_items?.length || 0) !== 1 ? "s" : ""}
                    </div>
                    <div className="text-xs text-gray-500">
                      {pedido.pedido_items
                        ?.slice(0, 2)
                        .map((item) => item.productos?.nombre)
                        .join(", ")}
                      {(pedido.pedido_items?.length || 0) > 2 && "..."}
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatMoney(pedido.total)}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEstadoBadge(pedido.estado)}
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pedido.created_at).toLocaleDateString("es-UY")}
                    <br />
                    <span className="text-xs">
                      {new Date(pedido.created_at).toLocaleTimeString("es-UY", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end items-center gap-2 flex-wrap">
                      {/* Ver detalle */}
                      <button
                        onClick={() => setPedidoSeleccionado(pedido)}
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        👁️ Ver
                      </button>

                      {/* Transiciones de estado disponibles */}
                      {getSiguientesEstados(pedido.estado).map(
                        (siguienteEstado) => {
                          const estiloBoton: Record<string, string> = {
                            confirmado:
                              "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                            preparado:
                              "bg-blue-100 text-blue-800 hover:bg-blue-200",
                            entregado:
                              "bg-green-100 text-green-800 hover:bg-green-200",
                            cancelado:
                              "bg-red-100 text-red-700 hover:bg-red-200",
                          };
                          const labelBoton: Record<string, string> = {
                            confirmado: "Confirmar",
                            preparado: "Preparar",
                            entregado: "Entregar",
                            cancelado: "Cancelar",
                          };
                          return (
                            <button
                              key={siguienteEstado}
                              onClick={() =>
                                handleCambiarEstado(pedido.id, siguienteEstado)
                              }
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${estiloBoton[siguienteEstado]}`}
                            >
                              {labelBoton[siguienteEstado]}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal de detalle del pedido ── */}
      {pedidoSeleccionado && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setPedidoSeleccionado(null)
          }
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            {/* Header modal */}
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Detalle del pedido
                </h2>
                <p className="text-xs font-mono text-gray-400 mt-0.5">
                  {pedidoSeleccionado.id}
                </p>
              </div>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* Cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                  Cliente
                </p>
                <p className="font-semibold text-gray-900">
                  {pedidoSeleccionado.clientes?.nombre}
                </p>
                <p className="text-sm text-gray-500">
                  {pedidoSeleccionado.clientes?.telefono}
                </p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Productos
                </p>
                <div className="space-y-2">
                  {pedidoSeleccionado.pedido_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.productos?.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.cantidad} {item.productos?.unidad} ×{" "}
                          {formatMoney(item.precio_unitario)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatMoney(item.cantidad * item.precio_unitario)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              {pedidoSeleccionado.observaciones && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-yellow-700 mb-1">
                    Observaciones
                  </p>
                  <p className="text-sm text-gray-700">
                    {pedidoSeleccionado.observaciones}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="bg-gray-900 rounded-lg px-4 py-3 flex justify-between items-center">
                <span className="text-white font-semibold">Total</span>
                <span className="text-xl font-bold text-green-400">
                  {formatMoney(pedidoSeleccionado.total)}
                </span>
              </div>

              {/* Estado y acciones rápidas dentro del modal */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Estado:</span>
                  {getEstadoBadge(pedidoSeleccionado.estado)}
                </div>
                <div className="flex gap-2">
                  {getSiguientesEstados(pedidoSeleccionado.estado).map(
                    (siguienteEstado) => {
                      const estiloBoton: Record<string, string> = {
                        confirmado:
                          "bg-yellow-500 text-white hover:bg-yellow-600",
                        preparado: "bg-blue-500 text-white hover:bg-blue-600",
                        entregado: "bg-green-600 text-white hover:bg-green-700",
                        cancelado: "bg-red-500 text-white hover:bg-red-600",
                      };
                      const labelBoton: Record<string, string> = {
                        confirmado: "✅ Confirmar",
                        preparado: "📦 Preparar",
                        entregado: "🚚 Entregar",
                        cancelado: "❌ Cancelar",
                      };
                      return (
                        <button
                          key={siguienteEstado}
                          onClick={async () => {
                            await handleCambiarEstado(
                              pedidoSeleccionado.id,
                              siguienteEstado,
                            );
                            // Refrescar el pedido seleccionado en el modal
                            setPedidoSeleccionado((prev) =>
                              prev
                                ? { ...prev, estado: siguienteEstado }
                                : null,
                            );
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${estiloBoton[siguienteEstado]}`}
                        >
                          {labelBoton[siguienteEstado]}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
