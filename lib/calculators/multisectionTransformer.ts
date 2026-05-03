import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type MultisectionTransformerInput = {
  z0Ohm: number;
  zLOhm: number;
  sections: number;
  fGHz: number;
  epsEff: number;
};

export type MultisectionTransformerSection = {
  index: number;
  impedanceOhm: number;
  electricalLengthDeg: number;
  physicalLengthM: number;
};

export type MultisectionTransformerResult = {
  kind: "binomial";
  lambdaGM: number;
  sectionLengthM: number;
  sections: MultisectionTransformerSection[];
  bandwidthNote: string;
};

export type MultisectionTransformerCalculation =
  CalculatorCalculation<MultisectionTransformerResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;
const BANDWIDTH_NOTE =
  "Binomial transformer is maximally flat around the center frequency; Chebyshev bandwidth control is planned as a future stage.";

export function calculateMultisectionTransformer(
  input: MultisectionTransformerInput,
): MultisectionTransformerCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const lambdaGM = guidedWavelengthM(input.fGHz, input.epsEff);
  const sectionLengthM = lambdaGM / 4;
  const impedances = binomialSectionImpedancesOhm(
    input.z0Ohm,
    input.zLOhm,
    input.sections,
  );

  return calculationOk({
    kind: "binomial",
    lambdaGM,
    sectionLengthM,
    sections: impedances.map((impedanceOhm, index) => ({
      index: index + 1,
      impedanceOhm,
      electricalLengthDeg: 90,
      physicalLengthM: sectionLengthM,
    })),
    bandwidthNote: BANDWIDTH_NOTE,
  });
}

export function binomialSectionImpedancesOhm(
  z0Ohm: number,
  zLOhm: number,
  sections: number,
): number[] {
  const logRatio = Math.log(zLOhm / z0Ohm);
  let cumulative = 0;
  const impedances: number[] = [];

  for (let index = 1; index <= sections; index += 1) {
    cumulative += binomialCoefficient(sections, index - 1) / 2 ** sections;
    impedances.push(z0Ohm * Math.exp(logRatio * cumulative));
  }

  return impedances;
}

export function guidedWavelengthM(fGHz: number, epsEff: number): number {
  return SPEED_OF_LIGHT_M_PER_S / (fGHz * 1_000_000_000 * Math.sqrt(epsEff));
}

export function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) {
    return 0;
  }

  let result = 1;

  for (let index = 1; index <= k; index += 1) {
    result = (result * (n + 1 - index)) / index;
  }

  return result;
}

function validateInput(input: MultisectionTransformerInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  if (!Number.isFinite(input.zLOhm) || input.zLOhm <= 0) {
    errors.push("Set ZL > 0 Ohm.");
  }

  if (
    !Number.isInteger(input.sections) ||
    input.sections < 1 ||
    input.sections > 10
  ) {
    errors.push("Set N as an integer from 1 to 10.");
  }

  if (!Number.isFinite(input.fGHz) || input.fGHz <= 0) {
    errors.push("Set center frequency > 0 GHz.");
  }

  if (!Number.isFinite(input.epsEff) || input.epsEff < 1) {
    errors.push("Set eps_eff >= 1.");
  }

  return errors;
}
