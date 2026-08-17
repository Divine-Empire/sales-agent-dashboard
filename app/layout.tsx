import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Divine Empire — Sales Dashboard",
  description: "AI sales agent leads, conversations and analytics",
  icons: {
    icon: [
      // Two variants so the tab icon stays visible in both browser themes:
      // white background for a dark tab bar, transparent for a light one.
      { url: "/favicon-dark-ui.png", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon-light-ui.png", media: "(prefers-color-scheme: light)" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-background text-foreground antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
