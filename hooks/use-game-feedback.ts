"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getSoundEngine } from "@/lib/audio/sounds";
import { useGameStore } from "@/store/game-store";
import { useI18n } from "@/components/i18n-provider";

/**
 * Plays move/capture/check cues and surfaces engine rejections as toasts.
 * Piece identities are never revealed on the board by a capture; the move log
 * and captured tracker are the only places a captured piece is identified.
 */
export function useGameFeedback() {
  const { t } = useI18n();
  const game = useGameStore((state) => state.game);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const error = useGameStore((state) => state.error);
  const clearError = useGameStore((state) => state.clearError);

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
      return;
    }

    if (game.status !== lastStatus.current) {
      lastStatus.current = game.status;
      if (game.status !== "active") engine.play("end");
    }
  }, [game]);

  useEffect(() => {
    if (!error) return;
    getSoundEngine().play("illegal");
    toast.error(error.key ? t(error.key) : error.message, {
      id: `error-${error.id}`,
    });
    clearError(error.id);
  }, [error, clearError, t]);
}
