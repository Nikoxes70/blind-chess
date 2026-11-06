import type { Difficulty } from "@/lib/chess/types";

export interface SearchSettings {
  maxDepth: number;
  timeMs: number;
  /** Chance of picking a random legal move instead of searching. */
  blunderChance: number;
  /** Centipawn window used to pick among near-best moves. */
  jitter: number;
}

export const SEARCH_SETTINGS: Record<Difficulty, SearchSettings> = {
  easy: { maxDepth: 1, timeMs: 180, blunderChance: 0.42, jitter: 120 },
  medium: { maxDepth: 2, timeMs: 700, blunderChance: 0.07, jitter: 40 },
  hard: { maxDepth: 4, timeMs: 2000, blunderChance: 0, jitter: 0 },
};

export const ENGINE_TIMEOUT_MS: Record<Difficulty, number> = {
  easy: 4000,
  medium: 6000,
  hard: 8000,
};
