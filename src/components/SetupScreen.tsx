import React, { useState } from 'react';
import { useMainStore } from '../store/mainStore';
import { useThemeStore, THEMES } from '../store/themeStore';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { Sword, Users, Brain, Shield, ChevronRight, ArrowLeft, Dices, Zap, Target, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SetupScreen: React.FC = () => {
  const { view, setView, gameMode, setGameMode, setPlayerSide } = useMainStore();
  const { difficulty, setDifficulty } = useSettingsStore();
  const theme = THEMES[useThemeStore().theme];
  const [step, setStep] = useState<'mode' | 'side'>(gameMode === 'ai' ? 'side' : 'mode');

  // Ensure side step if coming from landing page with AI selected
  React.useEffect(() => {
    if (gameMode === 'ai') {
      setStep('side');
    }
  }, [gameMode]);

  const modes = [
    { id: 'ai', name: 'Player vs AI', icon: Brain, desc: 'Challenge our advanced engine', color: 'from-cyan-500 to-blue-500' },
    { id: 'pvp', name: 'Local PvP', icon: Users, desc: 'Play against a friend locally', color: 'from-fuchsia-500 to-purple-500' },
    { id: 'analysis', name: 'Analysis Mode', icon: Shield, desc: 'Free board for study', color: 'from-emerald-500 to-teal-500' },
  ];

  const sides = [
    { id: 'w', name: 'White', desc: 'Command the first move', icon: '♔', color: 'from-zinc-100 to-zinc-400', textColor: 'text-zinc-900' },
    { id: 'b', name: 'Black', desc: 'Master the counter-attack', icon: '♚', color: 'from-zinc-800 to-black', textColor: 'text-white' },
    { id: 'random', name: 'Random', desc: 'Let fate decide color', icon: <Dices size={32} />, color: 'from-cyan-500 to-fuchsia-500', textColor: 'text-white' },
  ];

  const difficulties = [
    { id: 'easy', name: 'Novice', icon: Zap, desc: 'Casual training' },
    { id: 'medium', name: 'Intermediate', icon: Target, desc: 'Serious challenge' },
    { id: 'hard', name: 'Grandmaster', icon: Trophy, desc: 'Elite engine logic' },
  ];

  const handleModeSelect = (modeId: string) => {
    setGameMode(modeId as any);
    if (modeId === 'ai') {
      setStep('side');
    } else {
      setView('game');
    }
  };

  const handleSideSelect = (side: string) => {
    const { resetGame } = useGameStore.getState();
    resetGame();
    
    if (side === 'random') {
      setPlayerSide(Math.random() > 0.5 ? 'w' : 'b');
    } else {
      setPlayerSide(side as any);
    }
    
    setView('game');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 w-full max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'mode' ? (
          <motion.div 
            key="mode-step"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black tracking-tight mb-4 uppercase">Select Game Mode</h2>
              <p className="text-zinc-500 max-w-lg mx-auto font-medium">Choose your battlefield. All matches follow official FIDE regulations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {modes.map((mode, idx) => (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleModeSelect(mode.id)}
                  className="group relative h-80 glass rounded-3xl p-8 flex flex-col items-center justify-center gap-6 overflow-hidden border border-white/5 hover:border-white/20 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className={`p-5 rounded-2xl bg-gradient-to-br ${mode.color} shadow-lg shadow-black/40 transform group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                    <mode.icon size={40} className="text-white" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{mode.name}</h3>
                    <p className="text-sm text-zinc-500 px-4 font-medium">{mode.desc}</p>
                  </div>

                  <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                    CONTINUE <ChevronRight size={14} />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="side-step"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-4xl"
          >
            <div className="text-center mb-12 relative">
              <button 
                onClick={() => setStep('mode')}
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <h2 className="text-4xl font-black tracking-tight mb-4 uppercase">Configure AI Match</h2>
              <p className="text-zinc-500 font-medium">Select your color and the CHESS PRO engine difficulty to begin.</p>
            </div>

            <div className="space-y-12">
              {/* Difficulty Selection */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 text-center">Engine Difficulty</h3>
                <div className="grid grid-cols-3 gap-4">
                  {difficulties.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id as any)}
                      className={`relative p-6 rounded-2xl border transition-all text-left group overflow-hidden ${
                        difficulty === d.id 
                        ? 'bg-white/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {difficulty === d.id && (
                        <motion.div layoutId="active-difficulty" className="absolute inset-0 bg-cyan-500/10" />
                      )}
                      <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className={`p-2 rounded-lg ${difficulty === d.id ? 'bg-cyan-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                          <d.icon size={16} />
                        </div>
                        <span className={`font-bold ${difficulty === d.id ? 'text-white' : 'text-zinc-400'}`}>{d.name}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-medium relative z-10">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Side Selection */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 text-center">Your Side</h3>
                <div className="grid grid-cols-3 gap-6">
                  {sides.map((side, idx) => (
                    <motion.button
                      key={side.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleSideSelect(side.id)}
                      className="group relative h-64 glass rounded-3xl p-8 flex flex-col items-center justify-center gap-4 overflow-hidden border border-white/5 hover:border-white/20 transition-all"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${side.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${side.color} shadow-lg flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-black/40`}>
                        <span className={side.textColor}>{typeof side.icon === 'string' ? side.icon : side.icon}</span>
                      </div>

                      <div className="text-center">
                        <h4 className="text-xl font-bold mb-1">{side.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">{side.desc}</p>
                      </div>

                      <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                        START <ChevronRight size={14} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
