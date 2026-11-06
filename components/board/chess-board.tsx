"use client";

import { useMemo, useRef, useState } from "react";
import {
  FILES,
  RANKS,
  getViewerBoard,
  isLightSquare,
} from "@/lib/chess/board";
import { PIECE_NAMES } from "@/lib/chess/config";
import type { BoardPiece, Color, Square } from "@/lib/chess/types";
import type { CapturedReveal } from "@/store/game-store";
import { cn } from "@/lib/utils";
import { PieceGlyph } from "./piece-glyph";

interface ChessBoardProps {
  fen: string;
  orientation: Color;
  viewerColor: Color;
  selected: Square | null;
  targets: Square[];
  /** Only ever the viewer's own last move — opponent moves must stay hidden. */
  lastMove: { from: Square; to: Square; ply: number } | null;
  reveal: CapturedReveal | null;
  interactive: boolean;
  revealAll?: boolean;
  onSelect: (square: Square) => void;
  onMove: (from: Square, to: Square) => void;
}

interface DragState {
  from: Square;
  piece: BoardPiece;
  x: number;
  y: number;
}

interface PointerState {
  from: Square;
  piece: BoardPiece;
  startX: number;
  startY: number;
  moved: boolean;
}

function squareFromEvent(event: React.PointerEvent<HTMLDivElement>): Square | null {
  const element = event.target as HTMLElement | null;
  const squareElement = element?.closest("[data-square]") as HTMLElement | null;
  return squareElement?.dataset.square ?? null;
}

function squareFromPoint(x: number, y: number): Square | null {
  const element = document.elementFromPoint(x, y) as HTMLElement | null;
  const squareElement = element?.closest("[data-square]") as HTMLElement | null;
  return squareElement?.dataset.square ?? null;
}

export function ChessBoard({
  fen,
  orientation,
  viewerColor,
  selected,
  targets,
  lastMove,
  reveal,
  interactive,
  revealAll = false,
  onSelect,
  onMove,
}: ChessBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<PointerState | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hover, setHover] = useState<Square | null>(null);

  const viewerBoard = useMemo(
    () => getViewerBoard(fen, viewerColor, revealAll),
    [fen, viewerColor, revealAll],
  );

  const squares = useMemo(() => {
    const files: readonly string[] =
      orientation === "w" ? FILES : [...FILES].reverse();
    const ranks: readonly string[] =
      orientation === "w" ? [...RANKS].reverse() : RANKS;
    return ranks.flatMap((rank) =>
      files.map((file) => `${file}${rank}`),
    ) as Square[];
  }, [orientation]);

  const targetSet = useMemo(() => new Set(targets), [targets]);
  const checkerSet = useMemo(
    () => new Set(viewerBoard.checkers),
    [viewerBoard.checkers],
  );

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!interactive || event.button !== 0) return;
    const square = squareFromEvent(event);
    if (!square) return;

    const piece = viewerBoard.board[square];
    if (piece && piece.color === viewerColor) {
      onSelect(square);
      pointerRef.current = {
        from: square,
        piece,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    onSelect(square);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current;
    if (!pointer) return;

    if (!pointer.moved) {
      const distance = Math.hypot(
        event.clientX - pointer.startX,
        event.clientY - pointer.startY,
      );
      if (distance < 5) return;
      pointer.moved = true;
    }

    const rect = boardRef.current?.getBoundingClientRect();
    setDrag({
      from: pointer.from,
      piece: pointer.piece,
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    });
    setHover(squareFromPoint(event.clientX, event.clientY));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current;
    pointerRef.current = null;
    setDrag(null);
    setHover(null);
    if (!pointer?.moved) return;

    const target = squareFromPoint(event.clientX, event.clientY);
    if (target && target !== pointer.from) onMove(pointer.from, target);
  }

  function handlePointerCancel() {
    pointerRef.current = null;
    setDrag(null);
    setHover(null);
  }

  return (
    <div className="board-frame rounded-xl border border-white/[0.05] p-2 sm:p-2.5">
      <div
        ref={boardRef}
        role="grid"
        aria-label="Fog of war chess board"
        className="chess-board relative aspect-square w-full select-none overflow-hidden rounded-[6px]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onContextMenu={(event) => event.preventDefault()}
      >
        <div className="grid h-full w-full grid-cols-8 grid-rows-8">
          {squares.map((square, index) => {
            const row = Math.floor(index / 8);
            const column = index % 8;
            const piece = viewerBoard.board[square];
            const isHiddenPiece = viewerBoard.hiddenSquares.has(square);
            const isLight = isLightSquare(square);
            const isSelected = selected === square;
            const isTarget = targetSet.has(square);
            const isCaptureTarget = isTarget && Boolean(piece);
            const isLast =
              lastMove !== null &&
              (lastMove.from === square || lastMove.to === square);
            const isCheck = viewerBoard.inCheck && viewerBoard.king === square;
            const isHover = hover === square && drag !== null;
            const isDanger = Boolean(piece && checkerSet.has(square));
            const showFile = row === 7;
            const showRank = column === 0;

            return (
              <div
                key={square}
                data-square={square}
                role="gridcell"
                aria-label={
                  piece
                    ? `${piece.color === "w" ? "White" : "Black"} ${
                        PIECE_NAMES[piece.type]
                      } on ${square}`
                    : isHiddenPiece
                      ? `Hidden enemy piece on ${square}`
                      : `Empty square ${square}`
                }
                className={cn(
                  "relative flex items-center justify-center",
                  isLight ? "sq-light" : "sq-dark",
                  interactive && "cursor-pointer",
                )}
              >
                {isHiddenPiece ? (
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    aria-hidden
                  >
                    <div className="hidden-piece-shadow" />
                  </div>
                ) : null}

                {isLast ? (
                  <div className="absolute inset-0 bg-primary/[0.15]" />
                ) : null}

                {isSelected ? (
                  <div className="absolute inset-0 bg-primary/[0.2] shadow-[inset_0_0_0_2px_rgba(227,195,141,0.9)]" />
                ) : null}

                {isHover ? (
                  <div className="absolute inset-0 ring-2 ring-inset ring-primary/80" />
                ) : null}

                {isCheck ? (
                  <div className="check-square absolute inset-0" />
                ) : null}

                {isTarget && !isCaptureTarget ? (
                  <div className="pointer-events-none absolute size-[24%] rounded-full bg-[#e3c38d]/85 shadow-[0_0_12px_rgba(227,195,141,0.55)]" />
                ) : null}

                {isCaptureTarget ? (
                  <div className="pointer-events-none absolute inset-[6%] rounded-[4px] ring-2 ring-inset ring-primary/85" />
                ) : null}

                {piece ? (
                  <div
                    className={cn(
                      "pointer-events-none relative z-10 flex size-full items-center justify-center",
                      drag?.from === square && "opacity-20",
                    )}
                  >
                    <PieceGlyph
                      key={
                        lastMove && lastMove.to === square
                          ? `ply-${lastMove.ply}`
                          : square
                      }
                      type={piece.type}
                      color={piece.color}
                      danger={isDanger}
                      className={cn(
                        "board-piece",
                        lastMove?.to === square && "animate-settle",
                      )}
                    />
                  </div>
                ) : null}

                {reveal && reveal.square === square ? (
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <PieceGlyph
                      type={reveal.piece}
                      color={reveal.color}
                      className="board-piece animate-capture-reveal drop-shadow-[0_0_12px_rgba(227,195,141,0.45)]"
                    />
                  </div>
                ) : null}

                {showFile ? (
                  <span
                    className={cn(
                      "pointer-events-none absolute bottom-0.5 right-1 text-[8.5px] font-semibold uppercase tracking-wide",
                      isLight ? "text-black/30" : "text-white/35",
                    )}
                  >
                    {square[0]}
                  </span>
                ) : null}

                {showRank ? (
                  <span
                    className={cn(
                      "pointer-events-none absolute left-1 top-0.5 text-[8.5px] font-semibold",
                      isLight ? "text-black/30" : "text-white/35",
                    )}
                  >
                    {square[1]}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div
          className="board-fog pointer-events-none absolute inset-0 z-20"
          aria-hidden
        >
          <div className="animate-mist absolute -inset-[10%] bg-[radial-gradient(45%_35%_at_30%_25%,rgba(180,214,197,0.08),transparent_70%)]" />
        </div>

        {drag ? (
          <div
            className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2"
            style={{ left: drag.x, top: drag.y }}
          >
            <PieceGlyph
              type={drag.piece.type}
              color={drag.piece.color}
              className="text-[clamp(34px,9cqw,58px)] drop-shadow-[0_14px_18px_rgba(0,0,0,0.55)]"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
