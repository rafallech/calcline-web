import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type QuarterWaveTransformerInput = {
  z0Ohm: number;
  rLOhm: number;
  fGHz: number;
  epsEff: number;
};

export type QuarterWaveTransformerResult = {
  ztOhm: number;
  electricalLengthDeg: number;
  physicalLengthM: number;
  lambda0M: number;
  lambdaGM: number;
};

export type QuarterWaveTransformerCalculation =
  CalculatorCalculation<QuarterWaveTransformerResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;
const REAL_LOAD_WARNING =
  "Basic quarter-wave transformer model assumes a purely real load resistance.";

export function calculateQuarterWaveTransformer(
  input: QuarterWaveTransformerInput,
): QuarterWaveTransformerCalculation {
  const errors = validateInput(input);
  const warnings = [REAL_LOAD_WARNING];

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  const lambda0M = freeSpaceWavelengthM(input.fGHz);
  const lambdaGM = guidedWavelengthM(lambda0M, input.epsEff);

  return calculationOk(
    {
      ztOhm: Math.sqrt(input.z0Ohm * input.rLOhm),
      electricalLengthDeg: 90,
      physicalLengthM: lambdaGM / 4,
      lambda0M,
      lambdaGM,
    },
    warnings,
  );
}

export function freeSpaceWavelengthM(fGHz: number): number {
  return SPEED_OF_LIGHT_M_PER_S / (fGHz * 1_000_000_000);
}

export function guidedWavelengthM(lambda0M: number, epsEff: number): number {
  return lambda0M / Math.sqrt(epsEff);
}

function validateInput(input: QuarterWaveTransformerInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  if (!Number.isFinite(input.rLOhm) || input.rLOhm <= 0) {
    errors.push("Set RL > 0 Ohm.");
  }

  if (!Number.isFinite(input.fGHz) || input.fGHz <= 0) {
    errors.push("Set frequency > 0 GHz.");
  }

  if (!Number.isFinite(input.epsEff) || input.epsEff < 1) {
    errors.push("Set eps_eff >= 1.");
  }

  return errors;
}

