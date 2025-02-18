import api from "@/lib/api";

const uploadService = {
  async uploadImage(file: File, type: 'cover' | 'profile'): Promise<string> {
    try {
      // Solução temporária: converter para base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Erro ao converter imagem'));
          }
        };
        reader.onerror = () => reject(reader.error);
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw new Error('Não foi possível fazer o upload da imagem');
    }
  },

  validateImage(file: File): { valid: boolean; error?: string } {
    // Verificar o tipo do arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato de arquivo inválido. Use JPG, PNG ou WebP.'
      };
    }

    // Verificar o tamanho (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. O tamanho máximo é 5MB.'
      };
    }

    return { valid: true };
  }
};

export default uploadService;
