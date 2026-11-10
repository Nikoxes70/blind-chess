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
import { useI18n } from "@/components/i18n-provider";

interface NewGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewGameDialog({ open, onOpenChange }: NewGameDialogProps) {
  const router = useRouter();
  const { t } = useI18n();
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
          <DialogTitle>{t("newGame.title")}</DialogTitle>
          <DialogDescription>
            {t("newGame.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {t("newGame.opponent")}
            </span>
            <Segmented
              ariaLabel={t("newGame.opponent")}
              value={mode}
              onChange={setMode}
              options={[
                { value: "ai", label: t("newGame.vsComputer") },
                { value: "online", label: t("newGame.vsFriend") },
              ]}
            />
          </div>

          {mode === "ai" ? (
            <div className="space-y-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {t("newGame.difficulty")}
              </span>
              <Segmented
                ariaLabel={t("newGame.difficulty")}
                size="sm"
                value={difficulty}
                onChange={setDifficulty}
                options={[
                  {
                    value: "easy",
                    label: t("difficulty.easy"),
                    hint: t("difficulty.depth1"),
                  },
                  {
                    value: "medium",
                    label: t("difficulty.medium"),
                    hint: t("difficulty.depth2"),
                  },
                  {
                    value: "hard",
                    label: t("difficulty.hard"),
                    hint: t("difficulty.depth3"),
                  },
                ]}
              />
              <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
                {t(DIFFICULTY_META[difficulty].blurbKey)}{" "}
                {t("newGame.aiBlurbSuffix")}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-lg border border-border bg-white/[0.02] p-3">
              <Users className="mt-0.5 size-4 text-primary/80" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {t("newGame.onlineInfo")}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {t("newGame.clock")}
            </span>
            <TimeControlPicker value={timeControl} onChange={setTimeControl} />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-black/20 px-3 py-2 text-[11px] text-muted-foreground">
            {mode === "ai" ? (
              <>
                <Bot className="size-3.5 text-primary/80" />
                {t("newGame.youWhiteEngineBlack")}
              </>
            ) : (
              <>
                <Users className="size-3.5 text-primary/80" />
                {t("newGame.creatorWhiteJoinerBlack")}
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("newGame.cancel")}
          </Button>
          <Button onClick={handleStart}>
            <Play className="size-4" />
            {mode === "ai" ? t("newGame.start") : t("newGame.createRoom")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
