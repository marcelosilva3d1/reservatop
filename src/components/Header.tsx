import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="font-bold text-xl">
          Reserva Top
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {role === "admin" && (
                <Link to="/admin">
                  <Button variant="outline">Dashboard Admin</Button>
                </Link>
              )}
              {role === "professional" && (
                <Link to="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              )}
              <Button variant="ghost" onClick={logout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button>Cadastrar</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
