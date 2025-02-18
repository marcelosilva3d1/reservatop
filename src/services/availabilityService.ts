import api from "@/lib/api";
import { addMinutes, format, parse, isBefore, isAfter, areIntervalsOverlapping, startOfDay, isSameDay } from "date-fns";
import { Appointment } from "./appointmentService";

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

const availabilityService = {
  getAvailableSlots: async (
    professionalId: string,
    date: Date,
    serviceDuration: number
  ): Promise<TimeSlot[]> => {
    try {
      // Buscar o profissional e seus horários de trabalho
      const professional = await api.get(`/professionals/${professionalId}`);
      const workingHours = professional.data.workingHours;
      
      // Encontrar o horário de trabalho para o dia da semana
      const dayOfWeek = date.getDay();
      const daySchedule = workingHours.find((wh: any) => wh.dayOfWeek === dayOfWeek);
      
      if (!daySchedule || !daySchedule.isAvailable || !daySchedule.timeSlots?.length) {
        return [];
      }

      // Buscar agendamentos existentes para o dia
      const dateStr = format(date, "yyyy-MM-dd");
      const appointments = await api.get<Appointment[]>(
        `/appointments?professionalId=${professionalId}&date=${dateStr}`
      );

      // Filtrar apenas agendamentos ativos (não cancelados)
      const activeAppointments = appointments.data.filter(
        apt => apt.status !== 'cancelled'
      );

      // Criar slots para cada período configurado
      const slots: TimeSlot[] = [];
      const now = new Date();

      // Para cada período configurado no dia
      for (const period of daySchedule.timeSlots) {
        const startTime = parse(period.start, "HH:mm", date);
        const endTime = parse(period.end, "HH:mm", date);
        
        let currentSlot = startTime;
        while (isBefore(currentSlot, endTime)) {
          const slotEnd = addMinutes(currentSlot, serviceDuration);
          
          // Verificar se o slot está disponível
          const isAvailable = !activeAppointments.some(apt => {
            const aptStart = parse(apt.time, "HH:mm", date);
            const aptEnd = addMinutes(aptStart, apt.duration);
            
            return areIntervalsOverlapping(
              { start: currentSlot, end: slotEnd },
              { start: aptStart, end: aptEnd }
            );
          });

          // Para o dia atual, verificar se o horário já passou
          const isInPast = isSameDay(date, now) && isBefore(currentSlot, now);

          // Adicionar slot apenas se terminar antes do fim do período e não estiver no passado
          if (!isAfter(slotEnd, endTime) && !isInPast) {
            slots.push({
              start: format(currentSlot, "HH:mm"),
              end: format(slotEnd, "HH:mm"),
              available: isAvailable
            });
          }

          currentSlot = addMinutes(currentSlot, 30);
        }
      }

      return slots;
    } catch (error) {
      console.error("Erro ao buscar horários disponíveis:", error);
      return [];
    }
  }
};

export default availabilityService;
