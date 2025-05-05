
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchStoreSettings } from '@/services/api';

interface ThemeContextType {
  isLoaded: boolean;
  updateTheme: (colors: {
    primary?: string;
    primaryForeground?: string;
    secondary?: string;
    secondaryForeground?: string;
  }) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isLoaded: false,
  updateTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

// Função para converter cor hex para HSL
const hexToHSL = (hex: string): string => {
  // Remove o # se existir
  hex = hex.replace('#', '');
  
  // Converte para RGB
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Encontra os valores máximo e mínimo de RGB
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  
  // Calcula a luminosidade
  let l = (max + min) / 2;
  
  let h = 0;
  let s = 0;
  
  if (max !== min) {
    // Calcula a saturação
    s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    
    // Calcula o matiz
    if (max === r) {
      h = (g - b) / (max - min) + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / (max - min) + 2;
    } else {
      h = (r - g) / (max - min) + 4;
    }
    
    h = h * 60;
  }
  
  // Arredonda os valores
  h = Math.round(h);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
};

// Função para determinar uma cor de texto adequada (claro/escuro) com base na cor de fundo
const getContrastColor = (hex: string): string => {
  // Remove o # se existir
  hex = hex.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calcula a luminosidade percebida
  // Fórmula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Se a luminância for maior que 0.5, a cor é clara, caso contrário é escura
  if (luminance > 0.5) {
    return '20 14.3% 4.1%'; // Cor escura para fundo claro (próximo a preto)
  } else {
    return '0 0% 98%'; // Cor clara para fundo escuro (próximo a branco)
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await fetchStoreSettings();
        if (settings && settings.primary_color) {
          updateTheme({
            primary: settings.primary_color,
            secondary: settings.secondary_color
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de cores:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadTheme();
  }, []);
  
  const updateTheme = ({ primary, secondary, primaryForeground, secondaryForeground }: {
    primary?: string;
    primaryForeground?: string;
    secondary?: string;
    secondaryForeground?: string;
  }) => {
    const root = document.documentElement;
    
    if (primary) {
      const primaryHSL = hexToHSL(primary);
      root.style.setProperty('--primary', primaryHSL);
      
      // Se não fornecido, calcular automaticamente a cor de texto com contraste adequado
      if (!primaryForeground) {
        const contrastColor = getContrastColor(primary);
        root.style.setProperty('--primary-foreground', contrastColor);
      }
    }
    
    if (secondary) {
      const secondaryHSL = hexToHSL(secondary);
      root.style.setProperty('--secondary', secondaryHSL);
      
      // Se não fornecido, calcular automaticamente a cor de texto com contraste adequado
      if (!secondaryForeground) {
        const contrastColor = getContrastColor(secondary);
        root.style.setProperty('--secondary-foreground', contrastColor);
      }
    }
    
    if (primaryForeground) {
      const primaryFgHSL = hexToHSL(primaryForeground);
      root.style.setProperty('--primary-foreground', primaryFgHSL);
    }
    
    if (secondaryForeground) {
      const secondaryFgHSL = hexToHSL(secondaryForeground);
      root.style.setProperty('--secondary-foreground', secondaryFgHSL);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ isLoaded, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
