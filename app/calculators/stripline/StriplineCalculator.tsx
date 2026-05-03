"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
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
  calculateStripline,
  type StriplineCalculation,
} from "@/lib/calculators/stripline";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type StriplineCalculatorProps = {
  calculator: CalculatorInfo;
};

type StriplineFormState = {
  wMm: string;
  bMm: string;
  tMm: string;
  epsR: string;
  fGHz: string;
};

const defaultFormState: StriplineFormState = {
  wMm: defaultNumber(calculatorDefaults.stripline.wMm),
  bMm: defaultNumber(calculatorDefaults.stripline.bMm),
  tMm: defaultNumber(calculatorDefaults.stripline.tMm),
  epsR: defaultNumber(calculatorDefaults.stripline.epsR),
  fGHz: defaultNumber(calculatorDefaults.stripline.fGHz),
};

export function StriplineCalculator({ calculator }: StriplineCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:stripline-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateStripline({
        wMm: parseNumericField(form.wMm),
        bMm: parseNumericField(form.bMm),
        tMm: parseNumericField(form.tMm),
        epsR: parseNumericField(form.epsR),
        fGHz: parseNumericField(form.fGHz),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof StriplineFormState, value: string) {
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
        <StriplineInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <StriplineResultPanel calculation={calculation} copyText={copyText} />
      }
      formulaPanel={
        <FormulaBlock title="Symmetric stripline approximation">
          Z0 = 30*pi / (sqrt(eps_r) * (W_eff / b + 0.441)); lambdag = c / (f
          sqrt(eps_r)); delay = sqrt(eps_r) / c.
        </FormulaBlock>
      }
    />
  );
}

type StriplineInputPanelProps = {
  form: StriplineFormState;
  calculation: StriplineCalculation;
  onChange: (field: keyof StriplineFormState, value: string) => void;
  onReset: () => void;
};

function StriplineInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: StriplineInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter a centered stripline geometry with dielectric height measured
            between the ground planes.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="stripline-width"
          label="strip width W"
          value={form.wMm}
          onChange={(value) => onChange("wMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="stripline-height"
          label="dielectric height b"
          value={form.bMm}
          onChange={(value) => onChange("bMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="stripline-thickness"
          label="conductor thickness t"
          value={form.tMm}
          onChange={(value) => onChange("tMm", value)}
          unit="mm"
          min={0}
          step={0.001}
        />
        <NumberInput
          id="stripline-eps-r"
          label="eps_r"
          value={form.epsR}
          onChange={(value) => onChange("epsR", value)}
          min={1}
          step={0.01}
        />
        <NumberInput
          id="stripline-frequency"
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

type StriplineResultPanelProps = {
  calculation: StriplineCalculation;
  copyText?: string;
};

function StriplineResultPanel({
  calculation,
  copyText,
}: StriplineResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "characteristic impedance Z0",
          value: formatNumber(calculation.value.z0Ohm, 3),
          unit: "Ohm",
        },
        {
          label: "guided wavelength",
          value: formatNumber(calculation.value.guidedWavelengthMm, 3),
          unit: "mm",
        },
        {
          label: "propagation delay",
          value: formatNumber(calculation.value.propagationDelayPsPerMm, 3),
          unit: "ps/mm",
        },
        {
          label: "effective strip width",
          value: formatNumber(calculation.value.effectiveWidthMm, 3),
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
            Results are first-order design estimates for a homogeneous
            symmetric stripline.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid stripline parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: StriplineFormState,
  calculation: StriplineCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "strip width W", value: form.wMm, unit: "mm" },
      { label: "dielectric height b", value: form.bMm, unit: "mm" },
      { label: "conductor thickness t", value: form.tMm, unit: "mm" },
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
            label: "guided wavelength",
            value: formatNumber(calculation.value.guidedWavelengthMm, 3),
            unit: "mm",
          },
          {
            label: "propagation delay",
            value: formatNumber(calculation.value.propagationDelayPsPerMm, 3),
            unit: "ps/mm",
          },
          {
            label: "effective strip width",
            value: formatNumber(calculation.value.effectiveWidthMm, 3),
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
