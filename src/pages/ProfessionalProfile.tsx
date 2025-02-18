import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Menu, 
  X, 
  Calendar, 
  Scissors, 
  User, 
  Wifi, 
  Car, 
  Baby, 
  Wind, 
  PawPrint, 
  Sparkles, 
  Palette,
  Brush,
  Droplets,
  Link,
  MapPin,
  Star,
  Share2,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import professionalService, { Professional } from "@/services/professionalService";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

const ProfessionalProfile = () => {
  const navigate = useNavigate();
  const { profileUrl } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const { toast } = useToast();
  const { updateTheme } = useTheme();

  useEffect(() => {
    const loadProfessional = async () => {
      try {
        setLoading(true);
        const professionals = await professionalService.list();
        const prof = professionals.find(p => p.profileUrl === profileUrl && p.status === "approved");
        
        if (prof) {
          setProfessional(prof);
          // Atualizar o tema quando carregar o profissional
          if (prof.theme?.id) {
            updateTheme(prof.theme.id);
          }
        } else {
          setError("Profissional não encontrado");
        }
      } catch (error) {
        console.error('Erro ao carregar profissional:', error);
        setError("Erro ao carregar dados do profissional");
      } finally {
        setLoading(false);
      }
    };

    loadProfessional();
  }, [profileUrl, updateTheme]);

  const filteredServices = selectedCategory === "todos" 
    ? professional?.services || []
    : (professional?.services || []).filter(service => service.category === selectedCategory);

  const handleSchedule = (service: any) => {
    if (!professional) return;
    
    navigate("/agendar", { 
      state: { 
        service: {
          ...service, // Mantém todos os dados do serviço, incluindo o ID
          id: service.id || `${professional.id}-${service.name}` // Fallback para ID
        },
        professional: {
          id: professional.id,
          name: professional.name,
          email: professional.email,
          phone: professional.phone,
          profileUrl: professional.profileUrl,
          workingHours: professional.workingHours
        }
      } 
    });
  };

  const handleNavigateToReviews = () => {
    navigate("/avaliacoes", { state: { professional } });
  };

  const handleNavigateToSchedule = () => {
    navigate("/agendamentos", { state: { professional } });
  };

  const handleShare = async () => {
    if (!professional) return;

    try {
      const shareData = {
        title: `${professional.name} - ${professional.profession}`,
        text: `Conheça ${professional.name}, ${professional.profession} no Reserva Top!`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Link compartilhado",
          description: "O link foi compartilhado com sucesso!",
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        toast({
          title: "Link copiado",
          description: "O link foi copiado para a área de transferência!",
        });
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar o link.",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToLocation = () => {
    if (!professional?.address) return;

    const { street, number, neighborhood, city, state } = professional.address;
    const address = `${street}, ${number} - ${neighborhood}, ${city} - ${state}`;
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    window.open(mapsUrl, '_blank');
  };

  // Gerar lista de categorias baseada nos serviços do profissional
  const getCategories = () => {
    if (!professional) return [{ id: "todos", name: "Todos" }];

    const uniqueCategories = new Set(professional.services.map(service => service.category));
    const categories = Array.from(uniqueCategories).map(category => {
      const categoryInfo = serviceCategories.find(c => c.id === category);
      return {
        id: category,
        name: categoryInfo ? categoryInfo.name : category // Usa o nome da categoria pré-definida ou o próprio ID
      };
    });

    return [{ id: "todos", name: "Todos" }, ...categories];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-primary mb-4">Ops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  if (!professional) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-primary/95 backdrop-blur-xl shadow-lg transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full bg-white/30 backdrop-blur-sm z-10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center space-x-3 mb-8">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder.svg" alt="Cliente" />
              <AvatarFallback>CL</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-primary-foreground">Cliente</h2>
              <p className="text-sm text-primary-foreground/80">Área do Cliente</p>
            </div>
          </div>
          <nav className="space-y-4">
            <button
              onClick={handleNavigateToSchedule}
              className="w-full flex items-center space-x-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors p-2 rounded-lg hover:bg-primary-foreground/10"
            >
              <Calendar className="w-5 h-5" />
              <span>Agendamentos</span>
            </button>
            <button
              onClick={handleNavigateToReviews}
              className="w-full flex items-center space-x-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors p-2 rounded-lg hover:bg-primary-foreground/10"
            >
              <Star className="w-5 h-5" />
              <span>Avaliações</span>
            </button>
            <a
              href="#"
              className="flex items-center space-x-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors p-2 rounded-lg hover:bg-primary-foreground/10"
            >
              <Scissors className="w-5 h-5" />
              <span>Serviços</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors p-2 rounded-lg hover:bg-primary-foreground/10"
            >
              <User className="w-5 h-5" />
              <span>Perfil</span>
            </a>
          </nav>
        </div>
      </aside>

      <main
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        {/* Cover Image */}
        <div className="relative">
          {/* Foto de Capa */}
          <div className="h-48 bg-gradient-to-r from-primary to-primary/80 overflow-hidden relative">
            {professional?.cover?.url ? (
              <img
                src={professional.cover.url}
                alt={`Capa de ${professional.name}`}
                className="w-full h-full object-cover opacity-75"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary to-primary/80" />
            )}
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full bg-white/30 backdrop-blur-sm z-10 transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Foto de Perfil */}
          <div className="absolute -bottom-16 left-6">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              {professional?.profileImage?.url ? (
                <AvatarImage 
                  src={professional.profileImage.url} 
                  alt={professional.name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback>
                  {professional?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Informações do Profissional */}
          <div className="absolute -bottom-16 left-44 flex flex-col">
            <h1 className="text-3xl font-bold text-primary">{professional.name}</h1>
            <div className="flex items-center gap-2">
              <span className="text-primary/90 text-sm font-medium">{professional.profession}</span>
            </div>
          </div>
        </div>

        {/* Additional Profile Info */}
        <div className="mt-20 px-6">
          <div className="flex flex-col gap-1">
            <p className="text-primary/80 text-sm mt-1 max-w-md">
              {professional.bio}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <button 
                onClick={handleShare}
                className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
              >
                {isShared ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Compartilhar</span>
                  </>
                )}
              </button>
              {professional.address && (
                <button 
                  onClick={handleNavigateToLocation}
                  className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
                  title={`${professional.address.street}, ${professional.address.number} - ${professional.address.neighborhood}, ${professional.address.city} - ${professional.address.state}`}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Localização</span>
                </button>
              )}
              <button 
                onClick={() => navigate("/avaliacoes")}
                className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
              >
                <Star className="w-4 h-4" />
                <span className="text-sm">Avaliações</span>
                <div className="flex items-center gap-1 ml-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-medium">5.0</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 mt-0">
          <header className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-primary">Escolha seu serviço</h2>
          </header>

          {/* Categories */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {getCategories().map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-4 py-2 rounded-full transition-colors whitespace-nowrap",
                  selectedCategory === category.id
                    ? "bg-accent text-white"
                    : "bg-secondary/20 text-secondary hover:bg-secondary/30"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <section className="grid grid-cols-2 gap-3 mb-12">
            {filteredServices.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-all hover:scale-105 animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-secondary/20 rounded-xl group-hover:bg-accent/20 transition-colors">
                    <Scissors className="w-5 h-5 text-secondary group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary">
                      {service.name}
                    </h3>
                    <span className="text-xs text-text/60">{service.duration} min</span>
                  </div>
                </div>
                <p className="text-xs text-text mb-2 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary font-semibold">
                    R$ {service.price.toFixed(2)}
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleSchedule(service)}
                    className="bg-accent text-white px-2 py-1 rounded-lg hover:bg-accent/90 transition-colors text-xs"
                  >
                    Agendar
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Amenities Section */}
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-4">Comodidades</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {amenities.map((amenity) => (
                <div
                  key={amenity.name}
                  className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-50"
                >
                  <amenity.icon className="w-4 h-4 text-primary mb-1" />
                  <span className="text-xs text-center text-muted-foreground">{amenity.name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 z-50">
        <a
          href={`https://wa.me/55${professional.phone.replace(/\D/g, '')}?text=Olá! Vi seu perfil no Reserva Top e gostaria de mais informações.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-full shadow-md transition-all hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.086-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
          </svg>
          <span className="text-sm">WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

const serviceCategories = [
  { id: "cabelo", name: "Cabelo" },
  { id: "barba", name: "Barba" },
  { id: "estetica", name: "Estética" },
  { id: "manicure", name: "Manicure" },
];

const amenities = [
  { name: "Wi-Fi Grátis", icon: Wifi },
  { name: "Estacionamento", icon: Car },
  { name: "Área Infantil", icon: Baby },
  { name: "Ar Condicionado", icon: Wind },
  { name: "Pet Friendly", icon: PawPrint },
];

const getDayName = (day: number): string => {
  const days = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  return days[day];
};

export default ProfessionalProfile;
