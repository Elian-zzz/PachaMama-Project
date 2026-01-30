// src/hooks/useSupabaseData.ts
import { useState, useEffect } from "react";
import {
  supabase,
  Producto,
  Cliente,
  Pedido,
  Gasto,
} from "../services/supabase";

// ==========================================
// HOOK: Productos
// ==========================================
export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setProductos(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  };

  const crearProducto = async (
    producto: Omit<Producto, "id" | "created_at">,
  ) => {
    try {
      const { data, error } = await supabase
        .from("productos")
        .insert([producto])
        .select()
        .single();

      if (error) throw error;
      await cargarProductos(); // Recargar lista
      return { success: true, data };
    } catch (err: any) {
      console.error("Error creando producto:", err);
      return { success: false, error: err.message };
    }
  };

  const actualizarProducto = async (id: string, cambios: Partial<Producto>) => {
    try {
      const { error } = await supabase
        .from("productos")
        .update(cambios)
        .eq("id", id);

      if (error) throw error;
      await cargarProductos();
      return { success: true };
    } catch (err: any) {
      console.error("Error actualizando producto:", err);
      return { success: false, error: err.message };
    }
  };

  const eliminarProducto = async (id: string) => {
    try {
      const { error } = await supabase.from("productos").delete().eq("id", id);

      if (error) throw error;
      await cargarProductos();
      return { success: true };
    } catch (err: any) {
      console.error("Error eliminando producto:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return {
    productos,
    loading,
    error,
    refetch: cargarProductos,
    crear: crearProducto,
    actualizar: actualizarProducto,
    eliminar: eliminarProducto,
  };
}

// ==========================================
// HOOK: Clientes
// ==========================================
export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setClientes(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error cargando clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  const crearCliente = async (cliente: Omit<Cliente, "id" | "created_at">) => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .insert([cliente])
        .select()
        .single();

      if (error) throw error;
      await cargarClientes();
      return { success: true, data };
    } catch (err: any) {
      console.error("Error creando cliente:", err);
      return { success: false, error: err.message };
    }
  };

  const actualizarCliente = async (id: string, cambios: Partial<Cliente>) => {
    try {
      const { error } = await supabase
        .from("clientes")
        .update(cambios)
        .eq("id", id);

      if (error) throw error;
      await cargarClientes();
      return { success: true };
    } catch (err: any) {
      console.error("Error actualizando cliente:", err);
      return { success: false, error: err.message };
    }
  };

  const eliminarCliente = async (id: string) => {
    try {
      const { error } = await supabase.from("clientes").delete().eq("id", id);

      if (error) throw error;
      await cargarClientes();
      return { success: true };
    } catch (err: any) {
      console.error("Error eliminando cliente:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  return {
    clientes,
    loading,
    error,
    refetch: cargarClientes,
    crear: crearCliente,
    actualizar: actualizarCliente,
    eliminar: eliminarCliente,
  };
}

// ==========================================
// HOOK: Pedidos
// ==========================================
export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pedidos")
        .select(
          `
          *,
          clientes (id, nombre, telefono),
          pedido_items (
            id,
            cantidad,
            precio_unitario,
            productos (id, nombre, unidad)
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error cargando pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id: string, nuevoEstado: Pedido["estado"]) => {
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ estado: nuevoEstado })
        .eq("id", id);

      if (error) throw error;
      await cargarPedidos();
      return { success: true };
    } catch (err: any) {
      console.error("Error cambiando estado:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  return {
    pedidos,
    loading,
    error,
    refetch: cargarPedidos,
    cambiarEstado,
  };
}

// ==========================================
// HOOK: Gastos
// ==========================================
export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarGastos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gastos")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) throw error;
      setGastos(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error cargando gastos:", err);
    } finally {
      setLoading(false);
    }
  };

  const crearGasto = async (gasto: Omit<Gasto, "id" | "created_at">) => {
    try {
      const { data, error } = await supabase
        .from("gastos")
        .insert([gasto])
        .select()
        .single();

      if (error) throw error;
      await cargarGastos();
      return { success: true, data };
    } catch (err: any) {
      console.error("Error creando gasto:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    cargarGastos();
  }, []);

  return {
    gastos,
    loading,
    error,
    refetch: cargarGastos,
    crear: crearGasto,
  };
}

// ==========================================
// HOOK: Finanzas (Cálculos)
// ==========================================
export function useFinanzas(fechaDesde?: string, fechaHasta?: string) {
  const [datos, setDatos] = useState({
    totalIngresos: 0,
    totalGastos: 0,
    ganancia: 0,
    ingresosPorDia: [] as { fecha: string; ingresos: number }[],
    productosMasVendidos: [] as {
      nombre: string;
      cantidad: number;
      ingresos: number;
    }[],
  });
  const [loading, setLoading] = useState(true);

  const calcularFinanzas = async () => {
    try {
      setLoading(true);

      // Filtros de fecha (por defecto: última semana)
      const desde =
        fechaDesde ||
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const hasta = fechaHasta || new Date().toISOString();

      // 1. Ingresos
      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("created_at, total")
        .in("estado", ["confirmado", "preparado", "entregado"])
        .gte("created_at", desde)
        .lte("created_at", hasta);

      const totalIngresos = pedidos?.reduce((sum, p) => sum + p.total, 0) || 0;

      // Agrupar por día
      const ingresosPorDia: { [key: string]: number } = {};
      pedidos?.forEach((p) => {
        const fecha = new Date(p.created_at).toLocaleDateString("es-UY");
        ingresosPorDia[fecha] = (ingresosPorDia[fecha] || 0) + p.total;
      });

      // 2. Gastos
      const { data: gastos } = await supabase
        .from("gastos")
        .select("monto")
        .gte("fecha", desde)
        .lte("fecha", hasta);

      const totalGastos = gastos?.reduce((sum, g) => sum + g.monto, 0) || 0;

      // 3. Productos más vendidos
      const { data: items } = await supabase
        .from("pedido_items")
        .select(
          `
          cantidad,
          precio_unitario,
          productos (nombre)
        `,
        )
        .gte("created_at", desde)
        .lte("created_at", hasta);

      const productosMap: {
        [key: string]: { cantidad: number; ingresos: number };
      } = {};
      items?.forEach((item: any) => {
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
          cantidad: productosMap[nombre]?.cantidad || 0,
          ingresos: productosMap[nombre]?.ingresos || 0,
        }))
        .sort((a, b) => (b.ingresos || 0) - (a.ingresos || 0))
        .slice(0, 5);

      setDatos({
        totalIngresos,
        totalGastos,
        ganancia: totalIngresos - totalGastos,
        ingresosPorDia: Object.keys(ingresosPorDia).map((fecha) => ({
          fecha,
          ingresos: ingresosPorDia[fecha] || 0,
        })),
        productosMasVendidos,
      });
    } catch (err) {
      console.error("Error calculando finanzas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calcularFinanzas();
  }, [fechaDesde, fechaHasta]);

  return { ...datos, loading, refetch: calcularFinanzas };
}
