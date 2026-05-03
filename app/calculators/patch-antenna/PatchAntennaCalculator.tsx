"use client";

import { useMemo } from "react";
import { PatchAntennaDiagram } from "@/components/CalculatorDiagram";
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
  calculatePatchAntenna,
  type PatchAntennaCalculation,
} from "@/lib/calculators/patchAntenna";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type PatchAntennaCalculatorProps = {
  calculator: CalculatorInfo;
};

type PatchAntennaFormState = {
  fGHz: string;
  epsR: string;
  hMm: string;
};

const defaultFormState: PatchAntennaFormState = {
  fGHz: defaultNumber(calculatorDefaults.patchAntenna.fGHz),
  epsR: defaultNumber(calculatorDefaults.patchAntenna.epsR),
  hMm: defaultNumber(calculatorDefaults.patchAntenna.hMm),
};

export function PatchAntennaCalculator({
  calculator,
}: PatchAntennaCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:patch-antenna-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculatePatchAntenna({
        fGHz: parseNumericField(form.fGHz),
        epsR: parseNumericField(form.epsR),
        hMm: parseNumericField(form.hMm),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof PatchAntennaFormState, value: string) {
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
        <PatchAntennaInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <PatchAntennaResultPanel calculation={calculation} copyText={copyText} />
      }
      diagramPanel={<PatchAntennaDiagram />}
      formulaPanel={
        <FormulaBlock title="Patch antenna approximation">
          W = c / (2 f) sqrt(2 / (eps_r + 1)); Leff = c / (2 f
          sqrt(eps_eff)); L = Leff - 2 deltaL.
        </FormulaBlock>
      }
    />
  );
}

type PatchAntennaInputPanelProps = {
  form: PatchAntennaFormState;
  calculation: PatchAntennaCalculation;
  onChange: (field: keyof PatchAntennaFormState, value: string) => void;
  onReset: () => void;
};

function PatchAntennaInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: PatchAntennaInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter the target resonance and substrate properties. The dimensions
            are an initial design approximation.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="patch-frequency"
          label="resonant frequency"
          value={form.fGHz}
          onChange={(value) => onChange("fGHz", value)}
          unit="GHz"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="patch-eps-r"
          label="eps_r"
          value={form.epsR}
          onChange={(value) => onChange("epsR", value)}
          min={1}
          step={0.01}
        />
        <NumberInput
          id="patch-height"
          label="h"
          value={form.hMm}
          onChange={(value) => onChange("hMm", value)}
          unit="mm"
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

type PatchAntennaResultPanelProps = {
  calculation: PatchAntennaCalculation;
  copyText?: string;
};

function PatchAntennaResultPanel({
  calculation,
  copyText,
}: PatchAntennaResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "W",
          value: formatNumber(calculation.value.wMm, 3),
          unit: "mm",
        },
        {
          label: "eps_eff",
          value: formatNumber(calculation.value.epsEff, 4),
        },
        {
          label: "deltaL",
          value: formatNumber(calculation.value.deltaLMm, 3),
          unit: "mm",
        },
        {
          label: "Leff",
          value: formatNumber(calculation.value.leffMm, 3),
          unit: "mm",
        },
        {
          label: "L",
          value: formatNumber(calculation.value.lMm, 3),
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
            Use these dimensions as a starting point; final dimensions usually
            need EM tuning or measurement.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid patch antenna parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: PatchAntennaFormState,
  calculation: PatchAntennaCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "resonant frequency", value: form.fGHz, unit: "GHz" },
      { label: "eps_r", value: form.epsR },
      { label: "h", value: form.hMm, unit: "mm" },
    ],
    sections: [
      {
        title: "Results",
        items: [
          { label: "W", value: formatNumber(calculation.value.wMm, 3), unit: "mm" },
          { label: "eps_eff", value: formatNumber(calculation.value.epsEff, 4) },
          {
            label: "deltaL",
            value: formatNumber(calculation.value.deltaLMm, 3),
            unit: "mm",
          },
          {
            label: "Leff",
            value: formatNumber(calculation.value.leffMm, 3),
            unit: "mm",
          },
          { label: "L", value: formatNumber(calculation.value.lMm, 3), unit: "mm" },
        ],
      },
    ],
    warnings: calculation.warnings,
  });
}

function parseNumericField(value: string): number {
  if (value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}

