import { cn } from "@/lib/utils";
import type { Color, PieceSymbol } from "@/lib/chess/types";

const GLYPHS: Record<PieceSymbol, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

interface PieceGlyphProps {
  type: PieceSymbol;
  color: Color;
  danger?: boolean;
  muted?: boolean;
  className?: string;
}

/**
 * Filled Unicode glyphs are used for both colours; the fill and rim shadows
 * distinguish ivory from ink without downloading piece sprites.
 */
export function PieceGlyph({
  type,
  color,
  danger,
  muted,
  className,
}: PieceGlyphProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "piece-glyph select-none",
        color === "w" ? "piece-white" : "piece-black",
        danger && "piece-danger",
        muted && "opacity-55",
        className,
      )}
    >
      {GLYPHS[type]}
    </span>
  );
}
