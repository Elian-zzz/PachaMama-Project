// src/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";

interface PedidoReciente {
  id: string;
  cliente: string;
  productos: string;
  total: number;
  estado: string;
  fecha: string;
}

interface ProductoVendido {
  nombre: string;
  cantidad: number;
  ingresos: number;
}

interface VentaDia {
  fecha: string;
  ventas: number;
}

interface DashboardData {
  ingresosHoy: number;
  pedidosActivos: number;
  totalClientes: number;
  gananciaEstaSemana: number;
  ventasUltimos7Dias: VentaDia[];
  pedidosRecientes: PedidoReciente[];
  productosMasVendidos: ProductoVendido[];
}

function getUltimos7Dias(): string[] {
  const dias: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    dias.push(fecha.toISOString().split("T")[0]);
  }
  return dias;
}

const ESTADOS_INGRESO = ["confirmado", "preparado", "entregado"] as const;

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datos, setDatos] = useState<DashboardData>({
    ingresosHoy: 0,
    pedidosActivos: 0,
    totalClientes: 0,
    gananciaEstaSemana: 0,
    ventasUltimos7Dias: [],
    pedidosRecientes: [],
    productosMasVendidos: [],
  });

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const hoy = new Date().toISOString().split("T")[0];
      const ultimos7Dias = getUltimos7Dias();
      const hace7Dias = ultimos7Dias[0];

      // Ejecutar queries en paralelo donde sea posible
      const [
        { data: pedidosHoy },
        { data: pedidosActivosData },
        { count: totalClientes },
        { data: pedidosSemana },
        { data: gastosSemana },
        { data: pedidosUltimos7 },
        { data: pedidosRecientesData },
        { data: itemsSemana },
      ] = await Promise.all([
        supabase
          .from("pedidos")
          .select("total")
          .in("estado", ESTADOS_INGRESO)
          .gte("created_at", hoy)
          .lte("created_at", `${hoy}T23:59:59`),

        supabase
          .from("pedidos")
          .select("id")
          .in("estado", ["confirmado", "preparado"]),

        supabase.from("clientes").select("*", { count: "exact", head: true }),

        supabase
          .from("pedidos")
          .select("total")
          .in("estado", ESTADOS_INGRESO)
          .gte("created_at", hace7Dias),

        supabase.from("gastos").select("monto").gte("fecha", hace7Dias),

        supabase
          .from("pedidos")
          .select("created_at, total")
          .in("estado", ESTADOS_INGRESO)
          .gte("created_at", hace7Dias)
          .order("created_at"),

        supabase
          .from("pedidos")
          .select(
            `id, total, estado, created_at, clientes (nombre), pedido_items (cantidad, productos (nombre))`,
          )
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("pedido_items")
          .select("cantidad, precio_unitario, productos (nombre)")
          .gte("created_at", hace7Dias),
      ]);

      // KPIs
      const ingresosHoy = pedidosHoy?.reduce((sum, p) => sum + p.total, 0) ?? 0;
      const pedidosActivos = pedidosActivosData?.length ?? 0;
      const ingresosSemana =
        pedidosSemana?.reduce((sum, p) => sum + p.total, 0) ?? 0;
      const totalGastosSemana =
        gastosSemana?.reduce((sum, g) => sum + g.monto, 0) ?? 0;
      const gananciaEstaSemana = ingresosSemana - totalGastosSemana;

      // Gráfico: ventas agrupadas por día
      const ventasPorDia: Record<string, number> = {};
      ultimos7Dias.forEach((dia) => {
        ventasPorDia[dia] = 0;
      });
      pedidosUltimos7?.forEach((p) => {
        const fecha = p.created_at.split("T")[0];
        if (fecha in ventasPorDia) ventasPorDia[fecha] += p.total;
      });

      const ventasUltimos7Dias: VentaDia[] = ultimos7Dias.map((fecha) => ({
        fecha: new Date(`${fecha}T00:00:00`).toLocaleDateString("es-UY", {
          day: "2-digit",
          month: "2-digit",
        }),
        ventas: ventasPorDia[fecha] ?? 0,
      }));

      // Pedidos recientes
      const pedidosRecientes: PedidoReciente[] = (
        pedidosRecientesData ?? []
      ).map((p: any) => ({
        id: p.id,
        cliente: p.clientes?.nombre ?? "Sin nombre",
        productos:
          p.pedido_items
            ?.map((item: any) => item.productos?.nombre)
            .filter(Boolean)
            .join(", ") ?? "Sin productos",
        total: p.total,
        estado: p.estado,
        fecha: new Date(p.created_at).toLocaleDateString("es-UY"),
      }));

      // Productos más vendidos
      const productosMap: Record<
        string,
        { cantidad: number; ingresos: number }
      > = {};
      (itemsSemana ?? []).forEach((item: any) => {
        const nombre = item.productos?.nombre;
        if (!nombre) return;
        if (!productosMap[nombre])
          productosMap[nombre] = { cantidad: 0, ingresos: 0 };
        productosMap[nombre].cantidad += item.cantidad;
        productosMap[nombre].ingresos += item.cantidad * item.precio_unitario;
      });

      const productosMasVendidos: ProductoVendido[] = Object.entries(
        productosMap,
      )
        .map(([nombre, vals]) => ({ nombre, ...vals }))
        .sort((a, b) => b.ingresos - a.ingresos)
        .slice(0, 5);

      setDatos({
        ingresosHoy,
        pedidosActivos,
        totalClientes: totalClientes ?? 0,
        gananciaEstaSemana,
        ventasUltimos7Dias,
        pedidosRecientes,
        productosMasVendidos,
      });
    } catch (err: any) {
      console.error("Error cargando dashboard:", err);
      setError(err.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return { ...datos, loading, error, refetch: cargarDatos };
}
