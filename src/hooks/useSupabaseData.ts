// src/hooks/useSupabaseData.ts
import { useState, useEffect } from "react";
import {
  supabase,
  Producto,
  Cliente,
  Pedido,
  Gasto,
  StockMovimiento,
  Oferta,
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

  const verificarDependenciasProducto = async (
    id: string,
  ): Promise<{ tieneItems: boolean; cantidad: number }> => {
    const { data } = await supabase
      .from("pedido_items")
      .select("id", { count: "exact" })
      .eq("producto_id", id);
    return { tieneItems: (data?.length ?? 0) > 0, cantidad: data?.length ?? 0 };
  };

  return {
    productos,
    loading,
    error,
    refetch: cargarProductos,
    crear: crearProducto,
    actualizar: actualizarProducto,
    eliminar: eliminarProducto,
    verificarDependencias: verificarDependenciasProducto,
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

  const verificarDependenciasCliente = async (
    id: string,
  ): Promise<{ tienePedidos: boolean; cantidad: number }> => {
    const { data } = await supabase
      .from("pedidos")
      .select("id")
      .eq("cliente_id", id);

    const cantidad = data?.length ?? 0;
    return { tienePedidos: cantidad > 0, cantidad };
  };

  return {
    clientes,
    loading,
    error,
    refetch: cargarClientes,
    crear: crearCliente,
    actualizar: actualizarCliente,
    eliminar: eliminarCliente,
    verificarDependencias: verificarDependenciasCliente,
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

export function useStock() {
  const [movimientos, setMovimientos] = useState<StockMovimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarMovimientos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("stock_movimientos")
        .select(`*, productos (id, nombre, unidad, stock)`)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      setMovimientos(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Registrar entrada de stock (compra de mercadería)
  const registrarEntrada = async (
    producto_id: string,
    cantidad: number,
    notas?: string,
  ) => {
    try {
      // 1. Insertar movimiento
      const { error: movErr } = await supabase
        .from("stock_movimientos")
        .insert([
          { producto_id, tipo: "entrada", cantidad, notas: notas || null },
        ]);
      if (movErr) throw movErr;

      // 2. Actualizar stock en producto
      const { data: prod } = await supabase
        .from("productos")
        .select("stock")
        .eq("id", producto_id)
        .single();
      const stockActual = prod?.stock ?? 0;
      const { error: updErr } = await supabase
        .from("productos")
        .update({ stock: stockActual + cantidad })
        .eq("id", producto_id);
      if (updErr) throw updErr;

      await cargarMovimientos();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Descontar stock al confirmar pedido (llamado desde NuevoPedidoModal)
  const descontarStockPorPedido = async (
    pedido_id: string,
    items: { producto_id: string; cantidad: number }[],
  ) => {
    try {
      for (const item of items) {
        // Movimiento de salida
        const { error: movErr } = await supabase
          .from("stock_movimientos")
          .insert([
            {
              producto_id: item.producto_id,
              tipo: "salida",
              cantidad: item.cantidad,
              pedido_id,
              notas: "Salida por pedido",
            },
          ]);
        if (movErr) throw movErr;

        // Actualizar stock
        const { data: prod } = await supabase
          .from("productos")
          .select("stock")
          .eq("id", item.producto_id)
          .single();
        const stockActual = prod?.stock ?? 0;
        await supabase
          .from("productos")
          .update({ stock: stockActual - item.cantidad })
          .eq("id", item.producto_id);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Devolver stock si se cancela un pedido
  const devolverStockPorCancelacion = async (pedido_id: string) => {
    try {
      // Buscar salidas asociadas a este pedido
      const { data: salidas } = await supabase
        .from("stock_movimientos")
        .select("producto_id, cantidad")
        .eq("pedido_id", pedido_id)
        .eq("tipo", "salida");

      if (!salidas || salidas.length === 0) return { success: true };

      for (const salida of salidas) {
        // Registrar devolución
        await supabase.from("stock_movimientos").insert([
          {
            producto_id: salida.producto_id,
            tipo: "devolucion",
            cantidad: salida.cantidad,
            pedido_id,
            notas: "Devolución por cancelación de pedido",
          },
        ]);

        // Restaurar stock
        const { data: prod } = await supabase
          .from("productos")
          .select("stock")
          .eq("id", salida.producto_id)
          .single();
        const stockActual = prod?.stock ?? 0;
        await supabase
          .from("productos")
          .update({ stock: stockActual + salida.cantidad })
          .eq("id", salida.producto_id);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Ajuste manual de stock (corrección directa)
  const ajustarStock = async (
    producto_id: string,
    nuevo_stock: number,
    notas?: string,
  ) => {
    try {
      const { data: prod } = await supabase
        .from("productos")
        .select("stock")
        .eq("id", producto_id)
        .single();
      const stockActual = prod?.stock ?? 0;
      const diferencia = nuevo_stock - stockActual;

      await supabase.from("stock_movimientos").insert([
        {
          producto_id,
          tipo: "ajuste",
          cantidad: Math.abs(diferencia),
          notas: notas || `Ajuste manual: ${stockActual} → ${nuevo_stock}`,
        },
      ]);

      await supabase
        .from("productos")
        .update({ stock: nuevo_stock })
        .eq("id", producto_id);

      await cargarMovimientos();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  return {
    movimientos,
    loading,
    error,
    refetch: cargarMovimientos,
    registrarEntrada,
    descontarStockPorPedido,
    devolverStockPorCancelacion,
    ajustarStock,
  };
}

// ==========================================
// HOOK: Ofertas
// ==========================================
export function useOfertas() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarOfertas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ofertas")
        .select(`*, productos (id, nombre, unidad, precio)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOfertas(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const crearOferta = async (oferta: Omit<Oferta, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from("ofertas").insert([oferta]);
      if (error) throw error;
      await cargarOfertas();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleOferta = async (id: string, activa: boolean) => {
    try {
      const { error } = await supabase
        .from("ofertas")
        .update({ activa })
        .eq("id", id);
      if (error) throw error;
      await cargarOfertas();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const eliminarOferta = async (id: string) => {
    try {
      const { error } = await supabase.from("ofertas").delete().eq("id", id);
      if (error) throw error;
      await cargarOfertas();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Utilidad: dada una lista de productos con cantidad, retorna las ofertas aplicables
  const evaluarOfertas = (
    items: { producto_id: string; cantidad: number }[],
  ): Map<string, { oferta: Oferta; precioFinal: number; ahorro: number }> => {
    const resultado = new Map();
    const ofertasActivas = ofertas.filter((o) => o.activa);

    for (const item of items) {
      const ofertaAplicable = ofertasActivas.find((o) => {
        if (o.producto_id !== item.producto_id) return false;
        if (o.tipo_oferta === "exacta")
          return item.cantidad === o.cantidad_condicion;
        if (o.tipo_oferta === "minima")
          return item.cantidad >= o.cantidad_condicion;
        return false;
      });

      if (ofertaAplicable) {
        const precioNormal =
          (ofertaAplicable.productos?.precio ?? 0) * item.cantidad;
        let precioFinal: number;

        if (ofertaAplicable.tipo_oferta === "exacta") {
          precioFinal = ofertaAplicable.precio_oferta; // precio total fijo
        } else {
          // minima: precio por unidad * cantidad
          precioFinal = ofertaAplicable.precio_oferta * item.cantidad;
        }

        resultado.set(item.producto_id, {
          oferta: ofertaAplicable,
          precioFinal,
          ahorro: precioNormal - precioFinal,
        });
      }
    }
    return resultado;
  };

  useEffect(() => {
    cargarOfertas();
  }, []);

  return {
    ofertas,
    loading,
    error,
    refetch: cargarOfertas,
    crearOferta,
    toggleOferta,
    eliminarOferta,
    evaluarOfertas,
  };
}
