"use client";

import { useEffect, useMemo } from "react";
import { opposite } from "@/lib/chess/board";
import { isRoomCode } from "@/lib/realtime/codes";
import { getPlayerId } from "@/lib/realtime/identity";
import { RoomClient } from "@/lib/realtime/room-client";
import type { RoomEvent } from "@/lib/realtime/types";
import type { TimeControlKey } from "@/lib/chess/types";
import { useGameStore } from "@/store/game-store";

interface UseRoomSessionOptions {
  code: string;
  role: "host" | "guest";
  timeControl: TimeControlKey;
}

/**
 * Connects a room page to the relay and routes peer events into the store.
 * The host is authoritative: guests send intents, the host validates and
 * broadcasts the resulting snapshot.
 */
export function useRoomSession({ code, role, timeControl }: UseRoomSessionOptions) {
  const playerId = useMemo(() => getPlayerId(), []);

  useEffect(() => {
    if (!isRoomCode(code)) return;

    const store = useGameStore.getState();
    store.prepareRoom({ code, role, timeControl });

    let active = true;
    const client = new RoomClient({
      code,
      role,
      playerId,
      onEvent: (event) => handleEvent(event),
      onPeerJoin: (peer) => {
        useGameStore.getState().updateRoom({
          opponentPresent: true,
          opponentId: peer.id,
        });
        if (role === "host") {
          useGameStore.getState().pushState();
        }
      },
      onPeerLeave: (peerId) => {
        const state = useGameStore.getState();
        if (state.room?.opponentId && state.room.opponentId !== peerId) return;
        state.updateRoom({ opponentPresent: false, opponentId: null });
      },
      onStatus: (status) => {
        useGameStore.getState().updateRoom({ status });
      },
    });

    useGameStore.getState().attachRoomClient(client, {
      code,
      role,
      status: "connecting",
      opponentPresent: false,
      opponentId: null,
      transport: client.transportKind,
    });

    client
      .connect()
      .then(() => {
        if (!active) return;
        client.send({ type: "hello" });
      })
      .catch(() => {
        if (!active) return;
        useGameStore.getState().updateRoom({ status: "error" });
        useGameStore
          .getState()
          .pushError("Could not reach the room relay.", "errors.relayUnreachable");
      });

    function handleEvent(event: RoomEvent) {
      const state = useGameStore.getState();

      switch (event.type) {
        case "hello":
          if (role === "host") state.pushState();
          break;
        case "state":
          if (role === "guest") state.receiveState(event.state);
          break;
        case "move":
          if (role === "host") {
            state.receivePeerMove(
              { from: event.from, to: event.to, promotion: event.promotion },
              opposite(state.viewerColor),
            );
          }
          break;
        case "reject":
          if (event.targetId === playerId) {
            state.rejectMove(event.message, event.messageKey);
          }
          break;
        case "resign":
          if (role === "host") state.receiveResign(event.color);
          break;
        case "flag":
          if (role === "host") state.receiveFlag(event.color);
          break;
        case "rematch":
          if (role === "host") state.startRematch();
          break;
      }
    }

    return () => {
      active = false;
      client.destroy();
      const state = useGameStore.getState();
      if (state.roomClient === client) state.setRoomClient(null);
    };
  }, [code, role, timeControl, playerId]);

  const awaitingHost = useGameStore((state) => state.awaitingHost);
  useEffect(() => {
    if (!awaitingHost) return;
    const timer = window.setTimeout(() => {
      const state = useGameStore.getState();
      if (!state.awaitingHost) return;
      state.setAwaitingHost(false);
      state.pushError(
        "The host did not answer. Try your move again.",
        "errors.hostNoAnswer",
      );
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [awaitingHost]);
}
