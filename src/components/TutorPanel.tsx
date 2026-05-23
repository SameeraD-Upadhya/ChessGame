import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { evaluateBoard, getSuggestedMove } from '../lib/ai';
import { useSettingsStore } from '../store/settingsStore';
import { Lightbulb, BookOpen, Target, Shield, AlertTriangle, Trophy, TrendingUp, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Chess Knowledge Base ---

const OPENING_BOOK: Record<string, { name: string; idea: string }> = {
  'e4': { name: "King's Pawn Opening", idea: 'Controls the center and opens lines for the bishop and queen.' },
  'd4': { name: "Queen's Pawn Opening", idea: 'Controls the center solidly. Leads to more strategic, closed games.' },
  'Nf3': { name: 'Réti Opening', idea: 'A flexible opening that delays committing to a pawn structure.' },
  'c4': { name: 'English Opening', idea: 'A flank opening that controls d5 from the side.' },
  'e4 e5': { name: 'Open Game', idea: 'Both sides fight for the center equally. Sharp play ahead!' },
  'e4 e5 Nf3': { name: 'King\'s Knight', idea: 'Developing a piece while attacking the e5 pawn. Classical play.' },
  'e4 e5 Nf3 Nc6': { name: 'Four Knights Preparation', idea: 'Black defends e5 and develops. The most natural reply.' },
  'e4 c5': { name: 'Sicilian Defense', idea: 'An asymmetric defense that fights for the center indirectly.' },
  'e4 e6': { name: 'French Defense', idea: 'A solid defense. Black will challenge e4 with d5 next.' },
  'd4 d5': { name: 'Closed Game', idea: 'A solid and strategic center. The game will be positional.' },
  'd4 Nf6': { name: 'Indian Defense', idea: 'Black keeps options flexible before committing pawns.' },
};

interface PieceCount {
  p: number; n: number; b: number; r: number; q: number;
}

function getPhase(history: string[]): 'opening' | 'middlegame' | 'endgame' {
  if (history.length <= 10) return 'opening';
  if (history.length <= 30) return 'middlegame';
  return 'endgame';
}

function getOpeningName(history: string[]): string | null {
  // Check from longest match to shortest
  for (let len = Math.min(history.length, 6); len >= 1; len--) {
    const key = history.slice(0, len).join(' ');
    if (OPENING_BOOK[key]) return OPENING_BOOK[key].name;
  }
  return null;
}

function getOpeningIdea(history: string[]): string | null {
  for (let len = Math.min(history.length, 6); len >= 1; len--) {
    const key = history.slice(0, len).join(' ');
    if (OPENING_BOOK[key]) return OPENING_BOOK[key].idea;
  }
  return null;
}

function analyzeLastMove(history: string[]): string {
  if (history.length === 0) return 'Make your first move! Try controlling the center with e4 or d4.';
  const last = history[history.length - 1];
  
  if (last.includes('#')) return '♚ Checkmate! The game is over.';
  if (last.includes('+')) return '♚ Check! The opponent\'s king is under attack and must respond.';
  if (last.includes('x')) {
    const captured = last.match(/x([a-h]\d)/);
    return `⚔️ A piece was captured${captured ? ` on ${captured[1]}` : ''}. Always check if a capture is worth it — count the material value!`;
  }
  if (last === 'O-O' || last === 'O-O-O') {
    return '🏰 Castling! This protects the king and activates the rook. Well played!';
  }
  if (last.includes('=')) {
    return '👑 Pawn promotion! A pawn reached the end of the board and became a stronger piece.';
  }
  
  // Piece-specific tips
  if (last.startsWith('N')) return '♞ Knight move. Knights are great in the center where they control up to 8 squares.';
  if (last.startsWith('B')) return '♝ Bishop move. Bishops are strong on long diagonals — try to keep them active!';
  if (last.startsWith('R')) return '♜ Rook move. Rooks love open files and the 7th rank. Look for those!';
  if (last.startsWith('Q')) return '♛ Queen move. The queen is powerful but avoid bringing her out too early!';
  if (last.startsWith('K')) return '♔ King move. Keep your king safe in the opening and middlegame.';
  
  // Pawn move
  return '♟️ Pawn move. Pawns form the skeleton of your position — each move changes the structure permanently.';
}

function getPhaseAdvice(phase: 'opening' | 'middlegame' | 'endgame'): string {
  switch (phase) {
    case 'opening':
      return 'Opening phase: Focus on developing pieces, controlling the center (e4/d4/e5/d5), and castling early to protect your king.';
    case 'middlegame':
      return 'Middlegame: Look for tactical opportunities — forks, pins, skewers. Coordinate your pieces and create threats.';
    case 'endgame':
      return 'Endgame: Activate your king! Push passed pawns and simplify when you have material advantage.';
  }
}

function getPositionTip(evaluation: number, playerColor: 'w' | 'b'): { text: string; level: 'good' | 'neutral' | 'warning' | 'danger' } {
  const adjustedEval = playerColor === 'w' ? evaluation : -evaluation;
  
  if (adjustedEval > 300) return { text: 'You have a strong advantage! Look for ways to convert it into a win.', level: 'good' };
  if (adjustedEval > 100) return { text: 'You\'re slightly ahead. Keep up the pressure and avoid blunders.', level: 'good' };
  if (adjustedEval > -100) return { text: 'The position is roughly equal. Play accurately and look for small improvements.', level: 'neutral' };
  if (adjustedEval > -300) return { text: 'You\'re slightly behind. Look for tactical chances to equalize.', level: 'warning' };
  return { text: 'Difficult position. Try to create complications — it\'s your best chance to turn things around.', level: 'danger' };
}

function getConceptForMoveNumber(moveNumber: number): string | null {
  const concepts: Record<number, string> = {
    1: '💡 Tip: The best first moves control the center. Try e4 or d4!',
    2: '💡 Tip: Develop your knights before bishops. They have fewer good squares.',
    3: '💡 Tip: Don\'t move the same piece twice in the opening unless forced.',
    5: '💡 Tip: Try to castle within the first 10 moves to keep your king safe.',
    7: '💡 Tip: Connect your rooks by developing all minor pieces and castling.',
    10: '💡 Tip: In the middlegame, every move should either improve a piece or create a threat.',
    15: '💡 Tip: Look for pawn breaks to open lines for your pieces.',
    20: '💡 Tip: Think about your pawn structure — avoid isolated and doubled pawns.',
    25: '💡 Tip: In the endgame, the king becomes a fighting piece. Bring it to the center!',
  };
  return concepts[moveNumber] || null;
}

// --- Component ---

export const TutorPanel: React.FC = () => {
  const { game, history, fen, turn, isCheckmate, isDraw } = useGameStore();
  const { difficulty } = useSettingsStore();
  const [autoHint, setAutoHint] = useState<{ from: string; to: string; explanation: string } | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  
  const evaluation = useMemo(() => evaluateBoard(game), [game, fen]);
  const phase = useMemo(() => getPhase(history), [history]);
  const openingName = useMemo(() => getOpeningName(history), [history]);
  const openingIdea = useMemo(() => getOpeningIdea(history), [history]);
  const lastMoveAnalysis = useMemo(() => analyzeLastMove(history), [history]);
  const playerColor = 'w'; // Tutor always helps from the player's perspective
  const positionTip = useMemo(() => getPositionTip(evaluation, playerColor), [evaluation, playerColor]);
  const moveNumber = Math.floor(history.length / 2) + 1;
  const concept = useMemo(() => getConceptForMoveNumber(moveNumber), [moveNumber]);

  // Auto-generate a hint for the player when it's their turn
  useEffect(() => {
    if (turn === playerColor && !isCheckmate && !isDraw && history.length > 0) {
      // Small delay to not block the render
      const timer = setTimeout(() => {
        const hint = getSuggestedMove(game, difficulty);
        setAutoHint(hint);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAutoHint(null);
    }
  }, [turn, fen, isCheckmate, isDraw]);

  const levelColor = {
    good: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    neutral: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
    warning: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
    danger: 'text-red-400 border-red-500/30 bg-red-500/5',
  };

  const levelIcon = {
    good: <TrendingUp size={14} />,
    neutral: <Target size={14} />,
    warning: <AlertTriangle size={14} />,
    danger: <Shield size={14} />,
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-500 flex items-center gap-2">
          <Lightbulb size={14} /> Chess Tutor
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Game Phase Badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
          phase === 'opening' ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' :
          phase === 'middlegame' ? 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10' :
          'text-amber-400 border-amber-500/30 bg-amber-500/10'
        }`}>
          {phase}
        </span>
        {openingName && (
          <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
            <BookOpen size={10} /> {openingName}
          </span>
        )}
        <span className="text-[10px] font-mono text-zinc-600">Move {moveNumber}</span>
      </div>

      {/* Position Assessment */}
      <div className={`p-3 rounded-xl border ${levelColor[positionTip.level]} flex items-start gap-2`}>
        <span className="mt-0.5 shrink-0">{levelIcon[positionTip.level]}</span>
        <p className="text-xs leading-relaxed">{positionTip.text}</p>
      </div>

      <AnimatePresence mode="wait">
        {showDetails && (
          <motion.div
            key="details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            {/* Last Move Analysis */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Last Move</p>
              <p className="text-xs text-zinc-300 leading-relaxed">{lastMoveAnalysis}</p>
            </div>

            {/* Opening Idea */}
            {openingIdea && phase === 'opening' && (
              <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <BookOpen size={10} /> Opening Strategy
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">{openingIdea}</p>
              </div>
            )}

            {/* Phase Advice */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Phase Guidance</p>
              <p className="text-xs text-zinc-300 leading-relaxed">{getPhaseAdvice(phase)}</p>
            </div>

            {/* Concept of the Move */}
            {concept && (
              <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <p className="text-xs text-yellow-300 leading-relaxed">{concept}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-Hint: Best Move Suggestion */}
      <AnimatePresence>
        {autoHint && turn === playerColor && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Zap size={10} /> Suggested Move
              </span>
              <span className="text-xs font-mono font-bold text-white">{autoHint.from} → {autoHint.to}</span>
            </div>
            <p className="text-[11px] text-zinc-300 italic leading-relaxed">"{autoHint.explanation}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over State */}
      {(isCheckmate || isDraw) && (
        <div className="p-4 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 text-center">
          <Trophy size={20} className="text-fuchsia-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-fuchsia-400">
            {isCheckmate ? 'Checkmate!' : 'Draw!'}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">
            {isCheckmate 
              ? 'Review your moves in the history panel to learn from this game.'
              : 'The game ended in a draw. Study the position to understand why.'}
          </p>
        </div>
      )}
    </div>
  );
};
