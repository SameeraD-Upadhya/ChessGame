import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'cyberpunk' | 'royal' | 'minimal' | 'cosmic' | 'emerald' | 'wood' | 'tournament';

interface ThemeState {
  theme: ThemeType;
  mode: 'dark' | 'light';
  setTheme: (theme: ThemeType) => void;
  setMode: (mode: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'cyberpunk',
      mode: 'dark',
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
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
  bg: string;
  primary: string;
  secondary: string;
}> = {
  cyberpunk: {
    name: 'Neon Cyberpunk',
    light: '#00ffcc',
    dark: '#330066',
    bg: 'bg-zinc-950',
    primary: 'text-cyan-400',
    secondary: 'text-fuchsia-500',
  },
  royal: {
    name: 'Royal Gold',
    light: '#ffd700',
    dark: '#4a3721',
    bg: 'bg-stone-900',
    primary: 'text-yellow-500',
    secondary: 'text-amber-800',
  },
  minimal: {
    name: 'Minimal Monochrome',
    light: '#e2e2e2',
    dark: '#404040',
    bg: 'bg-zinc-900',
    primary: 'text-white',
    secondary: 'text-zinc-500',
  },
  cosmic: {
    name: 'Cosmic Purple',
    light: '#9d00ff',
    dark: '#1a0033',
    bg: 'bg-slate-950',
    primary: 'text-purple-500',
    secondary: 'text-indigo-900',
  },
  emerald: {
    name: 'Emerald Elite',
    light: '#2ecc71',
    dark: '#27ae60',
    bg: 'bg-emerald-950',
    primary: 'text-emerald-400',
    secondary: 'text-emerald-800',
  },
  wood: {
    name: 'Classic Wood',
    light: '#eeeed2',
    dark: '#769656',
    bg: 'bg-orange-950/20',
    primary: 'text-orange-200',
    secondary: 'text-orange-900',
  },
  tournament: {
    name: 'Tournament Dark',
    light: '#dee3e6',
    dark: '#8ca2ad',
    bg: 'bg-slate-900',
    primary: 'text-slate-200',
    secondary: 'text-slate-700',
  },
};
