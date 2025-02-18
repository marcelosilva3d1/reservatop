// Tipos
export interface Appointment {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
}

export interface Client {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  lastVisit: string;
  totalVisits: number;
}

export interface FinancialRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

// Dados mockados
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'João Silva',
    service: 'Corte de Cabelo',
    date: '2024-02-14',
    time: '09:00',
    status: 'confirmed',
    price: 50
  },
  {
    id: '2',
    clientName: 'Maria Oliveira',
    service: 'Barba',
    date: '2024-02-14',
    time: '10:00',
    status: 'pending',
    price: 35
  },
  {
    id: '3',
    clientName: 'Carlos Santos',
    service: 'Corte e Barba',
    date: '2024-02-14',
    time: '11:00',
    status: 'completed',
    price: 75
  }
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    avatar: '/placeholder.svg',
    phone: '(11) 99999-9999',
    email: 'joao@email.com',
    lastVisit: '2024-02-14',
    totalVisits: 5
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    avatar: '/placeholder.svg',
    phone: '(11) 98888-8888',
    email: 'maria@email.com',
    lastVisit: '2024-02-10',
    totalVisits: 3
  },
  {
    id: '3',
    name: 'Carlos Santos',
    avatar: '/placeholder.svg',
    phone: '(11) 97777-7777',
    email: 'carlos@email.com',
    lastVisit: '2024-02-05',
    totalVisits: 8
  }
];

export const mockFinancialRecords: FinancialRecord[] = [
  {
    id: '1',
    date: '2024-02-14',
    description: 'Corte de Cabelo - João Silva',
    amount: 50,
    type: 'income'
  },
  {
    id: '2',
    date: '2024-02-14',
    description: 'Barba - Maria Oliveira',
    amount: 35,
    type: 'income'
  },
  {
    id: '3',
    date: '2024-02-14',
    description: 'Produtos de Limpeza',
    amount: 100,
    type: 'expense'
  }
];

// Métricas
export const mockMetrics = {
  todayAppointments: 5,
  weeklyAppointments: 25,
  monthlyRevenue: 2500,
  averageRating: 4.8,
  popularServices: [
    { name: 'Corte de Cabelo', count: 45 },
    { name: 'Barba', count: 30 },
    { name: 'Corte e Barba', count: 25 }
  ],
  revenueByDay: [
    { date: '2024-02-08', amount: 450 },
    { date: '2024-02-09', amount: 380 },
    { date: '2024-02-10', amount: 520 },
    { date: '2024-02-11', amount: 400 },
    { date: '2024-02-12', amount: 480 },
    { date: '2024-02-13', amount: 550 },
    { date: '2024-02-14', amount: 500 }
  ]
};
