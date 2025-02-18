import api from "@/lib/api";
import { addMonths, startOfMonth, endOfMonth, parseISO, format, differenceInMinutes } from "date-fns";

export interface ServiceMetrics {
  serviceName: string;
  count: number;
  totalRevenue: number;
  averageRating: number;
  totalDuration: number;
}

export interface ClientMetrics {
  totalClients: number;
  newClientsThisMonth: number;
  returningClients: number;
  averageServicesPerClient: number;
}

export interface TimeMetrics {
  totalHoursWorked: number;
  averageServiceDuration: number;
  busyDays: string[];
  quietDays: string[];
}

export interface PerformanceMetrics {
  completionRate: number;
  cancellationRate: number;
  averageRating: number;
  totalReviews: number;
}

export interface DashboardMetrics {
  serviceMetrics: ServiceMetrics[];
  clientMetrics: ClientMetrics;
  timeMetrics: TimeMetrics;
  performanceMetrics: PerformanceMetrics;
}

const metricsService = {
  // Buscar métricas dos serviços
  getServiceMetrics: async (professionalId: string): Promise<ServiceMetrics[]> => {
    try {
      const response = await api.get(`/appointments?professionalId=${professionalId}&_sort=date,time`);
      const appointments = response.data;
      
      // Agrupar por serviço
      const serviceStats = appointments.reduce((acc: any, app: any) => {
        if (!acc[app.serviceName]) {
          acc[app.serviceName] = {
            serviceName: app.serviceName,
            count: 0,
            totalRevenue: 0,
            totalRating: 0,
            ratingCount: 0,
            totalDuration: 0
          };
        }
        
        acc[app.serviceName].count += 1;
        acc[app.serviceName].totalRevenue += app.price;
        acc[app.serviceName].totalDuration += app.duration;
        
        if (app.rating) {
          acc[app.serviceName].totalRating += app.rating;
          acc[app.serviceName].ratingCount += 1;
        }
        
        return acc;
      }, {});

      return Object.values(serviceStats).map((service: any) => ({
        serviceName: service.serviceName,
        count: service.count,
        totalRevenue: service.totalRevenue,
        averageRating: service.ratingCount > 0 ? service.totalRating / service.ratingCount : 0,
        totalDuration: service.totalDuration
      }));
    } catch (error) {
      console.error('Erro ao buscar métricas dos serviços:', error);
      return [];
    }
  },

  // Buscar métricas dos clientes
  getClientMetrics: async (professionalId: string): Promise<ClientMetrics> => {
    try {
      const response = await api.get(`/appointments?professionalId=${professionalId}`);
      const appointments = response.data;
      
      const now = new Date();
      const startOfThisMonth = startOfMonth(now);
      
      const clientMap = new Map();
      let newClientsThisMonth = 0;
      
      appointments.forEach((app: any) => {
        const clientInfo = clientMap.get(app.clientId) || {
          firstAppointment: app.date,
          appointmentCount: 0
        };
        
        if (parseISO(app.date) >= startOfThisMonth && 
            parseISO(clientInfo.firstAppointment) >= startOfThisMonth) {
          newClientsThisMonth++;
        }
        
        clientInfo.appointmentCount++;
        clientMap.set(app.clientId, clientInfo);
      });

      const totalClients = clientMap.size;
      const returningClients = Array.from(clientMap.values())
        .filter(client => client.appointmentCount > 1).length;
      
      return {
        totalClients,
        newClientsThisMonth,
        returningClients,
        averageServicesPerClient: totalClients > 0 
          ? appointments.length / totalClients 
          : 0
      };
    } catch (error) {
      console.error('Erro ao buscar métricas dos clientes:', error);
      return {
        totalClients: 0,
        newClientsThisMonth: 0,
        returningClients: 0,
        averageServicesPerClient: 0
      };
    }
  },

  // Buscar métricas de tempo
  getTimeMetrics: async (professionalId: string): Promise<TimeMetrics> => {
    try {
      const response = await api.get(`/appointments?professionalId=${professionalId}`);
      const appointments = response.data;
      
      let totalMinutes = 0;
      const dayCountMap = new Map();
      
      appointments.forEach((app: any) => {
        totalMinutes += app.duration;
        
        const dayKey = app.date;
        dayCountMap.set(dayKey, (dayCountMap.get(dayKey) || 0) + 1);
      });
      
      const sortedDays = Array.from(dayCountMap.entries())
        .sort((a, b) => b[1] - a[1]);
      
      return {
        totalHoursWorked: Math.round(totalMinutes / 60),
        averageServiceDuration: appointments.length > 0 
          ? Math.round(totalMinutes / appointments.length) 
          : 0,
        busyDays: sortedDays.slice(0, 3).map(([day]) => day),
        quietDays: sortedDays.reverse().slice(0, 3).map(([day]) => day)
      };
    } catch (error) {
      console.error('Erro ao buscar métricas de tempo:', error);
      return {
        totalHoursWorked: 0,
        averageServiceDuration: 0,
        busyDays: [],
        quietDays: []
      };
    }
  },

  // Buscar métricas de performance
  getPerformanceMetrics: async (professionalId: string): Promise<PerformanceMetrics> => {
    try {
      const response = await api.get(`/appointments?professionalId=${professionalId}`);
      const appointments = response.data;
      
      const totalAppointments = appointments.length;
      const completedAppointments = appointments.filter((app: any) => 
        app.status === 'completed').length;
      const canceledAppointments = appointments.filter((app: any) => 
        app.status === 'canceled').length;
      
      const ratings = appointments
        .filter((app: any) => app.rating)
        .map((app: any) => app.rating);
      
      return {
        completionRate: totalAppointments > 0 
          ? (completedAppointments / totalAppointments) * 100 
          : 0,
        cancellationRate: totalAppointments > 0 
          ? (canceledAppointments / totalAppointments) * 100 
          : 0,
        averageRating: ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0,
        totalReviews: ratings.length
      };
    } catch (error) {
      console.error('Erro ao buscar métricas de performance:', error);
      return {
        completionRate: 0,
        cancellationRate: 0,
        averageRating: 0,
        totalReviews: 0
      };
    }
  },

  // Buscar todas as métricas
  getAllMetrics: async (professionalId: string): Promise<DashboardMetrics> => {
    try {
      const [
        serviceMetrics,
        clientMetrics,
        timeMetrics,
        performanceMetrics
      ] = await Promise.all([
        metricsService.getServiceMetrics(professionalId),
        metricsService.getClientMetrics(professionalId),
        metricsService.getTimeMetrics(professionalId),
        metricsService.getPerformanceMetrics(professionalId)
      ]);

      return {
        serviceMetrics,
        clientMetrics,
        timeMetrics,
        performanceMetrics
      };
    } catch (error) {
      console.error('Erro ao buscar todas as métricas:', error);
      throw error;
    }
  }
};

export default metricsService;
