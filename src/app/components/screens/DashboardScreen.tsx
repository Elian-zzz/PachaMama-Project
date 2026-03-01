// src/app/components/screens/DashboardScreen.tsx
import { useDashboard } from "../../../hooks/useDashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function formatMoney(n: number): string {
  return "$" + n.toLocaleString("es-UY", { minimumFractionDigits: 0 });
}

const ESTADO_ESTILOS: Record<string, string> = {
  borrador: "bg-gray-100 text-gray-800",
  confirmado: "bg-yellow-100 text-yellow-800",
  preparado: "bg-blue-100 text-blue-800",
  entregado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

const ESTADO_TEXTOS: Record<string, string> = {
  borrador: "Borrador",
  confirmado: "Confirmado",
  preparado: "Preparado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export function DashboardScreen() {
  const {
    ingresosHoy,
    pedidosActivos,
    totalClientes,
    gananciaEstaSemana,
    ventasUltimos7Dias,
    pedidosRecientes,
    productosMasVendidos,
    loading,
    error,
    refetch,
  } = useDashboard();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700 text-sm">
            Error al cargar el dashboard: {error}
          </p>
          <button
            onClick={refetch}
            className="text-sm text-red-600 underline hover:text-red-800 ml-4"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={refetch}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium">
            Ingresos Hoy
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatMoney(ingresosHoy)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium">
            Pedidos Activos
          </p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {pedidosActivos}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium">
            Total Clientes
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {totalClientes}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium">
            Ganancia Semanal
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${gananciaEstaSemana >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatMoney(gananciaEstaSemana)}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Ventas últimos 7 días
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={ventasUltimos7Dias}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `$${v.toLocaleString("es-UY")}`}
            />
            <Tooltip
              formatter={(value: number | undefined) => formatMoney(value ?? 0)}
            />
            <Line
              type="monotone"
              dataKey="ventas"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pedidos recientes + Productos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos recientes */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Pedidos Recientes
          </h2>
          {pedidosRecientes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Sin pedidos recientes
            </p>
          ) : (
            <div className="space-y-3">
              {pedidosRecientes.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {p.cliente}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {p.productos}
                    </p>
                    <p className="text-xs text-gray-400">{p.fecha}</p>
                  </div>
                  <div className="ml-3 text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {formatMoney(p.total)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_ESTILOS[p.estado] ?? ""}`}
                    >
                      {ESTADO_TEXTOS[p.estado] ?? p.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Productos más vendidos (semana)
          </h2>
          {productosMasVendidos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Sin ventas esta semana
            </p>
          ) : (
            <div className="space-y-3">
              {productosMasVendidos.map((prod, i) => (
                <div
                  key={prod.nombre}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {prod.nombre}
                      </p>
                      <p className="text-xs text-gray-400">
                        {prod.cantidad} unidades
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    {formatMoney(prod.ingresos)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
