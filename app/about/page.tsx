import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "About | CalcLine Web",
  description: "Project source and migration notes for CalcLine Web.",
};

export default function AboutPage() {
  return (
    <AppShell>
      <section className="max-w-3xl space-y-8">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-cyan-800 hover:text-cyan-950"
          >
            Back to calculators
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-cyan-700">
            About
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal text-slate-950">
            CalcLine Web
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            CalcLine Web is a browser-based migration of the CalcLine2024
            project originally built in MIT App Inventor. The web version keeps
            the calculator logic separate from the interface and presents the
            tools in a responsive Next.js, TypeScript, and Tailwind application.
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <dt className="text-sm font-medium text-slate-500">Web version</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-950">0.1.0</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <dt className="text-sm font-medium text-slate-500">AIA version</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-950">
              1.25 project, 1.21 About screen
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <dt className="text-sm font-medium text-slate-500">
              Original author
            </dt>
            <dd className="mt-1 text-lg font-semibold text-slate-950">
              Rafal Lech
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <dt className="text-sm font-medium text-slate-500">
              Algorithm source
            </dt>
            <dd className="mt-1 text-lg font-semibold text-slate-950">
              CalcLine2024 AIA
            </dd>
          </div>
        </dl>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-950">Scope</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The application covers seven microwave engineering calculators:
            rectangular waveguide cutoff frequencies, microstrip line analysis
            and synthesis, load impedance from standing-wave measurements,
            impedance transformation, VSWR conversions, single-stub matching,
            and L-section matching.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-950">
            Engineering assumptions
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <p>
              The impedance transformation and matching calculators use the
              lossless transmission-line model where that assumption applies.
              Results should be interpreted as idealized calculations rather
              than a full model of conductor, dielectric, connector, or
              discontinuity losses.
            </p>
            <p>
              Matching-network results use ideal reactive elements. Inductors,
              capacitors, open stubs, and short stubs are reported as ideal
              values before practical parasitics, tolerance, Q, and layout
              effects are included.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-950">
            Migration notes
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The source application is CalcLine2024.aia. The migrated web app
            follows the technical specification by separating calculator modules
            from UI components, adding TypeScript types, unit tests, validation,
            and consistent formatting for units and complex numbers.
          </p>
        </section>
      </section>
    </AppShell>
  );
}
