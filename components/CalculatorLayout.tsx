"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAppMode } from "@/components/ModeProvider";

type CalculatorLayoutProps = {
  title: string;
  description: string;
  inputPanel: ReactNode;
  resultPanel: ReactNode;
  diagramPanel?: ReactNode;
  formulaPanel?: ReactNode;
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
};

export function CalculatorLayout({
  title,
  description,
  inputPanel,
  resultPanel,
  diagramPanel,
  formulaPanel,
  backHref = "/",
  backLabel = "Back to calculators",
  eyebrow = "Calculator",
}: CalculatorLayoutProps) {
  const { mode } = useAppMode();

  return (
    <section className="space-y-6">
      <div>
        <Link
          href={backHref}
          className="text-sm font-medium text-cyan-800 transition hover:text-cyan-950"
        >
          {backLabel}
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-cyan-700">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {description}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {inputPanel}
        </section>
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {resultPanel}
        </aside>
      </div>

      {diagramPanel ? <div>{diagramPanel}</div> : null}

      {mode === "student" && formulaPanel ? <div>{formulaPanel}</div> : null}
    </section>
  );
}
