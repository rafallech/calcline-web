import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type SingleStubConfiguration =
  | "openSeries"
  | "shortSeries"
  | "openShunt"
  | "shortShunt";

export type SingleStubInput = {
  rL: number;
  xL: number;
  z0Ohm: number;
  configuration: SingleStubConfiguration;
};

export type SingleStubSolution = {
  dOverLambda: number;
  lOverLambda: number;
};

export type SingleStubResult = {
  solution1: SingleStubSolution;
  solution2: SingleStubSolution;
};

export type SingleStubCalculation = CalculatorCalculation<SingleStubResult>;

export function parT1(r: number, x: number, zy0: number): number {
  if (r === zy0) {
    return -x / (2 * zy0);
  }

  // docs/technical-spec.md: first tan(beta d) root for single-stub matching.
  return (x + Math.sqrt((r * ((zy0 - r) ** 2 + x ** 2)) / zy0)) / (r - zy0);
}

export function parT2(r: number, x: number, zy0: number): number {
  if (r === zy0) {
    return -x / (2 * zy0);
  }

  // docs/technical-spec.md: second tan(beta d) root for single-stub matching.
  return (x - Math.sqrt((r * ((zy0 - r) ** 2 + x ** 2)) / zy0)) / (r - zy0);
}

export function valD(t: number): number {
  // docs/technical-spec.md: convert tan(beta d) root to normalized line distance d/lambda.
  if (t < 0) {
    return (Math.PI + Math.atan(t)) / (2 * Math.PI);
  }

  return Math.atan(t) / (2 * Math.PI);
}

export function parBX(r: number, x: number, zy0: number, t: number): number {
  // docs/technical-spec.md: remaining susceptance/reactance term after moving distance d.
  return (
    (r ** 2 * t - (zy0 - x * t) * (x + zy0 * t)) /
    (zy0 * (r ** 2 + (x + zy0 * t) ** 2))
  );
}

export function calculateSingleStub(
  input: SingleStubInput,
): SingleStubCalculation {
  const errors = validateInput(input);
  const warnings: string[] = [];

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  const value = input.configuration.endsWith("Series")
    ? calculateSeries(input)
    : calculateShunt(input);

  if (!isFiniteResult(value)) {
    return calculationError(
      [
        ...errors,
        "Set input values that produce finite single-stub solutions.",
      ],
      warnings,
    );
  }

  return calculationOk(value, warnings);
}

function calculateShunt(input: SingleStubInput): SingleStubResult {
  const t1 = parT1(input.rL, input.xL, input.z0Ohm);
  const t2 = parT2(input.rL, input.xL, input.z0Ohm);
  const bx1 = parBX(input.rL, input.xL, input.z0Ohm, t1);
  const bx2 = parBX(input.rL, input.xL, input.z0Ohm, t2);

  return {
    solution1: {
      dOverLambda: valD(t1),
      lOverLambda: normalizeHalfWave(shuntStubLength(input.configuration, bx1, input.z0Ohm)),
    },
    solution2: {
      dOverLambda: valD(t2),
      lOverLambda: normalizeHalfWave(shuntStubLength(input.configuration, bx2, input.z0Ohm)),
    },
  };
}

function calculateSeries(input: SingleStubInput): SingleStubResult {
  const denominator = input.rL ** 2 + input.xL ** 2;
  const gL = input.rL / denominator;
  const bL = -input.xL / denominator;
  const y0 = 1 / input.z0Ohm;
  const t1 = parT1(gL, bL, y0);
  const t2 = parT2(gL, bL, y0);
  const bx1 = parBX(gL, bL, y0, t1);
  const bx2 = parBX(gL, bL, y0, t2);

  return {
    solution1: {
      dOverLambda: valD(t1),
      lOverLambda: normalizeHalfWave(seriesStubLength(input.configuration, bx1, input.z0Ohm)),
    },
    solution2: {
      dOverLambda: valD(t2),
      lOverLambda: normalizeHalfWave(seriesStubLength(input.configuration, bx2, input.z0Ohm)),
    },
  };
}

function shuntStubLength(
  configuration: SingleStubConfiguration,
  bx: number,
  z0Ohm: number,
): number {
  // docs/technical-spec.md: shunt open/short stub length from cancellation susceptance.
  if (configuration === "openShunt") {
    return -Math.atan(z0Ohm * bx) / (2 * Math.PI);
  }

  return Math.atan(1 / (z0Ohm * bx)) / (2 * Math.PI);
}

function seriesStubLength(
  configuration: SingleStubConfiguration,
  bx: number,
  z0Ohm: number,
): number {
  // docs/technical-spec.md: series open/short stub length from cancellation reactance.
  if (configuration === "openSeries") {
    return Math.atan(z0Ohm / bx) / (2 * Math.PI);
  }

  return -Math.atan(bx / z0Ohm) / (2 * Math.PI);
}

function normalizeHalfWave(value: number): number {
  return value < 0 ? value + 0.5 : value;
}

function validateInput(input: SingleStubInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.rL) || input.rL < 0) {
    errors.push("Set R_L >= 0 Ohm.");
  }

  if (!Number.isFinite(input.xL)) {
    errors.push("Set X_L as a finite number.");
  }

  if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  if (!isSingleStubConfiguration(input.configuration)) {
    errors.push("Select a valid single-stub configuration.");
  }

  if (
    input.configuration.endsWith("Series") &&
    input.rL === 0 &&
    input.xL === 0
  ) {
    errors.push("Set a non-zero load impedance for series stub matching.");
  }

  return errors;
}

function isSingleStubConfiguration(
  value: SingleStubConfiguration,
): value is SingleStubConfiguration {
  return (
    value === "openSeries" ||
    value === "shortSeries" ||
    value === "openShunt" ||
    value === "shortShunt"
  );
}

function isFiniteResult(result: SingleStubResult): boolean {
  return (
    Number.isFinite(result.solution1.dOverLambda) &&
    Number.isFinite(result.solution1.lOverLambda) &&
    Number.isFinite(result.solution2.dOverLambda) &&
    Number.isFinite(result.solution2.lOverLambda)
  );
}
