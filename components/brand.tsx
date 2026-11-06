"use client";

import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandProps {
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function Brand({ onClick, compact, className }: BrandProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        !onClick && "cursor-default",
        className,
      )}
      aria-label="Blind Chess home"
    >
      <span className="relative flex size-8 items-center justify-center rounded-[9px] border border-primary/25 bg-primary/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <EyeOff className="size-4 text-primary" />
        <span className="absolute inset-0 rounded-[9px] shadow-[0_0_18px_rgba(227,195,141,0.15)]" />
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] tracking-tight text-foreground">
            Blind Chess
          </span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.24em] text-muted-foreground/70">
            fog of war
          </span>
        </span>
      ) : null}
    </button>
  );
}
