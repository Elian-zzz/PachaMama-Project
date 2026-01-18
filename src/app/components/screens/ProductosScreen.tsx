import { Plus, Edit, Trash2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { toast } from "sonner";

interface Product {
  id: number;
  nombre: string;
  precio: number;
  unidad: string;
  disponible: boolean;
}

const initialProducts: Product[] = [
  { id: 1, nombre: "Lechuga", precio: 150, unidad: "unidad", disponible: true },
  { id: 2, nombre: "Tomate", precio: 200, unidad: "kg", disponible: true },
  { id: 3, nombre: "Papa", precio: 100, unidad: "kg", disponible: true },
  { id: 4, nombre: "Cebolla", precio: 120, unidad: "kg", disponible: true },
  { id: 5, nombre: "Zanahoria", precio: 120, unidad: "kg", disponible: true },
  { id: 6, nombre: "Brócoli", precio: 250, unidad: "unidad", disponible: true },
  {
    id: 7,
    nombre: "Espinaca",
    precio: 180,
    unidad: "atado",
    disponible: false,
  },
  { id: 8, nombre: "Ajo", precio: 300, unidad: "kg", disponible: true },
  { id: 9, nombre: "Jengibre", precio: 350, unidad: "kg", disponible: true },
  { id: 10, nombre: "Pimiento", precio: 220, unidad: "kg", disponible: true },
  { id: 11, nombre: "Pepino", precio: 140, unidad: "kg", disponible: true },
  { id: 12, nombre: "Acelga", precio: 160, unidad: "atado", disponible: true },
  { id: 13, nombre: "Cilantro", precio: 80, unidad: "atado", disponible: true },
  { id: 14, nombre: "Perejil", precio: 80, unidad: "atado", disponible: true },
  {
    id: 15,
    nombre: "Albahaca",
    precio: 120,
    unidad: "atado",
    disponible: false,
  },
  { id: 16, nombre: "Remolacha", precio: 110, unidad: "kg", disponible: true },
  { id: 17, nombre: "Kale", precio: 200, unidad: "atado", disponible: true },
  { id: 18, nombre: "Orégano", precio: 150, unidad: "atado", disponible: true },
  { id: 19, nombre: "Apio", precio: 140, unidad: "atado", disponible: true },
  { id: 20, nombre: "Berenjena", precio: 180, unidad: "kg", disponible: true },
];

export function ProductosScreen() {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handleToggleAvailability = (id: number) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, disponible: !p.disponible } : p
      )
    );
  };

  const handlePublishToWhatsApp = () => {
    const availableProducts = products.filter((p) => p.disponible);
    toast.success("¡Lista publicada en WhatsApp!", {
      description: `${availableProducts.length} productos disponibles fueron compartidos.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1>Lista de Productos</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handlePublishToWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <MessageCircle size={16} className="mr-2" />
            Publicar Lista a WhatsApp
          </Button>
          <Button variant="outline">
            <Plus size={16} className="mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-sm text-gray-600">
                  Nombre del Producto
                </th>
                <th className="text-left p-4 text-sm text-gray-600">Precio</th>
                <th className="text-left p-4 text-sm text-gray-600">Unidad</th>
                <th className="text-left p-4 text-sm text-gray-600">
                  Disponible
                </th>
                <th className="text-left p-4 text-sm text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr
                  key={product.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          product.disponible ? "bg-emerald-600" : "bg-gray-400"
                        }`}
                      />
                      <span className="text-sm">{product.nombre}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    ${product.precio}
                    <span className="text-gray-500 text-xs ml-1">
                      / {product.unidad}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {product.unidad}
                  </td>
                  <td className="p-4">
                    <Switch
                      checked={product.disponible}
                      onCheckedChange={() =>
                        handleToggleAvailability(product.id)
                      }
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Total de productos: <strong>{products.length}</strong>
            </span>
            <span className="text-emerald-600">
              Disponibles:{" "}
              <strong>{products.filter((p) => p.disponible).length}</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Help Card */}
      <Card className="p-6 bg-emerald-50 border-emerald-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="text-emerald-900 mb-1">
              Tip: Publicación en WhatsApp
            </h3>
            <p className="text-sm text-emerald-800">
              Al publicar la lista, se generará un mensaje formateado con todos
              los productos disponibles que puedes compartir fácilmente con tus
              clientes a través de WhatsApp.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
