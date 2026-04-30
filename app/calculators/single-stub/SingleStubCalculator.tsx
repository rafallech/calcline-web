"use client";

import { useMemo, useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { SingleStubDiagram } from "@/components/CalculatorDiagram";
import { CopyResultsButton } from "@/components/CopyResultsButton";
import { FormulaBlock } from "@/components/FormulaBlock";
import { MatchingComparison } from "@/components/MatchingComparison";
import { NumberInput } from "@/components/NumberInput";
import { ResetButton } from "@/components/ResetButton";
import { ResultTable } from "@/components/ResultTable";
import { SmithChart, type SmithChartMarker } from "@/components/SmithChart";
import { UnitSelect } from "@/components/UnitSelect";
import { ValidationMessages } from "@/components/ValidationMessages";
import { usePersistentForm } from "@/components/usePersistentForm";
import { calculatorDefaults, defaultNumber } from "@/lib/calculatorDefaults";
import { compareSingleStubSolutions } from "@/lib/calculators/matchingComparison";
import {
  calculateSingleStub,
  type SingleStubCalculation,
  type SingleStubConfiguration,
} from "@/lib/calculators/singleStub";
import type { CalculatorInfo } from "@/lib/calculators";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";
import {
  gammaFromNormalizedImpedance,
  generateSmithGrid,
  sampleTransmissionLineTrace,
  svgPointFromGamma,
  type SmithChartViewport,
} from "@/lib/visualization/smithChart";

type SingleStubCalculatorProps = {
  calculator: CalculatorInfo;
};

type SingleStubFormState = {
  rL: string;
  xL: string;
  z0Ohm: string;
  configuration: SingleStubConfiguration;
};

type SingleStubSelectedSolution = "solution1" | "solution2";

const defaultFormState: SingleStubFormState = {
  rL: defaultNumber(calculatorDefaults.singleStub.rL),
  xL: defaultNumber(calculatorDefaults.singleStub.xL),
  z0Ohm: defaultNumber(calculatorDefaults.singleStub.z0Ohm),
  configuration: calculatorDefaults.singleStub.configuration,
};

const configurationOptions: {
  value: SingleStubConfiguration;
  label: string;
}[] = [
  { value: "openSeries", label: "Open Stub Series" },
  { value: "shortSeries", label: "Short Stub Series" },
  { value: "openShunt", label: "Open Stub Shunt" },
  { value: "shortShunt", label: "Short Stub Shunt" },
];

const SMITH_VIEWPORT: SmithChartViewport = {
  centerX: 120,
  centerY: 120,
  radius: 100,
};

export function SingleStubCalculator({
  calculator,
}: SingleStubCalculatorProps) {
  const [selectedSolution, setSelectedSolution] =
    useState<SingleStubSelectedSolution>("solution1");
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:single-stub-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateSingleStub({
        rL: parseNumericField(form.rL),
        xL: parseNumericField(form.xL),
        z0Ohm: parseNumericField(form.z0Ohm),
        configuration: form.configuration,
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );
  const smithChartData = useMemo(
    () => buildSingleStubSmithChartData(form, calculation, selectedSolution),
    [form, calculation, selectedSolution],
  );
  const matchingComparison = useMemo(
    () => buildSingleStubComparison(form, calculation),
    [form, calculation],
  );

  function updateField(field: keyof SingleStubFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateConfiguration(configuration: string) {
    setForm((current) => ({
      ...current,
      configuration: configuration as SingleStubConfiguration,
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
        <SingleStubInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onConfigurationChange={updateConfiguration}
          onReset={resetForm}
        />
      }
      resultPanel={
        <SingleStubResultPanel calculation={calculation} copyText={copyText} />
      }
      diagramPanel={
        <div className="space-y-5">
          <MatchingComparison
            comparison={matchingComparison}
            title="Matching comparison"
          />
          <SingleStubDiagram configuration={form.configuration} />
          <SingleStubSmithChartPanel
            grid={smithChartData.grid}
            points={smithChartData.points}
            traces={smithChartData.traces}
            selectedSolution={selectedSolution}
            onSelectedSolutionChange={setSelectedSolution}
          />
        </div>
      }
      formulaPanel={
        <FormulaBlock title="Single-stub matching">
          Uses Par_t1, Par_t2, Val_d, and Par_BX from the AIA migration notes.
        </FormulaBlock>
      }
    />
  );
}

type SingleStubSmithChartPanelProps = ReturnType<
  typeof buildSingleStubSmithChartData
> & {
  selectedSolution: SingleStubSelectedSolution;
  onSelectedSolutionChange: (solution: SingleStubSelectedSolution) => void;
};

function SingleStubSmithChartPanel({
  grid,
  points,
  traces,
  selectedSolution,
  onSelectedSolutionChange,
}: SingleStubSmithChartPanelProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Smith Chart
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Load point, selected stub position, and matched center point.
          </p>
        </div>
        <fieldset className="flex gap-3 text-sm text-slate-700">
          <legend className="sr-only">Displayed solution</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="single-stub-smith-solution"
              checked={selectedSolution === "solution1"}
              onChange={() => onSelectedSolutionChange("solution1")}
              className="h-4 w-4 accent-cyan-700"
            />
            Solution #1
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="single-stub-smith-solution"
              checked={selectedSolution === "solution2"}
              onChange={() => onSelectedSolutionChange("solution2")}
              className="h-4 w-4 accent-cyan-700"
            />
            Solution #2
          </label>
        </fieldset>
      </div>

      <SmithChart
        grid={grid}
        points={points}
        traces={traces}
        title="Single stub Smith Chart"
      />
    </section>
  );
}

type SingleStubInputPanelProps = {
  form: SingleStubFormState;
  calculation: SingleStubCalculation;
  onChange: (field: keyof SingleStubFormState, value: string) => void;
  onConfigurationChange: (configuration: string) => void;
  onReset: () => void;
};

function SingleStubInputPanel({
  form,
  calculation,
  onChange,
  onConfigurationChange,
  onReset,
}: SingleStubInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter load impedance, line impedance, and stub configuration.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="single-stub-rl"
          label="R_L"
          value={form.rL}
          onChange={(value) => onChange("rL", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="single-stub-xl"
          label="X_L"
          value={form.xL}
          onChange={(value) => onChange("xL", value)}
          unit="Ohm"
          step={0.01}
        />
        <NumberInput
          id="single-stub-z0"
          label="Z0"
          value={form.z0Ohm}
          onChange={(value) => onChange("z0Ohm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <div className="sm:col-span-2">
          <UnitSelect
            id="single-stub-configuration"
            label="Configuration"
            value={form.configuration}
            options={configurationOptions}
            onChange={onConfigurationChange}
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

type SingleStubResultPanelProps = {
  calculation: SingleStubCalculation;
  copyText?: string;
};

function SingleStubResultPanel({
  calculation,
  copyText,
}: SingleStubResultPanelProps) {
  if (!calculation.value) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Results</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Two matching solutions will be shown after valid input.
            </p>
          </div>
          <CopyResultsButton text={copyText} />
        </div>
        <ResultTable
          rows={[]}
          emptyMessage="Enter valid single-stub parameters to see results."
        />
      </div>
    );
  }

  const { solution1, solution2 } = calculation.value;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Distances and stub lengths are normalized to wavelength.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Solution #1</h3>
        <ResultTable
          rows={[
            {
              label: "d / lambda",
              value: formatNumber(solution1.dOverLambda, 5),
            },
            {
              label: "l / lambda",
              value: formatNumber(solution1.lOverLambda, 5),
            },
          ]}
        />
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Solution #2</h3>
        <ResultTable
          rows={[
            {
              label: "d / lambda",
              value: formatNumber(solution2.dOverLambda, 5),
            },
            {
              label: "l / lambda",
              value: formatNumber(solution2.lOverLambda, 5),
            },
          ]}
        />
      </section>
    </div>
  );
}

function buildSingleStubSmithChartData(
  form: SingleStubFormState,
  calculation: SingleStubCalculation,
  selectedSolution: SingleStubSelectedSolution,
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

  const z0Ohm = parseNumericField(form.z0Ohm);
  const loadZ = {
    re: parseNumericField(form.rL) / z0Ohm,
    im: parseNumericField(form.xL) / z0Ohm,
  };
  const solution =
    selectedSolution === "solution1"
      ? calculation.value.solution1
      : calculation.value.solution2;
  const loadGamma = gammaFromNormalizedImpedance(loadZ);
  const tracePoints = sampleTransmissionLineTrace(
    loadGamma,
    solution.dOverLambda,
    121,
  ).map((gamma) => svgPointFromGamma(gamma, SMITH_VIEWPORT));
  const shiftedPoint =
    tracePoints[tracePoints.length - 1] ??
    svgPointFromGamma(loadGamma, SMITH_VIEWPORT);

  const points: SmithChartMarker[] = [
    {
      id: "load",
      label: "load",
      point: svgPointFromGamma(loadGamma, SMITH_VIEWPORT),
      color: "#16a34a",
    },
    {
      id: selectedSolution,
      label: selectedSolution === "solution1" ? "Solution #1 d" : "Solution #2 d",
      point: shiftedPoint,
      color: "#f59e0b",
    },
    {
      id: "matched",
      label: "matched",
      point: svgPointFromGamma({ re: 0, im: 0 }, SMITH_VIEWPORT),
      color: "#dc2626",
    },
  ];

  return {
    grid,
    points,
    traces: [
      {
        id: `${selectedSolution}-trace`,
        label:
          selectedSolution === "solution1"
            ? "Solution #1 shift"
            : "Solution #2 shift",
        points: tracePoints,
        color: "#f59e0b",
      },
    ],
  };
}

function buildSingleStubComparison(
  form: SingleStubFormState,
  calculation: SingleStubCalculation,
) {
  if (!calculation.value) {
    return undefined;
  }

  return compareSingleStubSolutions({
    configuration: form.configuration,
    z0Ohm: parseNumericField(form.z0Ohm),
    result: calculation.value,
    warnings: calculation.warnings,
  });
}

function buildCopyText(
  title: string,
  form: SingleStubFormState,
  calculation: SingleStubCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  const { solution1, solution2 } = calculation.value;

  return formatResultsText({
    title,
    inputs: [
      { label: "R_L", value: form.rL, unit: "Ohm" },
      { label: "X_L", value: form.xL, unit: "Ohm" },
      { label: "Z0", value: form.z0Ohm, unit: "Ohm" },
      { label: "Configuration", value: configurationLabel(form.configuration) },
    ],
    sections: [
      {
        title: "Solution #1",
        items: [
          {
            label: "d / lambda",
            value: formatNumber(solution1.dOverLambda, 5),
          },
          {
            label: "l / lambda",
            value: formatNumber(solution1.lOverLambda, 5),
          },
        ],
      },
      {
        title: "Solution #2",
        items: [
          {
            label: "d / lambda",
            value: formatNumber(solution2.dOverLambda, 5),
          },
          {
            label: "l / lambda",
            value: formatNumber(solution2.lOverLambda, 5),
          },
        ],
      },
    ],
    warnings: calculation.warnings,
  });
}

function configurationLabel(configuration: SingleStubConfiguration): string {
  return (
    configurationOptions.find((option) => option.value === configuration)
      ?.label ?? configuration
  );
}

function parseNumericField(value: string): number {
  if (value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}
