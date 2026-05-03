"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { PiTMatchingDiagram } from "@/components/CalculatorDiagram";
import { CopyResultsButton } from "@/components/CopyResultsButton";
import { FormulaBlock } from "@/components/FormulaBlock";
import { NumberInput } from "@/components/NumberInput";
import { ResetButton } from "@/components/ResetButton";
import { ResultTable } from "@/components/ResultTable";
import { ValidationMessages } from "@/components/ValidationMessages";
import { usePersistentForm } from "@/components/usePersistentForm";
import { calculatorDefaults, defaultNumber } from "@/lib/calculatorDefaults";
import type { CalculatorInfo } from "@/lib/calculators";
import {
  calculatePiTMatching,
  type PiTMatchingCalculation,
  type PiTMatchingNetwork,
} from "@/lib/calculators/piTMatching";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type PiTMatchingCalculatorProps = {
  calculator: CalculatorInfo;
};

type PiTMatchingFormState = {
  network: PiTMatchingNetwork;
  sourceResistanceOhm: string;
  loadResistanceOhm: string;
  frequencyMHz: string;
  targetQ: string;
};

const defaultFormState: PiTMatchingFormState = {
  network: calculatorDefaults.piTMatching.network,
  sourceResistanceOhm: defaultNumber(
    calculatorDefaults.piTMatching.sourceResistanceOhm,
  ),
  loadResistanceOhm: defaultNumber(
    calculatorDefaults.piTMatching.loadResistanceOhm,
  ),
  frequencyMHz: defaultNumber(calculatorDefaults.piTMatching.frequencyMHz),
  targetQ: defaultNumber(calculatorDefaults.piTMatching.targetQ),
};

export function PiTMatchingCalculator({
  calculator,
}: PiTMatchingCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:pi-t-matching-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculatePiTMatching({
        network: form.network,
        sourceResistanceOhm: parseNumericField(form.sourceResistanceOhm),
        loadResistanceOhm: parseNumericField(form.loadResistanceOhm),
        frequencyMHz: parseNumericField(form.frequencyMHz),
        targetQ: parseNumericField(form.targetQ),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof PiTMatchingFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    resetStoredForm();
  }

  return (
    <CalculatorLayout
      title={calculator.title}
      description={calculator.description}
      inputPanel={
        <PiTMatchingInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <PiTMatchingResultPanel calculation={calculation} copyText={copyText} />
      }
      diagramPanel={<PiTMatchingDiagram network={form.network} />}
      formulaPanel={
        <FormulaBlock title="Pi/T resistance matching">
          Pi uses Rv = max(Rs, RL)/(Q^2 + 1) and low-pass C-L-C elements. T
          uses Rv = min(Rs, RL)(Q^2 + 1) and low-pass L-C-L elements.
        </FormulaBlock>
      }
    />
  );
}

type PiTMatchingInputPanelProps = {
  form: PiTMatchingFormState;
  calculation: PiTMatchingCalculation;
  onChange: (field: keyof PiTMatchingFormState, value: string) => void;
  onReset: () => void;
};

function PiTMatchingInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: PiTMatchingInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter real source and load resistances, then choose a low-pass Pi or
            T matching network.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="pi-t-network"
          className="block text-sm font-medium text-slate-800"
        >
          selected network
        </label>
        <select
          id="pi-t-network"
          value={form.network}
          onChange={(event) => onChange("network", event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="pi">Pi</option>
          <option value="t">T</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="pi-t-source-resistance"
          label="source resistance"
          value={form.sourceResistanceOhm}
          onChange={(value) => onChange("sourceResistanceOhm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="pi-t-load-resistance"
          label="load resistance"
          value={form.loadResistanceOhm}
          onChange={(value) => onChange("loadResistanceOhm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="pi-t-frequency"
          label="frequency"
          value={form.frequencyMHz}
          onChange={(value) => onChange("frequencyMHz", value)}
          unit="MHz"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="pi-t-target-q"
          label="target Q"
          value={form.targetQ}
          onChange={(value) => onChange("targetQ", value)}
          min={0}
          step={0.01}
        />
      </div>

      <ValidationMessages
        errors={calculation.errors}
        warnings={calculation.warnings}
      />
    </div>
  );
}

type PiTMatchingResultPanelProps = {
  calculation: PiTMatchingCalculation;
  copyText?: string;
};

function PiTMatchingResultPanel({
  calculation,
  copyText,
}: PiTMatchingResultPanelProps) {
  const result = calculation.value;
  const rows = result
    ? [
        {
          label: "virtual resistance",
          value: formatNumber(result.virtualResistanceOhm, 4),
          unit: "Ohm",
        },
        {
          label: "target Q",
          value: formatNumber(result.targetQ, 4),
        },
        {
          label: "source-side Q",
          value: formatNumber(result.sourceQ, 4),
        },
        {
          label: "load-side Q",
          value: formatNumber(result.loadQ, 4),
        },
        ...reactanceRows(result),
        ...susceptanceRows(result),
        ...result.elements.map((element) => ({
          label: element.label,
          value: formatNumber(element.value, 4),
          unit: element.unit,
          note:
            element.kind === "series-inductor"
              ? "series inductor"
              : "shunt capacitor",
        })),
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ideal low-pass values for real source and load resistances.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid Pi/T matching parameters to see results."
      />
    </div>
  );
}

function reactanceRows(result: NonNullable<PiTMatchingCalculation["value"]>) {
  return [
    result.reactancesOhm.sourceSeries === undefined
      ? undefined
      : {
          label: "source series reactance",
          value: formatNumber(result.reactancesOhm.sourceSeries, 4),
          unit: "Ohm",
        },
    result.reactancesOhm.centerSeries === undefined
      ? undefined
      : {
          label: "center series reactance",
          value: formatNumber(result.reactancesOhm.centerSeries, 4),
          unit: "Ohm",
        },
    result.reactancesOhm.loadSeries === undefined
      ? undefined
      : {
          label: "load series reactance",
          value: formatNumber(result.reactancesOhm.loadSeries, 4),
          unit: "Ohm",
        },
  ].filter((row): row is { label: string; value: string; unit: string } =>
    Boolean(row),
  );
}

function susceptanceRows(result: NonNullable<PiTMatchingCalculation["value"]>) {
  return [
    result.susceptancesS.sourceShunt === undefined
      ? undefined
      : {
          label: "source shunt susceptance",
          value: formatNumber(result.susceptancesS.sourceShunt * 1000, 4),
          unit: "mS",
        },
    result.susceptancesS.centerShunt === undefined
      ? undefined
      : {
          label: "center shunt susceptance",
          value: formatNumber(result.susceptancesS.centerShunt * 1000, 4),
          unit: "mS",
        },
    result.susceptancesS.loadShunt === undefined
      ? undefined
      : {
          label: "load shunt susceptance",
          value: formatNumber(result.susceptancesS.loadShunt * 1000, 4),
          unit: "mS",
        },
  ].filter((row): row is { label: string; value: string; unit: string } =>
    Boolean(row),
  );
}

function buildCopyText(
  title: string,
  form: PiTMatchingFormState,
  calculation: PiTMatchingCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }
  const result = calculation.value;

  return formatResultsText({
    title,
    inputs: [
      { label: "network", value: form.network === "pi" ? "Pi" : "T" },
      {
        label: "source resistance",
        value: form.sourceResistanceOhm,
        unit: "Ohm",
      },
      { label: "load resistance", value: form.loadResistanceOhm, unit: "Ohm" },
      { label: "frequency", value: form.frequencyMHz, unit: "MHz" },
      { label: "target Q", value: form.targetQ },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "virtual resistance",
            value: formatNumber(result.virtualResistanceOhm, 4),
            unit: "Ohm",
          },
          { label: "source-side Q", value: formatNumber(result.sourceQ, 4) },
          { label: "load-side Q", value: formatNumber(result.loadQ, 4) },
          ...reactanceRows(result),
          ...susceptanceRows(result),
          ...result.elements.map((element) => ({
            label: element.label,
            value: formatNumber(element.value, 4),
            unit: element.unit,
          })),
        ],
      },
    ],
  });
}

function parseNumericField(value: string): number {
  if (value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}
