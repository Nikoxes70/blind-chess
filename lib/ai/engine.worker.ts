import { findBestMove } from "./search";
import type { Difficulty } from "../chess/types";

interface EngineRequest {
  id: number;
  fen: string;
  difficulty: Difficulty;
}

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<EngineRequest>) => void) | null;
  postMessage: (message: unknown) => void;
};

scope.onmessage = (event: MessageEvent<EngineRequest>) => {
  const { id, fen, difficulty } = event.data;
  try {
    const result = findBestMove(fen, difficulty);
    scope.postMessage({
      id,
      move: result.move,
      score: result.score,
      depth: result.depth,
      nodes: result.nodes,
    });
  } catch (error) {
    scope.postMessage({ id, move: null, error: String(error) });
  }
};

export {};
