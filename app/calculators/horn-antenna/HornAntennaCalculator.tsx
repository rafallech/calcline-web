"use client";

import { useMemo } from "react";
import { HornAntennaDiagram } from "@/components/CalculatorDiagram";
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
  calculateHornAntenna,
  type HornAntennaCalculation,
} from "@/lib/calculators/hornAntenna";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type HornAntennaCalculatorProps = {
  calculator: CalculatorInfo;
};

type HornAntennaFormState = {
  frequencyGHz: string;
  apertureWidthMm: string;
  apertureHeightMm: string;
  apertureEfficiency: string;
};

const defaultFormState: HornAntennaFormState = {
  frequencyGHz: defaultNumber(calculatorDefaults.hornAntenna.frequencyGHz),
  apertureWidthMm: defaultNumber(calculatorDefaults.hornAntenna.apertureWidthMm),
  apertureHeightMm: defaultNumber(
    calculatorDefaults.hornAntenna.apertureHeightMm,
  ),
  apertureEfficiency: defaultNumber(
    calculatorDefaults.hornAntenna.apertureEfficiency,
  ),
};

export function HornAntennaCalculator({
  calculator,
}: HornAntennaCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:horn-antenna-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateHornAntenna({
        frequencyGHz: parseNumericField(form.frequencyGHz),
        apertureWidthMm: parseNumericField(form.apertureWidthMm),
        apertureHeightMm: parseNumericField(form.apertureHeightMm),
        apertureEfficiency: parseNumericField(form.apertureEfficiency),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof HornAntennaFormState, value: string) {
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
        <HornAntennaInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <HornAntennaResultPanel calculation={calculation} copyText={copyText} />
      }
      diagramPanel={<HornAntennaDiagram />}
      formulaPanel={
        <FormulaBlock title="Aperture approximation">
          D = 4 pi A / lambda^2, G = eta D. Approximate beamwidths use
          HPBW_E = 56 lambda / H and HPBW_H = 67 lambda / W.
        </FormulaBlock>
      }
    />
  );
}

type HornAntennaInputPanelProps = {
  form: HornAntennaFormState;
  calculation: HornAntennaCalculation;
  onChange: (field: keyof HornAntennaFormState, value: string) => void;
  onReset: () => void;
};

function HornAntennaInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: HornAntennaInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter rectangular aperture dimensions and aperture efficiency. This
            version is not integrated with the waveguide calculator.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="horn-antenna-frequency"
          label="frequency"
          value={form.frequencyGHz}
          onChange={(value) => onChange("frequencyGHz", value)}
          unit="GHz"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="horn-antenna-width"
          label="aperture width"
          value={form.apertureWidthMm}
          onChange={(value) => onChange("apertureWidthMm", value)}
          unit="mm"
          min={0}
          step={0.1}
        />
        <NumberInput
          id="horn-antenna-height"
          label="aperture height"
          value={form.apertureHeightMm}
          onChange={(value) => onChange("apertureHeightMm", value)}
          unit="mm"
          min={0}
          step={0.1}
        />
        <NumberInput
          id="horn-antenna-efficiency"
          label="aperture efficiency"
          value={form.apertureEfficiency}
          onChange={(value) => onChange("apertureEfficiency", value)}
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

type HornAntennaResultPanelProps = {
  calculation: HornAntennaCalculation;
  copyText?: string;
};

function HornAntennaResultPanel({
  calculation,
  copyText,
}: HornAntennaResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "wavelength",
          value: formatNumber(calculation.value.wavelengthM * 1000, 3),
          unit: "mm",
        },
        {
          label: "aperture area",
          value: formatNumber(calculation.value.apertureAreaM2, 6),
          unit: "m^2",
        },
        {
          label: "directivity",
          value: formatNumber(calculation.value.directivityLinear, 3),
        },
        {
          label: "gain",
          value: formatNumber(calculation.value.gainLinear, 3),
        },
        {
          label: "gain",
          value: formatNumber(calculation.value.gainDbi, 2),
          unit: "dBi",
        },
        {
          label: "E-plane beamwidth",
          value: formatNumber(calculation.value.beamwidthEPlaneDeg, 2),
          unit: "deg",
        },
        {
          label: "H-plane beamwidth",
          value: formatNumber(calculation.value.beamwidthHPlaneDeg, 2),
          unit: "deg",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Aperture-based gain and first-order beamwidth estimates for a
            rectangular horn.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid horn antenna parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: HornAntennaFormState,
  calculation: HornAntennaCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }
  const result = calculation.value;

  return formatResultsText({
    title,
    inputs: [
      { label: "frequency", value: form.frequencyGHz, unit: "GHz" },
      { label: "aperture width", value: form.apertureWidthMm, unit: "mm" },
      { label: "aperture height", value: form.apertureHeightMm, unit: "mm" },
      { label: "aperture efficiency", value: form.apertureEfficiency },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "wavelength",
            value: formatNumber(result.wavelengthM * 1000, 3),
            unit: "mm",
          },
          {
            label: "aperture area",
            value: formatNumber(result.apertureAreaM2, 6),
            unit: "m^2",
          },
          {
            label: "directivity",
            value: formatNumber(result.directivityLinear, 3),
          },
          { label: "gain", value: formatNumber(result.gainLinear, 3) },
          { label: "gain", value: formatNumber(result.gainDbi, 2), unit: "dBi" },
          {
            label: "E-plane beamwidth",
            value: formatNumber(result.beamwidthEPlaneDeg, 2),
            unit: "deg",
          },
          {
            label: "H-plane beamwidth",
            value: formatNumber(result.beamwidthHPlaneDeg, 2),
            unit: "deg",
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
