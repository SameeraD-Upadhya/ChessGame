import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  username: string;
  avatar: string;
  pieceStyle: 'classic' | 'neo' | 'modern';
  joinedAt: string;
}

interface UserState {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {
        username: 'Guest Player',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky',
        pieceStyle: 'modern',
        joinedAt: new Date().toISOString(),
      },
      updateProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
      })),
    }),
    {
      name: 'chess-user-storage',
    }
  )
);
