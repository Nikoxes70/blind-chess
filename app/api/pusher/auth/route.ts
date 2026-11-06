import { NextResponse } from "next/server";
import Pusher from "pusher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createPusher(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) return null;

  return new Pusher({ appId, key, secret, cluster, useTLS: true });
}

export async function POST(request: Request) {
  const pusher = createPusher();
  if (!pusher) {
    return NextResponse.json(
      { error: "Pusher is not configured on this deployment." },
      { status: 503 },
    );
  }

  const body = await request.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channel = params.get("channel_name");
  const playerId = params.get("playerId");
  const role = params.get("role") === "host" ? "host" : "guest";

  if (!socketId || !channel || !playerId) {
    return NextResponse.json({ error: "Invalid authorization request." }, { status: 400 });
  }
  if (!/^presence-room-[A-Z0-9]{6}$/.test(channel)) {
    return NextResponse.json({ error: "Unknown room channel." }, { status: 403 });
  }
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(playerId)) {
    return NextResponse.json({ error: "Invalid player identity." }, { status: 400 });
  }

  try {
    const auth = pusher.authorizeChannel(socketId, channel, {
      user_id: playerId,
      user_info: { role },
    });
    return NextResponse.json(auth);
  } catch {
    return NextResponse.json(
      { error: "Could not authorize the presence channel." },
      { status: 500 },
    );
  }
}
