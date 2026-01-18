import { Search, Filter, Eye, Edit, Plus, Phone } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

const allOrders = [
  {
    id: "a7b2c",
    cliente: "María González",
    telefono: "555-0101",
    productos: "Lechuga, Tomate, Cebolla",
    total: 850,
    estado: "entregado",
  },
  {
    id: "3d9ef",
    cliente: "Carlos Ruiz",
    telefono: "555-0102",
    productos: "Zanahoria, Papa, Brócoli",
    total: 1200,
    estado: "preparado",
  },
  {
    id: "5k1m3",
    cliente: "Ana Pérez",
    telefono: "555-0103",
    productos: "Espinaca, Ajo, Jengibre",
    total: 650,
    estado: "confirmado",
  },
  {
    id: "8n4p2",
    cliente: "Luis Martínez",
    telefono: "555-0104",
    productos: "Pimiento, Pepino, Acelga",
    total: 920,
    estado: "entregado",
  },
  {
    id: "2q7r9",
    cliente: "Sofia Torres",
    telefono: "555-0105",
    productos: "Cilantro, Perejil, Albahaca",
    total: 380,
    estado: "confirmado",
  },
  {
    id: "9x3k8",
    cliente: "Roberto Díaz",
    telefono: "555-0106",
    productos: "Remolacha, Nabo, Rabanito",
    total: 540,
    estado: "preparado",
  },
  {
    id: "1h5j7",
    cliente: "Patricia López",
    telefono: "555-0107",
    productos: "Kale, Rúcula, Berro",
    total: 720,
    estado: "confirmado",
  },
  {
    id: "6f2m4",
    cliente: "Diego Silva",
    telefono: "555-0108",
    productos: "Orégano, Tomillo, Romero",
    total: 450,
    estado: "entregado",
  },
  {
    id: "4w8n1",
    cliente: "Laura Romero",
    telefono: "555-0109",
    productos: "Apio, Puerro, Hinojo",
    total: 890,
    estado: "preparado",
  },
  {
    id: "7t5p6",
    cliente: "Gabriel Castro",
    telefono: "555-0110",
    productos: "Berenjena, Calabacín, Calabaza",
    total: 1100,
    estado: "confirmado",
  },
];

export function PedidosScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      order.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "todos" ||
      (activeTab === "confirmados" && order.estado === "confirmado") ||
      (activeTab === "preparados" && order.estado === "preparado") ||
      (activeTab === "entregados" && order.estado === "entregado");

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1>Pedidos</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus size={16} className="mr-2" />
          Nuevo Pedido Manual
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Buscar por cliente o ID de pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="md:w-auto">
          <Filter size={16} className="mr-2" />
          Filtrar por Estado
        </Button>
      </div>

      {/* Status Flow */}
      <Card className="p-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-yellow-600">📋</span>
            </div>
            <span className="text-xs text-gray-600">Recibido</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2" />
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-yellow-600">✓</span>
            </div>
            <span className="text-xs text-gray-600">Confirmado</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2" />
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-blue-600">📦</span>
            </div>
            <span className="text-xs text-gray-600">Preparado</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2" />
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-emerald-600">🚚</span>
            </div>
            <span className="text-xs text-gray-600">Entregado</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="confirmados">Confirmados</TabsTrigger>
          <TabsTrigger value="preparados">Preparados</TabsTrigger>
          <TabsTrigger value="entregados">Entregados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 text-sm text-gray-600">
                      ID Pedido
                    </th>
                    <th className="text-left p-4 text-sm text-gray-600">
                      Cliente
                    </th>
                    <th className="text-left p-4 text-sm text-gray-600">
                      Productos
                    </th>
                    <th className="text-left p-4 text-sm text-gray-600">
                      Total
                    </th>
                    <th className="text-left p-4 text-sm text-gray-600">
                      Estado
                    </th>
                    <th className="text-left p-4 text-sm text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="p-4 text-sm font-mono">{order.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{order.cliente}</span>
                          <Phone size={14} className="text-emerald-600" />
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate">
                        {order.productos}
                      </td>
                      <td className="p-4 text-sm">${order.total}</td>
                      <td className="p-4">
                        <Badge
                          className={
                            order.estado === "entregado"
                              ? "bg-emerald-600 text-white"
                              : order.estado === "preparado"
                              ? "bg-blue-600 text-white"
                              : "bg-yellow-500 text-white"
                          }
                        >
                          {order.estado}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Mostrando {filteredOrders.length} de {allOrders.length} pedidos
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Anterior
                </Button>
                <Button variant="outline" size="sm">
                  Siguiente
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
