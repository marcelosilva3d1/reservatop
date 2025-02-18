import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Check, Upload } from "lucide-react";
import { formatPhone, formatCurrency, parseCurrency } from "@/lib/format";
import { serviceCategories, durationOptions } from "@/data/serviceCategories";
import professionalService from "@/services/professionalService"; 
import { Lightbulb } from "lucide-react";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkingHour {
  dayOfWeek: number;
  isAvailable: boolean;
  timeSlots: {
    start: string;
    end: string;
  }[];
}

interface RegisterFormData {
  // Etapa 1: Informações Básicas
  name: string;
  email: string;
  password: string;
  phone: string;
  
  // Etapa 2: Perfil Profissional
  profileUrl: string; // URL personalizada
  profession: string;
  bio: string;
  avatar: File | null;
  coverImage: File | null;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Etapa 3: Serviços
  services: {
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
  }[];
  
  // Etapa 4: Horários
  workingHours: WorkingHour[];
}

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    profileUrl: "",
    profession: "",
    bio: "",
    avatar: null,
    coverImage: null,
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
    services: [
      {
        name: "",
        description: "",
        price: 0,
        duration: 30,
        category: ""
      }
    ],
    workingHours: [
      { 
        dayOfWeek: 1, 
        isAvailable: true, 
        timeSlots: [
          { start: "09:00", end: "12:00" },
          { start: "14:00", end: "18:00" }
        ]
      },
      { 
        dayOfWeek: 2, 
        isAvailable: true, 
        timeSlots: [
          { start: "09:00", end: "12:00" },
          { start: "14:00", end: "18:00" }
        ]
      },
      { 
        dayOfWeek: 3, 
        isAvailable: true, 
        timeSlots: [
          { start: "09:00", end: "12:00" },
          { start: "14:00", end: "18:00" }
        ]
      },
      { 
        dayOfWeek: 4, 
        isAvailable: true, 
        timeSlots: [
          { start: "09:00", end: "12:00" },
          { start: "14:00", end: "18:00" }
        ]
      },
      { 
        dayOfWeek: 5, 
        isAvailable: true, 
        timeSlots: [
          { start: "09:00", end: "12:00" },
          { start: "14:00", end: "18:00" }
        ]
      },
      { 
        dayOfWeek: 6, 
        isAvailable: false, 
        timeSlots: []
      },
      { 
        dayOfWeek: 0, 
        isAvailable: false, 
        timeSlots: []
      }
    ],
  });

  const bioExamples = [
    "Profissional com mais de 10 anos de experiência em cortes masculinos e femininos. Especializado em técnicas modernas e tendências atuais.",
    "Cabeleireiro(a) apaixonado(a) por transformar a autoestima das pessoas através de cortes personalizados. Formado(a) em técnicas avançadas de coloração.",
    "Expert em barbearia moderna, unindo técnicas tradicionais com as últimas tendências. Especializado(a) em degradês e acabamentos impecáveis."
  ];

  const [selectedBioExample, setSelectedBioExample] = useState<number | null>(null);

  const [priceInputs, setPriceInputs] = useState<{ [key: number]: string }>({});

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
          toast({
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos obrigatórios.",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.email.includes("@")) {
          toast({
            title: "Email inválido",
            description: "Por favor, insira um email válido.",
            variant: "destructive",
          });
          return false;
        }
        if (formData.password.length < 6) {
          toast({
            title: "Senha muito curta",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case 2:
        if (!formData.profileUrl || !formData.profession || !formData.bio || 
            !formData.address.street || !formData.address.number || 
            !formData.address.neighborhood || !formData.address.city || 
            !formData.address.state || !formData.address.zipCode) {
          toast({
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos obrigatórios, incluindo o endereço.",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case 3:
        if (!formData.services.length) {
          toast({
            title: "Serviços obrigatórios",
            description: "Adicione pelo menos um serviço.",
            variant: "destructive",
          });
          return false;
        }
        for (const service of formData.services) {
          if (!service.category || !service.name || !service.description || !service.price) {
            toast({
              title: "Campos obrigatórios",
              description: "Por favor, preencha todos os campos dos serviços.",
              variant: "destructive",
            });
            return false;
          }
        }
        return true;

      case 4:
        const hasAvailableDay = formData.workingHours.some(h => h.isAvailable);
        if (!hasAvailableDay) {
          toast({
            title: "Horário de trabalho",
            description: "Selecione pelo menos um dia disponível para trabalho.",
            variant: "destructive",
          });
          return false;
        }
        return true;

      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      // Enviar dados para a API
      await professionalService.create(formData);

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Aguarde a aprovação do administrador para começar a usar a plataforma.",
      });
      
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erro ao realizar cadastro",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleBioExampleSelect = (index: number) => {
    setSelectedBioExample(index);
    setFormData({ ...formData, bio: bioExamples[index] });
  };

  const handleServiceCategorySelect = (serviceIndex: number, categoryId: string) => {
    try {
      const newServices = [...formData.services];
      newServices[serviceIndex] = {
        ...newServices[serviceIndex],
        category: categoryId,
        name: "", // Resetar o nome ao mudar de categoria
        description: "", // Resetar a descrição
        price: 0, // Resetar o preço
        duration: 30 // Voltar para duração padrão
      };
      setFormData({ ...formData, services: newServices });
    } catch (error) {
      console.error("Erro ao selecionar categoria:", error);
      toast({
        title: "Erro ao selecionar categoria",
        description: "Ocorreu um erro ao selecionar a categoria. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSubserviceSelect = (serviceIndex: number, categoryId: string, subserviceName: string) => {
    try {
      const category = serviceCategories.find(c => c.id === categoryId);
      const subservice = category?.subservices.find(s => s.name === subserviceName);
      
      if (subservice) {
        const newServices = [...formData.services];
        newServices[serviceIndex] = {
          ...newServices[serviceIndex],
          name: subservice.name,
          description: subservice.description,
          price: subservice.defaultPrice,
          duration: subservice.defaultDuration,
          category: categoryId
        };
        setFormData({ ...formData, services: newServices });
      }
    } catch (error) {
      console.error("Erro ao selecionar serviço:", error);
      toast({
        title: "Erro ao selecionar serviço",
        description: "Ocorreu um erro ao selecionar o serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleServiceChange = (serviceIndex: number, field: keyof typeof formData.services[0], value: string | number) => {
    try {
      const newServices = [...formData.services];
      newServices[serviceIndex] = {
        ...newServices[serviceIndex],
        [field]: value
      };
      setFormData({ ...formData, services: newServices });
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      toast({
        title: "Erro ao atualizar serviço",
        description: "Ocorreu um erro ao atualizar o serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handlePriceChange = (index: number, value: string) => {
    // Atualiza o estado do input
    setPriceInputs(prev => ({ ...prev, [index]: value }));

    // Se o valor for vazio, define 0 no formData
    if (!value) {
      handleServiceChange(index, "price", 0);
      return;
    }

    // Remove qualquer caractere que não seja número ou vírgula
    const cleanValue = value.replace(/[^\d,]/g, '');
    
    // Converte para número apenas quando for um valor válido
    if (cleanValue) {
      const numberValue = Number(cleanValue.replace(',', '.'));
      if (!isNaN(numberValue)) {
        handleServiceChange(index, "price", numberValue);
      }
    }
  };

  const formatPrice = (value: number) => {
    if (value === 0) return '';
    return value.toFixed(2).replace('.', ',');
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        {
          name: "",
          description: "",
          price: 0,
          duration: 30,
          category: ""
        }
      ]
    });
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    });
  };

  const handleWorkingHoursChange = (index: number, field: string, value: any) => {
    const newWorkingHours = [...formData.workingHours];
    newWorkingHours[index] = {
      ...newWorkingHours[index],
      [field]: value
    };
    setFormData({
      ...formData,
      workingHours: newWorkingHours
    });
  };

  const handleAddressChange = (field: keyof typeof formData.address) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: e.target.value
      }
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome completo"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <Input
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(00)00000-0000"
                maxLength={14}
                required
              />
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <Button type="submit">
                Próximo
              </Button>
            </div>
          </form>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">URL do Perfil</label>
                <Input
                  placeholder="sua-url-personalizada"
                  value={formData.profileUrl}
                  onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Esta será sua URL personalizada: agende-bela.com/{formData.profileUrl || "seu-nome"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Profissão</label>
                <Input
                  placeholder="Ex: Cabeleireiro, Barbeiro..."
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Biografia</label>
              <Textarea
                placeholder="Fale um pouco sobre você e sua experiência..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="h-32"
              />
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Exemplos de biografia:
                </p>
                <div className="grid gap-2">
                  {bioExamples.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={cn(
                        "justify-start text-left h-auto whitespace-normal",
                        selectedBioExample === index && "border-primary"
                      )}
                      onClick={() => {
                        setFormData({ ...formData, bio: example });
                        setSelectedBioExample(index);
                      }}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Endereço</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium">CEP</label>
                  <Input
                    placeholder="00000-000"
                    value={formData.address.zipCode}
                    onChange={handleAddressChange('zipCode')}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium">Rua</label>
                  <Input
                    placeholder="Nome da rua"
                    value={formData.address.street}
                    onChange={handleAddressChange('street')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Número</label>
                  <Input
                    placeholder="123"
                    value={formData.address.number}
                    onChange={handleAddressChange('number')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Complemento</label>
                  <Input
                    placeholder="Apto 101"
                    value={formData.address.complement}
                    onChange={handleAddressChange('complement')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Bairro</label>
                  <Input
                    placeholder="Nome do bairro"
                    value={formData.address.neighborhood}
                    onChange={handleAddressChange('neighborhood')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Cidade</label>
                  <Input
                    placeholder="Nome da cidade"
                    value={formData.address.city}
                    onChange={handleAddressChange('city')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <Input
                    placeholder="UF"
                    value={formData.address.state}
                    onChange={handleAddressChange('state')}
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* ... código existente de upload de imagens ... */}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="outline" onClick={handlePreviousStep}>
                Voltar
              </Button>
              <Button type="button" onClick={handleNextStep}>
                Próximo
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {formData.services.map((service, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded-full text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Categoria</label>
                      <div className="flex gap-2">
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={service.category}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "custom") {
                              const customCategory = window.prompt("Digite o nome da nova categoria:");
                              if (customCategory) {
                                handleServiceChange(index, "category", customCategory);
                              }
                            } else {
                              handleServiceChange(index, "category", value);
                            }
                          }}
                        >
                          <option value="">Selecione uma categoria</option>
                          {serviceCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                          <option value="custom">Adicionar Nova Categoria...</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome do Serviço</label>
                      <Input
                        type="text"
                        value={service.name}
                        onChange={(e) =>
                          handleServiceChange(index, "name", e.target.value)
                        }
                        placeholder="Ex: Corte de Cabelo"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={service.description}
                      onChange={(e) =>
                        handleServiceChange(index, "description", e.target.value)
                      }
                      placeholder="Descreva o serviço em detalhes"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Preço</label>
                      <Input
                        type="text"
                        value={priceInputs[index] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPriceInputs((prev) => ({ ...prev, [index]: value }));
                          const numericValue = parseCurrency(value);
                          handleServiceChange(index, "price", numericValue);
                        }}
                        onBlur={(e) => {
                          const formattedValue = formatCurrency(service.price);
                          setPriceInputs((prev) => ({ ...prev, [index]: formattedValue }));
                        }}
                        placeholder="R$ 0,00"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duração</label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={service.duration}
                        onChange={(e) =>
                          handleServiceChange(index, "duration", Number(e.target.value))
                        }
                      >
                        {durationOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={addService}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Serviço
            </Button>

            <div className="flex justify-end space-x-4 mt-6">
              <Button type="button" variant="outline" onClick={handlePreviousStep}>
                Voltar
              </Button>
              <Button type="button" onClick={handleNextStep}>
                Próximo
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-4">
            {formData.workingHours.map((schedule, index) => (
              <div key={index} className="flex flex-col space-y-4 p-4 border rounded-lg">
                <div className="font-medium">
                  {["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][schedule.dayOfWeek]}
                </div>
                <div className="flex flex-col gap-4 w-full">
                  <div className="space-y-4">
                    {schedule.timeSlots.map((timeSlot, timeSlotIndex) => (
                      <div key={timeSlotIndex} className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
                        <Input
                          type="time"
                          value={timeSlot.start}
                          onChange={(e) =>
                            handleWorkingHoursChange(index, "timeSlots", [
                              ...formData.workingHours[index].timeSlots.slice(0, timeSlotIndex),
                              { ...timeSlot, start: e.target.value },
                              ...formData.workingHours[index].timeSlots.slice(timeSlotIndex + 1),
                            ])
                          }
                          disabled={!schedule.isAvailable}
                          required={schedule.isAvailable}
                          className="w-full min-w-0"
                        />
                        <span className="text-center px-2">até</span>
                        <Input
                          type="time"
                          value={timeSlot.end}
                          onChange={(e) =>
                            handleWorkingHoursChange(index, "timeSlots", [
                              ...formData.workingHours[index].timeSlots.slice(0, timeSlotIndex),
                              { ...timeSlot, end: e.target.value },
                              ...formData.workingHours[index].timeSlots.slice(timeSlotIndex + 1),
                            ])
                          }
                          disabled={!schedule.isAvailable}
                          required={schedule.isAvailable}
                          className="w-full min-w-0"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant={schedule.isAvailable ? "default" : "outline"}
                    onClick={() =>
                      handleWorkingHoursChange(
                        index,
                        "isAvailable",
                        !schedule.isAvailable
                      )
                    }
                    className="w-full"
                  >
                    {schedule.isAvailable ? "Disponível" : "Indisponível"}
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="outline" onClick={handlePreviousStep}>
                Voltar
              </Button>
              <Button type="submit">
                Finalizar Cadastro
              </Button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de Profissional</CardTitle>
          <CardDescription>
            {step === 1 && "Informações básicas"}
            {step === 2 && "Perfil profissional"}
            {step === 3 && "Serviços oferecidos"}
            {step === 4 && "Horários de atendimento"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-1/4 h-2 rounded-full mx-1 ${
                    s === step
                      ? "bg-primary"
                      : s < step
                      ? "bg-primary/50"
                      : "bg-secondary"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Informações</span>
              <span>Perfil</span>
              <span>Serviços</span>
              <span>Horários</span>
            </div>
          </div>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
