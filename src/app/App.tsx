import { useState } from "react";
import { Toaster } from "@/app/components/ui/sonner";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardScreen } from "@/app/components/screens/DashboardScreen";
import { PedidosScreen } from "@/app/components/screens/PedidosScreen";
import { ClientesScreen } from "@/app/components/screens/ClientesScreen";
import { Products } from "@/app/components/screens/Products";
import { FinanzasScreen } from "@/app/components/screens/FinanzasScreen";
import { ConfiguracionScreen } from "@/app/components/screens/ConfiguracionScreen";

export default function App() {
  const [activeScreen, setActiveScreen] = useState("dashboard");

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return <DashboardScreen />;
      case "pedidos":
        return <PedidosScreen />;
      case "clientes":
        return <ClientesScreen />;
      case "productos":
        return <Products />;
      case "finanzas":
        return <FinanzasScreen />;
      case "configuracion":
        return <ConfiguracionScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster />
      {/* Sidebar */}
      <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {renderScreen()}
        </div>
      </main>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
