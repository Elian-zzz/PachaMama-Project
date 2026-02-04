// src/app/components/screens/DashboardScreen.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Helper: formatear número como moneda
function formatMoney(n) {
  return "$" + n.toLocaleString("es-UY", { minimumFractionDigits: 0 });
}

// Helper: obtener últimos 7 días
function getUltimos7Dias() {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    dias.push(fecha.toISOString().split("T")[0]);
  }
  return dias;
}

export function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState({
    // KPIs
    ingresosHoy: 0,
    pedidosActivos: 0,
    totalClientes: 0,
    gananciaEstaSemana: 0,

    // Gráfico
    ventasUltimos7Dias: [],

    // Listas
    pedidosRecientes: [],
    productosMasVendidos: [],
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Obtener fechas
      const hoy = new Date().toISOString().split("T")[0];
      const ultimos7Dias = getUltimos7Dias();
      const hace7Dias = ultimos7Dias[0];

      // 1. INGRESOS DE HOY
      const { data: pedidosHoy } = await supabase
        .from("pedidos")
        .select("total")
        .in("estado", ["confirmado", "preparado", "entregado"])
        .gte("created_at", hoy)
        .lte("created_at", hoy + "T23:59:59");

      const ingresosHoy = pedidosHoy?.reduce((sum, p) => sum + p.total, 0) || 0;

      // 2. PEDIDOS ACTIVOS (confirmados + preparados)
      const { data: pedidosActivosData } = await supabase
        .from("pedidos")
        .select("id")
        .in("estado", ["confirmado", "preparado"]);

      const pedidosActivos = pedidosActivosData?.length || 0;

      // 3. TOTAL CLIENTES
      const { data: clientesData } = await supabase
        .from("clientes")
        .select("id", { count: "exact" });

      const totalClientes = clientesData?.length || 0;

      // 4. GANANCIA ESTA SEMANA (ingresos - gastos)
      const { data: pedidosSemana } = await supabase
        .from("pedidos")
        .select("total")
        .in("estado", ["confirmado", "preparado", "entregado"])
        .gte("created_at", hace7Dias);

      const ingresosSemana =
        pedidosSemana?.reduce((sum, p) => sum + p.total, 0) || 0;

      const { data: gastosSemana } = await supabase
        .from("gastos")
        .select("monto")
        .gte("fecha", hace7Dias);

      const totalGastosSemana =
        gastosSemana?.reduce((sum, g) => sum + g.monto, 0) || 0;
      const gananciaEstaSemana = ingresosSemana - totalGastosSemana;

      // 5. VENTAS ÚLTIMOS 7 DÍAS (para gráfico)
      const { data: pedidosUltimos7 } = await supabase
        .from("pedidos")
        .select("created_at, total")
        .in("estado", ["confirmado", "preparado", "entregado"])
        .gte("created_at", hace7Dias)
        .order("created_at");

      // Agrupar por día
      const ventasPorDia = {};
      ultimos7Dias.forEach((dia) => {
        ventasPorDia[dia] = 0;
      });

      pedidosUltimos7?.forEach((p) => {
        const fecha = p.created_at.split("T")[0];
        if (ventasPorDia[fecha] !== undefined) {
          ventasPorDia[fecha] += p.total;
        }
      });

      const ventasUltimos7Dias = ultimos7Dias.map((fecha) => ({
        fecha: new Date(fecha + "T00:00:00").toLocaleDateString("es-UY", {
          day: "2-digit",
          month: "2-digit",
        }),
        ventas: ventasPorDia[fecha],
      }));

      // 6. PEDIDOS RECIENTES (últimos 5)
      const { data: pedidosRecientesData } = await supabase
        .from("pedidos")
        .select(
          `
          id,
          total,
          estado,
          created_at,
          clientes (nombre),
          pedido_items (
            cantidad,
            productos (nombre)
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(5);

      const pedidosRecientes =
        pedidosRecientesData?.map((p) => ({
          id: p.id,
          cliente: p.clientes?.nombre || "Sin nombre",
          productos:
            p.pedido_items
              ?.map((item) => item.productos?.nombre)
              .filter(Boolean)
              .join(", ") || "Sin productos",
          total: p.total,
          estado: p.estado,
          fecha: new Date(p.created_at).toLocaleDateString("es-UY"),
        })) || [];

      // 7. PRODUCTOS MÁS VENDIDOS (esta semana)
      const { data: itemsSemana } = await supabase
        .from("pedido_items")
        .select(
          `
          cantidad,
          precio_unitario,
          productos (nombre)
        `,
        )
        .gte("created_at", hace7Dias);

      const productosMap = {};
      itemsSemana?.forEach((item) => {
        const nombre = item.productos?.nombre;
        if (!nombre) return;

        if (!productosMap[nombre]) {
          productosMap[nombre] = { cantidad: 0, ingresos: 0 };
        }
        productosMap[nombre].cantidad += item.cantidad;
        productosMap[nombre].ingresos += item.cantidad * item.precio_unitario;
      });

      const productosMasVendidos = Object.keys(productosMap)
        .map((nombre) => ({
          nombre,
          cantidad: productosMap[nombre].cantidad,
          ingresos: productosMap[nombre].ingresos,
        }))
        .sort((a, b) => b.ingresos - a.ingresos)
        .slice(0, 5);

      // Actualizar estado
      setDatos({
        ingresosHoy,
        pedidosActivos,
        totalClientes,
        gananciaEstaSemana,
        ventasUltimos7Dias,
        pedidosRecientes,
        productosMasVendidos,
      });
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Badge de estado
  const getEstadoBadge = (estado) => {
    const estilos = {
      borrador: "bg-gray-100 text-gray-800",
      confirmado: "bg-yellow-100 text-yellow-800",
      preparado: "bg-blue-100 text-blue-800",
      entregado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
    };

    const textos = {
      borrador: "Borrador",
      confirmado: "Confirmado",
      preparado: "Preparado",
      entregado: "Entregado",
      cancelado: "Cancelado",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${estilos[estado] || estilos.borrador}`}
      >
        {textos[estado] || estado}
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Resumen de tu negocio -{" "}
            {new Date().toLocaleDateString("es-UY", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={cargarDatos}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos Hoy */}
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Ingresos Hoy</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {formatMoney(datos.ingresosHoy)}
              </p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <span className="text-xl">💵</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Pedidos confirmados y entregados
          </p>
        </div>

        {/* Pedidos Activos */}
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Pedidos Activos
              </p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {datos.pedidosActivos}
              </p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-xl">📦</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Confirmados y en preparación
          </p>
        </div>

        {/* Total Clientes */}
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Clientes
              </p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {datos.totalClientes}
              </p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <span className="text-xl">👥</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Base de clientes registrados
          </p>
        </div>

        {/* Ganancia Semanal */}
        <div
          className={`bg-white rounded-xl shadow p-5 border ${
            datos.gananciaEstaSemana >= 0
              ? "border-green-200"
              : "border-red-200"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Ganancia Semanal
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  datos.gananciaEstaSemana >= 0
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {formatMoney(datos.gananciaEstaSemana)}
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                datos.gananciaEstaSemana >= 0 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span className="text-xl">
                {datos.gananciaEstaSemana >= 0 ? "💰" : "⚠️"}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Últimos 7 días (ingresos - gastos)
          </p>
        </div>
      </div>

      {/* Gráfico de Ventas */}
      <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Ventas de los Últimos 7 Días
        </h2>
        {datos.ventasUltimos7Dias.every((d) => d.ventas === 0) ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No hay ventas registradas en los últimos 7 días
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={datos.ventasUltimos7Dias}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value) => [formatMoney(value), "Ventas"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Fila inferior: Pedidos Recientes + Productos Más Vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos Recientes */}
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Pedidos Recientes
          </h2>
          {datos.pedidosRecientes.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No hay pedidos recientes
            </div>
          ) : (
            <div className="space-y-3">
              {datos.pedidosRecientes.map((pedido) => (
                <div
                  key={pedido.id}
                  className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-800">
                        {pedido.cliente}
                      </p>
                      {getEstadoBadge(pedido.estado)}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {pedido.productos}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{pedido.fecha}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-bold text-green-700">
                      {formatMoney(pedido.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productos Más Vendidos */}
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Productos Más Vendidos (Esta Semana)
          </h2>
          {datos.productosMasVendidos.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No hay datos de productos esta semana
            </div>
          ) : (
            <div className="space-y-3">
              {datos.productosMasVendidos.map((producto, idx) => {
                const maxIngresos =
                  datos.productosMasVendidos[0]?.ingresos || 1;
                const porcentaje = (producto.ingresos / maxIngresos) * 100;

                return (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {idx + 1}. {producto.nombre}
                      </span>
                      <span className="text-sm font-semibold text-green-700">
                        {formatMoney(producto.ingresos)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {producto.cantidad} unidades vendidas
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
