export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    accent: string;
  };
}

export interface CoverImage {
  id: string;
  name: string;
  category: 'salao' | 'produtos' | 'beleza' | 'barbearia';
  url: string;
}

export interface ProfileCustomization {
  theme: {
    id: string;
  };
  cover: {
    type: 'preset' | 'custom';
    id?: string;
    url?: string;
  };
  profileImage: {
    type: 'upload';
    url?: string;
  }
}

export const presetThemes: Theme[] = [
  {
    id: 'padrao',
    name: 'Padrão',
    colors: {
      primary: '#1F3A52',
      accent: '#3BB273'
    }
  },
  {
    id: 'elegante',
    name: 'Elegante',
    colors: {
      primary: '#2C3E50',
      accent: '#D4AF37'
    }
  },
  {
    id: 'moderno',
    name: 'Moderno',
    colors: {
      primary: '#FF4B6E',
      accent: '#00D4FF'
    }
  },
  {
    id: 'natural',
    name: 'Natural',
    colors: {
      primary: '#4A6741',
      accent: '#94B49F'
    }
  },
  {
    id: 'glamour',
    name: 'Glamour',
    colors: {
      primary: '#8B2635',
      accent: '#D4AF37'
    }
  }
];

export const presetCovers: CoverImage[] = [
  // Salão Feminino
  {
    id: 'salon1',
    name: 'Salão Moderno',
    category: 'salao',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200'
  },
  {
    id: 'salon2',
    name: 'Salão Elegante',
    category: 'salao',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200'
  },
  {
    id: 'salon3',
    name: 'Ambiente Sofisticado',
    category: 'salao',
    url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1200'
  },
  // Barbearia
  {
    id: 'barber1',
    name: 'Barbearia Clássica',
    category: 'barbearia',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200'
  },
  {
    id: 'barber2',
    name: 'Corte e Barba',
    category: 'barbearia',
    url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200'
  },
  {
    id: 'barber3',
    name: 'Barbearia Moderna',
    category: 'barbearia',
    url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200'
  },
  // Sobrancelhas e Maquiagem
  {
    id: 'beauty1',
    name: 'Design de Sobrancelhas',
    category: 'beleza',
    url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1200'
  },
  {
    id: 'beauty2',
    name: 'Maquiagem Profissional',
    category: 'beleza',
    url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200'
  },
  {
    id: 'beauty3',
    name: 'Arte da Beleza',
    category: 'beleza',
    url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200'
  },
  // Ambiente e Produtos
  {
    id: 'ambiente1',
    name: 'Ambiente Acolhedor',
    category: 'salao',
    url: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1200'
  },
  {
    id: 'produtos1',
    name: 'Produtos Profissionais',
    category: 'produtos',
    url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200'
  },
  {
    id: 'produtos2',
    name: 'Ferramentas do Ofício',
    category: 'produtos',
    url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200'
  }
];
