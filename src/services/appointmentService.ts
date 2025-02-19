import api from "@/lib/api";
import { addMinutes, format, parse } from "date-fns";
import clientService, { ClientBlockedError } from "@/services/clientService";
import whatsappService from "@/services/whatsappService";

export interface Appointment {
  id: string;
  professionalId: string;
  clientId: string;
  serviceId: string;
  date: string;          // Formato: YYYY-MM-DD
  time: string;          // Formato: HH:mm
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  duration: number;      // Duração em minutos
  createdAt: string;
}

const appointmentService = {
  // Criar novo agendamento
  create: async (data: Omit<Appointment, "id" | "status" | "createdAt">): Promise<Appointment> => {
    try {
      // Verificar se o cliente está bloqueado
      const isBlocked = await clientService.isBlocked(data.clientEmail);
      console.log('Status de bloqueio:', { isBlocked, email: data.clientEmail });
      
      if (isBlocked) {
        throw new ClientBlockedError("Você não pode fazer agendamentos no momento pois está bloqueado.");
      }

      // Primeiro cria ou atualiza o cliente
      const clientData = {
        name: data.clientName,
        email: data.clientEmail,
        phone: data.clientPhone
      };
      
      const client = await clientService.createOrUpdate(clientData);
      
      // Atualiza o cliente para incluir o profissional na lista
      const response = await api.get(`/clients/${client.id}`);
      const currentClient = response.data;
      
      if (!currentClient.professionals.includes(data.professionalId)) {
        await api.patch(`/clients/${client.id}`, {
          professionals: [...currentClient.professionals, data.professionalId]
        });
      }

      // Atualiza as estatísticas de agendamento do cliente
      await clientService.updateAppointmentStats(client.id, data.date);

      const appointmentData = {
        ...data,
        clientId: client.id,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      const appointment = await api.post<Appointment>('/appointments', appointmentData).then(res => res.data);

      // Enviar mensagem de confirmação via WhatsApp
      try {
        await whatsappService.sendAppointmentConfirmation(
          appointment.clientPhone,
          {
            clientName: appointment.clientName,
            date: format(parse(appointment.date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy'),
            time: appointment.time,
            serviceName: appointment.serviceName
          }
        );
      } catch (error) {
        console.error('Erro ao enviar mensagem de confirmação:', error);
        // Não vamos impedir a criação do agendamento se a mensagem falhar
      }

      return appointment;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      if (error instanceof ClientBlockedError) {
        throw error; // Re-throw para manter o tipo do erro
      }
      throw new Error('Não foi possível criar o agendamento. Tente novamente.');
    }
  },

  // Listar todos os agendamentos de um profissional
  listByProfessional: async (professionalId: string): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(`/appointments?professionalId=${professionalId}`);
    return response.data;
  },

  // Listar agendamentos por cliente
  listByClient: async (clientId: string): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(`/appointments?clientId=${clientId}`);
    return response.data;
  },

  // Listar agendamentos por email ou telefone do cliente
  listByIdentifier: async (identifier: string, type: "email" | "phone"): Promise<Appointment[]> => {
    const response = await api.get("/appointments");
    // Filtra os agendamentos pelo email ou telefone do cliente e status diferente de cancelled
    return response.data.filter(appointment => 
      (type === "email" 
        ? appointment.clientEmail === identifier
        : appointment.clientPhone === identifier) &&
      appointment.status !== "cancelled"
    );
  },

  // Listar todos os agendamentos
  listAll: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>("/appointments");
    return response.data;
  },

  // Atualizar status do agendamento
  updateStatus: async (id: string, status: Appointment["status"]): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/appointments/${id}`, { status });
    return response.data;
  },

  // Cancelar agendamento
  cancel: async (id: string): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/appointments/${id}`, { status: 'cancelled' });
    const appointment = response.data;

    // Enviar mensagem de cancelamento via WhatsApp
    try {
      await whatsappService.sendAppointmentCancellation(
        appointment.clientPhone,
        {
          clientName: appointment.clientName,
          date: format(parse(appointment.date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy'),
          time: appointment.time,
          serviceName: appointment.serviceName
        }
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem de cancelamento:', error);
      // Não impede o cancelamento se a mensagem falhar
    }

    return appointment;
  },

  // Atualizar status automaticamente para completed após o horário
  checkAndUpdateCompletedStatus: async (appointments: Appointment[]): Promise<void> => {
    const now = new Date();
    const updatesPromises = appointments
      .filter(app => {
        if (app.status !== 'confirmed') return false;
        const appointmentEndTime = new Date(`${app.date}T${app.time}`);
        appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + app.duration);
        return now > appointmentEndTime;
      })
      .map(app => appointmentService.updateStatus(app.id, 'completed'));

    await Promise.all(updatesPromises);
  },

  // Verificar horários disponíveis
  getAvailableSlots: async (
    professionalId: string, 
    date: string, 
    serviceDuration: number
  ): Promise<string[]> => {
    // Buscar agendamentos do dia
    const response = await api.get<Appointment[]>(
      `/appointments?professionalId=${professionalId}&date=${date}`
    );
    
    // Filtrar apenas agendamentos ativos (não cancelados)
    const dayAppointments = response.data.filter(
      appointment => appointment.status !== 'cancelled'
    );

    // Buscar horários de trabalho do profissional
    const profResponse = await api.get(`/professionals/${professionalId}`);
    const workingHours = profResponse.data.workingHours;
    
    // Encontrar horário de trabalho do dia
    const dayOfWeek = new Date(date).getDay();
    const daySchedule = workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
    
    if (!daySchedule || !daySchedule.isAvailable) {
      return [];
    }

    // Gerar slots de tempo baseado no horário de trabalho
    const slots: string[] = [];
    let currentTime = parse(daySchedule.start, "HH:mm", new Date());
    const endTime = parse(daySchedule.end, "HH:mm", new Date());

    // Verificar se o horário já está ocupado
    const isTimeSlotTaken = (time: string) => {
      return dayAppointments.some(appointment => {
        const appointmentStart = new Date(`${appointment.date}T${appointment.time}-03:00`);
        const appointmentEnd = addMinutes(appointmentStart, appointment.duration);
        
        const slotStart = new Date(`${date}T${time}-03:00`);
        const slotEnd = addMinutes(slotStart, serviceDuration);

        return (
          (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
          (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
          (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
        );
      });
    };

    while (currentTime < endTime) {
      const timeStr = format(currentTime, "HH:mm");
      
      if (!isTimeSlotTaken(timeStr)) {
        slots.push(timeStr);
      }

      currentTime = addMinutes(currentTime, 30); // Incrementa de 30 em 30 minutos
    }

    return slots;
  }
};

export default appointmentService;
