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
  calculateImpedanceTransform,
  type ImpedanceTransformCalculation,
  type ImpedanceTransformDirection,
} from "@/lib/calculators/impedanceTransform";
import type { CalculatorInfo } from "@/lib/calculators";
import { formatComplex, formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";
import {
  gammaFromNormalizedImpedance,
  generateSmithGrid,
  sampleTransmissionLineTrace,
  svgPointFromGamma,
  type SmithChartViewport,
} from "@/lib/visualization/smithChart";

type ImpedanceTransformCalculatorProps = {
  calculator: CalculatorInfo;
};

type ImpedanceTransformFormState = {
  lambdaMm: string;
  rL: string;
  xL: string;
  dMm: string;
  direction: ImpedanceTransformDirection;
};

const defaultFormState: ImpedanceTransformFormState = {
  lambdaMm: defaultNumber(calculatorDefaults.impedanceTransform.lambdaMm),
  rL: defaultNumber(calculatorDefaults.impedanceTransform.rL),
  xL: defaultNumber(calculatorDefaults.impedanceTransform.xL),
  dMm: defaultNumber(calculatorDefaults.impedanceTransform.dMm),
  direction: calculatorDefaults.impedanceTransform.direction,
};

const SMITH_VIEWPORT: SmithChartViewport = {
  centerX: 120,
  centerY: 120,
  radius: 100,
};

export function ImpedanceTransformCalculator({
  calculator,
}: ImpedanceTransformCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:impedance-transform-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateImpedanceTransform({
        lambdaMm: parseNumericField(form.lambdaMm),
        rL: parseNumericField(form.rL),
        xL: parseNumericField(form.xL),
        dMm: parseNumericField(form.dMm),
        direction: form.direction,
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );
  const smithChartData = useMemo(
    () => buildImpedanceTransformSmithChartData(form, calculation),
    [form, calculation],
  );

  function updateField(field: keyof ImpedanceTransformFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateDirection(direction: ImpedanceTransformDirection) {
    setForm((current) => ({
      ...current,
      direction,
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
        <ImpedanceTransformInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onDirectionChange={updateDirection}
          onReset={resetForm}
        />
      }
      resultPanel={
        <ImpedanceTransformResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      diagramPanel={
        <ImpedanceTransformSmithChartPanel
          grid={smithChartData.grid}
          points={smithChartData.points}
          traces={smithChartData.traces}
        />
      }
      formulaPanel={
        <FormulaBlock title="Impedance transformation">
          z prime = (zL + j tan(beta d)) / (1 + j zL tan(beta d)); towards load
          uses negative d.
        </FormulaBlock>
      }
    />
  );
}

type ImpedanceTransformSmithChartPanelProps = ReturnType<
  typeof buildImpedanceTransformSmithChartData
>;

function ImpedanceTransformSmithChartPanel({
  grid,
  points,
  traces,
}: ImpedanceTransformSmithChartPanelProps) {
  return (
    <SmithChart
      grid={grid}
      points={points}
      traces={traces}
      title="Impedance transformation Smith Chart"
    />
  );
}

type ImpedanceTransformInputPanelProps = {
  form: ImpedanceTransformFormState;
  calculation: ImpedanceTransformCalculation;
  onChange: (field: keyof ImpedanceTransformFormState, value: string) => void;
  onDirectionChange: (direction: ImpedanceTransformDirection) => void;
  onReset: () => void;
};

function ImpedanceTransformInputPanel({
  form,
  calculation,
  onChange,
  onDirectionChange,
  onReset,
}: ImpedanceTransformInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter normalized load impedance and transformation distance along
            the transmission line.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="impedance-transform-lambda"
          label="lambda"
          value={form.lambdaMm}
          onChange={(value) => onChange("lambdaMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="impedance-transform-d"
          label="d"
          value={form.dMm}
          onChange={(value) => onChange("dMm", value)}
          unit="mm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="impedance-transform-r"
          label="R_L / Z0"
          value={form.rL}
          onChange={(value) => onChange("rL", value)}
          min={0}
          step={0.01}
        />
        <NumberInput
          id="impedance-transform-x"
          label="X_L / Z0"
          value={form.xL}
          onChange={(value) => onChange("xL", value)}
          step={0.01}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">
          Direction
        </legend>
        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <input
            type="radio"
            name="transform-direction"
            value="generator"
            checked={form.direction === "generator"}
            onChange={() => onDirectionChange("generator")}
            className="h-4 w-4 accent-cyan-700"
          />
          Towards generator
        </label>
        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <input
            type="radio"
            name="transform-direction"
            value="load"
            checked={form.direction === "load"}
            onChange={() => onDirectionChange("load")}
            className="h-4 w-4 accent-cyan-700"
          />
          Towards load
        </label>
      </fieldset>

      <ValidationMessages
        errors={calculation.errors}
        warnings={calculation.warnings}
      />
    </div>
  );
}

type ImpedanceTransformResultPanelProps = {
  calculation: ImpedanceTransformCalculation;
  copyText?: string;
};

function ImpedanceTransformResultPanel({
  calculation,
  copyText,
}: ImpedanceTransformResultPanelProps) {
  if (!calculation.value) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Results</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Transformed normalized impedance will be shown after valid input.
            </p>
          </div>
          <CopyResultsButton text={copyText} />
        </div>
        <ResultTable
          rows={[]}
          emptyMessage="Enter valid transformation parameters to see results."
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
            z prime / Z0 is normalized and displayed as R + jX.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ComplexResult
        label="z' / Z0"
        value={calculation.value.zTransformed}
      />
      <ResultTable
        rows={[
          {
            label: "R' / Z0",
            value: formatNumber(calculation.value.r, 3),
          },
          {
            label: "X' / Z0",
            value: formatNumber(calculation.value.x, 3),
          },
        ]}
      />
    </div>
  );
}

function buildImpedanceTransformSmithChartData(
  form: ImpedanceTransformFormState,
  calculation: ImpedanceTransformCalculation,
) {
  const grid = generateSmithGrid({
    viewport: SMITH_VIEWPORT,
    samples: 121,
  });

  if (!calculation.value) {
    return {
      grid,
      points: [],
      traces: [],
    };
  }

  const startZ = {
    re: parseNumericField(form.rL),
    im: parseNumericField(form.xL),
  };
  const startGamma = gammaFromNormalizedImpedance(startZ);
  const endGamma = gammaFromNormalizedImpedance(
    calculation.value.zTransformed,
  );
  const signedDistanceOverLambda =
    form.direction === "load"
      ? -parseNumericField(form.dMm) / parseNumericField(form.lambdaMm)
      : parseNumericField(form.dMm) / parseNumericField(form.lambdaMm);
  const tracePoints = sampleTransmissionLineTrace(
    startGamma,
    signedDistanceOverLambda,
    121,
  ).map((gamma) => svgPointFromGamma(gamma, SMITH_VIEWPORT));

  if (tracePoints.length > 0) {
    tracePoints[tracePoints.length - 1] = svgPointFromGamma(
      endGamma,
      SMITH_VIEWPORT,
    );
  }

  const points: SmithChartMarker[] = [
    {
      id: "start",
      label: "start",
      point: svgPointFromGamma(startGamma, SMITH_VIEWPORT),
      color: "#16a34a",
    },
    {
      id: "end",
      label: "end",
      point: svgPointFromGamma(endGamma, SMITH_VIEWPORT),
      color: "#dc2626",
    },
  ];

  return {
    grid,
    points,
    traces: [
      {
        id: "transformation",
        label: "transformation",
        points: tracePoints,
        color: "#f59e0b",
      },
    ],
  };
}

function buildCopyText(
  title: string,
  form: ImpedanceTransformFormState,
  calculation: ImpedanceTransformCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "lambda", value: form.lambdaMm, unit: "mm" },
      { label: "R_L / Z0", value: form.rL },
      { label: "X_L / Z0", value: form.xL },
      { label: "d", value: form.dMm, unit: "mm" },
      {
        label: "Direction",
        value: form.direction === "generator" ? "Towards generator" : "Towards load",
      },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "z' / Z0",
            value: formatComplex(calculation.value.zTransformed, 3),
          },
          { label: "R' / Z0", value: formatNumber(calculation.value.r, 3) },
          { label: "X' / Z0", value: formatNumber(calculation.value.x, 3) },
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
