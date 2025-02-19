import { createContext, useContext, useState, useEffect } from "react";
import professionalService from "@/services/professionalService";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "professional";
}

interface AuthContextType {
  user: User | null;
  role: "admin" | "professional" | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ role: "admin" | "professional" }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "professional" | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadStoredUser = () => {
      const storedUser = localStorage.getItem("@ReservaTop:user");
      const storedRole = localStorage.getItem("@ReservaTop:role");

      if (storedUser && storedRole) {
        setUser(JSON.parse(storedUser));
        setRole(storedRole as "admin" | "professional");
        setIsAuthenticated(true);
      }

      setLoading(false);
    };

    loadStoredUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      let mockUser: User;
      let userRole: "admin" | "professional";
      
      if (email === "admin@reservatop.com" && password === "123456") {
        mockUser = {
          id: "1",
          name: "Admin",
          email: email,
          role: "admin"
        };
        userRole = "admin";
      } else {
        // Buscar profissionais da API
        const professionals = await professionalService.list();
        const professional = professionals.find(p => 
          p.email === email && 
          p.password === password && 
          p.status === "approved"
        );

        if (!professional) {
          throw new Error("Profissional não encontrado ou não aprovado");
        }

        mockUser = {
          id: professional.id,
          name: professional.name,
          email: professional.email,
          role: "professional"
        };
        userRole = "professional";
      }

      // Salvar no localStorage
      localStorage.setItem("@ReservaTop:user", JSON.stringify(mockUser));
      localStorage.setItem("@ReservaTop:role", userRole);

      // Atualizar o estado
      setUser(mockUser);
      setRole(userRole);
      setIsAuthenticated(true);

      return { role: userRole };
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("@ReservaTop:user");
    localStorage.removeItem("@ReservaTop:role");
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
