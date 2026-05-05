"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { InteractiveSmithChart } from "@/components/InteractiveSmithChart";
import { NumberInput } from "@/components/NumberInput";
import type { CalculatorInfo } from "@/lib/calculators";
import type { Complex } from "@/lib/math/complex";
import {
  formatSelectedSmithPoint,
  type FormattedSelectedSmithPoint,
} from "@/lib/visualization/smithChart";

type InteractiveSmithChartCalculatorProps = {
  calculator: CalculatorInfo;
};

type ResultDisplayMode =
  | "normalizedImpedance"
  | "normalizedAdmittance"
  | "physicalImpedance";

const displayModeOptions: { value: ResultDisplayMode; label: string }[] = [
  { value: "normalizedImpedance", label: "Normalized impedance" },
  { value: "normalizedAdmittance", label: "Normalized admittance" },
  { value: "physicalImpedance", label: "Physical impedance" },
];

export function InteractiveSmithChartCalculator({
  calculator,
}: InteractiveSmithChartCalculatorProps) {
  const [selectedGamma, setSelectedGamma] = useState<Complex | undefined>();
  const [displayMode, setDisplayMode] = useState<ResultDisplayMode>(
    "normalizedImpedance",
  );
  const [z0Ohm, setZ0Ohm] = useState("50");
  const [outsideMessage, setOutsideMessage] = useState("");
  const parsedZ0 = Number(z0Ohm);
  const z0IsValid = Number.isFinite(parsedZ0) && parsedZ0 > 0;
  const usesPhysicalUnits = displayMode === "physicalImpedance";
  const formatted = useMemo(() => {
    if (!selectedGamma) {
      return undefined;
    }

    return formatSelectedSmithPoint({
      gamma: selectedGamma,
      mode: usesPhysicalUnits ? "withZ0" : "normalized",
      z0Ohm: z0IsValid ? parsedZ0 : undefined,
    });
  }, [parsedZ0, selectedGamma, usesPhysicalUnits, z0IsValid]);
  const resultRows = useMemo(
    () => buildResultRows(formatted, displayMode, z0IsValid),
    [displayMode, formatted, z0IsValid],
  );
  const copyText = useMemo(
    () => buildCopyText(resultRows, formatted?.warnings ?? []),
    [formatted?.warnings, resultRows],
  );

  function selectGamma(gamma: Complex) {
    setSelectedGamma(gamma);
    setOutsideMessage("");
  }

  function clearSelectedPoint() {
    setSelectedGamma(undefined);
    setOutsideMessage("");
  }

  function handleOutsideClick() {
    setOutsideMessage("Click inside the outer Smith chart circle.");
  }

  return (
    <section className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm font-medium text-cyan-800 transition hover:text-cyan-950"
        >
          Back to calculators
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-cyan-700">
          RF Utility
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
          {calculator.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {calculator.description}
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-4">
          <InteractiveSmithChart
            selectedGamma={selectedGamma}
            onSelect={selectGamma}
            onOutsideClick={handleOutsideClick}
          />
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-950">
              Click inside the Smith chart to inspect the selected point.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              On touch devices, tap inside the chart boundary. Points outside
              the outer circle are ignored.
            </p>
            {outsideMessage ? (
              <p className="mt-3 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-cyan-900">
                {outsideMessage}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Readout</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose how the selected chart point is reported.
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">
              Result display
            </legend>
            <div className="grid gap-2">
              {displayModeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDisplayMode(option.value)}
                  className={`min-h-10 rounded-md border px-3 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-700/20 ${
                    displayMode === option.value
                      ? "border-cyan-700 bg-cyan-50 text-cyan-950"
                      : "border-slate-300 bg-white text-slate-700 hover:border-cyan-700 hover:text-cyan-900"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <NumberInput
            id="interactive-smith-chart-z0"
            label="Z0"
            value={z0Ohm}
            onChange={setZ0Ohm}
            min={0}
            step={0.1}
            unit="Ohm"
            disabled={!usesPhysicalUnits}
            description="Used only for physical impedance."
          />
          {usesPhysicalUnits && !z0IsValid ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
              Enter a positive finite Z0 value to show physical impedance.
            </p>
          ) : null}

          <SelectedPointResults formatted={formatted} rows={resultRows} />

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={clearSelectedPoint}
              disabled={!selectedGamma}
              className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-cyan-700 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
            >
              Clear selected point
            </button>
            <CopySelectedPointButton text={copyText} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function SelectedPointResults({
  formatted,
  rows,
}: {
  formatted?: FormattedSelectedSmithPoint;
  rows: ResultRow[];
}) {
  if (!formatted) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
        No point selected.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <dl className="divide-y divide-slate-200 rounded-md border border-slate-200">
        {rows.map((row) => (
          <div
            key={row.label}
            className={
              row.emphasized
                ? "grid grid-cols-[120px_minmax(0,1fr)] gap-3 bg-cyan-50 px-3 py-3 text-sm"
                : "grid grid-cols-[120px_minmax(0,1fr)] gap-3 px-3 py-2 text-sm"
            }
          >
            <dt className="font-medium text-slate-600">{row.label}</dt>
            <dd className="min-w-0 break-words font-mono text-slate-950">
              {row.value ?? "not available"}
            </dd>
          </div>
        ))}
      </dl>

      {formatted.warnings.length > 0 ? (
        <div className="space-y-2">
          {formatted.warnings.map((warning) => (
            <p
              key={warning}
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900"
            >
              {warning}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type ResultRow = {
  label: string;
  value?: string;
  emphasized?: boolean;
};

function buildResultRows(
  formatted: FormattedSelectedSmithPoint | undefined,
  displayMode: ResultDisplayMode,
  z0IsValid: boolean,
): ResultRow[] {
  if (!formatted) {
    return [];
  }

  const primaryRow = getPrimaryResultRow(formatted, displayMode, z0IsValid);

  return [
    { label: "Gamma", value: formatted.gamma },
    { label: "|Gamma|", value: formatted.magGamma },
    { label: "angle(Gamma)", value: `${formatted.angleGammaDeg} deg` },
    { label: "SWR", value: formatted.swr },
    { label: "return loss", value: formatted.returnLossDb },
    primaryRow,
  ];
}

function getPrimaryResultRow(
  formatted: FormattedSelectedSmithPoint,
  displayMode: ResultDisplayMode,
  z0IsValid: boolean,
): ResultRow {
  if (displayMode === "normalizedAdmittance") {
    return {
      label: "y",
      value: formatted.normalizedAdmittance,
      emphasized: true,
    };
  }

  if (displayMode === "physicalImpedance") {
    return {
      label: "Z",
      value:
        z0IsValid && formatted.impedanceOhm
          ? `${formatted.impedanceOhm} Ohm`
          : undefined,
      emphasized: true,
    };
  }

  return {
    label: "z",
    value: formatted.normalizedImpedance,
    emphasized: true,
  };
}

function buildCopyText(rows: ResultRow[], warnings: string[]): string | undefined {
  if (rows.length === 0) {
    return undefined;
  }

  return [
    ...rows.map((row) => `${row.label} = ${row.value ?? "not available"}`),
    ...warnings.map((warning) => `Warning: ${warning}`),
  ].join("\n");
}

function CopySelectedPointButton({ text }: { text?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyResults() {
    if (!text) {
      return;
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copyResults}
      disabled={!text}
      className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-cyan-700 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
    >
      {copied ? "Copied" : "Copy selected point results"}
    </button>
  );
}
