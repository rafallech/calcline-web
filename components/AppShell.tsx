import Link from "next/link";
import type { ReactNode } from "react";
import { ModeProvider } from "@/components/ModeProvider";
import { ModeToggle } from "@/components/ModeToggle";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <ModeProvider>
      <div className="min-h-dvh bg-slate-50 text-slate-950">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Link
              href="/"
              className="w-fit text-base font-semibold tracking-normal text-slate-950"
            >
              CalcLine Web
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <ModeToggle />
              <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
                <Link
                  href="/"
                  className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Calculators
                </Link>
                <Link
                  href="/about"
                  className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  About
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 lg:py-10">
          {children}
        </main>
      </div>
    </ModeProvider>
  );
}
