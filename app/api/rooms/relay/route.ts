import { NextResponse } from "next/server";
import Pusher from "pusher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EVENTS = new Set([
  "hello",
  "state",
  "move",
  "reject",
  "resign",
  "flag",
  "rematch",
]);

const MAX_EVENT_BYTES = 9_000;

function createPusher(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) return null;

  return new Pusher({ appId, key, secret, cluster, useTLS: true });
}

interface RelayBody {
  code?: unknown;
  event?: {
    type?: unknown;
    senderId?: unknown;
    [key: string]: unknown;
  };
}

export async function POST(request: Request) {
  const pusher = createPusher();
  if (!pusher) {
    return NextResponse.json(
      { error: "Pusher is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: RelayBody;
  try {
    body = (await request.json()) as RelayBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code : "";
  const event = body.event;

  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return NextResponse.json({ error: "Invalid room code." }, { status: 400 });
  }
  if (!event || typeof event.type !== "string" || !ALLOWED_EVENTS.has(event.type)) {
    return NextResponse.json({ error: "Unsupported room event." }, { status: 400 });
  }
  if (
    typeof event.senderId !== "string" ||
    event.senderId.length < 8 ||
    event.senderId.length > 80
  ) {
    return NextResponse.json({ error: "Invalid sender." }, { status: 400 });
  }
  if (JSON.stringify(event).length > MAX_EVENT_BYTES) {
    return NextResponse.json({ error: "Event payload too large." }, { status: 413 });
  }

  try {
    await pusher.trigger(`presence-room-${code}`, "room-event", event);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "The relay could not deliver the event." },
      { status: 502 },
    );
  }
}
