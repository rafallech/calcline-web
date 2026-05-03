"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { CopyResultsButton } from "@/components/CopyResultsButton";
import { FormulaBlock } from "@/components/FormulaBlock";
import { NumberInput } from "@/components/NumberInput";
import { PresetSelect } from "@/components/PresetSelect";
import { ResetButton } from "@/components/ResetButton";
import { ResultTable } from "@/components/ResultTable";
import { ValidationMessages } from "@/components/ValidationMessages";
import { usePersistentForm } from "@/components/usePersistentForm";
import { calculatorDefaults, defaultNumber } from "@/lib/calculatorDefaults";
import type { CalculatorInfo } from "@/lib/calculators";
import {
  calculateQuarterWaveTransformer,
  type QuarterWaveTransformerCalculation,
} from "@/lib/calculators/quarterWaveTransformer";
import {
  commonEffectivePermittivityPresets,
  commonFrequencyPresets,
  commonImpedancePresets,
} from "@/lib/data/presets";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type QuarterWaveTransformerCalculatorProps = {
  calculator: CalculatorInfo;
};

type QuarterWaveTransformerFormState = {
  z0Ohm: string;
  rLOhm: string;
  fGHz: string;
  epsEff: string;
};

const CUSTOM_PRESET_ID = "custom";

const defaultFormState: QuarterWaveTransformerFormState = {
  z0Ohm: defaultNumber(calculatorDefaults.quarterWaveTransformer.z0Ohm),
  rLOhm: defaultNumber(calculatorDefaults.quarterWaveTransformer.rLOhm),
  fGHz: defaultNumber(calculatorDefaults.quarterWaveTransformer.fGHz),
  epsEff: defaultNumber(calculatorDefaults.quarterWaveTransformer.epsEff),
};

export function QuarterWaveTransformerCalculator({
  calculator,
}: QuarterWaveTransformerCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:quarter-wave-transformer-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateQuarterWaveTransformer({
        z0Ohm: parseNumericField(form.z0Ohm),
        rLOhm: parseNumericField(form.rLOhm),
        fGHz: parseNumericField(form.fGHz),
        epsEff: parseNumericField(form.epsEff),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(
    field: keyof QuarterWaveTransformerFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    resetStoredForm();
  }

  function applyImpedancePreset(
    field: "z0Ohm" | "rLOhm",
    presetId: string,
  ) {
    const preset = commonImpedancePresets.find((item) => item.id === presetId);

    if (preset) {
      updateField(field, String(preset.values.ohms));
    }
  }

  function applyFrequencyPreset(presetId: string) {
    const preset = commonFrequencyPresets.find((item) => item.id === presetId);

    if (preset) {
      updateField("fGHz", String(preset.values.frequencyGHz));
    }
  }

  function applyEpsEffPreset(presetId: string) {
    const preset = commonEffectivePermittivityPresets.find(
      (item) => item.id === presetId,
    );

    if (preset) {
      updateField("epsEff", String(preset.values.epsEff));
    }
  }

  return (
    <CalculatorLayout
      title={calculator.title}
      description={calculator.description}
      inputPanel={
        <QuarterWaveTransformerInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onImpedancePresetChange={applyImpedancePreset}
          onFrequencyPresetChange={applyFrequencyPreset}
          onEpsEffPresetChange={applyEpsEffPreset}
          onReset={resetForm}
        />
      }
      resultPanel={
        <QuarterWaveTransformerResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      formulaPanel={
        <FormulaBlock title="Quarter-wave transformer">
          Zt = sqrt(Z0 RL); lambda0 = c / f; lambdag = lambda0 /
          sqrt(eps_eff); physical length = lambdag / 4.
        </FormulaBlock>
      }
    />
  );
}

type QuarterWaveTransformerInputPanelProps = {
  form: QuarterWaveTransformerFormState;
  calculation: QuarterWaveTransformerCalculation;
  onChange: (
    field: keyof QuarterWaveTransformerFormState,
    value: string,
  ) => void;
  onImpedancePresetChange: (
    field: "z0Ohm" | "rLOhm",
    presetId: string,
  ) => void;
  onFrequencyPresetChange: (presetId: string) => void;
  onEpsEffPresetChange: (presetId: string) => void;
  onReset: () => void;
};

function QuarterWaveTransformerInputPanel({
  form,
  calculation,
  onChange,
  onImpedancePresetChange,
  onFrequencyPresetChange,
  onEpsEffPresetChange,
  onReset,
}: QuarterWaveTransformerInputPanelProps) {
  const selectedZ0PresetId = findCommonImpedancePresetId(form.z0Ohm);
  const selectedRlPresetId = findCommonImpedancePresetId(form.rLOhm);
  const selectedFrequencyPresetId = findCommonFrequencyPresetId(form.fGHz);
  const selectedEpsEffPresetId = findCommonEpsEffPresetId(form.epsEff);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter real source and load resistances plus the design frequency.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PresetSelect
          id="quarter-wave-z0-preset"
          label="Z0 preset"
          value={selectedZ0PresetId}
          options={commonImpedancePresets}
          onChange={(presetId) => onImpedancePresetChange("z0Ohm", presetId)}
          customValue={CUSTOM_PRESET_ID}
          description="Pick a common system impedance or keep a custom value."
        />
        <PresetSelect
          id="quarter-wave-rl-preset"
          label="RL preset"
          value={selectedRlPresetId}
          options={commonImpedancePresets}
          onChange={(presetId) => onImpedancePresetChange("rLOhm", presetId)}
          customValue={CUSTOM_PRESET_ID}
          description="Pick a common load resistance or keep a custom value."
        />
        <PresetSelect
          id="quarter-wave-frequency-preset"
          label="Frequency preset"
          value={selectedFrequencyPresetId}
          options={commonFrequencyPresets}
          onChange={onFrequencyPresetChange}
          customValue={CUSTOM_PRESET_ID}
          description="Pick a common RF frequency or keep a custom value."
        />
        <PresetSelect
          id="quarter-wave-eps-eff-preset"
          label="eps_eff preset"
          value={selectedEpsEffPresetId}
          options={commonEffectivePermittivityPresets}
          onChange={onEpsEffPresetChange}
          customValue={CUSTOM_PRESET_ID}
          description="Pick a common effective permittivity or keep a custom value."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="quarter-wave-z0"
          label="Z0"
          value={form.z0Ohm}
          onChange={(value) => onChange("z0Ohm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="quarter-wave-rl"
          label="RL"
          value={form.rLOhm}
          onChange={(value) => onChange("rLOhm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="quarter-wave-frequency"
          label="frequency"
          value={form.fGHz}
          onChange={(value) => onChange("fGHz", value)}
          unit="GHz"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="quarter-wave-eps-eff"
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

type QuarterWaveTransformerResultPanelProps = {
  calculation: QuarterWaveTransformerCalculation;
  copyText?: string;
};

function QuarterWaveTransformerResultPanel({
  calculation,
  copyText,
}: QuarterWaveTransformerResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "Zt",
          value: formatNumber(calculation.value.ztOhm, 3),
          unit: "Ohm",
        },
        {
          label: "electrical length",
          value: formatNumber(calculation.value.electricalLengthDeg, 3),
          unit: "deg",
        },
        {
          label: "physical length",
          value: formatNumber(calculation.value.physicalLengthM * 1000, 3),
          unit: "mm",
        },
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
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The transformer is a single ideal quarter-wave section at the design
            frequency.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid quarter-wave transformer parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: QuarterWaveTransformerFormState,
  calculation: QuarterWaveTransformerCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "Z0", value: form.z0Ohm, unit: "Ohm" },
      { label: "RL", value: form.rLOhm, unit: "Ohm" },
      { label: "frequency", value: form.fGHz, unit: "GHz" },
      { label: "eps_eff", value: form.epsEff },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "Zt",
            value: formatNumber(calculation.value.ztOhm, 3),
            unit: "Ohm",
          },
          {
            label: "electrical length",
            value: formatNumber(calculation.value.electricalLengthDeg, 3),
            unit: "deg",
          },
          {
            label: "physical length",
            value: formatNumber(calculation.value.physicalLengthM * 1000, 3),
            unit: "mm",
          },
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

function findCommonImpedancePresetId(value: string): string {
  const numericValue = Number(value);
  const preset = commonImpedancePresets.find(
    (item) => item.values.ohms === numericValue,
  );

  return preset?.id ?? CUSTOM_PRESET_ID;
}

function findCommonFrequencyPresetId(value: string): string {
  const numericValue = Number(value);
  const preset = commonFrequencyPresets.find(
    (item) => item.values.frequencyGHz === numericValue,
  );

  return preset?.id ?? CUSTOM_PRESET_ID;
}

function findCommonEpsEffPresetId(value: string): string {
  const numericValue = Number(value);
  const preset = commonEffectivePermittivityPresets.find(
    (item) => item.values.epsEff === numericValue,
  );

  return preset?.id ?? CUSTOM_PRESET_ID;
}
