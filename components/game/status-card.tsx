"use client";

import {
  Ban,
  Clock3,
  EyeOff,
  Loader2,
  MoveRight,
  Radio,
  Sparkles,
  Swords,
} from "lucide-react";
import { getCheckers } from "@/lib/chess/board";
import { endReasonText } from "@/lib/chess/game";
import type { Color, GameState } from "@/lib/chess/types";
import type { RoomSession } from "@/store/game-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useI18n } from "@/components/i18n-provider";

interface StatusCardProps {
  game: GameState;
  viewerColor: Color;
  room: RoomSession | null;
  thinking: boolean;
  hiddenCount: number;
  revealed: boolean;
  onInvite: () => void;
  onReveal: () => void;
}

export function StatusCard({
  game,
  viewerColor,
  room,
  thinking,
  hiddenCount,
  revealed,
  onInvite,
  onReveal,
}: StatusCardProps) {
  const { locale, t } = useI18n();
  const isViewerTurn = game.turn === viewerColor;
  const viewerWon = game.winner === viewerColor;
  const inCheck =
    game.status === "active" &&
    isViewerTurn &&
    getCheckers(game.fen, viewerColor).length > 0;
  const waiting =
    Boolean(room) &&
    room?.role === "host" &&
    !room?.opponentPresent &&
    game.status === "active";
  const reconnecting =
    Boolean(room) &&
    room?.role === "guest" &&
    !room?.opponentPresent &&
    game.status === "active";
  const controlLabel = game.clocks
    ? `${Math.round(game.clocks.initial / 60_000)} + ${Math.round(game.clocks.increment / 1_000)}`
    : t("time.noClock");

  let title = t("status.yourMove");
  let detail = t("status.yourMoveDetail");

  if (game.status === "checkmate") {
    title = viewerWon ? t("status.checkmateWin") : t("status.checkmate");
    detail = viewerWon
      ? t("status.checkmateWinDetail")
      : t("status.checkmateLoseDetail");
  } else if (game.status === "stalemate" || game.status === "draw") {
    title = t("status.draw");
    detail = endReasonText(game.endReason, game.winner, locale);
  } else if (game.status === "resigned") {
    title = viewerWon ? t("status.youWin") : t("status.youResigned");
    detail = endReasonText(game.endReason, game.winner, locale);
  } else if (game.status === "timeout") {
    title = viewerWon ? t("status.youWinOnTime") : t("status.timeRanOut");
    detail = endReasonText(game.endReason, game.winner, locale);
  } else if (game.status === "abandoned") {
    title = t("status.gameAbandoned");
    detail = t("status.roomClosed");
  } else if (waiting) {
    title = t("status.waitingChallenger");
    detail = t("status.shareRoomDetail");
  } else if (reconnecting) {
    title = t("status.opponentDisconnected");
    detail = t("status.reconnectDetail");
  } else if (thinking) {
    title = t("status.engineThinking");
    detail = t("status.engineThinkingDetail");
  } else if (inCheck) {
    title = t("status.checkTitle");
    detail = t("status.checkDetail");
  } else if (!isViewerTurn) {
    title = t("status.theirMove");
    detail = t("status.theirMoveDetail");
  }

  const tone =
    game.status !== "active"
      ? "text-foreground"
      : inCheck
        ? "text-destructive"
        : waiting || reconnecting
          ? "text-primary"
          : "text-foreground";

  return (
    <Panel>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {game.status === "active"
              ? t("status.tableStatus")
              : t("status.result")}
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em]",
              game.status === "active"
                ? "text-muted-foreground"
                : "text-primary/80",
            )}
          >
            {game.status === "active" ? (
              <Swords className="size-3" />
            ) : (
              <Sparkles className="size-3" />
            )}
            {game.status === "active" ? t("status.live") : t("status.final")}
          </span>
        </div>

        <h2 className={cn("mt-2 font-display text-[26px] leading-tight", tone)}>
          {title}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {detail}
        </p>

        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="muted">
            <EyeOff className="size-3" />
            {game.status === "active"
              ? t("status.piecesInFog", { count: hiddenCount })
              : t("status.moves", { count: game.history.length })}
          </Badge>
          <Badge variant="muted">
            <Clock3 className="size-3" />
            {controlLabel}
          </Badge>
          <Badge variant="muted">
            <MoveRight className="size-3" />
            {t("status.plies", { count: game.history.length })}
          </Badge>
          {room ? (
            <Badge
              variant={room.status === "connected" ? "success" : "muted"}
            >
              <Radio className="size-3" />
              {room.transport === "pusher"
                ? t("status.roomRelay")
                : t("status.localRelay")}
            </Badge>
          ) : null}
        </div>

        {waiting ? (
          <Button
            variant="secondary"
            size="sm"
            className="mt-3.5 w-full"
            onClick={onInvite}
          >
            <Loader2 className="size-3.5 animate-spin" />
            {t("status.shareRoom", { code: room?.code ?? "" })}
          </Button>
        ) : null}

        {reconnecting ? (
          <div className="mt-3.5 flex items-center gap-2 rounded-md border border-border bg-white/[0.025] px-2.5 py-2 text-[11px] text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-primary/80" />
            {t("status.waitingReturn")}
          </div>
        ) : null}

        {game.status !== "active" ? (
          <div className="mt-3.5 flex items-center gap-2">
            {!revealed ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onReveal}
              >
                <EyeOff className="size-3.5" />
                {t("status.liftFog")}
              </Button>
            ) : (
              <div className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-primary/20 bg-primary/[0.06] px-2.5 py-1.5 text-[11px] text-primary/90">
                <EyeOff className="size-3.5" />
                {t("status.fogLifted")}
              </div>
            )}
          </div>
        ) : null}

        {room?.status === "error" ? (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-destructive">
            <Ban className="size-3.5" />
            {t("status.relayUnavailable")}
          </p>
        ) : null}
      </div>
    </Panel>
  );
}
