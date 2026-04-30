"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { RectangularWaveguideDiagram } from "@/components/CalculatorDiagram";
import { CopyResultsButton } from "@/components/CopyResultsButton";
import { FormulaBlock } from "@/components/FormulaBlock";
import { NumberInput } from "@/components/NumberInput";
import { ResetButton } from "@/components/ResetButton";
import { ResultTable } from "@/components/ResultTable";
import { ValidationMessages } from "@/components/ValidationMessages";
import { usePersistentForm } from "@/components/usePersistentForm";
import { calculatorDefaults, defaultNumber } from "@/lib/calculatorDefaults";
import {
  calculateRectangularWaveguide,
  type WaveguideCalculation,
} from "@/lib/calculators/waveguide";
import type { CalculatorInfo } from "@/lib/calculators";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type WaveguideCalculatorProps = {
  calculator: CalculatorInfo;
};

type WaveguideFormState = {
  aMm: string;
  bMm: string;
  epsR: string;
  m: string;
  n: string;
};

const defaultFormState: WaveguideFormState = {
  aMm: defaultNumber(calculatorDefaults.waveguide.aMm),
  bMm: defaultNumber(calculatorDefaults.waveguide.bMm),
  epsR: defaultNumber(calculatorDefaults.waveguide.epsR),
  m: defaultNumber(calculatorDefaults.waveguide.m),
  n: defaultNumber(calculatorDefaults.waveguide.n),
};

export function WaveguideCalculator({ calculator }: WaveguideCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:waveguide-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateRectangularWaveguide({
        aMm: parseNumericField(form.aMm),
        bMm: parseNumericField(form.bMm),
        epsR: parseNumericField(form.epsR),
        m: parseNumericField(form.m),
        n: parseNumericField(form.n),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof WaveguideFormState, value: string) {
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
        <WaveguideInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <WaveguideResultPanel calculation={calculation} copyText={copyText} />
      }
      diagramPanel={<RectangularWaveguideDiagram />}
      formulaPanel={
        <FormulaBlock title="Cutoff frequency">
          fc_mn = c / (2 sqrt(eps_r)) * sqrt((m / a)^2 + (n / b)^2)
        </FormulaBlock>
      }
    />
  );
}

type WaveguideInputPanelProps = {
  form: WaveguideFormState;
  calculation: WaveguideCalculation;
  onChange: (field: keyof WaveguideFormState, value: string) => void;
  onReset: () => void;
};

function WaveguideInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: WaveguideInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Dimensions are entered in millimeters. Mode indices use m along the
            broad wall a and n along the narrow wall b.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="waveguide-a"
          label="a"
          value={form.aMm}
          onChange={(value) => onChange("aMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="waveguide-b"
          label="b"
          value={form.bMm}
          onChange={(value) => onChange("bMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="waveguide-eps-r"
          label="eps_r"
          value={form.epsR}
          onChange={(value) => onChange("epsR", value)}
          min={1}
          step={0.01}
        />
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            id="waveguide-m"
            label="m"
            value={form.m}
            onChange={(value) => onChange("m", value)}
            min={0}
            step={1}
          />
          <NumberInput
            id="waveguide-n"
            label="n"
            value={form.n}
            onChange={(value) => onChange("n", value)}
            min={0}
            step={1}
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

type WaveguideResultPanelProps = {
  calculation: WaveguideCalculation;
  copyText?: string;
};

function WaveguideResultPanel({
  calculation,
  copyText,
}: WaveguideResultPanelProps) {
  const rows = calculation.value
    ? [
        { label: "fc10", value: formatNumber(calculation.value.fc10, 3) },
        { label: "fc20", value: formatNumber(calculation.value.fc20, 3) },
        { label: "fc30", value: formatNumber(calculation.value.fc30, 3) },
        { label: "fc01", value: formatNumber(calculation.value.fc01, 3) },
        { label: "fc02", value: formatNumber(calculation.value.fc02, 3) },
        { label: "fc03", value: formatNumber(calculation.value.fc03, 3) },
        { label: "fc11", value: formatNumber(calculation.value.fc11, 3) },
        { label: "fc12", value: formatNumber(calculation.value.fc12, 3) },
        { label: "fc13", value: formatNumber(calculation.value.fc13, 3) },
        { label: "fcmn", value: formatNumber(calculation.value.fcmn, 3) },
      ].map((row) => ({
        ...row,
        unit: calculation.value?.unit,
      }))
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cutoff frequencies are shown in GHz and rounded to 3 decimal places.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid waveguide parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: WaveguideFormState,
  calculation: WaveguideCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  const unit = calculation.value.unit;

  return formatResultsText({
    title,
    inputs: [
      { label: "a", value: form.aMm, unit: "mm" },
      { label: "b", value: form.bMm, unit: "mm" },
      { label: "eps_r", value: form.epsR },
      { label: "m", value: form.m },
      { label: "n", value: form.n },
    ],
    sections: [
      {
        title: "Results",
        items: [
          { label: "fc10", value: formatNumber(calculation.value.fc10, 3), unit },
          { label: "fc20", value: formatNumber(calculation.value.fc20, 3), unit },
          { label: "fc30", value: formatNumber(calculation.value.fc30, 3), unit },
          { label: "fc01", value: formatNumber(calculation.value.fc01, 3), unit },
          { label: "fc02", value: formatNumber(calculation.value.fc02, 3), unit },
          { label: "fc03", value: formatNumber(calculation.value.fc03, 3), unit },
          { label: "fc11", value: formatNumber(calculation.value.fc11, 3), unit },
          { label: "fc12", value: formatNumber(calculation.value.fc12, 3), unit },
          { label: "fc13", value: formatNumber(calculation.value.fc13, 3), unit },
          { label: "fcmn", value: formatNumber(calculation.value.fcmn, 3), unit },
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
