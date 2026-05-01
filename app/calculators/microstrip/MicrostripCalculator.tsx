"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { MicrostripDiagram } from "@/components/CalculatorDiagram";
import { CopyResultsButton } from "@/components/CopyResultsButton";
import { FormulaBlock } from "@/components/FormulaBlock";
import { NumberInput } from "@/components/NumberInput";
import { ResetButton } from "@/components/ResetButton";
import { ResultTable } from "@/components/ResultTable";
import { ValidationMessages } from "@/components/ValidationMessages";
import { usePersistentForm } from "@/components/usePersistentForm";
import { calculatorDefaults, defaultNumber } from "@/lib/calculatorDefaults";
import {
  calculateMicrostrip,
  type MicrostripCalculation,
} from "@/lib/calculators/microstrip";
import type { CalculatorInfo } from "@/lib/calculators";
import { materialPresets } from "@/lib/data/presets";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type MicrostripCalculatorProps = {
  calculator: CalculatorInfo;
};

type MicrostripMode = "analysis" | "synthesis";

type MicrostripFormState = {
  presetId: string;
  mode: MicrostripMode;
  hMm: string;
  wMm: string;
  z0Ohm: string;
  epsR: string;
  fGHz: string;
};

const CUSTOM_PRESET_ID = "custom";
const RO4003C_PRESET_ID = "rogers-ro4003c-design";
const defaultFormState: MicrostripFormState = {
  presetId: CUSTOM_PRESET_ID,
  mode: calculatorDefaults.microstrip.mode,
  hMm: defaultNumber(calculatorDefaults.microstrip.hMm),
  wMm: defaultNumber(calculatorDefaults.microstrip.wMm),
  z0Ohm: defaultNumber(calculatorDefaults.microstrip.z0Ohm),
  epsR: defaultNumber(calculatorDefaults.microstrip.epsR),
  fGHz: defaultNumber(calculatorDefaults.microstrip.fGHz),
};

export function MicrostripCalculator({
  calculator,
}: MicrostripCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:microstrip-form",
    defaultFormState,
  );

  const calculation = useMemo(() => {
    const sharedInput = {
      hMm: parseNumericField(form.hMm),
      epsR: parseNumericField(form.epsR),
      fGHz: parseNumericField(form.fGHz),
    };

    if (form.mode === "analysis") {
      return calculateMicrostrip({
        mode: "analysis",
        ...sharedInput,
        wMm: parseNumericField(form.wMm),
      });
    }

    return calculateMicrostrip({
      mode: "synthesis",
      ...sharedInput,
      z0Ohm: parseNumericField(form.z0Ohm),
    });
  }, [form]);
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof MicrostripFormState, value: string) {
    setForm((current) => ({
      ...current,
      presetId: field === "epsR" ? CUSTOM_PRESET_ID : current.presetId,
      [field]: value,
    }));
  }

  function updateMode(mode: MicrostripMode) {
    setForm((current) => ({
      ...current,
      mode,
    }));
  }

  function updateMaterialPreset(presetId: string) {
    if (presetId === CUSTOM_PRESET_ID) {
      setForm((current) => ({
        ...current,
        presetId,
      }));
      return;
    }

    const preset = materialPresets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setForm((current) => ({
      ...current,
      presetId,
      epsR: defaultNumber(preset.values.epsR),
    }));
  }

  function resetForm() {
    resetStoredForm();
  }

  function loadExample() {
    setForm((current) => ({
      ...current,
      presetId: RO4003C_PRESET_ID,
      mode: "synthesis",
      hMm: "1.524",
      z0Ohm: "50",
      epsR: "3.55",
      fGHz: "2.4",
    }));
  }

  return (
    <CalculatorLayout
      title={calculator.title}
      description={calculator.description}
      inputPanel={
        <MicrostripInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onModeChange={updateMode}
          onPresetChange={updateMaterialPreset}
          onLoadExample={loadExample}
          onReset={resetForm}
        />
      }
      resultPanel={
        <MicrostripResultPanel calculation={calculation} copyText={copyText} />
      }
      diagramPanel={<MicrostripDiagram />}
      formulaPanel={
        <FormulaBlock title="Microstrip formulas">
          Analysis calculates Z0 from H, W, eps_r and f. Synthesis calculates W
          from H, Z0, eps_r and f.
        </FormulaBlock>
      }
    />
  );
}

type MicrostripInputPanelProps = {
  form: MicrostripFormState;
  calculation: MicrostripCalculation;
  onChange: (field: keyof MicrostripFormState, value: string) => void;
  onModeChange: (mode: MicrostripMode) => void;
  onPresetChange: (presetId: string) => void;
  onLoadExample: () => void;
  onReset: () => void;
};

function MicrostripInputPanel({
  form,
  calculation,
  onChange,
  onModeChange,
  onPresetChange,
  onLoadExample,
  onReset,
}: MicrostripInputPanelProps) {
  const selectedPreset = materialPresets.find(
    (preset) => preset.id === form.presetId,
  );
  const selectedPresetId = selectedPreset?.id ?? CUSTOM_PRESET_ID;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use Analysis to calculate impedance from line width, or Synthesis to
            calculate line width from target impedance.
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

      <div className="grid grid-cols-2 rounded-md border border-slate-300 bg-slate-50 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => onModeChange("analysis")}
          className={`rounded px-3 py-2 transition ${
            form.mode === "analysis"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          Analysis
        </button>
        <button
          type="button"
          onClick={() => onModeChange("synthesis")}
          className={`rounded px-3 py-2 transition ${
            form.mode === "synthesis"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          Synthesis
        </button>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="microstrip-material-preset"
          className="block text-sm font-medium text-slate-800"
        >
          Material preset
        </label>
        <select
          id="microstrip-material-preset"
          value={selectedPresetId}
          onChange={(event) => onPresetChange(event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        >
          <option value={CUSTOM_PRESET_ID}>Custom</option>
          {materialPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
        <p className="text-sm leading-6 text-slate-600">
          {selectedPreset
            ? `${selectedPreset.description} eps_r = ${formatNumber(
                selectedPreset.values.epsR,
                3,
              )}.`
            : "Custom material: set eps_r manually."}
        </p>
        {selectedPreset?.sourceNote ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
            {selectedPreset.sourceNote}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="microstrip-h"
          label="H"
          value={form.hMm}
          onChange={(value) => onChange("hMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
        {form.mode === "analysis" ? (
          <NumberInput
            id="microstrip-w"
            label="W"
            value={form.wMm}
            onChange={(value) => onChange("wMm", value)}
            unit="mm"
            min={0}
            step={0.01}
          />
        ) : (
          <NumberInput
            id="microstrip-z0"
            label="Z0"
            value={form.z0Ohm}
            onChange={(value) => onChange("z0Ohm", value)}
            unit="Ohm"
            min={0}
            step={0.1}
          />
        )}
        <NumberInput
          id="microstrip-eps-r"
          label="eps_r"
          value={form.epsR}
          onChange={(value) => onChange("epsR", value)}
          min={1}
          step={0.01}
        />
        <NumberInput
          id="microstrip-f"
          label="f"
          value={form.fGHz}
          onChange={(value) => onChange("fGHz", value)}
          unit="GHz"
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

type MicrostripResultPanelProps = {
  calculation: MicrostripCalculation;
  copyText?: string;
};

function MicrostripResultPanel({
  calculation,
  copyText,
}: MicrostripResultPanelProps) {
  const rows = calculation.value
    ? calculation.value.mode === "analysis"
      ? [
          {
            label: "Z0",
            value: formatNumber(calculation.value.z0Ohm, 3),
            unit: "Ohm",
          },
          {
            label: "eps_eff",
            value: formatNumber(calculation.value.epsEff, 3),
          },
          {
            label: "lambda",
            value: formatNumber(calculation.value.lambdaMm, 3),
            unit: "mm",
          },
        ]
      : [
          {
            label: "W",
            value: formatNumber(calculation.value.wMm, 3),
            unit: "mm",
          },
          {
            label: "eps_eff",
            value: formatNumber(calculation.value.epsEff, 3),
          },
          {
            label: "lambda",
            value: formatNumber(calculation.value.lambdaMm, 3),
            unit: "mm",
          },
        ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Results update from the selected mode and valid input values.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid microstrip parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: MicrostripFormState,
  calculation: MicrostripCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  const inputs =
    form.mode === "analysis"
      ? [
          { label: "Mode", value: "Analysis" },
          { label: "H", value: form.hMm, unit: "mm" },
          { label: "W", value: form.wMm, unit: "mm" },
          { label: "eps_r", value: form.epsR },
          { label: "f", value: form.fGHz, unit: "GHz" },
        ]
      : [
          { label: "Mode", value: "Synthesis" },
          { label: "H", value: form.hMm, unit: "mm" },
          { label: "Z0", value: form.z0Ohm, unit: "Ohm" },
          { label: "eps_r", value: form.epsR },
          { label: "f", value: form.fGHz, unit: "GHz" },
        ];

  const results =
    calculation.value.mode === "analysis"
      ? [
          {
            label: "Z0",
            value: formatNumber(calculation.value.z0Ohm, 3),
            unit: "Ohm",
          },
          {
            label: "eps_eff",
            value: formatNumber(calculation.value.epsEff, 3),
          },
          {
            label: "lambda",
            value: formatNumber(calculation.value.lambdaMm, 3),
            unit: "mm",
          },
        ]
      : [
          {
            label: "W",
            value: formatNumber(calculation.value.wMm, 3),
            unit: "mm",
          },
          {
            label: "eps_eff",
            value: formatNumber(calculation.value.epsEff, 3),
          },
          {
            label: "lambda",
            value: formatNumber(calculation.value.lambdaMm, 3),
            unit: "mm",
          },
        ];

  return formatResultsText({
    title,
    inputs,
    sections: [{ title: "Results", items: results }],
    warnings: calculation.warnings,
  });
}

function parseNumericField(value: string): number {
  if (value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}
