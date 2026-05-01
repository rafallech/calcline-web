"use client";

import { useMemo, useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { ComplexResult } from "@/components/ComplexResult";
import { CopyResultsButton } from "@/components/CopyResultsButton";
import { FormulaBlock } from "@/components/FormulaBlock";
import { NumberInput } from "@/components/NumberInput";
import { ResetButton } from "@/components/ResetButton";
import { ResultTable } from "@/components/ResultTable";
import { SmithChart, type SmithChartMarker } from "@/components/SmithChart";
import { UnitSelect } from "@/components/UnitSelect";
import { ValidationMessages } from "@/components/ValidationMessages";
import { usePersistentForm } from "@/components/usePersistentForm";
import { calculatorDefaults, defaultNumber } from "@/lib/calculatorDefaults";
import {
  calculateVswr,
  type VswrCalculation,
  type VswrInput,
} from "@/lib/calculators/vswr";
import type { CalculatorInfo } from "@/lib/calculators";
import { formatComplex, formatNumber } from "@/lib/math/format";
import { formatResultsText, type ResultTextItem } from "@/lib/resultText";
import {
  gammaFromNormalizedAdmittance,
  generateSmithGrid,
  sampleConstantGammaCircle,
  svgPointFromGamma,
  type SmithChartViewport,
  type SmithGridCurve,
} from "@/lib/visualization/smithChart";

type VswrCalculatorProps = {
  calculator: CalculatorInfo;
};

type VswrInputType = VswrInput["type"];

type VswrFormState = {
  type: VswrInputType;
  z0Ohm: string;
  vswr: string;
  magGamma: string;
  argGammaDeg: string;
  reGamma: string;
  imGamma: string;
  r: string;
  x: string;
  g: string;
  b: string;
  rOhm: string;
  xOhm: string;
  gS: string;
  bS: string;
};

const defaultFormState: VswrFormState = {
  type: calculatorDefaults.vswr.type,
  z0Ohm: defaultNumber(calculatorDefaults.vswr.z0Ohm),
  vswr: defaultNumber(calculatorDefaults.vswr.vswr),
  magGamma: defaultNumber(calculatorDefaults.vswr.magGamma),
  argGammaDeg: defaultNumber(calculatorDefaults.vswr.argGammaDeg),
  reGamma: defaultNumber(calculatorDefaults.vswr.reGamma),
  imGamma: defaultNumber(calculatorDefaults.vswr.imGamma),
  r: defaultNumber(calculatorDefaults.vswr.r),
  x: defaultNumber(calculatorDefaults.vswr.x),
  g: defaultNumber(calculatorDefaults.vswr.g),
  b: defaultNumber(calculatorDefaults.vswr.b),
  rOhm: defaultNumber(calculatorDefaults.vswr.rOhm),
  xOhm: defaultNumber(calculatorDefaults.vswr.xOhm),
  gS: defaultNumber(calculatorDefaults.vswr.gS),
  bS: defaultNumber(calculatorDefaults.vswr.bS),
};

const inputTypeOptions: { value: VswrInputType; label: string }[] = [
  { value: "vswr", label: "VSWR" },
  { value: "gammaPolar", label: "|Gamma|" },
  { value: "gammaRect", label: "Gamma complex" },
  { value: "normalizedImpedance", label: "Normalized impedance z" },
  { value: "normalizedAdmittance", label: "Normalized admittance y" },
  { value: "impedance", label: "Impedance Z" },
  { value: "admittance", label: "Admittance Y" },
];

const SMITH_VIEWPORT: SmithChartViewport = {
  centerX: 120,
  centerY: 120,
  radius: 100,
};
const SMITH_SAMPLES = 361;

export function VswrCalculator({ calculator }: VswrCalculatorProps) {
  const [showImpedanceGrid, setShowImpedanceGrid] = useState(true);
  const [showAdmittanceOverlay, setShowAdmittanceOverlay] = useState(false);
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:vswr-form",
    defaultFormState,
  );

  const calculation = useMemo(() => calculateVswr(buildInput(form)), [form]);
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );
  const smithChartData = useMemo(
    () =>
      buildVswrSmithChartData(
        calculation,
        showImpedanceGrid,
        showAdmittanceOverlay,
      ),
    [calculation, showImpedanceGrid, showAdmittanceOverlay],
  );

  function updateField(field: keyof VswrFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateType(type: string) {
    setForm((current) => ({
      ...current,
      type: type as VswrInputType,
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
        <VswrInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onTypeChange={updateType}
          onReset={resetForm}
        />
      }
      resultPanel={
        <VswrResultPanel calculation={calculation} copyText={copyText} />
      }
      diagramPanel={
        <VswrSmithChartPanel
          grid={smithChartData.grid}
          overlayCurves={smithChartData.overlayCurves}
          points={smithChartData.points}
          traces={smithChartData.traces}
          showImpedanceGrid={showImpedanceGrid}
          showAdmittanceOverlay={showAdmittanceOverlay}
          onShowImpedanceGridChange={setShowImpedanceGrid}
          onShowAdmittanceOverlayChange={setShowAdmittanceOverlay}
        />
      }
      formulaPanel={
        <FormulaBlock title="VSWR conversion">
          Gamma = (z - 1) / (z + 1); z = (1 + Gamma) / (1 - Gamma);
          VSWR = (1 + |Gamma|) / (1 - |Gamma|); y = 1 / z.
        </FormulaBlock>
      }
    />
  );
}

type VswrSmithChartPanelProps = ReturnType<typeof buildVswrSmithChartData> & {
  showImpedanceGrid: boolean;
  showAdmittanceOverlay: boolean;
  onShowImpedanceGridChange: (value: boolean) => void;
  onShowAdmittanceOverlayChange: (value: boolean) => void;
};

function VswrSmithChartPanel({
  grid,
  overlayCurves,
  points,
  traces,
  showImpedanceGrid,
  showAdmittanceOverlay,
  onShowImpedanceGridChange,
  onShowAdmittanceOverlayChange,
}: VswrSmithChartPanelProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Smith Chart
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Reflection coefficient, normalized impedance, and optional
            admittance overlay.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-slate-700 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showImpedanceGrid}
              onChange={(event) =>
                onShowImpedanceGridChange(event.currentTarget.checked)
              }
              className="h-4 w-4 accent-cyan-700"
            />
            show impedance grid
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAdmittanceOverlay}
              onChange={(event) =>
                onShowAdmittanceOverlayChange(event.currentTarget.checked)
              }
              className="h-4 w-4 accent-cyan-700"
            />
            show admittance overlay
          </label>
        </div>
      </div>

      <SmithChart
        grid={grid}
        overlayCurves={overlayCurves}
        points={points}
        traces={traces}
        title="VSWR Smith Chart"
      />
    </section>
  );
}

type VswrInputPanelProps = {
  form: VswrFormState;
  calculation: VswrCalculation;
  onChange: (field: keyof VswrFormState, value: string) => void;
  onTypeChange: (type: string) => void;
  onReset: () => void;
};

function VswrInputPanel({
  form,
  calculation,
  onChange,
  onTypeChange,
  onReset,
}: VswrInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Select one known quantity pair and enter the reference impedance.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="vswr-z0"
          label="Z0"
          value={form.z0Ohm}
          onChange={(value) => onChange("z0Ohm", value)}
          unit="Ohm"
          min={0}
          step={0.01}
        />
        <UnitSelect
          id="vswr-input-type"
          label="Input type"
          value={form.type}
          options={inputTypeOptions}
          onChange={onTypeChange}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {renderInputFields(form, onChange)}
      </div>

      <ValidationMessages
        errors={calculation.errors}
        warnings={calculation.warnings}
      />
    </div>
  );
}

function renderInputFields(
  form: VswrFormState,
  onChange: (field: keyof VswrFormState, value: string) => void,
) {
  switch (form.type) {
    case "vswr":
      return (
        <>
          <NumberInput
            id="vswr-value"
            label="VSWR"
            value={form.vswr}
            onChange={(value) => onChange("vswr", value)}
            min={1}
            step={0.01}
          />
          <NumberInput
            id="vswr-arg-gamma"
            label="arg(Gamma)"
            value={form.argGammaDeg}
            onChange={(value) => onChange("argGammaDeg", value)}
            unit="deg"
            step={0.01}
          />
        </>
      );
    case "gammaPolar":
      return (
        <>
          <NumberInput
            id="vswr-mag-gamma"
            label="|Gamma|"
            value={form.magGamma}
            onChange={(value) => onChange("magGamma", value)}
            min={0}
            max={0.999999}
            step={0.01}
          />
          <NumberInput
            id="vswr-gamma-polar-angle"
            label="arg(Gamma)"
            value={form.argGammaDeg}
            onChange={(value) => onChange("argGammaDeg", value)}
            unit="deg"
            step={0.01}
          />
        </>
      );
    case "gammaRect":
      return (
        <>
          <NumberInput
            id="vswr-re-gamma"
            label="Re(Gamma)"
            value={form.reGamma}
            onChange={(value) => onChange("reGamma", value)}
            step={0.01}
          />
          <NumberInput
            id="vswr-im-gamma"
            label="Im(Gamma)"
            value={form.imGamma}
            onChange={(value) => onChange("imGamma", value)}
            step={0.01}
          />
        </>
      );
    case "normalizedImpedance":
      return (
        <>
          <NumberInput
            id="vswr-r"
            label="r"
            value={form.r}
            onChange={(value) => onChange("r", value)}
            min={0}
            step={0.01}
          />
          <NumberInput
            id="vswr-x"
            label="x"
            value={form.x}
            onChange={(value) => onChange("x", value)}
            step={0.01}
          />
        </>
      );
    case "normalizedAdmittance":
      return (
        <>
          <NumberInput
            id="vswr-g"
            label="g"
            value={form.g}
            onChange={(value) => onChange("g", value)}
            min={0}
            step={0.01}
          />
          <NumberInput
            id="vswr-b"
            label="b"
            value={form.b}
            onChange={(value) => onChange("b", value)}
            step={0.01}
          />
        </>
      );
    case "impedance":
      return (
        <>
          <NumberInput
            id="vswr-r-ohm"
            label="R"
            value={form.rOhm}
            onChange={(value) => onChange("rOhm", value)}
            unit="Ohm"
            min={0}
            step={0.01}
          />
          <NumberInput
            id="vswr-x-ohm"
            label="X"
            value={form.xOhm}
            onChange={(value) => onChange("xOhm", value)}
            unit="Ohm"
            step={0.01}
          />
        </>
      );
    case "admittance":
      return (
        <>
          <NumberInput
            id="vswr-g-s"
            label="G"
            value={form.gS}
            onChange={(value) => onChange("gS", value)}
            unit="S"
            min={0}
            step={0.001}
          />
          <NumberInput
            id="vswr-b-s"
            label="B"
            value={form.bS}
            onChange={(value) => onChange("bS", value)}
            unit="S"
            step={0.001}
          />
        </>
      );
  }
}

type VswrResultPanelProps = {
  calculation: VswrCalculation;
  copyText?: string;
};

function VswrResultPanel({ calculation, copyText }: VswrResultPanelProps) {
  if (!calculation.value) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Results</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              VSWR, Gamma, impedance, and admittance will be shown after valid
              input.
            </p>
          </div>
          <CopyResultsButton text={copyText} />
        </div>
        <ResultTable
          rows={[]}
          emptyMessage="Enter valid VSWR conversion parameters to see results."
        />
      </div>
    );
  }

  const value = calculation.value;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Values are derived from the same reflection coefficient.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>

      <ResultTable
        rows={[
          { label: "VSWR", value: formatNumber(value.vswr, 4) },
          { label: "|Gamma|", value: formatNumber(value.magGamma, 4) },
          {
            label: "arg(Gamma)",
            value: formatNumber(value.argGammaDeg, 3),
            unit: "deg",
          },
        ]}
      />

      <div className="space-y-3">
        <ComplexResult label="Gamma" value={value.gamma} digits={4} />
        <ComplexResult label="z" value={value.z} digits={4} />
        <ComplexResult label="y" value={value.y} digits={4} />
        <ComplexResult label="Z" value={value.Z} digits={4} unit="Ohm" />
        <ComplexResult label="Y" value={value.Y} digits={6} unit="S" />
      </div>
    </div>
  );
}

function buildVswrSmithChartData(
  calculation: VswrCalculation,
  showImpedanceGrid: boolean,
  showAdmittanceOverlay: boolean,
) {
  const grid = generateSmithGrid({
    viewport: SMITH_VIEWPORT,
    samples: SMITH_SAMPLES,
    resistanceValues: showImpedanceGrid ? undefined : [],
    reactanceValues: showImpedanceGrid ? undefined : [],
  });
  const overlayCurves = showAdmittanceOverlay
    ? buildAdmittanceOverlayCurves()
    : [];

  if (!calculation.value) {
    return {
      grid,
      overlayCurves,
      points: [],
      traces: [],
    };
  }

  const value = calculation.value;
  const gammaPoint = svgPointFromGamma(value.gamma, SMITH_VIEWPORT);
  const admittanceGamma = gammaFromNormalizedAdmittance(value.y);
  const markers: SmithChartMarker[] = [
    {
      id: "gamma",
      label: "Gamma",
      point: gammaPoint,
      color: "#0891b2",
    },
    {
      id: "z",
      label: "z",
      point: svgPointFromGamma(value.gamma, SMITH_VIEWPORT),
      color: "#16a34a",
    },
  ];

  if (showAdmittanceOverlay) {
    markers.push({
      id: "y",
      label: "y",
      point: svgPointFromGamma(admittanceGamma, SMITH_VIEWPORT),
      color: "#a855f7",
    });
  }

  return {
    grid,
    overlayCurves,
    points: markers,
    traces: [
      {
        id: "constant-vswr",
        label: "constant VSWR",
        points: sampleConstantGammaCircle(value.magGamma, SMITH_SAMPLES).map(
          (gamma) => svgPointFromGamma(gamma, SMITH_VIEWPORT),
        ),
        color: "#f59e0b",
      },
    ],
  };
}

function buildAdmittanceOverlayCurves(): SmithGridCurve[] {
  return generateSmithGrid({
    viewport: SMITH_VIEWPORT,
    samples: SMITH_SAMPLES,
  })
    .curves.filter(
      (curve) => curve.kind === "resistance" || curve.kind === "reactance",
    )
    .map((curve) => ({
      ...curve,
      id: `admittance-${curve.id}`,
      label: `admittance ${curve.label}`,
      points: curve.points.map((point) => ({
        x: SMITH_VIEWPORT.centerX * 2 - point.x,
        y: SMITH_VIEWPORT.centerY * 2 - point.y,
      })),
    }));
}

function buildCopyText(
  title: string,
  form: VswrFormState,
  calculation: VswrCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  const value = calculation.value;

  return formatResultsText({
    title,
    inputs: vswrInputItems(form),
    sections: [
      {
        title: "Results",
        items: [
          { label: "VSWR", value: formatNumber(value.vswr, 4) },
          { label: "|Gamma|", value: formatNumber(value.magGamma, 4) },
          {
            label: "arg(Gamma)",
            value: formatNumber(value.argGammaDeg, 3),
            unit: "deg",
          },
          { label: "Gamma", value: formatComplex(value.gamma, 4) },
          { label: "z", value: formatComplex(value.z, 4) },
          { label: "y", value: formatComplex(value.y, 4) },
          { label: "Z", value: formatComplex(value.Z, 4), unit: "Ohm" },
          { label: "Y", value: formatComplex(value.Y, 6), unit: "S" },
        ],
      },
    ],
    warnings: calculation.warnings,
  });
}

function vswrInputItems(form: VswrFormState): ResultTextItem[] {
  const common = [
    { label: "Z0", value: form.z0Ohm, unit: "Ohm" },
    { label: "Input type", value: inputTypeLabel(form.type) },
  ];

  switch (form.type) {
    case "vswr":
      return [
        ...common,
        { label: "VSWR", value: form.vswr },
        { label: "arg(Gamma)", value: form.argGammaDeg, unit: "deg" },
      ];
    case "gammaPolar":
      return [
        ...common,
        { label: "|Gamma|", value: form.magGamma },
        { label: "arg(Gamma)", value: form.argGammaDeg, unit: "deg" },
      ];
    case "gammaRect":
      return [
        ...common,
        { label: "Re(Gamma)", value: form.reGamma },
        { label: "Im(Gamma)", value: form.imGamma },
      ];
    case "normalizedImpedance":
      return [
        ...common,
        { label: "r", value: form.r },
        { label: "x", value: form.x },
      ];
    case "normalizedAdmittance":
      return [
        ...common,
        { label: "g", value: form.g },
        { label: "b", value: form.b },
      ];
    case "impedance":
      return [
        ...common,
        { label: "R", value: form.rOhm, unit: "Ohm" },
        { label: "X", value: form.xOhm, unit: "Ohm" },
      ];
    case "admittance":
      return [
        ...common,
        { label: "G", value: form.gS, unit: "S" },
        { label: "B", value: form.bS, unit: "S" },
      ];
  }
}

function inputTypeLabel(type: VswrInputType): string {
  return inputTypeOptions.find((option) => option.value === type)?.label ?? type;
}

function buildInput(form: VswrFormState): VswrInput {
  const z0Ohm = parseNumericField(form.z0Ohm);

  switch (form.type) {
    case "vswr":
      return {
        type: form.type,
        z0Ohm,
        vswr: parseNumericField(form.vswr),
        argGammaDeg: parseNumericField(form.argGammaDeg),
      };
    case "gammaPolar":
      return {
        type: form.type,
        z0Ohm,
        magGamma: parseNumericField(form.magGamma),
        argGammaDeg: parseNumericField(form.argGammaDeg),
      };
    case "gammaRect":
      return {
        type: form.type,
        z0Ohm,
        reGamma: parseNumericField(form.reGamma),
        imGamma: parseNumericField(form.imGamma),
      };
    case "normalizedImpedance":
      return {
        type: form.type,
        z0Ohm,
        r: parseNumericField(form.r),
        x: parseNumericField(form.x),
      };
    case "normalizedAdmittance":
      return {
        type: form.type,
        z0Ohm,
        g: parseNumericField(form.g),
        b: parseNumericField(form.b),
      };
    case "impedance":
      return {
        type: form.type,
        z0Ohm,
        rOhm: parseNumericField(form.rOhm),
        xOhm: parseNumericField(form.xOhm),
      };
    case "admittance":
      return {
        type: form.type,
        z0Ohm,
        gS: parseNumericField(form.gS),
        bS: parseNumericField(form.bS),
      };
  }
}

function parseNumericField(value: string): number {
  if (value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}
