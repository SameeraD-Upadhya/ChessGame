import React from 'react';
import { usePieceStore, PIECE_IMAGES } from '../store/pieceStore';
import type { PieceStyle } from '../store/pieceStore';
import { motion } from 'framer-motion';

interface Props {
  type: string;
  color: 'w' | 'b';
  isDragging?: boolean;
}


export const ChessPiece: React.FC<Props> = ({ type, color, isDragging }) => {
  const style = usePieceStore((state) => state.style);
  const pieceKey = `${color}${type}`;
  const src = PIECE_IMAGES[pieceKey];

  const getStyleClasses = () => {
    switch (style) {
      case 'neon':
        return color === 'w' 
          ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] brightness-125' 
          : 'drop-shadow-[0_0_8px_rgba(217,70,239,0.8)] brightness-125 filter hue-rotate-[280deg]';
      case 'cyberpunk':
        return 'contrast-150 saturate-200 brightness-110 drop-shadow-[2px_2px_0_rgba(0,255,255,0.5)]';
      case 'marble':
        return 'sepia-[0.3] contrast-90 brightness-105 drop-shadow-lg';
      case 'minimal':
        return 'grayscale brightness-110 contrast-125';
      case 'pixel':
        return 'pixelated scale-90';
      default:
        return 'drop-shadow-md';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`w-full h-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 scale-110' : ''}`}
    >
      <img 
        src={src} 
        alt={pieceKey} 
        className={`w-4/5 h-4/5 object-contain pointer-events-none transition-all duration-300 ${getStyleClasses()}`} 
      />
    </motion.div>
  );
};
