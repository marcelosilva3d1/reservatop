import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Scissors, 
  BarChart2, 
  Settings, 
  UserCheck,
  AlertTriangle
} from "lucide-react";
import { ProfessionalsManager } from "@/components/admin/ProfessionalsManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { AdminMetrics } from "@/components/admin/AdminMetrics";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { ReportsManager } from "@/components/admin/ReportsManager";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("professionals");

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 gap-4 bg-transparent">
          <TabsTrigger
            value="professionals"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Profissionais
          </TabsTrigger>
          
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="w-4 h-4 mr-2" />
            Usuários
          </TabsTrigger>

          <TabsTrigger
            value="categories"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Scissors className="w-4 h-4 mr-2" />
            Categorias
          </TabsTrigger>

          <TabsTrigger
            value="metrics"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Métricas
          </TabsTrigger>

          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Denúncias
          </TabsTrigger>

          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="professionals" className="p-6 bg-white rounded-lg shadow">
          <ProfessionalsManager />
        </TabsContent>

        <TabsContent value="users" className="p-6 bg-white rounded-lg shadow">
          <UsersManager />
        </TabsContent>

        <TabsContent value="categories" className="p-6 bg-white rounded-lg shadow">
          <CategoriesManager />
        </TabsContent>

        <TabsContent value="metrics" className="p-6 bg-white rounded-lg shadow">
          <AdminMetrics />
        </TabsContent>

        <TabsContent value="reports" className="p-6 bg-white rounded-lg shadow">
          <ReportsManager />
        </TabsContent>

        <TabsContent value="settings" className="p-6 bg-white rounded-lg shadow">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
