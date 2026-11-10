"use client";

import { Skull } from "lucide-react";
import { opposite } from "@/lib/chess/board";
import type { CapturedPiece } from "@/lib/chess/notation";
import type { Color } from "@/lib/chess/types";
import { cn } from "@/lib/utils";
import { PieceGlyph } from "@/components/board/piece-glyph";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useI18n } from "@/components/i18n-provider";

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
  const { t } = useI18n();
  const total = pieces.reduce((sum, piece) => sum + piece.count, 0);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="w-[76px] shrink-0 text-[10px] leading-tight uppercase tracking-[0.12em] text-muted-foreground/60">
        {label}
      </span>
      <div className="flex min-h-6 flex-1 flex-wrap items-center gap-0.5">
        {total === 0 ? (
          <span className="text-[11px] text-muted-foreground/35">
            {t("captured.nothingYet")}
          </span>
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
  const { t } = useI18n();

  return (
    <Panel>
      <PanelHeader
        title={t("captured.title")}
        icon={<Skull className="size-3.5" />}
        hint={t("captured.hint")}
      />
      <div className="divide-y divide-border/50">
        <CaptureRow
          label={t("captured.youTook")}
          pieces={yourCaptures}
          color={opposite(viewerColor)}
          advantage={materialDiff > 0 ? materialDiff : 0}
        />
        <CaptureRow
          label={t("captured.theyTook")}
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
        {t("captured.footer")}
      </div>
    </Panel>
  );
}
