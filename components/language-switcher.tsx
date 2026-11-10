"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const next = locale === "ru" ? "en" : "ru";
  const label =
    next === "ru" ? t("common.switchToRussian") : t("common.switchToEnglish");

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-[7px] border border-border bg-white/[0.02] px-2 text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
    >
      <Languages className="size-3.5" aria-hidden />
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] sm:inline">
        {locale}
      </span>
    </button>
  );
}
