import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameRecord {
  id: string;
  date: string;
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  mode: string;
  moves: number;
}

interface StatsState {
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  history: GameRecord[];
  
  // Actions
  recordGame: (result: 'win' | 'loss' | 'draw', opponent: string, mode: string, moves: number) => void;
  resetStats: () => void;
}

const INITIAL_RATING = 1200;

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      rating: INITIAL_RATING,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      history: [],

      recordGame: (result, opponent, mode, moves) => {
        set((state) => {
          const kFactor = 32;
          const opponentRating = 1200; // Simplified
          const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - state.rating) / 400));
          const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
          
          const ratingChange = Math.round(kFactor * (actualScore - expectedScore));
          const newRating = state.rating + ratingChange;

          const newRecord: GameRecord = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            result,
            opponent,
            mode,
            moves,
          };

          return {
            rating: newRating,
            gamesPlayed: state.gamesPlayed + 1,
            wins: result === 'win' ? state.wins + 1 : state.wins,
            losses: result === 'loss' ? state.losses + 1 : state.losses,
            draws: result === 'draw' ? state.draws + 1 : state.draws,
            history: [newRecord, ...state.history].slice(0, 50), // Keep last 50
          };
        });
      },

      resetStats: () => set({
        rating: INITIAL_RATING,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        history: [],
      }),
    }),
    {
      name: 'chess-stats-storage',
    }
  )
);
