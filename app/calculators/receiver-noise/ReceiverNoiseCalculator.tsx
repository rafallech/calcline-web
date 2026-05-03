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
  calculateReceiverNoise,
  type ReceiverNoiseBandwidthUnit,
  type ReceiverNoiseCalculation,
} from "@/lib/calculators/receiverNoise";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type ReceiverNoiseCalculatorProps = {
  calculator: CalculatorInfo;
};

type ReceiverNoiseFormState = {
  bandwidth: string;
  bandwidthUnit: ReceiverNoiseBandwidthUnit;
  noiseFigureDb: string;
  temperatureK: string;
  requiredSnrDb: string;
  gainDb: string;
};

const defaultFormState: ReceiverNoiseFormState = {
  bandwidth: defaultNumber(calculatorDefaults.receiverNoise.bandwidth),
  bandwidthUnit: calculatorDefaults.receiverNoise.bandwidthUnit,
  noiseFigureDb: defaultNumber(calculatorDefaults.receiverNoise.noiseFigureDb),
  temperatureK: defaultNumber(calculatorDefaults.receiverNoise.temperatureK),
  requiredSnrDb: defaultNumber(calculatorDefaults.receiverNoise.requiredSnrDb),
  gainDb: defaultNumber(calculatorDefaults.receiverNoise.gainDb),
};

const bandwidthUnitOptions: {
  value: ReceiverNoiseBandwidthUnit;
  label: string;
}[] = [
  { value: "Hz", label: "Hz" },
  { value: "kHz", label: "kHz" },
  { value: "MHz", label: "MHz" },
];

export function ReceiverNoiseCalculator({
  calculator,
}: ReceiverNoiseCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:receiver-noise-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateReceiverNoise({
        bandwidth: parseNumericField(form.bandwidth),
        bandwidthUnit: form.bandwidthUnit,
        noiseFigureDb: parseNumericField(form.noiseFigureDb),
        temperatureK: parseNumericField(form.temperatureK),
        requiredSnrDb: parseNumericField(form.requiredSnrDb),
        gainDb: parseOptionalNumericField(form.gainDb),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof ReceiverNoiseFormState, value: string) {
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
        <ReceiverNoiseInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <ReceiverNoiseResultPanel calculation={calculation} copyText={copyText} />
      }
      formulaPanel={
        <FormulaBlock title="Receiver noise floor">
          N0 = 10 log10(kT / 1 mW); N = N0 + 10 log10(B); N_NF = N + NF;
          MDS = N_NF + SNR; sensitivity = MDS - gain.
        </FormulaBlock>
      }
    />
  );
}

type ReceiverNoiseInputPanelProps = {
  form: ReceiverNoiseFormState;
  calculation: ReceiverNoiseCalculation;
  onChange: (field: keyof ReceiverNoiseFormState, value: string) => void;
  onReset: () => void;
};

function ReceiverNoiseInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: ReceiverNoiseInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter receiver bandwidth, noise figure, temperature, required SNR,
            and optional gain.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            id="receiver-noise-bandwidth"
            label="bandwidth"
            value={form.bandwidth}
            onChange={(value) => onChange("bandwidth", value)}
            min={0}
            step={0.01}
          />
          <UnitSelect
            id="receiver-noise-bandwidth-unit"
            label="unit"
            value={form.bandwidthUnit}
            options={bandwidthUnitOptions}
            onChange={(value) => onChange("bandwidthUnit", value)}
          />
        </div>
        <NumberInput
          id="receiver-noise-nf"
          label="noise figure"
          value={form.noiseFigureDb}
          onChange={(value) => onChange("noiseFigureDb", value)}
          unit="dB"
          step={0.1}
        />
        <NumberInput
          id="receiver-noise-temperature"
          label="temperature"
          value={form.temperatureK}
          onChange={(value) => onChange("temperatureK", value)}
          unit="K"
          min={0}
          step={1}
        />
        <NumberInput
          id="receiver-noise-snr"
          label="required SNR"
          value={form.requiredSnrDb}
          onChange={(value) => onChange("requiredSnrDb", value)}
          unit="dB"
          step={0.1}
        />
        <NumberInput
          id="receiver-noise-gain"
          label="gain"
          value={form.gainDb}
          onChange={(value) => onChange("gainDb", value)}
          unit="dB"
          step={0.1}
        />
      </div>

      <ValidationMessages
        errors={calculation.errors}
        warnings={calculation.warnings}
      />
    </div>
  );
}

type ReceiverNoiseResultPanelProps = {
  calculation: ReceiverNoiseCalculation;
  copyText?: string;
};

function ReceiverNoiseResultPanel({
  calculation,
  copyText,
}: ReceiverNoiseResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "thermal noise density",
          value: formatNumber(calculation.value.thermalNoiseDensityDbmPerHz, 3),
          unit: "dBm/Hz",
        },
        {
          label: "thermal noise floor",
          value: formatNumber(calculation.value.thermalNoiseFloorDbm, 3),
          unit: "dBm",
        },
        {
          label: "noise floor with NF",
          value: formatNumber(calculation.value.noiseFloorWithNfDbm, 3),
          unit: "dBm",
        },
        {
          label: "minimum detectable signal",
          value: formatNumber(
            calculation.value.minimumDetectableSignalDbm,
            3,
          ),
          unit: "dBm",
        },
        {
          label: "sensitivity estimate",
          value: formatNumber(calculation.value.sensitivityEstimateDbm, 3),
          unit: "dBm",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Noise floor values are input-referred; optional gain is applied only
            to the sensitivity estimate.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid receiver noise parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: ReceiverNoiseFormState,
  calculation: ReceiverNoiseCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "bandwidth", value: form.bandwidth, unit: form.bandwidthUnit },
      { label: "noise figure", value: form.noiseFigureDb, unit: "dB" },
      { label: "temperature", value: form.temperatureK, unit: "K" },
      { label: "required SNR", value: form.requiredSnrDb, unit: "dB" },
      { label: "gain", value: form.gainDb || "0", unit: "dB" },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "thermal noise density",
            value: formatNumber(
              calculation.value.thermalNoiseDensityDbmPerHz,
              3,
            ),
            unit: "dBm/Hz",
          },
          {
            label: "thermal noise floor",
            value: formatNumber(calculation.value.thermalNoiseFloorDbm, 3),
            unit: "dBm",
          },
          {
            label: "noise floor with NF",
            value: formatNumber(calculation.value.noiseFloorWithNfDbm, 3),
            unit: "dBm",
          },
          {
            label: "minimum detectable signal",
            value: formatNumber(
              calculation.value.minimumDetectableSignalDbm,
              3,
            ),
            unit: "dBm",
          },
          {
            label: "sensitivity estimate",
            value: formatNumber(calculation.value.sensitivityEstimateDbm, 3),
            unit: "dBm",
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
