// src/app/components/alerts/AlertaStockNegativo.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase";
import { Producto } from "../../../services/supabase";

interface ProductoFaltante {
  producto: Producto;
  stockActual: number; // negativo
  totalNecesario: number; // cuánto falta comprar
  pedidosAfectados: {
    pedido_id: string;
    cliente: string;
    cantidad: number;
  }[];
}

export function AlertaStockNegativo() {
  const [productosFaltantes, setProductosFaltantes] = useState<
    ProductoFaltante[]
  >([]);
  const [expandido, setExpandido] = useState(false);
  const [loading, setLoading] = useState(true);

  const calcularFaltantes = async () => {
    try {
      setLoading(true);
      // Productos con stock negativo
      const { data: prods } = await supabase
        .from("productos")
        .select("*")
        .lt("stock", 0)
        .eq("disponible", true);

      if (!prods || prods.length === 0) {
        setProductosFaltantes([]);
        return;
      }

      // Para cada producto negativo, buscar pedidos activos que lo incluyen
      const faltantes: ProductoFaltante[] = [];

      for (const prod of prods) {
        const { data: items } = await supabase
          .from("pedido_items")
          .select(
            `
            cantidad,
            pedidos (
              id,
              estado,
              created_at,
              clientes (nombre)
            )
          `,
          )
          .eq("producto_id", prod.id)
          .in("pedidos.estado", ["confirmado", "preparado"]);

        // Filtrar items que tienen pedido activo
        const itemsActivos = (items || []).filter(
          (i: any) =>
            i.pedidos && ["confirmado", "preparado"].includes(i.pedidos.estado),
        );

        // Ordenar por fecha de pedido (prioridad al primero)
        const pedidosAfectados = itemsActivos
          .map((i: any) => ({
            pedido_id: i.pedidos.id,
            cliente: i.pedidos.clientes?.nombre ?? "Sin nombre",
            cantidad: i.cantidad,
            fecha: i.pedidos.created_at,
          }))
          .sort(
            (a: any, b: any) =>
              new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
          );

        faltantes.push({
          producto: prod,
          stockActual: prod.stock,
          totalNecesario: Math.abs(prod.stock),
          pedidosAfectados,
        });
      }

      setProductosFaltantes(faltantes);
    } catch (err) {
      console.error("Error calculando stock faltante:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calcularFaltantes();
    // Polling cada 30 segundos para mantener actualizado
    const interval = setInterval(calcularFaltantes, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || productosFaltantes.length === 0) return null;

  return (
    <>
      {/* Toast colapsado — siempre visible */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        {/* Panel expandido */}
        {expandido && (
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-200 w-80 max-h-[70vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
            {/* Header panel */}
            <div className="bg-red-600 text-white px-4 py-3 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">⚠️ Stock insuficiente</p>
                <p className="text-xs opacity-90 mt-0.5">
                  {productosFaltantes.length} producto
                  {productosFaltantes.length > 1 ? "s" : ""} necesitan
                  reposición
                </p>
              </div>
              <button
                onClick={() => setExpandido(false)}
                className="text-white opacity-75 hover:opacity-100 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {/* Resumen general */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  📦 Resumen — qué comprar
                </p>
                <div className="space-y-2">
                  {productosFaltantes.map((pf) => (
                    <div
                      key={pf.producto.id}
                      className="flex justify-between items-center bg-red-50 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-semibold text-gray-800">
                        {pf.producto.nombre}
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        {pf.totalNecesario} {pf.producto.unidad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detalle por pedido */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  📋 Detalle por pedido (orden de prioridad)
                </p>
                {productosFaltantes.map((pf) => (
                  <div key={pf.producto.id} className="mb-3">
                    <p className="text-xs font-bold text-red-700 mb-1">
                      {pf.producto.nombre} — falta {pf.totalNecesario}{" "}
                      {pf.producto.unidad}
                    </p>
                    {pf.pedidosAfectados.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">
                        Sin pedidos activos asociados
                      </p>
                    ) : (
                      <div className="space-y-1 pl-2 border-l-2 border-red-200">
                        {pf.pedidosAfectados.map((pa, idx) => (
                          <div
                            key={pa.pedido_id}
                            className="text-xs text-gray-600"
                          >
                            <span className="font-medium text-gray-800">
                              #{idx + 1} {pa.cliente}
                            </span>
                            {" — "}
                            <span className="text-red-600 font-semibold">
                              {pa.cantidad} {pf.producto.unidad}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t px-4 py-3">
              <p className="text-xs text-gray-400 text-center">
                Actualizá el stock en la pestaña <strong>Stock</strong> de
                Productos
              </p>
            </div>
          </div>
        )}

        {/* Botón toast */}
        <button
          onClick={() => setExpandido(!expandido)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-200"></span>
          </span>
          <span className="font-bold text-sm">
            ⚠️ {productosFaltantes.length} producto
            {productosFaltantes.length > 1 ? "s" : ""} sin stock
          </span>
          <span className="text-red-200 text-xs">{expandido ? "▼" : "▲"}</span>
        </button>
      </div>
    </>
  );
}
