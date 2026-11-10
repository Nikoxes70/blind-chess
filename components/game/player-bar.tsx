"use client";

import { Crown, EyeOff, User } from "lucide-react";
import { opposite } from "@/lib/chess/board";
import type { Color } from "@/lib/chess/types";
import type { CapturedPiece } from "@/lib/chess/notation";
import { cn, formatClock } from "@/lib/utils";
import { PieceGlyph } from "@/components/board/piece-glyph";
import { useI18n } from "@/components/i18n-provider";

interface PlayerBarProps {
  color: Color;
  name: string;
  note: string;
  active: boolean;
  clockMs: number | null;
  captured: CapturedPiece[];
  material: number;
  isYou?: boolean;
  hidden?: boolean;
  thinking?: boolean;
  online?: boolean;
}

export function PlayerBar({
  color,
  name,
  note,
  active,
  clockMs,
  captured,
  material,
  isYou,
  hidden,
  thinking,
  online,
}: PlayerBarProps) {
  const { t } = useI18n();
  const capturedCount = captured.reduce((sum, piece) => sum + piece.count, 0);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-2.5 py-2 transition-colors sm:px-3",
        active
          ? "border-primary/25 bg-primary/[0.055]"
          : "border-transparent bg-white/[0.015]",
      )}
    >
      <div
        className={cn(
          "relative flex size-8 shrink-0 items-center justify-center rounded-full border sm:size-9",
          active
            ? "border-primary/35 bg-primary/10 text-primary"
            : "border-border bg-white/[0.03] text-muted-foreground",
        )}
      >
        {hidden ? (
          <EyeOff className="size-3.5" />
        ) : isYou ? (
          <User className="size-3.5" />
        ) : (
          <Crown className="size-3.5" />
        )}
        {active ? (
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(227,195,141,0.7)]" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-medium text-foreground/95">
            {name}
          </span>
          <span className="truncate text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {note}
          </span>
          {thinking ? (
            <span className="animate-breathe ml-auto hidden text-[10px] text-primary/80 sm:inline">
              {t("player.thinking")}
            </span>
          ) : null}
        </div>

        <div className="mt-0.5 flex h-4 items-center gap-0.5 overflow-hidden">
          {capturedCount === 0 ? (
            <span className="text-[10px] text-muted-foreground/45">
              {t("player.noCapturesYet")}
            </span>
          ) : (
            <>
              {captured.map((piece) =>
                Array.from({ length: piece.count }).map((_, index) => (
                  <PieceGlyph
                    key={`${piece.type}-${index}`}
                    type={piece.type}
                    color={opposite(color)}
                    muted
                    className="text-[14px] leading-none"
                  />
                )),
              )}
              {material > 0 ? (
                <span className="ml-1 text-[10px] font-medium text-primary/80">
                  +{material}
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>

      {online ? (
        <span
          className={cn(
            "hidden size-1.5 shrink-0 rounded-full sm:block",
            active ? "bg-primary" : "bg-muted-foreground/30",
          )}
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          "min-w-[62px] rounded-md border px-2 py-1 text-right font-mono text-[13px] tabular-nums transition-colors",
          active
            ? "border-primary/30 bg-black/35 text-foreground"
            : "border-transparent text-muted-foreground/80",
        )}
        aria-label={t("player.clockAria", { name })}
      >
        {clockMs === null ? (
          <span className="text-muted-foreground/60">∞</span>
        ) : (
          formatClock(clockMs)
        )}
      </div>
    </div>
  );
}
