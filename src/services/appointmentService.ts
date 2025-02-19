import { supabase } from "@/lib/supabase";
import whatsappService from "@/services/whatsappService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  cancellationReason?: string;
  serviceName: string;
  clientName: string;
  clientPhone: string;
  professionalName: string;
  price: number;
  duration: number;
}

const appointmentService = {
  create: async (data: Omit<Appointment, 'id' | 'status'>): Promise<Appointment> => {
    try {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          ...data,
          status: 'confirmed'
        })
        .select(`
          *,
          clients:clientId (name, phone),
          professionals:professionalId (name)
        `)
        .single();

      if (error) throw error;

      // Enviar confirmação por WhatsApp
      if (appointment) {
        try {
          await whatsappService.sendAppointmentConfirmation(
            appointment.clients.phone,
            {
              clientName: appointment.clients.name,
              date: format(new Date(appointment.date), "dd 'de' MMMM", { locale: ptBR }),
              time: appointment.time,
              serviceName: appointment.serviceName
            }
          );
        } catch (whatsappError) {
          console.error('Erro ao enviar confirmação WhatsApp:', whatsappError);
          // Não impede a criação do agendamento se o WhatsApp falhar
        }
      }

      return appointment;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  },

  list: async (): Promise<Appointment[]> => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients:clientId (name, phone),
        professionals:professionalId (name)
      `)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  getByProfessional: async (professionalId: string): Promise<Appointment[]> => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients:clientId (name, phone),
        professionals:professionalId (name)
      `)
      .eq('professionalId', professionalId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  getByClient: async (clientId: string): Promise<Appointment[]> => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients:clientId (name, phone),
        professionals:professionalId (name)
      `)
      .eq('clientId', clientId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  cancel: async (id: string, reason: string): Promise<Appointment> => {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellationReason: reason
      })
      .eq('id', id)
      .select(`
        *,
        clients:clientId (name, phone),
        professionals:professionalId (name)
      `)
      .single();

    if (error) throw error;

    // Enviar notificação de cancelamento por WhatsApp
    if (appointment) {
      try {
        await whatsappService.sendAppointmentCancellation(
          appointment.clients.phone,
          {
            clientName: appointment.clients.name,
            date: format(new Date(appointment.date), "dd 'de' MMMM", { locale: ptBR }),
            time: appointment.time,
            serviceName: appointment.serviceName
          }
        );
      } catch (whatsappError) {
        console.error('Erro ao enviar notificação de cancelamento:', whatsappError);
      }
    }

    return appointment;
  },

  complete: async (id: string): Promise<Appointment> => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default appointmentService;
