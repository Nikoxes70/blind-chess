import * as React from "react";
import { cn } from "@/lib/utils";

export function Panel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/80 bg-card/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

interface PanelHeaderProps {
  title: string;
  icon?: React.ReactNode;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PanelHeader({
  title,
  icon,
  hint,
  action,
  className,
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {icon ? <span className="text-primary/80">{icon}</span> : null}
        <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h2>
        {hint ? (
          <span className="truncate text-[10px] text-muted-foreground/60">
            {hint}
          </span>
        ) : null}
      </div>
      {action}
    </div>
  );
}
