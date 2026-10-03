import { Chess, Move, PieceSymbol, Color } from 'chess.js';
import { PieceType, PieceColor, AIDifficulty } from '../types/chess';

// Piece value heuristics for AI evaluation
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional bonuses for center control and development (White's perspective; inverted for Black)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

// Evaluate static board position from white perspective (positive favors white, negative favors black)
function evaluateBoard(game: Chess): number {
  let score = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let val = PIECE_VALUES[piece.type];
      const index = r * 8 + c;
      const invIndex = (7 - r) * 8 + c;

      if (piece.type === 'p') {
        val += piece.color === 'w' ? PAWN_TABLE[invIndex] : PAWN_TABLE[index];
      } else if (piece.type === 'n') {
        val += piece.color === 'w' ? KNIGHT_TABLE[invIndex] : KNIGHT_TABLE[index];
      } else if (piece.type === 'b') {
        val += piece.color === 'w' ? BISHOP_TABLE[invIndex] : BISHOP_TABLE[index];
      }

      if (piece.color === 'w') {
        score += val;
      } else {
        score -= val;
      }
    }
  }

  return score;
}

// Minimax with Alpha-Beta pruning for tactical & overlord AI
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Find best move for AI
export function computeAIMove(game: Chess, difficulty: AIDifficulty): Move | null {
  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const isWhite = game.turn() === 'w';

  // 1. Novice AI: Selects random legal move, with 50% preference for captures
  if (difficulty === 'novice') {
    const captures = legalMoves.filter(m => m.captured || m.san.includes('+'));
    if (captures.length > 0 && Math.random() > 0.4) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // 2. Tactical Sentinel AI: 1-ply evaluation with tactical prioritization
  if (difficulty === 'tactical') {
    let bestMoves: Move[] = [];
    let bestScore = isWhite ? -Infinity : Infinity;

    // Shuffle moves slightly for variety
    const shuffled = [...legalMoves].sort(() => Math.random() - 0.5);

    for (const move of shuffled) {
      game.move(move);
      let score = evaluateBoard(game);
      // Small bonus if it causes check
      if (game.isCheck()) {
        score += isWhite ? 35 : -35;
      }
      game.undo();

      if (isWhite) {
        if (score > bestScore) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)] || legalMoves[0];
  }

  // 3. Neural Overlord AI: 2-3 ply alpha-beta pruning
  let bestMove: Move = legalMoves[0];
  let bestVal = isWhite ? -Infinity : Infinity;
  const searchDepth = 2; // depth 2 for ultra-fast, responsive web UI

  // Order moves: captures and checks first to optimize alpha-beta cutoff
  const sortedMoves = [...legalMoves].sort((a, b) => {
    const scoreA = (a.captured ? 10 : 0) + (a.san.includes('+') ? 5 : 0);
    const scoreB = (b.captured ? 10 : 0) + (b.san.includes('+') ? 5 : 0);
    return scoreB - scoreA;
  });

  for (const move of sortedMoves) {
    game.move(move);
    const score = minimax(game, searchDepth - 1, -Infinity, Infinity, !isWhite);
    game.undo();

    if (isWhite) {
      if (score > bestVal) {
        bestVal = score;
        bestMove = move;
      }
    } else {
      if (score < bestVal) {
        bestVal = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

// Compute material advantage and captured pieces from board
export function calculateMaterial(game: Chess): {
  whiteCaptures: PieceType[];
  blackCaptures: PieceType[];
  whiteMaterialScore: number;
  blackMaterialScore: number;
} {
  const initialPieces: Record<PieceType, number> = {
    p: 8,
    n: 2,
    b: 2,
    r: 2,
    q: 1,
    k: 1,
  };

  const currentWhite: Record<PieceType, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const currentBlack: Record<PieceType, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

  const board = game.board();
  for (const row of board) {
    for (const sq of row) {
      if (!sq) continue;
      const t = sq.type as PieceType;
      if (sq.color === 'w') {
        currentWhite[t] = (currentWhite[t] || 0) + 1;
      } else {
        currentBlack[t] = (currentBlack[t] || 0) + 1;
      }
    }
  }

  const whiteCaptures: PieceType[] = [];
  const blackCaptures: PieceType[] = [];

  const types: PieceType[] = ['q', 'r', 'b', 'n', 'p'];
  for (const t of types) {
    const missingBlack = (initialPieces[t] || 0) - (currentBlack[t] || 0);
    for (let i = 0; i < missingBlack; i++) {
      whiteCaptures.push(t);
    }
    const missingWhite = (initialPieces[t] || 0) - (currentWhite[t] || 0);
    for (let i = 0; i < missingWhite; i++) {
      blackCaptures.push(t);
    }
  }

  const pieceScores: Record<PieceType, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };

  let whiteMaterialScore = 0;
  let blackMaterialScore = 0;

  for (const t of types) {
    whiteMaterialScore += currentWhite[t] * pieceScores[t];
    blackMaterialScore += currentBlack[t] * pieceScores[t];
  }

  return {
    whiteCaptures,
    blackCaptures,
    whiteMaterialScore,
    blackMaterialScore,
  };
}
