"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Play, Users } from "lucide-react";
import { generateRoomCode } from "@/lib/realtime/codes";
import { DIFFICULTY_META } from "@/lib/chess/config";
import type { Difficulty, TimeControlKey } from "@/lib/chess/types";
import { useGameStore } from "@/store/game-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Segmented } from "@/components/ui/segmented";
import { TimeControlPicker } from "./time-control-picker";

interface NewGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewGameDialog({ open, onOpenChange }: NewGameDialogProps) {
  const router = useRouter();
  const startAiGame = useGameStore((state) => state.startAiGame);
  const currentMode = useGameStore((state) => state.mode);
  const currentDifficulty = useGameStore((state) => state.difficulty);
  const currentTimeControl = useGameStore((state) => state.timeControl);

  const [mode, setMode] = useState<"ai" | "online">("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timeControl, setTimeControl] = useState<TimeControlKey>("blitz5");

  useEffect(() => {
    if (!open) return;
    setMode(currentMode ?? "ai");
    setDifficulty(currentDifficulty);
    setTimeControl(currentTimeControl);
  }, [open, currentMode, currentDifficulty, currentTimeControl]);

  function handleStart() {
    if (mode === "ai") {
      startAiGame({ difficulty, timeControl });
      onOpenChange(false);
      return;
    }

    const code = generateRoomCode();
    onOpenChange(false);
    router.push(`/room/${code}?host=1&tc=${timeControl}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New game</DialogTitle>
          <DialogDescription>
            Set the table. The fog returns either way.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Opponent
            </span>
            <Segmented
              ariaLabel="Game mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: "ai", label: "vs Computer" },
                { value: "online", label: "vs Friend" },
              ]}
            />
          </div>

          {mode === "ai" ? (
            <div className="space-y-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Difficulty
              </span>
              <Segmented
                ariaLabel="Difficulty"
                size="sm"
                value={difficulty}
                onChange={setDifficulty}
                options={[
                  { value: "easy", label: "Easy", hint: "depth 1" },
                  { value: "medium", label: "Medium", hint: "depth 2" },
                  { value: "hard", label: "Hard", hint: "depth 3+" },
                ]}
              />
              <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
                {DIFFICULTY_META[difficulty].blurb} The engine sees the whole
                board; local play is a memory battle.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-lg border border-border bg-white/[0.02] p-3">
              <Users className="mt-0.5 size-4 text-primary/80" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                You will get a six-character room code and a share link. You play
                White and the board unlocks when your friend joins.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Clock
            </span>
            <TimeControlPicker value={timeControl} onChange={setTimeControl} />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-black/20 px-3 py-2 text-[11px] text-muted-foreground">
            {mode === "ai" ? (
              <>
                <Bot className="size-3.5 text-primary/80" />
                You are White. The engine is Black.
              </>
            ) : (
              <>
                <Users className="size-3.5 text-primary/80" />
                Creator is White. Joiner is Black.
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart}>
            <Play className="size-4" />
            {mode === "ai" ? "Start game" : "Create room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
