"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  size?: "sm" | "md";
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  disabled,
  ariaLabel,
  size = "md",
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex w-full items-stretch gap-1 rounded-lg border border-border bg-[#0a100d] p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[6px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-45",
              size === "sm" ? "h-7 px-2 text-[11px]" : "h-9 px-2.5 text-xs",
              active
                ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_rgba(227,195,141,0.28)]"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground/80",
            )}
          >
            <span>{option.label}</span>
            {option.hint ? (
              <span className="text-[9.5px] font-normal text-muted-foreground/70">
                {option.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
