import api from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "blocked";
  registrationDate: string;
  lastLogin: string;
  appointmentsCount: number;
  professionals?: {
    id: string;
    name: string;
  }[];
}

const userService = {
  // Listar todos os usuários (admin + clientes)
  listAll: async (): Promise<User[]> => {
    // Busca o admin
    const adminResponse = await api.get<User[]>('/users');
    const adminUsers = adminResponse.data;

    // Busca todos os clientes
    const clientsResponse = await api.get('/clients');
    const clients = clientsResponse.data;

    // Busca todos os profissionais
    const professionalsResponse = await api.get('/professionals');
    const professionals = professionalsResponse.data;

    // Converte clientes para o formato de usuários
    const clientUsers: User[] = await Promise.all(clients.map(async client => {
      // Encontra os profissionais deste cliente
      const clientProfessionals = professionals
        .filter(p => client.professionals.includes(p.id))
        .map(p => ({
          id: p.id,
          name: p.name
        }));

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        role: "user",
        status: "active",
        registrationDate: client.createdAt,
        lastLogin: client.lastAppointment || client.createdAt,
        appointmentsCount: client.totalAppointments,
        professionals: clientProfessionals
      };
    }));

    // Combina admin + clientes
    return [...adminUsers, ...clientUsers];
  },

  // Buscar usuário por ID
  getById: async (id: string): Promise<User> => {
    // Tenta buscar como admin primeiro
    const adminResponse = await api.get<User[]>(`/users?id=${id}`);
    if (adminResponse.data.length > 0) {
      return adminResponse.data[0];
    }

    // Se não encontrar, busca como cliente
    const clientResponse = await api.get(`/clients/${id}`);
    const client = clientResponse.data;

    // Busca os profissionais do cliente
    const professionalsResponse = await api.get('/professionals');
    const professionals = professionalsResponse.data;
    const clientProfessionals = professionals
      .filter(p => client.professionals.includes(p.id))
      .map(p => ({
        id: p.id,
        name: p.name
      }));

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      role: "user",
      status: "active",
      registrationDate: client.createdAt,
      lastLogin: client.lastAppointment || client.createdAt,
      appointmentsCount: client.totalAppointments,
      professionals: clientProfessionals
    };
  },

  // Atualizar status do usuário (bloquear/desbloquear)
  updateStatus: async (id: string, status: User["status"]): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, { status });
    return response.data;
  },

  // Atualizar função do usuário (admin/user)
  updateRole: async (id: string, role: User["role"]): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, { role });
    return response.data;
  },

  // Buscar usuários por termo de busca
  search: async (term: string): Promise<User[]> => {
    // Busca admins que correspondem ao termo
    const adminResponse = await api.get<User[]>(`/users?q=${term}`);
    const adminUsers = adminResponse.data;

    // Busca clientes que correspondem ao termo
    const clientsResponse = await api.get(`/clients?q=${term}`);
    const clients = clientsResponse.data;

    // Busca todos os profissionais
    const professionalsResponse = await api.get('/professionals');
    const professionals = professionalsResponse.data;

    // Converte clientes para o formato de usuários
    const clientUsers: User[] = await Promise.all(clients.map(async client => {
      // Encontra os profissionais deste cliente
      const clientProfessionals = professionals
        .filter(p => client.professionals.includes(p.id))
        .map(p => ({
          id: p.id,
          name: p.name
        }));

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        role: "user",
        status: "active",
        registrationDate: client.createdAt,
        lastLogin: client.lastAppointment || client.createdAt,
        appointmentsCount: client.totalAppointments,
        professionals: clientProfessionals
      };
    }));

    // Combina resultados
    return [...adminUsers, ...clientUsers];
  }
};

export default userService;
