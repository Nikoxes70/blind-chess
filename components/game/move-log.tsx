"use client";

import { useEffect, useRef } from "react";
import { EyeOff, ScrollText } from "lucide-react";
import { opposite } from "@/lib/chess/board";
import { PIECE_NAME_KEYS } from "@/lib/chess/config";
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
import { useI18n } from "@/components/i18n-provider";

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
  const { t } = useI18n();

  if (!move) {
    return <span className="px-1.5 py-1 text-[12px] text-muted-foreground/25">·</span>;
  }

  const display = displayMove(move, viewer);
  const capturedName = move.captured
    ? t(PIECE_NAME_KEYS[move.captured])
    : null;
  const capturedSuffix = capturedName
    ? t("moveLog.capturedSuffix", { piece: capturedName })
    : "";
  const title = display.masked
    ? `${t("moveLog.hiddenMove")}${capturedSuffix}`
    : t("moveLog.moveTitle", {
        color: t(move.color === "w" ? "common.white" : "common.black"),
        san: move.san,
        captured: capturedSuffix,
      });

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
          aria-label={t("moveLog.capturedAria", {
            piece: capturedName ?? "",
          })}
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
  const { t } = useI18n();
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
        title={t("moveLog.title")}
        icon={<ScrollText className="size-3.5" />}
        hint={t("moveLog.hint", { count: history.length })}
        action={
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded p-1 text-muted-foreground/60 transition-colors hover:text-foreground"
                aria-label={t("moveLog.howAria")}
              >
                <EyeOff className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {t("moveLog.tooltip")}
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
              {t("moveLog.noMoves")}
              <br />
              {t("moveLog.fogIntact")}
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
          <span className="font-mono text-muted-foreground/80">
            {t("moveLog.footerPrefix")}
          </span>
          {t("moveLog.footerBody")}
        </p>
      </div>
    </Panel>
  );
}
