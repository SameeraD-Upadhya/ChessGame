import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useThemeStore, THEMES } from '../store/themeStore';
import { Square } from './Square';
import type { Square as ChessSquare } from 'chess.js';
import { PromotionModal } from './PromotionModal';
import { useSettingsStore } from '../store/settingsStore';
import { useMainStore } from '../store/mainStore';

export const ChessBoard: React.FC = () => {
  const { game, fen, lastMove, isCheck, makeMove, suggestedMove } = useGameStore();
  const { playerSide } = useMainStore();
  const themeType = useThemeStore((state) => state.theme);
  const theme = THEMES[themeType];
  const { autoPromoteToQueen } = useSettingsStore();

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);
  const [kbSquare, setKbSquare] = useState<string>('e2');

  // Reset selection on FEN change (new move made)
  useEffect(() => {
    setSelectedSquare(null);
    setPossibleMoves([]);
    setPendingPromotion(null);
  }, [fen]);

  // Define onSquareClick with useCallback BEFORE the useEffect that depends on it
  const onSquareClick = useCallback((square: string) => {
    const piece = game.get(square as ChessSquare);
    const isPlayerPiece = piece && piece.color === game.turn();

    if (isPlayerPiece) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else {
        setSelectedSquare(square);
        const moves = game.moves({ square: square as ChessSquare, verbose: true });
        setPossibleMoves(moves.map(m => m.to));
      }
    } else if (selectedSquare) {
      // Check for promotion
      const pieceToMove = game.get(selectedSquare as ChessSquare);
      const isPawn = pieceToMove?.type === 'p';
      const isPromotionRank = (pieceToMove?.color === 'w' && square[1] === '8') ||
                              (pieceToMove?.color === 'b' && square[1] === '1');

      const moves = game.moves({ square: selectedSquare as ChessSquare, verbose: true });
      const isLegal = moves.some(m => m.to === square);

      if (isPawn && isPromotionRank && isLegal) {
        if (autoPromoteToQueen) {
          makeMove({ from: selectedSquare, to: square, promotion: 'q' });
        } else {
          setPendingPromotion({ from: selectedSquare, to: square });
        }
        return;
      }

      const moveResult = makeMove({ from: selectedSquare, to: square, promotion: 'q' });

      if (!moveResult) {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  }, [game, selectedSquare, autoPromoteToQueen, makeMove]);

  // Keyboard Navigation — depends on onSquareClick, so defined AFTER it
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const currentFileIdx = files.indexOf(kbSquare[0]);
      const currentRank = parseInt(kbSquare[1]);

      let newFileIdx = currentFileIdx;
      let newRank = currentRank;

      switch (e.key) {
        case 'ArrowUp':    newRank    = Math.min(8, currentRank + 1); break;
        case 'ArrowDown':  newRank    = Math.max(1, currentRank - 1); break;
        case 'ArrowLeft':  newFileIdx = Math.max(0, currentFileIdx - 1); break;
        case 'ArrowRight': newFileIdx = Math.min(7, currentFileIdx + 1); break;
        case 'Enter':
        case ' ':
          onSquareClick(kbSquare);
          break;
        default: return;
      }

      setKbSquare(`${files[newFileIdx]}${newRank}`);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [kbSquare, onSquareClick]);

  const handlePromotion = (piece: string) => {
    if (pendingPromotion) {
      makeMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: piece });
      setPendingPromotion(null);
    }
  };

  const renderBoard = () => {
    const board = [];
    const files = playerSide === 'b' ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = playerSide === 'b' ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];

    for (const rank of ranks) {
      for (const file of files) {
        const square = `${file}${rank}`;
        const piece = game.get(square as ChessSquare);
        const isLight = (files.indexOf(file) + ranks.indexOf(rank)) % 2 === (playerSide === 'b' ? 1 : 0);

        const isLastMove = lastMove ? (lastMove.from === square || lastMove.to === square) : false;
        const isCheckSquare = isCheck && piece?.type === 'k' && piece?.color === game.turn();
        
        const isSuggested = suggestedMove ? (suggestedMove.from === square || suggestedMove.to === square) : false;

        board.push(
          <Square
            key={square}
            square={square}
            piece={piece}
            isLight={isLight}
            isLastMove={isLastMove}
            isCheck={isCheckSquare}
            isPossibleMove={possibleMoves.includes(square)}
            isSelected={selectedSquare === square}
            isFocused={kbSquare === square}
            isSuggested={isSuggested}
            suggestionExplanation={isSuggested && suggestedMove?.to === square ? suggestedMove.explanation : undefined}
            onClick={() => {
              setKbSquare(square);
              onSquareClick(square);
            }}
            theme={theme}
          />
        );
      }
    }
    return board;
  };

  return (
    <div className="relative aspect-square w-full max-w-[600px] mx-auto shadow-2xl rounded-lg overflow-hidden border-4 border-white/10 ring-8 ring-black/20">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {renderBoard()}
      </div>

      {pendingPromotion && (
        <PromotionModal
          color={game.turn()}
          onSelect={handlePromotion}
        />
      )}
    </div>
  );
};
