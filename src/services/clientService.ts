import api from "@/lib/api";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  professionals: string[];  // IDs dos profissionais com quem já agendou
  totalAppointments: number;
  lastAppointment?: string;
  createdAt: string;
  status: 'active' | 'blocked';
  blockedBy?: string[];  // IDs dos profissionais que bloquearam este cliente
  userId?: string;
}

export class ClientBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientBlockedError';
  }
}

const clientService = {
  // Buscar cliente por email ou telefone
  findClient: async (identifier: { email?: string; phone?: string }): Promise<Client | null> => {
    console.log('Buscando cliente:', identifier);
    
    try {
      // Busca por email
      if (identifier.email) {
        const emailResponse = await api.get<Client[]>('/clients', {
          params: { email: identifier.email }
        });
        
        if (emailResponse.data.length > 0) {
          console.log('Cliente encontrado por email:', emailResponse.data[0]);
          return emailResponse.data[0];
        }
      }

      // Se não encontrou por email e tem telefone, busca por telefone
      if (identifier.phone) {
        const phoneResponse = await api.get<Client[]>('/clients', {
          params: { phone: identifier.phone }
        });
        
        if (phoneResponse.data.length > 0) {
          console.log('Cliente encontrado por telefone:', phoneResponse.data[0]);
          return phoneResponse.data[0];
        }
      }

      console.log('Cliente não encontrado');
      return null;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  },

  // Verificar se cliente está bloqueado
  isBlocked: async (clientEmail: string): Promise<boolean> => {
    try {
      const response = await api.get<Client[]>('/clients', {
        params: { email: clientEmail }
      });
      
      if (response.data.length === 0) return false;
      
      return response.data[0].status === 'blocked';
    } catch (error) {
      console.error('Erro ao verificar status do cliente:', error);
      return false;
    }
  },

  // Criar ou atualizar cliente
  createOrUpdate: async (data: Omit<Client, "id" | "professionals" | "totalAppointments" | "lastAppointment" | "createdAt" | "status" | "blockedBy">): Promise<Client> => {
    try {
      // Primeiro verifica se o cliente já existe
      const existing = await clientService.findClient({
        email: data.email,
        phone: data.phone
      });
      
      if (existing) {
        // Cliente existe, atualiza dados se necessário
        if (
          existing.name !== data.name ||
          existing.phone !== data.phone ||
          existing.email !== data.email
        ) {
          const response = await api.patch<Client>(`/clients/${existing.id}`, data);
          return response.data;
        }
        return existing;
      }

      // Cliente não existe, cria novo
      const clientData = {
        ...data,
        professionals: [],
        totalAppointments: 0,
        createdAt: new Date().toISOString(),
        status: 'active',
        blockedBy: []
      };

      const response = await api.post<Client>("/clients", clientData);
      const newClient = response.data;

      // Cria um registro de usuário para o novo cliente
      try {
        // Verifica se já existe um usuário com este email
        const existingUsers = await api.get(`/users?email=${data.email}`);
        if (existingUsers.data.length === 0) {
          // Busca todos os usuários para determinar o próximo ID
          const usersResponse = await api.get("/users");
          const users = usersResponse.data || [];
          const nextUserId = String(users.length + 1);

          // Cria o usuário
          await api.post("/users", {
            id: nextUserId,
            name: data.name,
            email: data.email,
            role: "user",
            status: "active",
            registrationDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            appointmentsCount: 0
          });

          // Atualiza o cliente com o ID do usuário
          await api.patch(`/clients/${newClient.id}`, {
            userId: nextUserId
          });
        }
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
        // Não impede a criação do cliente se houver erro ao criar usuário
      }

      return newClient;
    } catch (error) {
      console.error('Erro ao criar/atualizar cliente:', error);
      throw error;
    }
  },

  // Listar clientes de um profissional
  listByProfessional: async (professionalId: string): Promise<Client[]> => {
    try {
      const response = await api.get<Client[]>('/clients', {
        params: { professionals_like: professionalId }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      return [];
    }
  },

  // Adicionar profissional à lista de um cliente
  addProfessional: async (clientId: string, professionalId: string): Promise<Client> => {
    try {
      const client = await api.get<Client>(`/clients/${clientId}`);
      if (!client.data.professionals.includes(professionalId)) {
        const response = await api.patch<Client>(`/clients/${clientId}`, {
          professionals: [...client.data.professionals, professionalId]
        });
        return response.data;
      }
      return client.data;
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error);
      throw error;
    }
  },

  // Atualizar contagem de agendamentos e último agendamento
  updateAppointmentStats: async (clientId: string, appointmentDate: string): Promise<Client> => {
    try {
      const client = await api.get<Client>(`/clients/${clientId}`);
      
      // Atualiza estatísticas do cliente
      const response = await api.patch<Client>(`/clients/${clientId}`, {
        totalAppointments: client.data.totalAppointments + 1,
        lastAppointment: appointmentDate
      });

      // Atualiza contagem de agendamentos do usuário
      try {
        // Busca o usuário pelo email do cliente
        const usersResponse = await api.get(`/users?email=${client.data.email}`);
        if (usersResponse.data.length > 0) {
          const user = usersResponse.data[0];
          await api.patch(`/users/${user.id}`, {
            appointmentsCount: client.data.totalAppointments + 1,
            lastLogin: new Date().toISOString() // Atualiza último acesso
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar contagem de agendamentos do usuário:', error);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      throw error;
    }
  },

  // Alternar bloqueio do cliente
  toggleBlock: async (clientId: string): Promise<Client> => {
    try {
      const client = await api.get<Client>(`/clients/${clientId}`);
      const currentStatus = client.data.status;
      
      const response = await api.patch<Client>(`/clients/${clientId}`, {
        status: currentStatus === 'blocked' ? 'active' : 'blocked'
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao alternar bloqueio:', error);
      throw error;
    }
  }
};

export default clientService;
