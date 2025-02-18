import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Subservice {
  id: string;
  name: string;
  description: string;
  defaultDuration: number;
}

interface Category {
  id: string;
  name: string;
  subservices: Subservice[];
}

export function CategoriesManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Cabelo",
      subservices: [
        {
          id: "1",
          name: "Corte",
          description: "Corte personalizado incluindo lavagem",
          defaultDuration: 60
        },
        {
          id: "2",
          name: "Hidratação",
          description: "Tratamento profundo para os fios",
          defaultDuration: 90
        }
      ]
    }
  ]);
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", subservices: [] });
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      setCategories([...categories, { ...newCategory, id: Date.now().toString() }]);
      setNewCategory({ name: "", subservices: [] });
      setIsAddingCategory(false);
      toast({
        title: "Categoria adicionada",
        description: "A nova categoria foi criada com sucesso.",
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setCategories(categories.map(c => 
      c.id === category.id ? category : c
    ));
    setEditingCategory(null);
    toast({
      title: "Categoria atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(c => c.id !== categoryId));
    toast({
      title: "Categoria removida",
      description: "A categoria foi removida com sucesso.",
    });
  };

  const handleAddSubservice = (categoryId: string, subservice: Omit<Subservice, "id">) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subservices: [...category.subservices, { ...subservice, id: Date.now().toString() }]
        };
      }
      return category;
    }));
  };

  const handleDeleteSubservice = (categoryId: string, subserviceId: string) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subservices: category.subservices.filter(s => s.id !== subserviceId)
        };
      }
      return category;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Gerenciar Categorias</h2>
          <p className="text-sm text-primary/70">
            Gerencie as categorias e subserviços disponíveis na plataforma
          </p>
        </div>
        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
              <DialogDescription>
                Adicione uma nova categoria de serviços
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Categoria</label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Ex: Cabelo, Barba, etc."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddCategory}>
                  Adicionar Categoria
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="p-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">{category.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCategory(category)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {openCategories.includes(category.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {openCategories.includes(category.id) && (
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-2">Subserviços</h3>
                    <div className="space-y-2">
                      {category.subservices.map((subservice) => (
                        <div
                          key={subservice.id}
                          className="flex justify-between items-start p-2 bg-secondary/20 rounded-md"
                        >
                          <div>
                            <h4 className="font-medium">{subservice.name}</h4>
                            <p className="text-sm text-primary/70">
                              {subservice.description}
                            </p>
                            <p className="text-sm text-primary/70">
                              Duração padrão: {subservice.defaultDuration} minutos
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubservice(category.id, subservice.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Subserviço
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Novo Subserviço</DialogTitle>
                        <DialogDescription>
                          Adicione um novo subserviço à categoria {category.name}
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleAddSubservice(category.id, {
                            name: formData.get("name") as string,
                            description: formData.get("description") as string,
                            defaultDuration: Number(formData.get("defaultDuration")),
                          });
                          (e.target as HTMLFormElement).reset();
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Nome</label>
                          <Input name="name" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Descrição</label>
                          <Textarea name="description" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Duração Padrão (minutos)
                          </label>
                          <Input
                            type="number"
                            name="defaultDuration"
                            min="15"
                            step="15"
                            defaultValue="60"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="submit">Adicionar Subserviço</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Dialog para editar categoria */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Categoria</label>
                <Input
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancelar
                </Button>
                <Button onClick={() => handleEditCategory(editingCategory)}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
