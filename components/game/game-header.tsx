"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, DoorOpen, Link2, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";
import { DIFFICULTY_META } from "@/lib/chess/config";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
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
      toast.success("Room code copied");
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error("Could not copy the code");
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
                aria-label="Copy room code"
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
                Invite
              </Button>
            </>
          ) : (
            <Badge variant="muted" className="hidden sm:inline-flex">
              Practice · {DIFFICULTY_META[difficulty].label}
            </Badge>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSound}
                aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
              >
                {soundEnabled ? (
                  <Volume2 className="size-4" />
                ) : (
                  <VolumeX className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {soundEnabled ? "Mute sounds" : "Enable sounds"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLeave}
                aria-label={room ? "Leave room" : "Back to start"}
              >
                <DoorOpen className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {room ? "Leave room" : "Back to start"}
            </TooltipContent>
          </Tooltip>

          {room ? (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onInvite}
              className="sm:hidden"
              aria-label="Invite a friend"
            >
              <Link2 className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
