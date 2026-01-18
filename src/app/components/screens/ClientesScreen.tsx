import { Search, Plus, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

const clients = [
  {
    id: 1,
    nombre: 'María González',
    telefono: '555-0101',
    direccion: 'Calle Las Flores 123, Santiago',
    totalPedidos: 24,
    ultimaCompra: '2026-01-12',
    avatar: 'MG',
  },
  {
    id: 2,
    nombre: 'Carlos Ruiz',
    telefono: '555-0102',
    direccion: 'Av. Principal 456, Providencia',
    totalPedidos: 18,
    ultimaCompra: '2026-01-11',
    avatar: 'CR',
  },
  {
    id: 3,
    nombre: 'Ana Pérez',
    telefono: '555-0103',
    direccion: 'Los Pinos 789, Las Condes',
    totalPedidos: 31,
    ultimaCompra: '2026-01-13',
    avatar: 'AP',
  },
  {
    id: 4,
    nombre: 'Luis Martínez',
    telefono: '555-0104',
    direccion: 'San Martín 321, Ñuñoa',
    totalPedidos: 15,
    ultimaCompra: '2026-01-10',
    avatar: 'LM',
  },
  {
    id: 5,
    nombre: 'Sofia Torres',
    telefono: '555-0105',
    direccion: 'Av. Libertador 654, Vitacura',
    totalPedidos: 22,
    ultimaCompra: '2026-01-12',
    avatar: 'ST',
  },
  {
    id: 6,
    nombre: 'Roberto Díaz',
    telefono: '555-0106',
    direccion: 'Los Alamos 987, La Reina',
    totalPedidos: 19,
    ultimaCompra: '2026-01-09',
    avatar: 'RD',
  },
  {
    id: 7,
    nombre: 'Patricia López',
    telefono: '555-0107',
    direccion: 'El Bosque 147, Peñalolén',
    totalPedidos: 27,
    ultimaCompra: '2026-01-13',
    avatar: 'PL',
  },
  {
    id: 8,
    nombre: 'Diego Silva',
    telefono: '555-0108',
    direccion: 'Santa Rosa 258, La Florida',
    totalPedidos: 12,
    ultimaCompra: '2026-01-08',
    avatar: 'DS',
  },
  {
    id: 9,
    nombre: 'Laura Romero',
    telefono: '555-0109',
    direccion: 'Los Cedros 369, Macul',
    totalPedidos: 20,
    ultimaCompra: '2026-01-11',
    avatar: 'LR',
  },
];

const colorClasses = [
  'bg-emerald-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-orange-600',
  'bg-teal-600',
];

export function ClientesScreen() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter((client) =>
    client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telefono.includes(searchTerm) ||
    client.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1>Clientes</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus size={16} className="mr-2" />
          Agregar Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Buscar por nombre, teléfono o dirección..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client, index) => (
          <Card key={client.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 ${
                  colorClasses[index % colorClasses.length]
                } text-white rounded-full flex items-center justify-center flex-shrink-0`}
              >
                <span>{client.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg truncate">{client.nombre}</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-emerald-600" />
                    <span>{client.telefono}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{client.direccion}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Total pedidos</p>
                  <p className="text-lg">{client.totalPedidos}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Última compra</p>
                  <p className="text-sm">{client.ultimaCompra}</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 py-2 rounded-lg transition-colors">
                <ShoppingBag size={16} />
                Ver pedidos
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="mb-2">No se encontraron clientes</h3>
          <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
        </Card>
      )}
    </div>
  );
}
