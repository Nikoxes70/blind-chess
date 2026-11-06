import { Chess, type Move } from "chess.js";
import { SEARCH_SETTINGS } from "./config";
import type { Difficulty, PieceSymbol, PromotionPiece } from "@/lib/chess/types";

export interface EngineMove {
  from: string;
  to: string;
  promotion?: PromotionPiece;
}

export interface EngineResult {
  move: EngineMove | null;
  score: number;
  depth: number;
  nodes: number;
}

const MATE = 1_000_000;
const ABORT = Symbol("search-aborted");

const VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

/**
 * Piece-square tables in a1-first order (rank 1 → rank 8).
 * Black mirrors the rank with `index ^ 56`.
 */
const PST: Record<PieceSymbol, number[]> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, -20, -20, 10, 10, 5,
    5, -5, -10, 0, 0, -10, -5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, 5, 10, 25, 25, 10, 5, 5,
    10, 10, 20, 30, 30, 20, 10, 10,
    50, 50, 50, 50, 50, 50, 50, 50,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 5, 5, 0, 0, 0,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    5, 10, 10, 10, 10, 10, 10, 5,
    0, 0, 5, 10, 10, 5, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -10, 5, 5, 5, 5, 5, 0, -10,
    0, 0, 5, 5, 5, 5, 0, -5,
    -5, 0, 5, 5, 5, 5, 0, -5,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  k: [
    20, 30, 10, 0, 0, 10, 30, 20,
    20, 20, 0, 0, 0, 0, 20, 20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
  ],
};

let deadline = 0;
let nodes = 0;

function checkDeadline() {
  nodes += 1;
  if ((nodes & 511) === 0 && performance.now() > deadline) throw ABORT;
}

function evaluate(chess: Chess): number {
  const board = chess.board();
  let score = 0;
  let whiteBishops = 0;
  let blackBishops = 0;

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const cell = board[row][col];
      if (!cell) continue;
      const index = (7 - row) * 8 + col;
      const tableIndex = cell.color === "w" ? index : index ^ 56;
      const value = VALUES[cell.type] + (PST[cell.type][tableIndex] ?? 0);
      score += cell.color === "w" ? value : -value;
      if (cell.type === "b") {
        if (cell.color === "w") whiteBishops += 1;
        else blackBishops += 1;
      }
    }
  }

  if (whiteBishops >= 2) score += 30;
  if (blackBishops >= 2) score -= 30;
  return score;
}

function sideScore(chess: Chess): number {
  return chess.turn() === "w" ? evaluate(chess) : -evaluate(chess);
}

function scoreMove(move: Move): number {
  let score = 0;
  if (move.captured) {
    score += 10_000 + VALUES[move.captured] * 10 - VALUES[move.piece];
  }
  if (move.promotion) {
    score += 8_000 + VALUES[move.promotion];
  }
  if (move.isKingsideCastle() || move.isQueensideCastle()) score += 60;
  return score;
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => scoreMove(b) - scoreMove(a));
}

function quiesce(
  chess: Chess,
  alpha: number,
  beta: number,
  qdepth: number,
): number {
  checkDeadline();
  const standPat = sideScore(chess);
  if (qdepth >= 4) return standPat;
  if (standPat >= beta) return beta;
  if (standPat > alpha) alpha = standPat;

  const captures = orderMoves(
    chess
      .moves({ verbose: true })
      .filter((move) => Boolean(move.captured) || Boolean(move.promotion)),
  );

  for (const capture of captures) {
    chess.move(capture);
    let score: number;
    try {
      score = -quiesce(chess, -beta, -alpha, qdepth + 1);
    } finally {
      chess.undo();
    }
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function negamax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  ply: number,
): number {
  checkDeadline();
  if (chess.isCheckmate()) return -MATE + ply;
  if (chess.isDraw()) return 0;
  if (depth <= 0) return quiesce(chess, alpha, beta, 0);

  let best = -Infinity;
  for (const move of orderMoves(chess.moves({ verbose: true }))) {
    chess.move(move);
    let score: number;
    try {
      score = -negamax(chess, depth - 1, -beta, -alpha, ply + 1);
    } finally {
      chess.undo();
    }
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }
  return best === -Infinity ? -MATE + ply : best;
}

function pickScored(
  scored: { move: Move; score: number }[],
  jitter: number,
): { move: Move; score: number } {
  if (jitter <= 0) return scored[0];
  const best = scored[0].score;
  const pool = scored.filter((entry) => best - entry.score <= jitter);
  return pool[Math.floor(Math.random() * pool.length)] ?? scored[0];
}

function toEngineMove(move: Move): EngineMove {
  return {
    from: move.from,
    to: move.to,
    promotion: move.promotion as PromotionPiece | undefined,
  };
}

export function findBestMove(fen: string, difficulty: Difficulty): EngineResult {
  const settings = SEARCH_SETTINGS[difficulty];
  const chess = new Chess(fen);
  const legal = chess.moves({ verbose: true });

  if (legal.length === 0) {
    return { move: null, score: 0, depth: 0, nodes: 0 };
  }
  if (legal.length === 1) {
    return { move: toEngineMove(legal[0]), score: 0, depth: 0, nodes: 0 };
  }
  if (settings.blunderChance > 0 && Math.random() < settings.blunderChance) {
    const blunder = legal[Math.floor(Math.random() * legal.length)];
    return { move: toEngineMove(blunder), score: 0, depth: 0, nodes: 0 };
  }

  nodes = 0;
  deadline = performance.now() + settings.timeMs;

  let ordered = orderMoves(legal);
  let bestMove = ordered[0];
  let bestScore = 0;
  let depthReached = 0;

  for (let depth = 1; depth <= settings.maxDepth; depth += 1) {
    const scored: { move: Move; score: number }[] = [];
    let aborted = false;

    for (const move of ordered) {
      chess.move(move);
      let score: number;
      try {
        score = -negamax(chess, depth - 1, -MATE, MATE, 1);
      } catch (error) {
        if (error === ABORT) aborted = true;
        else throw error;
        break;
      } finally {
        chess.undo();
      }
      scored.push({ move, score });
      if (performance.now() > deadline) {
        aborted = true;
        break;
      }
    }

    if (aborted || scored.length !== ordered.length) break;

    scored.sort((a, b) => b.score - a.score);
    const pick = pickScored(scored, settings.jitter);
    bestMove = pick.move;
    bestScore = pick.score;
    ordered = scored.map((entry) => entry.move);
    depthReached = depth;

    if (Math.abs(bestScore) > MATE - 1000) break;
    if (performance.now() > deadline) break;
  }

  return {
    move: toEngineMove(bestMove),
    score: bestScore,
    depth: depthReached,
    nodes,
  };
}
