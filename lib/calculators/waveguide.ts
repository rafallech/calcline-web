import { roundTo } from "@/lib/math/format";
import { mmToM } from "@/lib/math/units";
import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

const SPEED_OF_LIGHT_M_PER_S = 300_000_000;
const GHZ = 1_000_000_000;

export type WaveguideInput = {
  aMm: number;
  bMm: number;
  epsR: number;
  m: number;
  n: number;
};

export type WaveguideResult = {
  fc10: number;
  fc20: number;
  fc30: number;
  fc01: number;
  fc02: number;
  fc03: number;
  fc11: number;
  fc12: number;
  fc13: number;
  fcmn: number;
  unit: "GHz";
};

export type WaveguideCalculation = CalculatorCalculation<WaveguideResult>;

export function calculateRectangularWaveguide(
  input: WaveguideInput,
): WaveguideCalculation {
  const errors = validateInput(input);
  const warnings: string[] = [];

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  if (input.m === 0 && input.n === 0) {
    warnings.push("Mode indices m and n are both 0, so fcmn is 0 GHz.");
  }

  const aM = mmToM(input.aMm);
  const bM = mmToM(input.bMm);
  const cutoff = (m: number, n: number) =>
    roundTo(cutoffFrequencyGHz(aM, bM, input.epsR, m, n), 3);

  return calculationOk(
    {
      fc10: cutoff(1, 0),
      fc20: cutoff(2, 0),
      fc30: cutoff(3, 0),
      fc01: cutoff(0, 1),
      fc02: cutoff(0, 2),
      fc03: cutoff(0, 3),
      fc11: cutoff(1, 1),
      fc12: cutoff(1, 2),
      fc13: cutoff(1, 3),
      fcmn: cutoff(input.m, input.n),
      unit: "GHz",
    },
    warnings,
  );
}

export function cutoffFrequencyGHz(
  aM: number,
  bM: number,
  epsR: number,
  m: number,
  n: number,
): number {
  // docs/technical-spec.md: rectangular waveguide cutoff, fc_mn = c/(2 sqrt(eps_r)) * sqrt((m/a)^2 + (n/b)^2).
  const modeTerm = Math.hypot(m / aM, n / bM);

  return SPEED_OF_LIGHT_M_PER_S / (2 * Math.sqrt(epsR)) / GHZ * modeTerm;
}

function validateInput(input: WaveguideInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.aMm) || input.aMm <= 0) {
    errors.push("Set a > 0 mm.");
  }

  if (!Number.isFinite(input.bMm) || input.bMm <= 0) {
    errors.push("Set b > 0 mm.");
  }

  if (!Number.isFinite(input.epsR) || input.epsR < 1) {
    errors.push("Set eps_r >= 1.");
  }

  if (!Number.isInteger(input.m) || input.m < 0) {
    errors.push("Set m as a non-negative integer.");
  }

  if (!Number.isInteger(input.n) || input.n < 0) {
    errors.push("Set n as a non-negative integer.");
  }

  return errors;
}
