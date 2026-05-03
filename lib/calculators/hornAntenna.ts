import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type HornAntennaInput = {
  frequencyGHz: number;
  apertureWidthMm: number;
  apertureHeightMm: number;
  apertureEfficiency: number;
};

export type HornAntennaResult = {
  wavelengthM: number;
  apertureAreaM2: number;
  directivityLinear: number;
  gainLinear: number;
  gainDbi: number;
  beamwidthEPlaneDeg: number;
  beamwidthHPlaneDeg: number;
};

export type HornAntennaCalculation = CalculatorCalculation<HornAntennaResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;
const MM_PER_M = 1000;
const APERTURE_WARNING =
  "Horn antenna gain and beamwidth are aperture approximations; verify final designs with EM simulation or measurement.";

export function calculateHornAntenna(
  input: HornAntennaInput,
): HornAntennaCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const wavelengthM = wavelengthFromGHz(input.frequencyGHz);
  const apertureWidthM = input.apertureWidthMm / MM_PER_M;
  const apertureHeightM = input.apertureHeightMm / MM_PER_M;
  const apertureAreaM2 = apertureWidthM * apertureHeightM;
  const directivityLinear = directivityFromAperture(apertureAreaM2, wavelengthM);
  const gainLinear = input.apertureEfficiency * directivityLinear;
  const gainDbi = 10 * Math.log10(gainLinear);
  const beamwidthEPlaneDeg = (56 * wavelengthM) / apertureHeightM;
  const beamwidthHPlaneDeg = (67 * wavelengthM) / apertureWidthM;

  return calculationOk(
    {
      wavelengthM,
      apertureAreaM2,
      directivityLinear,
      gainLinear,
      gainDbi,
      beamwidthEPlaneDeg,
      beamwidthHPlaneDeg,
    },
    [APERTURE_WARNING],
  );
}

export function wavelengthFromGHz(frequencyGHz: number): number {
  return SPEED_OF_LIGHT_M_PER_S / (frequencyGHz * 1_000_000_000);
}

export function directivityFromAperture(
  apertureAreaM2: number,
  wavelengthM: number,
): number {
  return (4 * Math.PI * apertureAreaM2) / wavelengthM ** 2;
}

function validateInput(input: HornAntennaInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.frequencyGHz) || input.frequencyGHz <= 0) {
    errors.push("Set frequency > 0 GHz.");
  }

  if (!Number.isFinite(input.apertureWidthMm) || input.apertureWidthMm <= 0) {
    errors.push("Set aperture width > 0 mm.");
  }

  if (!Number.isFinite(input.apertureHeightMm) || input.apertureHeightMm <= 0) {
    errors.push("Set aperture height > 0 mm.");
  }

  if (
    !Number.isFinite(input.apertureEfficiency) ||
    input.apertureEfficiency <= 0 ||
    input.apertureEfficiency > 1
  ) {
    errors.push("Set aperture efficiency > 0 and <= 1.");
  }

  return errors;
}
