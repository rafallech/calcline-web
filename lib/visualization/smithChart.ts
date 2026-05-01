import {
  abs as complexAbs,
  add,
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
