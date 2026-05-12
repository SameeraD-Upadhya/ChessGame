import React from 'react';
import { useMainStore } from '../store/mainStore';
import { useThemeStore, THEMES } from '../store/themeStore';
import { Sword, Users, Brain, Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const SetupScreen: React.FC = () => {
  const { setView, setGameMode } = useMainStore();
  const theme = THEMES[useThemeStore().theme];

  const modes = [
    { id: 'ai', name: 'Player vs AI', icon: Brain, desc: 'Challenge our advanced engine', color: 'from-cyan-500 to-blue-500' },
    { id: 'pvp', name: 'Local PvP', icon: Users, desc: 'Play against a friend locally', color: 'from-fuchsia-500 to-purple-500' },
    { id: 'analysis', name: 'Analysis Mode', icon: Shield, desc: 'Free board for study', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl text-center mb-12"
      >
        <h2 className="text-4xl font-black tracking-tight mb-4">SELECT GAME MODE</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">Choose how you want to play. All modes follow strict FIDE rules with deterministic validation.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {modes.map((mode, idx) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => {
              setGameMode(mode.id as any);
              setView('game');
            }}
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
              Start Match <ChevronRight size={14} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
