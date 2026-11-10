"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  DoorOpen,
  EyeOff,
  Fingerprint,
  Play,
  Radar,
  ScanEye,
  Users,
} from "lucide-react";
import { DEFAULT_TIME_CONTROL, DIFFICULTY_META } from "@/lib/chess/config";
import type { Difficulty, TimeControlKey } from "@/lib/chess/types";
import { useGameStore } from "@/store/game-store";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Brand } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ChessBoard } from "@/components/board/chess-board";
import { TimeControlPicker } from "@/components/game/time-control-picker";
import { RoomManager } from "@/components/room/room-manager";

const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function StartScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const startAiGame = useGameStore((state) => state.startAiGame);
  const hydratePreferences = useGameStore((state) => state.hydratePreferences);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timeControl, setTimeControl] =
    useState<TimeControlKey>(DEFAULT_TIME_CONTROL);
  const [roomOpen, setRoomOpen] = useState(false);

  useEffect(() => {
    hydratePreferences();
  }, [hydratePreferences]);

  function startSolo() {
    startAiGame({ difficulty, timeControl });
    router.push("/");
  }

  const rules = [
    {
      icon: EyeOff,
      title: t("start.ruleOwnTitle"),
      body: t("start.ruleOwnBody"),
    },
    {
      icon: Radar,
      title: t("start.ruleCheckTitle"),
      body: t("start.ruleCheckBody"),
    },
    {
      icon: Brain,
      title: t("start.ruleMemoryTitle"),
      body: t("start.ruleMemoryBody"),
    },
  ];

  return (
    <div className="relative min-h-screen">
      <header className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5">
        <Brand />
        <div className="flex items-center gap-2">
          <a
            href="#how-it-works"
            className="hidden text-xs text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {t("start.howItWorks")}
          </a>
          <LanguageSwitcher />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRoomOpen(true)}
          >
            <Users className="size-3.5" />
            {t("start.multiplayer")}
          </Button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12 lg:pt-10">
        <section className="min-w-0">
          <Badge>
            <Fingerprint className="size-3" />
            {t("start.eyebrow")}
          </Badge>

          <h1 className="text-balance mt-5 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.94]">
            {t("start.heroLine1")}
            <br />
            <span className="text-primary">{t("start.heroLine2")}</span>
          </h1>

          <p className="text-balance mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {t("start.heroDescription")}
          </p>

          <div className="mt-8 rounded-xl border border-border/80 bg-card/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.07] text-primary">
                  <ScanEye className="size-3.5" />
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t("start.playEngine")}
                </span>
              </div>
              <Badge variant="muted">
                {t(DIFFICULTY_META[difficulty].labelKey)}
              </Badge>
            </div>

            <div className="mt-3">
              <Segmented
                ariaLabel={t("start.difficulty")}
                size="sm"
                value={difficulty}
                onChange={setDifficulty}
                options={[
                  {
                    value: "easy",
                    label: t("difficulty.easy"),
                    hint: t("difficulty.depth1"),
                  },
                  {
                    value: "medium",
                    label: t("difficulty.medium"),
                    hint: t("difficulty.depth2"),
                  },
                  {
                    value: "hard",
                    label: t("difficulty.hard"),
                    hint: t("difficulty.depth3"),
                  },
                ]}
              />
              <p className="mt-2 px-1 text-[11px] leading-relaxed text-muted-foreground/80">
                {t(DIFFICULTY_META[difficulty].blurbKey)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t("start.clock")}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground/70">
                {t("start.youAreWhite")}
              </span>
            </div>
            <div className="mt-2">
              <TimeControlPicker
                value={timeControl}
                onChange={setTimeControl}
              />
            </div>

            <Button size="lg" className="mt-4 w-full" onClick={startSolo}>
              <Play className="size-4" />
              {t("start.startSolo")}
            </Button>

            <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
              <Button variant="outline" onClick={() => setRoomOpen(true)}>
                <Users className="size-3.5" />
                {t("start.playFriend")}
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={t("start.joinWithCodeAria")}
                onClick={() => setRoomOpen(true)}
              >
                <DoorOpen className="size-4" />
              </Button>
            </div>

            <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground/50">
              {t("start.engineFullSight")}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { value: "16", label: t("start.statPiecesHidden") },
              { value: "6", label: t("start.statCharacterRooms") },
              { value: "∞", label: t("start.statFogUntilCheck") },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border/60 bg-white/[0.015] px-3 py-2.5"
              >
                <div className="font-display text-xl text-foreground">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-[540px] lg:max-w-none">
          <div
            className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(55%_50%_at_50%_45%,rgba(114,160,138,0.16),transparent_72%)] blur-2xl"
            aria-hidden
          />
          <div className="relative">
            <ChessBoard
              fen={START_FEN}
              orientation="w"
              viewerColor="w"
              selected={null}
              targets={[]}
              dangerTargets={[]}
              lastMove={null}
              opponentLastMove={null}
              interactive={false}
              onSelect={() => {}}
              onMove={() => {}}
            />
            <div className="absolute -bottom-3 left-4 right-4 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-[#0b110e]/95 px-3 py-2 shadow-xl backdrop-blur-md sm:left-6 sm:right-6">
              <div className="flex items-center gap-2">
                <EyeOff className="size-3.5 text-primary/80" />
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {t("start.enemyWatching")}
                </span>
              </div>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-primary/60 sm:block">
                {t("start.whiteToMove")}
              </span>
            </div>
          </div>
        </section>
      </main>

      <section
        id="how-it-works"
        className="border-t border-border/60 bg-black/20"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-3xl">{t("start.rulesTitle")}</h2>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              {t("start.rulesDescription")}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {rules.map((rule) => (
              <article
                key={rule.title}
                className="group rounded-xl border border-border/70 bg-card/50 p-5 transition-colors hover:border-primary/25 hover:bg-card/80"
              >
                <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.06] text-primary">
                  <rule.icon className="size-4" />
                </div>
                <h3 className="mt-4 font-display text-lg">{rule.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  {rule.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-xl border border-border/60 bg-white/[0.015] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg">{t("start.ctaTitle")}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t("start.ctaBody")}
              </p>
            </div>
            <Button size="lg" onClick={startSolo}>
              <Play className="size-4" />
              {t("start.playNow")}
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 text-[10px] text-muted-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <span>{t("start.footerTagline")}</span>
          <span className="font-mono uppercase tracking-[0.14em]">
            Next.js · chess.js · Zustand
          </span>
        </div>
      </footer>

      <RoomManager open={roomOpen} onOpenChange={setRoomOpen} />
    </div>
  );
}
