// src/app/components/screens/ConfiguracionScreen.tsx
import { useState } from "react";

interface Paso {
  texto: string;
  tip?: string;
}

interface Manual {
  id: string;
  emoji: string;
  titulo: string;
  descripcion: string;
  color: string;
  colorBg: string;
  colorBorde: string;
  pasos: Paso[];
}

const MANUALES: Manual[] = [
  {
    id: "productos",
    emoji: "🥬",
    titulo: "Productos",
    descripcion: "Cómo agregar, editar y eliminar productos de la lista",
    color: "text-emerald-700",
    colorBg: "bg-emerald-50",
    colorBorde: "border-emerald-200",
    pasos: [
      {
        texto: 'Ir a la sección "Productos" en el menú de la izquierda.',
      },
      {
        texto:
          'Para agregar un producto nuevo: hacé clic en el botón "+ Nuevo Producto" (esquina superior derecha).',
      },
      {
        texto:
          "Completá el formulario: nombre, precio, unidad (kg, unidad, etc.) y si está disponible para la venta.",
        tip: 'El campo "Observaciones" es opcional — aparece entre paréntesis en la lista de WhatsApp si lo completás.',
      },
      {
        texto: 'Hacé clic en "Guardar" para confirmar.',
      },
      {
        texto:
          "Para editar un producto existente: hacé clic en el ícono ✏️ al lado del producto.",
      },
      {
        texto:
          "Para eliminarlo: hacé clic en el ícono 🗑️. Se te pedirá confirmación antes de borrar.",
        tip: '¡Cuidado! Eliminar un producto es permanente. Si solo querés ocultarlo de la lista, desactivá la opción "Disponible".',
      },
      {
        texto:
          'Para activar o desactivar un producto sin eliminarlo: usá el interruptor en la columna "Disponible".',
      },
    ],
  },
  {
    id: "clientes",
    emoji: "👥",
    titulo: "Clientes",
    descripcion: "Cómo gestionar el directorio de clientes",
    color: "text-blue-700",
    colorBg: "bg-blue-50",
    colorBorde: "border-blue-200",
    pasos: [
      {
        texto: 'Ir a la sección "Clientes" en el menú de la izquierda.',
      },
      {
        texto: 'Para agregar un cliente nuevo: hacé clic en "+ Nuevo Cliente".',
      },
      {
        texto:
          "Completá el formulario: nombre y teléfono son obligatorios. Dirección y notas son opcionales.",
        tip: 'El campo "Notas" es útil para recordar preferencias del cliente (ej: "prefiere entrega por la tarde").',
      },
      {
        texto: 'Hacé clic en "Guardar" para confirmar.',
      },
      {
        texto:
          "Para buscar un cliente: usá la barra de búsqueda — podés buscar por nombre o teléfono.",
      },
      {
        texto: "Para editar los datos de un cliente: hacé clic en el ícono ✏️.",
      },
      {
        texto:
          "Para eliminar un cliente: hacé clic en 🗑️ y confirmá la acción.",
        tip: "Solo eliminá clientes si están duplicados o son errores. Los pedidos asociados al cliente se pueden ver afectados.",
      },
    ],
  },
  {
    id: "pedidos",
    emoji: "🛒",
    titulo: "Pedidos",
    descripcion: "Cómo crear y gestionar el estado de los pedidos",
    color: "text-yellow-700",
    colorBg: "bg-yellow-50",
    colorBorde: "border-yellow-200",
    pasos: [
      {
        texto: 'Ir a la sección "Pedidos" en el menú de la izquierda.',
      },
      {
        texto:
          'Para crear un pedido manual: hacé clic en "+ Nuevo Pedido Manual".',
      },
      {
        texto:
          "Paso 1 — Seleccioná el cliente de la lista. Podés buscarlo por nombre o teléfono.",
      },
      {
        texto:
          "Paso 2 — Agregá los productos y sus cantidades. El total se calcula automáticamente.",
      },
      {
        texto: 'Paso 3 — Revisá el resumen y hacé clic en "Confirmar Pedido".',
        tip: 'Podés agregar observaciones generales al pedido (ej: "entregar en portería").',
      },
      {
        texto:
          "Para cambiar el estado de un pedido existente: usá el selector de estado en la fila del pedido.",
        tip: "Los estados disponibles son: Borrador → Confirmado → Preparado → Entregado (o Cancelado).",
      },
      {
        texto:
          "Para buscar un pedido: usá la barra de búsqueda o filtrá por estado con los botones de filtro.",
      },
    ],
  },
  {
    id: "gastos",
    emoji: "💰",
    titulo: "Gastos",
    descripcion: "Cómo registrar y controlar los gastos del negocio",
    color: "text-red-700",
    colorBg: "bg-red-50",
    colorBorde: "border-red-200",
    pasos: [
      {
        texto: 'Ir a la sección "Finanzas" en el menú de la izquierda.',
      },
      {
        texto:
          "En la sección de gastos, completá el formulario: nombre del gasto, categoría, monto y fecha.",
        tip: "Las categorías disponibles son: Logística, Compras, Publicidad, Servicios y Otro.",
      },
      {
        texto:
          'El campo "Detalles" es opcional — usalo para agregar más contexto (ej: "compra en mercado central").',
      },
      {
        texto: 'Hacé clic en "Registrar Gasto" para guardar.',
      },
      {
        texto:
          "Los gastos registrados impactan automáticamente en el cálculo de ganancias del Dashboard y Finanzas.",
        tip: "Registrá los gastos el mismo día que ocurren para que las métricas sean precisas.",
      },
      {
        texto:
          "Podés filtrar el período de análisis usando los campos de fecha en la parte superior de la pantalla de Finanzas.",
      },
    ],
  },
  {
    id: "whatsapp",
    emoji: "📲",
    titulo: "Lista de WhatsApp",
    descripcion: "Cómo generar y copiar la lista de productos para el grupo",
    color: "text-green-700",
    colorBg: "bg-green-50",
    colorBorde: "border-green-200",
    pasos: [
      {
        texto: 'Ir a la sección "Productos" en el menú de la izquierda.',
      },
      {
        texto: 'Hacé clic en el botón verde "📢 Publicar Lista a WhatsApp".',
      },
      {
        texto:
          "Se abre un panel con la lista generada automáticamente con todos los productos disponibles.",
      },
      {
        texto:
          "Podés editar el texto de encabezado (saludo/introducción) y el pie (cierre/contacto). Estos textos quedan guardados para la próxima vez.",
        tip: "El texto del encabezado y pie se guarda automáticamente al cerrar el panel.",
      },
      {
        texto:
          'Revisá el "Preview del mensaje completo" para ver cómo quedará antes de copiarlo.',
      },
      {
        texto:
          'Hacé clic en "📋 Copiar lista" — el mensaje completo queda en el portapapeles.',
      },
      {
        texto: "Abrí WhatsApp Web, entrá al grupo y pegá el mensaje (Ctrl+V).",
        tip: 'El botón "Publicar en Pacha-Mama" estará disponible próximamente para envío automático.',
      },
    ],
  },
];

export function ConfiguracionScreen() {
  const [manualAbierto, setManualAbierto] = useState<string | null>(null);
  const [pasoActivo, setPasoActivo] = useState<number>(0);

  const abrirManual = (id: string) => {
    setManualAbierto(id);
    setPasoActivo(0);
  };

  const cerrarManual = () => {
    setManualAbierto(null);
    setPasoActivo(0);
  };

  const manual = MANUALES.find((m) => m.id === manualAbierto);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📖 Manuales de uso</h1>
        <p className="text-sm text-gray-500 mt-1">
          Guías paso a paso para usar cada sección de la aplicación
        </p>
      </div>

      {/* Grid de manuales */}
      {!manualAbierto && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MANUALES.map((m) => (
            <button
              key={m.id}
              onClick={() => abrirManual(m.id)}
              className={`text-left p-5 rounded-2xl border-2 ${m.colorBg} ${m.colorBorde} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}
            >
              <div className="text-4xl mb-3">{m.emoji}</div>
              <h3 className={`text-base font-bold ${m.color} mb-1`}>
                {m.titulo}
              </h3>
              <p className="text-sm text-gray-500 leading-snug">
                {m.descripcion}
              </p>
              <div
                className={`mt-4 text-xs font-semibold ${m.color} flex items-center gap-1 group-hover:gap-2 transition-all`}
              >
                Ver manual →
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Manual abierto — vista detallada */}
      {manualAbierto && manual && (
        <div className="max-w-2xl">
          {/* Volver */}
          <button
            onClick={cerrarManual}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
          >
            ← Volver a los manuales
          </button>

          {/* Header del manual */}
          <div
            className={`rounded-2xl border-2 ${manual.colorBg} ${manual.colorBorde} p-6 mb-6`}
          >
            <div className="text-5xl mb-2">{manual.emoji}</div>
            <h2 className={`text-xl font-bold ${manual.color}`}>
              {manual.titulo}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{manual.descripcion}</p>
            <p className="text-xs text-gray-400 mt-3">
              {manual.pasos.length} pasos
            </p>
          </div>

          {/* Pasos */}
          <div className="space-y-3">
            {manual.pasos.map((paso, idx) => {
              const estaActivo = pasoActivo === idx;
              const estaCompletado = pasoActivo > idx;

              return (
                <button
                  key={idx}
                  onClick={() => setPasoActivo(idx)}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${
                    estaActivo
                      ? `${manual.colorBorde} ${manual.colorBg} shadow-sm`
                      : estaCompletado
                        ? "border-gray-100 bg-gray-50"
                        : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Número / check */}
                    <div
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                        estaCompletado
                          ? "bg-gray-300 text-gray-500"
                          : estaActivo
                            ? `${manual.colorBg} ${manual.color} border-2 ${manual.colorBorde}`
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {estaCompletado ? "✓" : idx + 1}
                    </div>

                    <div className="flex-1">
                      <p
                        className={`text-sm leading-relaxed ${estaActivo ? "font-medium text-gray-900" : "text-gray-600"}`}
                      >
                        {paso.texto}
                      </p>

                      {/* Tip — solo visible cuando el paso está activo */}
                      {estaActivo && paso.tip && (
                        <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <span className="text-amber-500 text-sm shrink-0">
                            💡
                          </span>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            {paso.tip}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navegación entre pasos */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setPasoActivo((p) => Math.max(0, p - 1))}
              disabled={pasoActivo === 0}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            <span className="text-xs text-gray-400">
              Paso {pasoActivo + 1} de {manual.pasos.length}
            </span>

            {pasoActivo < manual.pasos.length - 1 ? (
              <button
                onClick={() =>
                  setPasoActivo((p) => Math.min(manual.pasos.length - 1, p + 1))
                }
                className={`text-sm px-4 py-2 rounded-lg text-white font-medium transition-colors ${manual.color.replace("text-", "bg-").replace("-700", "-600")} hover:opacity-90`}
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={cerrarManual}
                className="text-sm px-4 py-2 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-900 transition-colors"
              >
                ✓ Finalizar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
