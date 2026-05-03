"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { WilkinsonDividerDiagram } from "@/components/CalculatorDiagram";
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
  calculateWilkinsonDivider,
  type WilkinsonDividerCalculation,
} from "@/lib/calculators/wilkinson";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type WilkinsonDividerCalculatorProps = {
  calculator: CalculatorInfo;
};

type WilkinsonDividerFormState = {
  z0Ohm: string;
  fGHz: string;
  epsEff: string;
};

const defaultFormState: WilkinsonDividerFormState = {
  z0Ohm: defaultNumber(calculatorDefaults.wilkinsonDivider.z0Ohm),
  fGHz: defaultNumber(calculatorDefaults.wilkinsonDivider.fGHz),
  epsEff: defaultNumber(calculatorDefaults.wilkinsonDivider.epsEff),
};

export function WilkinsonDividerCalculator({
  calculator,
}: WilkinsonDividerCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:wilkinson-divider-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateWilkinsonDivider({
        z0Ohm: parseNumericField(form.z0Ohm),
        fGHz: parseNumericField(form.fGHz),
        epsEff: parseNumericField(form.epsEff),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof WilkinsonDividerFormState, value: string) {
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
        <WilkinsonDividerInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <WilkinsonDividerResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      formulaPanel={
        <div className="space-y-5">
          <FormulaBlock title="2-way equal split Wilkinson">
            Zline = sqrt(2) Z0; Riso = 2 Z0; lambdag = c / (f sqrt(eps_eff));
            physical length = lambdag / 4.
          </FormulaBlock>
          <WilkinsonDividerDiagram />
        </div>
      }
    />
  );
}

type WilkinsonDividerInputPanelProps = {
  form: WilkinsonDividerFormState;
  calculation: WilkinsonDividerCalculation;
  onChange: (field: keyof WilkinsonDividerFormState, value: string) => void;
  onReset: () => void;
};

function WilkinsonDividerInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: WilkinsonDividerInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter the system impedance and center frequency for an ideal 2-way
            equal split Wilkinson divider.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="wilkinson-z0"
          label="Z0"
          value={form.z0Ohm}
          onChange={(value) => onChange("z0Ohm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="wilkinson-frequency"
          label="center frequency"
          value={form.fGHz}
          onChange={(value) => onChange("fGHz", value)}
          unit="GHz"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="wilkinson-eps-eff"
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

type WilkinsonDividerResultPanelProps = {
  calculation: WilkinsonDividerCalculation;
  copyText?: string;
};

function WilkinsonDividerResultPanel({
  calculation,
  copyText,
}: WilkinsonDividerResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "quarter-wave line impedance",
          value: formatNumber(
            calculation.value.quarterWaveLineImpedanceOhm,
            3,
          ),
          unit: "Ohm",
        },
        {
          label: "isolation resistor",
          value: formatNumber(calculation.value.isolationResistorOhm, 3),
          unit: "Ohm",
        },
        {
          label: "line electrical length",
          value: formatNumber(calculation.value.electricalLengthDeg, 3),
          unit: "deg",
        },
        {
          label: "physical length",
          value: formatNumber(calculation.value.physicalLengthM * 1000, 3),
          unit: "mm",
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
            Results assume ideal lossless quarter-wave sections and matched
            output ports at the center frequency.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid Wilkinson divider parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: WilkinsonDividerFormState,
  calculation: WilkinsonDividerCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "Z0", value: form.z0Ohm, unit: "Ohm" },
      { label: "center frequency", value: form.fGHz, unit: "GHz" },
      { label: "eps_eff", value: form.epsEff },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "quarter-wave line impedance",
            value: formatNumber(
              calculation.value.quarterWaveLineImpedanceOhm,
              3,
            ),
            unit: "Ohm",
          },
          {
            label: "isolation resistor",
            value: formatNumber(calculation.value.isolationResistorOhm, 3),
            unit: "Ohm",
          },
          {
            label: "line electrical length",
            value: formatNumber(calculation.value.electricalLengthDeg, 3),
            unit: "deg",
          },
          {
            label: "physical length",
            value: formatNumber(calculation.value.physicalLengthM * 1000, 3),
            unit: "mm",
          },
          {
            label: "lambdag",
            value: formatNumber(calculation.value.lambdaGM, 6),
            unit: "m",
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
