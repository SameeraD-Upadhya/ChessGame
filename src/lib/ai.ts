import { Chess } from 'chess.js';

// Piece Values
const PIECE_VALUES: Record<string, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
};

// Piece-Square Tables (PST)
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
        case 'p': value = PIECE_VALUES.p + PAWN_PST[row][col]; break;
        case 'n': value = PIECE_VALUES.n + KNIGHT_PST[row][col]; break;
        case 'b': value = PIECE_VALUES.b + BISHOP_PST[row][col]; break;
        case 'r': value = PIECE_VALUES.r + ROOK_PST[row][col]; break;
        case 'q': value = PIECE_VALUES.q + QUEEN_PST[row][col]; break;
        case 'k': value = PIECE_VALUES.k + KING_PST[row][col]; break;
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
    
    // Bonus for mobility
    totalEvaluation += (game.moves().length * (game.turn() === 'w' ? 10 : -10));

    // Penalty for being in check
    if (game.inCheck()) {
        totalEvaluation += (game.turn() === 'w' ? -50 : 50);
    }

    return totalEvaluation;
};

// Simple move ordering to improve Alpha-Beta pruning performance
const orderMoves = (moves: string[]): string[] => {
    return moves.sort((a, b) => {
        // Prioritize captures (look for 'x')
        const aIsCapture = a.includes('x');
        const bIsCapture = b.includes('x');
        if (aIsCapture && !bIsCapture) return -1;
        if (!aIsCapture && bIsCapture) return 1;
        
        // Prioritize checks
        const aIsCheck = a.includes('+');
        const bIsCheck = b.includes('+');
        if (aIsCheck && !bIsCheck) return -1;
        if (!aIsCheck && bIsCheck) return 1;

        return 0;
    });
};

export const minimax = (
    game: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizingPlayer: boolean
): number => {
    if (depth === 0) return evaluateBoard(game);

    const moves = orderMoves(game.moves());
    
    if (moves.length === 0) {
        if (game.isCheckmate()) {
            return isMaximizingPlayer ? -100000 : 100000;
        }
        return 0; // Draw
    }

    if (isMaximizingPlayer) {
        let bestEval = -Infinity;
        for (const move of moves) {
            game.move(move);
            const evaluation = minimax(game, depth - 1, alpha, beta, false);
            game.undo();
            bestEval = Math.max(bestEval, evaluation);
            alpha = Math.max(alpha, bestEval);
            if (beta <= alpha) break;
        }
        return bestEval;
    } else {
        let bestEval = Infinity;
        for (const move of moves) {
            game.move(move);
            const evaluation = minimax(game, depth - 1, alpha, beta, true);
            game.undo();
            bestEval = Math.min(bestEval, evaluation);
            beta = Math.min(beta, bestEval);
            if (beta <= alpha) break;
        }
        return bestEval;
    }
};

export const findBestMove = (game: Chess, depth: number, randomness = 0): string | null => {
    const moves = orderMoves(game.moves());
    if (moves.length === 0) return null;

    const isWhite = game.turn() === 'w';
    const scoredMoves = moves.map(move => {
        game.move(move);
        const value = minimax(game, depth - 1, -Infinity, Infinity, !isWhite);
        game.undo();
        return { move, value };
    });

    if (isWhite) {
        scoredMoves.sort((a, b) => b.value - a.value);
    } else {
        scoredMoves.sort((a, b) => a.value - b.value);
    }

    // Add randomness for lower difficulties
    const poolSize = Math.min(scoredMoves.length, randomness + 1);
    const index = Math.floor(Math.random() * poolSize);
    return scoredMoves[index].move;
};

export const getDifficultyAdjustedMove = (game: Chess, difficulty: 'easy' | 'medium' | 'hard'): string | null => {
    switch (difficulty) {
        case 'easy':
            return findBestMove(game, 2, 4); // Shallow, very random
        case 'medium':
            return findBestMove(game, 3, 1); // Depth 3, slight variation
        case 'hard':
            // Depth 3 with strong heuristics is better than Depth 4 with lag
            return findBestMove(game, 3, 0); 
    }
};

export const getSuggestedMove = (game: Chess, difficulty: 'easy' | 'medium' | 'hard') => {
    const rawMoves = game.moves({ verbose: true });
    if (rawMoves.length === 0) return null;

    // Use ordering for better evaluation
    const orderedMoves = orderMoves(rawMoves.map(m => m.san));
    const moves = orderedMoves.map(san => rawMoves.find(rm => rm.san === san)!);

    const depth = difficulty === 'easy' ? 2 : (difficulty === 'medium' ? 3 : 3);
    const isWhite = game.turn() === 'w';
    
    const scoredMoves = moves.map(m => {
        game.move(m.san);
        const value = minimax(game, depth - 1, -Infinity, Infinity, !isWhite);
        game.undo();
        return { m, value };
    });

    if (isWhite) {
        scoredMoves.sort((a, b) => b.value - a.value);
    } else {
        scoredMoves.sort((a, b) => a.value - b.value);
    }

    // Pick a move based on difficulty
    let moveIndex = 0;
    if (difficulty === 'easy') moveIndex = Math.floor(Math.random() * Math.min(4, scoredMoves.length));
    else if (difficulty === 'medium') moveIndex = Math.floor(Math.random() * Math.min(2, scoredMoves.length));
    
    const bestMoveObj = scoredMoves[moveIndex].m;
    let explanation = "";

    // Tactical Analysis for explanation
    game.move(bestMoveObj.san);
    const isCheck = game.inCheck();
    const isCheckmate = game.isCheckmate();
    
    // Check for Fork (Attacking two or more valuable pieces)
    const nextMoves = game.moves({ verbose: true });
    const attackers = nextMoves.filter(nm => nm.captured && ['q', 'r', 'b', 'n'].includes(nm.captured));
    const isFork = attackers.length >= 2;
    game.undo();

    if (difficulty === 'easy') {
        if (isCheckmate) explanation = "Look! You can win the game right now!";
        else if (isCheck) explanation = "Try putting their King in trouble.";
        else if (bestMoveObj.captured) explanation = `You can capture their ${bestMoveObj.captured}!`;
        else explanation = "A safe move to develop your pieces.";
    } else if (difficulty === 'medium') {
        if (isCheckmate) explanation = "This sequence leads to an immediate checkmate.";
        else if (isFork) explanation = "A great tactical fork, attacking multiple pieces!";
        else if (bestMoveObj.captured) explanation = `Gains material advantage by capturing the ${bestMoveObj.captured}.`;
        else explanation = "Strengthens your position and controls the center.";
    } else {
        if (isCheckmate) explanation = "Engine confirmed: Forced checkmate sequence identified.";
        else if (isFork) explanation = "High-precision tactical strike targeting weak points.";
        else if (bestMoveObj.captured) explanation = `Optimal exchange: net gain of +${PIECE_VALUES[bestMoveObj.captured as string]/100} points.`;
        else explanation = "Strategic masterstroke: maximizing piece activity and space.";
    }

    return {
        from: bestMoveObj.from,
        to: bestMoveObj.to,
        explanation
    };
};
