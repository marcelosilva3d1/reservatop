import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import appointmentService from "@/services/appointmentService";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formatDate = (dateString: string) => {
  try {
    // Primeiro, limpa a string da data removendo caracteres indesejados
    const cleanDate = dateString.trim().replace(/[^\d-]/g, '');
    
    // Se a data estiver no formato dd-MM-yyyy, converte para yyyy-MM-dd
    const parts = cleanDate.split('-');
    const normalizedDate = parts.length === 3 && parts[0].length === 2
      ? `${parts[2]}-${parts[1]}-${parts[0]}`
      : cleanDate;

    // Cria o objeto Date com timezone de Brasília
    const date = new Date(`${normalizedDate}T00:00:00-03:00`);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      console.error('Data inválida:', dateString);
      return 'Data inválida';
    }
    
    return format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

const MeusAgendamentos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const initialClientEmail = state.clientEmail;
  const professional = state.professional;
  
  const [isLoading, setIsLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [identifier, setIdentifier] = useState(initialClientEmail || "");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(() => {
    console.log("State recebido:", state);
    console.log("Email inicial:", initialClientEmail);
    
    if (!initialClientEmail) {
      console.log("Nenhum email recebido, mostrando formulário");
      setShowClientForm(true);
      setIsLoading(false);
    } else {
      console.log("Email recebido, carregando agendamentos");
      loadAgendamentos(initialClientEmail, "email");
    }
  }, [initialClientEmail]);

  const loadAgendamentos = async (value: string, type: "email" | "phone") => {
    try {
      setIsLoading(true);
      const data = await appointmentService.listByIdentifier(value, type);
      setAgendamentos(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus agendamentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast({
        title: "Erro",
        description: "Por favor, informe seu email ou telefone.",
        variant: "destructive",
      });
      return;
    }

    // Verifica se é email ou telefone baseado no formato
    const isEmail = identifier.includes("@");
    setShowClientForm(false);
    loadAgendamentos(identifier, isEmail ? "email" : "phone");
  };

  const handleCancelClick = (id: string) => {
    setSelectedAppointmentId(id);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedAppointmentId) {
      await cancelarAgendamento(selectedAppointmentId);
      setShowCancelDialog(false);
    }
  };

  const cancelarAgendamento = async (id: string) => {
    try {
      await appointmentService.cancel(id);
      setAgendamentos(prev => prev.filter(agendamento => agendamento.id !== id));
      toast({
        title: "Sucesso",
        description: "Agendamento cancelado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(`/${professional?.profileUrl}`)}> 
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <h1 className="text-2xl font-bold text-primary mb-4">Meus Agendamentos</h1>

      <Dialog open={showClientForm} onOpenChange={setShowClientForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Identificação</DialogTitle>
            <DialogDescription>
              Por favor, informe seu email ou telefone para visualizar seus agendamentos
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="identifier">Email ou Telefone</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="seu@email.com ou (00) 00000-0000"
              />
            </div>
            <Button type="submit" className="w-full">
              Buscar Agendamentos
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : agendamentos.length === 0 && !showClientForm ? (
        <p className="text-center text-text/60">Nenhum agendamento encontrado.</p>
      ) : !showClientForm && (
        <div className="grid gap-4">
          {agendamentos.map((agendamento) => (
            <div key={agendamento.id} className="bg-white rounded-xl p-6 shadow-md flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-primary">{agendamento.serviceName}</h2>
                <p className="text-text text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatDate(agendamento.date)}
                </p>
                <p className="text-text text-sm flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-primary" />
                  {agendamento.time}
                </p>
              </div>
              <button
                onClick={() => handleCancelClick(agendamento.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Cancelamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Não, manter
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Sim, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeusAgendamentos;
