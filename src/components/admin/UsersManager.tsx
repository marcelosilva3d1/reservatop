import { useState, useEffect } from "react";
import { Search, Ban, Eye, UserCog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import userService, { User } from "@/services/userService";
import { format } from "date-fns";

export function UsersManager() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Carregar usuários ao montar o componente
  useEffect(() => {
    loadUsers();
  }, []);

  // Função para carregar usuários
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.listAll();
      console.log('Usuários carregados:', data);
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Erro ao formatar data:', dateString, error);
      return 'Data inválida';
    }
  };

  // Função para buscar usuários
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setIsLoading(true);
        const data = await userService.search(searchTerm);
        setUsers(data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao buscar usuários.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      loadUsers();
    }
  };

  // Calcular estatísticas
  const stats = {
    total: users.length,
    clients: users.filter(u => u.role === 'user').length,
    admins: users.filter(u => u.role === 'admin').length,
    withAppointments: users.filter(u => u.appointmentsCount > 0).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Gerenciar Clientes e Usuários</h2>
          <p className="text-sm text-primary/70">
            Visualize todos os clientes e seus agendamentos com profissionais
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-medium">Total de Usuários</CardTitle>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-medium">Clientes</CardTitle>
            <div className="text-2xl font-bold">{stats.clients}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-medium">Com Agendamentos</CardTitle>
            <div className="text-2xl font-bold">{stats.withAppointments}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-medium">Administradores</CardTitle>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes e Usuários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os clientes que já agendaram serviços
          </CardDescription>
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary/40" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Último Agendamento</TableHead>
                  <TableHead className="text-center">Total de Agendamentos</TableHead>
                  <TableHead>Profissionais</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Administrador" : "Cliente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "success" : "destructive"}>
                        {user.status === "active" ? "Ativo" : "Bloqueado"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.registrationDate)}</TableCell>
                    <TableCell>{formatDate(user.lastLogin)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={user.appointmentsCount > 0 ? "default" : "secondary"}>
                        {user.appointmentsCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === 'user' && user.professionals && user.professionals.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.professionals.map(prof => (
                            <Badge key={prof.id} variant="outline">
                              {prof.name}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver detalhes"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.role === 'admin' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Bloquear/Desbloquear usuário"
                              onClick={() => handleStatusChange(
                                user.id,
                                user.status === "active" ? "blocked" : "active"
                              )}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Alterar função"
                              onClick={() => handleRoleChange(
                                user.id,
                                user.role === "admin" ? "user" : "admin"
                              )}
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do {selectedUser?.role === 'admin' ? 'Usuário' : 'Cliente'}</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre {selectedUser?.role === 'admin' ? 'o usuário' : 'o cliente'} selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Nome</h3>
                    <p>{selectedUser.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p>{selectedUser.email}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Tipo</h3>
                    <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"}>
                      {selectedUser.role === "admin" ? "Administrador" : "Cliente"}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold">Status</h3>
                    <Badge variant={selectedUser.status === "active" ? "success" : "destructive"}>
                      {selectedUser.status === "active" ? "Ativo" : "Bloqueado"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dados de Agendamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Data de Cadastro</h3>
                    <p>{formatDate(selectedUser.registrationDate)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Último Agendamento</h3>
                    <p>{formatDate(selectedUser.lastLogin)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Total de Agendamentos</h3>
                    <Badge variant={selectedUser.appointmentsCount > 0 ? "default" : "secondary"}>
                      {selectedUser.appointmentsCount || 0}
                    </Badge>
                  </div>
                  {selectedUser.role === 'user' && selectedUser.professionals && (
                    <div>
                      <h3 className="font-semibold">Profissionais</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedUser.professionals.map(prof => (
                          <Badge key={prof.id} variant="outline">
                            {prof.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
