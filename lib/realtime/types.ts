import type {
  Color,
  PromotionPiece,
  Square,
  WireGameState,
} from "@/lib/chess/types";
import type { MessageKey } from "@/lib/i18n/messages";

export type RoomRole = "host" | "guest";

export type TransportKind = "local" | "pusher";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export interface PeerInfo {
  id: string;
  role: RoomRole;
}

export type RoomEventPayload =
  | { type: "hello" }
  | { type: "state"; state: WireGameState }
  | { type: "move"; from: Square; to: Square; promotion?: PromotionPiece }
  | { type: "reject"; targetId: string; message: string; messageKey?: MessageKey }
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

export interface Transport {
  readonly kind: TransportKind;
  connect(self: PeerInfo, handlers: TransportHandlers): Promise<void>;
  send(event: RoomEvent): void;
  disconnect(): void;
}
