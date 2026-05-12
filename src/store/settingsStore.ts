import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  showCoordinates: boolean;
  autoPromoteToQueen: boolean;
  highlightLegalMoves: boolean;
  
  // Actions
  toggleSound: () => void;
  toggleAnimations: () => void;
  toggleCoordinates: () => void;
  toggleAutoPromote: () => void;
  toggleHighlight: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      animationsEnabled: true,
      showCoordinates: true,
      autoPromoteToQueen: false,
      highlightLegalMoves: true,

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),
      toggleCoordinates: () => set((state) => ({ showCoordinates: !state.showCoordinates })),
      toggleAutoPromote: () => set((state) => ({ autoPromoteToQueen: !state.autoPromoteToQueen })),
      toggleHighlight: () => set((state) => ({ highlightLegalMoves: !state.highlightLegalMoves })),
    }),
    {
      name: 'chess-settings-storage',
    }
  )
);
