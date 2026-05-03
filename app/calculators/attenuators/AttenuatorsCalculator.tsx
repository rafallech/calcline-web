"use client";

import { useMemo } from "react";
import { AttenuatorDiagram } from "@/components/CalculatorDiagram";
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
  calculateAttenuator,
  type AttenuatorCalculation,
  type AttenuatorTopology,
} from "@/lib/calculators/attenuators";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type AttenuatorsCalculatorProps = {
  calculator: CalculatorInfo;
};

type AttenuatorsFormState = {
  topology: AttenuatorTopology;
  z0Ohm: string;
  attenuationDb: string;
};

const defaultFormState: AttenuatorsFormState = {
  topology: calculatorDefaults.attenuators.topology,
  z0Ohm: defaultNumber(calculatorDefaults.attenuators.z0Ohm),
  attenuationDb: defaultNumber(calculatorDefaults.attenuators.attenuationDb),
};

const topologyOptions: { value: AttenuatorTopology; label: string }[] = [
  { value: "pi", label: "Pi attenuator" },
  { value: "t", label: "T attenuator" },
];

export function AttenuatorsCalculator({
  calculator,
}: AttenuatorsCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:attenuators-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateAttenuator({
        topology: form.topology,
        z0Ohm: parseNumericField(form.z0Ohm),
        attenuationDb: parseNumericField(form.attenuationDb),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof AttenuatorsFormState, value: string) {
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
        <AttenuatorsInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <AttenuatorsResultPanel calculation={calculation} copyText={copyText} />
      }
      diagramPanel={<AttenuatorDiagram topology={form.topology} />}
      formulaPanel={
        <FormulaBlock title="Resistive attenuator formulas">
          K = 10^(A / 20). T: Rseries = Z0 (K - 1) / (K + 1), Rshunt = 2 Z0 K
          / (K^2 - 1). Pi: Rshunt = Z0 (K + 1) / (K - 1), Rseries = Z0
          (K^2 - 1) / (2 K).
        </FormulaBlock>
      }
    />
  );
}

type AttenuatorsInputPanelProps = {
  form: AttenuatorsFormState;
  calculation: AttenuatorCalculation;
  onChange: (field: keyof AttenuatorsFormState, value: string) => void;
  onReset: () => void;
};

function AttenuatorsInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: AttenuatorsInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Select a symmetric attenuator topology and enter the target
            attenuation.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <UnitSelect
          id="attenuator-topology"
          label="topology"
          value={form.topology}
          options={topologyOptions}
          onChange={(value) => onChange("topology", value)}
        />
        <NumberInput
          id="attenuator-z0"
          label="Z0"
          value={form.z0Ohm}
          onChange={(value) => onChange("z0Ohm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <NumberInput
          id="attenuator-attenuation"
          label="attenuation"
          value={form.attenuationDb}
          onChange={(value) => onChange("attenuationDb", value)}
          unit="dB"
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

type AttenuatorsResultPanelProps = {
  calculation: AttenuatorCalculation;
  copyText?: string;
};

function AttenuatorsResultPanel({
  calculation,
  copyText,
}: AttenuatorsResultPanelProps) {
  const rows = calculation.value
    ? buildResultRows(calculation.value)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Values assume ideal resistors and equal source/load impedance.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid attenuator parameters to see results."
      />
    </div>
  );
}

function buildResultRows(result: NonNullable<AttenuatorCalculation["value"]>) {
  const commonRows = [
    {
      label: "voltage ratio",
      value: formatNumber(result.voltageRatio, 6),
    },
    {
      label: "power ratio",
      value: formatNumber(result.powerRatio, 6),
    },
  ];

  if (result.resistors.topology === "pi") {
    return [
      {
        label: "Rseries",
        value: formatNumber(result.resistors.rSeriesOhm, 3),
        unit: "Ohm",
      },
      {
        label: "Rshunt input",
        value: formatNumber(result.resistors.rShuntInputOhm, 3),
        unit: "Ohm",
      },
      {
        label: "Rshunt output",
        value: formatNumber(result.resistors.rShuntOutputOhm, 3),
        unit: "Ohm",
      },
      ...commonRows,
    ];
  }

  return [
    {
      label: "Rseries input",
      value: formatNumber(result.resistors.rSeriesInputOhm, 3),
      unit: "Ohm",
    },
    {
      label: "Rseries output",
      value: formatNumber(result.resistors.rSeriesOutputOhm, 3),
      unit: "Ohm",
    },
    {
      label: "Rshunt",
      value: formatNumber(result.resistors.rShuntOhm, 3),
      unit: "Ohm",
    },
    ...commonRows,
  ];
}

function buildCopyText(
  title: string,
  form: AttenuatorsFormState,
  calculation: AttenuatorCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "topology", value: form.topology === "pi" ? "Pi" : "T" },
      { label: "Z0", value: form.z0Ohm, unit: "Ohm" },
      { label: "attenuation", value: form.attenuationDb, unit: "dB" },
    ],
    sections: [
      {
        title: "Results",
        items: buildResultRows(calculation.value),
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

