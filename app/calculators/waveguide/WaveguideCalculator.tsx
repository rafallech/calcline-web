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
import { waveguidePresets } from "@/lib/data/presets";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type WaveguideCalculatorProps = {
  calculator: CalculatorInfo;
};

type WaveguideFormState = {
  presetId: string;
  aMm: string;
  bMm: string;
  epsR: string;
  m: string;
  n: string;
};

const CUSTOM_PRESET_ID = "custom";
const WR90_PRESET_ID = "wr-90";
const defaultFormState: WaveguideFormState = {
  presetId: CUSTOM_PRESET_ID,
  aMm: defaultNumber(calculatorDefaults.waveguide.aMm),
  bMm: defaultNumber(calculatorDefaults.waveguide.bMm),
  epsR: defaultNumber(calculatorDefaults.waveguide.epsR),
  m: defaultNumber(calculatorDefaults.waveguide.m),
  n: defaultNumber(calculatorDefaults.waveguide.n),
};
const exampleFormState: WaveguideFormState = {
  presetId: WR90_PRESET_ID,
  aMm: "22.86",
  bMm: "10.16",
  epsR: "1",
  m: "1",
  n: "0",
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
      presetId:
        field === "aMm" || field === "bMm"
          ? CUSTOM_PRESET_ID
          : current.presetId,
      [field]: value,
    }));
  }

  function updateWaveguidePreset(presetId: string) {
    if (presetId === CUSTOM_PRESET_ID) {
      setForm((current) => ({
        ...current,
        presetId,
      }));
      return;
    }

    const preset = waveguidePresets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setForm((current) => ({
      ...current,
      presetId,
      aMm: defaultNumber(preset.values.aMm),
      bMm: defaultNumber(preset.values.bMm),
    }));
  }

  function resetForm() {
    resetStoredForm();
  }

  function loadExample() {
    setForm(exampleFormState);
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
          onPresetChange={updateWaveguidePreset}
          onLoadExample={loadExample}
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
  onPresetChange: (presetId: string) => void;
  onLoadExample: () => void;
  onReset: () => void;
};

function WaveguideInputPanel({
  form,
  calculation,
  onChange,
  onPresetChange,
  onLoadExample,
  onReset,
}: WaveguideInputPanelProps) {
  const selectedPreset = waveguidePresets.find(
    (preset) => preset.id === form.presetId,
  );
  const selectedPresetId = selectedPreset?.id ?? CUSTOM_PRESET_ID;

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
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onLoadExample}
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-cyan-700 bg-cyan-50 px-3 text-sm font-medium text-cyan-900 transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-700/20"
          >
            Load example
          </button>
          <ResetButton onClick={onReset} />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="waveguide-preset"
          className="block text-sm font-medium text-slate-800"
        >
          Waveguide preset
        </label>
        <select
          id="waveguide-preset"
          value={selectedPresetId}
          onChange={(event) => onPresetChange(event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        >
          <option value={CUSTOM_PRESET_ID}>Custom</option>
          {waveguidePresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
        <p className="text-sm leading-6 text-slate-600">
          {selectedPreset
            ? `${selectedPreset.description} a = ${formatNumber(
                selectedPreset.values.aMm,
                3,
              )} mm, b = ${formatNumber(selectedPreset.values.bMm, 3)} mm.`
            : "Custom dimensions: set a and b manually."}
        </p>
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
