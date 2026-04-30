import { div, type Complex } from "@/lib/math/complex";
import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type LoadImpedanceMinimumType = "voltage" | "current";

export type LoadImpedanceInput = {
  lambdaMm: number;
  swr: number;
  dMm: number;
  minimumType: LoadImpedanceMinimumType;
};

export type LoadImpedanceResult = {
  zL: Complex;
  r: number;
  x: number;
};

export type LoadImpedanceCalculation =
  CalculatorCalculation<LoadImpedanceResult>;

export function calculateLoadImpedance(
  input: LoadImpedanceInput,
): LoadImpedanceCalculation {
  const errors = validateInput(input);
  const warnings: string[] = [];

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  const betaD = (2 * Math.PI * input.dMm) / input.lambdaMm;
  const t = Math.tan(betaD);
  // docs/technical-spec.md: load impedance from SWR and distance to voltage/current minimum using tan(beta d).
  const zL =
    input.minimumType === "current"
      ? div({ re: input.swr, im: -t }, { re: 1, im: -input.swr * t })
      : div({ re: 1, im: -input.swr * t }, { re: input.swr, im: -t });

  return calculationOk(
    {
      zL,
      r: zL.re,
      x: zL.im,
    },
    warnings,
  );
}

function validateInput(input: LoadImpedanceInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.lambdaMm) || input.lambdaMm <= 0) {
    errors.push("Set lambda > 0 mm.");
  }

  if (!Number.isFinite(input.dMm) || input.dMm < 0) {
    errors.push("Set d >= 0 mm.");
  }

  if (!Number.isFinite(input.swr) || input.swr < 1) {
    errors.push("Set SWR >= 1.");
  }

  if (input.minimumType !== "voltage" && input.minimumType !== "current") {
    errors.push("Select voltage or current minimum.");
  }

  return errors;
}
