import type {
  ConnectionStatus,
  PeerInfo,
  RoomEvent,
  Transport,
  TransportHandlers,
} from "./types";

type Envelope =
  | { kind: "presence"; peer: PeerInfo; reply: boolean }
  | { kind: "leave"; peerId: string }
  | { kind: "event"; event: RoomEvent };

const HEARTBEAT_MS = 2200;
/**
 * Hidden tabs throttle timers (Chrome can drop to one tick per minute), so a
 * short timeout would evict a healthy peer that is merely in the background.
 * Keep the window wider than the worst-case throttling interval.
 */
const PEER_TIMEOUT_MS = 75_000;

/**
 * Zero-configuration relay for two tabs on the same browser.
 * It mirrors the Pusher presence semantics closely enough that the rest of the
 * app does not care which transport is active.
 */
export class LocalTransport implements Transport {
  readonly kind = "local" as const;

  private channel: BroadcastChannel | null = null;
  private self: PeerInfo | null = null;
  private handlers: TransportHandlers | null = null;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private peers = new Map<string, number>();
  private closed = false;
  private readonly code: string;

  constructor(code: string) {
    this.code = code;
  }

  connect(self: PeerInfo, handlers: TransportHandlers): Promise<void> {
    this.self = self;
    this.handlers = handlers;

    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      handlers.onStatus("error");
      return Promise.reject(new Error("BroadcastChannel is unavailable"));
    }

    try {
      this.channel = new BroadcastChannel(`blindchess:${this.code}`);
    } catch {
      handlers.onStatus("error");
      return Promise.reject(new Error("Could not open the local room channel"));
    }

    this.channel.onmessage = (message: MessageEvent<Envelope>) => {
      this.handleEnvelope(message.data);
    };

    this.announce(true);
    this.heartbeat = setInterval(() => {
      this.announce(false);
      this.prunePeers();
    }, HEARTBEAT_MS);

    document.addEventListener("visibilitychange", this.handleVisibility);
    window.addEventListener("pagehide", this.handlePageHide);
    handlers.onStatus("connected");
    return Promise.resolve();
  }

  send(event: RoomEvent) {
    this.channel?.postMessage({ kind: "event", event } satisfies Envelope);
  }

  disconnect() {
    if (this.closed) return;
    this.closed = true;
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.heartbeat = null;

    if (typeof window !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibility);
      window.removeEventListener("pagehide", this.handlePageHide);
    }

    if (this.channel) {
      if (this.self) {
        this.channel.postMessage({
          kind: "leave",
          peerId: this.self.id,
        } satisfies Envelope);
      }
      this.channel.onmessage = null;
      this.channel.close();
      this.channel = null;
    }
    this.peers.clear();
  }

  private announce(reply: boolean) {
    if (!this.self || !this.channel) return;
    this.channel.postMessage({
      kind: "presence",
      peer: this.self,
      reply,
    } satisfies Envelope);
  }

  private handleEnvelope(envelope: Envelope) {
    if (!this.handlers || !this.self) return;

    if (envelope.kind === "presence") {
      if (envelope.peer.id === this.self.id) return;
      const isNew = !this.peers.has(envelope.peer.id);
      this.peers.set(envelope.peer.id, Date.now());
      if (isNew) this.handlers.onPeerJoin(envelope.peer);
      if (envelope.reply) this.announce(false);
      return;
    }

    if (envelope.kind === "leave") {
      if (this.peers.delete(envelope.peerId)) {
        this.handlers.onPeerLeave(envelope.peerId);
      }
      return;
    }

    if (envelope.event.senderId !== this.self.id) {
      if (this.peers.has(envelope.event.senderId)) {
        this.peers.set(envelope.event.senderId, Date.now());
      }
      this.handlers.onEvent(envelope.event);
    }
  }

  private prunePeers() {
    if (!this.handlers) return;
    const now = Date.now();
    for (const [peerId, lastSeen] of this.peers) {
      if (now - lastSeen > PEER_TIMEOUT_MS) {
        this.peers.delete(peerId);
        this.handlers.onPeerLeave(peerId);
      }
    }
  }

  private handlePageHide = () => {
    this.disconnect();
  };

  private handleVisibility = () => {
    if (document.visibilityState === "visible") this.announce(true);
  };
}
