"use client";

import {
  Flag,
  FlipVertical2,
  Link2,
  PlusCircle,
  Settings2,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { RoomSession } from "@/store/game-store";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useI18n } from "@/components/i18n-provider";

interface GameControlsProps {
  room: RoomSession | null;
  soundEnabled: boolean;
  canResign: boolean;
  onInvite: () => void;
  onNewGame: () => void;
  onFlip: () => void;
  onToggleSound: () => void;
  onResign: () => void;
}

export function GameControls({
  room,
  soundEnabled,
  canResign,
  onInvite,
  onNewGame,
  onFlip,
  onToggleSound,
  onResign,
}: GameControlsProps) {
  const { t } = useI18n();

  return (
    <Panel>
      <PanelHeader
        title={t("controls.title")}
        icon={<Settings2 className="size-3.5" />}
      />
      <div className="space-y-2 p-3">
        {room ? (
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={onInvite}
          >
            <Link2 className="size-3.5" />
            {t("controls.invite", { code: room.code })}
          </Button>
        ) : null}

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onNewGame}
        >
          <PlusCircle className="size-3.5" />
          {t("controls.newGame")}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onFlip} className="justify-start">
            <FlipVertical2 className="size-3.5" />
            {t("controls.flip")}
          </Button>
          <Button
            variant="outline"
            onClick={onToggleSound}
            className="justify-start"
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? (
              <Volume2 className="size-3.5" />
            ) : (
              <VolumeX className="size-3.5" />
            )}
            {soundEnabled ? t("controls.soundOn") : t("controls.muted")}
          </Button>
        </div>

        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={onResign}
          disabled={!canResign}
        >
          <Flag className="size-3.5" />
          {t("controls.resign")}
        </Button>

        <p className="px-1 pt-1 text-[10px] leading-relaxed text-muted-foreground/50">
          {t("controls.hint")}
        </p>
      </div>
    </Panel>
  );
}
