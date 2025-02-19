import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { Header } from "@/components/Header";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import Agendar from "./pages/Agendar";
import NotFound from "./pages/NotFound";
import Agendamentos from "./pages/Agendamentos";
import { Avaliacoes } from "./pages/Avaliacoes";
import ProfissionalDashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ThemeProvider } from "@/contexts/ThemeContext";
import EnvTest from './components/EnvTest';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <div className="min-h-screen">
              <Header />
              <main className="container mx-auto py-6 px-4">
                <Routes>
                  <Route path="/" element={<ProfessionalProfile />} />
                  <Route path="/agendar" element={<Agendar />} />
                  <Route path="/agendamentos" element={<Agendamentos />} />
                  <Route path="/avaliacoes" element={<Avaliacoes />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/:profileUrl" element={<ProfessionalProfile />} />
                  <Route
                    path="/dashboard/*"
                    element={
                      <PrivateRoute>
                        <ProfissionalDashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={
                      <PrivateRoute requireAdmin>
                        <AdminDashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </ThemeProvider>
        <EnvTest />
        <Toaster />
        <Sonner />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
