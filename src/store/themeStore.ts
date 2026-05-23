import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'classic' | 'monochrome' | 'purple' | 'dark';

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'chess-theme-storage',
    }
  )
);

export const THEMES: Record<ThemeType, { 
  name: string; 
  light: string; 
  dark: string; 
}> = {
  classic: {
    name: 'Classic B/W',
    light: '#f0d9b5',
    dark: '#b58863',
  },
  monochrome: {
    name: 'Monochrome',
    light: '#e2e2e2',
    dark: '#404040',
  },
  purple: {
    name: 'Purple',
    light: '#9d00ff',
    dark: '#2e004f',
  },
  dark: {
    name: 'Tournament Dark',
    light: '#dee3e6',
    dark: '#8ca2ad',
  },
};

