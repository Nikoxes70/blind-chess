"use client";

import { Chess } from "chess.js";
import { create } from "zustand";
import { getSoundEngine } from "@/lib/audio/sounds";
import { opposite, parseFen } from "@/lib/chess/board";
import {
  attemptMove,
  createGame,
  elapsedForTurn,
  isPromotionAttempt,
  kingSafetyTargets,
  legalTargets,
  liveClockRemaining,
  resignGame,
  timeoutGame,
  toWire,
  fromWire,
  type ClockAnchor,
} from "@/lib/chess/game";
import { DEFAULT_TIME_CONTROL } from "@/lib/chess/config";
import type {
  Color,
  Difficulty,
  GameMode,
  GameState,
  MoveInput,
  PromotionPiece,
  Square,
  TimeControlKey,
  WireGameState,
} from "@/lib/chess/types";
import type { RoomClient } from "@/lib/realtime/room-client";
import type { ConnectionStatus, RoomRole, TransportKind } from "@/lib/realtime/types";

export interface RoomSession {
  code: string;
  role: RoomRole;
  status: ConnectionStatus;
  opponentPresent: boolean;
  opponentId: string | null;
  transport: TransportKind;
}

interface GameError {
  id: number;
  message: string;
}

export interface GameStore {
  mode: GameMode | null;
  game: GameState | null;
  viewerColor: Color;
  orientation: Color;
  difficulty: Difficulty;
  timeControl: TimeControlKey;

  selected: Square | null;
  targets: Square[];
  dangerTargets: Square[];
  pendingPromotion: MoveInput | null;
  thinking: boolean;
  awaitingHost: boolean;
  revealBoard: boolean;

  soundEnabled: boolean;
  room: RoomSession | null;
  roomClient: RoomClient | null;
  clockAnchor: ClockAnchor | null;
  error: GameError | null;

  startAiGame: (options?: {
    difficulty?: Difficulty;
    timeControl?: TimeControlKey;
  }) => void;
  prepareRoom: (options: {
    code: string;
    role: RoomRole;
    timeControl: TimeControlKey;
  }) => void;
  attachRoomClient: (client: RoomClient, session: RoomSession) => void;
  updateRoom: (patch: Partial<RoomSession>) => void;
  setRoomClient: (client: RoomClient | null) => void;
  pushState: () => void;
  receiveState: (wire: WireGameState) => void;
  receivePeerMove: (input: MoveInput, actor: Color) => void;
  rejectMove: (message: string) => void;
  receiveResign: (color: Color) => void;
  receiveFlag: (color: Color) => void;

  selectSquare: (square: Square) => void;
  clearSelection: () => void;
  submitMove: (input: MoveInput) => void;
  choosePromotion: (piece: PromotionPiece) => void;
  cancelPromotion: () => void;
  resign: () => void;
  claimTimeout: (color: Color) => void;
  requestRematch: () => void;
  startRematch: () => void;

  setDifficulty: (difficulty: Difficulty) => void;
  setTimeControl: (key: TimeControlKey) => void;
  flipOrientation: () => void;
  toggleSound: () => void;
  hydratePreferences: () => void;
  toggleRevealBoard: () => void;
  setThinking: (thinking: boolean) => void;
  setAwaitingHost: (awaiting: boolean) => void;

  applyEngineMove: (move: { from: string; to: string; promotion?: PromotionPiece }) => void;
  playFallbackAiMove: () => void;

  pushError: (message: string) => void;
  clearError: (id?: number) => void;
  leaveGame: () => void;
}

let errorSequence = 0;
let lastError = { message: "", at: 0 };

function readSoundPreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem("bc:sound") !== "off";
  } catch {
    return true;
  }
}

export const useGameStore = create<GameStore>()((set, get) => {
  const commit = (next: GameState) => {
    set({
      game: next,
      selected: null,
      targets: [],
      dangerTargets: [],
      pendingPromotion: null,
      awaitingHost: false,
      clockAnchor: {
        gameId: next.id,
        ply: next.history.length,
        at: Date.now(),
      },
      revealBoard: false,
    });

    const { room, roomClient } = get();
    if (room?.role === "host" && roomClient) {
      roomClient.send({ type: "state", state: toWire(next) });
    }
  };

  const pushError = (message: string) => {
    const now = Date.now();
    if (lastError.message === message && now - lastError.at < 900) return;
    lastError = { message, at: now };
    set({ error: { id: ++errorSequence, message } });
  };

  return {
    mode: null,
    game: null,
    viewerColor: "w",
    orientation: "w",
    difficulty: "medium",
    timeControl: DEFAULT_TIME_CONTROL,

    selected: null,
    targets: [],
    dangerTargets: [],
    pendingPromotion: null,
    thinking: false,
    awaitingHost: false,
    revealBoard: false,

    soundEnabled: true,
    room: null,
    roomClient: null,
    clockAnchor: null,
    error: null,

    startAiGame: (options) => {
      const current = get();
      current.roomClient?.destroy();
      const difficulty = options?.difficulty ?? current.difficulty;
      const timeControl = options?.timeControl ?? current.timeControl;
      const game = createGame({ mode: "ai", timeControl });

      set({
        mode: "ai",
        game,
        viewerColor: "w",
        orientation: "w",
        difficulty,
        timeControl,
        selected: null,
        targets: [],
        dangerTargets: [],
        pendingPromotion: null,
        thinking: false,
        awaitingHost: false,
        revealBoard: false,
        error: null,
        room: null,
        roomClient: null,
        clockAnchor: { gameId: game.id, ply: 0, at: Date.now() },
      });
    },

    prepareRoom: ({ code, role, timeControl }) => {
      const current = get();
      if (
        current.mode === "online" &&
        current.room?.code === code &&
        current.room.role === role
      ) {
        set({
          selected: null,
          targets: [],
          dangerTargets: [],
          pendingPromotion: null,
          awaitingHost: false,
        });
        return;
      }

      current.roomClient?.destroy();
      const viewerColor: Color = role === "host" ? "w" : "b";
      const game =
        role === "host" ? createGame({ mode: "online", timeControl }) : null;

      set({
        mode: "online",
        game,
        viewerColor,
        orientation: viewerColor,
        timeControl,
        selected: null,
        targets: [],
        dangerTargets: [],
        pendingPromotion: null,
        thinking: false,
        awaitingHost: false,
        revealBoard: false,
        error: null,
        room: {
          code,
          role,
          status: "connecting",
          opponentPresent: false,
          opponentId: null,
          transport: "local",
        },
        roomClient: null,
        clockAnchor: game
          ? { gameId: game.id, ply: 0, at: Date.now() }
          : null,
      });
    },

    attachRoomClient: (client, session) => {
      set({
        roomClient: client,
        room: { ...session, transport: client.transportKind },
      });
    },

    updateRoom: (patch) => {
      const room = get().room;
      if (!room) return;
      set({ room: { ...room, ...patch } });
    },

    setRoomClient: (client) => {
      set({ roomClient: client });
    },

    pushState: () => {
      const { game, room, roomClient } = get();
      if (!game || room?.role !== "host" || !roomClient) return;
      roomClient.send({ type: "state", state: toWire(game) });
    },

    receiveState: (wire) => {
      const next = fromWire(wire);
      const current = get();
      const changed =
        !current.game ||
        current.game.id !== next.id ||
        current.game.history.length !== next.history.length;

      set({
        mode: "online",
        game: next,
        awaitingHost: false,
        pendingPromotion: null,
        selected: null,
        targets: [],
        dangerTargets: [],
        revealBoard: false,
        clockAnchor: changed
          ? { gameId: next.id, ply: next.history.length, at: Date.now() }
          : current.clockAnchor,
      });
    },

    receivePeerMove: (input, actor) => {
      const { game, clockAnchor, room, roomClient } = get();
      if (!game || game.status !== "active" || room?.role !== "host") return;

      const result = attemptMove(game, input, actor, {
        elapsedMs: elapsedForTurn(game, clockAnchor),
      });

      if (!result.ok) {
        if (room.opponentId && roomClient) {
          roomClient.send({
            type: "reject",
            targetId: room.opponentId,
            message: result.message,
          });
        }
        return;
      }
      commit(result.state);
    },

    rejectMove: (message) => {
      set({ awaitingHost: false });
      pushError(message);
    },

    receiveResign: (color) => {
      const { game, room } = get();
      if (!game || game.status !== "active" || room?.role !== "host") return;
      commit(resignGame(game, color));
    },

    receiveFlag: (color) => {
      const { game, clockAnchor, room } = get();
      if (!game?.clocks || game.status !== "active" || room?.role !== "host") return;
      if (game.turn !== color) return;
      const remaining = liveClockRemaining(game, clockAnchor);
      if (!remaining || remaining[color] > 0) return;
      commit(timeoutGame(game, color));
    },

    selectSquare: (square) => {
      const {
        game,
        viewerColor,
        selected,
        targets,
        dangerTargets,
        awaitingHost,
        room,
        pendingPromotion,
      } = get();
      if (!game || game.status !== "active" || pendingPromotion) return;
      if (game.turn !== viewerColor) return;
      if (awaitingHost) return;
      if (room && !room.opponentPresent) {
        pushError("Waiting for your opponent to join.");
        return;
      }

      if (selected && dangerTargets.includes(square)) {
        pushError("That move would leave your king in check.");
        return;
      }

      if (selected && targets.includes(square)) {
        get().submitMove({ from: selected, to: square });
        return;
      }

      const piece = parseFen(game.fen)[square];
      if (piece && piece.color === viewerColor) {
        set({
          selected: square,
          targets: legalTargets(game, square, viewerColor),
          dangerTargets: kingSafetyTargets(game, square, viewerColor),
        });
        if (get().soundEnabled) getSoundEngine().play("select");
        return;
      }

      set({ selected: null, targets: [], dangerTargets: [] });
    },

    clearSelection: () => {
      set({ selected: null, targets: [], dangerTargets: [] });
    },

    submitMove: (input) => {
      const state = get();
      const { game, viewerColor, room, roomClient, clockAnchor, pendingPromotion } = state;
      if (!game || game.status !== "active" || pendingPromotion) return;
      if (game.turn !== viewerColor) return;

      if (room && !room.opponentPresent) {
        pushError("Waiting for your opponent to join.");
        return;
      }

      if (kingSafetyTargets(game, input.from, viewerColor).includes(input.to)) {
        pushError("That move would leave your king in check.");
        return;
      }

      if (!input.promotion && isPromotionAttempt(game, input.from, input.to)) {
        set({ pendingPromotion: { from: input.from, to: input.to } });
        return;
      }

      if (room?.role === "guest") {
        const validation = attemptMove(game, input, viewerColor);
        if (!validation.ok) {
          pushError(validation.message);
          return;
        }
        roomClient?.send({
          type: "move",
          from: input.from,
          to: input.to,
          promotion: input.promotion,
        });
        set({
          selected: null,
          targets: [],
          dangerTargets: [],
          pendingPromotion: null,
          awaitingHost: true,
        });
        return;
      }

      const result = attemptMove(game, input, viewerColor, {
        elapsedMs: elapsedForTurn(game, clockAnchor),
      });
      if (!result.ok) {
        pushError(result.message);
        return;
      }
      commit(result.state);
    },

    choosePromotion: (piece) => {
      const pending = get().pendingPromotion;
      if (!pending) return;
      set({ pendingPromotion: null });
      get().submitMove({ ...pending, promotion: piece });
    },

    cancelPromotion: () => {
      set({ pendingPromotion: null });
    },

    resign: () => {
      const { game, viewerColor, room, roomClient } = get();
      if (!game || game.status !== "active") return;
      if (room?.role === "guest") {
        roomClient?.send({ type: "resign", color: viewerColor });
        getSoundEngine().play("end");
        return;
      }
      commit(resignGame(game, viewerColor));
    },

    claimTimeout: (color) => {
      const { game, clockAnchor, room, roomClient } = get();
      if (!game?.clocks || game.status !== "active") return;
      const remaining = liveClockRemaining(game, clockAnchor);
      if (!remaining || remaining[color] > 0) return;

      if (room?.role === "guest") {
        roomClient?.send({ type: "flag", color });
        return;
      }
      if (game.turn !== color) return;
      commit(timeoutGame(game, color));
    },

    requestRematch: () => {
      const { room, roomClient } = get();
      if (room?.role === "guest") {
        roomClient?.send({ type: "rematch" });
        return;
      }
      get().startRematch();
    },

    startRematch: () => {
      const { mode, timeControl, room, roomClient } = get();
      if (!mode) return;
      const game = createGame({ mode, timeControl });
      set({
        game,
        selected: null,
        targets: [],
        dangerTargets: [],
        pendingPromotion: null,
        thinking: false,
        awaitingHost: false,
        revealBoard: false,
        clockAnchor: { gameId: game.id, ply: 0, at: Date.now() },
      });
      if (room?.role === "host" && roomClient) {
        roomClient.send({ type: "state", state: toWire(game) });
      }
    },

    setDifficulty: (difficulty) => set({ difficulty }),
    setTimeControl: (timeControl) => set({ timeControl }),

    flipOrientation: () => {
      set({ orientation: opposite(get().orientation) });
    },

    toggleSound: () => {
      const enabled = !get().soundEnabled;
      set({ soundEnabled: enabled });
      getSoundEngine().setEnabled(enabled);
      if (enabled) getSoundEngine().play("select");
      try {
        window.localStorage.setItem("bc:sound", enabled ? "on" : "off");
      } catch {
        // Private-mode storage is best-effort.
      }
    },

    hydratePreferences: () => {
      const enabled = readSoundPreference();
      set({ soundEnabled: enabled });
      getSoundEngine().setEnabled(enabled);
    },

    toggleRevealBoard: () => {
      const { game, revealBoard } = get();
      if (!game || game.status === "active") return;
      set({ revealBoard: !revealBoard });
    },

    setThinking: (thinking) => set({ thinking }),
    setAwaitingHost: (awaitingHost) => set({ awaitingHost }),

    applyEngineMove: (move) => {
      const { game, clockAnchor } = get();
      if (!game || game.status !== "active" || game.turn !== "b") return;

      const result = attemptMove(game, move, "b", {
        elapsedMs: elapsedForTurn(game, clockAnchor),
      });

      if (!result.ok) {
        get().playFallbackAiMove();
        return;
      }
      commit(result.state);
    },

    playFallbackAiMove: () => {
      const { game, clockAnchor } = get();
      if (!game || game.status !== "active" || game.turn !== "b") return;

      const chess = new Chess(game.fen);
      const moves = chess.moves({ verbose: true });
      if (moves.length === 0) return;

      const move = moves[Math.floor(Math.random() * moves.length)];
      const result = attemptMove(
        game,
        {
          from: move.from,
          to: move.to,
          promotion: move.promotion as PromotionPiece | undefined,
        },
        "b",
        { elapsedMs: elapsedForTurn(game, clockAnchor) },
      );
      if (result.ok) commit(result.state);
    },

    pushError,
    clearError: (id) => {
      if (id !== undefined && get().error?.id !== id) return;
      set({ error: null });
    },

    leaveGame: () => {
      get().roomClient?.destroy();
      set({
        mode: null,
        game: null,
        room: null,
        roomClient: null,
        selected: null,
        targets: [],
        dangerTargets: [],
        pendingPromotion: null,
        thinking: false,
        awaitingHost: false,
        revealBoard: false,
        clockAnchor: null,
        error: null,
        orientation: "w",
        viewerColor: "w",
      });
    },
  };
});
