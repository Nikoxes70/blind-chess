export const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY ?? "";
export const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "";

/** True when the browser has enough configuration to open a hosted room. */
export function isPusherConfigured(): boolean {
  return Boolean(PUSHER_KEY && PUSHER_CLUSTER);
}
