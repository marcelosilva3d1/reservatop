import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  UserCheck,
  Clock
} from "lucide-react";

const mockMetrics = {
  today: {
    newUsers: 12,
    appointments: 45,
    revenue: 1250.00,
    averageRating: 4.8
  },
  week: {
    newUsers: 85,
    appointments: 312,
    revenue: 8750.00,
    averageRating: 4.7
  },
  month: {
    newUsers: 340,
    appointments: 1248,
    revenue: 35000.00,
    averageRating: 4.6
  },
  professionals: {
    total: 48,
    active: 42,
    pending: 6,
    averageServices: 8
  }
};

export function AdminMetrics() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Métricas da Plataforma</h2>
        <p className="text-sm text-primary/70">
          Acompanhe o desempenho geral da plataforma
        </p>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="week">Última Semana</TabsTrigger>
          <TabsTrigger value="month">Último Mês</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Novos Usuários"
              value={mockMetrics.today.newUsers}
              icon={Users}
            />
            <MetricCard
              title="Agendamentos"
              value={mockMetrics.today.appointments}
              icon={Calendar}
            />
            <MetricCard
              title="Receita"
              value={`R$ ${mockMetrics.today.revenue.toFixed(2)}`}
              icon={DollarSign}
            />
            <MetricCard
              title="Avaliação Média"
              value={`${mockMetrics.today.averageRating.toFixed(1)} ⭐`}
              icon={Star}
            />
          </div>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Novos Usuários"
              value={mockMetrics.week.newUsers}
              icon={Users}
            />
            <MetricCard
              title="Agendamentos"
              value={mockMetrics.week.appointments}
              icon={Calendar}
            />
            <MetricCard
              title="Receita"
              value={`R$ ${mockMetrics.week.revenue.toFixed(2)}`}
              icon={DollarSign}
            />
            <MetricCard
              title="Avaliação Média"
              value={`${mockMetrics.week.averageRating.toFixed(1)} ⭐`}
              icon={Star}
            />
          </div>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Novos Usuários"
              value={mockMetrics.month.newUsers}
              icon={Users}
            />
            <MetricCard
              title="Agendamentos"
              value={mockMetrics.month.appointments}
              icon={Calendar}
            />
            <MetricCard
              title="Receita"
              value={`R$ ${mockMetrics.month.revenue.toFixed(2)}`}
              icon={DollarSign}
            />
            <MetricCard
              title="Avaliação Média"
              value={`${mockMetrics.month.averageRating.toFixed(1)} ⭐`}
              icon={Star}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Métricas de Profissionais</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de Profissionais"
            value={mockMetrics.professionals.total}
            icon={Users}
          />
          <MetricCard
            title="Profissionais Ativos"
            value={mockMetrics.professionals.active}
            icon={UserCheck}
          />
          <MetricCard
            title="Cadastros Pendentes"
            value={mockMetrics.professionals.pending}
            icon={Clock}
          />
          <MetricCard
            title="Média de Serviços"
            value={mockMetrics.professionals.averageServices}
            icon={TrendingUp}
          />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: any;
}

function MetricCard({ title, value, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
