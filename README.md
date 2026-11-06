# Blind Chess

A fog-of-war chess game. You see your own pieces and nothing else. An opponent
piece becomes visible only while it is delivering check — and slips back into the
fog the moment the check is resolved.

Play the built-in engine (three difficulties) or invite a friend with a
six-character room code.

## What is implemented

- **Fog of war** — the board is rendered from a per-viewer projection
  (`getViewerBoard`). Hidden enemy pieces are omitted from the piece map passed to
  React; their squares are drawn as a generic, type-less shadow. The shadow
  reveals occupancy but never the piece's type.
- **Check reveal** — `chess.js` `attackers()` finds the checking pieces; those
  squares become visible for as long as the check lasts. Double checks reveal both
  attackers.
- **Standard rules** — legal move validation through `chess.js`, including
  castling, en passant, promotion and checkmate/stalemate/insufficient
  material/threefold/fifty-move.
- **Hidden collisions** — pseudo-legal targets are generated from the player's
  *known* board, so highlights never identify the piece standing on a shadowed
  square. Moving a rook or bishop through a fogged piece returns **“Path blocked
  by an invisible obstacle!”** without consuming the turn.
- **Masked move log** — your moves are written in SAN; the opponent's appear as
  `???` unless the move captures or gives check, in which case only the piece type
  is exposed (`Nx???`, `Q???+`).
- **Capture reveal** — capturing a hidden piece shows it for 1.2s with a synth
  cue before it is removed.
- **Captured panel** — both sides' captures, grouped and counted, so you can
  deduce the material still in the fog.
- **Clocks** — no clock, 1+0, 3+2, 5+0 and 10+0, with increments and flag
  detection.
- **AI opponent** — an alpha-beta minimax engine running in a dedicated Web
  Worker with piece-square evaluation, quiescence search, iterative deepening and
  a time budget. Difficulty changes depth, time and blunder rate.
- **Online rooms** — Pusher Channels presence for join/leave plus server-relayed
  broadcast for move intents. A zero-config `BroadcastChannel` transport is used
  when Pusher keys are absent (same browser, two tabs).
- **Polish** — custom SVG-free board, drag and drop, tap-to-move, promotion picker,
  resign/rematch, room sharing, sound toggle, responsive layout and auto-reveal
  after the result.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

```bash
npm run typecheck
npm run build
```

## Online multiplayer

### Zero-config (local relay)

Without environment variables the room uses `BroadcastChannel`. Create a room,
copy the invite link, and open it in a **second tab in the same browser**. Both
tabs share the room instantly. This is the default and works offline.

### Pusher (cross-device)

1. Create a free Channels app at <https://dashboard.pusher.com/>.
2. Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=...
```

3. Restart `npm run dev`. The room header will show **room relay** instead of
   **local relay**.

Presence channels are enabled by default for Channels apps. Client events are
**not** required: every move goes through `POST /api/rooms/relay`, which validates
the room code, event type, sender and payload size before publishing.

### Authority model

The room creator is the **host** and plays White. The host holds the authoritative
`GameState`; the guest sends move intents and receives compressed snapshots:

```ts
{ fen, turn, status, winner, endReason, clocks, san: string[] }
```

The guest replays `san` locally to rebuild the move log (a ~1KB payload instead of
a growing object graph, and comfortably inside Pusher's 10KB event limit). The host
validates every guest move with the same engine used locally, then broadcasts the
new state. Rejections are sent only to the sender and become a toast.

## AI model

The engine is a compact negamax with alpha-beta pruning:

- material + piece-square tables (mirrored for Black),
- capture ordering (MVV-LVA),
- quiescence search on captures and promotions,
- iterative deepening with a hard time budget,
- a difficulty “blunder” chance for Easy/Medium.

Search runs in `lib/ai/engine.worker.ts`, so the UI never blocks. If a worker is
unavailable, the client falls back to a main-thread search and, as a last resort, a
random legal move.

> **Note on fairness:** the engine sees the full board, while you only see your own
> pieces and any checking attackers. Easy is deliberately forgiving; Hard is a
> genuine memory challenge.

## Project structure

```
app/
  page.tsx                 home + solo game
  room/[code]/page.tsx     hosted room route
  api/pusher/auth          presence authorization
  api/rooms/relay          validated event relay
components/
  board/chess-board.tsx    fog rendering, drag/drop, highlights
  game/game-view.tsx       layout and wiring
  game/*                   controls, log, captures, status, dialogs
  room/room-manager.tsx    create / join / share modal
  ui/*                     shadcn-style primitives
lib/
  chess/board.ts           FEN, geometry, attackers, viewer projection
  chess/game.ts            move validation, clocks, wire snapshots
  chess/notation.ts        masking and capture grouping
  ai/                      engine, worker, client
  realtime/                transport abstraction, room client
hooks/                     AI loop, live clocks, feedback, room session
store/game-store.ts        Zustand game + room state
```

## Tests / verification

`tsc` and the production build are the baseline checks:

```bash
npm run typecheck
npm run build
```

The fog engine can also be exercised headlessly. The script runs the same
`getViewerBoard` / `attemptMove` code the UI uses and asserts 38 cases: hidden
projections and shadow squares, the exact invisible-blocker error, turn
preservation, capture and check reveal/hide, promotion, castling, en passant,
checkmate and log masking.

```bash
npx --yes tsx scripts/verify-engine.ts
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add the six Pusher variables in **Project → Settings → Environment Variables**
(the two `NEXT_PUBLIC_*` ones are required by the browser, the other four by the
relay routes). Redeploy afterwards. No database, server process or cron job is
needed.

## Known limitations

- Rooms are host-authoritative in the browser. A determined guest could inspect
  the FEN in DevTools, as with any client-side chess game. The relay prevents
  forged *illegal* moves only in the sense that the host validates them; room
  codes are bearer secrets, not authenticated accounts.
- The host's in-memory state ends if the host closes the tab (there is no
  persistence or server-side game store).
- Pusher events are capped at 10KB; a full move list is compressed to SAN, which
  is fine for normal games.
- The engine is intentionally lightweight rather than a Stockfish-strength
  opponent.
- Fog shadows deliberately reveal that an enemy square is occupied, though not
  which piece stands there. Removing them would restore strict occupancy
  secrecy.
