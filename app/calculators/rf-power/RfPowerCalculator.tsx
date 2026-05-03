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
  calculateRfPower,
  type RfPowerCalculation,
  type RfPowerInputType,
} from "@/lib/calculators/rfPower";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type RfPowerCalculatorProps = {
  calculator: CalculatorInfo;
};

type RfPowerFormState = {
  type: RfPowerInputType;
  value: string;
  z0Ohm: string;
};

const defaultFormState: RfPowerFormState = {
  type: calculatorDefaults.rfPower.type,
  value: defaultNumber(calculatorDefaults.rfPower.value),
  z0Ohm: defaultNumber(calculatorDefaults.rfPower.z0Ohm),
};

const inputTypeOptions: { value: RfPowerInputType; label: string }[] = [
  { value: "dBm", label: "dBm" },
  { value: "dBW", label: "dBW" },
  { value: "W", label: "W" },
  { value: "mW", label: "mW" },
  { value: "Vrms", label: "Vrms" },
  { value: "Vpp", label: "Vpp" },
];

export function RfPowerCalculator({ calculator }: RfPowerCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:rf-power-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateRfPower({
        type: form.type,
        value: parseNumericField(form.value),
        z0Ohm: parseNumericField(form.z0Ohm),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof RfPowerFormState, value: string) {
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
        <RfPowerInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <RfPowerResultPanel calculation={calculation} copyText={copyText} />
      }
      formulaPanel={
        <FormulaBlock title="RF power conversion">
          P_W = 10^((dBm - 30) / 10); dBm = 10 log10(P_W / 1 mW);
          Vrms = sqrt(P_W Z0); Vpp = 2 sqrt(2) Vrms.
        </FormulaBlock>
      }
    />
  );
}

type RfPowerInputPanelProps = {
  form: RfPowerFormState;
  calculation: RfPowerCalculation;
  onChange: (field: keyof RfPowerFormState, value: string) => void;
  onReset: () => void;
};

function RfPowerInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: RfPowerInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Select the known RF power or voltage quantity and the reference
            impedance for voltage conversions.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <UnitSelect
          id="rf-power-input-type"
          label="input type"
          value={form.type}
          options={inputTypeOptions}
          onChange={(value) => onChange("type", value)}
        />
        <NumberInput
          id="rf-power-value"
          label="value"
          value={form.value}
          onChange={(value) => onChange("value", value)}
          unit={form.type}
          step={0.01}
        />
        <NumberInput
          id="rf-power-z0"
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

type RfPowerResultPanelProps = {
  calculation: RfPowerCalculation;
  copyText?: string;
};

function RfPowerResultPanel({
  calculation,
  copyText,
}: RfPowerResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "dBm",
          value: formatNumber(calculation.value.dBm, 3),
        },
        {
          label: "dBW",
          value: formatNumber(calculation.value.dBW, 3),
        },
        {
          label: "Power",
          value: formatNumber(calculation.value.w, 9),
          unit: "W",
        },
        {
          label: "Power",
          value: formatNumber(calculation.value.mW, 6),
          unit: "mW",
        },
        {
          label: "Vrms",
          value: formatNumber(calculation.value.vrms, 6),
          unit: "V",
        },
        {
          label: "Vpp",
          value: formatNumber(calculation.value.vpp, 6),
          unit: "V",
        },
        {
          label: "Irms",
          value: formatNumber(calculation.value.irms, 9),
          unit: "A",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Voltage and current values assume a sinusoidal signal into the
            selected resistive impedance.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid RF power parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: RfPowerFormState,
  calculation: RfPowerCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "input type", value: form.type },
      { label: "value", value: form.value, unit: form.type },
      { label: "Z0", value: form.z0Ohm, unit: "Ohm" },
    ],
    sections: [
      {
        title: "Results",
        items: [
          { label: "dBm", value: formatNumber(calculation.value.dBm, 3) },
          { label: "dBW", value: formatNumber(calculation.value.dBW, 3) },
          {
            label: "Power",
            value: formatNumber(calculation.value.w, 9),
            unit: "W",
          },
          {
            label: "Power",
            value: formatNumber(calculation.value.mW, 6),
            unit: "mW",
          },
          {
            label: "Vrms",
            value: formatNumber(calculation.value.vrms, 6),
            unit: "V",
          },
          {
            label: "Vpp",
            value: formatNumber(calculation.value.vpp, 6),
            unit: "V",
          },
          {
            label: "Irms",
            value: formatNumber(calculation.value.irms, 9),
            unit: "A",
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

