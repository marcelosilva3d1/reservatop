import { useState, useEffect } from "react";
import { Calendar, User, Clock, DollarSign, MessageCircle, BarChart2, Check, X, Scissors, Link, ExternalLink, Copy, ChevronLeft, ChevronRight, CalendarCheck, CheckCircle, Star, Users, Ban, Settings, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { format, isBefore, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import dashboardService from "@/services/dashboardService";
import professionalService from "@/services/professionalService";
import financialService, { FinancialRecord, FinancialMetrics } from "@/services/financialService";
import metricsService, { DashboardMetrics } from "@/services/metricsService";
import type { Appointment } from "@/types/appointment";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import availabilityService from "@/services/availabilityService";
import { serviceCategories } from "@/data/serviceCategories";
import { formatCurrency, parseCurrency } from "@/lib/format";
import appointmentService from "@/services/appointmentService";
import clientService from "@/services/clientService";
import { Badge } from "@/components/ui/badge";
import whatsappService, { CancellationReason, cancellationReasons } from "@/services/whatsappService";
import { ConfiguracaoHorarios } from "@/components/admin/ConfiguracaoHorarios";
import { ProfileCustomization } from "@/components/admin/ProfileCustomization";

interface AgendamentosProps {
  appointments: Appointment[];
}

interface ClientesProps {
  clients: any[];
  onUpdate?: () => void;
}

const Agendamentos = ({ appointments }: AgendamentosProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState<CancellationReason>("imprevisto_profissional");
  const [customReason, setCustomReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !user) return;

    try {
      setIsLoading(true);

      // Cancela o agendamento
      await appointmentService.cancel(selectedAppointment.id);

      // Envia mensagem de WhatsApp
      await whatsappService.sendProfessionalCancellation(
        selectedAppointment.clientPhone,
        {
          clientName: selectedAppointment.clientName,
          date: format(new Date(selectedAppointment.date), 'dd/MM/yyyy'),
          time: selectedAppointment.time,
          serviceName: selectedAppointment.serviceName,
          professionalName: user.name,
          reason: cancellationReason,
          customReason: customReason
        }
      );

      toast({
        title: "Agendamento cancelado",
        description: "O cliente será notificado via WhatsApp.",
      });

      setIsCancelDialogOpen(false);
      window.location.reload(); // Recarrega para atualizar a lista
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingAppointments = appointments
    .filter(app => {
      const appointmentDate = new Date(`${app.date}T${app.time}-03:00`);
      const now = new Date();
      return appointmentDate >= now && app.status !== 'cancelled';
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}-03:00`);
      const dateB = new Date(`${b.date}T${b.time}-03:00`);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Próximos Agendamentos</h2>
      {upcomingAppointments.length === 0 ? (
        <p>Nenhum agendamento encontrado.</p>
      ) : (
        upcomingAppointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{appointment.serviceName}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(`${appointment.date}T00:00:00-03:00`), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {appointment.time}
                  </p>
                  <p className="text-sm mt-2">
                    <span className="font-semibold">Cliente:</span> {appointment.clientName}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Contato:</span> {appointment.clientPhone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">R$ {appointment.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{appointment.duration} min</p>
                  <div className="mt-2 space-y-2">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      appointment.status === "confirmed" ? "bg-green-100 text-green-800" :
                      appointment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    )}>
                      {appointment.status === "confirmed" ? "Confirmado" :
                       appointment.status === "pending" ? "Pendente" : "Cancelado"}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        "font-medium text-rose-600 hover:text-rose-700",
                        "hover:bg-rose-100",
                        "transition-all duration-200",
                        "flex items-center gap-1"
                      )}
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setIsCancelDialogOpen(true);
                      }}
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Selecione o motivo do cancelamento. O cliente será notificado via WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo do cancelamento</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value as CancellationReason)}
              >
                {Object.entries(cancellationReasons).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {cancellationReason === "outro" && (
              <div className="space-y-2">
                <Label>Descreva o motivo</Label>
                <Input
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Descreva o motivo do cancelamento..."
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isLoading || (cancellationReason === "outro" && !customReason.trim())}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Confirmar Cancelamento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Clientes = ({ clients, onUpdate }: ClientesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleBlock = async (clientId: string, currentStatus: 'active' | 'blocked') => {
    if (!user?.id) return;
    
    try {
      setLoading(clientId);
      await clientService.toggleBlock(clientId);
      
      toast({
        title: currentStatus === 'blocked' ? "Cliente desbloqueado" : "Cliente bloqueado",
        description: currentStatus === 'blocked' 
          ? "O cliente foi desbloqueado e poderá fazer novos agendamentos." 
          : "O cliente foi bloqueado e não poderá fazer novos agendamentos.",
        variant: currentStatus === 'blocked' ? "default" : "destructive"
      });

      // Atualiza a lista de clientes
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do cliente",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Clientes</h2>
      {clients.length === 0 ? (
        <p>Nenhum cliente encontrado.</p>
      ) : (
        clients.map((client) => (
          <Card key={client.email}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <p className="text-sm text-gray-500">{client.email}</p>
                  <p className="text-sm">{client.phone}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge 
                      variant={client.status === 'blocked' ? "destructive" : "success"}
                      className="capitalize"
                    >
                      {client.status === 'blocked' ? 'Bloqueado' : 'Ativo'}
                    </Badge>
                    {client.totalAppointments > 0 && (
                      <Badge variant="secondary">
                        {client.totalAppointments} agendamento{client.totalAppointments > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Button 
                    variant={client.status === 'blocked' ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => handleToggleBlock(client.id, client.status)}
                    disabled={loading === client.id}
                    className={cn(
                      "font-medium",
                      client.status === 'blocked'
                        ? "border-green-500 text-green-600 hover:bg-green-50" 
                        : "hover:bg-red-600"
                    )}
                  >
                    {loading === client.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : client.status === 'blocked' ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Desbloquear
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 mr-2" />
                        Bloquear
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

const Servicos = ({ professional, onUpdate }: { professional: any, onUpdate: () => void }) => {
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: ''
  });

  const [priceInput, setPriceInput] = useState('');

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const value = e.target.value;
    if (isEditing) {
      setEditingService(prev => ({
        ...prev,
        price: parseCurrency(value)
      }));
    } else {
      setPriceInput(value);
      setNewService(prev => ({
        ...prev,
        price: parseCurrency(value)
      }));
    }
  };

  const startEditing = (service: any, index: number) => {
    // Criar uma cópia profunda do serviço para edição
    setEditingService({...service});
    setEditingIndex(index);
  };

  const cancelEditing = () => {
    setEditingService(null);
    setEditingIndex(null);
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.description || !newService.category || newService.price <= 0 || newService.duration <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedServices = [...professional.services, newService];
      await professionalService.updateServices(professional.id, updatedServices);
      
      toast({
        title: "Serviço adicionado",
        description: "O serviço foi adicionado com sucesso."
      });
      
      setShowServiceForm(false);
      setNewService({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        category: ''
      });
      setPriceInput('');
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro ao adicionar serviço",
        description: "Ocorreu um erro ao adicionar o serviço. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleEditService = async () => {
    if (!editingService || editingIndex === null) return;

    if (!editingService.name || !editingService.description || !editingService.category || editingService.price <= 0 || editingService.duration <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedServices = [...professional.services];
      updatedServices[editingIndex] = editingService;
      
      await professionalService.updateServices(professional.id, updatedServices);
      
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso."
      });
      
      setEditingService(null);
      setEditingIndex(null);
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro ao atualizar serviço",
        description: "Ocorreu um erro ao atualizar o serviço. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteService = async (index: number) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      const updatedServices = professional.services.filter((_, i) => i !== index);
      await professionalService.updateServices(professional.id, updatedServices);
      
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso."
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro ao excluir serviço",
        description: "Ocorreu um erro ao excluir o serviço. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Serviços</h2>
        <Button onClick={() => setShowServiceForm(true)} className="bg-emerald-500 hover:bg-emerald-600">
          Adicionar Serviço
        </Button>
      </div>

      {/* Lista de Serviços */}
      <div className="grid gap-4">
        {professional.services.map((service: any, index: number) => (
          <Card key={index}>
            <CardContent className="p-6">
              {editingIndex === index ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label>Categoria</Label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={editingService.category}
                        onChange={e => setEditingService({...editingService, category: e.target.value})}
                      >
                        <option value="">Selecione uma categoria</option>
                        {serviceCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Nome do Serviço</Label>
                      <Input
                        value={editingService.name}
                        onChange={e => setEditingService({...editingService, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input
                        value={editingService.description}
                        onChange={e => setEditingService({...editingService, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Preço (R$)</Label>
                        <Input
                          value={formatCurrency(editingService.price)}
                          onChange={e => handlePriceChange(e, true)}
                          placeholder="R$ 0,00"
                        />
                      </div>
                      <div>
                        <Label>Duração</Label>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          value={editingService.duration}
                          onChange={e => setEditingService({...editingService, duration: Number(e.target.value)})}
                        >
                          <option value="15">15 minutos</option>
                          <option value="30">30 minutos</option>
                          <option value="45">45 minutos</option>
                          <option value="60">1 hora</option>
                          <option value="90">1 hora e 30 minutos</option>
                          <option value="120">2 horas</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={cancelEditing}>
                      Cancelar
                    </Button>
                    <Button onClick={handleEditService}>
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                    <p className="text-muted-foreground mb-2">{service.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-emerald-600 font-medium">{formatCurrency(service.price)}</span>
                      <span className="text-muted-foreground">{service.duration} minutos</span>
                      <span className="text-muted-foreground">{serviceCategories.find(cat => cat.id === service.category)?.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(service, index)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteService(index)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Novo Serviço */}
      <Dialog open={showServiceForm} onOpenChange={setShowServiceForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Serviço</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo serviço que você oferece.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label>Categoria</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={newService.category}
                onChange={e => setNewService({...newService, category: e.target.value})}
              >
                <option value="">Selecione uma categoria</option>
                {serviceCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Nome do Serviço</Label>
              <Input
                value={newService.name}
                onChange={e => setNewService({...newService, name: e.target.value})}
                placeholder="Ex: Corte de Cabelo"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={newService.description}
                onChange={e => setNewService({...newService, description: e.target.value})}
                placeholder="Descreva o serviço"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço (R$)</Label>
                <Input
                  value={priceInput}
                  onChange={handlePriceChange}
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <Label>Duração</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newService.duration}
                  onChange={e => setNewService({...newService, duration: Number(e.target.value)})}
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora e 30 minutos</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddService}>
              Adicionar Serviço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Financeiro = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFinancialData();
  }, [period, user?.id]);

  const loadFinancialData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const [newRecords, newMetrics] = await Promise.all([
        financialService.getRecords(
          user.id,
          period === 'day' ? startOfDay(new Date()) :
          period === 'week' ? startOfWeek(new Date(), { weekStartsOn: 0 }) :
          startOfMonth(new Date()),
          period === 'day' ? endOfDay(new Date()) :
          period === 'week' ? endOfWeek(new Date(), { weekStartsOn: 0 }) :
          endOfMonth(new Date())
        ),
        financialService.getMetrics(user.id, period)
      ]);

      setRecords(newRecords);
      setMetrics(newMetrics);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast({
        title: "Erro ao carregar dados financeiros",
        description: "Não foi possível carregar os dados financeiros. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financeiro</h2>
        <div className="flex gap-2">
          <Button
            variant={period === 'day' ? 'default' : 'outline'}
            onClick={() => setPeriod('day')}
          >
            Hoje
          </Button>
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            onClick={() => setPeriod('week')}
          >
            Esta Semana
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            onClick={() => setPeriod('month')}
          >
            Este Mês
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando dados financeiros...</div>
      ) : (
        <>
          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <DollarSign className="w-8 h-8 text-green-500 mb-2" />
                  <h3 className="text-lg font-semibold">Receita Total</h3>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {metrics?.totalIncome.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {metrics?.compareLastPeriod && metrics.compareLastPeriod > 0 ? "text-green-600" : "text-red-600"}
                    {metrics?.compareLastPeriod.toFixed(1)}% vs. período anterior
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <CalendarCheck className="w-8 h-8 text-blue-500 mb-2" />
                  <h3 className="text-lg font-semibold">Receita Prevista</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {metrics?.expectedDailyIncome.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {period === 'day' ? 'agendamentos de hoje' :
                     period === 'week' ? 'agendamentos desta semana' :
                     'agendamentos deste mês'}
                  </p>
                  <p className="text-xs text-gray-400">
                    inclui agendamentos pendentes
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <BarChart2 className="w-8 h-8 text-indigo-500 mb-2" />
                  <h3 className="text-lg font-semibold">Serviços Realizados</h3>
                  <p className="text-2xl font-bold">
                    {records.length}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    neste período
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Scissors className="w-8 h-8 text-purple-500 mb-2" />
                  <h3 className="text-lg font-semibold">Serviço Mais Rentável</h3>
                  {metrics?.topServices[0] ? (
                    <>
                      <p className="text-xl font-bold">{metrics.topServices[0].name}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        R$ {metrics.topServices[0].total.toFixed(2)} em {metrics.topServices[0].count} serviços
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum serviço no período</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Transações */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Histórico de Transações</h3>
            {records.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  Nenhuma transação encontrada neste período
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {records.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{record.serviceName}</h3>
                          <p className="text-sm text-gray-500">
                            Cliente: {record.clientName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(parseISO(record.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        <p className={cn(
                          "font-semibold",
                          record.type === "income" ? "text-green-600" : "text-red-600"
                        )}>
                          {record.type === "income" ? "+" : "-"}R$ {record.amount.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Metricas = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, [user?.id]);

  const loadMetrics = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const data = await metricsService.getAllMetrics(user.id);
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast({
        title: "Erro ao carregar métricas",
        description: "Não foi possível carregar as métricas. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando métricas...</div>;
  }

  if (!metrics) {
    return <div className="text-center py-8">Nenhuma métrica disponível</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Métricas</h2>

      {/* Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="text-lg font-semibold">Taxa de Conclusão</h3>
              <p className="text-2xl font-bold text-green-600">
                {metrics.performanceMetrics.completionRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-2">
                dos agendamentos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 text-yellow-500 mb-2" />
              <h3 className="text-lg font-semibold">Avaliação Média</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {metrics.performanceMetrics.averageRating.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                em {metrics.performanceMetrics.totalReviews} avaliações
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="text-lg font-semibold">Total de Clientes</h3>
              <p className="text-2xl font-bold text-blue-600">
                {metrics.clientMetrics.totalClients}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {metrics.clientMetrics.newClientsThisMonth} novos este mês
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="text-lg font-semibold">Horas Trabalhadas</h3>
              <p className="text-2xl font-bold text-purple-600">
                {metrics.timeMetrics.totalHoursWorked}h
              </p>
              <p className="text-sm text-gray-500 mt-2">
                média de {metrics.timeMetrics.averageServiceDuration}min/serviço
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Serviços Mais Populares */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Serviços Mais Populares</h3>
        <div className="grid grid-cols-1 gap-4">
          {metrics.serviceMetrics
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map((service) => (
              <Card key={service.serviceName}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{service.serviceName}</h4>
                      <p className="text-sm text-gray-500">
                        {service.count} agendamentos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        R$ {service.totalRevenue.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">{service.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Dias Mais Movimentados */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Dias Mais Movimentados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">Dias com Mais Agendamentos</h4>
              <ul className="space-y-2">
                {metrics.timeMetrics.busyDays.map((day) => (
                  <li key={day} className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{format(parseISO(day), "dd 'de' MMMM", { locale: ptBR })}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">Dias Mais Tranquilos</h4>
              <ul className="space-y-2">
                {metrics.timeMetrics.quietDays.map((day) => (
                  <li key={day} className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{format(parseISO(day), "dd 'de' MMMM", { locale: ptBR })}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const HorariosLivres = ({ professional }: { professional: any }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSlots, setTotalSlots] = useState(0);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setIsLoading(true);
      try {
        const slots = await availabilityService.getAvailableSlots(
          professional.id,
          selectedDate,
          30 // Duração mínima para mostrar slots disponíveis
        );
        setAvailableSlots(slots.map(slot => slot.start));
        setTotalSlots(slots.length);
      } catch (error) {
        console.error('Erro ao buscar horários:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, professional.id]);

  const nextDay = () => {
    setSelectedDate(date => addDays(date, 1));
  };

  const previousDay = () => {
    const newDate = addDays(selectedDate, -1);
    if (newDate >= new Date()) {
      setSelectedDate(newDate);
    }
  };

  // Agrupa os horários por período
  const groupedSlots = {
    manha: availableSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= 6 && hour < 12;
    }),
    tarde: availableSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= 12 && hour < 18;
    }),
    noite: availableSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= 18;
    })
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horários Disponíveis</CardTitle>
          <CardDescription>
            Visualize seus horários livres para hoje e dias seguintes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={previousDay}
              disabled={isBefore(startOfDay(selectedDate), startOfDay(new Date()))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <div className="font-medium text-lg">
                {format(selectedDate, "EEEE", { locale: ptBR })}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={nextDay}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                <div className="text-sm text-emerald-700 mb-2">Resumo do dia:</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-emerald-700">{groupedSlots.manha.length}</div>
                    <div className="text-emerald-600">Manhã</div>
                  </div>
                  <div>
                    <div className="font-medium text-emerald-700">{groupedSlots.tarde.length}</div>
                    <div className="text-emerald-600">Tarde</div>
                  </div>
                  <div>
                    <div className="font-medium text-emerald-700">{groupedSlots.noite.length}</div>
                    <div className="text-emerald-600">Noite</div>
                  </div>
                </div>
              </div>

              {/* Horários por período */}
              {Object.entries(groupedSlots).map(([periodo, slots]) => slots.length > 0 && (
                <div key={periodo}>
                  <h4 className="text-sm font-medium mb-2 text-emerald-800 capitalize">
                    {periodo === 'manha' ? 'Manhã' : periodo === 'tarde' ? 'Tarde' : 'Noite'}
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map(slot => (
                      <div
                        key={slot}
                        className="bg-emerald-50 hover:bg-emerald-100 transition-colors text-emerald-700 rounded-md px-3 py-2 text-center text-sm font-medium border border-emerald-200"
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
              <div className="font-medium">Nenhum horário disponível</div>
              <div className="text-sm">Tente selecionar outra data</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("agendamentos");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [professional, setProfessional] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsData, clientsData, professionalData] = await Promise.all([
        appointmentService.listByProfessional(user?.id || ''),
        clientService.listByProfessional(user?.id || ''),
        professionalService.getById(user?.id || '')
      ]);

      // Atualiza status para completed automaticamente
      await appointmentService.checkAndUpdateCompletedStatus(appointmentsData);
      
      // Recarrega os agendamentos após a atualização
      const updatedAppointments = await appointmentService.listByProfessional(user?.id || '');
      
      setAppointments(updatedAppointments);
      setClients(clientsData);
      setProfessional(professionalData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Verifica a cada 5 minutos
    const interval = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const renderSelectedTab = () => {
    if (!professional) return null;

    switch (activeTab) {
      case "agendamentos":
        return <Agendamentos appointments={appointments} />;
      case "clientes":
        return <Clientes clients={clients} onUpdate={loadData} />;
      case "servicos":
        return <Servicos professional={professional} onUpdate={loadData} />;
      case "financeiro":
        return <Financeiro />;
      case "metricas":
        return <Metricas />;
      case "horarios-livres":
        return <HorariosLivres professional={professional} />;
      case "configuracoes":
        return <ConfiguracaoHorarios professional={professional} onUpdate={loadData} />;
      case "personalizacao":
        return <ProfileCustomization professional={professional} onUpdate={loadData} />;
      default:
        return null;
    }
  };

  const handleCopyUrl = () => {
    if (professional?.profileUrl) {
      const url = `${window.location.origin}/${professional.profileUrl}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para sua área de transferência.",
      });
    }
  };

  const handleOpenUrl = () => {
    if (professional?.profileUrl) {
      const url = `${window.location.origin}/${professional.profileUrl}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {professional?.profileImage?.url ? (
                <AvatarImage 
                  src={professional.profileImage.url} 
                  alt={professional.name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback>
                  {professional?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-primary">Painel do Profissional</h1>
              <p className="text-muted-foreground">
                Gerencie seus clientes e agendamentos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Profile URL Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Sua Página de Agendamentos</CardTitle>
          <CardDescription>
            Compartilhe este link com seus clientes para que eles possam fazer agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary/10 rounded-lg gap-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Link className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="font-medium text-sm truncate">
                {professional?.profileUrl ? (
                  `${window.location.origin}/${professional.profileUrl}`
                ) : (
                  "Carregando..."
                )}
              </span>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleCopyUrl} className="flex-1 sm:flex-none">
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenUrl} className="flex-1 sm:flex-none">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6">
        {renderSelectedTab()}
      </div>
    </div>
  );
};

const tabs = [
  { id: "agendamentos", label: "Agendamentos", icon: Calendar },
  { id: "clientes", label: "Clientes", icon: User },
  { id: "servicos", label: "Serviços", icon: Scissors },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "metricas", label: "Métricas", icon: BarChart2 },
  { id: "horarios-livres", label: "Horários Livres", icon: Clock },
  { id: "configuracoes", label: "Configurações", icon: Settings },
  { id: "personalizacao", label: "Personalização", icon: Palette },
];
