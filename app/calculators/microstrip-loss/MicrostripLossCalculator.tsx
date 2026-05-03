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
  calculateMicrostripLoss,
  type MicrostripLossCalculation,
  type MicrostripLossMode,
} from "@/lib/calculators/microstripLoss";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type MicrostripLossCalculatorProps = {
  calculator: CalculatorInfo;
};

type MicrostripLossFormState = {
  mode: MicrostripLossMode;
  attenuationDbPerM: string;
  frequencyGHz: string;
  wMm: string;
  hMm: string;
  epsR: string;
  epsEff: string;
  tanDelta: string;
  conductivitySPerM: string;
  copperThicknessUm: string;
  lineLengthM: string;
};

const defaultFormState: MicrostripLossFormState = {
  mode: calculatorDefaults.microstripLoss.mode,
  attenuationDbPerM: defaultNumber(
    calculatorDefaults.microstripLoss.attenuationDbPerM,
  ),
  frequencyGHz: defaultNumber(calculatorDefaults.microstripLoss.frequencyGHz),
  wMm: defaultNumber(calculatorDefaults.microstripLoss.wMm),
  hMm: defaultNumber(calculatorDefaults.microstripLoss.hMm),
  epsR: defaultNumber(calculatorDefaults.microstripLoss.epsR),
  epsEff: defaultNumber(calculatorDefaults.microstripLoss.epsEff),
  tanDelta: defaultNumber(calculatorDefaults.microstripLoss.tanDelta),
  conductivitySPerM: defaultNumber(
    calculatorDefaults.microstripLoss.conductivitySPerM,
  ),
  copperThicknessUm: defaultNumber(
    calculatorDefaults.microstripLoss.copperThicknessUm,
  ),
  lineLengthM: defaultNumber(calculatorDefaults.microstripLoss.lineLengthM),
};

export function MicrostripLossCalculator({
  calculator,
}: MicrostripLossCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:microstrip-loss-form",
    defaultFormState,
  );

  const calculation = useMemo(() => {
    if (form.mode === "simplified") {
      return calculateMicrostripLoss({
        mode: "simplified",
        attenuationDbPerM: parseNumericField(form.attenuationDbPerM),
        lineLengthM: parseNumericField(form.lineLengthM),
      });
    }

    return calculateMicrostripLoss({
      mode: "advanced",
      frequencyGHz: parseNumericField(form.frequencyGHz),
      wMm: parseNumericField(form.wMm),
      hMm: parseNumericField(form.hMm),
      epsR: parseNumericField(form.epsR),
      epsEff: parseNumericField(form.epsEff),
      tanDelta: parseNumericField(form.tanDelta),
      conductivitySPerM: parseNumericField(form.conductivitySPerM),
      copperThicknessUm: parseNumericField(form.copperThicknessUm),
      lineLengthM: parseNumericField(form.lineLengthM),
    });
  }, [form]);
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof MicrostripLossFormState, value: string) {
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
        <MicrostripLossInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <MicrostripLossResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      formulaPanel={
        <FormulaBlock title="Approximate microstrip loss">
          Simplified: loss = attenuation per meter * length. Advanced:
          dielectric alpha uses k0, eps_r, eps_eff and tan_delta; conductor
          alpha uses Rs / (Z0 W_eff). Treat advanced results as design
          estimates.
        </FormulaBlock>
      }
    />
  );
}

type MicrostripLossInputPanelProps = {
  form: MicrostripLossFormState;
  calculation: MicrostripLossCalculation;
  onChange: (field: keyof MicrostripLossFormState, value: string) => void;
  onReset: () => void;
};

function MicrostripLossInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: MicrostripLossInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use simplified mode when attenuation is already known. Advanced mode
            is an approximate design model.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="microstrip-loss-mode"
          className="block text-sm font-medium text-slate-800"
        >
          mode
        </label>
        <select
          id="microstrip-loss-mode"
          value={form.mode}
          onChange={(event) => onChange("mode", event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="simplified">simplified</option>
          <option value="advanced">advanced approximation</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {form.mode === "simplified" ? (
          <NumberInput
            id="microstrip-loss-attenuation"
            label="attenuation"
            value={form.attenuationDbPerM}
            onChange={(value) => onChange("attenuationDbPerM", value)}
            unit="dB/m"
            min={0}
            step={0.01}
          />
        ) : (
          <>
            <NumberInput
              id="microstrip-loss-frequency"
              label="frequency"
              value={form.frequencyGHz}
              onChange={(value) => onChange("frequencyGHz", value)}
              unit="GHz"
              min={0}
              step={0.01}
            />
            <NumberInput
              id="microstrip-loss-w"
              label="W"
              value={form.wMm}
              onChange={(value) => onChange("wMm", value)}
              unit="mm"
              min={0}
              step={0.01}
            />
            <NumberInput
              id="microstrip-loss-h"
              label="h"
              value={form.hMm}
              onChange={(value) => onChange("hMm", value)}
              unit="mm"
              min={0}
              step={0.01}
            />
            <NumberInput
              id="microstrip-loss-eps-r"
              label="eps_r"
              value={form.epsR}
              onChange={(value) => onChange("epsR", value)}
              min={1}
              step={0.01}
            />
            <NumberInput
              id="microstrip-loss-eps-eff"
              label="eps_eff"
              value={form.epsEff}
              onChange={(value) => onChange("epsEff", value)}
              min={1}
              step={0.01}
            />
            <NumberInput
              id="microstrip-loss-tan-delta"
              label="tan_delta"
              value={form.tanDelta}
              onChange={(value) => onChange("tanDelta", value)}
              min={0}
              step={0.0001}
            />
            <NumberInput
              id="microstrip-loss-conductivity"
              label="conductor conductivity"
              value={form.conductivitySPerM}
              onChange={(value) => onChange("conductivitySPerM", value)}
              unit="S/m"
              min={0}
              step={100000}
            />
            <NumberInput
              id="microstrip-loss-thickness"
              label="copper thickness"
              value={form.copperThicknessUm}
              onChange={(value) => onChange("copperThicknessUm", value)}
              unit="um"
              min={0}
              step={1}
            />
          </>
        )}
        <NumberInput
          id="microstrip-loss-length"
          label="line length"
          value={form.lineLengthM}
          onChange={(value) => onChange("lineLengthM", value)}
          unit="m"
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

type MicrostripLossResultPanelProps = {
  calculation: MicrostripLossCalculation;
  copyText?: string;
};

function MicrostripLossResultPanel({
  calculation,
  copyText,
}: MicrostripLossResultPanelProps) {
  const rows = calculation.value
    ? [
        ...(calculation.value.dielectricLossDb === undefined
          ? []
          : [
              {
                label: "dielectric loss",
                value: formatNumber(calculation.value.dielectricLossDb, 4),
                unit: "dB",
              },
            ]),
        ...(calculation.value.conductorLossDb === undefined
          ? []
          : [
              {
                label: "conductor loss",
                value: formatNumber(calculation.value.conductorLossDb, 4),
                unit: "dB",
              },
            ]),
        {
          label: "total loss",
          value: formatNumber(calculation.value.totalLossDb, 4),
          unit: "dB",
        },
        {
          label: "loss per unit length",
          value: formatNumber(calculation.value.lossPerMeterDb, 4),
          unit: "dB/m",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The advanced model is approximate and does not replace EM
            simulation or measured laminate data.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid microstrip loss parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: MicrostripLossFormState,
  calculation: MicrostripLossCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "mode", value: form.mode },
      ...(form.mode === "simplified"
        ? [
            {
              label: "attenuation",
              value: form.attenuationDbPerM,
              unit: "dB/m",
            },
          ]
        : [
            { label: "frequency", value: form.frequencyGHz, unit: "GHz" },
            { label: "W", value: form.wMm, unit: "mm" },
            { label: "h", value: form.hMm, unit: "mm" },
            { label: "eps_r", value: form.epsR },
            { label: "eps_eff", value: form.epsEff },
            { label: "tan_delta", value: form.tanDelta },
            {
              label: "conductor conductivity",
              value: form.conductivitySPerM,
              unit: "S/m",
            },
            {
              label: "copper thickness",
              value: form.copperThicknessUm,
              unit: "um",
            },
          ]),
      { label: "line length", value: form.lineLengthM, unit: "m" },
    ],
    sections: [
      {
        title: "Results",
        items: [
          ...(calculation.value.dielectricLossDb === undefined
            ? []
            : [
                {
                  label: "dielectric loss",
                  value: formatNumber(calculation.value.dielectricLossDb, 4),
                  unit: "dB",
                },
              ]),
          ...(calculation.value.conductorLossDb === undefined
            ? []
            : [
                {
                  label: "conductor loss",
                  value: formatNumber(calculation.value.conductorLossDb, 4),
                  unit: "dB",
                },
              ]),
          {
            label: "total loss",
            value: formatNumber(calculation.value.totalLossDb, 4),
            unit: "dB",
          },
          {
            label: "loss per unit length",
            value: formatNumber(calculation.value.lossPerMeterDb, 4),
            unit: "dB/m",
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
