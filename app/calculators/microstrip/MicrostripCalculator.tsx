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
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type MicrostripCalculatorProps = {
  calculator: CalculatorInfo;
};

type MicrostripMode = "analysis" | "synthesis";

type MicrostripFormState = {
  mode: MicrostripMode;
  hMm: string;
  wMm: string;
  z0Ohm: string;
  epsR: string;
  fGHz: string;
};

const defaultFormState: MicrostripFormState = {
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
      [field]: value,
    }));
  }

  function updateMode(mode: MicrostripMode) {
    setForm((current) => ({
      ...current,
      mode,
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
        <MicrostripInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onModeChange={updateMode}
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
  onReset: () => void;
};

function MicrostripInputPanel({
  form,
  calculation,
  onChange,
  onModeChange,
  onReset,
}: MicrostripInputPanelProps) {
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
        <ResetButton onClick={onReset} />
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
