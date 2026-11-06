import { Chess, type Move, type Square as ChessSquare } from "chess.js";
import {
  boardToFen,
  fileIndex,
  findKing,
  getCheckers,
  getViewerBoard,
  isSquareAttacked,
  opposite,
  parseFen,
  rankIndex,
  squareAt,
  squaresBetween,
} from "./board";
import { getTimeControl } from "./config";
import type {
  BoardMap,
  BoardPiece,
  ClockState,
  Color,
  EndReason,
  GameMode,
  GameState,
  GameStatus,
  MoveAttempt,
  MoveInput,
  MoveRecord,
  PieceSymbol,
  PromotionPiece,
  Square,
  TimeControlKey,
  WireGameState,
} from "./types";

export interface ClockAnchor {
  gameId: string;
  ply: number;
  at: number;
}

export function positionKey(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

function makeGameId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12);
}

function toPromotion(piece: PieceSymbol | undefined): PromotionPiece | undefined {
  if (piece === "q" || piece === "r" || piece === "b" || piece === "n") {
    return piece;
  }
  return undefined;
}

function recordFromMove(move: Move, ply: number, chessAfter: Chess): MoveRecord {
  let capturedSquare: Square | undefined;
  if (move.captured) {
    capturedSquare = move.isEnPassant()
      ? `${move.to[0]}${move.from[1]}`
      : move.to;
  }

  return {
    ply,
    color: move.color,
    san: move.san,
    from: move.from,
    to: move.to,
    piece: move.piece,
    captured: move.captured,
    capturedSquare,
    promotion: toPromotion(move.promotion),
    isCheck: chessAfter.isCheck(),
    isCheckmate: chessAfter.isCheckmate(),
    isCastle: move.isKingsideCastle() || move.isQueensideCastle(),
    isEnPassant: move.isEnPassant(),
    isBigPawn: move.isBigPawn(),
  };
}

function outcomeOf(
  chess: Chess,
  positionCounts: Record<string, number>,
): Pick<GameState, "status" | "winner" | "endReason"> {
  if (chess.isCheckmate()) {
    return {
      status: "checkmate",
      winner: opposite(chess.turn()),
      endReason: "checkmate",
    };
  }
  if (chess.isStalemate()) {
    return { status: "stalemate", winner: null, endReason: "stalemate" };
  }
  if (chess.isInsufficientMaterial()) {
    return {
      status: "draw",
      winner: null,
      endReason: "insufficient-material",
    };
  }
  if (chess.isDrawByFiftyMoves()) {
    return { status: "draw", winner: null, endReason: "fifty-move" };
  }
  if (Object.values(positionCounts).some((count) => count >= 3)) {
    return { status: "draw", winner: null, endReason: "threefold" };
  }
  return { status: "active", winner: null, endReason: null };
}

export function createGame(options: {
  mode: GameMode;
  timeControl: TimeControlKey;
}): GameState {
  const timeControl = getTimeControl(options.timeControl);
  const now = Date.now();
  const fen = new Chess().fen();

  return {
    id: makeGameId(),
    mode: options.mode,
    fen,
    turn: "w",
    history: [],
    status: "active",
    winner: null,
    endReason: null,
    positionCounts: { [positionKey(fen)]: 1 },
    clocks:
      timeControl.initial > 0
        ? {
            initial: timeControl.initial,
            increment: timeControl.increment,
            w: timeControl.initial,
            b: timeControl.initial,
          }
        : null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Detects a piece standing on a square the moving piece must pass through.
 * This is what powers "path blocked by an invisible obstacle" — the player gets
 * a deduction cue without ever learning *which* piece is there.
 */
function findBlocker(
  board: BoardMap,
  piece: BoardPiece,
  from: Square,
  to: Square,
): Square | null {
  const fileDelta = fileIndex(to) - fileIndex(from);
  const rankDelta = rankIndex(to) - rankIndex(from);
  const absFile = Math.abs(fileDelta);
  const absRank = Math.abs(rankDelta);

  const isSlider =
    (piece.type === "r" && (fileDelta === 0 || rankDelta === 0)) ||
    (piece.type === "b" && absFile === absRank && absFile > 0) ||
    (piece.type === "q" &&
      (fileDelta === 0 || rankDelta === 0 || absFile === absRank));

  if (isSlider) {
    for (const square of squaresBetween(from, to)) {
      if (board[square]) return square;
    }
    return null;
  }

  if (piece.type === "p" && fileDelta === 0) {
    const step = piece.color === "w" ? 1 : -1;
    const oneForward = squareAt(fileIndex(from), rankIndex(from) + step);
    if (absRank === 2 && oneForward && board[oneForward]) return oneForward;
    if (absRank === 1 && board[to]) return to;
  }

  if (piece.type === "k" && absFile === 2) {
    for (const square of squaresBetween(from, to)) {
      if (board[square]) return square;
    }
  }

  return null;
}

/**
 * Applies a move by `actor` to the authoritative state. Pure: it never mutates.
 *
 * The actor may be a human or the engine; hidden information is never used to
 * reject a move except through the standard "your king would be in check" rule.
 */
export function attemptMove(
  state: GameState,
  input: MoveInput,
  actor: Color,
  options: { elapsedMs?: number } = {},
): MoveAttempt {
  if (state.status !== "active") {
    return { ok: false, reason: "game-over", message: "The game is already over." };
  }
  if (state.turn !== actor) {
    return { ok: false, reason: "not-your-turn", message: "It is not your turn." };
  }
  if (input.from === input.to) {
    return { ok: false, reason: "same-square", message: "Pick a different square." };
  }

  const board = parseFen(state.fen);
  const piece = board[input.from];
  if (!piece) {
    return {
      ok: false,
      reason: "empty-square",
      message: "There is no piece on that square.",
    };
  }
  if (piece.color !== actor) {
    return {
      ok: false,
      reason: "not-your-piece",
      message: "That piece is not yours.",
    };
  }

  const blocker = findBlocker(board, piece, input.from, input.to);
  if (blocker) {
    const visible = getViewerBoard(state.fen, actor).visibleSquares.has(blocker);
    return {
      ok: false,
      reason: "blocked",
      message: visible
        ? "A piece is in the way."
        : "Path blocked by an invisible obstacle!",
    };
  }

  const chess = new Chess(state.fen);
  let move: Move | null = null;
  try {
    move = chess.move({
      from: input.from,
      to: input.to,
      promotion: input.promotion,
    });
  } catch {
    move = null;
  }

  if (!move) {
    if (chess.inCheck()) {
      return {
        ok: false,
        reason: "in-check",
        message: "You must get out of check first.",
      };
    }
    return {
      ok: false,
      reason: "illegal",
      message: "That move isn’t allowed.",
    };
  }

  const record = recordFromMove(move, state.history.length + 1, chess);
  const key = positionKey(chess.fen());
  const positionCounts = {
    ...state.positionCounts,
    [key]: (state.positionCounts[key] ?? 0) + 1,
  };

  const clocks: ClockState | null = state.clocks
    ? {
        ...state.clocks,
        [actor]:
          Math.max(0, state.clocks[actor] - Math.max(0, options.elapsedMs ?? 0)) +
          state.clocks.increment,
      }
    : null;

  const next: GameState = {
    ...state,
    fen: chess.fen(),
    turn: chess.turn(),
    history: [...state.history, record],
    ...outcomeOf(chess, positionCounts),
    positionCounts,
    clocks,
    updatedAt: Date.now(),
  };

  return { ok: true, state: next, move: record };
}

export function resignGame(state: GameState, color: Color): GameState {
  if (state.status !== "active") return state;
  return {
    ...state,
    status: "resigned",
    winner: opposite(color),
    endReason: "resignation",
    updatedAt: Date.now(),
  };
}

export function timeoutGame(state: GameState, color: Color): GameState {
  if (state.status !== "active") return state;
  return {
    ...state,
    status: "timeout",
    winner: opposite(color),
    endReason: "timeout",
    updatedAt: Date.now(),
  };
}

export function abandonGame(state: GameState): GameState {
  if (state.status !== "active") return state;
  return {
    ...state,
    status: "abandoned",
    winner: null,
    endReason: "opponent-left",
    updatedAt: Date.now(),
  };
}

export function isPromotionAttempt(
  state: GameState,
  from: Square,
  to: Square,
): boolean {
  const piece = parseFen(state.fen)[from];
  if (!piece || piece.type !== "p") return false;
  return to[1] === (piece.color === "w" ? "8" : "1");
}

/**
 * Movement-pattern targets for the *viewer's* known board only.
 * Hidden pieces are treated as empty squares, so highlights never leak.
 */
export function pseudoTargets(
  state: GameState,
  from: Square,
  viewer: Color,
  boardOverride?: BoardMap,
): Square[] {
  if (state.status !== "active") return [];
  const full = parseFen(state.fen);
  const piece = full[from];
  if (!piece || piece.color !== viewer) return [];

  const board = boardOverride ?? getViewerBoard(state.fen, viewer).board;
  const targets = new Set<Square>();
  const own = (square: Square) => board[square]?.color === viewer;
  const occupied = (square: Square) => board[square] !== null;

  const file = fileIndex(from);
  const rank = rankIndex(from);

  if (piece.type === "p") {
    const direction = piece.color === "w" ? 1 : -1;
    const one = squareAt(file, rank + direction);
    if (one && !occupied(one)) {
      targets.add(one);
      const startRank = piece.color === "w" ? 1 : 6;
      const two = squareAt(file, rank + direction * 2);
      if (rank === startRank && two && !occupied(two)) targets.add(two);
    }
    for (const offset of [-1, 1]) {
      const diagonal = squareAt(file + offset, rank + direction);
      if (diagonal && !own(diagonal)) targets.add(diagonal);
    }
    const enPassant = state.fen.split(" ")[3];
    if (
      enPassant &&
      rankIndex(enPassant) === rank + direction &&
      Math.abs(fileIndex(enPassant) - file) === 1
    ) {
      targets.add(enPassant);
    }
  }

  if (piece.type === "n") {
    const offsets = [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, -2],
      [-2, -1],
      [-2, 1],
      [-1, 2],
    ];
    for (const [df, dr] of offsets) {
      const target = squareAt(file + df, rank + dr);
      if (target && !own(target)) targets.add(target);
    }
  }

  const slidingDirections: Record<string, number[][]> = {
    r: [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ],
    b: [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ],
    q: [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ],
  };

  const directions = slidingDirections[piece.type];
  if (directions) {
    for (const [df, dr] of directions) {
      let nextFile = file + df;
      let nextRank = rank + dr;
      while (true) {
        const target = squareAt(nextFile, nextRank);
        if (!target) break;
        if (own(target)) break;
        targets.add(target);
        if (occupied(target)) break;
        nextFile += df;
        nextRank += dr;
      }
    }
  }

  if (piece.type === "k") {
    for (let df = -1; df <= 1; df += 1) {
      for (let dr = -1; dr <= 1; dr += 1) {
        if (df === 0 && dr === 0) continue;
        const target = squareAt(file + df, rank + dr);
        if (target && !own(target)) targets.add(target);
      }
    }

    const homeRank = piece.color === "w" ? "1" : "8";
    if (from === `e${homeRank}`) {
      const rights = state.fen.split(" ")[2] ?? "-";
      const kingRight = piece.color === "w" ? "K" : "k";
      const queenRight = piece.color === "w" ? "Q" : "q";
      if (
        rights.includes(kingRight) &&
        !occupied(`f${homeRank}`) &&
        !occupied(`g${homeRank}`) &&
        board[`h${homeRank}`]?.type === "r"
      ) {
        targets.add(`g${homeRank}`);
      }
      if (
        rights.includes(queenRight) &&
        !occupied(`d${homeRank}`) &&
        !occupied(`c${homeRank}`) &&
        !occupied(`b${homeRank}`) &&
        board[`a${homeRank}`]?.type === "r"
      ) {
        targets.add(`c${homeRank}`);
      }
    }
  }

  return [...targets];
}

/**
 * Fully legal destinations for the selected piece. Uses the authoritative
 * position so pins, being in check, castling through check and en passant are
 * all respected. Hidden pieces affect the list only through their occupancy,
 * which the shadow layer already shows.
 */
export function legalTargets(
  state: GameState,
  from: Square,
  viewer: Color,
): Square[] {
  if (state.status !== "active" || state.turn !== viewer) return [];
  const piece = parseFen(state.fen)[from];
  if (!piece || piece.color !== viewer) return [];

  const chess = new Chess(state.fen);
  try {
    const moves = chess.moves({ square: from as ChessSquare, verbose: true });
    return [...new Set(moves.map((move) => move.to as Square))];
  } catch {
    return [];
  }
}

/** Simulates a candidate move on the real board and reports whether it leaves
 * the mover's king attacked. */
function moveLeavesKingExposed(
  board: BoardMap,
  piece: BoardPiece,
  from: Square,
  to: Square,
  viewer: Color,
): boolean {
  const next: BoardMap = { ...board };
  next[from] = null;

  if (piece.type === "p" && from[0] !== to[0] && !board[to]) {
    next[`${to[0]}${from[1]}`] = null;
  }

  if (piece.type === "k" && Math.abs(fileIndex(to) - fileIndex(from)) === 2) {
    const rank = from[1];
    if (to[0] === "g") {
      next[`f${rank}`] = next[`h${rank}`];
      next[`h${rank}`] = null;
    } else if (to[0] === "c") {
      next[`d${rank}`] = next[`a${rank}`];
      next[`a${rank}`] = null;
    }
  }

  next[to] = {
    ...piece,
    type:
      piece.type === "p" && (to[1] === "8" || to[1] === "1")
        ? "q"
        : piece.type,
  };

  const kingSquare = piece.type === "k" ? to : findKing(next, viewer);
  if (!kingSquare) return false;
  return isSquareAttacked(boardToFen(next, viewer), kingSquare, opposite(viewer));
}

/**
 * Movement-legal squares that are unavailable because the move would expose
 * the viewer's own king. The UI marks these with a warning rather than showing
 * them as ordinary destinations.
 */
export function kingSafetyTargets(
  state: GameState,
  from: Square,
  viewer: Color,
): Square[] {
  if (state.status !== "active" || state.turn !== viewer) return [];
  const full = parseFen(state.fen);
  const piece = full[from];
  if (!piece || piece.color !== viewer) return [];

  const legal = new Set(legalTargets(state, from, viewer));
  const candidates = pseudoTargets(state, from, viewer, full);
  const enPassant = state.fen.split(" ")[3];
  const dangerous: Square[] = [];

  for (const to of candidates) {
    if (legal.has(to)) continue;
    if (
      piece.type === "p" &&
      from[0] !== to[0] &&
      !full[to] &&
      to !== enPassant
    ) {
      continue;
    }
    if (findBlocker(full, piece, from, to)) continue;
    if (moveLeavesKingExposed(full, piece, from, to, viewer)) {
      dangerous.push(to);
    }
  }

  return dangerous;
}

/** Rebuilds move records from SAN, used when a guest hydrates a host snapshot. */
export function hydrateHistory(san: string[]): MoveRecord[] {
  const chess = new Chess();
  const history: MoveRecord[] = [];
  san.forEach((notation, index) => {
    try {
      const move = chess.move(notation);
      history.push(recordFromMove(move, index + 1, chess));
    } catch {
      // A malformed snapshot must not crash the board; stop at the last good ply.
    }
  });
  return history;
}

export function toWire(state: GameState): WireGameState {
  return {
    id: state.id,
    mode: state.mode,
    fen: state.fen,
    turn: state.turn,
    status: state.status,
    winner: state.winner,
    endReason: state.endReason,
    clocks: state.clocks,
    san: state.history.map((move) => move.san),
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
  };
}

export function fromWire(wire: WireGameState): GameState {
  return {
    id: wire.id,
    mode: wire.mode,
    fen: wire.fen,
    turn: wire.turn,
    history: hydrateHistory(wire.san),
    status: wire.status,
    winner: wire.winner,
    endReason: wire.endReason,
    positionCounts: {},
    clocks: wire.clocks,
    createdAt: wire.createdAt,
    updatedAt: wire.updatedAt,
  };
}

export function liveClockRemaining(
  game: GameState,
  anchor: ClockAnchor | null,
  now = Date.now(),
): { w: number; b: number } | null {
  if (!game.clocks) return null;
  const isRunning =
    game.status === "active" &&
    anchor !== null &&
    anchor.gameId === game.id &&
    anchor.ply === game.history.length;
  const elapsed = isRunning ? Math.max(0, now - anchor.at) : 0;

  return {
    w: Math.max(0, game.clocks.w - (game.turn === "w" ? elapsed : 0)),
    b: Math.max(0, game.clocks.b - (game.turn === "b" ? elapsed : 0)),
  };
}

export function elapsedForTurn(
  game: GameState,
  anchor: ClockAnchor | null,
): number {
  if (!game.clocks || !anchor) return 0;
  if (anchor.gameId !== game.id || anchor.ply !== game.history.length) return 0;
  return Math.max(0, Date.now() - anchor.at);
}

export function checkersForColor(state: GameState, color: Color): Square[] {
  return getCheckers(state.fen, color);
}

export function isGameOver(status: GameStatus): boolean {
  return status !== "active";
}

export function endReasonText(
  reason: EndReason | null,
  winner: Color | null,
): string {
  switch (reason) {
    case "checkmate":
      return winner ? `${winner === "w" ? "White" : "Black"} wins by checkmate` : "Checkmate";
    case "resignation":
      return winner ? `${winner === "w" ? "White" : "Black"} wins by resignation` : "Resignation";
    case "timeout":
      return winner ? `${winner === "w" ? "White" : "Black"} wins on time` : "Time out";
    case "stalemate":
      return "Draw by stalemate";
    case "insufficient-material":
      return "Draw — insufficient material";
    case "threefold":
      return "Draw by threefold repetition";
    case "fifty-move":
      return "Draw by the fifty-move rule";
    case "opponent-left":
      return "Game abandoned";
    default:
      return "Game over";
  }
}
