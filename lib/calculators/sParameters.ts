import { calculateVswr } from "@/lib/calculators/vswr";
import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";
import { fromPolar, type Complex } from "@/lib/math/complex";

export type S11InputFormat = "magnitude" | "dB";
export type S21InputFormat = "magnitude" | "dB";

export type SParametersInput = {
  s11Format: S11InputFormat;
  s11Value: number;
  s11AngleDeg: number;
  s21Format: S21InputFormat;
  s21Value: number;
  z0Ohm: number;
};

export type SParametersResult = {
  gamma: Complex;
  s11Magnitude: number;
  s11Db: number;
  s11AngleDeg: number;
  returnLossDb: number;
  vswr: number;
  reflectedPowerPercent: number;
  mismatchLossDb: number;
  s21Linear: number;
  s21Db: number;
  transferKind: "gain" | "insertionLoss";
  transferDb: number;
};

export type SParametersCalculation = CalculatorCalculation<SParametersResult>;

export function calculateSParameters(
  input: SParametersInput,
): SParametersCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const s11Magnitude = s11MagnitudeFromInput(input);
  const s21Linear = s21LinearFromInput(input);
  const vswrResult = calculateVswr({
    type: "gammaPolar",
    z0Ohm: input.z0Ohm,
    magGamma: s11Magnitude,
    argGammaDeg: input.s11AngleDeg,
  });

  if (!vswrResult.value) {
    return calculationError(vswrResult.errors, vswrResult.warnings);
  }

  const s21Db = magnitudeToDb(s21Linear);

  return calculationOk({
    gamma: fromPolar(s11Magnitude, input.s11AngleDeg),
    s11Magnitude,
    s11Db: magnitudeToDb(s11Magnitude),
    s11AngleDeg: input.s11AngleDeg,
    returnLossDb: returnLossDb(s11Magnitude),
    vswr: vswrResult.value.vswr,
    reflectedPowerPercent: s11Magnitude * s11Magnitude * 100,
    mismatchLossDb: -10 * Math.log10(1 - s11Magnitude * s11Magnitude),
    s21Linear,
    s21Db,
    transferKind: s21Db >= 0 ? "gain" : "insertionLoss",
    transferDb: Math.abs(s21Db),
  });
}

export function dbToMagnitude(value: number): number {
  return 10 ** (value / 20);
}

export function magnitudeToDb(value: number): number {
  if (value === 0) {
    return Number.NEGATIVE_INFINITY;
  }

  return 20 * Math.log10(value);
}

function s11MagnitudeFromInput(input: SParametersInput): number {
  return input.s11Format === "dB"
    ? dbToMagnitude(input.s11Value)
    : input.s11Value;
}

function s21LinearFromInput(input: SParametersInput): number {
  return input.s21Format === "dB"
    ? dbToMagnitude(input.s21Value)
    : input.s21Value;
}

function returnLossDb(s11Magnitude: number): number {
  if (s11Magnitude === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return -20 * Math.log10(s11Magnitude);
}

function validateInput(input: SParametersInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  if (input.s11Format !== "magnitude" && input.s11Format !== "dB") {
    errors.push("Select a supported S11 format.");
  }

  if (input.s21Format !== "magnitude" && input.s21Format !== "dB") {
    errors.push("Select a supported S21 format.");
  }

  if (!Number.isFinite(input.s11Value)) {
    errors.push("Set S11 as a finite value.");
  } else if (input.s11Format === "magnitude" && input.s11Value < 0) {
    errors.push("Set |S11| >= 0.");
  }

  if (!Number.isFinite(input.s11AngleDeg)) {
    errors.push("Set S11 angle as a finite value in degrees.");
  }

  if (!Number.isFinite(input.s21Value)) {
    errors.push("Set S21 as a finite value.");
  } else if (input.s21Format === "magnitude" && input.s21Value < 0) {
    errors.push("Set |S21| >= 0.");
  }

  if (errors.length === 0 && s11MagnitudeFromInput(input) >= 1) {
    errors.push("Set |S11| < 1 for the passive case.");
  }

  return errors;
}

