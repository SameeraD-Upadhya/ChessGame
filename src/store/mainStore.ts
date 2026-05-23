import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppView = 'home' | 'setup' | 'game' | 'stats';

interface MainState {
  view: AppView;
  setView: (view: AppView) => void;
  gameMode: 'ai' | 'pvp' | 'analysis' | 'tutor';
  setGameMode: (mode: 'ai' | 'pvp' | 'analysis' | 'tutor') => void;
  playerSide: 'w' | 'b' | 'random';
  setPlayerSide: (side: 'w' | 'b' | 'random') => void;
  username: string;
  setUsername: (name: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
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
      username: 'GM_GUEST',
      setUsername: (username) => set({ username }),
      isDarkMode: true,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'chess-main-storage',
    }
  )
);
