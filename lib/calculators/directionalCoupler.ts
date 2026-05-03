import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type DirectionalCouplerInput = {
  z0Ohm: number;
  fGHz: number;
  epsEff: number;
};

export type DirectionalCouplerResult = {
  seriesArmImpedanceOhm: number;
  branchArmImpedanceOhm: number;
  electricalLengthDeg: number;
  physicalLengthM: number;
  lambdaGM: number;
  idealSplitDb: number;
  phaseRelationDeg: number;
};

export type DirectionalCouplerCalculation =
  CalculatorCalculation<DirectionalCouplerResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;
const IDEAL_MODEL_WARNING =
  "Ideal branch-line model: no loss, discontinuity, dispersion, or tolerance effects are included.";

export function calculateDirectionalCoupler(
  input: DirectionalCouplerInput,
): DirectionalCouplerCalculation {
  const errors = validateInput(input);
  const warnings = [IDEAL_MODEL_WARNING];

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  const lambdaGM = guidedWavelengthM(input.fGHz, input.epsEff);

  return calculationOk(
    {
      seriesArmImpedanceOhm: seriesArmImpedanceOhm(input.z0Ohm),
      branchArmImpedanceOhm: branchArmImpedanceOhm(input.z0Ohm),
      electricalLengthDeg: 90,
      physicalLengthM: lambdaGM / 4,
      lambdaGM,
      idealSplitDb: -10 * Math.log10(2),
      phaseRelationDeg: 90,
    },
    warnings,
  );
}

export function seriesArmImpedanceOhm(z0Ohm: number): number {
  return z0Ohm / Math.SQRT2;
}

export function branchArmImpedanceOhm(z0Ohm: number): number {
  return z0Ohm;
}

export function guidedWavelengthM(fGHz: number, epsEff: number): number {
  return SPEED_OF_LIGHT_M_PER_S / (fGHz * 1_000_000_000 * Math.sqrt(epsEff));
}

function validateInput(input: DirectionalCouplerInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  if (!Number.isFinite(input.fGHz) || input.fGHz <= 0) {
    errors.push("Set center frequency > 0 GHz.");
  }

  if (!Number.isFinite(input.epsEff) || input.epsEff < 1) {
    errors.push("Set eps_eff >= 1.");
  }

  return errors;
}
