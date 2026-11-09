"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Loader2 } from "lucide-react";
import { getViewerBoard, opposite } from "@/lib/chess/board";
import { DIFFICULTY_META, PIECE_VALUES_CP } from "@/lib/chess/config";
import { capturedBy, type CapturedPiece } from "@/lib/chess/notation";
import type { Square } from "@/lib/chess/types";
import { useAiOpponent } from "@/hooks/use-ai-opponent";
import { useGameFeedback } from "@/hooks/use-game-feedback";
import { useLiveClocks } from "@/hooks/use-live-clocks";
import { useGameStore } from "@/store/game-store";
import { ChessBoard } from "@/components/board/chess-board";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GameControls } from "./game-controls";
import { GameHeader } from "./game-header";
import { GameOverDialog } from "./game-over-dialog";
import { MoveLog } from "./move-log";
import { NewGameDialog } from "./new-game-dialog";
import { PlayerBar } from "./player-bar";
import { PromotionDialog } from "./promotion-dialog";
import { CapturedPanel } from "./captured-panel";
import { StatusCard } from "./status-card";
import { RoomManager } from "@/components/room/room-manager";
import { WaitingRoom } from "./waiting-room";

function materialScore(pieces: CapturedPiece[]): number {
  return pieces.reduce(
    (total, piece) => total + PIECE_VALUES_CP[piece.type] * piece.count,
    0,
  );
}

export function GameView() {
  useAiOpponent();
  useGameFeedback();
  const clocks = useLiveClocks();
  const router = useRouter();

  const game = useGameStore((state) => state.game);
  const mode = useGameStore((state) => state.mode);
  const viewerColor = useGameStore((state) => state.viewerColor);
  const orientation = useGameStore((state) => state.orientation);
  const difficulty = useGameStore((state) => state.difficulty);
  const room = useGameStore((state) => state.room);
  const selected = useGameStore((state) => state.selected);
  const targets = useGameStore((state) => state.targets);
  const dangerTargets = useGameStore((state) => state.dangerTargets);
  const pendingPromotion = useGameStore((state) => state.pendingPromotion);
  const thinking = useGameStore((state) => state.thinking);
  const awaitingHost = useGameStore((state) => state.awaitingHost);
  const revealBoard = useGameStore((state) => state.revealBoard);

  const selectSquare = useGameStore((state) => state.selectSquare);
  const submitMove = useGameStore((state) => state.submitMove);
  const choosePromotion = useGameStore((state) => state.choosePromotion);
  const cancelPromotion = useGameStore((state) => state.cancelPromotion);
  const flipOrientation = useGameStore((state) => state.flipOrientation);
  const resign = useGameStore((state) => state.resign);
  const requestRematch = useGameStore((state) => state.requestRematch);
  const toggleRevealBoard = useGameStore((state) => state.toggleRevealBoard);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const hydratePreferences = useGameStore((state) => state.hydratePreferences);
  const leaveGame = useGameStore((state) => state.leaveGame);

  const [newGameOpen, setNewGameOpen] = useState(false);
  const [resignOpen, setResignOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [dismissedGameId, setDismissedGameId] = useState<string | null>(null);

  useEffect(() => {
    hydratePreferences();
  }, [hydratePreferences]);

  function handleLeave() {
    leaveGame();
    router.push("/");
  }

  const header = <GameHeader onInvite={() => setRoomOpen(true)} />;

  if (!game) {
    return (
      <div className="flex min-h-screen flex-col">
        {header}
        <WaitingRoom
          code={room?.code ?? ""}
          role={room?.role ?? "guest"}
          status={room?.status ?? "connecting"}
          transport={room?.transport ?? "local"}
          onLeave={handleLeave}
        />
        <RoomManager
          open={roomOpen}
          onOpenChange={setRoomOpen}
          shareCode={room?.code}
        />
      </div>
    );
  }

  const revealAll = revealBoard && game.status !== "active";
  const viewerBoard = getViewerBoard(game.fen, viewerColor, revealAll);
  const opponentColor = opposite(viewerColor);
  const isViewerTurn = game.turn === viewerColor;
  const lastOwnMove = [...game.history]
    .reverse()
    .find((move) => move.color === viewerColor);
  const lastOpponentMove = [...game.history]
    .reverse()
    .find((move) => move.color !== viewerColor);
  const ownLastMove = lastOwnMove
    ? { from: lastOwnMove.from, to: lastOwnMove.to, ply: lastOwnMove.ply }
    : null;
  const opponentLastMove = lastOpponentMove
    ? {
        from: lastOpponentMove.from,
        to: lastOpponentMove.to,
        ply: lastOpponentMove.ply,
        isCheck: lastOpponentMove.isCheck,
        isCheckmate: lastOpponentMove.isCheckmate,
      }
    : null;

  const yourCaptures = capturedBy(game.history, viewerColor);
  const theirCaptures = capturedBy(game.history, opponentColor);
  const materialDiff = materialScore(yourCaptures) - materialScore(theirCaptures);

  const opponentPresent = room ? room.opponentPresent : true;
  const canPlay =
    game.status === "active" &&
    isViewerTurn &&
    !pendingPromotion &&
    !awaitingHost &&
    !thinking &&
    opponentPresent;

  const opponentName = mode === "ai" ? "The Engine" : "Hidden opponent";
  const opponentNote =
    mode === "ai"
      ? `${DIFFICULTY_META[difficulty].label} · Black`
      : opponentColor === "w"
        ? "White"
        : "Black";

  const showGameOver =
    game.status !== "active" && dismissedGameId !== game.id;

  function handleMove(from: Square, to: Square) {
    submitMove({ from, to });
  }

  function handleResign() {
    resign();
    setResignOpen(false);
  }

  function handleReveal() {
    if (!game) return;
    toggleRevealBoard();
    setDismissedGameId(game.id);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {header}

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-3 pb-10 pt-4 sm:px-5 sm:pt-6 lg:px-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
          <section className="flex min-w-0 flex-col gap-2.5">
            {room && !room.opponentPresent && game.status === "active" ? (
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.055] px-3 py-2 text-[11px] text-primary/90">
                <Loader2 className="size-3.5 animate-spin" />
                <span className="truncate">
                  {room.role === "host"
                    ? "Waiting for your opponent to join"
                    : "Opponent reconnecting — the board is paused"}
                </span>
                <button
                  type="button"
                  onClick={() => setRoomOpen(true)}
                  className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] underline-offset-4 hover:underline"
                >
                  Invite
                </button>
              </div>
            ) : null}

            {awaitingHost ? (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-white/[0.025] px-3 py-2 text-[11px] text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary/80" />
                Waiting for the host to confirm your move…
              </div>
            ) : null}

            <PlayerBar
              color={opponentColor}
              name={opponentName}
              note={opponentNote}
              active={game.status === "active" && !isViewerTurn}
              clockMs={clocks ? clocks[opponentColor] : null}
              captured={theirCaptures}
              material={materialDiff < 0 ? -materialDiff : 0}
              hidden
              thinking={thinking}
              online={Boolean(room)}
            />

            <ChessBoard
              fen={game.fen}
              orientation={orientation}
              viewerColor={viewerColor}
              selected={selected}
              targets={targets}
              dangerTargets={dangerTargets}
              lastMove={ownLastMove}
              opponentLastMove={opponentLastMove}
              interactive={canPlay}
              revealAll={revealAll}
              onSelect={selectSquare}
              onMove={handleMove}
            />

            <PlayerBar
              color={viewerColor}
              name="You"
              note={viewerColor === "w" ? "White" : "Black"}
              active={game.status === "active" && isViewerTurn}
              clockMs={clocks ? clocks[viewerColor] : null}
              captured={yourCaptures}
              material={materialDiff > 0 ? materialDiff : 0}
              isYou
              online={Boolean(room)}
            />

            <p className="px-1 text-[10px] leading-relaxed text-muted-foreground/50">
              Your pieces and any active checking attackers are drawn in full.
              Other enemy pieces are anonymous shadows; a capture identifies
              the taken piece in the log and captured tracker.
              <span className="mt-0.5 block">
                Gold is your last move; blue is theirs. A red ! marks a move that
                would leave your king in check.
              </span>
            </p>
          </section>

          <aside className="flex min-w-0 flex-col gap-3">
            <StatusCard
              game={game}
              viewerColor={viewerColor}
              room={room}
              thinking={thinking}
              hiddenCount={viewerBoard.hiddenCount}
              revealed={revealAll}
              onInvite={() => setRoomOpen(true)}
              onReveal={handleReveal}
            />
            <MoveLog history={game.history} viewerColor={viewerColor} />
            <CapturedPanel
              viewerColor={viewerColor}
              yourCaptures={yourCaptures}
              theirCaptures={theirCaptures}
              materialDiff={materialDiff}
            />
            <GameControls
              room={room}
              soundEnabled={soundEnabled}
              canResign={game.status === "active"}
              onInvite={() => setRoomOpen(true)}
              onNewGame={() => setNewGameOpen(true)}
              onFlip={flipOrientation}
              onToggleSound={toggleSound}
              onResign={() => setResignOpen(true)}
            />
          </aside>
        </div>
      </main>

      <NewGameDialog open={newGameOpen} onOpenChange={setNewGameOpen} />
      <RoomManager
        open={roomOpen}
        onOpenChange={setRoomOpen}
        shareCode={room?.code}
      />
      <PromotionDialog
        open={Boolean(pendingPromotion)}
        color={viewerColor}
        onSelect={choosePromotion}
        onCancel={cancelPromotion}
      />
      <GameOverDialog
        game={game}
        viewerColor={viewerColor}
        open={showGameOver}
        onOpenChange={(open) => {
          if (!open) setDismissedGameId(game.id);
        }}
        onRematch={requestRematch}
        onReveal={handleReveal}
        revealed={revealAll}
        online={Boolean(room)}
        opponentPresent={opponentPresent}
      />
      <Dialog open={resignOpen} onOpenChange={setResignOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Resign this game?</DialogTitle>
            <DialogDescription>
              The fog lifts for nobody. Your opponent takes the win and the
              result is final.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResignOpen(false)}>
              Keep playing
            </Button>
            <Button variant="destructive" onClick={handleResign}>
              <Flag className="size-4" />
              Resign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
