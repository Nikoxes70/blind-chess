"use client";

import { Crown, EyeOff, Handshake, RotateCcw, Skull } from "lucide-react";
import { endReasonText } from "@/lib/chess/game";
import type { Color, GameState } from "@/lib/chess/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/components/i18n-provider";

interface GameOverDialogProps {
  game: GameState;
  viewerColor: Color;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRematch: () => void;
  onReveal: () => void;
  revealed: boolean;
  online: boolean;
  opponentPresent: boolean;
}

export function GameOverDialog({
  game,
  viewerColor,
  open,
  onOpenChange,
  onRematch,
  onReveal,
  revealed,
  online,
  opponentPresent,
}: GameOverDialogProps) {
  const { locale, t } = useI18n();
  const draw = game.winner === null;
  const won = game.winner === viewerColor;
  const Icon = draw ? Handshake : won ? Crown : Skull;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div
            className={cn(
              "mb-2 flex size-11 items-center justify-center rounded-xl border",
              draw
                ? "border-primary/25 bg-primary/[0.08] text-primary"
                : won
                  ? "border-primary/25 bg-primary/[0.08] text-primary"
                  : "border-destructive/25 bg-destructive/[0.08] text-destructive",
            )}
          >
            <Icon className="size-5" />
          </div>
          <DialogTitle className="text-3xl">
            {draw
              ? t("gameOver.draw")
              : won
                ? t("gameOver.youWin")
                : t("gameOver.youLose")}
          </DialogTitle>
          <DialogDescription>
            {t("gameOver.summary", {
              reason: endReasonText(game.endReason, game.winner, locale),
              count: game.history.length,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="muted">
            {t("gameOver.closedBy", {
              color:
                game.winner === "w"
                  ? t("common.white")
                  : game.winner === "b"
                    ? t("common.black")
                    : t("gameOver.neither"),
            })}
          </Badge>
          {online ? (
            <Badge variant={opponentPresent ? "success" : "danger"}>
              {opponentPresent
                ? t("gameOver.opponentPresent")
                : t("gameOver.opponentOffline")}
            </Badge>
          ) : null}
        </div>

        <p className="rounded-lg border border-border/60 bg-black/20 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          {t("gameOver.fogNote")}
        </p>

        <DialogFooter>
          {!revealed ? (
            <Button variant="outline" onClick={onReveal}>
              <EyeOff className="size-4" />
              {t("status.liftFog")}
            </Button>
          ) : null}
          <Button
            onClick={onRematch}
            disabled={online && !opponentPresent}
            title={
              online && !opponentPresent
                ? t("gameOver.opponentOfflineTitle")
                : undefined
            }
          >
            <RotateCcw className="size-4" />
            {online ? t("gameOver.requestRematch") : t("gameOver.rematch")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
