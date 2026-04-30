"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { LMatchDiagram } from "@/components/CalculatorDiagram";
import { CopyResultsButton } from "@/components/CopyResultsButton";
import { FormulaBlock } from "@/components/FormulaBlock";
import { MatchingComparison } from "@/components/MatchingComparison";
import { NumberInput } from "@/components/NumberInput";
import { ResetButton } from "@/components/ResetButton";
import { ResultTable } from "@/components/ResultTable";
import { ValidationMessages } from "@/components/ValidationMessages";
import { usePersistentForm } from "@/components/usePersistentForm";
import { calculatorDefaults, defaultNumber } from "@/lib/calculatorDefaults";
import { compareLMatchSolutions } from "@/lib/calculators/matchingComparison";
import {
  calculateLMatch,
  type LMatchCalculation,
  type LMatchElement,
  type LMatchSolution,
} from "@/lib/calculators/lMatch";
import type { CalculatorInfo } from "@/lib/calculators";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type LMatchCalculatorProps = {
  calculator: CalculatorInfo;
};

type LMatchFormState = {
  rL: string;
  xL: string;
  z0Ohm: string;
  fMHz: string;
};

const defaultFormState: LMatchFormState = {
  rL: defaultNumber(calculatorDefaults.lMatch.rL),
  xL: defaultNumber(calculatorDefaults.lMatch.xL),
  z0Ohm: defaultNumber(calculatorDefaults.lMatch.z0Ohm),
  fMHz: defaultNumber(calculatorDefaults.lMatch.fMHz),
};

export function LMatchCalculator({ calculator }: LMatchCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:l-match-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateLMatch({
        rL: parseNumericField(form.rL),
        xL: parseNumericField(form.xL),
        z0Ohm: parseNumericField(form.z0Ohm),
        fMHz: parseNumericField(form.fMHz),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );
  const matchingComparison = useMemo(
    () => buildLMatchComparison(form, calculation),
    [form, calculation],
  );

  function updateField(field: keyof LMatchFormState, value: string) {
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
        <LMatchInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <LMatchResultPanel calculation={calculation} copyText={copyText} />
      }
      diagramPanel={
        <div className="space-y-5">
          <MatchingComparison
            comparison={matchingComparison}
            title="Matching comparison"
          />
          <LMatchDiagram />
        </div>
      }
      formulaPanel={
        <FormulaBlock title="L-section matching">
          Uses the AIA branches for R_L greater than or equal to Z0 and R_L
          less than Z0, then converts X to Ls or Cs and B to Lp or Cp.
        </FormulaBlock>
      }
    />
  );
}

type LMatchInputPanelProps = {
  form: LMatchFormState;
  calculation: LMatchCalculation;
  onChange: (field: keyof LMatchFormState, value: string) => void;
  onReset: () => void;
};

function LMatchInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: LMatchInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter load impedance, target line impedance, and operating
            frequency.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="l-match-rl"
          label="R_L"
          value={form.rL}
          onChange={(value) => onChange("rL", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="l-match-xl"
          label="X_L"
          value={form.xL}
          onChange={(value) => onChange("xL", value)}
          unit="Ohm"
          step={0.01}
        />
        <NumberInput
          id="l-match-z0"
          label="Z0"
          value={form.z0Ohm}
          onChange={(value) => onChange("z0Ohm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="l-match-frequency"
          label="f"
          value={form.fMHz}
          onChange={(value) => onChange("fMHz", value)}
          unit="MHz"
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

type LMatchResultPanelProps = {
  calculation: LMatchCalculation;
  copyText?: string;
};

function LMatchResultPanel({
  calculation,
  copyText,
}: LMatchResultPanelProps) {
  if (!calculation.value) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Results</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              L-section matching solutions will be shown after valid input.
            </p>
          </div>
          <CopyResultsButton text={copyText} />
        </div>
        <ResultTable
          rows={[]}
          emptyMessage="Enter valid L-section parameters to see results."
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
            Ideal element values are calculated from X and B.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>

      <SolutionCard title="Solution #1" solution={calculation.value.solution1} />
      <SolutionCard title="Solution #2" solution={calculation.value.solution2} />
    </div>
  );
}

type SolutionCardProps = {
  title: string;
  solution: LMatchSolution;
};

function SolutionCard({ title, solution }: SolutionCardProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <div className="mt-3">
        <ResultTable
          rows={[
            {
              label: "X",
              value: formatNumber(solution.xOhm, 4),
              unit: "Ohm",
            },
            {
              label: "B",
              value: formatNumber(solution.bMs, 4),
              unit: "mS",
            },
            {
              label: "Series element",
              value: formatElement(solution.seriesElement),
            },
            {
              label: "Parallel element",
              value: formatElement(solution.parallelElement),
            },
          ]}
        />
      </div>
    </section>
  );
}

function formatElement(element: LMatchElement): string {
  return `${element.type} ${formatNumber(element.value, 4)} ${element.unit}`;
}

function buildCopyText(
  title: string,
  form: LMatchFormState,
  calculation: LMatchCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "R_L", value: form.rL, unit: "Ohm" },
      { label: "X_L", value: form.xL, unit: "Ohm" },
      { label: "Z0", value: form.z0Ohm, unit: "Ohm" },
      { label: "f", value: form.fMHz, unit: "MHz" },
    ],
    sections: [
      {
        title: "Solution #1",
        items: solutionItems(calculation.value.solution1),
      },
      {
        title: "Solution #2",
        items: solutionItems(calculation.value.solution2),
      },
    ],
    warnings: calculation.warnings,
  });
}

function buildLMatchComparison(
  form: LMatchFormState,
  calculation: LMatchCalculation,
) {
  if (!calculation.value) {
    return undefined;
  }

  return compareLMatchSolutions({
    z0Ohm: parseNumericField(form.z0Ohm),
    result: calculation.value,
  });
}

function solutionItems(solution: LMatchSolution) {
  return [
    { label: "X", value: formatNumber(solution.xOhm, 4), unit: "Ohm" },
    { label: "B", value: formatNumber(solution.bMs, 4), unit: "mS" },
    {
      label: "Series element",
      value: formatElement(solution.seriesElement),
    },
    {
      label: "Parallel element",
      value: formatElement(solution.parallelElement),
    },
  ];
}

function parseNumericField(value: string): number {
  if (value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}
