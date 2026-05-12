import React from 'react';
import { useStatsStore } from '../store/statsStore';
import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp, History, User, Hash } from 'lucide-react';

export const StatsView: React.FC = () => {
  const { rating, gamesPlayed, wins, losses, draws, history } = useStatsStore();

  const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-4xl mx-auto p-8 pt-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {/* Rating Card */}
        <div className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-cyan-500/10 to-transparent flex flex-col items-center justify-center">
          <div className="p-4 bg-cyan-500/20 rounded-2xl mb-4">
            <Trophy className="text-cyan-400" size={32} />
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Rating</p>
          <h2 className="text-5xl font-black tracking-tighter text-white">{rating}</h2>
          <p className="text-[10px] text-cyan-500 font-bold mt-2 uppercase">Global Rank: #1,240</p>
        </div>

        {/* Win Rate Card */}
        <div className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-fuchsia-500/10 to-transparent flex flex-col items-center justify-center">
          <div className="p-4 bg-fuchsia-500/20 rounded-2xl mb-4">
            <Target className="text-fuchsia-400" size={32} />
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Win Rate</p>
          <h2 className="text-5xl font-black tracking-tighter text-white">{winRate}%</h2>
          <p className="text-[10px] text-fuchsia-500 font-bold mt-2 uppercase">{wins} Wins / {gamesPlayed} Games</p>
        </div>

        {/* Trends Card */}
        <div className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent flex flex-col items-center justify-center">
          <div className="p-4 bg-emerald-500/20 rounded-2xl mb-4">
            <TrendingUp className="text-emerald-400" size={32} />
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Consistency</p>
          <h2 className="text-5xl font-black tracking-tighter text-white">A+</h2>
          <p className="text-[10px] text-emerald-500 font-bold mt-2 uppercase">Top 5% of Players</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Games */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl border border-white/5 overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <History className="text-zinc-400" size={20} />
              <h3 className="font-bold tracking-tight">Recent Games</h3>
            </div>
          </div>
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-12 text-center text-zinc-600">
                <p>No games recorded yet</p>
              </div>
            ) : (
              history.map((game) => (
                <div key={game.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      game.result === 'win' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                      game.result === 'loss' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-zinc-500'
                    }`} />
                    <div>
                      <p className="text-sm font-bold text-zinc-200">vs {game.opponent}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{new Date(game.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black uppercase ${
                      game.result === 'win' ? 'text-emerald-400' : 
                      game.result === 'loss' ? 'text-red-400' : 'text-zinc-400'
                    }`}>{game.result}</p>
                    <p className="text-[10px] text-zinc-500">{game.moves} moves</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Detailed Stats */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl border border-white/5 p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <User className="text-zinc-400" size={20} />
            <h3 className="font-bold tracking-tight">Player Profile</h3>
          </div>
          
          <div className="space-y-6">
            <StatRow label="Games Played" value={gamesPlayed} icon={<Hash size={14} />} />
            <StatRow label="Victories" value={wins} color="text-emerald-400" />
            <StatRow label="Defeats" value={losses} color="text-red-400" />
            <StatRow label="Draws" value={draws} color="text-zinc-400" />
            
            <div className="pt-6 border-t border-white/5">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">ELO Progress</p>
              <div className="h-24 flex items-end gap-1">
                {[40, 60, 45, 70, 85, 65, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-cyan-500/20 rounded-t-sm hover:bg-cyan-500/40 transition-colors" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, color = "text-zinc-300", icon }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {icon && <span className="text-zinc-600">{icon}</span>}
      <span className="text-sm text-zinc-500">{label}</span>
    </div>
    <span className={`text-lg font-black ${color}`}>{value}</span>
  </div>
);
