"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { ComplexResult } from "@/components/ComplexResult";
import { CopyResultsButton } from "@/components/CopyResultsButton";
import { FormulaBlock } from "@/components/FormulaBlock";
import { NumberInput } from "@/components/NumberInput";
import { ResetButton } from "@/components/ResetButton";
import { ResultTable } from "@/components/ResultTable";
import { SmithChart, type SmithChartMarker } from "@/components/SmithChart";
import { ValidationMessages } from "@/components/ValidationMessages";
import { usePersistentForm } from "@/components/usePersistentForm";
import { calculatorDefaults, defaultNumber } from "@/lib/calculatorDefaults";
import {
  calculateLoadImpedance,
  type LoadImpedanceCalculation,
  type LoadImpedanceMinimumType,
} from "@/lib/calculators/loadImpedance";
import type { CalculatorInfo } from "@/lib/calculators";
import { abs as complexAbs, argDeg } from "@/lib/math/complex";
import { formatComplex, formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";
import {
  gammaFromNormalizedImpedance,
  generateSmithGrid,
  svgPointFromGamma,
  type SmithChartViewport,
} from "@/lib/visualization/smithChart";

type LoadImpedanceCalculatorProps = {
  calculator: CalculatorInfo;
};

type LoadImpedanceFormState = {
  lambdaMm: string;
  swr: string;
  dMm: string;
  minimumType: LoadImpedanceMinimumType;
};

const defaultFormState: LoadImpedanceFormState = {
  lambdaMm: defaultNumber(calculatorDefaults.loadImpedance.lambdaMm),
  swr: defaultNumber(calculatorDefaults.loadImpedance.swr),
  dMm: defaultNumber(calculatorDefaults.loadImpedance.dMm),
  minimumType: calculatorDefaults.loadImpedance.minimumType,
};

const SMITH_VIEWPORT: SmithChartViewport = {
  centerX: 120,
  centerY: 120,
  radius: 100,
};

export function LoadImpedanceCalculator({
  calculator,
}: LoadImpedanceCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:load-impedance-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateLoadImpedance({
        lambdaMm: parseNumericField(form.lambdaMm),
        swr: parseNumericField(form.swr),
        dMm: parseNumericField(form.dMm),
        minimumType: form.minimumType,
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );
  const smithChartData = useMemo(
    () => buildLoadImpedanceSmithChartData(calculation),
    [calculation],
  );

  function updateField(field: keyof LoadImpedanceFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateMinimumType(minimumType: LoadImpedanceMinimumType) {
    setForm((current) => ({
      ...current,
      minimumType,
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
        <LoadImpedanceInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onMinimumTypeChange={updateMinimumType}
          onReset={resetForm}
        />
      }
      resultPanel={
        <LoadImpedanceResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      diagramPanel={
        <LoadImpedanceSmithChartPanel
          grid={smithChartData.grid}
          points={smithChartData.points}
          description={smithChartData.description}
        />
      }
      formulaPanel={
        <FormulaBlock title="Load impedance">
          beta_d = 2 pi d / lambda; zL depends on selected voltage or current
          wave minimum.
        </FormulaBlock>
      }
    />
  );
}

type LoadImpedanceSmithChartPanelProps = ReturnType<
  typeof buildLoadImpedanceSmithChartData
>;

function LoadImpedanceSmithChartPanel({
  grid,
  points,
  description,
}: LoadImpedanceSmithChartPanelProps) {
  return (
    <section className="space-y-3">
      <SmithChart grid={grid} points={points} title="Load impedance Smith Chart" />
      <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
        {description}
      </p>
    </section>
  );
}

type LoadImpedanceInputPanelProps = {
  form: LoadImpedanceFormState;
  calculation: LoadImpedanceCalculation;
  onChange: (field: keyof LoadImpedanceFormState, value: string) => void;
  onMinimumTypeChange: (minimumType: LoadImpedanceMinimumType) => void;
  onReset: () => void;
};

function LoadImpedanceInputPanel({
  form,
  calculation,
  onChange,
  onMinimumTypeChange,
  onReset,
}: LoadImpedanceInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter wavelength in the line, SWR, and distance from load to the
            first selected wave minimum.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="load-impedance-lambda"
          label="lambda"
          value={form.lambdaMm}
          onChange={(value) => onChange("lambdaMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="load-impedance-swr"
          label="SWR"
          value={form.swr}
          onChange={(value) => onChange("swr", value)}
          min={1}
          step={0.01}
        />
        <NumberInput
          id="load-impedance-d"
          label="d"
          value={form.dMm}
          onChange={(value) => onChange("dMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">
          Minimum type
        </legend>
        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <input
            type="radio"
            name="minimum-type"
            value="voltage"
            checked={form.minimumType === "voltage"}
            onChange={() => onMinimumTypeChange("voltage")}
            className="h-4 w-4 accent-cyan-700"
          />
          Voltage wave minimum
        </label>
        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <input
            type="radio"
            name="minimum-type"
            value="current"
            checked={form.minimumType === "current"}
            onChange={() => onMinimumTypeChange("current")}
            className="h-4 w-4 accent-cyan-700"
          />
          Current wave minimum
        </label>
      </fieldset>

      <ValidationMessages
        errors={calculation.errors}
        warnings={calculation.warnings}
      />
    </div>
  );
}

type LoadImpedanceResultPanelProps = {
  calculation: LoadImpedanceCalculation;
  copyText?: string;
};

function LoadImpedanceResultPanel({
  calculation,
  copyText,
}: LoadImpedanceResultPanelProps) {
  if (!calculation.value) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Results</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Normalized load impedance will be shown after valid input.
            </p>
          </div>
          <CopyResultsButton text={copyText} />
        </div>
        <ResultTable
          rows={[]}
          emptyMessage="Enter valid load impedance parameters to see results."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            zL/Z0 is normalized and displayed as R + jX.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ComplexResult label="zL / Z0" value={calculation.value.zL} />
      <ResultTable
        rows={[
          {
            label: "R / Z0",
            value: formatNumber(calculation.value.r, 3),
          },
          {
            label: "X / Z0",
            value: formatNumber(calculation.value.x, 3),
          },
        ]}
      />
    </div>
  );
}

function buildLoadImpedanceSmithChartData(
  calculation: LoadImpedanceCalculation,
) {
  const grid = generateSmithGrid({
    viewport: SMITH_VIEWPORT,
    samples: 121,
  });

  if (!calculation.value) {
    return {
      grid,
      points: [],
      description:
        "Enter valid load impedance parameters to show r, x, |Gamma|, and angle(Gamma).",
    };
  }

  const { zL, r, x } = calculation.value;
  const gamma = gammaFromNormalizedImpedance(zL);
  const point = svgPointFromGamma(gamma, SMITH_VIEWPORT);
  const points: SmithChartMarker[] = [
    {
      id: "zl",
      label: "zL",
      point,
      color: "#16a34a",
    },
    {
      id: "gamma",
      label: "Gamma",
      point,
      color: "#0891b2",
    },
  ];

  return {
    grid,
    points,
    description: `r = ${formatNumber(r, 4)}, x = ${formatNumber(x, 4)}, |Gamma| = ${formatNumber(
      complexAbs(gamma),
      4,
    )}, angle(Gamma) = ${formatNumber(argDeg(gamma), 3)} deg.`,
  };
}

function buildCopyText(
  title: string,
  form: LoadImpedanceFormState,
  calculation: LoadImpedanceCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "lambda", value: form.lambdaMm, unit: "mm" },
      { label: "SWR", value: form.swr },
      { label: "d", value: form.dMm, unit: "mm" },
      {
        label: "Minimum type",
        value:
          form.minimumType === "voltage"
            ? "Voltage wave minimum"
            : "Current wave minimum",
      },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "zL / Z0",
            value: formatComplex(calculation.value.zL, 3),
          },
          { label: "R / Z0", value: formatNumber(calculation.value.r, 3) },
          { label: "X / Z0", value: formatNumber(calculation.value.x, 3) },
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
