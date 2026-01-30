// src/services/supabase.ts
import { createClient } from "@supabase/supabase-js";
// IMPORTANTE: En producción, usa variables de entorno
// Crea un archivo .env.local con:
// VITE_SUPABASE_URL=tu_url
// VITE_SUPABASE_ANON_KEY=tu_key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos TypeScript para las tablas
export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  unidad: string;
  disponible: boolean;
  observaciones?: string;
  created_at: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  direccion?: string;
  notas?: string;
  created_at: string;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  estado: "borrador" | "confirmado" | "preparado" | "entregado" | "cancelado";
  total: number;
  tipo: "convencional" | "exclusivo";
  observaciones?: string;
  created_at: string;
  clientes?: Cliente;
  pedido_items?: PedidoItem[];
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  productos?: Producto;
}

export interface Gasto {
  id: string;
  nombre: string;
  categoria: string;
  monto: number;
  fecha: string;
  detalles?: string;
  created_at: string;
}
