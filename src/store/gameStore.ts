import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chess } from 'chess.js';
import type { Move } from 'chess.js';

interface GameState {
  game: Chess;
  fen: string;
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  history: string[];
  lastMove: Move | null;
  capturedPieces: {
    w: string[];
    b: string[];
  };
  suggestedMove: { from: string; to: string; explanation: string } | null;
  
  // Actions
  makeMove: (move: string | { from: string; to: string; promotion?: string }) => boolean;
  resetGame: () => void;
  undoMove: () => void;
  loadFen: (fen: string) => void;
  jumpToMove: (moveIndex: number) => void;
  setSuggestedMove: (move: { from: string; to: string; explanation: string } | null) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      game: new Chess(),
      fen: 'start',
      turn: 'w',
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      history: [],
      lastMove: null,
      capturedPieces: { w: [], b: [] },
      suggestedMove: null,

      makeMove: (move) => {
        const { game } = get();
        try {
          const result = game.move(move);
          if (result) {
            set({
              fen: game.fen(),
              turn: game.turn(),
              isCheck: game.inCheck(),
              isCheckmate: game.isCheckmate(),
              isStalemate: game.isStalemate(),
              isDraw: game.isDraw(),
              history: game.history(),
              lastMove: result,
              capturedPieces: updateCapturedPieces(game),
              suggestedMove: null,
            });
            return true;
          }
        } catch (e) {
          console.error("Invalid move", e);
        }
        return false;
      },

      resetGame: () => {
        const newGame = new Chess();
        set({
          game: newGame,
          fen: 'start',
          turn: 'w',
          isCheck: false,
          isCheckmate: false,
          isStalemate: false,
          isDraw: false,
          history: [],
          lastMove: null,
          capturedPieces: { w: [], b: [] },
        });
      },

      undoMove: () => {
        const { game } = get();
        game.undo();
        set({
          fen: game.fen(),
          turn: game.turn(),
          isCheck: game.inCheck(),
          isCheckmate: game.isCheckmate(),
          isStalemate: game.isStalemate(),
          isDraw: game.isDraw(),
          history: game.history(),
          lastMove: null,
          capturedPieces: updateCapturedPieces(game),
        });
      },

      loadFen: (fen) => {
        const { game } = get();
        game.load(fen);
        set({
          fen: game.fen(),
          turn: game.turn(),
          isCheck: game.inCheck(),
          isCheckmate: game.isCheckmate(),
          isStalemate: game.isStalemate(),
          isDraw: game.isDraw(),
          history: game.history(),
          lastMove: null,
          capturedPieces: updateCapturedPieces(game),
        });
      },

      jumpToMove: (moveIndex) => {
        const newGame = new Chess();
        const history = get().history;
        
        for (let i = 0; i <= moveIndex; i++) {
          newGame.move(history[i]);
        }

        set({
          game: newGame,
          fen: newGame.fen(),
          turn: newGame.turn(),
          isCheck: newGame.inCheck(),
          isCheckmate: newGame.isCheckmate(),
          isStalemate: newGame.isStalemate(),
          isDraw: newGame.isDraw(),
          lastMove: newGame.history({ verbose: true }).pop() || null,
          capturedPieces: updateCapturedPieces(newGame),
        });
      },

      setSuggestedMove: (suggestedMove) => set({ suggestedMove }),
    }),
    {
      name: 'chess-game-storage',
      partialize: (state) => ({
        fen: state.fen,
        turn: state.turn,
        history: state.history,
        capturedPieces: state.capturedPieces,
        lastMove: state.lastMove,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.fen && state.fen !== 'start') {
          state.game.load(state.fen);
        }
      },
    }
  )
);

function updateCapturedPieces(game: Chess) {
  const history = game.history({ verbose: true });
  const captured: { w: string[]; b: string[] } = { w: [], b: [] };
  
  history.forEach(m => {
    if (m.captured) {
      // If white moves and captures, black piece is captured
      // but in chess.js history, m.color is the color of the mover
      const capturedColor = m.color === 'w' ? 'b' : 'w';
      captured[capturedColor].push(m.captured);
    }
  });
  
  return captured;
}
