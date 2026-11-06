"use client";

import { useEffect, useRef } from "react";
import { requestAiMove } from "@/lib/ai/engine-client";
import { useGameStore } from "@/store/game-store";

/**
 * Drives the engine whenever it is Black's turn in a solo game.
 * The worker keeps the search off the main thread; a stale reply is ignored
 * after the position changes or the game is left.
 */
export function useAiOpponent() {
  const game = useGameStore((state) => state.game);
  const mode = useGameStore((state) => state.mode);
  const difficulty = useGameStore((state) => state.difficulty);
  const applyEngineMove = useGameStore((state) => state.applyEngineMove);
  const playFallbackAiMove = useGameStore((state) => state.playFallbackAiMove);
  const setThinking = useGameStore((state) => state.setThinking);
  const requestRef = useRef(0);

  useEffect(() => {
    if (mode !== "ai" || !game) return;
    if (game.status !== "active" || game.turn !== "b") {
      setThinking(false);
      return;
    }

    const request = requestRef.current + 1;
    requestRef.current = request;
    let cancelled = false;
    setThinking(true);

    requestAiMove(game.fen, difficulty)
      .then((move) => {
        if (cancelled || requestRef.current !== request) return;
        setThinking(false);
        if (move) applyEngineMove(move);
        else playFallbackAiMove();
      })
      .catch(() => {
        if (cancelled || requestRef.current !== request) return;
        setThinking(false);
        playFallbackAiMove();
      });

    return () => {
      cancelled = true;
    };
  }, [
    mode,
    game,
    difficulty,
    applyEngineMove,
    playFallbackAiMove,
    setThinking,
  ]);
}
