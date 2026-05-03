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
  calculateWavelength,
  type WavelengthCalculation,
  type WavelengthFrequencyUnit,
  type WavelengthLengthUnit,
} from "@/lib/calculators/wavelength";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type WavelengthCalculatorProps = {
  calculator: CalculatorInfo;
};

type WavelengthFormState = {
  frequency: string;
  frequencyUnit: WavelengthFrequencyUnit;
  epsEff: string;
  physicalLength: string;
  lengthUnit: WavelengthLengthUnit;
};

const defaultFormState: WavelengthFormState = {
  frequency: defaultNumber(calculatorDefaults.wavelength.frequency),
  frequencyUnit: calculatorDefaults.wavelength.frequencyUnit,
  epsEff: defaultNumber(calculatorDefaults.wavelength.epsEff),
  physicalLength: defaultNumber(calculatorDefaults.wavelength.physicalLength),
  lengthUnit: calculatorDefaults.wavelength.lengthUnit,
};

const frequencyUnitOptions: {
  value: WavelengthFrequencyUnit;
  label: string;
}[] = [
  { value: "Hz", label: "Hz" },
  { value: "kHz", label: "kHz" },
  { value: "MHz", label: "MHz" },
  { value: "GHz", label: "GHz" },
];

const lengthUnitOptions: {
  value: WavelengthLengthUnit;
  label: string;
}[] = [
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
  { value: "m", label: "m" },
];

export function WavelengthCalculator({
  calculator,
}: WavelengthCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:wavelength-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateWavelength({
        frequency: parseNumericField(form.frequency),
        frequencyUnit: form.frequencyUnit,
        epsEff: parseNumericField(form.epsEff),
        physicalLength: parseNumericField(form.physicalLength),
        lengthUnit: form.lengthUnit,
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof WavelengthFormState, value: string) {
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
        <WavelengthInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <WavelengthResultPanel calculation={calculation} copyText={copyText} />
      }
      formulaPanel={
        <FormulaBlock title="Wavelength and electrical length">
          lambda0 = c / f; lambdag = lambda0 / sqrt(eps_eff); length / lambdag;
          theta = 360 deg * length / lambdag.
        </FormulaBlock>
      }
    />
  );
}

type WavelengthInputPanelProps = {
  form: WavelengthFormState;
  calculation: WavelengthCalculation;
  onChange: (field: keyof WavelengthFormState, value: string) => void;
  onReset: () => void;
};

function WavelengthInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: WavelengthInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter frequency, effective permittivity, and physical line length.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="wavelength-frequency"
          label="frequency"
          value={form.frequency}
          onChange={(value) => onChange("frequency", value)}
          min={0}
          step={0.01}
        />
        <UnitSelect
          id="wavelength-frequency-unit"
          label="frequency unit"
          value={form.frequencyUnit}
          options={frequencyUnitOptions}
          onChange={(value) => onChange("frequencyUnit", value)}
        />
        <NumberInput
          id="wavelength-eps-eff"
          label="eps_eff"
          value={form.epsEff}
          onChange={(value) => onChange("epsEff", value)}
          min={1}
          step={0.01}
        />
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            id="wavelength-physical-length"
            label="physical length"
            value={form.physicalLength}
            onChange={(value) => onChange("physicalLength", value)}
            min={0}
            step={0.01}
          />
          <UnitSelect
            id="wavelength-length-unit"
            label="length unit"
            value={form.lengthUnit}
            options={lengthUnitOptions}
            onChange={(value) => onChange("lengthUnit", value)}
          />
        </div>
      </div>

      <ValidationMessages
        errors={calculation.errors}
        warnings={calculation.warnings}
      />
    </div>
  );
}

type WavelengthResultPanelProps = {
  calculation: WavelengthCalculation;
  copyText?: string;
};

function WavelengthResultPanel({
  calculation,
  copyText,
}: WavelengthResultPanelProps) {
  const rows = calculation.value
    ? [
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
        {
          label: "length / lambdag",
          value: formatNumber(calculation.value.lengthInWavelengths, 6),
        },
        {
          label: "electrical length",
          value: formatNumber(calculation.value.electricalLengthDeg, 3),
          unit: "deg",
        },
        {
          label: "electrical length",
          value: formatNumber(calculation.value.electricalLengthRad, 6),
          unit: "rad",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Length is shown as a full electrical length, not reduced modulo 360
            degrees.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid wavelength parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: WavelengthFormState,
  calculation: WavelengthCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      {
        label: "frequency",
        value: form.frequency,
        unit: form.frequencyUnit,
      },
      { label: "eps_eff", value: form.epsEff },
      {
        label: "physical length",
        value: form.physicalLength,
        unit: form.lengthUnit,
      },
    ],
    sections: [
      {
        title: "Results",
        items: [
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
          {
            label: "length / lambdag",
            value: formatNumber(calculation.value.lengthInWavelengths, 6),
          },
          {
            label: "electrical length",
            value: formatNumber(calculation.value.electricalLengthDeg, 3),
            unit: "deg",
          },
          {
            label: "electrical length",
            value: formatNumber(calculation.value.electricalLengthRad, 6),
            unit: "rad",
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

