"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { DirectionalCouplerDiagram } from "@/components/CalculatorDiagram";
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
  calculateDirectionalCoupler,
  type DirectionalCouplerCalculation,
} from "@/lib/calculators/directionalCoupler";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type DirectionalCouplerCalculatorProps = {
  calculator: CalculatorInfo;
};

type DirectionalCouplerFormState = {
  z0Ohm: string;
  fGHz: string;
  epsEff: string;
};

const defaultFormState: DirectionalCouplerFormState = {
  z0Ohm: defaultNumber(calculatorDefaults.directionalCoupler.z0Ohm),
  fGHz: defaultNumber(calculatorDefaults.directionalCoupler.fGHz),
  epsEff: defaultNumber(calculatorDefaults.directionalCoupler.epsEff),
};

export function DirectionalCouplerCalculator({
  calculator,
}: DirectionalCouplerCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:directional-coupler-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateDirectionalCoupler({
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

  function updateField(field: keyof DirectionalCouplerFormState, value: string) {
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
        <DirectionalCouplerInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <DirectionalCouplerResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      formulaPanel={
        <div className="space-y-5">
          <FormulaBlock title="Branch-line 90 degree hybrid">
            Series arms = Z0 / sqrt(2); branch arms = Z0; lambdag = c / (f
            sqrt(eps_eff)); physical length = lambdag / 4.
          </FormulaBlock>
          <DirectionalCouplerDiagram />
        </div>
      }
    />
  );
}

type DirectionalCouplerInputPanelProps = {
  form: DirectionalCouplerFormState;
  calculation: DirectionalCouplerCalculation;
  onChange: (field: keyof DirectionalCouplerFormState, value: string) => void;
  onReset: () => void;
};

function DirectionalCouplerInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: DirectionalCouplerInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter the system impedance and center frequency for an ideal
            branch-line 90 degree hybrid.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="directional-coupler-z0"
          label="Z0"
          value={form.z0Ohm}
          onChange={(value) => onChange("z0Ohm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="directional-coupler-frequency"
          label="center frequency"
          value={form.fGHz}
          onChange={(value) => onChange("fGHz", value)}
          unit="GHz"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="directional-coupler-eps-eff"
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

type DirectionalCouplerResultPanelProps = {
  calculation: DirectionalCouplerCalculation;
  copyText?: string;
};

function DirectionalCouplerResultPanel({
  calculation,
  copyText,
}: DirectionalCouplerResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "series arm impedance",
          value: formatNumber(calculation.value.seriesArmImpedanceOhm, 3),
          unit: "Ohm",
        },
        {
          label: "branch arm impedance",
          value: formatNumber(calculation.value.branchArmImpedanceOhm, 3),
          unit: "Ohm",
        },
        {
          label: "quarter-wave physical length",
          value: formatNumber(calculation.value.physicalLengthM * 1000, 3),
          unit: "mm",
        },
        {
          label: "guided wavelength",
          value: formatNumber(calculation.value.lambdaGM, 6),
          unit: "m",
        },
        {
          label: "ideal split",
          value: formatNumber(calculation.value.idealSplitDb, 3),
          unit: "dB",
          note: "per output port",
        },
        {
          label: "phase relation",
          value: formatNumber(calculation.value.phaseRelationDeg, 3),
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
            Nominal equal split branch-line hybrid values at the center
            frequency.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid directional coupler parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: DirectionalCouplerFormState,
  calculation: DirectionalCouplerCalculation,
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
            label: "series arm impedance",
            value: formatNumber(calculation.value.seriesArmImpedanceOhm, 3),
            unit: "Ohm",
          },
          {
            label: "branch arm impedance",
            value: formatNumber(calculation.value.branchArmImpedanceOhm, 3),
            unit: "Ohm",
          },
          {
            label: "quarter-wave physical length",
            value: formatNumber(calculation.value.physicalLengthM * 1000, 3),
            unit: "mm",
          },
          {
            label: "guided wavelength",
            value: formatNumber(calculation.value.lambdaGM, 6),
            unit: "m",
          },
          {
            label: "ideal split",
            value: formatNumber(calculation.value.idealSplitDb, 3),
            unit: "dB per output port",
          },
          {
            label: "phase relation",
            value: formatNumber(calculation.value.phaseRelationDeg, 3),
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
