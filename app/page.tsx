import type { Metadata } from "next";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { CalculatorSearch } from "@/components/CalculatorSearch";
import { calculators } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Microwave Line Calculator | CalcLine Web",
  description: "Home page for the CalcLine Web calculator migration.",
};

export default function Home() {
  return (
    <AppShell>
      <section className="space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Image
              src="/icons/program-icon.png"
              alt="CalcLine Web icon"
              width={96}
              height={96}
              className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:h-24 sm:w-24"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
                CalcLine2024 migration
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                Microwave Line Calculator
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                A responsive web version of the CalcLine microwave engineering
                calculators, migrated from the CalcLine2024 MIT App Inventor
                project.
              </p>
            </div>
          </div>
        </div>

        <CalculatorSearch calculators={calculators} />
      </section>
    </AppShell>
  );
}
