"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, DoorOpen, Link2, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";
import { DIFFICULTY_META } from "@/lib/chess/config";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GameHeaderProps {
  onInvite: () => void;
}

export function GameHeader({ onInvite }: GameHeaderProps) {
  const router = useRouter();
  const { t } = useI18n();
  const mode = useGameStore((state) => state.mode);
  const difficulty = useGameStore((state) => state.difficulty);
  const room = useGameStore((state) => state.room);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const leaveGame = useGameStore((state) => state.leaveGame);
  const [copied, setCopied] = useState(false);

  function handleLeave() {
    leaveGame();
    router.push("/");
  }

  async function handleCopyCode() {
    if (!room) return;
    const copiedOk = await copyText(room.code);
    if (copiedOk) {
      setCopied(true);
      toast.success(t("toast.roomCodeCopied"));
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error(t("toast.couldNotCopyCode"));
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-2 px-3 sm:px-5 lg:px-6">
        <Brand onClick={handleLeave} />

        <div className="ml-auto flex items-center gap-1.5">
          {room ? (
            <>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-2 rounded-md border border-border bg-white/[0.02] px-2.5 py-1.5 font-mono text-[11px] tracking-[0.18em] text-foreground/90 transition-colors hover:border-primary/30 hover:bg-primary/[0.06]"
                aria-label={t("game.copyRoomCode")}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    room.status === "connected"
                      ? "bg-[#8fd2b4]"
                      : room.status === "error"
                        ? "bg-destructive"
                        : "bg-primary animate-breathe",
                  )}
                />
                {room.code}
                <Copy className="size-3 text-muted-foreground" />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={onInvite}
                className="hidden sm:inline-flex"
              >
                <Link2 className="size-3.5" />
                {t("game.invite")}
              </Button>
            </>
          ) : (
            <Badge variant="muted" className="hidden sm:inline-flex">
              {t("game.practice", {
                level: t(DIFFICULTY_META[difficulty].labelKey),
              })}
            </Badge>
          )}

          <LanguageSwitcher />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSound}
                aria-label={
                  soundEnabled ? t("game.muteSounds") : t("game.enableSounds")
                }
              >
                {soundEnabled ? (
                  <Volume2 className="size-4" />
                ) : (
                  <VolumeX className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {soundEnabled ? t("game.muteSounds") : t("game.enableSounds")}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLeave}
                aria-label={
                  room ? t("game.leaveRoom") : t("game.backToStart")
                }
              >
                <DoorOpen className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {room ? t("game.leaveRoom") : t("game.backToStart")}
            </TooltipContent>
          </Tooltip>

          {room ? (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onInvite}
              className="sm:hidden"
              aria-label={t("game.inviteFriend")}
            >
              <Link2 className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
