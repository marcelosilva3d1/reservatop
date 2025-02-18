import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@ReservaTop:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Serviço de Usuários
export const userService = {
  // Criar novo usuário
  create: async (data: any) => {
    const response = await api.post("/users", data);
    return response.data;
  },

  // Listar todos os usuários
  list: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  // Atualizar usuário
  update: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
};

// Serviço de Autenticação
export const authService = {
  // Login
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Registro
  register: async (data: any) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
};

export default api;
