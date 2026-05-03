import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type StriplineInput = {
  wMm: number;
  bMm: number;
  tMm: number;
  epsR: number;
  fGHz: number;
};

export type StriplineResult = {
  z0Ohm: number;
  guidedWavelengthMm: number;
  propagationDelayPsPerMm: number;
  effectiveWidthMm: number;
};

export type StriplineCalculation = CalculatorCalculation<StriplineResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;

export function calculateStripline(
  input: StriplineInput,
): StriplineCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const effectiveWidthMm = effectiveStripWidthMm(input.wMm, input.tMm);

  return calculationOk({
    z0Ohm: characteristicImpedanceOhm(
      effectiveWidthMm,
      input.bMm,
      input.epsR,
    ),
    guidedWavelengthMm: guidedWavelengthMm(input.fGHz, input.epsR),
    propagationDelayPsPerMm: propagationDelayPsPerMm(input.epsR),
    effectiveWidthMm,
  });
}

export function effectiveStripWidthMm(wMm: number, tMm: number): number {
  if (tMm === 0) {
    return wMm;
  }

  return wMm + (tMm / Math.PI) * (1 + Math.log((4 * Math.PI * wMm) / tMm));
}

export function characteristicImpedanceOhm(
  effectiveWidthMm: number,
  bMm: number,
  epsR: number,
): number {
  return (
    (30 * Math.PI) /
    (Math.sqrt(epsR) * (effectiveWidthMm / bMm + 0.441))
  );
}

export function guidedWavelengthMm(fGHz: number, epsR: number): number {
  return (
    (SPEED_OF_LIGHT_M_PER_S / (fGHz * 1_000_000_000 * Math.sqrt(epsR))) *
    1000
  );
}

export function propagationDelayPsPerMm(epsR: number): number {
  return (Math.sqrt(epsR) / SPEED_OF_LIGHT_M_PER_S) * 1_000_000_000;
}

function validateInput(input: StriplineInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.wMm) || input.wMm <= 0) {
    errors.push("Set W > 0 mm.");
  }

  if (!Number.isFinite(input.bMm) || input.bMm <= 0) {
    errors.push("Set b > 0 mm.");
  }

  if (!Number.isFinite(input.tMm) || input.tMm < 0) {
    errors.push("Set t >= 0 mm.");
  }

  if (!Number.isFinite(input.epsR) || input.epsR < 1) {
    errors.push("Set eps_r >= 1.");
  }

  if (!Number.isFinite(input.fGHz) || input.fGHz <= 0) {
    errors.push("Set frequency > 0 GHz.");
  }

  return errors;
}
