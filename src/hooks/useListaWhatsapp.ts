// src/hooks/useListaWhatsapp.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import { Producto } from "../services/supabase";

interface ConfigLista {
  encabezado: string;
  pie: string;
}

const CONFIG_ID = "default";

export function useListaWhatsapp(productos: Producto[]) {
  const [encabezado, setEncabezado] = useState("");
  const [pie, setPie] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Cargar config guardada
  const cargarConfig = useCallback(async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("config_lista_whatsapp")
        .select("encabezado, pie")
        .eq("id", CONFIG_ID)
        .single();

      if (error) throw error;
      if (data) {
        setEncabezado(data.encabezado ?? "");
        setPie(data.pie ?? "");
      }
    } catch (err) {
      console.error("Error cargando config lista:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  // Guardar config
  const guardarConfig = useCallback(async (config: ConfigLista) => {
    try {
      setGuardando(true);
      const { error } = await supabase
        .from("config_lista_whatsapp")
        .upsert({
          id: CONFIG_ID,
          encabezado: config.encabezado,
          pie: config.pie,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error guardando config lista:", err);
      return { success: false, error: err.message };
    } finally {
      setGuardando(false);
    }
  }, []);

  // Generar texto de la lista a partir de productos disponibles
  const generarLista = useCallback((): string => {
    const productosDisponibles = productos.filter((p) => p.disponible);

    if (productosDisponibles.length === 0) return "";

    const lineas = productosDisponibles.map((p) => {
      const precio = `$${p.precio.toLocaleString("es-UY")}/${p.unidad}`;
      const obs = p.observaciones?.trim()
        ? ` (${p.observaciones.trim()})`
        : "";
      return `${p.nombre} - ${precio}${obs}`;
    });

    return lineas.join("\n");
  }, [productos]);

  // Armar mensaje completo para copiar
  const generarMensajeCompleto = useCallback((): string => {
    const partes: string[] = [];

    if (encabezado.trim()) partes.push(encabezado.trim());
    const lista = generarLista();
    if (lista) partes.push(lista);
    if (pie.trim()) partes.push(pie.trim());

    return partes.join("\n\n");
  }, [encabezado, pie, generarLista]);

  useEffect(() => {
    cargarConfig();
  }, [cargarConfig]);

  return {
    encabezado,
    setEncabezado,
    pie,
    setPie,
    cargando,
    guardando,
    guardarConfig,
    generarLista,
    generarMensajeCompleto,
  };
}