import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";
import { MHzToHz } from "@/lib/math/units";

export type LMatchInput = {
  rL: number;
  xL: number;
  z0Ohm: number;
  fMHz: number;
};

export type LMatchElementType = "Ls" | "Cs" | "Lp" | "Cp";

export type LMatchElement = {
  type: LMatchElementType;
  value: number;
  unit: "nH" | "pF";
};

export type LMatchSolution = {
  xOhm: number;
  bS: number;
  bMs: number;
  seriesElement: LMatchElement;
  parallelElement: LMatchElement;
};

export type LMatchResult = {
  solution1: LMatchSolution;
  solution2: LMatchSolution;
};

export type LMatchCalculation = CalculatorCalculation<LMatchResult>;

export function calculateLMatch(input: LMatchInput): LMatchCalculation {
  const errors = validateInput(input);
  const warnings: string[] = [];

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  const result =
    input.rL >= input.z0Ohm
      ? calculateForGreaterOrEqualLoad(input, errors)
      : calculateForSmallerLoad(input, errors);

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  if (!result || !isFiniteResult(result)) {
    return calculationError(
      [
        ...errors,
        "Set input values that produce finite L-section matching solutions.",
      ],
      warnings,
    );
  }

  return calculationOk(result, warnings);
}

function calculateForGreaterOrEqualLoad(
  input: LMatchInput,
  errors: string[],
): LMatchResult | undefined {
  const denominator = input.rL ** 2 + input.xL ** 2;
  const radicand = input.rL ** 2 + input.xL ** 2 - input.z0Ohm * input.rL;
  const root = checkedSqrt(radicand, "R_L^2 + X_L^2 - Z0 R_L", errors);

  if (!Number.isFinite(root) || denominator === 0) {
    return undefined;
  }

  // docs/technical-spec.md: L-section branch for R_L >= Z0, solving the two shunt susceptance options.
  const scale = Math.sqrt(input.rL / input.z0Ohm) * root;
  const b1 = (input.xL + scale) / denominator;
  const b2 = (input.xL - scale) / denominator;

  return {
    solution1: solutionFromXB(wiekszyX(input, b1), b1, input.fMHz),
    solution2: solutionFromXB(wiekszyX(input, b2), b2, input.fMHz),
  };
}

function calculateForSmallerLoad(
  input: LMatchInput,
  errors: string[],
): LMatchResult | undefined {
  const xRadicand = input.rL * (input.z0Ohm - input.rL);
  const bRadicand = (input.z0Ohm - input.rL) / input.rL;
  const xRoot = checkedSqrt(xRadicand, "R_L (Z0 - R_L)", errors);
  const bRoot = checkedSqrt(bRadicand, "(Z0 - R_L) / R_L", errors);

  if (!Number.isFinite(xRoot) || !Number.isFinite(bRoot)) {
    return undefined;
  }

  const b1 = bRoot / input.z0Ohm;
  const b2 = -bRoot / input.z0Ohm;
  // docs/technical-spec.md: L-section branch for R_L < Z0, solving the two series reactance options.
  const x1 = xRoot - input.xL;
  const x2 = -xRoot - input.xL;

  return {
    solution1: solutionFromXB(x1, b1, input.fMHz),
    solution2: solutionFromXB(x2, b2, input.fMHz),
  };
}

function wiekszyX(input: LMatchInput, b: number): number {
  // docs/technical-spec.md: series reactance paired with the selected shunt susceptance for R_L >= Z0.
  return 1 / b + (input.xL * input.z0Ohm) / input.rL - input.z0Ohm / (b * input.rL);
}

function solutionFromXB(xOhm: number, bS: number, fMHz: number): LMatchSolution {
  return {
    xOhm,
    bS,
    bMs: bS * 1000,
    seriesElement: seriesElementFromX(xOhm, fMHz),
    parallelElement: parallelElementFromB(bS, fMHz),
  };
}

function seriesElementFromX(xOhm: number, fMHz: number): LMatchElement {
  const omega = angularFrequency(fMHz);

  // docs/technical-spec.md: convert series reactance X to Ls or Cs at the requested frequency.
  if (xOhm > 0) {
    return {
      type: "Ls",
      value: (xOhm / omega) * 1e9,
      unit: "nH",
    };
  }

  return {
    type: "Cs",
    value: (1 / (omega * Math.abs(xOhm))) * 1e12,
    unit: "pF",
  };
}

function parallelElementFromB(bS: number, fMHz: number): LMatchElement {
  const omega = angularFrequency(fMHz);

  // docs/technical-spec.md: convert shunt susceptance B to Lp or Cp at the requested frequency.
  if (bS < 0) {
    return {
      type: "Lp",
      value: (1 / (Math.abs(bS) * omega)) * 1e9,
      unit: "nH",
    };
  }

  return {
    type: "Cp",
    value: (bS / omega) * 1e12,
    unit: "pF",
  };
}

function angularFrequency(fMHz: number): number {
  return 2 * Math.PI * MHzToHz(fMHz);
}

function checkedSqrt(
  value: number,
  expression: string,
  errors: string[],
): number {
  if (value < 0) {
    errors.push(`Cannot calculate square root of negative ${expression}.`);
    return Number.NaN;
  }

  return Math.sqrt(value);
}

function validateInput(input: LMatchInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  if (!Number.isFinite(input.rL) || input.rL < 0) {
    errors.push("Set R_L >= 0 Ohm.");
  } else if (input.rL === 0) {
    errors.push("Set R_L > 0 Ohm for L-section matching.");
  }

  if (!Number.isFinite(input.xL)) {
    errors.push("Set X_L as a finite number.");
  }

  if (!Number.isFinite(input.fMHz) || input.fMHz <= 0) {
    errors.push("Set f > 0 MHz.");
  }

  return errors;
}

function isFiniteResult(result: LMatchResult): boolean {
  return (
    isFiniteSolution(result.solution1) && isFiniteSolution(result.solution2)
  );
}

function isFiniteSolution(solution: LMatchSolution): boolean {
  return (
    Number.isFinite(solution.xOhm) &&
    Number.isFinite(solution.bS) &&
    Number.isFinite(solution.bMs) &&
    Number.isFinite(solution.seriesElement.value) &&
    Number.isFinite(solution.parallelElement.value)
  );
}
