import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import appointmentService from "@/services/appointmentService";
import clientService, { ClientBlockedError } from "@/services/clientService";
import availabilityService from "@/services/availabilityService";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ServiceProps = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
};

type TimeSlot = {
  start: string;
  end: string;
  available: boolean;
};

const Agendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { professional, service } = location.state || {};
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [isDateCollapsed, setIsDateCollapsed] = useState(false);
  const [isTimeCollapsed, setIsTimeCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleVoltar = () => {
    navigate(`/${professional?.profileUrl}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!location.state?.service || !location.state?.professional) {
      navigate("/");
    }
  }, [location.state, navigate]);

  // Buscar horários disponíveis quando a data é selecionada
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (date && professional && service) {
        const slots = await availabilityService.getAvailableSlots(
          professional.id,
          date,
          service.duration
        );
        setAvailableSlots(slots);
      }
    };

    fetchAvailableSlots();
  }, [date, professional, service]);

  const handleSubmit = async () => {
    if (!date || !selectedTime || !service || !professional) {
      toast({
        title: "Erro ao agendar",
        description: "Por favor, selecione uma data e horário para o agendamento.",
        variant: "destructive",
      });
      return;
    }

    // Mostrar formulário do cliente se ainda não preenchido
    if (!clientData.name || !clientData.email || !clientData.phone) {
      setShowClientForm(true);
      return;
    }

    try {
      setIsLoading(true);

      // Criar ou atualizar cliente
      const client = await clientService.createOrUpdate({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone
      });

      // Criar agendamento
      const appointmentData = {
        professionalId: professional.id,
        clientId: client.id,
        serviceId: service.id.toString(),
        date: format(date, 'yyyy-MM-dd'),
        time: selectedTime,
        price: service.price,
        serviceName: service.name,
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        duration: service.duration
      };

      await appointmentService.create(appointmentData);
      
      toast({
        title: "Agendamento realizado!",
        description: "Seu agendamento foi realizado com sucesso.",
      });
      
      console.log("Dados para navegação:", {
        professional,
        clientEmail: clientData.email
      });

      navigate("/agendamentos", { 
        state: { 
          professional: professional,
          clientEmail: clientData.email 
        },
        replace: true
      });
    } catch (error: any) {
      console.error('Erro ao agendar:', error);

      // Verifica se é um erro de cliente bloqueado
      if (error instanceof ClientBlockedError || error.message.includes("não pode fazer agendamentos")) {
        toast({
          title: "Agendamento não permitido",
          description: "Você não pode fazer agendamentos com este profissional no momento.",
          variant: "destructive",
        });
        navigate(`/${professional.profileUrl}`);
        return;
      }

      toast({
        title: "Erro ao agendar",
        description: "Ocorreu um erro ao realizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!service || !professional) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-primary mb-4">Serviço não encontrado</p>
        <Button onClick={() => navigate("/")} variant="outline">
          Voltar para a página inicial
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Button variant="ghost" className="mb-6" onClick={handleVoltar}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h1 className="text-2xl font-bold text-primary mb-2">Agendar {service.name}</h1>
          <p className="text-text mb-4">{service.description}</p>
          <div className="flex items-center justify-between text-sm text-text/60">
            <span>Duração: {service.duration} min</span>
            <span>Valor: R$ {service.price.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card de Escolha de Data */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => setIsDateCollapsed(!isDateCollapsed)}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-primary">Escolha a data</h2>
              </div>
              {isDateCollapsed ? <ChevronDown className="w-5 h-5 text-primary" /> : <ChevronUp className="w-5 h-5 text-primary" />}
            </div>

            {!isDateCollapsed ? (
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  setDate(selectedDate);
                  setSelectedTime(undefined);
                  setIsDateCollapsed(true);
                }}
                className="rounded-md border"
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  date.setHours(0, 0, 0, 0);
                  return date < today || date.getDay() === 0;
                }}
                locale={ptBR}
              />
            ) : (
              date && (
                <p className="text-center text-sm text-text/60">
                  📅 {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              )
            )}
          </div>

          {/* Card de Escolha de Horário */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => setIsTimeCollapsed(!isTimeCollapsed)}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-primary">Escolha o horário</h2>
              </div>
              {isTimeCollapsed ? <ChevronDown className="w-5 h-5 text-primary" /> : <ChevronUp className="w-5 h-5 text-primary" />}
            </div>

            {!isTimeCollapsed ? (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.start}
                    variant="outline"
                    className={cn(
                      "w-full",
                      !slot.available && "opacity-50 cursor-not-allowed",
                      selectedTime === slot.start && "bg-primary text-white hover:bg-primary/90"
                    )}
                    disabled={!slot.available}
                    onClick={() => {
                      setSelectedTime(slot.start);
                      setIsTimeCollapsed(true);
                    }}
                  >
                    {slot.start}
                  </Button>
                ))}
                {availableSlots.length === 0 && date && (
                  <p className="col-span-3 text-center text-sm text-text/60">
                    Nenhum horário disponível para esta data
                  </p>
                )}
              </div>
            ) : (
              selectedTime && (
                <p className="text-center text-sm text-text/60">
                  🕒 {selectedTime}
                </p>
              )
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!date || !selectedTime || isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </div>
      </div>

      {/* Modal de Dados do Cliente */}
      <Dialog open={showClientForm} onOpenChange={setShowClientForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dados para Agendamento</DialogTitle>
            <DialogDescription>
              Por favor, preencha seus dados para confirmar o agendamento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={clientData.name}
                onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={clientData.email}
                onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={clientData.phone}
                onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowClientForm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowClientForm(false);
                handleSubmit();
              }}
              disabled={!clientData.name || !clientData.email || !clientData.phone}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Agendar;
