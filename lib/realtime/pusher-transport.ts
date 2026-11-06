import Pusher from "pusher-js";
import { PUSHER_CLUSTER, PUSHER_KEY } from "./pusher-env";
import { roomChannelName } from "./codes";
import type {
  ConnectionStatus,
  PeerInfo,
  RoomEvent,
  RoomRole,
  Transport,
  TransportHandlers,
} from "./types";

interface PresenceMember {
  id: string;
  info?: { role?: RoomRole };
}

interface PresenceMembers {
  each: (callback: (member: PresenceMember) => void) => void;
}

interface ChannelLike {
  bind: (event: string, callback: (data: unknown) => void) => void;
  unbind_all: () => void;
}

const CONNECT_TIMEOUT_MS = 10_000;

export class PusherTransport implements Transport {
  readonly kind = "pusher" as const;
  private pusher: Pusher | null = null;
  private channel: ChannelLike | null = null;
  private handlers: TransportHandlers | null = null;
  private readonly code: string;

  constructor(code: string) {
    this.code = code;
  }

  connect(self: PeerInfo, handlers: TransportHandlers): Promise<void> {
    this.handlers = handlers;
    handlers.onStatus("connecting");

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        if (error) reject(error);
        else resolve();
      };

      const timeout = setTimeout(() => {
        handlers.onStatus("error");
        finish(new Error("The room relay timed out"));
      }, CONNECT_TIMEOUT_MS);

      try {
        const pusher = new Pusher(PUSHER_KEY, {
          cluster: PUSHER_CLUSTER,
          forceTLS: true,
          channelAuthorization: {
            endpoint: "/api/pusher/auth",
            transport: "ajax",
            params: { playerId: self.id, role: self.role },
          },
        });
        this.pusher = pusher;

        const channel = pusher.subscribe(roomChannelName(this.code)) as unknown as ChannelLike;
        this.channel = channel;

        channel.bind("pusher:subscription_succeeded", (raw) => {
          const members = raw as PresenceMembers;
          members.each((member) => {
            if (member.id === self.id) return;
            handlers.onPeerJoin({
              id: member.id,
              role: member.info?.role === "host" ? "host" : "guest",
            });
          });
          handlers.onStatus("connected");
          finish();
        });

        channel.bind("pusher:subscription_error", () => {
          handlers.onStatus("error");
          finish(new Error("Presence subscription failed"));
        });

        channel.bind("pusher:member_added", (raw) => {
          const member = raw as PresenceMember;
          if (member.id === self.id) return;
          handlers.onPeerJoin({
            id: member.id,
            role: member.info?.role === "host" ? "host" : "guest",
          });
        });

        channel.bind("pusher:member_removed", (raw) => {
          const member = raw as PresenceMember;
          handlers.onPeerLeave(member.id);
        });

        channel.bind("room-event", (raw) => {
          const event = raw as RoomEvent;
          if (event && event.senderId !== self.id) handlers.onEvent(event);
        });

        pusher.connection.bind("state_change", (states: { current: string }) => {
          const next: ConnectionStatus =
            states.current === "connected"
              ? "connected"
              : states.current === "connecting"
                ? "connecting"
                : states.current === "unavailable"
                  ? "reconnecting"
                  : states.current === "failed"
                    ? "error"
                    : "connecting";
          handlers.onStatus(next);
        });
      } catch (error) {
        handlers.onStatus("error");
        finish(error instanceof Error ? error : new Error("Pusher failed to start"));
      }
    });
  }

  send(event: RoomEvent) {
    void fetch("/api/rooms/relay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: this.code, event }),
      keepalive: true,
    }).catch(() => {
      this.handlers?.onStatus("reconnecting");
    });
  }

  disconnect() {
    this.channel?.unbind_all();
    this.channel = null;
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }
    this.handlers = null;
  }
}
