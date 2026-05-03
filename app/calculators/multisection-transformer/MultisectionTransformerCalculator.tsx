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
  calculateMultisectionTransformer,
  type MultisectionTransformerCalculation,
} from "@/lib/calculators/multisectionTransformer";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type MultisectionTransformerCalculatorProps = {
  calculator: CalculatorInfo;
};

type MultisectionTransformerFormState = {
  z0Ohm: string;
  zLOhm: string;
  sections: string;
  fGHz: string;
  epsEff: string;
};

const defaultFormState: MultisectionTransformerFormState = {
  z0Ohm: defaultNumber(calculatorDefaults.multisectionTransformer.z0Ohm),
  zLOhm: defaultNumber(calculatorDefaults.multisectionTransformer.zLOhm),
  sections: defaultNumber(calculatorDefaults.multisectionTransformer.sections),
  fGHz: defaultNumber(calculatorDefaults.multisectionTransformer.fGHz),
  epsEff: defaultNumber(calculatorDefaults.multisectionTransformer.epsEff),
};

export function MultisectionTransformerCalculator({
  calculator,
}: MultisectionTransformerCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:multisection-transformer-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateMultisectionTransformer({
        z0Ohm: parseNumericField(form.z0Ohm),
        zLOhm: parseNumericField(form.zLOhm),
        sections: parseNumericField(form.sections),
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
    field: keyof MultisectionTransformerFormState,
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

  return (
    <CalculatorLayout
      title={calculator.title}
      description={calculator.description}
      inputPanel={
        <MultisectionTransformerInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <MultisectionTransformerResultPanel
          calculation={calculation}
          copyText={copyText}
        />
      }
      formulaPanel={
        <FormulaBlock title="Binomial multi-section transformer">
          The logarithmic impedance steps are weighted by binomial coefficients.
          Every section is lambda_g / 4 at the center frequency. Chebyshev
          transformer synthesis is planned as a later stage.
        </FormulaBlock>
      }
    />
  );
}

type MultisectionTransformerInputPanelProps = {
  form: MultisectionTransformerFormState;
  calculation: MultisectionTransformerCalculation;
  onChange: (
    field: keyof MultisectionTransformerFormState,
    value: string,
  ) => void;
  onReset: () => void;
};

function MultisectionTransformerInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: MultisectionTransformerInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter real source and load impedances for a binomial transformer.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="multisection-transformer-z0"
          label="source impedance Z0"
          value={form.z0Ohm}
          onChange={(value) => onChange("z0Ohm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="multisection-transformer-zl"
          label="load impedance ZL"
          value={form.zLOhm}
          onChange={(value) => onChange("zLOhm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="multisection-transformer-sections"
          label="number of sections N"
          value={form.sections}
          onChange={(value) => onChange("sections", value)}
          min={1}
          max={10}
          step={1}
        />
        <NumberInput
          id="multisection-transformer-frequency"
          label="center frequency"
          value={form.fGHz}
          onChange={(value) => onChange("fGHz", value)}
          unit="GHz"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="multisection-transformer-eps-eff"
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

type MultisectionTransformerResultPanelProps = {
  calculation: MultisectionTransformerCalculation;
  copyText?: string;
};

function MultisectionTransformerResultPanel({
  calculation,
  copyText,
}: MultisectionTransformerResultPanelProps) {
  const summaryRows = calculation.value
    ? [
        {
          label: "lambda_g",
          value: formatNumber(calculation.value.lambdaGM, 6),
          unit: "m",
        },
        {
          label: "section physical length",
          value: formatNumber(calculation.value.sectionLengthM * 1000, 3),
          unit: "mm",
        },
        {
          label: "bandwidth note",
          value: calculation.value.bandwidthNote,
        },
      ]
    : [];
  const sectionRows =
    calculation.value?.sections.map((section) => ({
      label: `section ${section.index}`,
      value: formatNumber(section.impedanceOhm, 3),
      unit: "Ohm",
      note: `length ${formatNumber(section.physicalLengthM * 1000, 3)} mm, ${formatNumber(section.electricalLengthDeg, 1)} deg`,
    })) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Binomial quarter-wave sections. Chebyshev synthesis is planned as a
            later stage.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={summaryRows}
        emptyMessage="Enter valid multi-section transformer parameters to see results."
      />
      {sectionRows.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Quarter-wave sections
          </h3>
          <ResultTable rows={sectionRows} />
        </div>
      ) : null}
    </div>
  );
}

function buildCopyText(
  title: string,
  form: MultisectionTransformerFormState,
  calculation: MultisectionTransformerCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }
  const result = calculation.value;

  return formatResultsText({
    title,
    inputs: [
      { label: "source impedance Z0", value: form.z0Ohm, unit: "Ohm" },
      { label: "load impedance ZL", value: form.zLOhm, unit: "Ohm" },
      { label: "number of sections N", value: form.sections },
      { label: "center frequency", value: form.fGHz, unit: "GHz" },
      { label: "eps_eff", value: form.epsEff },
    ],
    sections: [
      {
        title: "Summary",
        items: [
          {
            label: "lambda_g",
            value: formatNumber(result.lambdaGM, 6),
            unit: "m",
          },
          {
            label: "section physical length",
            value: formatNumber(result.sectionLengthM * 1000, 3),
            unit: "mm",
          },
          { label: "bandwidth note", value: result.bandwidthNote },
        ],
      },
      {
        title: "Quarter-wave sections",
        items: result.sections.map((section) => ({
          label: `section ${section.index}`,
          value: formatNumber(section.impedanceOhm, 3),
          unit: "Ohm",
        })),
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
