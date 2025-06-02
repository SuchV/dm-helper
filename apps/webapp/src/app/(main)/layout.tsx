import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { env } from "@spolka-z-l-o/env/next-env";
import { cn } from "@spolka-z-l-o/ui";
import { ThemeProvider } from "@spolka-z-l-o/ui/theme";
import { Toaster } from "@spolka-z-l-o/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "./globals.css";
import "@total-typescript/ts-reset";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://boring.tonik.com"
      : "http://localhost:3000",
  ),
  title: "Boring stack",
  description: "The most boring stack you'll ever need",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;
