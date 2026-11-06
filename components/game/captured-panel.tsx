"use client";

import { Skull } from "lucide-react";
import { opposite } from "@/lib/chess/board";
import type { CapturedPiece } from "@/lib/chess/notation";
import type { Color } from "@/lib/chess/types";
import { cn } from "@/lib/utils";
import { PieceGlyph } from "@/components/board/piece-glyph";
import { Panel, PanelHeader } from "@/components/ui/panel";

interface CapturedPanelProps {
  viewerColor: Color;
  yourCaptures: CapturedPiece[];
  theirCaptures: CapturedPiece[];
  materialDiff: number;
}

function CaptureRow({
  label,
  pieces,
  color,
  advantage,
}: {
  label: string;
  pieces: CapturedPiece[];
  color: Color;
  advantage: number;
}) {
  const total = pieces.reduce((sum, piece) => sum + piece.count, 0);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="w-[68px] shrink-0 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">
        {label}
      </span>
      <div className="flex min-h-6 flex-1 flex-wrap items-center gap-0.5">
        {total === 0 ? (
          <span className="text-[11px] text-muted-foreground/35">Nothing yet</span>
        ) : (
          pieces.map((piece) =>
            Array.from({ length: piece.count }).map((_, index) => (
              <PieceGlyph
                key={`${piece.type}-${index}`}
                type={piece.type}
                color={color}
                muted
                className="text-[18px] leading-none"
              />
            )),
          )
        )}
      </div>
      {advantage > 0 ? (
        <span className="shrink-0 rounded border border-primary/20 bg-primary/[0.07] px-1.5 py-0.5 text-[10px] font-medium text-primary/90">
          +{advantage}
        </span>
      ) : (
        <span className="w-8 shrink-0" />
      )}
    </div>
  );
}

export function CapturedPanel({
  viewerColor,
  yourCaptures,
  theirCaptures,
  materialDiff,
}: CapturedPanelProps) {
  return (
    <Panel>
      <PanelHeader
        title="Captured"
        icon={<Skull className="size-3.5" />}
        hint="deduce what is left"
      />
      <div className="divide-y divide-border/50">
        <CaptureRow
          label="You took"
          pieces={yourCaptures}
          color={opposite(viewerColor)}
          advantage={materialDiff > 0 ? materialDiff : 0}
        />
        <CaptureRow
          label="They took"
          pieces={theirCaptures}
          color={viewerColor}
          advantage={materialDiff < 0 ? -materialDiff : 0}
        />
      </div>
      <div
        className={cn(
          "border-t border-border/60 px-4 py-2 text-[10px] leading-relaxed text-muted-foreground/55",
        )}
      >
        Every capture is public. Use the totals to count the pieces still hidden.
      </div>
    </Panel>
  );
}
