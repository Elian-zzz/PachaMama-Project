import { TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";

const weeklyFinanceData = [
  { day: "Lun", ingresos: 4500, gastos: 2100 },
  { day: "Mar", ingresos: 5200, gastos: 2300 },
  { day: "Mié", ingresos: 4800, gastos: 1900 },
  { day: "Jue", ingresos: 6100, gastos: 2500 },
  { day: "Vie", ingresos: 7200, gastos: 2800 },
  { day: "Sáb", ingresos: 8500, gastos: 3200 },
  { day: "Dom", ingresos: 6800, gastos: 2400 },
];

const topProfitableProducts = [
  { nombre: "Lechuga", vendidos: 45, ingresos: 6750 },
  { nombre: "Tomate", vendidos: 38, ingresos: 7600 },
  { nombre: "Papa", vendidos: 52, ingresos: 5200 },
  { nombre: "Brócoli", vendidos: 28, ingresos: 7000 },
  { nombre: "Jengibre", vendidos: 15, ingresos: 5250 },
];

const initialExpenses = [
  {
    id: 1,
    nombre: "Compra de mercadería",
    monto: 12500,
    categoria: "Inventario",
    fecha: "2026-01-08",
  },
  {
    id: 2,
    nombre: "Transporte y logística",
    monto: 3200,
    categoria: "Operaciones",
    fecha: "2026-01-09",
  },
  {
    id: 3,
    nombre: "Embalaje y materiales",
    monto: 1800,
    categoria: "Operaciones",
    fecha: "2026-01-10",
  },
  {
    id: 4,
    nombre: "Servicios básicos",
    monto: 850,
    categoria: "Fijos",
    fecha: "2026-01-11",
  },
];

export function FinanzasScreen() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [newExpense, setNewExpense] = useState({
    nombre: "",
    monto: "",
    categoria: "Operaciones",
    fecha: "2026-01-13",
  });

  const totalIngresos = weeklyFinanceData.reduce(
    (sum, day) => sum + day.ingresos,
    0
  );
  const totalGastos = weeklyFinanceData.reduce(
    (sum, day) => sum + day.gastos,
    0
  );
  const gananciaNeta = totalIngresos - totalGastos;
  const margenGanancia = ((gananciaNeta / totalIngresos) * 100).toFixed(1);

  const handleAddExpense = () => {
    if (!newExpense.nombre || !newExpense.monto) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const expense = {
      id: expenses.length + 1,
      nombre: newExpense.nombre,
      monto: parseFloat(newExpense.monto),
      categoria: newExpense.categoria,
      fecha: newExpense.fecha,
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({
      nombre: "",
      monto: "",
      categoria: "Operaciones",
      fecha: "2026-01-13",
    });
    toast.success("Gasto agregado correctamente");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1>Balance Semanal</h1>
        <input
          type="week"
          defaultValue="2026-W02"
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-emerald-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-3xl mt-2">${totalIngresos.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-600">
                <TrendingUp size={16} />
                <span className="text-sm">Esta semana</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-red-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Gastos Totales</p>
              <p className="text-3xl mt-2">${totalGastos.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2 text-red-600">
                <TrendingDown size={16} />
                <span className="text-sm">Esta semana</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-blue-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Ganancia Neta</p>
              <p className="text-3xl mt-2">${gananciaNeta.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2 text-blue-600">
                <DollarSign size={16} />
                <span className="text-sm">{margenGanancia}% margen</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <h3 className="mb-4">Ingresos vs Gastos por Día</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={weeklyFinanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="ingresos" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="gastos" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Two columns: Profitable Products and Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitable Products */}
        <Card className="p-6">
          <h3 className="mb-4">Productos Más Rentables</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-3 text-sm text-gray-600">
                    Producto
                  </th>
                  <th className="text-left pb-3 text-sm text-gray-600">
                    Vendidos
                  </th>
                  <th className="text-left pb-3 text-sm text-gray-600">
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProfitableProducts.map((product, index) => (
                  <tr
                    key={product.nombre}
                    className={index % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <td className="py-3 text-sm">{product.nombre}</td>
                    <td className="py-3 text-sm text-gray-600">
                      {product.vendidos}
                    </td>
                    <td className="py-3 text-sm text-emerald-600">
                      ${product.ingresos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Expenses Form and List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Gastos Declarados</h3>
            <Button size="sm" variant="outline">
              <Plus size={16} className="mr-1" />
              Agregar Gasto
            </Button>
          </div>

          {/* Form */}
          <div className="p-4 bg-gray-50 rounded-lg mb-4 space-y-3">
            <div>
              <Label htmlFor="nombre">Nombre del gasto</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Ej: Compra de mercadería"
                value={newExpense.nombre}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, nombre: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="monto">Monto ($)</Label>
                <Input
                  id="monto"
                  type="number"
                  placeholder="0"
                  value={newExpense.monto}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, monto: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={newExpense.fecha}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, fecha: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <select
                id="categoria"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                value={newExpense.categoria}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, categoria: e.target.value })
                }
              >
                <option value="Inventario">Inventario</option>
                <option value="Operaciones">Operaciones</option>
                <option value="Fijos">Fijos</option>
                <option value="Marketing">Marketing</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <Button
              onClick={handleAddExpense}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Guardar
            </Button>
          </div>

          {/* Expenses List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm">{expense.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                        {expense.categoria}
                      </span>
                      <span className="text-xs text-gray-500">
                        {expense.fecha}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-red-600">
                    -${expense.monto}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
