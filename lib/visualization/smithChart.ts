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
  value?: number;
  points: SvgPoint[];
};

export type SmithGridOptions = {
  viewport?: SmithChartViewport;
  samples?: number;
  resistanceValues?: number[];
  reactanceValues?: number[];
  maxResistance?: number;
  maxReactance?: number;
};

export type SmithGridData = {
  viewport: SmithChartViewport;
  curves: SmithGridCurve[];
};

const ONE: Complex = { re: 1, im: 0 };
const DEFAULT_VIEWPORT: SmithChartViewport = {
  centerX: 0,
  centerY: 0,
  radius: 1,
};
const DEFAULT_RESISTANCE_VALUES = [0.2, 0.5, 1, 2, 5];
const DEFAULT_REACTANCE_VALUES = [0.2, 0.5, 1, 2, 5];
const DEFAULT_SAMPLES = 97;
const DEFAULT_MAX_RESISTANCE = 25;
const DEFAULT_MAX_REACTANCE = 25;
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
  const maxResistance = finitePositiveOrDefault(
    options.maxResistance,
    DEFAULT_MAX_RESISTANCE,
  );
  const maxReactance = finitePositiveOrDefault(
    options.maxReactance,
    DEFAULT_MAX_REACTANCE,
  );
  const resistanceValues = filterNonNegativeFinite(
    options.resistanceValues ?? DEFAULT_RESISTANCE_VALUES,
  );
  const reactanceValues = filterPositiveFinite(
    options.reactanceValues ?? DEFAULT_REACTANCE_VALUES,
  );

  return {
    viewport,
    curves: [
      makeOuterCircleCurve(viewport, samples),
      makeRealAxisCurve(viewport),
      ...resistanceValues.map((value) =>
        makeResistanceCurve(value, viewport, samples, maxReactance),
      ),
      ...reactanceValues.flatMap((value) => [
        makeReactanceCurve(value, viewport, samples, maxResistance),
        makeReactanceCurve(-value, viewport, samples, maxResistance),
      ]),
    ],
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
  maxReactance: number,
): SmithGridCurve {
  const points = linspace(-maxReactance, maxReactance, samples)
    .map((reactance) =>
      gammaFromNormalizedImpedance({ re: resistance, im: reactance }),
    )
    .filter(isFiniteComplex)
    .map((gamma) => svgPointFromGamma(gamma, viewport));

  return {
    id: `resistance-${formatCurveIdValue(resistance)}`,
    label: `r = ${resistance}`,
    kind: "resistance",
    value: resistance,
    points,
  };
}

function makeReactanceCurve(
  reactance: number,
  viewport: SmithChartViewport,
  samples: number,
  maxResistance: number,
): SmithGridCurve {
  const points = linspace(0, maxResistance, samples)
    .map((resistance) =>
      gammaFromNormalizedImpedance({ re: resistance, im: reactance }),
    )
    .filter(isFiniteComplex)
    .map((gamma) => svgPointFromGamma(gamma, viewport));

  return {
    id: `reactance-${formatCurveIdValue(reactance)}`,
    label: `x = ${reactance}`,
    kind: "reactance",
    value: reactance,
    points,
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

function finitePositiveOrDefault(
  value: number | undefined,
  fallback: number,
): number {
  return value !== undefined && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function filterNonNegativeFinite(values: number[]): number[] {
  return values.filter((value) => Number.isFinite(value) && value >= 0);
}

function filterPositiveFinite(values: number[]): number[] {
  return values.filter((value) => Number.isFinite(value) && value > 0);
}

function formatCurveIdValue(value: number): string {
  const normalized = Math.abs(value) < EPSILON ? 0 : value;

  return String(normalized).replace("-", "minus-").replace(".", "-");
}
