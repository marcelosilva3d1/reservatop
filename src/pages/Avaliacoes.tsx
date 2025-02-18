import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import professionalService from "@/services/professionalService";
import { useTheme } from "@/contexts/ThemeContext";

const reviews = [
  {
    id: 1,
    name: "João Silva",
    rating: 5,
    comment: "Ótimo serviço! Atendimento impecável e resultado perfeito.",
    avatar: "/placeholder.svg",
    date: "14 fev, 2024"
  },
  {
    id: 2,
    name: "Maria Oliveira",
    rating: 4,
    comment: "Muito bom! Apenas achei que demorou um pouco mais do que o esperado.",
    avatar: "/placeholder.svg",
    date: "10 fev, 2024"
  },
  {
    id: 3,
    name: "Carlos Santos",
    rating: 5,
    comment: "Profissional incrível, recomendo a todos!",
    avatar: "/placeholder.svg",
    date: "05 fev, 2024"
  },
];

const Avaliacoes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { professional: initialProfessional } = location.state || {};
  const [professional, setProfessional] = useState(initialProfessional);
  const { updateTheme } = useTheme();
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  useEffect(() => {
    const loadProfessional = async () => {
      if (!initialProfessional?.id) return;
      
      try {
        const professionals = await professionalService.list();
        const prof = professionals.find(p => p.id === initialProfessional.id);
        
        if (prof) {
          setProfessional(prof);
          if (prof.theme?.id) {
            updateTheme(prof.theme.id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar profissional:', error);
      }
    };

    loadProfessional();
  }, [initialProfessional?.id, updateTheme]);

  const handleBack = () => {
    if (professional?.profileUrl) {
      navigate(`/${professional.profileUrl}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header com botão de voltar e imagem de capa */}
      <div className="relative">
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
            onClick={handleBack}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full bg-white/30 backdrop-blur-sm z-10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
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
          <h1 className="text-3xl font-bold text-primary">{professional?.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-primary/90 text-sm font-medium">{professional?.profession}</span>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 pt-24">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Avaliações</h2>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} ({reviews.length} avaliações)
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.avatar} />
                  <AvatarFallback>{review.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{review.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      {review.date}
                    </span>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { Avaliacoes };