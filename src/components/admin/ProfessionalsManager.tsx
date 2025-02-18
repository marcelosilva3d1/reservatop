import { useEffect, useState } from "react";
import { 
  Check, 
  X, 
  Search, 
  UserCheck, 
  UserX,
  Eye,
  BarChart2,
  Ban,
  Trash2,
  Users
} from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import professionalService from "@/services/professionalService";
import { useToast } from "@/components/ui/use-toast";

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected" | "blocked";
  createdAt: string;
  services: any[];
  bio: string;
  profession: string;
  clientCount?: number;
}

export function ProfessionalsManager() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setIsLoading(true);
      const data = await professionalService.list();
      
      // Carregar contagem de clientes para cada profissional
      const professionalWithClients = await Promise.all(
        data.map(async (prof) => {
          const clients = await fetch(`${import.meta.env.VITE_API_URL}/clients?professionals=${prof.id}`).then(res => res.json());
          return {
            ...prof,
            clientCount: clients.length
          };
        })
      );
      
      setProfessionals(professionalWithClients);
    } catch (error) {
      toast({
        title: "Erro ao carregar profissionais",
        description: "Não foi possível carregar a lista de profissionais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (professionalId: string, newStatus: Professional["status"]) => {
    try {
      const professional = professionals.find(p => p.id === professionalId);
      if (!professional) return;

      if (newStatus === "approved") {
        await professionalService.approve(professionalId);
      } else if (newStatus === "rejected") {
        await professionalService.reject(professionalId, "Perfil rejeitado pelo administrador");
      }
      
      await loadProfessionals();
      
      toast({
        title: "Status atualizado",
        description: `O profissional foi ${newStatus === "approved" ? "aprovado" : "rejeitado"} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do profissional.",
        variant: "destructive",
      });
    }
  };

  const handleBlockToggle = async (professionalId: string) => {
    try {
      const professional = professionals.find(p => p.id === professionalId);
      if (!professional) return;

      if (professional.status === "blocked") {
        await professionalService.unblock(professionalId);
        toast({
          title: "Profissional desbloqueado",
          description: "O profissional foi desbloqueado com sucesso.",
        });
      } else {
        await professionalService.block(professionalId);
        toast({
          title: "Profissional bloqueado",
          description: "O profissional foi bloqueado com sucesso.",
          variant: "destructive",
        });
      }
      
      await loadProfessionals();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do profissional.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (professionalId: string) => {
    try {
      await professionalService.delete(professionalId);
      await loadProfessionals();
      setIsDeleteConfirmOpen(false);
      
      toast({
        title: "Profissional excluído",
        description: "O profissional foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o profissional.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Gerenciar Profissionais</h2>
          <p className="text-sm text-primary/70">
            Aprove, rejeite ou bloqueie profissionais da plataforma
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary/40" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clientes</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals
                  .filter(professional =>
                    professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    professional.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((professional) => (
                    <TableRow key={professional.id}>
                      <TableCell>{professional.name}</TableCell>
                      <TableCell>{professional.email}</TableCell>
                      <TableCell>{professional.phone}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            professional.status === "approved" ? "success" :
                            professional.status === "pending" ? "warning" :
                            professional.status === "blocked" ? "destructive" :
                            "default"
                          }
                        >
                          {professional.status === "approved" ? "Aprovado" :
                           professional.status === "pending" ? "Pendente" :
                           professional.status === "blocked" ? "Bloqueado" :
                           "Rejeitado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-primary/60" />
                          <span>{professional.clientCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(professional.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedProfessional(professional);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {professional.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(professional.id, "approved")}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(professional.id, "rejected")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {professional.status !== "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleBlockToggle(professional.id)}
                                className={professional.status === "blocked" ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
                                title={professional.status === "blocked" ? "Desbloquear profissional" : "Bloquear profissional"}
                              >
                                {professional.status === "blocked" ? (
                                  <UserCheck className="h-4 w-4" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedProfessional(professional);
                                  setIsDeleteConfirmOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Profissional</DialogTitle>
            <DialogDescription>
              Informações detalhadas do profissional
            </DialogDescription>
          </DialogHeader>

          {selectedProfessional && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Nome:</span> {selectedProfessional.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {selectedProfessional.email}
                </div>
                <div>
                  <span className="font-medium">Telefone:</span> {selectedProfessional.phone}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <Badge 
                    variant={
                      selectedProfessional.status === "approved" ? "success" :
                      selectedProfessional.status === "pending" ? "warning" :
                      selectedProfessional.status === "blocked" ? "destructive" :
                      "default"
                    }
                  >
                    {selectedProfessional.status === "approved" ? "Aprovado" :
                     selectedProfessional.status === "pending" ? "Pendente" :
                     selectedProfessional.status === "blocked" ? "Bloqueado" :
                     "Rejeitado"}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Profissão:</span> {selectedProfessional.profession}
                </div>
                <div>
                  <span className="font-medium">Data de Cadastro:</span>{" "}
                  {new Date(selectedProfessional.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <span className="font-medium">Bio:</span>
                <p className="mt-1 text-sm">{selectedProfessional.bio}</p>
              </div>

              <div>
                <span className="font-medium">Serviços ({selectedProfessional.services.length}):</span>
                <div className="mt-2 space-y-2">
                  {selectedProfessional.services.map((service, index) => (
                    <div key={index} className="text-sm">
                      • {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedProfessional && handleDelete(selectedProfessional.id)}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
