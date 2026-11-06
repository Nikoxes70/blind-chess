"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getSoundEngine } from "@/lib/audio/sounds";
import { useGameStore } from "@/store/game-store";

/**
 * Plays move/capture/check cues, reveals a captured hidden piece for a moment,
 * and surfaces engine rejections as toasts.
 */
export function useGameFeedback() {
  const game = useGameStore((state) => state.game);
  const viewerColor = useGameStore((state) => state.viewerColor);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const error = useGameStore((state) => state.error);
  const reveal = useGameStore((state) => state.reveal);
  const clearError = useGameStore((state) => state.clearError);
  const setReveal = useGameStore((state) => state.setReveal);
  const clearReveal = useGameStore((state) => state.clearReveal);

  const lastGameId = useRef<string | null>(null);
  const lastPly = useRef(0);
  const lastStatus = useRef<string | null>(null);

  useEffect(() => {
    getSoundEngine().setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (!game) return;
    const engine = getSoundEngine();

    if (game.id !== lastGameId.current) {
      lastGameId.current = game.id;
      lastPly.current = game.history.length;
      lastStatus.current = game.status;
      engine.play("start");
      return;
    }

    if (game.history.length !== lastPly.current) {
      const move = game.history[game.history.length - 1];
      lastPly.current = game.history.length;
      lastStatus.current = game.status;

      if (game.status === "checkmate") engine.play("checkmate");
      else if (game.status !== "active") engine.play("end");
      else if (move.isCheck) engine.play("check");
      else if (move.captured) engine.play("capture");
      else engine.play("move");

      if (move.color === viewerColor && move.captured && move.capturedSquare) {
        setReveal({
          square: move.capturedSquare,
          piece: move.captured,
          color: move.color === "w" ? "b" : "w",
        });
        engine.play("reveal");
      }
      return;
    }

    if (game.status !== lastStatus.current) {
      lastStatus.current = game.status;
      if (game.status !== "active") engine.play("end");
    }
  }, [game, viewerColor, setReveal]);

  useEffect(() => {
    if (!reveal) return;
    const timer = window.setTimeout(() => clearReveal(reveal.id), 1200);
    return () => window.clearTimeout(timer);
  }, [reveal, clearReveal]);

  useEffect(() => {
    if (!error) return;
    getSoundEngine().play("illegal");
    toast.error(error.message, { id: `error-${error.id}` });
    clearError(error.id);
  }, [error, clearError]);
}
