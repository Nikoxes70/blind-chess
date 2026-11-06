import type {
  Difficulty,
  PieceSymbol,
  TimeControl,
  TimeControlKey,
} from "./types";

export const TIME_CONTROLS: TimeControl[] = [
  {
    key: "unlimited",
    label: "No clock",
    short: "∞",
    initial: 0,
    increment: 0,
  },
  {
    key: "bullet",
    label: "1 + 0",
    short: "1+0",
    initial: 60_000,
    increment: 0,
  },
  {
    key: "blitz3",
    label: "3 + 2",
    short: "3+2",
    initial: 180_000,
    increment: 2_000,
  },
  {
    key: "blitz5",
    label: "5 + 0",
    short: "5+0",
    initial: 300_000,
    increment: 0,
  },
  {
    key: "rapid10",
    label: "10 + 0",
    short: "10+0",
    initial: 600_000,
    increment: 0,
  },
];

export const DEFAULT_TIME_CONTROL: TimeControlKey = "blitz5";

export function getTimeControl(key: TimeControlKey): TimeControl {
  return TIME_CONTROLS.find((tc) => tc.key === key) ?? TIME_CONTROLS[3];
}

export const PIECE_NAMES: Record<PieceSymbol, string> = {
  p: "Pawn",
  n: "Knight",
  b: "Bishop",
  r: "Rook",
  q: "Queen",
  k: "King",
};

export const PIECE_VALUES_CP: Record<PieceSymbol, number> = {
  p: 100,
  n: 300,
  b: 300,
  r: 500,
  q: 900,
  k: 0,
};

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; blurb: string; depth: string }
> = {
  easy: {
    label: "Easy",
    blurb: "Plays fast and leaves pieces hanging.",
    depth: "depth 1",
  },
  medium: {
    label: "Medium",
    blurb: "Sees simple captures and threats.",
    depth: "depth 2",
  },
  hard: {
    label: "Hard",
    blurb: "Searches deeper and rarely gifts material.",
    depth: "depth 3+",
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

/** The fog hides 16 pieces at the start of every game. */
export const STARTING_PIECE_COUNT = 16;
