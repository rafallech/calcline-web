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
  calculateQuarterWaveTransformer,
  type QuarterWaveTransformerCalculation,
} from "@/lib/calculators/quarterWaveTransformer";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type QuarterWaveTransformerCalculatorProps = {
  calculator: CalculatorInfo;
};

type QuarterWaveTransformerFormState = {
  z0Ohm: string;
  rLOhm: string;
  fGHz: string;
  epsEff: string;
};

const defaultFormState: QuarterWaveTransformerFormState = {
  z0Ohm: defaultNumber(calculatorDefaults.quarterWaveTransformer.z0Ohm),
  rLOhm: defaultNumber(calculatorDefaults.quarterWaveTransformer.rLOhm),
  fGHz: defaultNumber(calculatorDefaults.quarterWaveTransformer.fGHz),
  epsEff: defaultNumber(calculatorDefaults.quarterWaveTransformer.epsEff),
};

export function QuarterWaveTransformerCalculator({
  calculator,
}: QuarterWaveTransformerCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:quarter-wave-transformer-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateQuarterWaveTransformer({
        z0Ohm: parseNumericField(form.z0Ohm),
        rLOhm: parseNumericField(form.rLOhm),
        fGHz: parseNumericField(form.fGHz),
        epsEff: parseNumericField(form.epsEff),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(
    field: keyof QuarterWaveTransformerFormState,
    value: string,
  ) {
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
        <QuarterWaveTransformerInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <QuarterWaveTransformerResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      formulaPanel={
        <FormulaBlock title="Quarter-wave transformer">
          Zt = sqrt(Z0 RL); lambda0 = c / f; lambdag = lambda0 /
          sqrt(eps_eff); physical length = lambdag / 4.
        </FormulaBlock>
      }
    />
  );
}

type QuarterWaveTransformerInputPanelProps = {
  form: QuarterWaveTransformerFormState;
  calculation: QuarterWaveTransformerCalculation;
  onChange: (
    field: keyof QuarterWaveTransformerFormState,
    value: string,
  ) => void;
  onReset: () => void;
};

function QuarterWaveTransformerInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: QuarterWaveTransformerInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter real source and load resistances plus the design frequency.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="quarter-wave-z0"
          label="Z0"
          value={form.z0Ohm}
          onChange={(value) => onChange("z0Ohm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="quarter-wave-rl"
          label="RL"
          value={form.rLOhm}
          onChange={(value) => onChange("rLOhm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="quarter-wave-frequency"
          label="frequency"
          value={form.fGHz}
          onChange={(value) => onChange("fGHz", value)}
          unit="GHz"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="quarter-wave-eps-eff"
          label="eps_eff"
          value={form.epsEff}
          onChange={(value) => onChange("epsEff", value)}
          min={1}
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

type QuarterWaveTransformerResultPanelProps = {
  calculation: QuarterWaveTransformerCalculation;
  copyText?: string;
};

function QuarterWaveTransformerResultPanel({
  calculation,
  copyText,
}: QuarterWaveTransformerResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "Zt",
          value: formatNumber(calculation.value.ztOhm, 3),
          unit: "Ohm",
        },
        {
          label: "electrical length",
          value: formatNumber(calculation.value.electricalLengthDeg, 3),
          unit: "deg",
        },
        {
          label: "physical length",
          value: formatNumber(calculation.value.physicalLengthM * 1000, 3),
          unit: "mm",
        },
        {
          label: "lambda0",
          value: formatNumber(calculation.value.lambda0M, 6),
          unit: "m",
        },
        {
          label: "lambdag",
          value: formatNumber(calculation.value.lambdaGM, 6),
          unit: "m",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The transformer is a single ideal quarter-wave section at the design
            frequency.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid quarter-wave transformer parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: QuarterWaveTransformerFormState,
  calculation: QuarterWaveTransformerCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "Z0", value: form.z0Ohm, unit: "Ohm" },
      { label: "RL", value: form.rLOhm, unit: "Ohm" },
      { label: "frequency", value: form.fGHz, unit: "GHz" },
      { label: "eps_eff", value: form.epsEff },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "Zt",
            value: formatNumber(calculation.value.ztOhm, 3),
            unit: "Ohm",
          },
          {
            label: "electrical length",
            value: formatNumber(calculation.value.electricalLengthDeg, 3),
            unit: "deg",
          },
          {
            label: "physical length",
            value: formatNumber(calculation.value.physicalLengthM * 1000, 3),
            unit: "mm",
          },
          {
            label: "lambda0",
            value: formatNumber(calculation.value.lambda0M, 6),
            unit: "m",
          },
          {
            label: "lambdag",
            value: formatNumber(calculation.value.lambdaGM, 6),
            unit: "m",
          },
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

