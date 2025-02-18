import api from "@/lib/api";
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore, isAfter, parseISO, format } from "date-fns";

export interface FinancialRecord {
  id: string;
  date: string;
  appointmentId: string;
  clientName: string;
  serviceName: string;
  amount: number;
  status: 'completed' | 'refunded';
  type: 'income' | 'expense';
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  compareLastPeriod: number;
  expectedDailyIncome: number;
  topServices: {
    name: string;
    total: number;
    count: number;
  }[];
}

const financialService = {
  // Buscar registros financeiros por período
  getRecords: async (professionalId: string, startDate: Date, endDate: Date): Promise<FinancialRecord[]> => {
    try {
      // Buscar todos os agendamentos do profissional
      const response = await api.get(`/appointments?professionalId=${professionalId}&_sort=date,time`);
      const appointments = response.data;

      // Filtrar e transformar agendamentos em registros financeiros
      const records: FinancialRecord[] = appointments
        .filter((app: any) => {
          const appointmentDate = parseISO(`${app.date}T${app.time}`);
          return (
            app.status === 'completed' && // Apenas agendamentos completados
            isAfter(appointmentDate, startOfDay(startDate)) &&
            isBefore(appointmentDate, endOfDay(endDate))
          );
        })
        .map((app: any) => ({
          id: `fin_${app.id}`,
          date: app.date,
          appointmentId: app.id,
          clientName: app.clientName,
          serviceName: app.serviceName,
          amount: app.price,
          status: 'completed',
          type: 'income'
        }));

      return records;
    } catch (error) {
      console.error('Erro ao buscar registros financeiros:', error);
      throw error;
    }
  },

  // Calcular receita prevista para o período
  getExpectedIncome: async (professionalId: string, startDate: Date, endDate: Date): Promise<number> => {
    try {
      const now = new Date();
      
      // Buscar agendamentos futuros (confirmados ou pendentes)
      const response = await api.get(
        `/appointments?professionalId=${professionalId}`
      );
      const appointments = response.data;

      // Filtrar apenas agendamentos futuros dentro do período
      const futureAppointments = appointments.filter((app: any) => {
        const appointmentDate = parseISO(`${app.date}T${app.time}`);
        return (app.status === 'confirmed' || app.status === 'pending') && // Incluir confirmados e pendentes
               isAfter(appointmentDate, now) && // Apenas agendamentos futuros
               isAfter(appointmentDate, startOfDay(startDate)) && // Dentro do período selecionado
               isBefore(appointmentDate, endOfDay(endDate));
      });

      // Somar os valores dos agendamentos
      const expectedIncome = futureAppointments.reduce((total: number, app: any) => total + app.price, 0);
      
      return expectedIncome;
    } catch (error) {
      console.error('Erro ao calcular receita prevista:', error);
      return 0;
    }
  },

  // Calcular métricas financeiras
  getMetrics: async (professionalId: string, period: 'day' | 'week' | 'month'): Promise<FinancialMetrics> => {
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      let previousStartDate: Date;
      let previousEndDate: Date;

      // Definir período atual
      switch (period) {
        case 'day':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          previousStartDate = startOfDay(addDays(now, -1));
          previousEndDate = endOfDay(addDays(now, -1));
          break;
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 0 });
          endDate = endOfWeek(now, { weekStartsOn: 0 });
          previousStartDate = startOfWeek(addDays(now, -7), { weekStartsOn: 0 });
          previousEndDate = endOfWeek(addDays(now, -7), { weekStartsOn: 0 });
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          previousStartDate = startOfMonth(addDays(now, -30));
          previousEndDate = endOfMonth(addDays(now, -30));
          break;
      }

      // Buscar registros do período atual e anterior
      const [currentRecords, previousRecords, expectedIncome] = await Promise.all([
        financialService.getRecords(professionalId, startDate, endDate),
        financialService.getRecords(professionalId, previousStartDate, previousEndDate),
        financialService.getExpectedIncome(professionalId, startDate, endDate)
      ]);

      // Calcular totais
      const currentTotal = currentRecords.reduce((sum, record) => sum + record.amount, 0);
      const previousTotal = previousRecords.reduce((sum, record) => sum + record.amount, 0);

      // Calcular variação percentual
      const percentChange = previousTotal === 0 
        ? 100 
        : ((currentTotal - previousTotal) / previousTotal) * 100;

      // Calcular serviços mais lucrativos
      const serviceStats = currentRecords.reduce((acc: any, record) => {
        if (!acc[record.serviceName]) {
          acc[record.serviceName] = { total: 0, count: 0 };
        }
        acc[record.serviceName].total += record.amount;
        acc[record.serviceName].count += 1;
        return acc;
      }, {});

      const topServices = Object.entries(serviceStats)
        .map(([name, stats]: [string, any]) => ({
          name,
          total: stats.total,
          count: stats.count
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      return {
        totalIncome: currentTotal,
        totalExpenses: 0,
        netIncome: currentTotal,
        compareLastPeriod: percentChange,
        expectedDailyIncome: expectedIncome,
        topServices
      };
    } catch (error) {
      console.error('Erro ao calcular métricas financeiras:', error);
      throw error;
    }
  }
};

export default financialService;
