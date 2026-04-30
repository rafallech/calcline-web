import type { ReactNode } from "react";

type FormulaBlockProps = {
  title?: string;
  children: ReactNode;
};

export function FormulaBlock({ title = "Formula", children }: FormulaBlockProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="mt-3 overflow-x-auto rounded-md bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">
        {children}
      </div>
    </section>
  );
}
