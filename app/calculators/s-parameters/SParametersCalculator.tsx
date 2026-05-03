"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { CopyResultsButton } from "@/components/CopyResultsButton";
import { FormulaBlock } from "@/components/FormulaBlock";
import { NumberInput } from "@/components/NumberInput";
import { ResetButton } from "@/components/ResetButton";
import { ResultTable } from "@/components/ResultTable";
import { UnitSelect } from "@/components/UnitSelect";
import { ValidationMessages } from "@/components/ValidationMessages";
import { usePersistentForm } from "@/components/usePersistentForm";
import { calculatorDefaults, defaultNumber } from "@/lib/calculatorDefaults";
import type { CalculatorInfo } from "@/lib/calculators";
import {
  calculateSParameters,
  type S11InputFormat,
  type S21InputFormat,
  type SParametersCalculation,
} from "@/lib/calculators/sParameters";
import { formatComplex, formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type SParametersCalculatorProps = {
  calculator: CalculatorInfo;
};

type SParametersFormState = {
  s11Format: S11InputFormat;
  s11Value: string;
  s11AngleDeg: string;
  s21Format: S21InputFormat;
  s21Value: string;
  z0Ohm: string;
};

const defaultFormState: SParametersFormState = {
  s11Format: calculatorDefaults.sParameters.s11Format,
  s11Value: defaultNumber(calculatorDefaults.sParameters.s11Value),
  s11AngleDeg: defaultNumber(calculatorDefaults.sParameters.s11AngleDeg),
  s21Format: calculatorDefaults.sParameters.s21Format,
  s21Value: defaultNumber(calculatorDefaults.sParameters.s21Value),
  z0Ohm: defaultNumber(calculatorDefaults.sParameters.z0Ohm),
};

const s11FormatOptions: { value: S11InputFormat; label: string }[] = [
  { value: "magnitude", label: "Magnitude" },
  { value: "dB", label: "dB" },
];

const s21FormatOptions: { value: S21InputFormat; label: string }[] = [
  { value: "magnitude", label: "Magnitude" },
  { value: "dB", label: "dB" },
];

export function SParametersCalculator({
  calculator,
}: SParametersCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:s-parameters-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateSParameters({
        s11Format: form.s11Format,
        s11Value: parseNumericField(form.s11Value),
        s11AngleDeg: parseNumericField(form.s11AngleDeg),
        s21Format: form.s21Format,
        s21Value: parseNumericField(form.s21Value),
        z0Ohm: parseNumericField(form.z0Ohm),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof SParametersFormState, value: string) {
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
        <SParametersInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <SParametersResultPanel calculation={calculation} copyText={copyText} />
      }
      formulaPanel={
        <FormulaBlock title="S-parameter metrics">
          Gamma = S11; return loss = -20 log10(|Gamma|); VSWR = (1 + |Gamma|)
          / (1 - |Gamma|); mismatch loss = -10 log10(1 - |Gamma|^2).
        </FormulaBlock>
      }
    />
  );
}

type SParametersInputPanelProps = {
  form: SParametersFormState;
  calculation: SParametersCalculation;
  onChange: (field: keyof SParametersFormState, value: string) => void;
  onReset: () => void;
};

function SParametersInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: SParametersInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter S11 as magnitude or dB with phase, and S21 as magnitude or dB.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <UnitSelect
          id="s11-format"
          label="S11 format"
          value={form.s11Format}
          options={s11FormatOptions}
          onChange={(value) => onChange("s11Format", value)}
        />
        <NumberInput
          id="s11-value"
          label="S11"
          value={form.s11Value}
          onChange={(value) => onChange("s11Value", value)}
          unit={form.s11Format === "dB" ? "dB" : ""}
          step={0.01}
        />
        <NumberInput
          id="s11-angle"
          label="S11 angle"
          value={form.s11AngleDeg}
          onChange={(value) => onChange("s11AngleDeg", value)}
          unit="deg"
          step={0.1}
        />
        <UnitSelect
          id="s21-format"
          label="S21 format"
          value={form.s21Format}
          options={s21FormatOptions}
          onChange={(value) => onChange("s21Format", value)}
        />
        <NumberInput
          id="s21-value"
          label="S21"
          value={form.s21Value}
          onChange={(value) => onChange("s21Value", value)}
          unit={form.s21Format === "dB" ? "dB" : ""}
          step={0.01}
        />
        <NumberInput
          id="s-parameters-z0"
          label="Z0"
          value={form.z0Ohm}
          onChange={(value) => onChange("z0Ohm", value)}
          unit="Ohm"
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

type SParametersResultPanelProps = {
  calculation: SParametersCalculation;
  copyText?: string;
};

function SParametersResultPanel({
  calculation,
  copyText,
}: SParametersResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "Gamma",
          value: formatComplex(calculation.value.gamma, 4),
        },
        {
          label: "return loss",
          value: formatNumber(calculation.value.returnLossDb, 3),
          unit: "dB",
        },
        {
          label: "VSWR",
          value: formatNumber(calculation.value.vswr, 4),
        },
        {
          label: "reflected power",
          value: formatNumber(calculation.value.reflectedPowerPercent, 3),
          unit: "%",
        },
        {
          label: "mismatch loss",
          value: formatNumber(calculation.value.mismatchLossDb, 3),
          unit: "dB",
        },
        {
          label: "S21 linear",
          value: formatNumber(calculation.value.s21Linear, 6),
        },
        {
          label: "S21 dB",
          value: formatNumber(calculation.value.s21Db, 3),
          unit: "dB",
        },
        {
          label:
            calculation.value.transferKind === "gain"
              ? "gain"
              : "insertion loss",
          value: formatNumber(calculation.value.transferDb, 3),
          unit: "dB",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Passive S11 input requires a reflection magnitude below one.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid S-parameter values to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: SParametersFormState,
  calculation: SParametersCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "S11 format", value: form.s11Format },
      {
        label: "S11",
        value: form.s11Value,
        unit: form.s11Format === "dB" ? "dB" : undefined,
      },
      { label: "S11 angle", value: form.s11AngleDeg, unit: "deg" },
      { label: "S21 format", value: form.s21Format },
      {
        label: "S21",
        value: form.s21Value,
        unit: form.s21Format === "dB" ? "dB" : undefined,
      },
      { label: "Z0", value: form.z0Ohm, unit: "Ohm" },
    ],
    sections: [
      {
        title: "Results",
        items: [
          { label: "Gamma", value: formatComplex(calculation.value.gamma, 4) },
          {
            label: "return loss",
            value: formatNumber(calculation.value.returnLossDb, 3),
            unit: "dB",
          },
          { label: "VSWR", value: formatNumber(calculation.value.vswr, 4) },
          {
            label: "reflected power",
            value: formatNumber(calculation.value.reflectedPowerPercent, 3),
            unit: "%",
          },
          {
            label: "mismatch loss",
            value: formatNumber(calculation.value.mismatchLossDb, 3),
            unit: "dB",
          },
          {
            label: "S21 linear",
            value: formatNumber(calculation.value.s21Linear, 6),
          },
          {
            label: "S21 dB",
            value: formatNumber(calculation.value.s21Db, 3),
            unit: "dB",
          },
          {
            label:
              calculation.value.transferKind === "gain"
                ? "gain"
                : "insertion loss",
            value: formatNumber(calculation.value.transferDb, 3),
            unit: "dB",
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

