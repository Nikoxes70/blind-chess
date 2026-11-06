"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  DEFAULT_TIME_CONTROL,
  TIME_CONTROLS,
} from "@/lib/chess/config";
import type { TimeControlKey } from "@/lib/chess/types";
import { isRoomCode, normalizeRoomCode } from "@/lib/realtime/codes";
import { useRoomSession } from "@/hooks/use-room-session";
import { GameView } from "@/components/game/game-view";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";

function RoomLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b border-border/60 px-4">
        <Brand />
      </header>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          Opening the room…
        </div>
      </div>
    </div>
  );
}

function InvalidRoom() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b border-border/60 px-4">
        <Brand />
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card/70 p-6 text-center">
          <h1 className="font-display text-2xl">That room is not a room</h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Room codes are six characters. Ask your opponent for their invite
            bar and try again.
          </p>
          <Button asChild className="mt-5 w-full">
            <Link href="/">Back to the start</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function RoomScreen() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();

  const rawCode = typeof params.code === "string" ? params.code : "";
  const code = normalizeRoomCode(rawCode);
  const role = searchParams.get("host") === "1" ? "host" : "guest";
  const requested = searchParams.get("tc") ?? DEFAULT_TIME_CONTROL;
  const timeControl: TimeControlKey = TIME_CONTROLS.some(
    (control) => control.key === requested,
  )
    ? (requested as TimeControlKey)
    : DEFAULT_TIME_CONTROL;

  useRoomSession({ code, role, timeControl });

  if (!isRoomCode(code)) return <InvalidRoom />;
  return <GameView />;
}

export default function RoomPage() {
  return (
    <Suspense fallback={<RoomLoading />}>
      <RoomScreen />
    </Suspense>
  );
}
