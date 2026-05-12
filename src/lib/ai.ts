import { Chess } from 'chess.js';

// Piece Values
const PAWN_VALUE = 100;
const KNIGHT_VALUE = 320;
const BISHOP_VALUE = 330;
const ROOK_VALUE = 500;
const QUEEN_VALUE = 900;
const KING_VALUE = 20000;

// Piece-Square Tables (PST)
// These tables represent the value of a piece at a specific square.
// Values are from white's perspective. For black, the table is flipped.

const PAWN_PST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_PST = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_PST = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
];

const getPieceValue = (piece: { type: string; color: string }, x: number, y: number): number => {
    const isWhite = piece.color === 'w';
    let value = 0;
    
    // Flip index for black
    const row = isWhite ? x : 7 - x;
    const col = y;

    switch (piece.type) {
        case 'p': value = PAWN_VALUE + PAWN_PST[row][col]; break;
        case 'n': value = KNIGHT_VALUE + KNIGHT_PST[row][col]; break;
        case 'b': value = BISHOP_VALUE + BISHOP_PST[row][col]; break;
        case 'r': value = ROOK_VALUE + ROOK_PST[row][col]; break;
        case 'q': value = QUEEN_VALUE + QUEEN_PST[row][col]; break;
        case 'k': value = KING_VALUE + KING_PST[row][col]; break;
    }

    return isWhite ? value : -value;
};

export const evaluateBoard = (game: Chess): number => {
    let totalEvaluation = 0;
    const board = game.board();

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                totalEvaluation += getPieceValue(piece, i, j);
            }
        }
    }
    return totalEvaluation;
};

export const minimax = (
    game: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizingPlayer: boolean
): number => {
    if (depth === 0) return evaluateBoard(game);

    const moves = game.moves();
    
    // Termination cases
    if (moves.length === 0) {
        if (game.isCheckmate()) {
            return isMaximizingPlayer ? -Infinity : Infinity;
        }
        return 0; // Draw
    }

    if (isMaximizingPlayer) {
        let bestEval = -Infinity;
        for (const move of moves) {
            game.move(move);
            bestEval = Math.max(bestEval, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestEval);
            if (beta <= alpha) break;
        }
        return bestEval;
    } else {
        let bestEval = Infinity;
        for (const move of moves) {
            game.move(move);
            bestEval = Math.min(bestEval, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
            game.undo();
            beta = Math.min(beta, bestEval);
            if (beta <= alpha) break;
        }
        return bestEval;
    }
};

export const findBestMove = (game: Chess, depth: number): string | null => {
    const moves = game.moves();
    if (moves.length === 0) return null;

    const isWhite = game.turn() === 'w';
    let bestMove = null;
    let bestValue = isWhite ? -Infinity : Infinity;

    // Randomize equal moves to prevent repetitive play
    const scoredMoves = moves.map(move => {
        game.move(move);
        const value = minimax(game, depth - 1, -Infinity, Infinity, !isWhite);
        game.undo();
        return { move, value };
    });

    if (isWhite) {
        scoredMoves.sort((a, b) => b.value - a.value);
        bestMove = scoredMoves[0].move;
    } else {
        scoredMoves.sort((a, b) => a.value - b.value);
        bestMove = scoredMoves[0].move;
    }

    return bestMove;
};
