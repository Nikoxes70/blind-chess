"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, DoorOpen, Plus, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";
import { DEFAULT_TIME_CONTROL } from "@/lib/chess/config";
import type { TimeControlKey } from "@/lib/chess/types";
import {
  generateRoomCode,
  isRoomCode,
  normalizeRoomCode,
  roomShareUrl,
} from "@/lib/realtime/codes";
import { isPusherConfigured } from "@/lib/realtime/pusher-env";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { TimeControlPicker } from "@/components/game/time-control-picker";

type Tab = "create" | "join" | "invite";

interface RoomManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareCode?: string | null;
}

export function RoomManager({
  open,
  onOpenChange,
  shareCode,
}: RoomManagerProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(shareCode ? "invite" : "create");
  const [timeControl, setTimeControl] = useState<TimeControlKey>(
    DEFAULT_TIME_CONTROL,
  );
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTab(shareCode ? "invite" : "create");
    setCopied(false);
  }, [open, shareCode]);

  const shareUrl = shareCode ? roomShareUrl(shareCode) : "";

  function createRoom() {
    const code = generateRoomCode();
    onOpenChange(false);
    router.push(`/room/${code}?host=1&tc=${timeControl}`);
  }

  function joinRoom() {
    if (!isRoomCode(joinCode)) {
      toast.error("Enter a six-character room code");
      return;
    }
    onOpenChange(false);
    router.push(`/room/${joinCode}`);
  }

  async function copy(value: string, label: string) {
    const ok = await copyText(value);
    if (!ok) {
      toast.error("Could not copy to the clipboard");
      return;
    }
    setCopied(true);
    toast.success(`${label} copied`);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function nativeShare() {
    if (!shareCode) return;
    if (!navigator.share) {
      void copy(shareUrl, "Invite link");
      return;
    }
    try {
      await navigator.share({
        title: "Blind Chess",
        text: `Join my Blind Chess room. The code is ${shareCode}.`,
        url: shareUrl,
      });
    } catch {
      // The user dismissed the share sheet.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Play a friend</DialogTitle>
          <DialogDescription>
            A six-character room. No account, no download — just a shared board
            and two very different views of it.
          </DialogDescription>
        </DialogHeader>

        <Segmented
          ariaLabel="Room action"
          value={tab}
          onChange={(value) => setTab(value as Tab)}
          options={
            shareCode
              ? [
                  { value: "invite", label: "Invite" },
                  { value: "join", label: "Join another" },
                ]
              : [
                  { value: "create", label: "Create a room" },
                  { value: "join", label: "Join with a code" },
                ]
          }
        />

        {tab === "create" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Clock
              </span>
              <TimeControlPicker
                value={timeControl}
                onChange={setTimeControl}
              />
            </div>
            <div className="flex items-start gap-2.5 rounded-lg border border-border bg-white/[0.02] p-3">
              <Users className="mt-0.5 size-4 shrink-0 text-primary/80" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                You play White. Send the link to your friend — the board unlocks
                the moment they arrive. The creator keeps the authoritative game
                state.
              </p>
            </div>
            <Button className="w-full" size="lg" onClick={createRoom}>
              <Plus className="size-4" />
              Create room
            </Button>
            {!isPusherConfigured() ? (
              <p className="text-[10px] leading-relaxed text-muted-foreground/60">
                Local relay active: rooms work between tabs on this browser. Add
                Pusher keys to play across devices.
              </p>
            ) : null}
          </div>
        ) : null}

        {tab === "join" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="room-code"
                className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
              >
                Room code
              </label>
              <Input
                id="room-code"
                value={joinCode}
                onChange={(event) =>
                  setJoinCode(normalizeRoomCode(event.target.value))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") joinRoom();
                }}
                placeholder="ABC123"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={6}
                className="h-14 text-center font-mono text-2xl tracking-[0.4em] uppercase"
              />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Ask your opponent for the six characters from their invite bar.
                You will play Black.
              </p>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={joinRoom}
              disabled={!isRoomCode(joinCode)}
            >
              <DoorOpen className="size-4" />
              Join room
            </Button>
          </div>
        ) : null}

        {tab === "invite" && shareCode ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-5 text-center">
              <div className="text-[10px] uppercase tracking-[0.22em] text-primary/70">
                Room code
              </div>
              <div className="mt-2 font-mono text-4xl tracking-[0.32em] text-foreground">
                {shareCode}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Share link
              </span>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="font-mono text-[11px]"
                  onFocus={(event) => event.currentTarget.select()}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => void copy(shareUrl, "Invite link")}
                  aria-label="Copy invite link"
                  className={cn(
                    "shrink-0",
                    copied && "border-primary/30 text-primary",
                  )}
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => void copy(shareCode, "Room code")}
              >
                <Copy className="size-3.5" />
                Copy code
              </Button>
              <Button variant="outline" onClick={() => void nativeShare()}>
                <Share2 className="size-3.5" />
                Share
              </Button>
            </div>

            {!isPusherConfigured() ? (
              <p className="text-[10px] leading-relaxed text-muted-foreground/60">
                This build uses a local browser relay. Open the invite link in a
                second tab to test the room; configure Pusher for cross-device
                play.
              </p>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
