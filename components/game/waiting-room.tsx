"use client";

import { useState } from "react";
import { Check, Copy, Loader2, LogOut, Users } from "lucide-react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";
import { roomShareUrl } from "@/lib/realtime/codes";
import type { ConnectionStatus } from "@/lib/realtime/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChessBoard } from "@/components/board/chess-board";
import { useI18n } from "@/components/i18n-provider";

const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

interface WaitingRoomProps {
  code: string;
  role: "host" | "guest";
  status: ConnectionStatus;
  transport: "local" | "pusher";
  onLeave: () => void;
}

export function WaitingRoom({
  code,
  role,
  status,
  transport,
  onLeave,
}: WaitingRoomProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copyInvite() {
    const ok = await copyText(roomShareUrl(code));
    if (!ok) {
      toast.error(t("toast.couldNotCopyInvite"));
      return;
    }
    setCopied(true);
    toast.success(t("toast.inviteLinkCopied"));
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="mx-auto flex w-full max-w-[540px] flex-1 flex-col justify-center px-4 py-8 sm:py-12">
      <div className="relative">
        <div
          className="pointer-events-none opacity-45 blur-[1.5px]"
          aria-hidden
        >
          <ChessBoard
            fen={START_FEN}
            orientation={role === "guest" ? "b" : "w"}
            viewerColor={role === "guest" ? "b" : "w"}
            selected={null}
            targets={[]}
            dangerTargets={[]}
            lastMove={null}
            opponentLastMove={null}
            interactive={false}
            onSelect={() => {}}
            onMove={() => {}}
          />
        </div>

        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 rounded-xl border border-primary/20 bg-[#0b110e]/95 p-5 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:inset-x-8 sm:p-7">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.08]">
            <Loader2 className="animate-breathe size-4 text-primary" />
          </div>

          <h1 className="mt-4 font-display text-2xl">
            {t(role === "guest" ? "waiting.forHost" : "waiting.forOpponent")}
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {role === "guest"
              ? t("waiting.guestDetail")
              : t("waiting.hostDetail")}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="rounded-md border border-border bg-black/30 px-3 py-1.5 font-mono text-lg tracking-[0.3em] text-foreground">
              {code}
            </span>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => void copyInvite()}
              aria-label={t("waiting.copyInviteAria")}
              className={cn(copied && "border-primary/30 text-primary")}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
            <Users className="size-3" />
            {role === "guest"
              ? t("waiting.youPlayBlack")
              : t("waiting.youPlayWhite")}
            <span className="text-muted-foreground/30">·</span>
            {transport === "pusher"
              ? t("status.roomRelay")
              : t("status.localRelay")}
          </div>

          {status === "error" ? (
            <p className="mt-3 text-[11px] text-destructive">
              {t("waiting.relayError")}
            </p>
          ) : null}

          {transport === "local" ? (
            <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground/50">
              {t("waiting.localNote")}
            </p>
          ) : null}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mx-auto mt-6 text-muted-foreground"
        onClick={onLeave}
      >
        <LogOut className="size-3.5" />
        {t("waiting.leaveRoom")}
      </Button>
    </main>
  );
}
