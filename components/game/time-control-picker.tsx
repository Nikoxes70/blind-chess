"use client";

import { TIME_CONTROLS } from "@/lib/chess/config";
import type { TimeControlKey } from "@/lib/chess/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

interface TimeControlPickerProps {
  value: TimeControlKey;
  onChange: (value: TimeControlKey) => void;
  disabled?: boolean;
}

export function TimeControlPicker({
  value,
  onChange,
  disabled,
}: TimeControlPickerProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-5 gap-1 rounded-lg border border-border bg-[#0a100d] p-1">
      {TIME_CONTROLS.map((control) => {
        const active = control.key === value;
        return (
          <button
            key={control.key}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(control.key)}
            className={cn(
              "h-8 rounded-[6px] text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-45",
              active
                ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_rgba(227,195,141,0.28)]"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground/80",
            )}
            title={
              control.key === "unlimited" ? t("time.noClock") : control.label
            }
          >
            {control.short}
          </button>
        );
      })}
    </div>
  );
}
