import { add, div, mul, type Complex } from "@/lib/math/complex";
import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type ImpedanceTransformDirection = "generator" | "load";

export type ImpedanceTransformInput = {
  lambdaMm: number;
  rL: number;
  xL: number;
  dMm: number;
  direction: ImpedanceTransformDirection;
};

export type ImpedanceTransformResult = {
  zTransformed: Complex;
  r: number;
  x: number;
};

export type ImpedanceTransformCalculation =
  CalculatorCalculation<ImpedanceTransformResult>;

export function calculateImpedanceTransform(
  input: ImpedanceTransformInput,
): ImpedanceTransformCalculation {
  const errors = validateInput(input);
  const warnings: string[] = [];

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  const signedDistanceMm = input.direction === "load" ? -input.dMm : input.dMm;
  const betaD = (2 * Math.PI * signedDistanceMm) / input.lambdaMm;
  const t = Math.tan(betaD);
  const zL: Complex = { re: input.rL, im: input.xL };
  const jt: Complex = { re: 0, im: t };
  const numerator = add(zL, jt);
  const denominator = add({ re: 1, im: 0 }, mul(jt, zL));
  // docs/technical-spec.md: transmission-line transform, z' = (zL + j tan(beta d)) / (1 + j zL tan(beta d)).
  const zTransformed = div(numerator, denominator);

  return calculationOk(
    {
      zTransformed,
      r: zTransformed.re,
      x: zTransformed.im,
    },
    warnings,
  );
}

function validateInput(input: ImpedanceTransformInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.lambdaMm) || input.lambdaMm <= 0) {
    errors.push("Set lambda > 0 mm.");
  }

  if (!Number.isFinite(input.rL) || input.rL < 0) {
    errors.push("Set R_L / Z0 >= 0.");
  }

  if (!Number.isFinite(input.xL)) {
    errors.push("Set X_L / Z0 as a finite number.");
  }

  if (!Number.isFinite(input.dMm) || input.dMm < 0) {
    errors.push("Set d >= 0 mm.");
  }

  if (input.direction !== "generator" && input.direction !== "load") {
    errors.push("Select generator or load direction.");
  }

  return errors;
}
