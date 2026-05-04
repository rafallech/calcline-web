"use client";

import { useMemo, useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
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
  calculateYagiUda,
  type YagiBoomType,
  type YagiCalculation,
  type YagiDrivenElementType,
  type YagiElement,
  type YagiFrequencyUnit,
} from "@/lib/calculators/yagiUda";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type YagiUdaCalculatorProps = {
  calculator: CalculatorInfo;
};

type OutputUnit = "mm" | "cm" | "inch";

type YagiUdaFormState = {
  frequency: string;
  frequencyUnit: YagiFrequencyUnit;
  numberOfElements: string;
  elementDiameterMm: string;
  boomType: YagiBoomType;
  boomDiameterMm: string;
  drivenElementType: YagiDrivenElementType;
  outputUnit: OutputUnit;
};

const frequencyUnitOptions = [
  { value: "MHz", label: "MHz" },
  { value: "GHz", label: "GHz" },
];

const boomTypeOptions: { value: YagiBoomType; label: string }[] = [
  { value: "dielectric", label: "dielectric" },
  { value: "metalIsolated", label: "metal isolated" },
  { value: "metalThroughBoom", label: "metal through-boom" },
];

const drivenElementOptions: {
  value: YagiDrivenElementType;
  label: string;
}[] = [
  { value: "straightDipole", label: "straight dipole" },
  { value: "foldedDipole", label: "folded dipole" },
];

const outputUnitOptions = [
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
  { value: "inch", label: "inch" },
];

const frequencyPresets: {
  label: string;
  description: string;
  frequency: string;
  unit: YagiFrequencyUnit;
}[] = [
  {
    label: "144 MHz",
    description: "2 m amateur VHF starting point",
    frequency: "144",
    unit: "MHz",
  },
  {
    label: "432 MHz",
    description: "70 cm amateur UHF default",
    frequency: "432",
    unit: "MHz",
  },
  {
    label: "868 MHz",
    description: "EU ISM band reference",
    frequency: "868",
    unit: "MHz",
  },
  {
    label: "915 MHz",
    description: "US ISM band reference",
    frequency: "915",
    unit: "MHz",
  },
  {
    label: "1296 MHz",
    description: "23 cm amateur band",
    frequency: "1296",
    unit: "MHz",
  },
  {
    label: "2.4 GHz",
    description: "Microwave ISM reference",
    frequency: "2.4",
    unit: "GHz",
  },
];

const defaultFormState: YagiUdaFormState = {
  frequency: defaultNumber(calculatorDefaults.yagiUda.frequency),
  frequencyUnit: calculatorDefaults.yagiUda.frequencyUnit,
  numberOfElements: defaultNumber(calculatorDefaults.yagiUda.numberOfElements),
  elementDiameterMm: defaultNumber(calculatorDefaults.yagiUda.elementDiameterMm),
  boomType: calculatorDefaults.yagiUda.boomType,
  boomDiameterMm: defaultNumber(calculatorDefaults.yagiUda.boomDiameterMm),
  drivenElementType: calculatorDefaults.yagiUda.drivenElementType,
  outputUnit: calculatorDefaults.yagiUda.outputUnit as OutputUnit,
};

export function YagiUdaCalculator({ calculator }: YagiUdaCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:yagi-uda-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateYagiUda({
        frequency: parseNumericField(form.frequency),
        frequencyUnit: form.frequencyUnit,
        numberOfElements: parseIntegerField(form.numberOfElements),
        elementDiameterMm: parseNumericField(form.elementDiameterMm),
        boomDiameterMm: parseNumericField(form.boomDiameterMm),
        designMode: "dl6wu",
        boomType: form.boomType,
        drivenElementType: form.drivenElementType,
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );
  const csvText = useMemo(
    () => buildCsvText(calculation, form.outputUnit),
    [calculation, form.outputUnit],
  );

  function updateField(field: keyof YagiUdaFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    resetStoredForm();
  }

  function applyFrequencyPreset(preset: (typeof frequencyPresets)[number]) {
    setForm((current) => ({
      ...current,
      frequency: preset.frequency,
      frequencyUnit: preset.unit,
    }));
  }

  return (
    <CalculatorLayout
      title={calculator.title}
      description={calculator.description}
      inputPanel={
        <YagiUdaInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
          onPreset={applyFrequencyPreset}
        />
      }
      resultPanel={
        <YagiUdaResultPanel
          calculation={calculation}
          outputUnit={form.outputUnit}
          copyText={copyText}
          csvText={csvText}
        />
      }
      diagramPanel={
        <YagiAntennaDiagram
          elements={calculation.value?.elements ?? []}
          outputUnit={form.outputUnit}
        />
      }
      formulaPanel={
        <FormulaBlock title="DL6WU-inspired design notes">
          This calculator uses a DL6WU-inspired long-boom Yagi approximation.
          It provides an approximate starting point only; verify the final
          antenna in NEC or by measurement before manufacturing.
        </FormulaBlock>
      }
    />
  );
}

type YagiUdaInputPanelProps = {
  form: YagiUdaFormState;
  calculation: YagiCalculation;
  onChange: (field: keyof YagiUdaFormState, value: string) => void;
  onReset: () => void;
  onPreset: (preset: (typeof frequencyPresets)[number]) => void;
};

function YagiUdaInputPanel({
  form,
  calculation,
  onChange,
  onReset,
  onPreset,
}: YagiUdaInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter the center frequency and mechanical constraints for a
            DL6WU-inspired long-boom Yagi starting geometry.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="yagi-uda-frequency"
          label="frequency"
          value={form.frequency}
          onChange={(value) => onChange("frequency", value)}
          min={0}
          step={0.001}
        />
        <UnitSelect
          id="yagi-uda-frequency-unit"
          label="frequency unit"
          value={form.frequencyUnit}
          options={frequencyUnitOptions}
          onChange={(value) => onChange("frequencyUnit", value)}
        />
        <NumberInput
          id="yagi-uda-elements"
          label="number of elements"
          value={form.numberOfElements}
          onChange={(value) => onChange("numberOfElements", value)}
          min={5}
          max={24}
          step={1}
        />
        <NumberInput
          id="yagi-uda-element-diameter"
          label="element diameter"
          value={form.elementDiameterMm}
          onChange={(value) => onChange("elementDiameterMm", value)}
          unit="mm"
          min={0}
          step={0.1}
        />
        <UnitSelect
          id="yagi-uda-boom-type"
          label="boom type"
          value={form.boomType}
          options={boomTypeOptions}
          onChange={(value) => onChange("boomType", value)}
        />
        <NumberInput
          id="yagi-uda-boom-diameter"
          label="boom diameter or side"
          value={form.boomDiameterMm}
          onChange={(value) => onChange("boomDiameterMm", value)}
          unit="mm"
          min={0}
          step={0.1}
        />
        <UnitSelect
          id="yagi-uda-driven-element"
          label="driven element type"
          value={form.drivenElementType}
          options={drivenElementOptions}
          onChange={(value) => onChange("drivenElementType", value)}
        />
        <UnitSelect
          id="yagi-uda-output-unit"
          label="output unit"
          value={form.outputUnit}
          options={outputUnitOptions}
          onChange={(value) => onChange("outputUnit", value)}
        />
      </div>

      <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Frequency presets
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Common VHF, UHF, ISM, and microwave reference frequencies for quick
            starting designs.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {frequencyPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onPreset(preset)}
              className="min-h-16 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm transition hover:border-cyan-700 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700/20"
            >
              <span className="block font-semibold text-slate-900">
                {preset.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <ValidationMessages
        errors={calculation.errors}
        warnings={calculation.warnings}
      />
    </div>
  );
}

type YagiUdaResultPanelProps = {
  calculation: YagiCalculation;
  outputUnit: OutputUnit;
  copyText?: string;
  csvText?: string;
};

function YagiUdaResultPanel({
  calculation,
  outputUnit,
  copyText,
  csvText,
}: YagiUdaResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const rows = calculation.value
    ? [
        {
          label: "wavelength",
          value: formatLength(calculation.value.wavelengthMm, outputUnit),
          unit: outputUnit,
        },
        {
          label: "boom length",
          value: formatLength(calculation.value.boomLengthMm, outputUnit),
          unit: outputUnit,
        },
        {
          label: "estimated gain",
          value: formatNumber(calculation.value.approximateGainDbi, 2),
          unit: "dBi",
        },
        {
          label: "estimated front-to-back",
          value: formatNumber(
            calculation.value.estimatedFrontToBackRatioDb ?? Number.NaN,
            1,
          ),
          unit: "dB",
        },
      ]
    : [];

  async function copyResults() {
    if (!copyText) {
      return;
    }

    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function exportCsv() {
    if (!csvText) {
      return;
    }

    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "yagi-uda-elements.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Starting geometry for the boom and antenna elements.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={copyResults}
            disabled={!copyText}
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-cyan-700 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
          >
            {copied ? "Copied" : "Copy results"}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!csvText}
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-cyan-700 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
          >
            Export CSV
          </button>
        </div>
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid Yagi-Uda parameters to see results."
      />
      <YagiElementTable
        elements={calculation.value?.elements ?? []}
        outputUnit={outputUnit}
      />
      <YagiNotes calculation={calculation} />
    </div>
  );
}

type YagiElementTableProps = {
  elements: YagiElement[];
  outputUnit: OutputUnit;
};

function YagiElementTable({ elements, outputUnit }: YagiElementTableProps) {
  if (elements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {elements.map((element) => (
          <article
            key={element.name}
            className="rounded-md border border-slate-200 bg-white p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-slate-950">{element.name}</h3>
              <span className="rounded-full bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-800">
                {elementLabel(element.name, elements.indexOf(element))}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  position
                </dt>
                <dd className="font-medium text-slate-950">
                  {formatLength(element.positionMm, outputUnit)} {outputUnit}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  spacing
                </dt>
                <dd className="font-medium text-slate-950">
                  {formatLength(element.spacingFromPreviousMm, outputUnit)}{" "}
                  {outputUnit}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  full length
                </dt>
                <dd className="font-medium text-slate-950">
                  {formatLength(element.lengthMm, outputUnit)} {outputUnit}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  half length
                </dt>
                <dd className="font-medium text-slate-950">
                  {formatLength(element.halfLengthMm, outputUnit)} {outputUnit}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-md border border-slate-200 md:block">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="w-[24%] px-3 py-2.5 font-semibold">element</th>
            <th className="w-[22%] px-3 py-2.5 text-right font-semibold">
              position from reflector
            </th>
            <th className="w-[18%] px-3 py-2.5 text-right font-semibold">
              spacing
            </th>
            <th className="w-[18%] px-3 py-2.5 text-right font-semibold">
              full length
            </th>
            <th className="w-[18%] px-3 py-2.5 text-right font-semibold">
              half length
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {elements.map((element) => (
            <tr key={element.name}>
              <th className="px-3 py-2.5 font-medium text-slate-700">
                {element.name}
              </th>
              <td className="px-3 py-2.5 text-right text-slate-950">
                {formatLength(element.positionMm, outputUnit)} {outputUnit}
              </td>
              <td className="px-3 py-2.5 text-right text-slate-950">
                {formatLength(element.spacingFromPreviousMm, outputUnit)}{" "}
                {outputUnit}
              </td>
              <td className="px-3 py-2.5 text-right text-slate-950">
                {formatLength(element.lengthMm, outputUnit)} {outputUnit}
              </td>
              <td className="px-3 py-2.5 text-right text-slate-950">
                {formatLength(element.halfLengthMm, outputUnit)} {outputUnit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function YagiNotes({ calculation }: { calculation: YagiCalculation }) {
  if (!calculation.value) {
    return null;
  }

  return (
    <div className="rounded-md border border-cyan-100 bg-cyan-50 px-3 py-3 text-sm leading-6 text-slate-700">
      <p className="font-semibold text-slate-900">Model assumptions</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>DL6WU-inspired design with visible approximation warnings.</li>
        <li>Approximate starting point for geometry and estimated gain.</li>
        <li>Verify in NEC or by measurement before manufacturing.</li>
      </ul>
    </div>
  );
}

type YagiAntennaDiagramProps = {
  elements: YagiElement[];
  outputUnit: OutputUnit;
};

function YagiAntennaDiagram({ elements, outputUnit }: YagiAntennaDiagramProps) {
  if (elements.length === 0) {
    return null;
  }

  const maxPosition = Math.max(...elements.map((element) => element.positionMm));
  const maxLength = Math.max(...elements.map((element) => element.lengthMm));
  const left = 48;
  const right = 48;
  const top = 28;
  const width = Math.max(920, 96 + elements.length * 58);
  const height = 320;
  const boomY = 160;
  const scaleX = (width - left - right) / Math.max(maxPosition, 1);
  const minElementHeight = 74;
  const maxElementHeight = 180;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">
          Antenna schematic
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Approximate visual scale along the boom; element lengths are shown
          proportionally for quick inspection.
        </p>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Yagi-Uda antenna schematic with reflector, driven element, and directors"
          className="min-w-[760px] w-full"
        >
          <line
            x1={left}
            y1={boomY}
            x2={width - right}
            y2={boomY}
            stroke="#334155"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {elements.map((element, index) => {
            const x = left + element.positionMm * scaleX;
            const elementHeight =
              minElementHeight +
              (element.lengthMm / maxLength) *
                (maxElementHeight - minElementHeight);
            const label = elementLabel(element.name, index);

            return (
              <g key={element.name}>
                <line
                  x1={x}
                  y1={boomY - elementHeight / 2}
                  x2={x}
                  y2={boomY + elementHeight / 2}
                  stroke={index === 1 ? "#0f172a" : "#0891b2"}
                  strokeWidth={index === 1 ? "5" : "4"}
                  strokeLinecap="round"
                />
                <circle cx={x} cy={boomY} r="4" fill="#0f172a" />
                <text
                  x={x}
                  y={top}
                  textAnchor="middle"
                  className="fill-slate-700 text-[15px] font-semibold"
                >
                  {label}
                </text>
                <text
                  x={x}
                  y={height - 34}
                  textAnchor="middle"
                  className="fill-slate-500 text-[12px]"
                >
                  {formatLength(element.positionMm, outputUnit)}
                  {outputUnit}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

function buildCopyText(
  title: string,
  form: YagiUdaFormState,
  calculation: YagiCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }
  const result = calculation.value;

  return formatResultsText({
    title,
    inputs: [
      { label: "frequency", value: form.frequency, unit: form.frequencyUnit },
      { label: "number of elements", value: form.numberOfElements },
      { label: "element diameter", value: form.elementDiameterMm, unit: "mm" },
      { label: "boom type", value: boomTypeLabel(form.boomType) },
      { label: "boom diameter or side", value: form.boomDiameterMm, unit: "mm" },
      {
        label: "driven element type",
        value: drivenElementLabel(form.drivenElementType),
      },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "wavelength",
            value: formatLength(result.wavelengthMm, form.outputUnit),
            unit: form.outputUnit,
          },
          {
            label: "boom length",
            value: formatLength(result.boomLengthMm, form.outputUnit),
            unit: form.outputUnit,
          },
          {
            label: "estimated gain",
            value: formatNumber(result.approximateGainDbi, 2),
            unit: "dBi",
          },
          {
            label: "estimated front-to-back",
            value: formatNumber(result.estimatedFrontToBackRatioDb ?? Number.NaN, 1),
            unit: "dB",
          },
        ],
      },
      {
        title: "Elements",
        items: result.elements.map((element) => ({
          label: element.name,
          value: `${formatLength(element.positionMm, form.outputUnit)} ${form.outputUnit}, ${formatLength(element.lengthMm, form.outputUnit)} ${form.outputUnit} full length`,
        })),
      },
    ],
    warnings: calculation.warnings,
  });
}

function buildCsvText(
  calculation: YagiCalculation,
  outputUnit: OutputUnit,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  const header = [
    "element",
    `position from reflector (${outputUnit})`,
    `spacing (${outputUnit})`,
    `full length (${outputUnit})`,
    `half length (${outputUnit})`,
  ];
  const rows = calculation.value.elements.map((element) => [
    element.name,
    formatLength(element.positionMm, outputUnit),
    formatLength(element.spacingFromPreviousMm, outputUnit),
    formatLength(element.lengthMm, outputUnit),
    formatLength(element.halfLengthMm, outputUnit),
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => csvCell(cell)).join(","))
    .join("\n");
}

function formatLength(valueMm: number, outputUnit: OutputUnit): string {
  const value =
    outputUnit === "cm"
      ? valueMm / 10
      : outputUnit === "inch"
        ? valueMm / 25.4
        : valueMm;
  const digits = outputUnit === "inch" ? 3 : outputUnit === "cm" ? 2 : 1;

  return formatNumber(value, digits);
}

function parseNumericField(value: string): number {
  if (value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}

function parseIntegerField(value: string): number {
  if (value.trim() === "") {
    return Number.NaN;
  }

  return Number.parseInt(value, 10);
}

function elementLabel(name: string, index: number): string {
  if (name === "reflector") {
    return "R";
  }

  if (name === "driven element") {
    return "DE";
  }

  return `D${index - 1}`;
}

function boomTypeLabel(value: YagiBoomType): string {
  return boomTypeOptions.find((option) => option.value === value)?.label ?? value;
}

function drivenElementLabel(value: YagiDrivenElementType): string {
  return (
    drivenElementOptions.find((option) => option.value === value)?.label ?? value
  );
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}
