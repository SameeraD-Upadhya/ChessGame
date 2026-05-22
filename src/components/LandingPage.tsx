import React from 'react';
import { useMainStore } from '../store/mainStore';
import { motion } from 'framer-motion';
import { Sword, Users, Trophy, Play, Settings, BarChart3, ShieldCheck } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const LandingPage: React.FC = () => {
  const { setView, setGameMode } = useMainStore();

  const handleStartGame = (mode: 'ai' | 'pvp' | 'analysis') => {
    const { resetGame } = useGameStore.getState();
    setGameMode(mode);
    resetGame();
    
    if (mode === 'ai') {
      setView('setup');
    } else {
      setView('game');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 text-center px-4"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-xl">
          <ShieldCheck size={16} className="text-cyan-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Tournament Grade Engine v1.0</span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl">
          CHESS<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">PRO</span>
        </h1>
        
        <p className="max-w-xl mx-auto text-zinc-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
          The ultimate competitive chess simulator. Powered by advanced <span className="text-white">Alpha-Beta</span> engines and premium <span className="text-white">Esports</span> visuals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <MenuCard 
            icon={<Sword size={24} />}
            title="Single Player"
            description="Challenge the AI at Grandmaster level"
            onClick={() => handleStartGame('ai')}
            primary
          />
          <MenuCard 
            icon={<Users size={24} />}
            title="Local PvP"
            description="Play against a friend on the same device"
            onClick={() => handleStartGame('pvp')}
          />
          <MenuCard 
            icon={<BarChart3 size={24} />}
            title="Analysis"
            description="Study positions and review your moves"
            onClick={() => handleStartGame('analysis')}
          />
        </div>

        <div className="mt-12 flex items-center justify-center gap-8">
          <button onClick={() => setView('stats')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
            <Trophy size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Rankings</span>
          </button>
          <button onClick={() => setView('setup')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
            <Settings size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Custom Game</span>
          </button>
        </div>
      </motion.div>

      {/* Floating Chess Pieces Decoration */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-5">
         <p className="absolute top-20 left-40 text-9xl font-black">♘</p>
         <p className="absolute bottom-40 right-60 text-9xl font-black">♕</p>
         <p className="absolute top-60 right-20 text-9xl font-black">♖</p>
         <p className="absolute bottom-20 left-20 text-9xl font-black">♗</p>
      </div>
    </div>
  );
};

const MenuCard = ({ icon, title, description, onClick, primary }: any) => (
  <motion.button
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-8 rounded-3xl border text-left transition-all flex flex-col gap-4 group ${
      primary 
      ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 border-cyan-400 shadow-[0_20px_50px_rgba(6,182,212,0.3)]' 
      : 'bg-white/5 border-white/5 hover:bg-white/10'
    }`}
  >
    <div className={`p-3 rounded-2xl w-fit ${primary ? 'bg-white/20' : 'bg-zinc-800 group-hover:bg-zinc-700 transition-colors'}`}>
      {icon}
    </div>
    <div>
      <h3 className={`text-xl font-black tracking-tight ${primary ? 'text-white' : 'text-zinc-200'}`}>{title}</h3>
      <p className={`text-sm leading-snug ${primary ? 'text-cyan-100' : 'text-zinc-500'}`}>{description}</p>
    </div>
    <div className={`mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${primary ? 'text-white' : 'text-cyan-400'}`}>
      Play Now <Play size={12} fill="currentColor" />
    </div>
  </motion.button>
);
