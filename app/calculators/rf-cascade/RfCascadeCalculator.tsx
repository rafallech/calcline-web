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
  calculateRfCascade,
  type RfCascadeCalculation,
} from "@/lib/calculators/rfCascade";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type RfCascadeCalculatorProps = {
  calculator: CalculatorInfo;
};

type RfCascadeStageFormState = {
  id: string;
  name: string;
  gainDb: string;
  noiseFigureDb: string;
  p1dBDbm: string;
  oip3Dbm: string;
};

type RfCascadeFormState = {
  inputPowerDbm: string;
  stages: RfCascadeStageFormState[];
};

const exampleFormState: RfCascadeFormState = {
  inputPowerDbm: "-30",
  stages: [
    {
      id: "example-lna",
      name: "LNA",
      gainDb: "15",
      noiseFigureDb: "1",
      p1dBDbm: "10",
      oip3Dbm: "35",
    },
    {
      id: "example-filter",
      name: "Filter",
      gainDb: "-3",
      noiseFigureDb: "3",
      p1dBDbm: "",
      oip3Dbm: "40",
    },
    {
      id: "example-if-amp",
      name: "IF amp",
      gainDb: "20",
      noiseFigureDb: "4",
      p1dBDbm: "15",
      oip3Dbm: "30",
    },
  ],
};

const defaultFormState: RfCascadeFormState = {
  inputPowerDbm: defaultNumber(calculatorDefaults.rfCascade.inputPowerDbm),
  stages: calculatorDefaults.rfCascade.stages.map((stage, index) => ({
    id: `default-stage-${index + 1}`,
    name: stage.name,
    gainDb: defaultNumber(stage.gainDb),
    noiseFigureDb: defaultNumber(stage.noiseFigureDb),
    p1dBDbm: "p1dBDbm" in stage ? defaultNumber(stage.p1dBDbm) : "",
    oip3Dbm: "oip3Dbm" in stage ? defaultNumber(stage.oip3Dbm) : "",
  })),
};

export function RfCascadeCalculator({ calculator }: RfCascadeCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:rf-cascade-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateRfCascade({
        inputPowerDbm: parseNumericField(form.inputPowerDbm),
        stages: form.stages.map((stage) => ({
          name: stage.name,
          gainDb: parseNumericField(stage.gainDb),
          noiseFigureDb: parseNumericField(stage.noiseFigureDb),
          p1dBDbm: parseOptionalNumericField(stage.p1dBDbm),
          oip3Dbm: parseOptionalNumericField(stage.oip3Dbm),
        })),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateInputPower(value: string) {
    setForm((current) => ({
      ...current,
      inputPowerDbm: value,
    }));
  }

  function updateStage(
    stageId: string,
    field: keyof Omit<RfCascadeStageFormState, "id">,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      stages: current.stages.map((stage) =>
        stage.id === stageId ? { ...stage, [field]: value } : stage,
      ),
    }));
  }

  function addStage() {
    setForm((current) => ({
      ...current,
      stages: [
        ...current.stages,
        {
          id: `stage-${Date.now()}`,
          name: `Stage ${current.stages.length + 1}`,
          gainDb: "0",
          noiseFigureDb: "0",
          p1dBDbm: "",
          oip3Dbm: "",
        },
      ],
    }));
  }

  function removeStage(stageId: string) {
    setForm((current) => ({
      ...current,
      stages: current.stages.filter((stage) => stage.id !== stageId),
    }));
  }

  function loadExample() {
    setForm(exampleFormState);
  }

  function resetForm() {
    resetStoredForm();
  }

  return (
    <CalculatorLayout
      title={calculator.title}
      description={calculator.description}
      inputPanel={
        <RfCascadeInputPanel
          form={form}
          calculation={calculation}
          onInputPowerChange={updateInputPower}
          onStageChange={updateStage}
          onAddStage={addStage}
          onRemoveStage={removeStage}
          onLoadExample={loadExample}
          onReset={resetForm}
        />
      }
      resultPanel={
        <RfCascadeResultPanel calculation={calculation} copyText={copyText} />
      }
      formulaPanel={
        <FormulaBlock title="Friis cascade">
          Ftotal = F1 + (F2 - 1)/G1 + (F3 - 1)/(G1 G2) + ...; output power
          after stage n = input power + cumulative gain. Cascaded IP3 is shown
          only when every stage has OIP3.
        </FormulaBlock>
      }
    />
  );
}

type RfCascadeInputPanelProps = {
  form: RfCascadeFormState;
  calculation: RfCascadeCalculation;
  onInputPowerChange: (value: string) => void;
  onStageChange: (
    stageId: string,
    field: keyof Omit<RfCascadeStageFormState, "id">,
    value: string,
  ) => void;
  onAddStage: () => void;
  onRemoveStage: (stageId: string) => void;
  onLoadExample: () => void;
  onReset: () => void;
};

function RfCascadeInputPanel({
  form,
  calculation,
  onInputPowerChange,
  onStageChange,
  onAddStage,
  onRemoveStage,
  onLoadExample,
  onReset,
}: RfCascadeInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Build the RF chain stage by stage. Losses are entered as negative
            gain values.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onLoadExample}
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-cyan-700 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700/20"
          >
            Load example
          </button>
          <ResetButton onClick={onReset} />
        </div>
      </div>

      <NumberInput
        id="rf-cascade-input-power"
        label="input power"
        value={form.inputPowerDbm}
        onChange={onInputPowerChange}
        unit="dBm"
        step={0.1}
      />

      <div className="space-y-4">
        {form.stages.map((stage, index) => (
          <section
            key={stage.id}
            className="rounded-md border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Stage {index + 1}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onRemoveStage(stage.id)}
                className="inline-flex min-h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:border-red-400 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                Remove
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextInput
                id={`${stage.id}-name`}
                label="name"
                value={stage.name}
                onChange={(value) => onStageChange(stage.id, "name", value)}
              />
              <NumberInput
                id={`${stage.id}-gain`}
                label="gain/loss"
                value={stage.gainDb}
                onChange={(value) => onStageChange(stage.id, "gainDb", value)}
                unit="dB"
                step={0.1}
              />
              <NumberInput
                id={`${stage.id}-nf`}
                label="noise figure"
                value={stage.noiseFigureDb}
                onChange={(value) =>
                  onStageChange(stage.id, "noiseFigureDb", value)
                }
                unit="dB"
                min={0}
                step={0.1}
              />
              <NumberInput
                id={`${stage.id}-p1db`}
                label="P1dB"
                value={stage.p1dBDbm}
                onChange={(value) => onStageChange(stage.id, "p1dBDbm", value)}
                unit="dBm"
                step={0.1}
                placeholder="optional"
              />
              <NumberInput
                id={`${stage.id}-oip3`}
                label="OIP3"
                value={stage.oip3Dbm}
                onChange={(value) => onStageChange(stage.id, "oip3Dbm", value)}
                unit="dBm"
                step={0.1}
                placeholder="optional"
              />
            </div>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddStage}
        className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-cyan-700 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700/20"
      >
        Add stage
      </button>

      <ValidationMessages
        errors={calculation.errors}
        warnings={calculation.warnings}
      />
    </div>
  );
}

type TextInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function TextInput({ id, label, value, onChange }: TextInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20"
      />
    </div>
  );
}

type RfCascadeResultPanelProps = {
  calculation: RfCascadeCalculation;
  copyText?: string;
};

function RfCascadeResultPanel({
  calculation,
  copyText,
}: RfCascadeResultPanelProps) {
  const summaryRows = calculation.value
    ? [
        {
          label: "total gain",
          value: formatNumber(calculation.value.totalGainDb, 3),
          unit: "dB",
        },
        {
          label: "cascaded noise figure",
          value: formatNumber(calculation.value.cascadedNoiseFigureDb, 3),
          unit: "dB",
        },
        ...(calculation.value.cascadedIp3
          ? [
              {
                label: "cascaded IIP3",
                value: formatNumber(calculation.value.cascadedIp3.iip3Dbm, 3),
                unit: "dBm",
              },
              {
                label: "cascaded OIP3",
                value: formatNumber(calculation.value.cascadedIp3.oip3Dbm, 3),
                unit: "dBm",
              },
            ]
          : []),
      ]
    : [];
  const stageRows =
    calculation.value?.outputStages.map((stage) => ({
      label: stage.name,
      value: formatNumber(stage.outputPowerDbm, 3),
      unit: "dBm",
      note: `cumulative gain ${formatNumber(stage.cumulativeGainDb, 3)} dB`,
    })) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            IP3 is reported only when every stage has OIP3.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={summaryRows}
        emptyMessage="Enter valid RF cascade stages to see results."
      />
      {stageRows.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Output power after each stage
          </h3>
          <ResultTable rows={stageRows} />
        </div>
      ) : null}
    </div>
  );
}

function buildCopyText(
  title: string,
  form: RfCascadeFormState,
  calculation: RfCascadeCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "input power", value: form.inputPowerDbm, unit: "dBm" },
      ...form.stages.flatMap((stage, index) => [
        { label: `stage ${index + 1} name`, value: stage.name },
        { label: `stage ${index + 1} gain/loss`, value: stage.gainDb, unit: "dB" },
        {
          label: `stage ${index + 1} noise figure`,
          value: stage.noiseFigureDb,
          unit: "dB",
        },
        {
          label: `stage ${index + 1} P1dB`,
          value: stage.p1dBDbm || "not set",
          unit: stage.p1dBDbm ? "dBm" : undefined,
        },
        {
          label: `stage ${index + 1} OIP3`,
          value: stage.oip3Dbm || "not set",
          unit: stage.oip3Dbm ? "dBm" : undefined,
        },
      ]),
    ],
    sections: [
      {
        title: "Summary",
        items: [
          {
            label: "total gain",
            value: formatNumber(calculation.value.totalGainDb, 3),
            unit: "dB",
          },
          {
            label: "cascaded noise figure",
            value: formatNumber(calculation.value.cascadedNoiseFigureDb, 3),
            unit: "dB",
          },
          ...(calculation.value.cascadedIp3
            ? [
                {
                  label: "cascaded IIP3",
                  value: formatNumber(
                    calculation.value.cascadedIp3.iip3Dbm,
                    3,
                  ),
                  unit: "dBm",
                },
                {
                  label: "cascaded OIP3",
                  value: formatNumber(
                    calculation.value.cascadedIp3.oip3Dbm,
                    3,
                  ),
                  unit: "dBm",
                },
              ]
            : []),
        ],
      },
      {
        title: "Output power after each stage",
        items: calculation.value.outputStages.map((stage) => ({
          label: stage.name,
          value: formatNumber(stage.outputPowerDbm, 3),
          unit: "dBm",
          note: `cumulative gain ${formatNumber(stage.cumulativeGainDb, 3)} dB`,
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

function parseOptionalNumericField(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  return Number(value);
}
