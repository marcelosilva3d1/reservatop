import api from "@/lib/axios";

export interface Appointment {
  id: number;
  professionalId: number | string;
  clientId: number;
  serviceId: string;
  date: string;
  time: string;
  price: number;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  duration: number;
  status: string;
  createdAt: string;
}

interface Client {
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
}

const dashboardService = {
  getAppointments: async (professionalId: number | string): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(`/appointments?professionalId=${professionalId}`);
    return response.data;
  },

  getClients: async (professionalId: number | string): Promise<Client[]> => {
    const appointments = await dashboardService.getAppointments(professionalId);
    const uniqueClients = appointments.reduce((acc, curr) => {
      if (!acc.find(client => client.email === curr.clientEmail)) {
        acc.push({
          name: curr.clientName,
          email: curr.clientEmail,
          phone: curr.clientPhone,
          totalAppointments: 1
        });
      } else {
        const client = acc.find(client => client.email === curr.clientEmail);
        if (client) {
          client.totalAppointments++;
        }
      }
      return acc;
    }, [] as Client[]);
    return uniqueClients;
  }
};

export default dashboardService;
