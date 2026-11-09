import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import "./move-indicators.css";

export const metadata: Metadata = {
  title: "Blind Chess — you only see your own pieces",
  description:
    "A fog-of-war chess game. Your opponent's army moves as anonymous shadows; only a checking piece reveals its identity. Play the engine or invite a friend with a six-character room code.",
  applicationName: "Blind Chess",
  keywords: ["chess", "blind chess", "fog of war", "multiplayer", "strategy"],
};

export const viewport: Viewport = {
  themeColor: "#080b0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <div className="app-ambience" aria-hidden />
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
      </body>
    </html>
  );
}
