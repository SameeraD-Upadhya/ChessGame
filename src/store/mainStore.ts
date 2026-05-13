import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppView = 'home' | 'setup' | 'game' | 'replay' | 'profile' | 'stats';

interface MainState {
  view: AppView;
  setView: (view: AppView) => void;
  gameMode: 'ai' | 'pvp' | 'analysis';
  setGameMode: (mode: 'ai' | 'pvp' | 'analysis') => void;
  playerSide: 'w' | 'b' | 'random';
  setPlayerSide: (side: 'w' | 'b' | 'random') => void;
}

export const useMainStore = create<MainState>()(
  persist(
    (set) => ({
      view: 'home',
      setView: (view) => set({ view }),
      gameMode: 'ai',
      setGameMode: (gameMode) => set({ gameMode }),
      playerSide: 'w',
      setPlayerSide: (playerSide) => set({ playerSide }),
    }),
    {
      name: 'chess-main-storage',
    }
  )
);
