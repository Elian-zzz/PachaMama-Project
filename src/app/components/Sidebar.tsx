import {
  Home,
  ShoppingCart,
  Users,
  Leaf,
  DollarSign,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", badge: null },
    { id: "pedidos", icon: ShoppingCart, label: "Pedidos", badge: null },
    { id: "clientes", icon: Users, label: "Clientes", badge: null },
    { id: "productos", icon: Leaf, label: "Productos", badge: null },
    { id: "finanzas", icon: DollarSign, label: "Finanzas", badge: null },
    {
      id: "configuracion",
      icon: Settings,
      label: "Configuración",
      badge: null,
    },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-600 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-60 bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-300
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🥬</span>
            <span className="text-xl font-semibold text-emerald-600">
              PachaMama
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors duration-200
                      ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-emerald-600 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center">
              LR
            </div>
            <div className="flex-1">
              <div className="text-sm">Laura Rhodas</div>
              <div className="text-xs text-gray-500">Administrador</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
