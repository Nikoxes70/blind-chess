import type { MessageKey } from "@/lib/i18n/messages";

export type Color = "w" | "b";

export type Square = string;

export type PieceSymbol = "p" | "n" | "b" | "r" | "q" | "k";

export type PromotionPiece = "q" | "r" | "b" | "n";

export interface BoardPiece {
  type: PieceSymbol;
  color: Color;
}

export type BoardMap = Record<Square, BoardPiece | null>;

export type Difficulty = "easy" | "medium" | "hard";

export type GameMode = "ai" | "online";

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

export interface ClockState {
  initial: number;
  increment: number;
  w: number;
  b: number;
}

export interface MoveRecord {
  ply: number;
  color: Color;
  san: string;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  capturedSquare?: Square;
  promotion?: PromotionPiece;
  isCheck: boolean;
  isCheckmate: boolean;
  isCastle: boolean;
  isEnPassant: boolean;
  isBigPawn: boolean;
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

export interface MoveInput {
  from: Square;
  to: Square;
  promotion?: PromotionPiece;
}

export type MoveFailureReason =
  | "game-over"
  | "not-your-turn"
  | "same-square"
  | "empty-square"
  | "not-your-piece"
  | "blocked"
  | "in-check"
  | "illegal";

export type MoveAttempt =
  | { ok: true; state: GameState; move: MoveRecord }
  | {
      ok: false;
      reason: MoveFailureReason;
      message: string;
      messageKey: MessageKey;
    };

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
