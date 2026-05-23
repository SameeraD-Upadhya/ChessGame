import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChessBoard } from './components/ChessBoard';
import { GameControls } from './components/GameControls';
import { MoveHistory } from './components/MoveHistory';
import { useGameStore } from './store/gameStore';
import { useThemeStore, THEMES } from './store/themeStore';
import { getDifficultyAdjustedMove, evaluateBoard } from './lib/ai';
import { Sword, User, Settings, Info, BarChart3, Moon, Sun } from 'lucide-react';
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
import { TutorPanel } from './components/TutorPanel';

function App() {
  const { game, turn, fen, isCheckmate, isDraw, makeMove, capturedPieces } = useGameStore();
  const themeType = useThemeStore((state) => state.theme);
  const theme = THEMES[themeType];
  const { view, setView, gameMode, playerSide, username, setUsername, isDarkMode, toggleDarkMode } = useMainStore();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evaluation, setEvaluation] = useState(0);
  const recordGame = useStatsStore((state) => state.recordGame);
  const [gameRecorded, setGameRecorded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { difficulty } = useSettingsStore();

  // Trigger game events (sounds, etc.)
  useGameEvents();

  useEffect(() => {
    setEvaluation(evaluateBoard(game));
  }, [game, fen]);

  // AI Logic: If it's the AI's turn, make an AI move
  useEffect(() => {
    const aiColor = playerSide === 'w' ? 'b' : 'w';
    
    if (turn === aiColor && !isCheckmate && !isDraw && view === 'game' && (gameMode === 'ai' || gameMode === 'tutor')) {
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
          colors: [theme.light, '#ffffff']
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
    <div className={`h-[100dvh] ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-zinc-900'} flex flex-col transition-colors duration-500`}>
      {/* Header */}
      <header className={`h-14 border-b ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-zinc-200 bg-white/80'} backdrop-blur-xl flex items-center justify-between px-6 z-20 shrink-0`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-lg shadow-lg">
            <Sword className="text-white" size={18} />
          </div>
          <h1 className={`text-lg font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            CHESS <span className="text-zinc-400 font-light">PRO</span>
          </h1>
        </div>
        
        <nav className="flex items-center gap-4">
          <button 
            onClick={() => setView('home')} 
            className={`text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 ${view === 'home' ? 'text-cyan-400' : isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}
          >
            Home
          </button>
          <button 
            onClick={() => {
              if ((gameMode === 'ai' || gameMode === 'tutor') && view === 'home') {
                setView('setup');
              } else {
                setView('game');
              }
            }} 
            className={`text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 ${view === 'game' || view === 'setup' ? 'text-cyan-400' : isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}
          >
            Play
          </button>
          <button 
            onClick={() => setView('stats')} 
            className={`transition-all hover:scale-110 ${view === 'stats' ? 'text-cyan-400' : isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}
          >
            <BarChart3 size={18} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className={`transition-all hover:scale-110 ${isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}
          >
            <Settings size={18} />
          </button>
          <button 
            onClick={toggleDarkMode} 
            className={`transition-all hover:scale-110 ${isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className={`w-px h-5 ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'} mx-1`} />
          
          <div className={`flex items-center gap-2 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-zinc-100 border-zinc-200'} pl-2 pr-3 py-1 rounded-full border`}>
            <div className={`w-7 h-7 rounded-full ${isDarkMode ? 'bg-zinc-800 border-white/10' : 'bg-zinc-200 border-zinc-300'} flex items-center justify-center border overflow-hidden`}>
              <User size={14} className={isDarkMode ? 'text-white' : 'text-zinc-600'} />
            </div>
            {isEditingUsername ? (
              <input 
                autoFocus
                type="text" 
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                onBlur={() => { setUsername(tempUsername || 'Player'); setIsEditingUsername(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { setUsername(tempUsername || 'Player'); setIsEditingUsername(false); } }}
                className="bg-transparent text-xs font-bold tracking-wider outline-none w-20 text-inherit"
              />
            ) : (
              <span onClick={() => setIsEditingUsername(true)} className="text-xs font-bold tracking-wider cursor-pointer opacity-80 hover:opacity-100 transition-opacity">{username}</span>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative min-h-0">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 overflow-auto"
            >
              <LandingPage />
            </motion.div>
          )}

          {view === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center overflow-auto"
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
              transition={{ duration: 0.3 }}
              className="absolute inset-0 overflow-auto"
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
              transition={{ duration: 0.25 }}
              className="absolute inset-0 overflow-y-auto overflow-x-hidden"
            >
              <div className="flex gap-6 p-6 max-w-[1600px] mx-auto w-full min-h-full">
                {/* Left Panel: Game Info & Move History */}
                <aside className="w-72 flex flex-col gap-4 shrink-0 self-start sticky top-0">
                  <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Info size={14} className="text-zinc-500" />
                      <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Match Info</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] text-zinc-500 uppercase">Mode</span>
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          {gameMode === 'tutor' ? '📚 Tutor' : gameMode === 'ai' ? '🤖 vs AI' : '👥 PvP'}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] text-zinc-500 uppercase">Opponent</span>
                        <span className="text-xs font-bold text-fuchsia-500">
                          {gameMode === 'ai' ? 'Pro AI' : gameMode === 'tutor' ? 'Tutor AI' : 'Local Player'}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] text-zinc-500 uppercase">Status</span>
                        <span className={`text-xs font-bold ${isAiThinking ? 'text-cyan-400 animate-pulse' : isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          {isAiThinking ? 'AI Thinking...' : (isCheckmate ? 'Game Over' : isDraw ? 'Draw' : 'Active')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 max-h-[400px]">
                    <MoveHistory />
                  </div>
                </aside>

                {/* Center: The Board */}
                <section className="flex-1 flex flex-col items-center justify-start pt-2 min-w-0">
                  <div className="relative group w-full max-w-[560px]">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
                    <ChessBoard />
                  </div>
                  
                  {/* Captured Pieces Bar */}
                  <div className={`mt-4 w-full max-w-[560px] flex justify-between items-center px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">W</span>
                       <div className="flex gap-0.5">
                         {capturedPieces.b.map((p, i) => (
                           <img key={i} src={PIECE_IMAGES[`b${p}`]} className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" alt={p} />
                         ))}
                       </div>
                    </div>
                    <div className={`h-4 w-px ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />
                    <div className="flex items-center gap-3">
                       <div className="flex gap-0.5">
                         {capturedPieces.w.map((p, i) => (
                           <img key={i} src={PIECE_IMAGES[`w${p}`]} className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" alt={p} />
                         ))}
                       </div>
                       <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">B</span>
                    </div>
                  </div>
                </section>

                {/* Right Panel: Controls & Analysis */}
                <aside className="w-72 flex flex-col gap-4 shrink-0 self-start sticky top-0 max-h-[calc(100dvh-6rem)] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
                  <GameControls />
                  
                  {/* Position Evaluation */}
                  <div className={`p-5 rounded-2xl border flex flex-col gap-3 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
                     <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-zinc-500" />
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Evaluation</h2>
                     </div>
                     <div className={`h-2 w-full rounded-full overflow-hidden flex ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                        <div 
                          className={`h-full transition-all duration-700 ease-out ${isDarkMode ? 'bg-white' : 'bg-zinc-800'}`}
                          style={{ width: `${Math.min(Math.max(50 + (evaluation / 10), 5), 95)}%` }}
                        ></div>
                        <div className={`flex-1 ${isDarkMode ? 'bg-zinc-700' : 'bg-zinc-300'}`}></div>
                     </div>
                     <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
                        <span>W {evaluation > 0 ? `+${(evaluation/100).toFixed(1)}` : (evaluation/100).toFixed(1)}</span>
                        <span>B {evaluation < 0 ? `+${Math.abs(evaluation/100).toFixed(1)}` : (-(evaluation/100)).toFixed(1)}</span>
                     </div>
                  </div>

                  {/* Tutor Panel — replaces the simple static text */}
                  {gameMode === 'tutor' && (
                    <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200 shadow-sm'}`}>
                      <TutorPanel />
                    </div>
                  )}
                </aside>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Status Bar */}
      <footer className={`h-7 border-t flex items-center px-6 justify-between text-[9px] font-medium tracking-wider shrink-0 z-20 ${isDarkMode ? 'bg-black/40 border-white/5 text-zinc-500' : 'bg-white/80 border-zinc-200 text-zinc-400'} backdrop-blur-xl`}>
        <div className="flex gap-5">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" /> Online</span>
          <span>14ms</span>
        </div>
        <div className="flex gap-5">
          <span>v1.0.4</span>
          <span>© 2026 CHESS PRO</span>
        </div>
      </footer>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
