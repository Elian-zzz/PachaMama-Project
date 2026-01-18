import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Eye,
  Edit,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";

// Mock data
const weeklyData = [
  { day: "Lun", ingresos: 4500 },
  { day: "Mar", ingresos: 5200 },
  { day: "Mié", ingresos: 4800 },
  { day: "Jue", ingresos: 6100 },
  { day: "Vie", ingresos: 7200 },
  { day: "Sáb", ingresos: 8500 },
  { day: "Dom", ingresos: 6800 },
];

const recentOrders = [
  {
    id: "a7b2c",
    cliente: "María González",
    productos: "Lechuga, Tomate, Cebolla",
    total: 850,
    estado: "entregado",
  },
  {
    id: "3d9ef",
    cliente: "Carlos Ruiz",
    productos: "Zanahoria, Papa, Brócoli",
    total: 1200,
    estado: "preparado",
  },
  {
    id: "5k1m3",
    cliente: "Ana Pérez",
    productos: "Espinaca, Ajo, Jengibre",
    total: 650,
    estado: "confirmado",
  },
  {
    id: "8n4p2",
    cliente: "Luis Martínez",
    productos: "Pimiento, Pepino, Acelga",
    total: 920,
    estado: "entregado",
  },
  {
    id: "2q7r9",
    cliente: "Sofia Torres",
    productos: "Cilantro, Perejil, Albahaca",
    total: 380,
    estado: "confirmado",
  },
];

const topProducts = [
  { nombre: "Lechuga", cantidad: 45, ingresos: 6750 },
  { nombre: "Tomate", cantidad: 38, ingresos: 5700 },
  { nombre: "Papa", cantidad: 52, ingresos: 5200 },
  { nombre: "Cebolla", cantidad: 41, ingresos: 4920 },
  { nombre: "Zanahoria", cantidad: 36, ingresos: 4320 },
];

const maxRevenue = Math.max(...topProducts.map((p) => p.ingresos));

export function DashboardScreen() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1>Dashboard</h1>
        <input
          type="date"
          defaultValue="2026-01-13"
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ingresos</p>
              <p className="text-3xl mt-2">$43,200</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-600">
                <TrendingUp size={16} />
                <span className="text-sm">+12%</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-emerald-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Pedidos Hoy</p>
              <p className="text-3xl mt-2">24</p>
              <div className="mt-2">
                <span className="px-2 py-1 text-xs bg-emerald-600 text-white rounded-full">
                  En vivo
                </span>
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-blue-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Activos</p>
              <p className="text-3xl mt-2">156</p>
              <p className="text-sm text-gray-500 mt-2">Este mes</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Ganancia Semanal</p>
              <p className="text-3xl mt-2">$12,450</p>
              <p className="text-sm text-gray-500 mt-2">Últimos 7 días</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-emerald-600" size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <h3 className="mb-4">Ingresos por Día</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
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
            <Line
              type="monotone"
              dataKey="ingresos"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Two columns: Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="p-6">
          <h3 className="mb-4">Pedidos Recientes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 text-sm text-gray-600">Cliente</th>
                  <th className="pb-3 text-sm text-gray-600">Productos</th>
                  <th className="pb-3 text-sm text-gray-600">Total</th>
                  <th className="pb-3 text-sm text-gray-600">Estado</th>
                  <th className="pb-3 text-sm text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={index % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <td className="py-3 text-sm">{order.cliente}</td>
                    <td className="py-3 text-sm text-gray-600 max-w-[150px] truncate">
                      {order.productos}
                    </td>
                    <td className="py-3 text-sm">${order.total}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          order.estado === "entregado"
                            ? "default"
                            : order.estado === "preparado"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          order.estado === "entregado"
                            ? "bg-emerald-600"
                            : order.estado === "preparado"
                            ? "bg-blue-600"
                            : "bg-yellow-500 text-white"
                        }
                      >
                        {order.estado}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-600 hover:text-gray-900">
                          <Eye size={16} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h3 className="mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.nombre}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{product.nombre}</span>
                  <span className="text-sm text-gray-600">
                    ${product.ingresos}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${(product.ingresos / maxRevenue) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {product.cantidad} unidades vendidas
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
