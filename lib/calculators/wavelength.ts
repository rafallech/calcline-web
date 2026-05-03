import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type WavelengthFrequencyUnit = "Hz" | "kHz" | "MHz" | "GHz";
export type WavelengthLengthUnit = "mm" | "cm" | "m";

export type WavelengthInput = {
  frequency: number;
  frequencyUnit: WavelengthFrequencyUnit;
  epsEff: number;
  physicalLength: number;
  lengthUnit: WavelengthLengthUnit;
};

export type WavelengthResult = {
  lambda0M: number;
  lambdaGM: number;
  lengthInWavelengths: number;
  electricalLengthDeg: number;
  electricalLengthRad: number;
};

export type WavelengthCalculation = CalculatorCalculation<WavelengthResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;

const frequencyUnitScale: Record<WavelengthFrequencyUnit, number> = {
  Hz: 1,
  kHz: 1_000,
  MHz: 1_000_000,
  GHz: 1_000_000_000,
};

const lengthUnitScaleToM: Record<WavelengthLengthUnit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
};

export function calculateWavelength(
  input: WavelengthInput,
): WavelengthCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const frequencyHz = frequencyToHz(input.frequency, input.frequencyUnit);
  const physicalLengthM = lengthToM(input.physicalLength, input.lengthUnit);
  const lambda0M = SPEED_OF_LIGHT_M_PER_S / frequencyHz;
  const lambdaGM = lambda0M / Math.sqrt(input.epsEff);
  const lengthInWavelengths = physicalLengthM / lambdaGM;

  return calculationOk({
    lambda0M,
    lambdaGM,
    lengthInWavelengths,
    electricalLengthDeg: lengthInWavelengths * 360,
    electricalLengthRad: lengthInWavelengths * 2 * Math.PI,
  });
}

export function frequencyToHz(
  value: number,
  unit: WavelengthFrequencyUnit,
): number {
  return value * frequencyUnitScale[unit];
}

export function lengthToM(value: number, unit: WavelengthLengthUnit): number {
  return value * lengthUnitScaleToM[unit];
}

function validateInput(input: WavelengthInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.frequency) || input.frequency <= 0) {
    errors.push("Set frequency > 0.");
  }

  if (!isWavelengthFrequencyUnit(input.frequencyUnit)) {
    errors.push("Select a supported frequency unit.");
  }

  if (!Number.isFinite(input.epsEff) || input.epsEff < 1) {
    errors.push("Set eps_eff >= 1.");
  }

  if (!Number.isFinite(input.physicalLength) || input.physicalLength < 0) {
    errors.push("Set physical length >= 0.");
  }

  if (!isWavelengthLengthUnit(input.lengthUnit)) {
    errors.push("Select a supported length unit.");
  }

  return errors;
}

function isWavelengthFrequencyUnit(
  unit: string,
): unit is WavelengthFrequencyUnit {
  return unit in frequencyUnitScale;
}

function isWavelengthLengthUnit(unit: string): unit is WavelengthLengthUnit {
  return unit in lengthUnitScaleToM;
}

