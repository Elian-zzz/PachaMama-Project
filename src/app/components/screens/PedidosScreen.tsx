// src/app/screens/Orders.tsx
import { useState } from "react";
import { usePedidos } from "../../../hooks/useSupabaseData";
import { Pedido } from "../../../services/supabase";

type EstadoFilter = "todos" | Pedido["estado"];

export function PedidosScreen() {
  const { pedidos, loading, cambiarEstado } = usePedidos();
  const [filtroEstado, setFiltroEstado] = useState<EstadoFilter>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null,
  );

  const handleCambiarEstado = async (
    pedidoId: string,
    nuevoEstado: Pedido["estado"],
  ) => {
    const resultado = await cambiarEstado(pedidoId, nuevoEstado);
    if (!resultado.success) {
      alert("Error: " + resultado.error);
    }
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const matchEstado =
      filtroEstado === "todos" || pedido.estado === filtroEstado;
    const matchBusqueda =
      pedido.clientes?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.clientes?.telefono.includes(busqueda);

    return matchEstado && matchBusqueda;
  });

  // Badge de estado con colores
  const getEstadoBadge = (estado: Pedido["estado"]) => {
    const estilos = {
      borrador: "bg-gray-100 text-gray-800",
      confirmado: "bg-yellow-100 text-yellow-800",
      preparado: "bg-blue-100 text-blue-800",
      entregado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
    };

    const iconos = {
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
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <div className="flex gap-2">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {pedidos.length} pedidos totales
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-4">
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

      {/* Tabs de estados rápidos */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["todos", "confirmado", "preparado", "entregado"].map((estado) => {
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
        })}
      </div>

      {/* Tabla de pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <p className="text-lg mb-2">No hay pedidos</p>
          <p className="text-sm">
            {busqueda || filtroEstado !== "todos"
              ? "Probá con otros filtros"
              : "Los pedidos de WhatsApp aparecerán acá"}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-500">
                      {pedido.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {pedido.clientes?.nombre || "Sin nombre"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pedido.clientes?.telefono}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {pedido.pedido_items?.length || 0} productos
                    </div>
                    <div className="text-xs text-gray-500">
                      {pedido.pedido_items
                        ?.slice(0, 2)
                        .map((item) => item.productos?.nombre)
                        .join(", ")}
                      {(pedido.pedido_items?.length || 0) > 2 && "..."}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ${pedido.total}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEstadoBadge(pedido.estado)}
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => setPedidoSeleccionado(pedido)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      👁️ Ver
                    </button>
                    {pedido.estado !== "entregado" &&
                      pedido.estado !== "cancelado" && (
                        <select
                          value={pedido.estado}
                          onChange={(e) =>
                            handleCambiarEstado(
                              pedido.id,
                              e.target.value as Pedido["estado"],
                            )
                          }
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="confirmado">Confirmado</option>
                          <option value="preparado">Preparado</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelar</option>
                        </select>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalle (simplificado) */}
      {pedidoSeleccionado && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setPedidoSeleccionado(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Detalle del Pedido</h2>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium">
                  {pedidoSeleccionado.clientes?.nombre}
                </p>
                <p className="text-sm text-gray-600">
                  {pedidoSeleccionado.clientes?.telefono}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Productos</p>
                <div className="space-y-2">
                  {pedidoSeleccionado.pedido_items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between bg-gray-50 p-3 rounded"
                    >
                      <span>{item.productos?.nombre}</span>
                      <span className="font-medium">
                        {item.cantidad} {item.productos?.unidad} × $
                        {item.precio_unitario} = $
                        {item.cantidad * item.precio_unitario}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${pedidoSeleccionado.total}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Estado actual</p>
                {getEstadoBadge(pedidoSeleccionado.estado)}
              </div>

              {pedidoSeleccionado.observaciones && (
                <div>
                  <p className="text-sm text-gray-500">Observaciones</p>
                  <p className="text-gray-700">
                    {pedidoSeleccionado.observaciones}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
