import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useThemeStore, THEMES } from '../store/themeStore';
import type { ThemeType } from '../store/themeStore';
import { RotateCcw, Undo2, Palette, Brain, Lightbulb, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSuggestedMove } from '../lib/ai';
import { usePieceStore } from '../store/pieceStore';
import type { PawnTexture } from '../store/pieceStore';
import { Box } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export const GameControls: React.FC = () => {
  const { game, resetGame, undoMove, turn, isCheckmate, setSuggestedMove, suggestedMove } = useGameStore();
  const { theme: currentTheme, setTheme } = useThemeStore();
  const { pawnTexture, setPawnTexture } = usePieceStore();
  const { difficulty, setDifficulty } = useSettingsStore();

  const handleGetHint = () => {
    const suggestion = getSuggestedMove(game, difficulty);
    if (suggestion) {
      setSuggestedMove(suggestion);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 glass rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${turn === 'w' ? 'bg-white shadow-[0_0_8px_white]' : 'bg-zinc-600 shadow-[0_0_8px_zinc-600]'}`} />
          <span className="text-sm font-medium uppercase tracking-widest text-zinc-400">
            {turn === 'w' ? "White's Turn" : "Black's Turn"}
          </span>
        </div>
        {isCheckmate && (
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-bold animate-bounce">
            CHECKMATE!
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={undoMove}
          className="flex flex-col items-center justify-center gap-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group"
        >
          <Undo2 size={18} className="text-zinc-400 group-hover:text-white" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">Undo</span>
        </button>
        <button 
          onClick={() => {
            resetGame();
            setSuggestedMove(null);
          }}
          className="flex flex-col items-center justify-center gap-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group"
        >
          <RotateCcw size={18} className="text-zinc-400 group-hover:text-white" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">Reset</span>
        </button>
        <button 
          onClick={handleGetHint}
          disabled={!!suggestedMove}
          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all border group ${
            suggestedMove 
            ? 'bg-emerald-500/10 border-emerald-500/20 opacity-50 cursor-not-allowed' 
            : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20'
          }`}
        >
          <Lightbulb size={18} className={`${suggestedMove ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white'}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">Hint</span>
        </button>
      </div>

      <AnimatePresence>
        {suggestedMove && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-emerald-400/10 border border-emerald-400/20 p-3 rounded-xl flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <Zap size={10} /> Suggestion
                </span>
                <span className="text-xs font-mono font-black text-white">{suggestedMove.from} → {suggestedMove.to}</span>
              </div>
              <p className="text-[11px] text-zinc-300 italic">“{suggestedMove.explanation}”</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
          <Brain size={14} /> AI Difficulty
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                difficulty === d 
                ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-400' 
                : 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
          <Palette size={14} /> Theme
        </h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(THEMES) as ThemeType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                currentTheme === t 
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                : 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {THEMES[t].name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
          <Box size={14} /> Pieces
        </h3>
        <div className="flex flex-wrap gap-2">
          {(['classic', 'textured1', 'textured2', 'textured3'] as PawnTexture[]).map((s) => (
            <button
              key={s}
              onClick={() => setPawnTexture(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                pawnTexture === s 
                ? 'bg-white/10 border-white/20 text-white' 
                : 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
