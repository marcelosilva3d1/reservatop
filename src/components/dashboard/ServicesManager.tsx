import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { serviceCategories, durationOptions } from "@/data/serviceCategories";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

export function ServicesManager() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveService = (service: Service) => {
    // TODO: Implementar chamada à API
    if (editingService) {
      // Editando serviço existente
      setServices(services.map(s => s.id === service.id ? service : s));
      toast({
        title: "Serviço atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      // Novo serviço
      setServices([...services, { ...service, id: Date.now().toString() }]);
      toast({
        title: "Serviço adicionado",
        description: "O novo serviço foi adicionado com sucesso.",
      });
    }
    setIsDialogOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = (serviceId: string) => {
    // TODO: Implementar chamada à API
    setServices(services.filter(s => s.id !== serviceId));
    toast({
      title: "Serviço removido",
      description: "O serviço foi removido com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Serviços</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingService(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </DialogTitle>
              <DialogDescription>
                Preencha os detalhes do serviço abaixo.
              </DialogDescription>
            </DialogHeader>
            <ServiceForm
              initialService={editingService}
              onSave={handleSaveService}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingService(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <p className="text-sm text-primary/70">
                    {serviceCategories.find(c => c.id === service.category)?.name}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingService(service);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary/70 mb-2">{service.description}</p>
              <div className="flex justify-between text-sm">
                <span>R$ {service.price.toFixed(2)}</span>
                <span>{durationOptions.find(d => d.value === service.duration)?.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface ServiceFormProps {
  initialService?: Service | null;
  onSave: (service: Service) => void;
  onCancel: () => void;
}

function ServiceForm({ initialService, onSave, onCancel }: ServiceFormProps) {
  const [service, setService] = useState<Service>(
    initialService || {
      id: "",
      name: "",
      description: "",
      price: 0,
      duration: 30,
      category: ""
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(service);
  };

  const handleServiceSelect = (categoryId: string, serviceName: string) => {
    const category = serviceCategories.find(c => c.id === categoryId);
    const subservice = category?.subservices.find(s => s.name === serviceName);
    
    if (subservice) {
      setService({
        ...service,
        name: subservice.name,
        description: subservice.description,
        duration: subservice.defaultDuration,
        category: categoryId
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Categoria</label>
        <Select
          value={service.category}
          onValueChange={(value) => setService({ ...service, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {serviceCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {service.category && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Serviço</label>
          <Select
            value={service.name}
            onValueChange={(value) => handleServiceSelect(service.category, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o serviço" />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories
                .find(c => c.id === service.category)
                ?.subservices.map((subservice) => (
                  <SelectItem key={subservice.name} value={subservice.name}>
                    {subservice.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição</label>
        <Textarea
          value={service.description}
          onChange={(e) => setService({ ...service, description: e.target.value })}
          placeholder="Descreva os detalhes do serviço..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Preço (R$)</label>
          <Input
            type="number"
            value={service.price}
            onChange={(e) => setService({ ...service, price: Number(e.target.value) })}
            placeholder="0,00"
            min="0"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Duração</label>
          <Select
            value={service.duration.toString()}
            onValueChange={(value) => setService({ ...service, duration: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a duração" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialService ? "Salvar Alterações" : "Adicionar Serviço"}
        </Button>
      </div>
    </form>
  );
}
