import { isPusherConfigured } from "./pusher-env";
import { LocalTransport } from "./local-transport";
import { PusherTransport } from "./pusher-transport";
import type {
  ConnectionStatus,
  PeerInfo,
  RoomEvent,
  RoomEventPayload,
  RoomRole,
  Transport,
  TransportKind,
} from "./types";

export interface RoomClientOptions {
  code: string;
  role: RoomRole;
  playerId: string;
  onEvent: (event: RoomEvent) => void;
  onPeerJoin: (peer: PeerInfo) => void;
  onPeerLeave: (peerId: string) => void;
  onStatus: (status: ConnectionStatus) => void;
}

export class RoomClient {
  readonly code: string;
  readonly role: RoomRole;
  readonly playerId: string;
  readonly transportKind: TransportKind;

  private readonly transport: Transport;
  private readonly options: RoomClientOptions;

  constructor(options: RoomClientOptions) {
    this.options = options;
    this.code = options.code;
    this.role = options.role;
    this.playerId = options.playerId;
    this.transport = isPusherConfigured()
      ? new PusherTransport(options.code)
      : new LocalTransport(options.code);
    this.transportKind = this.transport.kind;
  }

  connect(): Promise<void> {
    return this.transport.connect(
      { id: this.playerId, role: this.role },
      {
        onEvent: (event) => {
          if (event.senderId === this.playerId) return;
          this.options.onEvent(event);
        },
        onPeerJoin: this.options.onPeerJoin,
        onPeerLeave: this.options.onPeerLeave,
        onStatus: this.options.onStatus,
      },
    );
  }

  send(payload: RoomEventPayload) {
    this.transport.send({ ...payload, senderId: this.playerId } as RoomEvent);
  }

  destroy() {
    this.transport.disconnect();
  }
}
