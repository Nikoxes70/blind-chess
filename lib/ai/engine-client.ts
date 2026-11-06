import type { Difficulty } from "@/lib/chess/types";
import { ENGINE_TIMEOUT_MS } from "./config";
import type { EngineMove } from "./search";

interface PendingRequest {
  resolve: (move: EngineMove | null) => void;
  timer: ReturnType<typeof setTimeout>;
}

let worker: Worker | null | undefined;
let sequence = 0;
const pending = new Map<number, PendingRequest>();

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  if (typeof window === "undefined") {
    worker = null;
    return null;
  }

  try {
    const instance = new Worker(new URL("./engine.worker.ts", import.meta.url), {
      type: "module",
      name: "blind-chess-engine",
    });

    instance.onmessage = (
      event: MessageEvent<{ id: number; move: EngineMove | null }>,
    ) => {
      const request = pending.get(event.data.id);
      if (!request) return;
      pending.delete(event.data.id);
      clearTimeout(request.timer);
      request.resolve(event.data.move);
    };

    instance.onerror = () => {
      for (const [id, request] of pending) {
        clearTimeout(request.timer);
        request.resolve(null);
        pending.delete(id);
      }
      worker = null;
    };

    worker = instance;
  } catch {
    worker = null;
  }
  return worker;
}

async function fallbackSearch(
  fen: string,
  difficulty: Difficulty,
): Promise<EngineMove | null> {
  const { findBestMove } = await import("./search");
  await new Promise((resolve) => setTimeout(resolve, 0));
  return findBestMove(fen, difficulty).move;
}

/**
 * Asks the engine for a move. Resolves to `null` if the worker is unavailable
 * or overruns its budget — callers then fall back to a random legal move.
 */
export function requestAiMove(
  fen: string,
  difficulty: Difficulty,
): Promise<EngineMove | null> {
  const instance = getWorker();
  if (!instance) return fallbackSearch(fen, difficulty);

  return new Promise((resolve) => {
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve(null);
    }, ENGINE_TIMEOUT_MS[difficulty]);

    pending.set(id, { resolve, timer });
    instance.postMessage({ id, fen, difficulty });
  });
}
