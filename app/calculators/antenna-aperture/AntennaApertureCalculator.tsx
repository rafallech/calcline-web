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
  calculateAntennaAperture,
  type AntennaApertureCalculation,
  type AntennaApertureInputMode,
} from "@/lib/calculators/antennaAperture";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type AntennaApertureCalculatorProps = {
  calculator: CalculatorInfo;
};

type AntennaApertureFormState = {
  mode: AntennaApertureInputMode;
  frequencyGHz: string;
  gainDbi: string;
  effectiveApertureM2: string;
  efficiency: string;
};

const defaultFormState: AntennaApertureFormState = {
  mode: calculatorDefaults.antennaAperture.mode,
  frequencyGHz: defaultNumber(calculatorDefaults.antennaAperture.frequencyGHz),
  gainDbi: defaultNumber(calculatorDefaults.antennaAperture.gainDbi),
  effectiveApertureM2: defaultNumber(
    calculatorDefaults.antennaAperture.effectiveApertureM2,
  ),
  efficiency: defaultNumber(calculatorDefaults.antennaAperture.efficiency),
};

export function AntennaApertureCalculator({
  calculator,
}: AntennaApertureCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:antenna-aperture-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateAntennaAperture({
        mode: form.mode,
        frequencyGHz: parseNumericField(form.frequencyGHz),
        gainDbi: parseNumericField(form.gainDbi),
        effectiveApertureM2: parseNumericField(form.effectiveApertureM2),
        efficiency: parseOptionalNumericField(form.efficiency),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof AntennaApertureFormState, value: string) {
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
        <AntennaApertureInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <AntennaApertureResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      formulaPanel={
        <FormulaBlock title="Gain and effective aperture">
          Ae = G lambda^2 / (4 pi), and G = 4 pi Ae / lambda^2. Optional
          efficiency estimates directivity with D ~= G / eta.
        </FormulaBlock>
      }
    />
  );
}

type AntennaApertureInputPanelProps = {
  form: AntennaApertureFormState;
  calculation: AntennaApertureCalculation;
  onChange: (field: keyof AntennaApertureFormState, value: string) => void;
  onReset: () => void;
};

function AntennaApertureInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: AntennaApertureInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Convert between gain and effective aperture at a single frequency.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="antenna-aperture-mode"
          className="block text-sm font-medium text-slate-800"
        >
          input type
        </label>
        <select
          id="antenna-aperture-mode"
          value={form.mode}
          onChange={(event) => onChange("mode", event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="gainDbi">gain in dBi</option>
          <option value="effectiveAperture">effective aperture Ae</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="antenna-aperture-frequency"
          label="frequency"
          value={form.frequencyGHz}
          onChange={(value) => onChange("frequencyGHz", value)}
          unit="GHz"
          min={0}
          step={0.01}
        />
        {form.mode === "gainDbi" ? (
          <NumberInput
            id="antenna-aperture-gain"
            label="gain"
            value={form.gainDbi}
            onChange={(value) => onChange("gainDbi", value)}
            unit="dBi"
            step={0.1}
          />
        ) : (
          <NumberInput
            id="antenna-aperture-ae"
            label="effective aperture Ae"
            value={form.effectiveApertureM2}
            onChange={(value) => onChange("effectiveApertureM2", value)}
            unit="m^2"
            min={0}
            step={0.001}
          />
        )}
        <NumberInput
          id="antenna-aperture-efficiency"
          label="efficiency"
          value={form.efficiency}
          onChange={(value) => onChange("efficiency", value)}
          min={0}
          max={1}
          step={0.01}
          description="Optional; leave blank to use eta = 1 for directivity."
        />
      </div>

      <ValidationMessages
        errors={calculation.errors}
        warnings={calculation.warnings}
      />
    </div>
  );
}

type AntennaApertureResultPanelProps = {
  calculation: AntennaApertureCalculation;
  copyText?: string;
};

function AntennaApertureResultPanel({
  calculation,
  copyText,
}: AntennaApertureResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "wavelength",
          value: formatNumber(calculation.value.wavelengthM, 6),
          unit: "m",
        },
        {
          label: "gain linear",
          value: formatNumber(calculation.value.gainLinear, 4),
        },
        {
          label: "gain",
          value: formatNumber(calculation.value.gainDbi, 3),
          unit: "dBi",
        },
        {
          label: "effective aperture Ae",
          value: formatNumber(calculation.value.effectiveApertureM2, 6),
          unit: "m^2",
        },
        {
          label: "directivity estimate",
          value: formatNumber(
            calculation.value.directivityEstimateLinear,
            4,
          ),
          note: `${formatNumber(calculation.value.directivityEstimateDbi, 3)} dBi, eta = ${formatNumber(calculation.value.efficiencyUsed, 3)}`,
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gain and effective aperture are linked by the antenna aperture
            equation.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid antenna gain or aperture parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: AntennaApertureFormState,
  calculation: AntennaApertureCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }
  const result = calculation.value;

  return formatResultsText({
    title,
    inputs: [
      {
        label: "input type",
        value: form.mode === "gainDbi" ? "gain in dBi" : "effective aperture Ae",
      },
      { label: "frequency", value: form.frequencyGHz, unit: "GHz" },
      ...(form.mode === "gainDbi"
        ? [{ label: "gain", value: form.gainDbi, unit: "dBi" }]
        : [
            {
              label: "effective aperture Ae",
              value: form.effectiveApertureM2,
              unit: "m^2",
            },
          ]),
      { label: "efficiency", value: form.efficiency || "blank" },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "wavelength",
            value: formatNumber(result.wavelengthM, 6),
            unit: "m",
          },
          { label: "gain linear", value: formatNumber(result.gainLinear, 4) },
          { label: "gain", value: formatNumber(result.gainDbi, 3), unit: "dBi" },
          {
            label: "effective aperture Ae",
            value: formatNumber(result.effectiveApertureM2, 6),
            unit: "m^2",
          },
          {
            label: "directivity estimate",
            value: formatNumber(result.directivityEstimateLinear, 4),
          },
          {
            label: "directivity estimate",
            value: formatNumber(result.directivityEstimateDbi, 3),
            unit: "dBi",
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

function parseOptionalNumericField(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  return Number(value);
}
