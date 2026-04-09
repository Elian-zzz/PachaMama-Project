// src/app/components/modals/GestorStockModal.tsx
import { useState } from "react";
import { useStock } from "../../../hooks/useSupabaseData";
import { Producto } from "../../../services/supabase";

interface Props {
  producto: Producto;
  onClose: () => void;
  onStockActualizado: () => void;
}

export function GestorStockModal({
  producto,
  onClose,
  onStockActualizado,
}: Props) {
  const { registrarEntrada, ajustarStock } = useStock();
  const [modo, setModo] = useState<"entrada" | "ajuste">("entrada");
  const [cantidad, setCantidad] = useState<string>("");
  const [nuevoStock, setNuevoStock] = useState<string>(
    String(producto.stock ?? 0),
  );
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "ok" | "error";
    texto: string;
  } | null>(null);

  const stockActual = producto.stock ?? 0;
  const esNegativo = stockActual < 0;

  const handleConfirmar = async () => {
    setGuardando(true);
    setMensaje(null);
    let resultado;

    if (modo === "entrada") {
      const cant = parseFloat(cantidad);
      if (isNaN(cant) || cant <= 0) {
        setMensaje({
          tipo: "error",
          texto: "Ingresá una cantidad válida mayor a 0.",
        });
        setGuardando(false);
        return;
      }
      resultado = await registrarEntrada(producto.id, cant, notas || undefined);
    } else {
      const ns = parseFloat(nuevoStock);
      if (isNaN(ns)) {
        setMensaje({
          tipo: "error",
          texto: "Ingresá un valor de stock válido.",
        });
        setGuardando(false);
        return;
      }
      resultado = await ajustarStock(producto.id, ns, notas || undefined);
    }

    if (resultado.success) {
      setMensaje({
        tipo: "ok",
        texto:
          modo === "entrada"
            ? "Stock agregado correctamente."
            : "Stock ajustado correctamente.",
      });
      setTimeout(() => {
        onStockActualizado();
        onClose();
      }, 900);
    } else {
      setMensaje({
        tipo: "error",
        texto: resultado.error || "Error desconocido.",
      });
    }
    setGuardando(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Gestión de Stock
            </h2>
            <p className="text-sm text-gray-500 mt-1">{producto.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Stock actual */}
        <div className="px-6 pt-5">
          <div
            className={`rounded-xl p-4 flex items-center justify-between ${esNegativo ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Stock actual
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${esNegativo ? "text-red-600" : "text-green-700"}`}
              >
                {stockActual}{" "}
                <span className="text-base font-medium">{producto.unidad}</span>
              </p>
            </div>
            <span className="text-4xl">{esNegativo ? "⚠️" : "📦"}</span>
          </div>
          {esNegativo && (
            <p className="text-xs text-red-600 mt-2 font-medium">
              ⚠️ Stock negativo — se necesita reponer mercadería para cubrir
              pedidos pendientes.
            </p>
          )}
        </div>

        {/* Selector de modo */}
        <div className="px-6 pt-4">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setModo("entrada")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                modo === "entrada"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              + Agregar stock
            </button>
            <button
              onClick={() => setModo("ajuste")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                modo === "ajuste"
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              ✏️ Ajuste manual
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="px-6 pt-4 pb-2 space-y-4">
          {modo === "entrada" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad a agregar ({producto.unidad})
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder={`Ej: 10 ${producto.unidad}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                autoFocus
              />
              {cantidad &&
                !isNaN(parseFloat(cantidad)) &&
                parseFloat(cantidad) > 0 && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    Nuevo stock:{" "}
                    {(stockActual + parseFloat(cantidad)).toFixed(2)}{" "}
                    {producto.unidad}
                  </p>
                )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nuevo stock total ({producto.unidad})
              </label>
              <input
                type="number"
                step="0.5"
                value={nuevoStock}
                onChange={(e) => setNuevoStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-lg font-semibold"
                autoFocus
              />
              {nuevoStock !== "" && !isNaN(parseFloat(nuevoStock)) && (
                <p className="text-xs text-gray-500 mt-1">
                  Diferencia:{" "}
                  {parseFloat(nuevoStock) - stockActual >= 0 ? "+" : ""}
                  {(parseFloat(nuevoStock) - stockActual).toFixed(2)}{" "}
                  {producto.unidad}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Compra del viernes en mercado central"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>

          {mensaje && (
            <div
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                mensaje.tipo === "ok"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {mensaje.tipo === "ok" ? "✅ " : "❌ "}
              {mensaje.texto}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={guardando}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm text-white transition-colors ${
              guardando ? "opacity-60 cursor-not-allowed" : ""
            } ${modo === "entrada" ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-800"}`}
          >
            {guardando
              ? "Guardando..."
              : modo === "entrada"
                ? "Confirmar entrada"
                : "Aplicar ajuste"}
          </button>
        </div>
      </div>
    </div>
  );
}
