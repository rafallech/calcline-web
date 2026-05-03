"use client";

import { useMemo } from "react";
import { DipoleMonopoleDiagram } from "@/components/CalculatorDiagram";
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
  calculateDipoleMonopole,
  type DipoleMonopoleAntennaType,
  type DipoleMonopoleCalculation,
} from "@/lib/calculators/dipoleMonopole";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type DipoleMonopoleCalculatorProps = {
  calculator: CalculatorInfo;
};

type DipoleMonopoleFormState = {
  frequencyMHz: string;
  velocityFactor: string;
  antennaType: DipoleMonopoleAntennaType;
};

const antennaTypes: { value: DipoleMonopoleAntennaType; label: string }[] = [
  { value: "halfWaveDipole", label: "half-wave dipole" },
  { value: "quarterWaveMonopole", label: "quarter-wave monopole" },
];

const defaultFormState: DipoleMonopoleFormState = {
  frequencyMHz: defaultNumber(calculatorDefaults.dipoleMonopole.frequencyMHz),
  velocityFactor: defaultNumber(
    calculatorDefaults.dipoleMonopole.velocityFactor,
  ),
  antennaType: calculatorDefaults.dipoleMonopole.antennaType,
};

export function DipoleMonopoleCalculator({
  calculator,
}: DipoleMonopoleCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:dipole-monopole-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateDipoleMonopole({
        frequencyMHz: parseNumericField(form.frequencyMHz),
        velocityFactor: parseNumericField(form.velocityFactor),
        antennaType: form.antennaType,
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof DipoleMonopoleFormState, value: string) {
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
        <DipoleMonopoleInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <DipoleMonopoleResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      diagramPanel={<DipoleMonopoleDiagram />}
      formulaPanel={
        <FormulaBlock title="Wire antenna length estimate">
          lambda0 = c / f. Corrected lambda = lambda0 * velocity factor.
          Half-wave dipole total length is corrected lambda / 2; each arm and
          a quarter-wave monopole are corrected lambda / 4.
        </FormulaBlock>
      }
    />
  );
}

type DipoleMonopoleInputPanelProps = {
  form: DipoleMonopoleFormState;
  calculation: DipoleMonopoleCalculation;
  onChange: (field: keyof DipoleMonopoleFormState, value: string) => void;
  onReset: () => void;
};

function DipoleMonopoleInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: DipoleMonopoleInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter operating frequency and a shortening factor for the conductor
            or construction style.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="dipole-monopole-type"
          className="block text-sm font-medium text-slate-800"
        >
          antenna type
        </label>
        <select
          id="dipole-monopole-type"
          value={form.antennaType}
          onChange={(event) => onChange("antennaType", event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        >
          {antennaTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="dipole-monopole-frequency"
          label="frequency"
          value={form.frequencyMHz}
          onChange={(value) => onChange("frequencyMHz", value)}
          unit="MHz"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="dipole-monopole-velocity-factor"
          label="velocity factor"
          value={form.velocityFactor}
          onChange={(value) => onChange("velocityFactor", value)}
          min={0}
          max={1}
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

type DipoleMonopoleResultPanelProps = {
  calculation: DipoleMonopoleCalculation;
  copyText?: string;
};

function DipoleMonopoleResultPanel({
  calculation,
  copyText,
}: DipoleMonopoleResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "free-space wavelength",
          value: formatNumber(calculation.value.freeSpaceWavelengthM, 4),
          unit: "m",
        },
        {
          label: "corrected wavelength",
          value: formatNumber(calculation.value.correctedWavelengthM, 4),
          unit: "m",
        },
        {
          label: "total dipole length",
          value: formatNumber(calculation.value.totalDipoleLengthM, 4),
          unit: "m",
        },
        {
          label: "each dipole arm length",
          value: formatNumber(calculation.value.eachDipoleArmLengthM, 4),
          unit: "m",
        },
        {
          label: "monopole length",
          value: formatNumber(calculation.value.monopoleLengthM, 4),
          unit: "m",
        },
        {
          label: `selected ${calculation.value.selectedLengthLabel}`,
          value: formatNumber(calculation.value.selectedLengthM, 4),
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
            Use these physical lengths as a starting point for cutting and
            trimming the antenna.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid dipole or monopole parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: DipoleMonopoleFormState,
  calculation: DipoleMonopoleCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }
  const result = calculation.value;

  return formatResultsText({
    title,
    inputs: [
      { label: "antenna type", value: selectedTypeLabel(form.antennaType) },
      { label: "frequency", value: form.frequencyMHz, unit: "MHz" },
      { label: "velocity factor", value: form.velocityFactor },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "free-space wavelength",
            value: formatNumber(result.freeSpaceWavelengthM, 4),
            unit: "m",
          },
          {
            label: "corrected wavelength",
            value: formatNumber(result.correctedWavelengthM, 4),
            unit: "m",
          },
          {
            label: "total dipole length",
            value: formatNumber(result.totalDipoleLengthM, 4),
            unit: "m",
          },
          {
            label: "each dipole arm length",
            value: formatNumber(result.eachDipoleArmLengthM, 4),
            unit: "m",
          },
          {
            label: "monopole length",
            value: formatNumber(result.monopoleLengthM, 4),
            unit: "m",
          },
          {
            label: `selected ${result.selectedLengthLabel}`,
            value: formatNumber(result.selectedLengthM, 4),
            unit: "m",
          },
        ],
      },
    ],
    warnings: calculation.warnings,
  });
}

function selectedTypeLabel(value: DipoleMonopoleAntennaType): string {
  return antennaTypes.find((type) => type.value === value)?.label ?? value;
}

function parseNumericField(value: string): number {
  if (value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}
