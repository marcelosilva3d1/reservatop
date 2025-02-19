import { supabase, uploadImage, getImageUrl } from "@/lib/supabase";

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
  create: async (data: any): Promise<Professional> => {
    const { avatar, coverImage, ...professionalData } = data;
    
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'professional'
        }
      }
    });
    if (authError) throw authError;

    // Upload das imagens
    let avatarUrl = null;
    let coverImageUrl = null;

    if (avatar) {
      const path = `professionals/${authData.user.id}/avatar`;
      await uploadImage('images', path, avatar);
      avatarUrl = getImageUrl('images', path);
    }

    if (coverImage) {
      const path = `professionals/${authData.user.id}/cover`;
      await uploadImage('images', path, coverImage);
      coverImageUrl = getImageUrl('images', path);
    }

    // Criar perfil do profissional
    const { data: profile, error: profileError } = await supabase
      .from('professionals')
      .insert({
        ...professionalData,
        id: authData.user.id,
        avatar: avatarUrl,
        coverImage: coverImageUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (profileError) throw profileError;
    return profile;
  },

  list: async (): Promise<Professional[]> => {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  getById: async (id: string): Promise<Professional> => {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, data: Partial<Professional>): Promise<Professional> => {
    const { avatar, coverImage, ...updateData } = data;

    if (avatar) {
      const path = `professionals/${id}/avatar`;
      await uploadImage('images', path, avatar as File);
      updateData.avatar = getImageUrl('images', path);
    }

    if (coverImage) {
      const path = `professionals/${id}/cover`;
      await uploadImage('images', path, coverImage as File);
      updateData.coverImage = getImageUrl('images', path);
    }

    const { data: updated, error } = await supabase
      .from('professionals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  updateServices: async (id: string, services: Professional['services']): Promise<Professional> => {
    const { data, error } = await supabase
      .from('professionals')
      .update({ services })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  approve: async (id: string): Promise<Professional> => {
    const { data, error } = await supabase
      .from('professionals')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  reject: async (id: string, reason: string): Promise<Professional> => {
    const { data, error } = await supabase
      .from('professionals')
      .update({ 
        status: 'rejected',
        rejectionReason: reason 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  block: async (id: string): Promise<Professional> => {
    const { data, error } = await supabase
      .from('professionals')
      .update({ status: 'blocked' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  unblock: async (id: string): Promise<Professional> => {
    const { data, error } = await supabase
      .from('professionals')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export default professionalService;
