// src/app/components/ui/ConfirmDialog.tsx
import { useState, useCallback } from "react";

interface ConfirmOptions {
  titulo?: string;
  mensaje: string;
  labelConfirmar?: string;
  labelCancelar?: string;
  variante?: "danger" | "warning" | "default";
}

interface ConfirmState extends ConfirmOptions {
  onConfirm: () => void;
  onCancel: () => void;
}

let _triggerConfirm: ((opts: ConfirmOptions) => Promise<boolean>) | null = null;

// Hook para usar el diálogo desde cualquier componente
export function useConfirm() {
  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    if (!_triggerConfirm) {
      // Fallback al confirm nativo si el provider no está montado
      return Promise.resolve(window.confirm(opts.mensaje));
    }
    return _triggerConfirm(opts);
  }, []);

  return { confirm };
}

// Provider — montar una sola vez en App.tsx
export function ConfirmDialogProvider() {
  const [state, setState] = useState<ConfirmState | null>(null);

  // Registrar el trigger global
  _triggerConfirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...opts,
        onConfirm: () => {
          setState(null);
          resolve(true);
        },
        onCancel: () => {
          setState(null);
          resolve(false);
        },
      });
    });
  }, []);

  if (!state) return null;

  const colores = {
    danger: {
      btn: "bg-red-600 hover:bg-red-700 text-white",
      icon: "🗑️",
    },
    warning: {
      btn: "bg-yellow-500 hover:bg-yellow-600 text-white",
      icon: "⚠️",
    },
    default: {
      btn: "bg-green-600 hover:bg-green-700 text-white",
      icon: "❓",
    },
  };

  const estilo = colores[state.variante ?? "default"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={state.onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{estilo.icon}</span>
          <h3 className="text-base font-semibold text-gray-900">
            {state.titulo ?? "¿Confirmar acción?"}
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-6 ml-9">{state.mensaje}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={state.onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {state.labelCancelar ?? "Cancelar"}
          </button>
          <button
            onClick={state.onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${estilo.btn}`}
          >
            {state.labelConfirmar ?? "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
