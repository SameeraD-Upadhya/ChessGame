import React from 'react';
import { usePieceStore, PIECE_IMAGES } from '../store/pieceStore';
import { motion } from 'framer-motion';

interface Props {
  type: string;
  color: 'w' | 'b';
  isDragging?: boolean;
}


export const ChessPiece: React.FC<Props> = ({ type, color, isDragging }) => {
  const pawnTexture = usePieceStore((state) => state.pawnTexture);
  const pieceKey = `${color}${type}`;
  const src = PIECE_IMAGES[pieceKey];

  const getStyleClasses = () => {
    if (type === 'p') {
      switch (pawnTexture) {
        case 'textured1':
          return 'sepia-[0.5] hue-rotate-15 contrast-125 drop-shadow-lg';
        case 'textured2':
          return 'saturate-[0.2] brightness-75 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]';
        case 'textured3':
          return 'hue-rotate-180 brightness-110 contrast-150 drop-shadow-md';
        default:
          return 'drop-shadow-md';
      }
    }
    return 'drop-shadow-md';
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
