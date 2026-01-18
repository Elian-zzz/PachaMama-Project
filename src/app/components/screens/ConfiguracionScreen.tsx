import { User, Bell, Lock, Palette, Database } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Switch } from "@/app/components/ui/switch";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";

export function ConfiguracionScreen() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <h1>Configuración</h1>

      {/* Profile Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
            <User className="text-white" size={24} />
          </div>
          <div>
            <h3>Perfil de Usuario</h3>
            <p className="text-sm text-gray-600">
              Administra tu información personal
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" defaultValue="Juan Delgado" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="juan@pachamama.cl" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" defaultValue="+56 9 1234 5678" />
            </div>
            <div>
              <Label htmlFor="rol">Rol</Label>
              <Input id="rol" defaultValue="Administrador" disabled />
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            Guardar Cambios
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bell className="text-white" size={24} />
          </div>
          <div>
            <h3>Notificaciones</h3>
            <p className="text-sm text-gray-600">
              Configura tus preferencias de notificación
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm">Notificaciones de nuevos pedidos</p>
              <p className="text-xs text-gray-600">
                Recibe alertas cuando lleguen pedidos nuevos
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm">Recordatorios de entregas</p>
              <p className="text-xs text-gray-600">
                Alertas para pedidos pendientes de entrega
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm">Reportes semanales por email</p>
              <p className="text-xs text-gray-600">
                Resumen de ventas e ingresos cada semana
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Business Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <Database className="text-white" size={24} />
          </div>
          <div>
            <h3>Configuración del Negocio</h3>
            <p className="text-sm text-gray-600">
              Ajustes generales de PachaMama
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="negocio">Nombre del negocio</Label>
            <Input id="negocio" defaultValue="PachaMama" />
          </div>
          <div>
            <Label htmlFor="direccion">Dirección de operaciones</Label>
            <Input
              id="direccion"
              defaultValue="Calle Principal 123, Santiago"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whatsapp">WhatsApp Business</Label>
              <Input id="whatsapp" defaultValue="+56 9 8765 4321" />
            </div>
            <div>
              <Label htmlFor="horario">Horario de atención</Label>
              <Input id="horario" defaultValue="Lun-Sáb 9:00-18:00" />
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            Guardar Cambios
          </Button>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <Lock className="text-white" size={24} />
          </div>
          <div>
            <h3>Seguridad</h3>
            <p className="text-sm text-gray-600">
              Gestiona la seguridad de tu cuenta
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="password-actual">Contraseña actual</Label>
            <Input
              id="password-actual"
              type="password"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password-nueva">Nueva contraseña</Label>
              <Input
                id="password-nueva"
                type="password"
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label htmlFor="password-confirmar">Confirmar contraseña</Label>
              <Input
                id="password-confirmar"
                type="password"
                placeholder="••••••••"
              />
            </div>
          </div>
          <Button variant="destructive">Cambiar Contraseña</Button>
        </div>
      </Card>
    </div>
  );
}
