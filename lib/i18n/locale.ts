export const LOCALES = ["en", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "bc:locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ru";
}

export function normaliseLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Picks the first supported language from an Accept-Language header, honouring
 * the browser's q-values. Falls back to English when nothing matches.
 */
export function detectLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const preferences = header
    .split(",")
    .map((entry) => {
      const [tag, ...parameters] = entry.trim().split(";");
      const quality = parameters
        .map((parameter) => parameter.trim())
        .find((parameter) => parameter.startsWith("q="));
      const weight = quality ? Number.parseFloat(quality.slice(2)) : 1;
      return {
        language: tag.toLowerCase().split(/[-_]/)[0],
        weight: Number.isFinite(weight) ? weight : 0,
      };
    })
    .filter((preference) => preference.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  for (const preference of preferences) {
    if (isLocale(preference.language)) return preference.language;
  }

  return DEFAULT_LOCALE;
}

/** Browser-only fallback used when a stored preference should be ignored. */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;

  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const language of languages) {
    const primary = language.toLowerCase().split(/[-_]/)[0];
    if (isLocale(primary)) return primary;
  }

  return DEFAULT_LOCALE;
}
