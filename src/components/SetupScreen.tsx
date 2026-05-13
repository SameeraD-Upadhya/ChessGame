import React, { useState } from 'react';
import { useMainStore } from '../store/mainStore';
import { useThemeStore, THEMES } from '../store/themeStore';
import { useGameStore } from '../store/gameStore';
import { Sword, Users, Brain, Shield, ChevronRight, ArrowLeft, Dices } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SetupScreen: React.FC = () => {
  const { view, setView, gameMode, setGameMode, setPlayerSide } = useMainStore();
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
    { id: 'w', name: 'Play as White', desc: 'Move first, command the attack', icon: '♔', color: 'from-zinc-100 to-zinc-400', textColor: 'text-zinc-900' },
    { id: 'b', name: 'Play as Black', desc: 'Counter-punch, master defense', icon: '♚', color: 'from-zinc-800 to-black', textColor: 'text-white' },
    { id: 'random', name: 'Random Side', desc: 'Let fate decide your color', icon: <Dices size={32} />, color: 'from-cyan-500 to-fuchsia-500', textColor: 'text-white' },
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black tracking-tight mb-4">SELECT GAME MODE</h2>
              <p className="text-zinc-500 max-w-lg mx-auto">Choose how you want to play. All modes follow strict FIDE rules with deterministic validation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {modes.map((mode, idx) => (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleModeSelect(mode.id)}
                  className="group relative h-80 glass rounded-3xl p-8 flex flex-col items-center justify-center gap-6 overflow-hidden border border-white/5 hover:border-white/20 transition-all"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  <div className={`p-5 rounded-2xl bg-gradient-to-br ${mode.color} shadow-lg shadow-black/40 transform group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                    <mode.icon size={40} className="text-white" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{mode.name}</h3>
                    <p className="text-sm text-zinc-500 px-4">{mode.desc}</p>
                  </div>

                  <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                    Continue <ChevronRight size={14} />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="side-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <div className="text-center mb-12 relative">
              <button 
                onClick={() => setStep('mode')}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-4xl font-black tracking-tight mb-4 uppercase">Choose Your Side</h2>
              <p className="text-zinc-500 max-w-lg mx-auto">Select which color you want to command against the Antigravity engine.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sides.map((side, idx) => (
                <motion.button
                  key={side.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleSideSelect(side.id)}
                  className="group relative h-80 glass rounded-3xl p-8 flex flex-col items-center justify-center gap-6 overflow-hidden border border-white/5 hover:border-white/20 transition-all"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${side.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${side.color} shadow-lg flex items-center justify-center text-4xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-black/40`}>
                    <span className={side.textColor}>{typeof side.icon === 'string' ? side.icon : side.icon}</span>
                  </div>

                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{side.name}</h3>
                    <p className="text-sm text-zinc-500 px-4">{side.desc}</p>
                  </div>

                  <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                    Start Match <ChevronRight size={14} />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
