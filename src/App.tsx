import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChessBoard } from './components/ChessBoard';
import { GameControls } from './components/GameControls';
import { MoveHistory } from './components/MoveHistory';
import { useGameStore } from './store/gameStore';
import { useThemeStore, THEMES } from './store/themeStore';
import { getDifficultyAdjustedMove, evaluateBoard } from './lib/ai';
import { Trophy, Sword, User, Settings, Info, BarChart3, Home, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

import { useMainStore } from './store/mainStore';
import { SetupScreen } from './components/SetupScreen';
import { StatsView } from './components/StatsView';
import { LandingPage } from './components/LandingPage';
import { SettingsModal } from './components/SettingsModal';
import { useStatsStore } from './store/statsStore';
import { useGameEvents } from './hooks/useGameEvents';
import { useSettingsStore } from './store/settingsStore';
import { PIECE_IMAGES } from './store/pieceStore';

function App() {
  const { game, turn, fen, isCheckmate, isDraw, makeMove, capturedPieces, resetGame } = useGameStore();
  const themeType = useThemeStore((state) => state.theme);
  const theme = THEMES[themeType];
  const { view, setView, gameMode, playerSide, setPlayerSide } = useMainStore();
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evaluation, setEvaluation] = useState(0);
  const recordGame = useStatsStore((state) => state.recordGame);
  const [gameRecorded, setGameRecorded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { animationsEnabled, difficulty } = useSettingsStore();

  // Trigger game events (sounds, etc.)
  useGameEvents();

  useEffect(() => {
    setEvaluation(evaluateBoard(game));
  }, [game, fen]);

  // AI Logic: If it's the AI's turn, make an AI move
  useEffect(() => {
    const aiColor = playerSide === 'w' ? 'b' : 'w';
    
    if (turn === aiColor && !isCheckmate && !isDraw && view === 'game' && gameMode === 'ai') {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const bestMove = getDifficultyAdjustedMove(game, difficulty);
        if (bestMove) {
          makeMove(bestMove);
        }
        setIsAiThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, isCheckmate, isDraw, view, gameMode, playerSide, difficulty]);

  // Victory Effects & Stat Recording
  useEffect(() => {
    if ((isCheckmate || isDraw) && !gameRecorded) {
      if (isCheckmate) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: [theme.primary.split('-')[1], '#ffffff']
        });
      }

      const result = isCheckmate ? (turn === 'w' ? 'loss' : 'win') : 'draw';
      recordGame(result, "Pro AI", gameMode, game.history().length);
      setGameRecorded(true);
    }
    
    if (!isCheckmate && !isDraw) {
      setGameRecorded(false);
    }
  }, [isCheckmate, isDraw, theme, turn, gameMode, gameRecorded, recordGame]);

  return (
    <div className={`min-h-screen ${theme.bg} text-zinc-100 flex flex-col transition-colors duration-500 overflow-hidden`}>
      {/* Header */}
      <header className="h-16 border-b border-white/5 glass-dark flex items-center justify-between px-8 z-20 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-lg shadow-lg">
            <Sword className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            CHESS <span className="text-zinc-500 font-light">PRO</span>
          </h1>
        </div>
        
        <nav className="flex items-center gap-6">
          <button 
            onClick={() => setView('home')} 
            className={`text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 ${view === 'home' ? 'text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
          >
            Home
          </button>
          <button 
            onClick={() => {
              if (gameMode === 'ai' && view === 'home') {
                setView('setup');
              } else {
                setView('game');
              }
            }} 
            className={`text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 ${view === 'game' || view === 'setup' ? 'text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
          >
            Play
          </button>
          <button 
            onClick={() => setView('stats')} 
            className={`transition-all hover:scale-110 ${view === 'stats' ? 'text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
          >
            <BarChart3 size={20} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="text-zinc-500 hover:text-white transition-all hover:scale-110"
          >
            <Settings size={20} />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-2" />
          
          <div className="flex items-center gap-3 bg-white/5 pl-2 pr-4 py-1.5 rounded-full border border-white/5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden">
              <User size={16} />
            </div>
            <span className="text-xs font-bold tracking-wider">GM_GUEST</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 overflow-auto"
            >
              <LandingPage />
            </motion.div>
          )}

          {view === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center p-8 overflow-auto"
            >
              <SetupScreen />
            </motion.div>
          )}

          {view === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="absolute inset-0 p-8 overflow-auto"
            >
              <StatsView />
            </motion.div>
          )}

          {view === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex gap-8 p-8 max-w-[1600px] mx-auto w-full overflow-hidden"
            >
              {/* Left Panel: Game Info & Analysis */}
              <aside className="w-80 flex flex-col gap-6 shrink-0">
                <div className="glass p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Info size={16} className="text-zinc-500" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Match Info</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500 uppercase">Format</span>
                      <span className="text-sm font-bold text-zinc-300">Standard 10 min</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500 uppercase">Opponent</span>
                      <span className="text-sm font-bold text-fuchsia-500">
                        {gameMode === 'ai' ? 'Pro AI' : 'Local Player'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500 uppercase">Status</span>
                      <span className={`text-sm font-bold ${isAiThinking ? 'text-cyan-400 animate-pulse' : 'text-zinc-300'}`}>
                        {isAiThinking ? 'AI Thinking...' : (isCheckmate ? 'Game Over' : 'Active')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <MoveHistory />
                </div>
              </aside>

              {/* Center: The Board */}
              <section className="flex-1 flex flex-col items-center justify-center min-w-0">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <ChessBoard />
                </div>
                
                {/* Captured Pieces Bar */}
                <div className="mt-8 w-full max-w-[600px] flex justify-between items-center px-6 py-3 glass rounded-xl border border-white/5 shrink-0">
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">White Captures</span>
                     <div className="flex gap-1">
                       {capturedPieces.b.map((p, i) => (
                         <img key={i} src={PIECE_IMAGES[`b${p}`]} className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" alt={p} />
                       ))}
                     </div>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex items-center gap-4">
                     <div className="flex gap-1">
                       {capturedPieces.w.map((p, i) => (
                         <img key={i} src={PIECE_IMAGES[`w${p}`]} className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" alt={p} />
                       ))}
                     </div>
                     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Black Captures</span>
                  </div>
                </div>
              </section>

              {/* Right Panel: Controls & Analysis */}
              <aside className="w-80 flex flex-col gap-6 shrink-0">
                <GameControls />
                
                <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                   <div className="flex items-center gap-2">
                      <BarChart3 size={16} className="text-zinc-500" />
                      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Position Evaluation</h2>
                   </div>
                   <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-white transition-all duration-700 ease-out" 
                        style={{ width: `${Math.min(Math.max(50 + (evaluation / 10), 5), 95)}%` }}
                      ></div>
                      <div className="flex-1 bg-zinc-700"></div>
                   </div>
                   <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                      <span>White {evaluation > 0 ? `+${(evaluation/100).toFixed(1)}` : (evaluation/100).toFixed(1)}</span>
                      <span>Black {evaluation < 0 ? `+${Math.abs(evaluation/100).toFixed(1)}` : (-(evaluation/100)).toFixed(1)}</span>
                   </div>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-8 glass-dark border-t border-white/5 flex items-center px-8 justify-between text-[10px] text-zinc-500 font-medium tracking-wider shrink-0 z-20">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> Server Online</span>
          <span>Latency: 14ms</span>
        </div>
        <div className="flex gap-6">
          <span>v1.0.4-stable</span>
          <span>© 2026 CHESS PRO ENGINE</span>
        </div>
      </footer>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
