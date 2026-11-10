import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/components/i18n-provider";
import { resolveRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/messages";
import "./globals.css";
import "./move-indicators.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();

  return {
    title: translate(locale, "meta.title"),
    description: translate(locale, "meta.description"),
    applicationName: "Blind Chess",
    keywords: [
      "chess",
      "blind chess",
      "fog of war",
      "multiplayer",
      "strategy",
      "шахматы",
      "шахматы в тумане",
    ],
  };
}

export const viewport: Viewport = {
  themeColor: "#080b0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await resolveRequestLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <div className="app-ambience" aria-hidden />
        <I18nProvider initialLocale={locale}>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          <Toaster
            theme="dark"
            position="top-center"
            closeButton
            toastOptions={{
              classNames: {
                toast:
                  "border border-border bg-popover/95 text-foreground shadow-2xl backdrop-blur-md",
                description: "text-muted-foreground",
                error: "border-destructive/40",
              },
            }}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
