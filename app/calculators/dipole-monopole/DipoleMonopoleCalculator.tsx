"use client";

import { useMemo } from "react";
import { DipoleMonopoleDiagram } from "@/components/CalculatorDiagram";
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
  calculateDipoleMonopole,
  type DipoleMonopoleAntennaType,
  type DipoleMonopoleCalculation,
  type DipoleMonopoleFrequencyUnit,
  type FoldedDipoleMatchingOption,
} from "@/lib/calculators/dipoleMonopole";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type DipoleMonopoleCalculatorProps = {
  calculator: CalculatorInfo;
};

type DipoleMonopoleFormState = {
  frequencyMHz: string;
  foldedFrequency: string;
  foldedFrequencyUnit: DipoleMonopoleFrequencyUnit;
  velocityFactor: string;
  antennaType: DipoleMonopoleAntennaType;
  rodDiameterMm: string;
  spacingMm: string;
  feedGapMm: string;
  feedLineImpedanceOhm: string;
  matchingOption: FoldedDipoleMatchingOption;
  outputUnit: OutputUnit;
};

type OutputUnit = "mm" | "cm" | "inch";

const antennaTypes: { value: DipoleMonopoleAntennaType; label: string }[] = [
  { value: "halfWaveDipole", label: "half-wave dipole" },
  { value: "quarterWaveMonopole", label: "quarter-wave monopole" },
  { value: "foldedDipole", label: "Folded dipole" },
];

const frequencyUnitOptions = [
  { value: "MHz", label: "MHz" },
  { value: "GHz", label: "GHz" },
];

const foldedFrequencyPresets = ["88", "98", "100", "144", "432", "868", "915"];

const feedLineImpedancePresets = ["50", "75", "300"];

const outputUnitOptions = [
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
  { value: "inch", label: "inch" },
];

const matchingOptions: {
  value: FoldedDipoleMatchingOption;
  label: string;
}[] = [
  { value: "none", label: "none" },
  { value: "4To1Balun", label: "4:1 balun" },
  { value: "quarterWaveTransformer", label: "quarter-wave transformer" },
];

const defaultFormState: DipoleMonopoleFormState = {
  frequencyMHz: defaultNumber(calculatorDefaults.dipoleMonopole.frequencyMHz),
  foldedFrequency: "100",
  foldedFrequencyUnit: "MHz",
  velocityFactor: defaultNumber(
    calculatorDefaults.dipoleMonopole.velocityFactor,
  ),
  antennaType: calculatorDefaults.dipoleMonopole.antennaType,
  rodDiameterMm: "6",
  spacingMm: "50",
  feedGapMm: "20",
  feedLineImpedanceOhm: "75",
  matchingOption: "4To1Balun",
  outputUnit: "mm",
};

export function DipoleMonopoleCalculator({
  calculator,
}: DipoleMonopoleCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:dipole-monopole-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      form.antennaType === "foldedDipole"
        ? calculateDipoleMonopole({
            frequency: parseNumericField(form.foldedFrequency),
            frequencyUnit: form.foldedFrequencyUnit,
            velocityFactor: parseNumericField(form.velocityFactor),
            antennaType: form.antennaType,
            rodDiameterMm: parseNumericField(form.rodDiameterMm),
            spacingMm: parseNumericField(form.spacingMm),
            feedGapMm: parseNumericField(form.feedGapMm),
            feedLineImpedanceOhm: parseNumericField(
              form.feedLineImpedanceOhm,
            ),
            matchingOption: form.matchingOption,
          })
        : calculateDipoleMonopole({
            frequencyMHz: parseNumericField(form.frequencyMHz),
            velocityFactor: parseNumericField(form.velocityFactor),
            antennaType: form.antennaType,
          }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof DipoleMonopoleFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    resetStoredForm();
  }

  const isFoldedDipole = form.antennaType === "foldedDipole";

  return (
    <CalculatorLayout
      title={calculator.title}
      description={calculator.description}
      inputPanel={
        <DipoleMonopoleInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <DipoleMonopoleResultPanel
          calculation={calculation}
          copyText={copyText}
          outputUnit={form.outputUnit}
        />
      }
      diagramPanel={
        isFoldedDipole ? (
          <FoldedDipoleDiagram />
        ) : (
          <DipoleMonopoleDiagram />
        )
      }
      formulaPanel={
        isFoldedDipole ? (
          <FormulaBlock title="Rounded folded dipole estimate">
            lambda0 = c / f. Corrected lambda = lambda0 * velocity factor.
            Overall length D = corrected lambda / 2. R = spacing / 2, C = D -
            2R, and total conductor length = 2C + 2 pi R.
          </FormulaBlock>
        ) : (
          <FormulaBlock title="Wire antenna length estimate">
            lambda0 = c / f. Corrected lambda = lambda0 * velocity factor.
            Half-wave dipole total length is corrected lambda / 2; each arm and
            a quarter-wave monopole are corrected lambda / 4.
          </FormulaBlock>
        )
      }
    />
  );
}

type DipoleMonopoleInputPanelProps = {
  form: DipoleMonopoleFormState;
  calculation: DipoleMonopoleCalculation;
  onChange: (field: keyof DipoleMonopoleFormState, value: string) => void;
  onReset: () => void;
};

function DipoleMonopoleInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: DipoleMonopoleInputPanelProps) {
  const isFoldedDipole = form.antennaType === "foldedDipole";

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter operating frequency and construction parameters for the
            selected wire antenna model.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="dipole-monopole-type"
          className="block text-sm font-medium text-slate-800"
        >
          antenna type
        </label>
        <select
          id="dipole-monopole-type"
          value={form.antennaType}
          onChange={(event) =>
            onChange("antennaType", event.target.value as DipoleMonopoleAntennaType)
          }
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        >
          {antennaTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {isFoldedDipole ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberInput
            id="folded-dipole-frequency"
            label="frequency"
            value={form.foldedFrequency}
            onChange={(value) => onChange("foldedFrequency", value)}
            min={0}
            step={0.01}
          />
          <UnitSelect
            id="folded-dipole-frequency-unit"
            label="frequency unit"
            value={form.foldedFrequencyUnit}
            options={frequencyUnitOptions}
            onChange={(value) =>
              onChange("foldedFrequencyUnit", value as DipoleMonopoleFrequencyUnit)
            }
          />
          <div className="space-y-2 sm:col-span-2">
            <p className="text-sm font-medium text-slate-700">
              frequency presets
            </p>
            <div className="flex flex-wrap gap-2">
              {foldedFrequencyPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    onChange("foldedFrequency", preset);
                    onChange("foldedFrequencyUnit", "MHz");
                  }}
                  className="inline-flex min-h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-cyan-700 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700/20"
                >
                  {preset} MHz
                </button>
              ))}
            </div>
          </div>
          <NumberInput
            id="folded-dipole-velocity-factor"
            label="velocity factor"
            value={form.velocityFactor}
            onChange={(value) => onChange("velocityFactor", value)}
            min={0}
            max={1}
            step={0.01}
          />
          <NumberInput
            id="folded-dipole-rod-diameter"
            label="rod diameter"
            value={form.rodDiameterMm}
            onChange={(value) => onChange("rodDiameterMm", value)}
            unit="mm"
            min={0}
            step={0.1}
          />
          <NumberInput
            id="folded-dipole-spacing"
            label="spacing between parallel conductors"
            value={form.spacingMm}
            onChange={(value) => onChange("spacingMm", value)}
            unit="mm"
            min={0}
            step={0.1}
          />
          <NumberInput
            id="folded-dipole-feed-gap"
            label="feed gap"
            value={form.feedGapMm}
            onChange={(value) => onChange("feedGapMm", value)}
            unit="mm"
            min={0}
            step={0.1}
          />
          <NumberInput
            id="folded-dipole-feed-impedance"
            label="feed line impedance"
            value={form.feedLineImpedanceOhm}
            onChange={(value) => onChange("feedLineImpedanceOhm", value)}
            unit="Ohm"
            min={0}
            step={1}
          />
          <div className="space-y-2 sm:col-span-2">
            <p className="text-sm font-medium text-slate-700">
              feed line impedance presets
            </p>
            <div className="flex flex-wrap gap-2">
              {feedLineImpedancePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange("feedLineImpedanceOhm", preset)}
                  className="inline-flex min-h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-cyan-700 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700/20"
                >
                  {preset} Ohm
                </button>
              ))}
            </div>
          </div>
          <UnitSelect
            id="folded-dipole-matching-option"
            label="matching option"
            value={form.matchingOption}
            options={matchingOptions}
            onChange={(value) =>
              onChange("matchingOption", value as FoldedDipoleMatchingOption)
            }
          />
          <UnitSelect
            id="folded-dipole-output-unit"
            label="results unit"
            value={form.outputUnit}
            options={outputUnitOptions}
            onChange={(value) => onChange("outputUnit", value as OutputUnit)}
          />
          <div className="rounded-md border border-cyan-100 bg-cyan-50 px-3 py-3 text-sm leading-6 text-slate-700 sm:col-span-2">
            <p>
              For 75 Ohm feed line, 4:1 balun is commonly used. For 50 Ohm feed
              line, quarter-wave transformer is often more appropriate.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberInput
            id="dipole-monopole-frequency"
            label="frequency"
            value={form.frequencyMHz}
            onChange={(value) => onChange("frequencyMHz", value)}
            unit="MHz"
            min={0}
            step={0.01}
          />
          <NumberInput
            id="dipole-monopole-velocity-factor"
            label="velocity factor"
            value={form.velocityFactor}
            onChange={(value) => onChange("velocityFactor", value)}
            min={0}
            max={1}
            step={0.01}
          />
        </div>
      )}

      <ValidationMessages
        errors={calculation.errors}
        warnings={calculation.warnings}
      />
    </div>
  );
}

type DipoleMonopoleResultPanelProps = {
  calculation: DipoleMonopoleCalculation;
  copyText?: string;
  outputUnit: OutputUnit;
};

function DipoleMonopoleResultPanel({
  calculation,
  copyText,
  outputUnit,
}: DipoleMonopoleResultPanelProps) {
  const rows = calculation.value?.foldedDipole
    ? foldedDipoleRows(calculation, outputUnit)
    : basicAntennaRows(calculation);
  const emptyMessage = calculation.value?.foldedDipole
    ? "Enter valid folded dipole parameters to see results."
    : "Enter valid dipole or monopole parameters to see results.";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use these physical dimensions as a starting point for construction
            and trimming.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable rows={rows} emptyMessage={emptyMessage} />
    </div>
  );
}

function basicAntennaRows(calculation: DipoleMonopoleCalculation) {
  return calculation.value
    ? [
        {
          label: "free-space wavelength",
          value: formatNumber(calculation.value.freeSpaceWavelengthM, 4),
          unit: "m",
        },
        {
          label: "corrected wavelength",
          value: formatNumber(calculation.value.correctedWavelengthM, 4),
          unit: "m",
        },
        {
          label: "total dipole length",
          value: formatNumber(calculation.value.totalDipoleLengthM, 4),
          unit: "m",
        },
        {
          label: "each dipole arm length",
          value: formatNumber(calculation.value.eachDipoleArmLengthM, 4),
          unit: "m",
        },
        {
          label: "monopole length",
          value: formatNumber(calculation.value.monopoleLengthM, 4),
          unit: "m",
        },
        {
          label: `selected ${calculation.value.selectedLengthLabel}`,
          value: formatNumber(calculation.value.selectedLengthM, 4),
          unit: "m",
        },
      ]
    : [];
}

function foldedDipoleRows(
  calculation: DipoleMonopoleCalculation,
  outputUnit: OutputUnit,
) {
  const folded = calculation.value?.foldedDipole;

  if (!folded) {
    return [];
  }

  const rows = [
    {
      label: "free-space wavelength",
      value: formatLength(folded.freeSpaceWavelengthM * 1000, outputUnit),
      unit: outputUnit,
    },
    {
      label: "corrected wavelength",
      value: formatLength(folded.correctedWavelengthM * 1000, outputUnit),
      unit: outputUnit,
    },
    {
      label: "overall antenna length D",
      value: formatLength(folded.geometry.dMm, outputUnit),
      unit: outputUnit,
    },
    {
      label: "straight section length C",
      value: formatLength(folded.geometry.cMm, outputUnit),
      unit: outputUnit,
    },
    {
      label: "bend radius R",
      value: formatLength(folded.geometry.rMm, outputUnit),
      unit: outputUnit,
    },
    {
      label: "feed gap B",
      value: formatLength(folded.geometry.bMm, outputUnit),
      unit: outputUnit,
    },
    {
      label: "length A",
      value: formatLength(folded.geometry.aMm, outputUnit),
      unit: outputUnit,
    },
    {
      label: "rod diameter",
      value: formatLength(folded.geometry.rodDiameterMm, outputUnit),
      unit: outputUnit,
    },
    {
      label: "total conductor length",
      value: formatLength(folded.geometry.totalConductorLengthMm, outputUnit),
      unit: outputUnit,
    },
    {
      label: "estimated folded dipole impedance",
      value: formatNumber(folded.estimatedFoldedDipoleImpedanceOhm, 1),
      unit: "Ohm",
    },
    {
      label: "matching result",
      value:
        folded.transformedImpedanceOhm !== undefined
          ? `${formatNumber(folded.transformedImpedanceOhm, 1)} Ohm after matching`
          : folded.recommendedMatching,
      note: `mismatch ratio ${formatNumber(folded.mismatchRatio, 2)}:1`,
    },
  ];

  if (folded.quarterWaveTransformerImpedanceOhm !== undefined) {
    rows.push({
      label: "quarter-wave transformer impedance",
      value: formatNumber(folded.quarterWaveTransformerImpedanceOhm, 1),
      unit: "Ohm",
    });
  }

  if (folded.quarterWaveTransformerLengthM !== undefined) {
    rows.push({
      label: "quarter-wave transformer length",
      value: formatLength(folded.quarterWaveTransformerLengthM * 1000, outputUnit),
      unit: outputUnit,
    });
  }

  return rows;
}

function FoldedDipoleDiagram() {
  const width = 920;
  const height = 340;
  const left = 100;
  const right = 820;
  const topY = 120;
  const bottomY = 220;
  const radius = (bottomY - topY) / 2;
  const centerY = (topY + bottomY) / 2;
  const gap = 44;
  const centerX = (left + right) / 2;
  const conductorWidth = 9;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">
          Folded dipole geometry
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          A, B, C, D and R are construction dimensions for a rounded folded
          dipole model.
        </p>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Rounded folded dipole construction dimensions A B C D and R"
          className="min-w-[760px] w-full"
        >
          <defs>
            <marker
              id="folded-arrow"
              markerHeight="7"
              markerWidth="7"
              orient="auto-start-reverse"
              refX="5"
              refY="3.5"
            >
              <path d="M0,0 L7,3.5 L0,7 Z" fill="#64748b" />
            </marker>
          </defs>
          <path
            d={`M ${left + radius} ${topY} H ${right - radius} A ${radius} ${radius} 0 0 1 ${right - radius} ${bottomY} H ${centerX + gap / 2} M ${centerX - gap / 2} ${bottomY} H ${left + radius} A ${radius} ${radius} 0 0 1 ${left + radius} ${topY}`}
            fill="none"
            stroke="#0891b2"
            strokeLinecap="round"
            strokeWidth={conductorWidth}
          />
          <line
            x1={centerX - gap / 2}
            y1={bottomY - 28}
            x2={centerX - gap / 2}
            y2={bottomY + 28}
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1={centerX + gap / 2}
            y1={bottomY - 28}
            x2={centerX + gap / 2}
            y2={bottomY + 28}
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1={left + radius}
            y1={66}
            x2={right - radius}
            y2={66}
            stroke="#64748b"
            strokeWidth="2"
            markerEnd="url(#folded-arrow)"
            markerStart="url(#folded-arrow)"
          />
          <line
            x1={left + radius}
            y1={92}
            x2={right - radius}
            y2={92}
            stroke="#64748b"
            strokeDasharray="7 7"
            strokeWidth="2"
          />
          <line
            x1={centerX - gap / 2}
            y1={260}
            x2={centerX + gap / 2}
            y2={260}
            stroke="#64748b"
            strokeWidth="2"
            markerEnd="url(#folded-arrow)"
            markerStart="url(#folded-arrow)"
          />
          <line
            x1={centerX - 210}
            y1={250}
            x2={centerX - gap / 2}
            y2={250}
            stroke="#64748b"
            strokeWidth="2"
            markerEnd="url(#folded-arrow)"
            markerStart="url(#folded-arrow)"
          />
          <path
            d={`M ${left + radius} ${centerY} A ${radius} ${radius} 0 0 1 ${left + radius} ${topY}`}
            fill="none"
            stroke="#64748b"
            strokeDasharray="5 5"
            strokeWidth="2"
          />
          <line
            x1={left + radius}
            y1={centerY}
            x2={left + radius + 44}
            y2={centerY}
            stroke="#64748b"
            strokeWidth="2"
            markerEnd="url(#folded-arrow)"
          />
          <DimensionLabel x={(left + right) / 2} y={36} text="D" />
          <DimensionLabel x={(left + right) / 2} y={106} text="C" />
          <DimensionLabel x={centerX} y={300} text="B / Gap" />
          <DimensionLabel x={centerX - 118} y={286} text="A" />
          <DimensionLabel x={left + 36} y={centerY + 8} text="R" />
        </svg>
      </div>
    </section>
  );
}

function DimensionLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g>
      <rect
        x={x - 34}
        y={y - 20}
        width="68"
        height="28"
        rx="6"
        className="fill-white stroke-slate-200"
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        className="fill-slate-800 text-[16px] font-semibold"
      >
        {text}
      </text>
    </g>
  );
}

function buildCopyText(
  title: string,
  form: DipoleMonopoleFormState,
  calculation: DipoleMonopoleCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }
  const result = calculation.value;

  if (result.foldedDipole) {
    return buildFoldedDipoleCopyText(title, form, calculation);
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "antenna type", value: selectedTypeLabel(form.antennaType) },
      { label: "frequency", value: form.frequencyMHz, unit: "MHz" },
      { label: "velocity factor", value: form.velocityFactor },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "free-space wavelength",
            value: formatNumber(result.freeSpaceWavelengthM, 4),
            unit: "m",
          },
          {
            label: "corrected wavelength",
            value: formatNumber(result.correctedWavelengthM, 4),
            unit: "m",
          },
          {
            label: "total dipole length",
            value: formatNumber(result.totalDipoleLengthM, 4),
            unit: "m",
          },
          {
            label: "each dipole arm length",
            value: formatNumber(result.eachDipoleArmLengthM, 4),
            unit: "m",
          },
          {
            label: "monopole length",
            value: formatNumber(result.monopoleLengthM, 4),
            unit: "m",
          },
          {
            label: `selected ${result.selectedLengthLabel}`,
            value: formatNumber(result.selectedLengthM, 4),
            unit: "m",
          },
        ],
      },
    ],
    warnings: calculation.warnings,
  });
}

function buildFoldedDipoleCopyText(
  title: string,
  form: DipoleMonopoleFormState,
  calculation: DipoleMonopoleCalculation,
): string | undefined {
  const folded = calculation.value?.foldedDipole;

  if (!folded) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "antenna type", value: "Folded dipole" },
      {
        label: "frequency",
        value: form.foldedFrequency,
        unit: form.foldedFrequencyUnit,
      },
      { label: "velocity factor", value: form.velocityFactor },
      { label: "rod diameter", value: form.rodDiameterMm, unit: "mm" },
      { label: "spacing", value: form.spacingMm, unit: "mm" },
      { label: "feed gap", value: form.feedGapMm, unit: "mm" },
      {
        label: "feed line impedance",
        value: form.feedLineImpedanceOhm,
        unit: "Ohm",
      },
      { label: "matching option", value: selectedMatchingLabel(form.matchingOption) },
    ],
    sections: [
      {
        title: "Folded dipole results",
        items: [
          {
            label: "free-space wavelength",
            value: formatLength(
              folded.freeSpaceWavelengthM * 1000,
              form.outputUnit,
            ),
            unit: form.outputUnit,
          },
          {
            label: "corrected wavelength",
            value: formatLength(
              folded.correctedWavelengthM * 1000,
              form.outputUnit,
            ),
            unit: form.outputUnit,
          },
          {
            label: "D",
            value: formatLength(folded.geometry.dMm, form.outputUnit),
            unit: form.outputUnit,
          },
          {
            label: "C",
            value: formatLength(folded.geometry.cMm, form.outputUnit),
            unit: form.outputUnit,
          },
          {
            label: "R",
            value: formatLength(folded.geometry.rMm, form.outputUnit),
            unit: form.outputUnit,
          },
          {
            label: "B / Gap",
            value: formatLength(folded.geometry.bMm, form.outputUnit),
            unit: form.outputUnit,
          },
          {
            label: "A",
            value: formatLength(folded.geometry.aMm, form.outputUnit),
            unit: form.outputUnit,
          },
          {
            label: "total conductor length",
            value: formatLength(
              folded.geometry.totalConductorLengthMm,
              form.outputUnit,
            ),
            unit: form.outputUnit,
          },
          {
            label: "estimated folded dipole impedance",
            value: formatNumber(folded.estimatedFoldedDipoleImpedanceOhm, 1),
            unit: "Ohm",
          },
          {
            label: "matching result",
            value:
              folded.transformedImpedanceOhm !== undefined
                ? formatNumber(folded.transformedImpedanceOhm, 1)
                : folded.recommendedMatching,
            unit: folded.transformedImpedanceOhm !== undefined ? "Ohm" : undefined,
          },
        ],
      },
    ],
    warnings: calculation.warnings,
  });
}

function selectedTypeLabel(value: DipoleMonopoleAntennaType): string {
  return antennaTypes.find((type) => type.value === value)?.label ?? value;
}

function selectedMatchingLabel(value: FoldedDipoleMatchingOption): string {
  return matchingOptions.find((option) => option.value === value)?.label ?? value;
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
