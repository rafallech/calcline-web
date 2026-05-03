import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type WilkinsonDividerInput = {
  z0Ohm: number;
  fGHz: number;
  epsEff: number;
};

export type WilkinsonDividerResult = {
  quarterWaveLineImpedanceOhm: number;
  isolationResistorOhm: number;
  electricalLengthDeg: number;
  physicalLengthM: number;
  lambdaGM: number;
};

export type WilkinsonDividerCalculation =
  CalculatorCalculation<WilkinsonDividerResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;

export function calculateWilkinsonDivider(
  input: WilkinsonDividerInput,
): WilkinsonDividerCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const lambdaGM = guidedWavelengthM(input.fGHz, input.epsEff);

  return calculationOk({
    quarterWaveLineImpedanceOhm: quarterWaveLineImpedanceOhm(input.z0Ohm),
    isolationResistorOhm: isolationResistorOhm(input.z0Ohm),
    electricalLengthDeg: 90,
    physicalLengthM: lambdaGM / 4,
    lambdaGM,
  });
}

export function quarterWaveLineImpedanceOhm(z0Ohm: number): number {
  return Math.SQRT2 * z0Ohm;
}

export function isolationResistorOhm(z0Ohm: number): number {
  return 2 * z0Ohm;
}

export function guidedWavelengthM(fGHz: number, epsEff: number): number {
  return SPEED_OF_LIGHT_M_PER_S / (fGHz * 1_000_000_000 * Math.sqrt(epsEff));
}

function validateInput(input: WilkinsonDividerInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  if (!Number.isFinite(input.fGHz) || input.fGHz <= 0) {
    errors.push("Set frequency > 0 GHz.");
  }

  if (!Number.isFinite(input.epsEff) || input.epsEff < 1) {
    errors.push("Set eps_eff >= 1.");
  }

  return errors;
}
