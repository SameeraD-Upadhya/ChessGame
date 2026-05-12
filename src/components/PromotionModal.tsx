import React from 'react';
import { motion } from 'framer-motion';
import { PIECE_IMAGES } from '../store/pieceStore';

interface Props {
  color: 'w' | 'b';
  onSelect: (piece: string) => void;
}

export const PromotionModal: React.FC<Props> = ({ color, onSelect }) => {
  const pieces = [
    { type: 'q', name: 'Queen' },
    { type: 'r', name: 'Rook' },
    { type: 'b', name: 'Bishop' },
    { type: 'n', name: 'Knight' },
  ];

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass p-6 rounded-3xl border border-white/20 flex flex-col gap-4 items-center"
      >
        <h3 className="text-xl font-black tracking-tight text-white uppercase">Choose Promotion</h3>
        <div className="flex gap-4">
          {pieces.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className="w-16 h-16 glass-dark rounded-xl flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all border border-white/10"
            >
              <img 
                src={PIECE_IMAGES[`${color}${p.type}`]} 
                alt={p.name}
                className="w-4/5 h-4/5"
              />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
