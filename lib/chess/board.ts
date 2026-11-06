import { Chess } from "chess.js";
import type { Square as ChessSquare } from "chess.js";
import type { BoardMap, BoardPiece, Color, PieceSymbol, Square } from "./types";

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

export const ALL_SQUARES: Square[] = RANKS.flatMap((rank) =>
  FILES.map((file) => `${file}${rank}`),
);

export function opposite(color: Color): Color {
  return color === "w" ? "b" : "w";
}

export function fileIndex(square: Square): number {
  return FILES.indexOf(square[0] as (typeof FILES)[number]);
}

export function rankIndex(square: Square): number {
  return Number(square[1]) - 1;
}

export function squareAt(file: number, rank: number): Square | null {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return `${FILES[file]}${rank + 1}`;
}

export function isLightSquare(square: Square): boolean {
  return (fileIndex(square) + rankIndex(square)) % 2 === 1;
}

export function emptyBoard(): BoardMap {
  const board = {} as BoardMap;
  for (const square of ALL_SQUARES) board[square] = null;
  return board;
}

export function parseFen(fen: string): BoardMap {
  const board = emptyBoard();
  const placement = fen.split(" ")[0] ?? "";
  const rows = placement.split("/");
  if (rows.length !== 8) return board;

  rows.forEach((row, index) => {
    const rank = 8 - index;
    let file = 0;
    for (const char of row) {
      if (char >= "1" && char <= "8") {
        file += Number(char);
        continue;
      }
      if (file > 7) break;
      const color: Color = char === char.toUpperCase() ? "w" : "b";
      const type = char.toLowerCase() as PieceSymbol;
      board[`${FILES[file]}${rank}`] = { type, color };
      file += 1;
    }
  });

  return board;
}

export function boardToFen(board: BoardMap, turn: Color = "w"): string {
  const rows: string[] = [];
  for (let rank = 8; rank >= 1; rank -= 1) {
    let row = "";
    let empty = 0;
    for (const file of FILES) {
      const piece = board[`${file}${rank}`];
      if (!piece) {
        empty += 1;
        continue;
      }
      if (empty > 0) {
        row += String(empty);
        empty = 0;
      }
      const letter =
        piece.color === "w" ? piece.type.toUpperCase() : piece.type.toLowerCase();
      row += letter;
    }
    if (empty > 0) row += String(empty);
    rows.push(row);
  }
  return `${rows.join("/")} ${turn} - - 0 1`;
}

export function findKing(board: BoardMap, color: Color): Square | null {
  for (const square of ALL_SQUARES) {
    const piece = board[square];
    if (piece && piece.type === "k" && piece.color === color) return square;
  }
  return null;
}

/** Every square strictly between two aligned squares (empty for knights/adjacent). */
export function squaresBetween(from: Square, to: Square): Square[] {
  const fromFile = fileIndex(from);
  const fromRank = rankIndex(from);
  const toFile = fileIndex(to);
  const toRank = rankIndex(to);

  const fileDelta = toFile - fromFile;
  const rankDelta = toRank - fromRank;
  const straight = fileDelta === 0 || rankDelta === 0;
  const diagonal = Math.abs(fileDelta) === Math.abs(rankDelta);
  if (!straight && !diagonal) return [];
  if (fileDelta === 0 && rankDelta === 0) return [];

  const fileStep = Math.sign(fileDelta);
  const rankStep = Math.sign(rankDelta);
  const squares: Square[] = [];
  let file = fromFile + fileStep;
  let rank = fromRank + rankStep;
  while (file !== toFile || rank !== toRank) {
    const square = squareAt(file, rank);
    if (!square) break;
    squares.push(square);
    file += fileStep;
    rank += rankStep;
  }
  return squares;
}

export function pieceName(square: Square, board: BoardMap): string | null {
  return board[square]?.type ?? null;
}

export function isSquareAttacked(
  fen: string,
  square: Square,
  byColor: Color,
): boolean {
  const chess = new Chess(fen);
  try {
    return chess.isAttacked(square as ChessSquare, byColor);
  } catch {
    return false;
  }
}

/**
 * Squares of `color`'s pieces that currently attack `square`.
 * Uses chess.js's geometric attack map (pins do not remove an attack).
 */
export function attackersOf(
  fen: string,
  square: Square,
  color: Color,
): Square[] {
  const chess = new Chess(fen);
  try {
    return chess.attackers(square as ChessSquare, color) as Square[];
  } catch {
    return [];
  }
}

/** Enemy pieces currently giving check to `color`'s king. */
export function getCheckers(fen: string, color: Color): Square[] {
  const board = parseFen(fen);
  const king = findKing(board, color);
  if (!king) return [];
  return attackersOf(fen, king, opposite(color));
}

export function isInCheck(fen: string, color: Color): boolean {
  return getCheckers(fen, color).length > 0;
}

export interface ViewerBoard {
  /** Only pieces the viewer is allowed to know about. */
  board: BoardMap;
  checkers: Square[];
  inCheck: boolean;
  king: Square | null;
  hiddenCount: number;
  visibleSquares: Set<Square>;
  /**
   * Squares occupied by fogged enemy pieces. Their identities stay out of
   * `board`; the UI paints a generic shadow here so the board does not read as
   * empty. The shadow never carries a piece type.
   */
  hiddenSquares: Set<Square>;
}

/**
 * The core fog-of-war projection.
 *
 * A player always sees their own pieces. An opponent piece is visible only while
 * it is delivering check. Every other opponent piece is removed from the piece
 * map; only its square is exposed, so the UI can draw a type-less shadow. Piece
 * identity never reaches the render map.
 */
export function getViewerBoard(
  fen: string,
  viewer: Color,
  revealAll = false,
): ViewerBoard {
  const full = parseFen(fen);
  const checkers = revealAll ? [] : getCheckers(fen, viewer);
  const visibleSquares = new Set<Square>();

  for (const square of ALL_SQUARES) {
    const piece = full[square];
    if (!piece) continue;
    if (revealAll || piece.color === viewer) {
      visibleSquares.add(square);
    }
  }
  for (const square of checkers) visibleSquares.add(square);

  const board = emptyBoard();
  const hiddenSquares = new Set<Square>();
  let hiddenCount = 0;
  for (const square of ALL_SQUARES) {
    const piece = full[square];
    if (!piece) continue;
    if (visibleSquares.has(square)) {
      board[square] = piece;
    } else {
      hiddenCount += 1;
      hiddenSquares.add(square);
    }
  }

  return {
    board,
    checkers,
    inCheck: checkers.length > 0,
    king: findKing(full, viewer),
    hiddenCount,
    visibleSquares,
    hiddenSquares,
  };
}

export function pieceAt(fen: string, square: Square): BoardPiece | null {
  return parseFen(fen)[square] ?? null;
}
