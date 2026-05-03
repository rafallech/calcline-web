import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type PatchAntennaInput = {
  fGHz: number;
  epsR: number;
  hMm: number;
};

export type PatchAntennaResult = {
  wMm: number;
  epsEff: number;
  deltaLMm: number;
  leffMm: number;
  lMm: number;
};

export type PatchAntennaCalculation =
  CalculatorCalculation<PatchAntennaResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;
const APPROXIMATION_WARNING =
  "Patch dimensions are a design approximation; tune with EM simulation or measurement.";

export function calculatePatchAntenna(
  input: PatchAntennaInput,
): PatchAntennaCalculation {
  const errors = validateInput(input);
  const warnings = [APPROXIMATION_WARNING];

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  const frequencyHz = input.fGHz * 1_000_000_000;
  const hM = input.hMm / 1000;
  const wM = patchWidthM(frequencyHz, input.epsR);
  const epsEff = effectivePermittivity(input.epsR, hM, wM);
  const deltaLM = lengthExtensionM(hM, wM, epsEff);
  const leffM = effectiveLengthM(frequencyHz, epsEff);
  const lM = leffM - 2 * deltaLM;

  return calculationOk(
    {
      wMm: wM * 1000,
      epsEff,
      deltaLMm: deltaLM * 1000,
      leffMm: leffM * 1000,
      lMm: lM * 1000,
    },
    warnings,
  );
}

export function patchWidthM(frequencyHz: number, epsR: number): number {
  return (
    (SPEED_OF_LIGHT_M_PER_S / (2 * frequencyHz)) *
    Math.sqrt(2 / (epsR + 1))
  );
}

export function effectivePermittivity(
  epsR: number,
  hM: number,
  wM: number,
): number {
  return (
    (epsR + 1) / 2 +
    ((epsR - 1) / 2) * (1 / Math.sqrt(1 + (12 * hM) / wM))
  );
}

export function lengthExtensionM(hM: number, wM: number, epsEff: number): number {
  const widthRatio = wM / hM;

  return (
    0.412 *
    hM *
    (((epsEff + 0.3) * (widthRatio + 0.264)) /
      ((epsEff - 0.258) * (widthRatio + 0.8)))
  );
}

export function effectiveLengthM(frequencyHz: number, epsEff: number): number {
  return SPEED_OF_LIGHT_M_PER_S / (2 * frequencyHz * Math.sqrt(epsEff));
}

function validateInput(input: PatchAntennaInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.fGHz) || input.fGHz <= 0) {
    errors.push("Set frequency > 0 GHz.");
  }

  if (!Number.isFinite(input.epsR) || input.epsR <= 1) {
    errors.push("Set eps_r > 1.");
  }

  if (!Number.isFinite(input.hMm) || input.hMm <= 0) {
    errors.push("Set h > 0 mm.");
  }

  return errors;
}

