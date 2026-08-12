import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Divine Empire — Sales Dashboard",
  description: "AI sales agent leads, conversations and analytics",
};

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/leads", label: "Leads" },
  { href: "/handovers", label: "Handovers" },
  { href: "/customers", label: "Customers" },
  { href: "/machines", label: "Catalog" },
  { href: "/reports", label: "Reports" },
  { href: "/logs", label: "AI logs" },
  { href: "/opt-outs", label: "Opt-outs" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-sm font-bold">
                  DE
                </span>
                <span className="text-sm font-semibold tracking-tight">
                  Divine Empire
                  <span className="ml-2 font-normal text-zinc-500">
                    Sales Agent
                  </span>
                </span>
              </Link>
              <nav className="flex gap-1 text-sm">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
