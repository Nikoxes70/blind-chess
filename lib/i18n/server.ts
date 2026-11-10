import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  detectLocaleFromAcceptLanguage,
  isLocale,
  type Locale,
} from "./locale";

/**
 * Resolves the request language on the server: an explicit cookie choice wins,
 * otherwise the browser's Accept-Language preference is used.
 */
export async function resolveRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(stored)) return stored;

  const headerStore = await headers();
  return detectLocaleFromAcceptLanguage(headerStore.get("accept-language")) ?? DEFAULT_LOCALE;
}
