import React from 'react';
import { ChessPiece } from './ChessPiece';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../store/settingsStore';

interface Props {
  square: string;
  piece: { type: string; color: 'w' | 'b' } | null;
  isLight: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  isPossibleMove: boolean;
  isSelected: boolean;
  isFocused: boolean;
  onClick: () => void;
  theme: { light: string; dark: string };
}

export const Square: React.FC<Props> = ({ 
  square, 
  piece, 
  isLight, 
  isLastMove, 
  isCheck, 
  isPossibleMove,
  isSelected,
  isFocused,
  onClick,
  theme
}) => {
  const { showCoordinates, highlightLegalMoves } = useSettingsStore();
  const bgColor = isLight ? theme.light : theme.dark;
  
  return (
    <div 
      onClick={onClick}
      className="relative w-full aspect-square flex items-center justify-center cursor-pointer overflow-hidden group"
      style={{ backgroundColor: bgColor }}
    >
      {/* Last Move Highlight */}
      {isLastMove && (
        <div className="absolute inset-0 bg-yellow-400/30" />
      )}

      {/* Selected Highlight */}
      {isSelected && (
        <div className="absolute inset-0 bg-cyan-400/40 ring-2 ring-cyan-400 ring-inset" />
      )}

      {/* Focus Ring (Keyboard) */}
      {isFocused && (
        <div className="absolute inset-0 border-4 border-fuchsia-400/50 z-20 pointer-events-none" />
      )}

      {/* Check Highlight */}
      {isCheck && (
        <div className="absolute inset-0 bg-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.8)]" />
      )}

      {/* Piece */}
      <AnimatePresence mode="popLayout">
        {piece && (
          <ChessPiece 
            key={`${square}-${piece.color}${piece.type}`} 
            type={piece.type} 
            color={piece.color} 
          />
        )}
      </AnimatePresence>

      {/* Possible Move Indicator */}
      {isPossibleMove && highlightLegalMoves && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute w-1/3 h-1/3 rounded-full ${piece ? 'border-4 border-black/10' : 'bg-black/10'}`} 
        />
      )}

      {/* Coordinates */}
      {showCoordinates && square.endsWith('1') && (
        <span className={`absolute bottom-0.5 right-0.5 text-[8px] font-bold uppercase select-none ${isLight ? 'text-zinc-500' : 'text-zinc-300'}`}>
          {square[0]}
        </span>
      )}
      {showCoordinates && square.startsWith('a') && (
        <span className={`absolute top-0.5 left-0.5 text-[8px] font-bold uppercase select-none ${isLight ? 'text-zinc-500' : 'text-zinc-300'}`}>
          {square[1]}
        </span>
      )}
    </div>
  );
};
