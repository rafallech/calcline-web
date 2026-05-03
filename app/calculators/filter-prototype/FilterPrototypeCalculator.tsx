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
  calculateFilterPrototype,
  type FilterPrototypeCalculation,
  type FilterPrototypeElement,
} from "@/lib/calculators/filterPrototype";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type FilterPrototypeCalculatorProps = {
  calculator: CalculatorInfo;
};

type FilterPrototypeFormState = {
  order: string;
  cutoffFrequencyMHz: string;
  z0Ohm: string;
};

const defaultFormState: FilterPrototypeFormState = {
  order: defaultNumber(calculatorDefaults.filterPrototype.order),
  cutoffFrequencyMHz: defaultNumber(
    calculatorDefaults.filterPrototype.cutoffFrequencyMHz,
  ),
  z0Ohm: defaultNumber(calculatorDefaults.filterPrototype.z0Ohm),
};

export function FilterPrototypeCalculator({
  calculator,
}: FilterPrototypeCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:filter-prototype-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateFilterPrototype({
        order: parseNumericField(form.order),
        cutoffFrequencyMHz: parseNumericField(form.cutoffFrequencyMHz),
        z0Ohm: parseNumericField(form.z0Ohm),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof FilterPrototypeFormState, value: string) {
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
        <FilterPrototypeInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <FilterPrototypeResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      formulaPanel={
        <FormulaBlock title="Butterworth low-pass prototype">
          gk = 2 sin((2k - 1) pi / 2n); wc = 2 pi fc; series L = Z0 g / wc;
          shunt C = g / (Z0 wc). Chebyshev and band-pass transforms are planned
          as later stages.
        </FormulaBlock>
      }
    />
  );
}

type FilterPrototypeInputPanelProps = {
  form: FilterPrototypeFormState;
  calculation: FilterPrototypeCalculation;
  onChange: (field: keyof FilterPrototypeFormState, value: string) => void;
  onReset: () => void;
};

function FilterPrototypeInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: FilterPrototypeInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Generate an ideal Butterworth low-pass ladder starting with a
            series inductor.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="filter-prototype-order"
          label="order n"
          value={form.order}
          onChange={(value) => onChange("order", value)}
          min={1}
          max={10}
          step={1}
        />
        <NumberInput
          id="filter-prototype-cutoff"
          label="cutoff frequency"
          value={form.cutoffFrequencyMHz}
          onChange={(value) => onChange("cutoffFrequencyMHz", value)}
          unit="MHz"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="filter-prototype-z0"
          label="source/load impedance Z0"
          value={form.z0Ohm}
          onChange={(value) => onChange("z0Ohm", value)}
          unit="Ohm"
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

type FilterPrototypeResultPanelProps = {
  calculation: FilterPrototypeCalculation;
  copyText?: string;
};

function FilterPrototypeResultPanel({
  calculation,
  copyText,
}: FilterPrototypeResultPanelProps) {
  const result = calculation.value;
  const gRows =
    result?.gValues.map((value, index) => ({
      label:
        index === 0
          ? "g0"
          : index === result.gValues.length - 1
            ? `g${index} load`
            : `g${index}`,
      value: formatNumber(value, 6),
    })) ?? [];
  const elementRows =
    result?.elements.map((element) => ({
      label: element.label,
      value: formatElementValue(element),
      unit: element.kind === "series-inductor" ? "nH" : "pF",
      note:
        element.kind === "series-inductor"
          ? "series inductor"
          : "shunt capacitor",
    })) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Chebyshev responses and band-pass transforms are planned as later
            stages.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={gRows}
        emptyMessage="Enter valid filter prototype parameters to see results."
      />
      {elementRows.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Element sequence
          </h3>
          <ResultTable rows={elementRows} />
        </div>
      ) : null}
    </div>
  );
}

function buildCopyText(
  title: string,
  form: FilterPrototypeFormState,
  calculation: FilterPrototypeCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }
  const result = calculation.value;

  return formatResultsText({
    title,
    inputs: [
      { label: "order n", value: form.order },
      {
        label: "cutoff frequency",
        value: form.cutoffFrequencyMHz,
        unit: "MHz",
      },
      { label: "source/load impedance Z0", value: form.z0Ohm, unit: "Ohm" },
    ],
    sections: [
      {
        title: "Normalized g-values",
        items: result.gValues.map((value, index) => ({
          label:
            index === 0
              ? "g0"
              : index === result.gValues.length - 1
                ? `g${index} load`
                : `g${index}`,
          value: formatNumber(value, 6),
        })),
      },
      {
        title: "Element sequence",
        items: result.elements.map((element) => ({
          label: `${element.label} ${
            element.kind === "series-inductor" ? "series L" : "shunt C"
          }`,
          value: formatElementValue(element),
          unit: element.kind === "series-inductor" ? "nH" : "pF",
        })),
      },
    ],
  });
}

function formatElementValue(element: FilterPrototypeElement): string {
  if (element.unit === "H") {
    return formatNumber(element.value * 1e9, 4);
  }

  return formatNumber(element.value * 1e12, 4);
}

function parseNumericField(value: string): number {
  if (value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}
