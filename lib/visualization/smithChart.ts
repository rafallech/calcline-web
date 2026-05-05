import {
  abs as complexAbs,
  add,
  argDeg,
  div,
  fromPolar,
  isFiniteComplex,
  sub,
  type Complex,
} from "@/lib/math/complex";

export type SvgPoint = {
  x: number;
  y: number;
};

export type SmithChartViewport = {
  centerX: number;
  centerY: number;
  radius: number;
};

export type SmithGridCurveKind =
  | "outerCircle"
  | "realAxis"
  | "resistance"
  | "reactance";

export type SmithGridCurve = {
  id: string;
  label: string;
  kind: SmithGridCurveKind;
  detail: "major" | "minor";
  value?: number;
  points: SvgPoint[];
};

export type SmithGridLabel = {
  id: string;
  text: string;
  point: SvgPoint;
  kind: "resistance" | "reactance";
};

export type SmithGridOptions = {
  viewport?: SmithChartViewport;
  samples?: number;
  resistanceValues?: number[];
  reactanceValues?: number[];
  minorResistanceValues?: number[];
  minorReactanceValues?: number[];
  showLabels?: boolean;
};

export type SmithGridData = {
  viewport: SmithChartViewport;
  curves: SmithGridCurve[];
  labels: SmithGridLabel[];
};

export type SelectedSmithPointMode = "normalized" | "withZ0";

export type SelectedSmithPoint = {
  gamma: Complex;
  magGamma: number;
  angleGammaDeg: number;
  normalizedImpedance?: Complex;
  normalizedAdmittance?: Complex;
  swr?: number;
  returnLossDb?: number;
  impedanceOhm?: Complex;
  admittanceS?: Complex;
  warnings: string[];
};

export type FormattedSelectedSmithPoint = {
  gamma: string;
  magGamma: string;
  angleGammaDeg: string;
  normalizedImpedance?: string;
  normalizedAdmittance?: string;
  swr?: string;
  returnLossDb: string;
  impedanceOhm?: string;
  admittanceS?: string;
  warnings: string[];
  copyText: string;
};

const ONE: Complex = { re: 1, im: 0 };
const DEFAULT_VIEWPORT: SmithChartViewport = {
  centerX: 0,
  centerY: 0,
  radius: 1,
};
const DEFAULT_RESISTANCE_VALUES = [0.2, 0.5, 1, 2, 5];
const DEFAULT_REACTANCE_VALUES = [0.2, 0.5, 1, 2, 5];
const DEFAULT_MINOR_RESISTANCE_VALUES = [0.1, 0.3, 0.4, 0.7, 1.5, 3, 10];
const DEFAULT_MINOR_REACTANCE_VALUES = [0.1, 0.3, 0.4, 0.7, 1.5, 3, 10];
const DEFAULT_SAMPLES = 361;
const MIN_SAMPLES = 2;
const EPSILON = 1e-12;
const PASSIVE_BOUNDARY_WARNING_MAGNITUDE = 0.95;

export function gammaFromNormalizedImpedance(z: Complex): Complex {
  return div(sub(z, ONE), add(z, ONE));
}

export function normalizedImpedanceFromGamma(gamma: Complex): Complex {
  return div(add(ONE, gamma), sub(ONE, gamma));
}

export function normalizedAdmittanceFromImpedance(z: Complex): Complex {
  return div(ONE, z);
}

export function normalizedImpedanceFromAdmittance(y: Complex): Complex {
  return div(ONE, y);
}

export function gammaFromNormalizedAdmittance(y: Complex): Complex {
  return gammaFromNormalizedImpedance(normalizedImpedanceFromAdmittance(y));
}

export function normalizedAdmittanceFromGamma(gamma: Complex): Complex {
  return normalizedAdmittanceFromImpedance(
    normalizedImpedanceFromGamma(gamma),
  );
}

export function svgPointToGamma(
  point: SvgPoint,
  viewport: SmithChartViewport = DEFAULT_VIEWPORT,
): Complex {
  return gammaFromSvgPoint(point, viewport);
}

export function isPointInsideSmithChart(
  point: SvgPoint,
  viewport: SmithChartViewport = DEFAULT_VIEWPORT,
): boolean {
  if (
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y) ||
    !Number.isFinite(viewport.centerX) ||
    !Number.isFinite(viewport.centerY) ||
    !Number.isFinite(viewport.radius) ||
    viewport.radius <= 0
  ) {
    return false;
  }

  return (
    Math.hypot(point.x - viewport.centerX, point.y - viewport.centerY) <
    viewport.radius
  );
}

export function gammaToNormalizedImpedance(gamma: Complex): Complex | null {
  if (!isFiniteComplex(gamma) || complexAbs(gamma) >= 1) {
    return null;
  }

  return normalizedImpedanceFromGamma(gamma);
}

export function gammaToNormalizedAdmittance(gamma: Complex): Complex | null {
  const z = gammaToNormalizedImpedance(gamma);

  return z ? normalizedAdmittanceFromImpedance(z) : null;
}

export function gammaToSWR(gamma: Complex): number | null {
  if (!isFiniteComplex(gamma)) {
    return null;
  }

  const magGamma = complexAbs(gamma);

  if (magGamma >= 1) {
    return null;
  }

  return (1 + magGamma) / (1 - magGamma);
}

export function gammaToReturnLossDb(gamma: Complex): number {
  const magGamma = complexAbs(gamma);

  if (magGamma === 0) {
    return Infinity;
  }

  return -20 * Math.log10(magGamma);
}

export function formatSelectedSmithPoint({
  gamma,
  z0Ohm,
  mode = "normalized",
  digits = 4,
}: {
  gamma: Complex;
  z0Ohm?: number;
  mode?: SelectedSmithPointMode;
  digits?: number;
}): FormattedSelectedSmithPoint {
  const point = calculateSelectedSmithPoint(gamma, z0Ohm, mode);
  const rows = [
    `Gamma = ${formatComplexForSmith(point.gamma, digits)}`,
    `|Gamma| = ${formatScalarForSmith(point.magGamma, digits)}`,
    `angle(Gamma) = ${formatScalarForSmith(point.angleGammaDeg, digits)} deg`,
  ];

  if (point.normalizedImpedance) {
    rows.push(
      `z = ${formatComplexForSmith(point.normalizedImpedance, digits)}`,
    );
  }

  if (point.normalizedAdmittance) {
    rows.push(
      `y = ${formatComplexForSmith(point.normalizedAdmittance, digits)}`,
    );
  }

  if (point.swr !== undefined) {
    rows.push(`SWR = ${formatScalarForSmith(point.swr, digits)}`);
  }

  rows.push(`Return loss = ${formatReturnLoss(point.returnLossDb, digits)}`);

  if (point.impedanceOhm) {
    rows.push(`Z = ${formatComplexForSmith(point.impedanceOhm, digits)} Ohm`);
  }

  if (point.admittanceS) {
    rows.push(`Y = ${formatComplexForSmith(point.admittanceS, digits)} S`);
  }

  for (const warning of point.warnings) {
    rows.push(`Warning: ${warning}`);
  }

  return {
    gamma: formatComplexForSmith(point.gamma, digits),
    magGamma: formatScalarForSmith(point.magGamma, digits),
    angleGammaDeg: formatScalarForSmith(point.angleGammaDeg, digits),
    normalizedImpedance: point.normalizedImpedance
      ? formatComplexForSmith(point.normalizedImpedance, digits)
      : undefined,
    normalizedAdmittance: point.normalizedAdmittance
      ? formatComplexForSmith(point.normalizedAdmittance, digits)
      : undefined,
    swr:
      point.swr === undefined
        ? undefined
        : formatScalarForSmith(point.swr, digits),
    returnLossDb: formatReturnLoss(point.returnLossDb, digits),
    impedanceOhm: point.impedanceOhm
      ? formatComplexForSmith(point.impedanceOhm, digits)
      : undefined,
    admittanceS: point.admittanceS
      ? formatComplexForSmith(point.admittanceS, digits)
      : undefined,
    warnings: point.warnings,
    copyText: rows.join("\n"),
  };
}

export function isDrawableGamma(gamma: Complex): boolean {
  return isFiniteComplex(gamma) && complexAbs(gamma) < 1;
}

export function chartPointFromGamma(gamma: Complex): SvgPoint {
  return {
    x: gamma.re,
    y: -gamma.im,
  };
}

export function svgPointFromGamma(
  gamma: Complex,
  viewport: SmithChartViewport = DEFAULT_VIEWPORT,
): SvgPoint {
  return {
    x: viewport.centerX + gamma.re * viewport.radius,
    y: viewport.centerY - gamma.im * viewport.radius,
  };
}

export function gammaFromChartPoint(point: SvgPoint): Complex {
  return {
    re: point.x,
    im: -point.y,
  };
}

export function gammaFromSvgPoint(
  point: SvgPoint,
  viewport: SmithChartViewport = DEFAULT_VIEWPORT,
): Complex {
  return {
    re: (point.x - viewport.centerX) / viewport.radius,
    im: -(point.y - viewport.centerY) / viewport.radius,
  };
}

export function sampleConstantGammaCircle(
  magnitude: number,
  samples = DEFAULT_SAMPLES,
): Complex[] {
  if (!Number.isFinite(magnitude) || magnitude < 0) {
    return [];
  }

  const count = normalizeSampleCount(samples);

  return Array.from({ length: count }, (_, index) =>
    fromPolar(magnitude, (360 * index) / (count - 1)),
  );
}

export function sampleTransmissionLineTrace(
  startGamma: Complex,
  distanceOverLambda: number,
  samples = DEFAULT_SAMPLES,
): Complex[] {
  if (
    !isFiniteComplex(startGamma) ||
    !Number.isFinite(distanceOverLambda)
  ) {
    return [];
  }

  const count = normalizeSampleCount(samples);

  return Array.from({ length: count }, (_, index) => {
    const fraction = index / (count - 1);
    const angleDeg = -720 * distanceOverLambda * fraction;

    return rotateGamma(startGamma, angleDeg);
  });
}

export function generateSmithGrid(
  options: SmithGridOptions = {},
): SmithGridData {
  const viewport = options.viewport ?? DEFAULT_VIEWPORT;
  const samples = normalizeSampleCount(options.samples ?? DEFAULT_SAMPLES);
  const resistanceValues = filterNonNegativeFinite(
    options.resistanceValues ?? DEFAULT_RESISTANCE_VALUES,
  );
  const reactanceValues = filterPositiveFinite(
    options.reactanceValues ?? DEFAULT_REACTANCE_VALUES,
  );
  const minorResistanceValues = withoutValues(
    filterPositiveFinite(
      options.minorResistanceValues ??
        (options.resistanceValues === undefined
          ? DEFAULT_MINOR_RESISTANCE_VALUES
          : []),
    ),
    resistanceValues,
  );
  const minorReactanceValues = withoutValues(
    filterPositiveFinite(
      options.minorReactanceValues ??
        (options.reactanceValues === undefined
          ? DEFAULT_MINOR_REACTANCE_VALUES
          : []),
    ),
    reactanceValues,
  );
  const showLabels = options.showLabels ?? true;
  const curves = [
    makeOuterCircleCurve(viewport, samples),
    makeRealAxisCurve(viewport),
    ...minorResistanceValues.map((value) =>
      makeResistanceCurve(value, viewport, samples, "minor"),
    ),
    ...minorReactanceValues.flatMap((value) => [
      makeReactanceCurve(value, viewport, samples, "minor"),
      makeReactanceCurve(-value, viewport, samples, "minor"),
    ]),
    ...resistanceValues.map((value) =>
      makeResistanceCurve(value, viewport, samples, "major"),
    ),
    ...reactanceValues.flatMap((value) => [
      makeReactanceCurve(value, viewport, samples, "major"),
      makeReactanceCurve(-value, viewport, samples, "major"),
    ]),
  ];

  return {
    viewport,
    curves,
    labels: showLabels
      ? makeGridLabels(viewport, resistanceValues, reactanceValues)
      : [],
  };
}

function rotateGamma(gamma: Complex, angleDeg: number): Complex {
  const angleRad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  return {
    re: gamma.re * cos - gamma.im * sin,
    im: gamma.re * sin + gamma.im * cos,
  };
}

function calculateSelectedSmithPoint(
  gamma: Complex,
  z0Ohm?: number,
  mode: SelectedSmithPointMode = "normalized",
): SelectedSmithPoint {
  const magGamma = complexAbs(gamma);
  const warnings: string[] = [];
  const point: SelectedSmithPoint = {
    gamma,
    magGamma,
    angleGammaDeg: argDeg(gamma),
    warnings,
  };

  if (!isFiniteComplex(gamma) || magGamma >= 1) {
    warnings.push(
      "Selected point is on or outside the passive Smith chart boundary.",
    );
    return point;
  }

  if (magGamma > PASSIVE_BOUNDARY_WARNING_MAGNITUDE) {
    warnings.push("Point is close to the chart boundary. SWR is very high.");
  }

  const z = normalizedImpedanceFromGamma(gamma);
  const y = normalizedAdmittanceFromImpedance(z);

  point.normalizedImpedance = z;
  point.normalizedAdmittance = y;
  point.swr = (1 + magGamma) / (1 - magGamma);
  point.returnLossDb = gammaToReturnLossDb(gamma);

  if (mode === "withZ0" && z0Ohm !== undefined && z0Ohm > 0) {
    point.impedanceOhm = scaleComplex(z, z0Ohm);
    point.admittanceS = scaleComplex(y, 1 / z0Ohm);
  }

  return point;
}

function scaleComplex(value: Complex, scalar: number): Complex {
  return {
    re: value.re * scalar,
    im: value.im * scalar,
  };
}

function formatComplexForSmith(value: Complex, digits: number): string {
  const re = formatScalarForSmith(normalizeZero(value.re), digits);
  const imAbs = formatScalarForSmith(Math.abs(normalizeZero(value.im)), digits);
  const sign = value.im < 0 ? "-" : "+";

  return `${re} ${sign} j${imAbs}`;
}

function formatScalarForSmith(value: number, digits: number): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  const fixed = normalizeZero(value).toFixed(digits);

  return fixed.replace(/\.?0+$/u, "");
}

function formatReturnLoss(value: number | undefined, digits: number): string {
  if (value === undefined) {
    return "not available";
  }

  if (value === Infinity) {
    return "infinity (ideal match)";
  }

  return `${formatScalarForSmith(value, digits)} dB`;
}

function normalizeZero(value: number): number {
  return Math.abs(value) < EPSILON ? 0 : value;
}

function makeOuterCircleCurve(
  viewport: SmithChartViewport,
  samples: number,
): SmithGridCurve {
  return {
    id: "outer-circle",
    label: "|Gamma| = 1",
    kind: "outerCircle",
    detail: "major",
    value: 1,
    points: sampleConstantGammaCircle(1, samples).map((gamma) =>
      svgPointFromGamma(gamma, viewport),
    ),
  };
}

function makeRealAxisCurve(viewport: SmithChartViewport): SmithGridCurve {
  return {
    id: "real-axis",
    label: "x = 0",
    kind: "realAxis",
    detail: "major",
    value: 0,
    points: [
      svgPointFromGamma({ re: -1, im: 0 }, viewport),
      svgPointFromGamma({ re: 1, im: 0 }, viewport),
    ],
  };
}

function makeResistanceCurve(
  resistance: number,
  viewport: SmithChartViewport,
  samples: number,
  detail: SmithGridCurve["detail"],
): SmithGridCurve {
  const center = resistance / (resistance + 1);
  const radius = 1 / (resistance + 1);
  const points = linspace(0, 360, samples).map((angleDeg) =>
    svgPointFromGamma(
      {
        re: center + radius * Math.cos((angleDeg * Math.PI) / 180),
        im: radius * Math.sin((angleDeg * Math.PI) / 180),
      },
      viewport,
    ),
  );

  return {
    id: `resistance-${formatCurveIdValue(resistance)}`,
    label: `r = ${resistance}`,
    kind: "resistance",
    detail,
    value: resistance,
    points,
  };
}

function makeReactanceCurve(
  reactance: number,
  viewport: SmithChartViewport,
  samples: number,
  detail: SmithGridCurve["detail"],
): SmithGridCurve {
  const center = { re: 1, im: 1 / reactance };
  const radius = Math.abs(1 / reactance);
  const start = gammaFromNormalizedImpedance({ re: 0, im: reactance });
  const tangent = { re: 1, im: 0 };
  const startAngle = Math.atan2(start.im - center.im, start.re - center.re);
  let endAngle = Math.atan2(tangent.im - center.im, tangent.re - center.re);

  if (reactance > 0 && endAngle <= startAngle) {
    endAngle += Math.PI * 2;
  }

  if (reactance < 0 && endAngle >= startAngle) {
    endAngle -= Math.PI * 2;
  }

  const points = linspace(startAngle, endAngle, samples).map((angle) =>
    svgPointFromGamma(
      {
        re: center.re + radius * Math.cos(angle),
        im: center.im + radius * Math.sin(angle),
      },
      viewport,
    ),
  );

  return {
    id: `reactance-${formatCurveIdValue(reactance)}`,
    label: `x = ${reactance}`,
    kind: "reactance",
    detail,
    value: reactance,
    points,
  };
}

function makeGridLabels(
  viewport: SmithChartViewport,
  resistanceValues: number[],
  reactanceValues: number[],
): SmithGridLabel[] {
  return [
    ...resistanceValues.map((value) => ({
      id: `label-r-${formatCurveIdValue(value)}`,
      text: formatLabelValue(value),
      point: svgPointFromGamma(
        gammaFromNormalizedImpedance({ re: value, im: 0 }),
        viewport,
      ),
      kind: "resistance" as const,
    })),
    ...reactanceValues.flatMap((value) => [
      makeReactanceLabel(value, viewport),
      makeReactanceLabel(-value, viewport),
    ]),
  ];
}

function makeReactanceLabel(
  reactance: number,
  viewport: SmithChartViewport,
): SmithGridLabel {
  return {
    id: `label-x-${formatCurveIdValue(reactance)}`,
    text: `${reactance > 0 ? "+" : ""}${formatLabelValue(reactance)}`,
    point: svgPointFromGamma(
      gammaFromNormalizedImpedance({ re: 0.08, im: reactance }),
      viewport,
    ),
    kind: "reactance",
  };
}

function linspace(start: number, end: number, samples: number): number[] {
  if (samples === 1) {
    return [start];
  }

  const step = (end - start) / (samples - 1);

  return Array.from({ length: samples }, (_, index) => start + step * index);
}

function normalizeSampleCount(samples: number): number {
  if (!Number.isFinite(samples)) {
    return DEFAULT_SAMPLES;
  }

  return Math.max(MIN_SAMPLES, Math.floor(samples));
}

function filterNonNegativeFinite(values: number[]): number[] {
  return values.filter((value) => Number.isFinite(value) && value >= 0);
}

function filterPositiveFinite(values: number[]): number[] {
  return values.filter((value) => Number.isFinite(value) && value > 0);
}

function withoutValues(values: number[], excluded: number[]): number[] {
  return values.filter(
    (value) => !excluded.some((excludedValue) => closeTo(value, excludedValue)),
  );
}

function closeTo(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

function formatCurveIdValue(value: number): string {
  const normalized = Math.abs(value) < EPSILON ? 0 : value;

  return String(normalized).replace("-", "minus-").replace(".", "-");
}

function formatLabelValue(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}
