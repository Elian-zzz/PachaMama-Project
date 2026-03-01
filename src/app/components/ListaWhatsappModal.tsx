// src/app/components/ListaWhatsappModal.tsx
import { useState } from "react";
import { toast } from "sonner";
import { Producto } from "../../services/supabase";
import { useListaWhatsapp } from "../../hooks/useListaWhatsapp";

interface Props {
  productos: Producto[];
  onClose: () => void;
}

export function ListaWhatsappModal({ productos, onClose }: Props) {
  const {
    encabezado,
    setEncabezado,
    pie,
    setPie,
    cargando,
    guardando,
    guardarConfig,
    generarLista,
    generarMensajeCompleto,
  } = useListaWhatsapp(productos);

  const [copiado, setCopiado] = useState(false);
  const [hayCambios, setHayCambios] = useState(false);

  // Marcar cambios cuando el usuario edita
  const handleEncabezadoChange = (v: string) => {
    setEncabezado(v);
    setHayCambios(true);
  };

  const handlePieChange = (v: string) => {
    setPie(v);
    setHayCambios(true);
  };

  // Guardar automáticamente al cerrar si hay cambios
  const handleClose = async () => {
    if (hayCambios) {
      await guardarConfig({ encabezado, pie });
    }
    onClose();
  };

  // Guardar manualmente
  const handleGuardar = async () => {
    const resultado = await guardarConfig({ encabezado, pie });
    if (resultado.success) {
      toast.success("Texto guardado correctamente");
      setHayCambios(false);
    } else {
      toast.error("Error al guardar: " + resultado.error);
    }
  };

  // Copiar al portapapeles
  const handleCopiar = async () => {
    const mensaje = generarMensajeCompleto();
    if (!mensaje.trim()) {
      toast.warning("No hay contenido para copiar");
      return;
    }

    try {
      await navigator.clipboard.writeText(mensaje);
      setCopiado(true);
      toast.success("¡Lista copiada al portapapeles!");
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Fallback para navegadores sin clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = mensaje;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiado(true);
      toast.success("¡Lista copiada al portapapeles!");
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const listaGenerada = generarLista();
  const productosDisponibles = productos.filter((p) => p.disponible).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              📋 Lista para WhatsApp
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {productosDisponibles} producto
              {productosDisponibles !== 1 ? "s" : ""} disponible
              {productosDisponibles !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {cargando ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Encabezado editable */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Encabezado / Saludo
              </label>
              <textarea
                value={encabezado}
                onChange={(e) => handleEncabezadoChange(e.target.value)}
                placeholder={
                  "Ej: 🌿 ¡Hola! Esta semana tenemos disponible:\n\nPedidos hasta el viernes 🛒"
                }
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder-gray-300"
              />
            </div>

            {/* Lista generada (solo lectura) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Lista de productos
                <span className="ml-2 font-normal text-gray-400 normal-case">
                  (se genera automáticamente)
                </span>
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 min-h-[100px]">
                {listaGenerada ? (
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-6">
                    {listaGenerada}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-300 italic">
                    No hay productos disponibles en este momento.
                  </p>
                )}
              </div>
            </div>

            {/* Pie editable */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Pie / Cierre
              </label>
              <textarea
                value={pie}
                onChange={(e) => handlePieChange(e.target.value)}
                placeholder={
                  "Ej: Hacé tu pedido respondiendo este mensaje 💬\n\nPachaMama 🥬"
                }
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder-gray-300"
              />
            </div>

            {/* Preview del mensaje completo */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Preview del mensaje completo
              </label>
              <div className="bg-[#dcf8c6] border border-green-200 rounded-xl px-4 py-3 min-h-[80px]">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-6">
                  {generarMensajeCompleto() || (
                    <span className="text-gray-400 italic">
                      El mensaje aparecerá aquí...
                    </span>
                  )}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Footer con botones */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          {/* Guardar texto */}
          <button
            onClick={handleGuardar}
            disabled={guardando || !hayCambios}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {guardando
              ? "Guardando..."
              : hayCambios
                ? "💾 Guardar texto"
                : "✓ Guardado"}
          </button>

          <div className="flex gap-3">
            {/* Copiar */}
            <button
              onClick={handleCopiar}
              disabled={!listaGenerada}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {copiado ? "✅ ¡Copiado!" : "📋 Copiar lista"}
            </button>

            {/* Publicar — placeholder hasta integración futura */}
            <button
              disabled
              title="Próximamente: publicación automática al grupo"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed"
            >
              <span>📲</span>
              <span>Publicar en Pacha-Mama</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
