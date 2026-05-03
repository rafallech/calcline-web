"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { CoplanarWaveguideDiagram } from "@/components/CalculatorDiagram";
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
  calculateCoplanarWaveguide,
  type CoplanarWaveguideCalculation,
  type CoplanarWaveguideMode,
} from "@/lib/calculators/coplanarWaveguide";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type CoplanarWaveguideCalculatorProps = {
  calculator: CalculatorInfo;
};

type CoplanarWaveguideFormState = {
  mode: CoplanarWaveguideMode;
  wMm: string;
  sMm: string;
  hMm: string;
  epsR: string;
  fGHz: string;
};

const defaultFormState: CoplanarWaveguideFormState = {
  mode: calculatorDefaults.coplanarWaveguide.mode,
  wMm: defaultNumber(calculatorDefaults.coplanarWaveguide.wMm),
  sMm: defaultNumber(calculatorDefaults.coplanarWaveguide.sMm),
  hMm: defaultNumber(calculatorDefaults.coplanarWaveguide.hMm),
  epsR: defaultNumber(calculatorDefaults.coplanarWaveguide.epsR),
  fGHz: defaultNumber(calculatorDefaults.coplanarWaveguide.fGHz),
};

export function CoplanarWaveguideCalculator({
  calculator,
}: CoplanarWaveguideCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:coplanar-waveguide-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateCoplanarWaveguide({
        mode: form.mode,
        wMm: parseNumericField(form.wMm),
        sMm: parseNumericField(form.sMm),
        hMm: parseNumericField(form.hMm),
        epsR: parseNumericField(form.epsR),
        fGHz: parseNumericField(form.fGHz),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof CoplanarWaveguideFormState, value: string) {
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
        <CoplanarWaveguideInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <CoplanarWaveguideResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      formulaPanel={
        <div className="space-y-5">
          <FormulaBlock title="CPW quasi-TEM approximation">
            k = W / (W + 2S); eps_eff = 1 + (eps_r - 1) / 2 * K(k1)/K(k1')
            * K(k')/K(k); Z0 = 30*pi/sqrt(eps_eff) * K(k')/K(k).
          </FormulaBlock>
          <CoplanarWaveguideDiagram />
        </div>
      }
    />
  );
}

type CoplanarWaveguideInputPanelProps = {
  form: CoplanarWaveguideFormState;
  calculation: CoplanarWaveguideCalculation;
  onChange: (field: keyof CoplanarWaveguideFormState, value: string) => void;
  onReset: () => void;
};

function CoplanarWaveguideInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: CoplanarWaveguideInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter CPW geometry. Grounded CPW is listed as a placeholder and does
            not produce calculated values yet.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="coplanar-mode"
          className="block text-sm font-medium text-slate-800"
        >
          mode
        </label>
        <select
          id="coplanar-mode"
          value={form.mode}
          onChange={(event) => onChange("mode", event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="cpw">CPW</option>
          <option value="grounded">grounded CPW placeholder</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="coplanar-width"
          label="center conductor width W"
          value={form.wMm}
          onChange={(value) => onChange("wMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="coplanar-gap"
          label="gap S"
          value={form.sMm}
          onChange={(value) => onChange("sMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="coplanar-height"
          label="substrate height h"
          value={form.hMm}
          onChange={(value) => onChange("hMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="coplanar-eps-r"
          label="eps_r"
          value={form.epsR}
          onChange={(value) => onChange("epsR", value)}
          min={1}
          step={0.01}
        />
        <NumberInput
          id="coplanar-frequency"
          label="frequency"
          value={form.fGHz}
          onChange={(value) => onChange("fGHz", value)}
          unit="GHz"
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

type CoplanarWaveguideResultPanelProps = {
  calculation: CoplanarWaveguideCalculation;
  copyText?: string;
};

function CoplanarWaveguideResultPanel({
  calculation,
  copyText,
}: CoplanarWaveguideResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "characteristic impedance Z0",
          value: formatNumber(calculation.value.z0Ohm, 3),
          unit: "Ohm",
        },
        {
          label: "effective permittivity eps_eff",
          value: formatNumber(calculation.value.epsEff, 4),
        },
        {
          label: "guided wavelength",
          value: formatNumber(calculation.value.guidedWavelengthMm, 3),
          unit: "mm",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            CPW results use elliptic-integral quasi-TEM design equations.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid CPW parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: CoplanarWaveguideFormState,
  calculation: CoplanarWaveguideCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "mode", value: form.mode },
      { label: "center conductor width W", value: form.wMm, unit: "mm" },
      { label: "gap S", value: form.sMm, unit: "mm" },
      { label: "substrate height h", value: form.hMm, unit: "mm" },
      { label: "eps_r", value: form.epsR },
      { label: "frequency", value: form.fGHz, unit: "GHz" },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "characteristic impedance Z0",
            value: formatNumber(calculation.value.z0Ohm, 3),
            unit: "Ohm",
          },
          {
            label: "effective permittivity eps_eff",
            value: formatNumber(calculation.value.epsEff, 4),
          },
          {
            label: "guided wavelength",
            value: formatNumber(calculation.value.guidedWavelengthMm, 3),
            unit: "mm",
          },
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
