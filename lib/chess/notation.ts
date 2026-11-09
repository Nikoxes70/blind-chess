import type { Color, MoveRecord } from "./types";

export interface MoveDisplay {
  text: string;
  masked: boolean;
  revealed: boolean;
  check: boolean;
  mate: boolean;
}

/**
 * Masks an opponent move as `???` unless it gave check. A checking move reveals
 * the attacking piece type only; a capture never reveals the capturing piece,
 * because the captured piece identity is surfaced separately in the move log.
 */
export function displayMove(move: MoveRecord, viewer: Color): MoveDisplay {
  if (move.color === viewer) {
    return {
      text: move.san,
      masked: false,
      revealed: true,
      check: move.isCheck,
      mate: move.isCheckmate,
    };
  }

  const revealed = Boolean(move.isCheck || move.isCheckmate);
  if (!revealed) {
    return { text: "???", masked: true, revealed: false, check: false, mate: false };
  }

  const letter = move.piece.toUpperCase();
  let text = move.captured ? `${letter}x???` : `${letter}???`;
  if (move.promotion) text += `=${move.promotion.toUpperCase()}`;
  if (move.isCheckmate) text += "#";
  else if (move.isCheck) text += "+";

  return {
    text,
    masked: true,
    revealed: true,
    check: move.isCheck,
    mate: move.isCheckmate,
  };
}

export interface MovePair {
  number: number;
  white?: MoveRecord;
  black?: MoveRecord;
}

export function movePairs(history: MoveRecord[]): MovePair[] {
  const pairs: MovePair[] = [];
  for (let index = 0; index < history.length; index += 2) {
    pairs.push({
      number: index / 2 + 1,
      white: history[index],
      black: history[index + 1],
    });
  }
  return pairs;
}

export interface CapturedPiece {
  type: MoveRecord["piece"];
  count: number;
}

/** Pieces `color` has captured from the opponent, grouped for the side panel. */
export function capturedBy(history: MoveRecord[], color: Color): CapturedPiece[] {
  const counts = new Map<string, number>();
  for (const move of history) {
    if (move.color !== color || !move.captured) continue;
    counts.set(move.captured, (counts.get(move.captured) ?? 0) + 1);
  }
  const order = ["q", "r", "b", "n", "p"];
  return order
    .filter((type) => counts.has(type))
    .map((type) => ({ type: type as MoveRecord["piece"], count: counts.get(type)! }));
}
