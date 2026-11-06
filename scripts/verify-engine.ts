import {
  attemptMove,
  createGame,
  isPromotionAttempt,
  pseudoTargets,
} from "../lib/chess/game";
import { getCheckers, getViewerBoard } from "../lib/chess/board";
import { displayMove } from "../lib/chess/notation";
import type { GameState, MoveRecord } from "../lib/chess/types";

let failures = 0;
function check(condition: unknown, label: string) {
  if (condition) console.log("  ok  " + label);
  else { failures += 1; console.error("  FAIL " + label); }
}

const base = createGame({ mode: "ai", timeControl: "unlimited" });
function stateWith(fen: string): GameState {
  return { ...base, fen, turn: "w", history: [] };
}

console.log("fog projection");
const initial = getViewerBoard(base.fen, "w");
check(initial.hiddenCount === 16, "all 16 enemy pieces hidden at start");
check(!Object.values(initial.board).some((p) => p?.color === "b"), "no black piece reaches the render board");
check(getViewerBoard(base.fen, "b").hiddenCount === 16, "symmetric for black");
check(
  initial.hiddenSquares.size === 16 &&
    [...initial.hiddenSquares].every((square) => initial.board[square] === null),
  "all hidden pieces are shadow squares, none are rendered",
);
check(!initial.hiddenSquares.has("e1"), "own pieces are never shadowed");

console.log("invisible blockers");
const blocked = attemptMove(
  stateWith("4k3/8/8/8/p7/8/8/R3K3 w - - 0 1"),
  { from: "a1", to: "a5" },
  "w",
);
check(!blocked.ok && blocked.reason === "blocked", "rook cannot pass a hidden pawn");
check(!blocked.ok && blocked.message === "Path blocked by an invisible obstacle!", "exact invisible-obstacle message");
check(!blocked.ok && !("state" in blocked), "blocked attempt does not consume a turn");

const capture = attemptMove(
  stateWith("4k3/8/8/8/p7/8/8/R3K3 w - - 0 1"),
  { from: "a1", to: "a4" },
  "w",
);
check(capture.ok && capture.move.captured === "p", "capturing the invisible pawn succeeds");
check(capture.ok && capture.move.capturedSquare === "a4", "captured square recorded for the reveal");
check(capture.ok && capture.state.history.length === 1, "capture consumed exactly one ply");

console.log("check reveal");
const checkPosition = "4k3/8/8/8/8/8/4r3/4K3 w - - 0 1";
const inCheck = getViewerBoard(checkPosition, "w");
check(inCheck.inCheck, "king in check detected");
check(inCheck.checkers.length === 1 && inCheck.checkers[0] === "e2", "checking rook located");
check(inCheck.board.e2?.type === "r", "checking piece is visible");
check(inCheck.board.e8 === null, "enemy king stays hidden during check");
check(
  inCheck.hiddenSquares.size === 1 &&
    !inCheck.hiddenSquares.has("e2") &&
    inCheck.hiddenSquares.has("e8"),
  "only the checking piece leaves the shadows",
);
check(!getViewerBoard(checkPosition, "b").inCheck, "the other side is not falsely in check");

const resolved = getViewerBoard("4k3/8/8/8/8/8/5r2/4K3 w - - 0 1", "w");
check(!resolved.inCheck, "resolved position is not in check");
check(resolved.board.f2 === null, "non-checking piece returns to the fog");
check(
  resolved.hiddenSquares.size === 2 && resolved.hiddenSquares.has("f2"),
  "resolved checker returns to the shadows",
);

console.log("pseudo-legal highlights");
const pawnTargets = pseudoTargets(base, "e2", "w");
check(pawnTargets.includes("e3") && pawnTargets.includes("e4"), "pawn pushes highlighted");
check(pawnTargets.includes("d3") && pawnTargets.includes("f3"), "empty diagonals highlight as possible captures");
check(!pawnTargets.includes("e5"), "pawn does not highlight beyond its range");
const knightTargets = pseudoTargets(base, "b1", "w");
check(knightTargets.includes("a3") && knightTargets.includes("c3"), "knight pattern highlighted");
check(!knightTargets.includes("d2"), "own pieces are never targets");
check(!pseudoTargets(base, "e1", "w").includes("g1"), "castling not offered through visible pieces");

console.log("promotion and illegal paths");
const promoState = stateWith("4k3/P7/8/8/8/8/8/4K3 w - - 0 1");
check(isPromotionAttempt(promoState, "a7", "a8"), "promotion attempt detected");
const promo = attemptMove(promoState, { from: "a7", to: "a8", promotion: "q" }, "w");
check(promo.ok && promo.move.promotion === "q", "promotion applied");
check(promo.ok && promo.move.san === "a8=Q+", "promotion SAN is correct");
const emptyDiagonal = attemptMove(
  stateWith("4k3/8/8/8/8/8/4P3/4K3 w - - 0 1"),
  { from: "e2", to: "d3" },
  "w",
);
check(!emptyDiagonal.ok && emptyDiagonal.reason === "illegal", "diagonal onto an empty square is rejected");
check(!emptyDiagonal.ok && !emptyDiagonal.message.includes("invisible"), "empty-square rejection does not reveal a hidden piece");

console.log("checkmate and notation masking");
const mate = attemptMove(
  stateWith("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1"),
  { from: "a1", to: "a8" },
  "w",
);
check(mate.ok && mate.state.status === "checkmate", "back-rank mate detected");
check(mate.ok && mate.state.winner === "w", "winner set");
check(mate.ok && getCheckers(mate.state.fen, "b").length > 0, "mated king is in check");

const record: MoveRecord = {
  ply: 1, color: "b", san: "Nxc6+", from: "b4", to: "c6", piece: "n",
  captured: "p", capturedSquare: "c6", isCheck: true, isCheckmate: false,
  isCastle: false, isEnPassant: false, isBigPawn: false,
};
check(displayMove(record, "w").text === "Nx???+", "capture + check reveals only the piece type");
check(displayMove(record, "b").text === "Nxc6+", "own move shows full SAN");
check(displayMove({ ...record, captured: undefined, isCheck: false }, "w").text === "???", "quiet hidden move is ???");
check(displayMove({ ...record, captured: undefined }, "w").text === "N???+", "check without capture reveals the piece");

console.log(failures === 0 ? "\nALL ENGINE CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
