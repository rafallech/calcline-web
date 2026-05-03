import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type AntennaApertureInputMode = "gainDbi" | "effectiveAperture";

export type AntennaApertureInput = {
  mode: AntennaApertureInputMode;
  frequencyGHz: number;
  gainDbi?: number;
  effectiveApertureM2?: number;
  efficiency?: number;
};

export type AntennaApertureResult = {
  mode: AntennaApertureInputMode;
  wavelengthM: number;
  gainLinear: number;
  gainDbi: number;
  effectiveApertureM2: number;
  directivityEstimateLinear: number;
  directivityEstimateDbi: number;
  efficiencyUsed: number;
};

export type AntennaApertureCalculation =
  CalculatorCalculation<AntennaApertureResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;

export function calculateAntennaAperture(
  input: AntennaApertureInput,
): AntennaApertureCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const wavelengthM = wavelengthFromGHz(input.frequencyGHz);
  const efficiencyUsed = input.efficiency ?? 1;
  const gainLinear =
    input.mode === "gainDbi"
      ? gainDbiToLinear(input.gainDbi ?? 0)
      : gainFromEffectiveAperture(input.effectiveApertureM2 ?? 0, wavelengthM);
  const gainDbi = gainLinearToDbi(gainLinear);
  const effectiveApertureM2 =
    input.mode === "gainDbi"
      ? effectiveApertureFromGain(gainLinear, wavelengthM)
      : (input.effectiveApertureM2 ?? 0);
  const directivityEstimateLinear = gainLinear / efficiencyUsed;
  const directivityEstimateDbi = gainLinearToDbi(directivityEstimateLinear);

  return calculationOk({
    mode: input.mode,
    wavelengthM,
    gainLinear,
    gainDbi,
    effectiveApertureM2,
    directivityEstimateLinear,
    directivityEstimateDbi,
    efficiencyUsed,
  });
}

export function wavelengthFromGHz(frequencyGHz: number): number {
  return SPEED_OF_LIGHT_M_PER_S / (frequencyGHz * 1_000_000_000);
}

export function gainDbiToLinear(gainDbi: number): number {
  return 10 ** (gainDbi / 10);
}

export function gainLinearToDbi(gainLinear: number): number {
  return 10 * Math.log10(gainLinear);
}

export function effectiveApertureFromGain(
  gainLinear: number,
  wavelengthM: number,
): number {
  return (gainLinear * wavelengthM ** 2) / (4 * Math.PI);
}

export function gainFromEffectiveAperture(
  effectiveApertureM2: number,
  wavelengthM: number,
): number {
  return (4 * Math.PI * effectiveApertureM2) / wavelengthM ** 2;
}

function validateInput(input: AntennaApertureInput): string[] {
  const errors: string[] = [];

  if (input.mode !== "gainDbi" && input.mode !== "effectiveAperture") {
    errors.push("Select a supported input mode.");
  }

  if (!Number.isFinite(input.frequencyGHz) || input.frequencyGHz <= 0) {
    errors.push("Set frequency > 0 GHz.");
  }

  if (
    input.mode === "gainDbi" &&
    !Number.isFinite(input.gainDbi)
  ) {
    errors.push("Set gain in dBi as a finite number.");
  }

  if (
    input.mode === "effectiveAperture" &&
    (!Number.isFinite(input.effectiveApertureM2) ||
      (input.effectiveApertureM2 ?? 0) <= 0)
  ) {
    errors.push("Set effective aperture Ae > 0 m^2.");
  }

  if (
    input.efficiency !== undefined &&
    (!Number.isFinite(input.efficiency) ||
      input.efficiency <= 0 ||
      input.efficiency > 1)
  ) {
    errors.push("Set efficiency > 0 and <= 1, or leave it blank.");
  }

  return errors;
}
