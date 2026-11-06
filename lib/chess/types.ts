export type Color = "w" | "b";
export type PieceSymbol = "p" | "n" | "b" | "r" | "q" | "k";
export type Square = string;
export type PromotionPiece = "q" | "r" | "b" | "n";

export type GameMode = "ai" | "online";
export type Difficulty = "easy" | "medium" | "hard";

export type GameStatus =
  | "active"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "resigned"
  | "timeout"
  | "abandoned";

export type EndReason =
  | "checkmate"
  | "stalemate"
  | "insufficient-material"
  | "threefold"
  | "fifty-move"
  | "resignation"
  | "timeout"
  | "opponent-left";

export type TimeControlKey =
  | "unlimited"
  | "bullet"
  | "blitz3"
  | "blitz5"
  | "rapid10";

export interface TimeControl {
  key: TimeControlKey;
  label: string;
  short: string;
  initial: number;
  increment: number;
}

export interface BoardPiece {
  type: PieceSymbol;
  color: Color;
}

export type BoardMap = Record<Square, BoardPiece | null>;

export interface MoveRecord {
  ply: number;
  color: Color;
  san: string;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  /** Square the captured piece actually stood on (differs for en passant). */
  capturedSquare?: Square;
  promotion?: PromotionPiece;
  isCheck: boolean;
  isCheckmate: boolean;
  isCastle: boolean;
  isEnPassant: boolean;
  isBigPawn: boolean;
}

export interface ClockState {
  initial: number;
  increment: number;
  w: number;
  b: number;
}

export interface GameState {
  id: string;
  mode: GameMode;
  fen: string;
  turn: Color;
  history: MoveRecord[];
  status: GameStatus;
  winner: Color | null;
  endReason: EndReason | null;
  positionCounts: Record<string, number>;
  clocks: ClockState | null;
  createdAt: number;
  updatedAt: number;
}

/** A serializable, history-compressed game state for the room relay. */
export interface WireGameState {
  id: string;
  mode: GameMode;
  fen: string;
  turn: Color;
  status: GameStatus;
  winner: Color | null;
  endReason: EndReason | null;
  clocks: ClockState | null;
  san: string[];
  createdAt: number;
  updatedAt: number;
}

export interface MoveInput {
  from: Square;
  to: Square;
  promotion?: PromotionPiece;
}

export type MoveFailureReason =
  | "game-over"
  | "not-your-turn"
  | "empty-square"
  | "not-your-piece"
  | "same-square"
  | "blocked"
  | "illegal"
  | "in-check";

export type MoveAttempt =
  | { ok: true; state: GameState; move: MoveRecord }
  | { ok: false; reason: MoveFailureReason; message: string };
