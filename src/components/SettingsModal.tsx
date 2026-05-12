import React from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Zap, ZapOff, Map, Eye, EyeOff, Crown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const settings = useSettingsStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md glass rounded-3xl border border-white/10 p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <h2 className="text-2xl font-black tracking-tight mb-8">System Settings</h2>

            <div className="space-y-6">
              <SettingToggle 
                label="Sound Effects" 
                description="Play sounds for moves, captures, and checks"
                active={settings.soundEnabled} 
                onToggle={settings.toggleSound}
                icon={settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              />
              
              <SettingToggle 
                label="Animations" 
                description="Enable smooth transitions and piece movement"
                active={settings.animationsEnabled} 
                onToggle={settings.toggleAnimations}
                icon={settings.animationsEnabled ? <Zap size={20} /> : <ZapOff size={20} />}
              />

              <SettingToggle 
                label="Coordinates" 
                description="Show algebraic coordinates (A-H, 1-8) on board"
                active={settings.showCoordinates} 
                onToggle={settings.toggleCoordinates}
                icon={<Map size={20} />}
              />

              <SettingToggle 
                label="Legal Move Highlights" 
                description="Show possible moves when selecting a piece"
                active={settings.highlightLegalMoves} 
                onToggle={settings.toggleHighlight}
                icon={settings.highlightLegalMoves ? <Eye size={20} /> : <EyeOff size={20} />}
              />

              <SettingToggle 
                label="Auto-Promote to Queen" 
                description="Skip selection and always promote pawns to queens"
                active={settings.autoPromoteToQueen} 
                onToggle={settings.toggleAutoPromote}
                icon={<Crown size={20} />}
              />
            </div>

            <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              <span>Cloud Sync</span>
              <span className="text-emerald-500">Connected</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SettingToggle = ({ label, description, active, onToggle, icon }: any) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl transition-colors ${active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-500'}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{label}</h4>
        <p className="text-[10px] text-zinc-500 font-medium">{description}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${active ? 'bg-cyan-500' : 'bg-zinc-800'}`}
    >
      <motion.div
        animate={{ x: active ? 26 : 2 }}
        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
      />
    </button>
  </div>
);
