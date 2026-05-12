import { create } from 'zustand';

export type AppView = 'home' | 'setup' | 'game' | 'replay' | 'profile' | 'stats';

interface MainState {
  view: AppView;
  setView: (view: AppView) => void;
  gameMode: 'ai' | 'pvp' | 'analysis';
  setGameMode: (mode: 'ai' | 'pvp' | 'analysis') => void;
}

export const useMainStore = create<MainState>((set) => ({
  view: 'home', // Defaulting to home for a premium entry
  setView: (view) => set({ view }),
  gameMode: 'ai',
  setGameMode: (gameMode) => set({ gameMode }),
}));
