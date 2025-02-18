import { createContext, useContext, useEffect, useState } from 'react';
import { Theme, presetThemes } from '@/types/customization';

interface ThemeContextType {
  currentTheme: Theme;
  updateTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(presetThemes[0]);

  const updateTheme = (themeId: string) => {
    const theme = presetThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      // Atualizar variáveis CSS
      document.documentElement.style.setProperty('--primary', theme.colors.primary);
      document.documentElement.style.setProperty('--accent', theme.colors.accent);
    }
  };

  // Aplicar tema inicial
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.colors.primary);
    root.style.setProperty('--accent', currentTheme.colors.accent);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
