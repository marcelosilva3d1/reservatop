import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Theme, CoverImage, presetThemes, presetCovers } from "@/types/customization";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Palette, Upload, Camera } from "lucide-react";
import professionalService from "@/services/professionalService";
import { useTheme } from "@/contexts/ThemeContext";
import uploadService from "@/services/uploadService";

interface ProfileCustomizationProps {
  professional: any;
  onUpdate: () => void;
}

export function ProfileCustomization({ professional, onUpdate }: ProfileCustomizationProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>(professional.theme?.id || 'padrao');
  const [coverImage, setCoverImage] = useState<{
    type: 'preset' | 'custom';
    id?: string;
    url?: string;
  }>({
    type: 'preset',
    id: professional.cover?.id || 'salon1',
    url: professional.cover?.url
  });
  const [profileImage, setProfileImage] = useState<{
    type: 'upload';
    url?: string;
  }>({
    type: 'upload',
    url: professional.profileImage?.url
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateTheme } = useTheme();

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme.id);
    updateTheme(theme.id);
  };

  const handleCoverSelect = (cover: CoverImage) => {
    setCoverImage({
      type: 'preset',
      id: cover.id,
      url: cover.url
    });
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validar o arquivo
      const validation = uploadService.validateImage(file);
      if (!validation.valid) {
        toast({
          title: "Arquivo inválido",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }

      // Fazer upload
      setIsLoading(true);
      const url = await uploadService.uploadImage(file, 'cover');
      
      setCoverImage({
        type: 'custom',
        url
      });

      toast({
        title: "Upload concluído",
        description: "Imagem de capa atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer upload da imagem de capa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validar o arquivo
      const validation = uploadService.validateImage(file);
      if (!validation.valid) {
        toast({
          title: "Arquivo inválido",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }

      // Fazer upload
      setIsLoading(true);
      const url = await uploadService.uploadImage(file, 'profile');
      
      setProfileImage({
        type: 'upload',
        url
      });

      toast({
        title: "Upload concluído",
        description: "Foto de perfil atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer upload da foto de perfil.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await professionalService.update(professional.id, {
        ...professional,
        theme: { id: selectedTheme },
        cover: coverImage,
        profileImage
      });

      toast({
        title: "Personalização salva",
        description: "As alterações foram salvas com sucesso.",
      });

      onUpdate();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Personalização do Perfil</h2>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </div>

      {/* Foto de Perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            <CardTitle>Foto de Perfil</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                {profileImage.url ? (
                  <img
                    src={profileImage.url}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
              </div>
              <label
                htmlFor="profile-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-4 h-4" />
              </label>
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Escolha uma foto de perfil profissional. Recomendamos uma imagem clara e bem iluminada.
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Temas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <CardTitle>Cores dos Botões</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presetThemes.map((theme) => (
              <button
                key={theme.id}
                className={cn(
                  "p-4 rounded-lg border transition-all hover:scale-105",
                  selectedTheme === theme.id && "ring-2 ring-primary",
                  theme.id === 'padrao' && "border-primary/50 bg-primary/5"
                )}
                onClick={() => handleThemeSelect(theme)}
              >
                <div className="text-sm font-medium mb-3 flex items-center gap-2">
                  {theme.name}
                  {theme.id === 'padrao' && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Padrão
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div
                    className="w-12 h-8 rounded"
                    style={{ backgroundColor: theme.colors.primary }}
                    title="Cor Principal"
                  />
                  <div
                    className="w-12 h-8 rounded"
                    style={{ backgroundColor: theme.colors.accent }}
                    title="Cor de Destaque"
                  />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Imagens de Capa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            <CardTitle>Imagem de Capa</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload personalizado */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Upload de Capa Personalizada</h3>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="cover-upload"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <label
                htmlFor="cover-upload"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Escolher Imagem</span>
              </label>
              <p className="text-sm text-muted-foreground">
                Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB
              </p>
            </div>
          </div>

          {/* Capas pré-definidas por categoria */}
          {['salao', 'barbearia', 'beleza', 'produtos'].map(category => {
            const categoryCovers = presetCovers.filter(cover => cover.category === category);
            if (categoryCovers.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  {category === 'salao' && 'Salão de Beleza'}
                  {category === 'barbearia' && 'Barbearia'}
                  {category === 'beleza' && 'Sobrancelhas e Maquiagem'}
                  {category === 'produtos' && 'Produtos e Ambiente'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categoryCovers.map((cover) => (
                    <div
                      key={cover.id}
                      className={cn(
                        "relative aspect-video rounded-lg overflow-hidden cursor-pointer group",
                        coverImage.id === cover.id && "ring-2 ring-primary"
                      )}
                      onClick={() => handleCoverSelect(cover)}
                    >
                      <img
                        src={cover.url}
                        alt={cover.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm">{cover.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
