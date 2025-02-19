import api from "@/lib/api";

export interface TimeSlot {
  start: string;
  end: string;
}

export interface WorkingHour {
  dayOfWeek: number;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileUrl: string;
  profession: string;
  bio: string;
  avatar?: string | null;
  coverImage?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  services: {
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
  }[];
  workingHours: WorkingHour[];
  createdAt: string;
}

const professionalService = {
  // Criar novo profissional
  create: async (data: any): Promise<Professional> => {
    // Preparar os dados do profissional
    const professionalData = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      profileUrl: data.profileUrl,
      profession: data.profession,
      bio: data.bio,
      avatar: null, // Por enquanto, sem suporte a upload de imagens
      coverImage: null,
      status: 'pending',
      address: data.address,
      services: data.services,
      workingHours: data.workingHours.map(day => ({
        ...day,
        timeSlots: day.isAvailable ? [
          { start: "09:00", end: "12:00" },
          { start: "14:00", end: "18:00" }
        ] : []
      })),
      createdAt: new Date().toISOString()
    };

    const response = await api.post<Professional>("/professionals", professionalData);
    return response.data;
  },

  // Listar todos os profissionais
  list: async (): Promise<Professional[]> => {
    const response = await api.get<Professional[]>("/professionals");
    return response.data;
  },

  // Buscar profissional por ID
  getById: async (id: string): Promise<Professional> => {
    const response = await api.get<Professional>(`/professionals/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Professional>): Promise<Professional> => {
    try {
      const response = await api.patch<Professional>(`/professionals/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      throw error;
    }
  },

  // Atualizar serviços do profissional
  updateServices: async (id: string, services: Professional['services']): Promise<Professional> => {
    // Primeiro buscar os dados existentes
    const current = await professionalService.getById(id);
    
    // Atualizar apenas os serviços mantendo todos os outros dados
    const updatedData = {
      ...current,
      services
    };

    const response = await api.put<Professional>(`/professionals/${id}`, updatedData);
    return response.data;
  },

  // Aprovar profissional
  approve: async (id: string): Promise<Professional> => {
    // Primeiro buscar os dados existentes
    const current = await professionalService.getById(id);
    
    // Atualizar apenas o status mantendo os outros dados
    const updatedData = {
      ...current,
      status: "approved"
    };

    const response = await api.put<Professional>(`/professionals/${id}`, updatedData);
    return response.data;
  },

  // Rejeitar profissional
  reject: async (id: string, reason: string): Promise<Professional> => {
    // Primeiro buscar os dados existentes
    const current = await professionalService.getById(id);
    
    // Atualizar apenas o status mantendo os outros dados
    const updatedData = {
      ...current,
      status: "rejected",
      rejectionReason: reason
    };

    const response = await api.put<Professional>(`/professionals/${id}`, updatedData);
    return response.data;
  },

  // Bloquear profissional
  block: async (id: string): Promise<Professional> => {
    // Primeiro buscar os dados existentes
    const current = await professionalService.getById(id);
    
    // Atualizar apenas o status mantendo os outros dados
    const updatedData = {
      ...current,
      status: "blocked"
    };

    const response = await api.put<Professional>(`/professionals/${id}`, updatedData);
    return response.data;
  },

  // Desbloquear profissional
  unblock: async (id: string): Promise<Professional> => {
    // Primeiro buscar os dados existentes
    const current = await professionalService.getById(id);
    
    // Atualizar apenas o status mantendo os outros dados
    const updatedData = {
      ...current,
      status: "approved"
    };

    const response = await api.put<Professional>(`/professionals/${id}`, updatedData);
    return response.data;
  },

  // Excluir profissional
  delete: async (id: string): Promise<void> => {
    await api.delete(`/professionals/${id}`);
  }
};

export default professionalService;
