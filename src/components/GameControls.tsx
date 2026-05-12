import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useThemeStore, THEMES } from '../store/themeStore';
import type { ThemeType } from '../store/themeStore';
import { RotateCcw, Undo2, Palette, Trophy, Brain, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { findBestMove } from '../lib/ai';
import { usePieceStore } from '../store/pieceStore';
import type { PieceStyle } from '../store/pieceStore';
import { Box } from 'lucide-react';

export const GameControls: React.FC = () => {
  const { game, resetGame, undoMove, turn, isCheckmate, isDraw } = useGameStore();
  const { theme: currentTheme, setTheme } = useThemeStore();
  const { style: currentPieceStyle, setStyle: setPieceStyle } = usePieceStore();
  const [hint, setHint] = React.useState<string | null>(null);

  const getHint = () => {
    const move = findBestMove(game, 3);
    setHint(move);
    setTimeout(() => setHint(null), 3000);
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
          <span className="text-[10px] font-bold uppercase tracking-wider">Undo</span>
        </button>
        <button 
          onClick={resetGame}
          className="flex flex-col items-center justify-center gap-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group"
        >
          <RotateCcw size={18} className="text-zinc-400 group-hover:text-white" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Reset</span>
        </button>
        <button 
          onClick={getHint}
          className="flex flex-col items-center justify-center gap-1 p-3 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all border border-cyan-500/20 group"
        >
          <Lightbulb size={18} className={`${hint ? 'text-yellow-400 animate-yellow-glow' : 'text-zinc-400 group-hover:text-white'}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Hint</span>
        </button>
      </div>

      {hint && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-400/20 border border-yellow-400/30 p-2 rounded-lg text-center"
        >
          <p className="text-[10px] font-bold text-yellow-400 uppercase">Suggested Move</p>
          <p className="text-sm font-mono font-black">{hint}</p>
        </motion.div>
      )}

      <div className="mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
          <Palette size={14} /> Appearance
        </h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(THEMES) as ThemeType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                currentTheme === t 
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                : 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {THEMES[t].name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
          <Box size={14} /> Piece Set
        </h3>
        <div className="flex flex-wrap gap-2">
          {(['classic', 'neon', 'cyberpunk', 'marble', 'minimal'] as PieceStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => setPieceStyle(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                currentPieceStyle === s 
                ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-400' 
                : 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Brain size={20} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-tighter">AI Status</p>
            <p className="text-sm text-zinc-400">Thinking...</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 uppercase">Difficulty</p>
          <p className="text-sm font-bold text-zinc-300">Grandmaster</p>
        </div>
      </div>
    </div>
  );
};
