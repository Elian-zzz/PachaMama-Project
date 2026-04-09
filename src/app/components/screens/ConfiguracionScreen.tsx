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
    id: "stock",
    emoji: "📦",
    titulo: "Inventario y Stock",
    descripcion: "Acumulación automática y ajustes manuales",
    color: "text-indigo-700",
    colorBg: "bg-indigo-50",
    colorBorde: "border-indigo-200",
    pasos: [
      {
        texto:
          "El stock de PachaMama funciona con un sistema de 'Movimientos', garantizando un registro preciso y acumulativo.",
      },
      {
        texto:
          "Descuento automático: Cada vez que completas o confirmas un pedido manualmente, el sistema restará el inventario necesario. No tienes que hacerlo tú.",
      },
      {
        texto:
          "Devolución automática: Si alguien se arrepiente y un pedido cambia su estado a 'Cancelado', PachaMama revertirá los productos exactos regresándolos al stock.",
        tip: "Para re-utilizar la devolución en ventas inmediatas, simplemente cancela arrastrando el estado del pedido a cancelado.",
      },
      {
        texto:
          "Ajuste Manual Rápido: Sirve para decirle al sistema cuántas unidades REALES tienes físicamente.",
        tip: "Utiliza la opción de 'Ajuste manual' cuando llegue nueva mercadería del proveedor o si encuentras mermas (pérdida o daños) y necesitas sobreescribir el acumulado actual a la realidad.",
      },
    ],
  },
  {
    id: "ofertas",
    emoji: "🏷️",
    titulo: "Ofertas y Promociones",
    descripcion: "Configuración de descuentos por volumen de compras",
    color: "text-pink-700",
    colorBg: "bg-pink-50",
    colorBorde: "border-pink-200",
    pasos: [
      {
        texto:
          "Las promociones se aplican mágicamente de forma visual cuando creas un Pedido Nuevo — si se cumple la condición, el texto se pone verde indicando que el cliente aplica para la rebaja.",
      },
      {
        texto:
          'Ofertas "Cantidad Exacta": Ideales para "Promos cerradas". El sistema aplicará el precio únicamente cuando el usuario seleccione EXACTAMENTE esa cantidad, ni más ni menos.',
        tip: "Ejemplo de Exacta: Promo del mes: «Llevando 3 Kg de acelga = $150 final». Si compra 4 kilos, vuelve al precio normal.",
      },
      {
        texto:
          'Ofertas "Cantidad Mínima": Sirve para rebajas por mayor. A partir de esa cantidad en adelante para el mismo producto, todo correrá bajo el nuevo precio especial por unidad.',
        tip: "Ejemplo Mínima: A partir de 10 unidades de Limón, el valor unitario cae de $20 a solo $12 para cada limón que exceda de 10.",
      },
      {
        texto:
          "Para activar temporalmente o suspender una oferta, simplemente utiliza el botón de Activa/Inactiva desde el panel de ofertas, en lugar de borrarla definitivamente.",
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
          "Paso 2 — Agregá los productos y cantidades. Si un producto califica a una oferta el total se descontará de inmediato.",
      },
      {
        texto: 'Paso 3 — Revisá el resumen y hacé clic en "Confirmar Pedido".',
        tip: 'Podés agregar observaciones exclusivas al pedido (ej: "entregar en portería, avisar antes").',
      },
      {
        texto:
          "Para cambiar el estado de un pedido existente: usá el selector visual en la fila.",
        tip: "Los estados son: Borrador → Confirmado → Preparado → Entregado → Cancelado.",
      },
    ],
  },
  {
    id: "gastos",
    emoji: "💰",
    titulo: "Gastos y Finanzas",
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
          "En la sección de gastos, completá: nombre del gasto, categoría, monto y fecha.",
        tip: "Las categorías disponibles ordenarán luego tu pastel gráfico analítico: Logística, Compras, Publicidad y Servicios.",
      },
      {
        texto:
          "Los gastos impactan automáticamente en el cálculo de ganancias del Dashboard junto a tus pedidos entregados.",
        tip: "Registrá los imprevistos que le quiten rentabilidad al mes el mismo día exacto en el que pasen, así los cálculos mensuales son infalibles.",
      },
    ],
  },
  {
    id: "whatsapp",
    emoji: "📲",
    titulo: "Catálogo a WhatsApp",
    descripcion: "Cómo generar tu lista de Broadcast para el grupo de clientes",
    color: "text-green-700",
    colorBg: "bg-green-50",
    colorBorde: "border-green-200",
    pasos: [
      {
        texto: 'Ir a la sección "Productos" en el menú lateral.',
      },
      {
        texto: 'Hacé clic arriba a la derecha en "📢 Publicar Lista a WhatsApp".',
      },
      {
        texto:
          "El sistema procesa y extrae todos los productos DISPONIBLES de tu tienda omitiendo los vacíos.",
      },
      {
        texto:
          "Puedes modificar el Texto Encabezado de Saludo y el Pie de despedida como quieras antes de copiarlo. Esa memoria quedará guardada en la base de datos mágicamente.",
        tip: "Dile al cliente en tu Saludo la fecha en la que aceptas límite de pedidos. ¡Incrementará el FOMO!",
      },
      {
        texto: 'Hacé clic en "📋 Copiar lista" y pégalo directo en la App.',
      },
    ],
  },
  {
    id: "clientes",
    emoji: "👥",
    titulo: "Clientes",
    descripcion: "Cómo gestionar el directorio de fidelización",
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
          "Es vital capturar el teléfono (WhatsApp) adecuadamente para posibles automatizaciones en el futuro.",
        tip: 'El campo "Notas" es crucial. Apunta ahí manías del cliente: ("Suele quejarse de la madurez del tomate" o "Le gusta que toquen el timbre flojo").',
      },
      {
        texto:
          "Puedes buscar velozmente clientes por su teléfono tecleando al momento.",
        tip: "Evita borrar clientes. Si dejan de pedir, simplemente déjalos en tu recámara de base de datos — podrás lanzar campañas futuras para reconquistarlos.",
      },
    ],
  },
];

export function ConfiguracionScreen() {
  const [manualAbierto, setManualAbierto] = useState<string | null>(null);

  const abrirManual = (id: string) => {
    setManualAbierto(id);
  };

  const cerrarManual = () => {
    setManualAbierto(null);
  };

  const manual = MANUALES.find((m) => m.id === manualAbierto);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📖 Recetario de Ayuda</h1>
        <p className="text-sm text-gray-500 mt-1">
          Guías completas en un bloque para que domines PachaMama sin pestañear
        </p>
      </div>

      {/* Grid de manuales */}
      {!manualAbierto && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MANUALES.map((m) => (
            <button
              key={m.id}
              onClick={() => abrirManual(m.id)}
              className={`text-left p-6 flex flex-col justify-between h-full rounded-2xl border ${m.colorBg} border-transparent bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
            >
              <div>
                <div className="text-4xl mb-4">{m.emoji}</div>
                <h3 className={`text-lg font-bold ${m.color} mb-2`}>
                  {m.titulo}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {m.descripcion}
                </p>
              </div>
              <div
                className={`mt-6 text-sm font-bold ${m.color} flex items-center gap-2 group-hover:gap-3 transition-all`}
              >
                Abrir recetario <span className="text-lg">→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Manual abierto — vista detallada tipo Libro/Receta */}
      {manualAbierto && manual && (
        <div className="max-w-3xl mx-auto pb-10">
          {/* Botón Volver */}
          <button
            onClick={cerrarManual}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
          >
            ← Volver a los recetarios
          </button>

          {/* Tarjeta del Libro */}
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
            {/* Header del libro  */}
            <div className={`${manual.colorBg} px-8 py-10 relative overflow-hidden`}>
              <div
                className={`absolute top-0 right-0 -mr-10 -mt-10 opacity-10 text-[10rem]`}
              >
                {manual.emoji}
              </div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 drop-shadow-sm">
                  {manual.emoji}
                </div>
                <h2 className={`text-3xl font-black ${manual.color} mb-2 tracking-tight`}>
                  {manual.titulo}
                </h2>
                <p className="text-base text-gray-700 font-medium max-w-lg">
                  {manual.descripcion}
                </p>
              </div>
            </div>

            {/* Lista continua de contenido */}
            <div className="px-8 py-10 space-y-8 relative">
              {/* Línea conectora visual */}
              <div className="absolute left-[3.2rem] top-12 bottom-12 w-px bg-gray-100"></div>

              {manual.pasos.map((paso, idx) => (
                <div key={idx} className="relative z-10">
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Número/Bullet flotante */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border ${manual.colorBg} ${manual.colorBorde} ${manual.color} bg-white mt-1`}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex-1">
                      {/* Texto de la regla */}
                      <div className="text-gray-800 leading-relaxed font-medium">
                        {paso.texto}
                      </div>

                      {/* Pro-Tip de la "Receta" */}
                      {paso.tip && (
                        <div className="mt-4 relative group">
                          <div className="absolute inset-0 bg-yellow-400 rounded-xl blur-[2px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                          <div className="relative bg-gradient-to-r from-yellow-50 to-orange-50/30 border border-yellow-200/60 rounded-xl px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="text-yellow-600 text-lg shrink-0 mt-0.5">
                                💡
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-widest mb-1 opacity-70">
                                  PROTIP DE PACHAMAMA
                                </h4>
                                <p className="text-sm text-yellow-900/90 leading-relaxed font-medium">
                                  {paso.tip}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer de Finalización */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={cerrarManual}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
              >
                <span>¡Entendido!</span>
                <span>✓</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
