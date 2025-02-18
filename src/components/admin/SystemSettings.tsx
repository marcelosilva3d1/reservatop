import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export function SystemSettings() {
  const [settings, setSettings] = useState({
    allowNewRegistrations: true,
    requireApproval: true,
    maxAppointmentsPerDay: 20,
    appointmentTimeSlot: 30,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    platformFee: 10,
  });

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Implementar salvamento das configurações
    console.log("Configurações salvas:", settings);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
        <p className="text-sm text-primary/70">
          Gerencie as configurações gerais da plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="allowNewRegistrations">
                Permitir Novos Registros
              </Label>
              <Switch
                id="allowNewRegistrations"
                checked={settings.allowNewRegistrations}
                onCheckedChange={(checked) =>
                  handleSettingChange("allowNewRegistrations", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="requireApproval">
                Exigir Aprovação de Profissionais
              </Label>
              <Switch
                id="requireApproval"
                checked={settings.requireApproval}
                onCheckedChange={(checked) =>
                  handleSettingChange("requireApproval", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxAppointments">
                Máximo de Agendamentos por Dia
              </Label>
              <Input
                id="maxAppointments"
                type="number"
                value={settings.maxAppointmentsPerDay}
                onChange={(e) =>
                  handleSettingChange(
                    "maxAppointmentsPerDay",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeSlot">Intervalo de Tempo (minutos)</Label>
              <Input
                id="timeSlot"
                type="number"
                value={settings.appointmentTimeSlot}
                onChange={(e) =>
                  handleSettingChange(
                    "appointmentTimeSlot",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Notificações por Email</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange("emailNotifications", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotifications">Notificações por SMS</Label>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange("smsNotifications", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações Financeiras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformFee">Taxa da Plataforma (%)</Label>
              <Input
                id="platformFee"
                type="number"
                value={settings.platformFee}
                onChange={(e) =>
                  handleSettingChange("platformFee", parseFloat(e.target.value))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) =>
              handleSettingChange("maintenanceMode", checked)
            }
          />
          <Label htmlFor="maintenanceMode">Modo de Manutenção</Label>
        </div>
        <Button onClick={handleSave}>Salvar Configurações</Button>
      </div>
    </div>
  );
}
