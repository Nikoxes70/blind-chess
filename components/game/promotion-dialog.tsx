"use client";

import { Crown } from "lucide-react";
import type { Color, PromotionPiece } from "@/lib/chess/types";
import { PIECE_NAME_KEYS } from "@/lib/chess/config";
import { PieceGlyph } from "@/components/board/piece-glyph";
import { useI18n } from "@/components/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PromotionDialogProps {
  open: boolean;
  color: Color;
  onSelect: (piece: PromotionPiece) => void;
  onCancel: () => void;
}

const OPTIONS: PromotionPiece[] = ["q", "r", "b", "n"];

export function PromotionDialog({
  open,
  color,
  onSelect,
  onCancel,
}: PromotionDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="size-5 text-primary" />
            {t("promotion.title")}
          </DialogTitle>
          <DialogDescription>
            {t("promotion.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2">
          {OPTIONS.map((piece) => (
            <button
              key={piece}
              type="button"
              onClick={() => onSelect(piece)}
              className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-[#0a100d] px-2 py-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <PieceGlyph
                type={piece}
                color={color}
                className="text-[38px] transition-transform group-hover:scale-110"
              />
              <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground group-hover:text-foreground">
                {t(PIECE_NAME_KEYS[piece])}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("promotion.cancel")}
        </button>
      </DialogContent>
    </Dialog>
  );
}
