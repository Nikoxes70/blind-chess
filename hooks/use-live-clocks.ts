"use client";

import { useEffect, useReducer, useRef } from "react";
import { liveClockRemaining } from "@/lib/chess/game";
import { useGameStore } from "@/store/game-store";

/**
 * Returns live remaining time for both sides and claims a flag once per turn.
 * The 200ms tick only re-renders the small clock surfaces, not the whole page.
 */
export function useLiveClocks(): { w: number; b: number } | null {
  const game = useGameStore((state) => state.game);
  const anchor = useGameStore((state) => state.clockAnchor);
  const claimTimeout = useGameStore((state) => state.claimTimeout);
  const [, forceTick] = useReducer((tick: number) => tick + 1, 0);
  const flagRef = useRef("");

  useEffect(() => {
    if (!game?.clocks || game.status !== "active") return;

    const tick = () => {
      forceTick();
      const remaining = liveClockRemaining(game, anchor);
      if (!remaining) return;

      const color = game.turn;
      if (remaining[color] > 0) return;

      const key = `${game.id}:${game.history.length}:${color}`;
      if (flagRef.current === key) return;
      flagRef.current = key;
      claimTimeout(color);
    };

    tick();
    const interval = window.setInterval(tick, 200);
    return () => window.clearInterval(interval);
  }, [game, anchor, claimTimeout]);

  if (!game?.clocks) return null;
  return liveClockRemaining(game, anchor);
}
