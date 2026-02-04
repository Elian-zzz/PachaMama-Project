// src/app/components/screens/FinanzasScreen.jsx
import { useState } from "react";
import { useFinanzas, useGastos } from "../../../hooks/useSupabaseData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Helper: obtener lunes y domingo de la semana actual
function getSemanActual() {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0=dom, 1=lun...
  const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1);

  const lunes = new Date(hoy.setDate(diff));
  const domingo = new Date(lunes);
  domingo.setDate(domingo.getDate() + 6);

  return {
    desde: lunes.toISOString().split("T")[0],
    hasta: domingo.toISOString().split("T")[0],
  };
}

// Helper: formatear número como moneda
function formatMoney(n) {
  return "$" + n.toLocaleString("es-UY", { minimumFractionDigits: 0 });
}

const CATEGORIAS_GASTOS = [
  "Logística",
  "Compras",
  "Publicidad",
  "Servicios",
  "Otro",
];

export function FinanzasScreen() {
  const semana = getSemanActual();
  const [fechaDesde, setFechaDesde] = useState(semana.desde);
  const [fechaHasta, setFechaHasta] = useState(semana.hasta);

  const finanzas = useFinanzas(fechaDesde, fechaHasta);
  const { gastos, crear: crearGasto } = useGastos();

  // Formulario de gasto
  const [formGasto, setFormGasto] = useState({
    nombre: "",
    categoria: "Otro",
    monto: 0,
    fecha: new Date().toISOString().split("T")[0],
    detalles: "",
  });
  const [guardandoGasto, setGuardandoGasto] = useState(false);

  const handleCrearGasto = async () => {
    if (!formGasto.nombre.trim()) {
      alert("El nombre del gasto es obligatorio");
      return;
    }
    if (!formGasto.monto || formGasto.monto <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    setGuardandoGasto(true);
    const gastoData = {
      nombre: formGasto.nombre,
      categoria: formGasto.categoria,
      monto: formGasto.monto,
      fecha: formGasto.fecha,
      detalles: formGasto.detalles || "",
    };
    const resultado = await crearGasto(gastoData);

    if (resultado.success) {
      setFormGasto({
        nombre: "",
        categoria: "Otro",
        monto: 0,
        fecha: new Date().toISOString().split("T")[0],
        detalles: "",
      });
      finanzas.refetch();
    } else {
      alert("Error al guardar: " + resultado.error);
    }
    setGuardandoGasto(false);
  };

  // Datos del gráfico
  const datosGrafico = finanzas.ingresosPorDia.map((d) => ({
    fecha: d.fecha,
    Ingresos: d.ingresos,
  }));

  // Gastos filtrados por rango de fecha
  const gastosFiltrados = gastos.filter((g) => {
    if (!g.fecha || !fechaDesde || !fechaHasta) return false;
    return g.fecha >= fechaDesde && g.fecha <= fechaHasta;
  });

  // Gastos agrupados por categoría
  const gastosPorCategoria = gastosFiltrados.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto;
    return acc;
  }, {});

  if (finanzas.loading) {
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
        <h1 className="text-2xl font-bold text-gray-900">Balance Financiero</h1>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <span className="text-gray-400 text-sm">hasta</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={() => {
              const s = getSemanActual();
              setFechaDesde(s.desde);
              setFechaHasta(s.hasta);
            }}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
          >
            Esta semana
          </button>
        </div>
      </div>

      {/* Cards KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ingresos */}
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Ingresos</p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {formatMoney(finanzas.totalIngresos)}
              </p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <span className="text-xl">📈</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            De {finanzas.ingresosPorDia.length} día(s) con pedidos
          </p>
        </div>

        {/* Gastos */}
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Gastos</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {formatMoney(finanzas.totalGastos)}
              </p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <span className="text-xl">📉</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {gastosFiltrados.length} gasto(s) registrado(s)
          </p>
        </div>

        {/* Ganancia */}
        <div
          className={`bg-white rounded-xl shadow p-5 border ${
            finanzas.ganancia >= 0 ? "border-green-200" : "border-red-200"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Ganancia Neta</p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  finanzas.ganancia >= 0 ? "text-green-700" : "text-red-600"
                }`}
              >
                {formatMoney(finanzas.ganancia)}
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                finanzas.ganancia >= 0 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span className="text-xl">
                {finanzas.ganancia >= 0 ? "💰" : "⚠️"}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Ingresos − Gastos del período
          </p>
        </div>
      </div>

      {/* Gráfico de ingresos por día */}
      <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Ingresos por Día
        </h2>
        {datosGrafico.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No hay datos de ingresos en este período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={datosGrafico}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value) =>
                  value ? [formatMoney(value), "Ingresos"] : ["$0", "Ingresos"]
                }
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Fila inferior: Productos más vendidos + Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos más vendidos/rentables */}
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Productos Más Rentables
          </h2>
          {finanzas.productosMasVendidos.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No hay datos de productos en este período
            </div>
          ) : (
            <div className="space-y-3">
              {finanzas.productosMasVendidos.map((producto, idx) => {
                const primerProducto = finanzas.productosMasVendidos[0];
                const maxIngresos = primerProducto
                  ? primerProducto.ingresos
                  : 1;
                const porcentaje =
                  maxIngresos > 0 ? (producto.ingresos / maxIngresos) * 100 : 0;

                return (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {producto.nombre}
                      </span>
                      <span className="text-sm font-semibold text-green-700">
                        {formatMoney(producto.ingresos)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
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

        {/* Sección de Gastos */}
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Gastos Declarados
          </h2>

          {/* Formulario de nuevo gasto */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nombre del gasto *
                </label>
                <input
                  type="text"
                  value={formGasto.nombre}
                  onChange={(e) =>
                    setFormGasto({ ...formGasto, nombre: e.target.value })
                  }
                  placeholder="Ej: Combustible"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  value={formGasto.monto || ""}
                  onChange={(e) =>
                    setFormGasto({
                      ...formGasto,
                      monto: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="500"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Categoría
                </label>
                <select
                  value={formGasto.categoria}
                  onChange={(e) =>
                    setFormGasto({ ...formGasto, categoria: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {CATEGORIAS_GASTOS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formGasto.fecha}
                  onChange={(e) =>
                    setFormGasto({ ...formGasto, fecha: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Detalles (opcional)
              </label>
              <input
                type="text"
                value={formGasto.detalles}
                onChange={(e) =>
                  setFormGasto({ ...formGasto, detalles: e.target.value })
                }
                placeholder="Descripción adicional..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleCrearGasto}
              disabled={guardandoGasto}
              className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardandoGasto ? "Guardando..." : "+ Agregar Gasto"}
            </button>
          </div>

          {/* Lista de gastos del período */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {gastosFiltrados.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">
                No hay gastos en este período
              </p>
            ) : (
              gastosFiltrados.map((gasto) => (
                <div
                  key={gasto.id}
                  className="flex justify-between items-start bg-gray-50 p-3 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {gasto.nombre}
                    </p>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {gasto.categoria}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(gasto.fecha + "T00:00:00").toLocaleDateString(
                          "es-UY",
                        )}
                      </span>
                    </div>
                    {gasto.detalles && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">
                        {gasto.detalles}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {formatMoney(gasto.monto)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Total de gastos por categoría */}
          {Object.keys(gastosPorCategoria).length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Por categoría
              </p>
              <div className="space-y-1">
                {Object.entries(gastosPorCategoria)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, monto]) => (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="text-gray-600">{cat}</span>
                      <span className="font-medium text-gray-800">
                        {formatMoney(monto)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
