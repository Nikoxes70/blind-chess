let cached: string | null = null;

/** Stable per-tab identity, so a reconnect is recognisable to the host. */
export function getPlayerId(): string {
  if (typeof window === "undefined") return "server";
  if (cached) return cached;

  try {
    const existing = window.sessionStorage.getItem("bc:player-id");
    if (existing) {
      cached = existing;
      return existing;
    }
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 12);
    window.sessionStorage.setItem("bc:player-id", id);
    cached = id;
    return id;
  } catch {
    cached = Math.random().toString(36).slice(2, 12);
    return cached;
  }
}
