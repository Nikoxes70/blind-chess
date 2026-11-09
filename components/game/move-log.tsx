"use client";

import { useEffect, useRef } from "react";
import { EyeOff, ScrollText } from "lucide-react";
import { opposite } from "@/lib/chess/board";
import { PIECE_NAMES } from "@/lib/chess/config";
import { displayMove, movePairs } from "@/lib/chess/notation";
import type { Color, MoveRecord } from "@/lib/chess/types";
import { cn } from "@/lib/utils";
import { PieceGlyph } from "@/components/board/piece-glyph";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoveLogProps {
  history: MoveRecord[];
  viewerColor: Color;
}

function MoveCell({
  move,
  viewer,
  latest,
}: {
  move?: MoveRecord;
  viewer: Color;
  latest: boolean;
}) {
  if (!move) {
    return <span className="px-1.5 py-1 text-[12px] text-muted-foreground/25">·</span>;
  }

  const display = displayMove(move, viewer);
  const capturedName = move.captured ? PIECE_NAMES[move.captured] : null;
  const title = display.masked
    ? `Hidden move${capturedName ? ` — captured ${capturedName.toLowerCase()}` : ""}`
    : `${move.color === "w" ? "White" : "Black"} ${move.san}${
        capturedName ? ` — captured ${capturedName.toLowerCase()}` : ""
      }`;

  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-1 rounded px-1.5 py-1 font-mono text-[12px] leading-none",
        display.masked
          ? "italic text-muted-foreground/70"
          : "text-foreground/90",
        display.check && "text-destructive/90",
        latest && "bg-primary/[0.09] text-primary",
      )}
      title={title}
    >
      <span className="truncate">{display.text}</span>
      {move.captured ? (
        <span
          className="flex shrink-0 items-center text-muted-foreground/80"
          aria-label={`Captured ${capturedName}`}
        >
          <PieceGlyph
            type={move.captured}
            color={opposite(move.color)}
            className="text-[11px] leading-none"
          />
        </span>
      ) : null}
    </span>
  );
}

export function MoveLog({ history, viewerColor }: MoveLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pairs = movePairs(history);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [history.length]);

  return (
    <Panel>
      <PanelHeader
        title="Memory log"
        icon={<ScrollText className="size-3.5" />}
        hint={`${history.length} plies`}
        action={
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded p-1 text-muted-foreground/60 transition-colors hover:text-foreground"
                aria-label="How the move log works"
              >
                <EyeOff className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Your moves are written out. Their moves stay hidden as{" "}
              <span className="font-mono">???</span> unless they give check — then
              the attacking piece is revealed. A capture identifies only the
              captured piece. Their latest move is marked on the board.
            </TooltipContent>
          </Tooltip>
        }
      />

      <div
        ref={scrollRef}
        className="scroll-thin max-h-[224px] min-h-[120px] overflow-y-auto py-1.5"
      >
        {pairs.length === 0 ? (
          <div className="flex h-[104px] flex-col items-center justify-center gap-1.5 px-4 text-center">
            <EyeOff className="size-4 text-muted-foreground/35" />
            <p className="text-[11px] leading-relaxed text-muted-foreground/60">
              No moves yet.
              <br />
              The fog is intact.
            </p>
          </div>
        ) : (
          pairs.map((pair, index) => {
            const isLastPair = index === pairs.length - 1;
            return (
              <div
                key={pair.number}
                className="grid grid-cols-[2.1rem_1fr_1fr] items-center gap-1 px-2.5 py-0.5"
              >
                <span className="text-[10px] tabular-nums text-muted-foreground/50">
                  {pair.number}.
                </span>
                <MoveCell
                  move={pair.white}
                  viewer={viewerColor}
                  latest={isLastPair && history.length % 2 === 1}
                />
                <MoveCell
                  move={pair.black}
                  viewer={viewerColor}
                  latest={isLastPair && history.length % 2 === 0}
                />
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-border/60 px-3 py-2">
        <p className="text-[10px] leading-relaxed text-muted-foreground/60">
          <span className="font-mono text-muted-foreground/80">???</span> is a
          hidden move. Their latest move is marked on the board; a check reveals
          the attacker, and a capture reveals only what was taken.
        </p>
      </div>
    </Panel>
  );
}
