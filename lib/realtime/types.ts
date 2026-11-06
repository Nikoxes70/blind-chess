import type { Color, PromotionPiece, WireGameState } from "@/lib/chess/types";

export type RoomRole = "host" | "guest";

export interface PeerInfo {
  id: string;
  role: RoomRole;
}

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export type RoomEventPayload =
  | { type: "hello" }
  | { type: "state"; state: WireGameState; to?: string }
  | {
      type: "move";
      from: string;
      to: string;
      promotion?: PromotionPiece;
    }
  | { type: "reject"; targetId: string; message: string }
  | { type: "resign"; color: Color }
  | { type: "flag"; color: Color }
  | { type: "rematch" };

export type RoomEvent = RoomEventPayload & { senderId: string };

export interface TransportHandlers {
  onEvent: (event: RoomEvent) => void;
  onPeerJoin: (peer: PeerInfo) => void;
  onPeerLeave: (peerId: string) => void;
  onStatus: (status: ConnectionStatus) => void;
}

export type TransportKind = "local" | "pusher";

export interface Transport {
  readonly kind: TransportKind;
  connect(self: PeerInfo, handlers: TransportHandlers): Promise<void>;
  send(event: RoomEvent): void;
  disconnect(): void;
}
