"use client";

import { useEffect } from "react";
import { GameView } from "@/components/game/game-view";
import { StartScreen } from "@/components/home/start-screen";
import { useGameStore } from "@/store/game-store";

export default function HomePage() {
  const mode = useGameStore((state) => state.mode);
  const game = useGameStore((state) => state.game);

  useEffect(() => {
    const state = useGameStore.getState();
    if (state.mode === "online") state.leaveGame();
  }, []);

  if (mode === "ai" && game) {
    return <GameView />;
  }

  return <StartScreen />;
}
