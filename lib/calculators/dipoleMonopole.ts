import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type DipoleMonopoleAntennaType =
  | "halfWaveDipole"
  | "quarterWaveMonopole"
  | "foldedDipole";

export type DipoleMonopoleFrequencyUnit = "MHz" | "GHz";

export type FoldedDipoleMatchingOption =
  | "none"
  | "4To1Balun"
  | "quarterWaveTransformer";

export type DipoleMonopoleInput = {
  frequencyMHz?: number;
  frequency?: number;
  frequencyUnit?: DipoleMonopoleFrequencyUnit;
  velocityFactor: number;
  antennaType: DipoleMonopoleAntennaType;
  rodDiameterMm?: number;
  spacingMm?: number;
  feedGapMm?: number;
  feedLineImpedanceOhm?: number;
  matchingOption?: FoldedDipoleMatchingOption;
};

export type DipoleMonopoleResult = {
  antennaType: DipoleMonopoleAntennaType;
  freeSpaceWavelengthM: number;
  correctedWavelengthM: number;
  totalDipoleLengthM: number;
  eachDipoleArmLengthM: number;
  monopoleLengthM: number;
  selectedLengthM: number;
  selectedLengthLabel: string;
  foldedDipole?: FoldedDipoleResult;
};

export type FoldedDipoleResult = {
  freeSpaceWavelengthM: number;
  correctedWavelengthM: number;
  overallLengthM: number;
  centerSpacingMm: number;
  bendRadiusMm: number;
  straightSectionLengthM: number;
  feedGapMm: number;
  rodDiameterMm: number;
  totalConductorLengthM: number;
  estimatedStraightDipoleImpedanceOhm: number;
  estimatedFoldedDipoleImpedanceOhm: number;
  transformedImpedanceOhm?: number;
  quarterWaveTransformerImpedanceOhm?: number;
  quarterWaveTransformerLengthM?: number;
  feedLineImpedanceOhm: number;
  mismatchRatio: number;
  recommendedMatching: string;
  geometry: {
    aMm: number;
    bMm: number;
    cMm: number;
    dMm: number;
    rMm: number;
    rodDiameterMm: number;
    totalConductorLengthMm: number;
  };
};

export type DipoleMonopoleCalculation =
  CalculatorCalculation<DipoleMonopoleResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;
const MM_PER_M = 1000;
const FOLDED_DIPOLE_STRAIGHT_IMPEDANCE_OHM = 73;
const FOLDED_DIPOLE_TRANSFORMATION_RATIO = 4;
const ANTENNA_LENGTH_WARNING =
  "Dipole and monopole lengths are starting estimates; trim and tune with measurement in the final installation.";
const FOLDED_DIPOLE_WARNINGS = [
  "Folded dipole impedance is approximate.",
  "Dimensions depend on conductor diameter and mounting.",
  "Verify final antenna by measurement or NEC simulation.",
];

export function calculateDipoleMonopole(
  input: DipoleMonopoleInput,
): DipoleMonopoleCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  if (input.antennaType === "foldedDipole") {
    return calculateFoldedDipole(input);
  }

  const freeSpaceWavelengthM = wavelengthFromFrequency(input);
  const correctedWavelengthM = freeSpaceWavelengthM * input.velocityFactor;
  const totalDipoleLengthM = correctedWavelengthM / 2;
  const eachDipoleArmLengthM = correctedWavelengthM / 4;
  const monopoleLengthM = correctedWavelengthM / 4;
  const selectedLengthM =
    input.antennaType === "halfWaveDipole"
      ? totalDipoleLengthM
      : monopoleLengthM;
  const selectedLengthLabel =
    input.antennaType === "halfWaveDipole"
      ? "total dipole length"
      : "monopole length";

  return calculationOk(
    {
      antennaType: input.antennaType,
      freeSpaceWavelengthM,
      correctedWavelengthM,
      totalDipoleLengthM,
      eachDipoleArmLengthM,
      monopoleLengthM,
      selectedLengthM,
      selectedLengthLabel,
    },
    [ANTENNA_LENGTH_WARNING],
  );
}

export function wavelengthFromMHz(frequencyMHz: number): number {
  return SPEED_OF_LIGHT_M_PER_S / (frequencyMHz * 1_000_000);
}

export function calculateFoldedDipole(
  input: DipoleMonopoleInput,
): DipoleMonopoleCalculation {
  const freeSpaceWavelengthM = wavelengthFromFrequency(input);
  const correctedWavelengthM = freeSpaceWavelengthM * input.velocityFactor;
  const overallLengthM = correctedWavelengthM / 2;
  const centerSpacingMm = input.spacingMm ?? Number.NaN;
  const bendRadiusMm = centerSpacingMm / 2;
  const straightSectionLengthM = overallLengthM - (2 * bendRadiusMm) / MM_PER_M;
  const feedGapMm = input.feedGapMm ?? Number.NaN;
  const rodDiameterMm = input.rodDiameterMm ?? Number.NaN;
  const feedLineImpedanceOhm = input.feedLineImpedanceOhm ?? Number.NaN;
  const matchingOption = input.matchingOption ?? "4To1Balun";
  const totalConductorLengthM =
    2 * straightSectionLengthM + (2 * Math.PI * bendRadiusMm) / MM_PER_M;
  const estimatedStraightDipoleImpedanceOhm =
    FOLDED_DIPOLE_STRAIGHT_IMPEDANCE_OHM;
  const estimatedFoldedDipoleImpedanceOhm =
    FOLDED_DIPOLE_TRANSFORMATION_RATIO * estimatedStraightDipoleImpedanceOhm;
  const transformedImpedanceOhm =
    matchingOption === "4To1Balun"
      ? estimatedFoldedDipoleImpedanceOhm / 4
      : matchingOption === "none"
        ? estimatedFoldedDipoleImpedanceOhm
        : undefined;
  const quarterWaveTransformerImpedanceOhm =
    matchingOption === "quarterWaveTransformer"
      ? Math.sqrt(estimatedFoldedDipoleImpedanceOhm * feedLineImpedanceOhm)
      : undefined;
  const quarterWaveTransformerLengthM =
    matchingOption === "quarterWaveTransformer"
      ? correctedWavelengthM / 4
      : undefined;
  const impedanceForMismatch =
    transformedImpedanceOhm ?? estimatedFoldedDipoleImpedanceOhm;
  const mismatchRatio = impedanceMismatchRatio(
    impedanceForMismatch,
    feedLineImpedanceOhm,
  );
  const geometry = {
    aMm: (straightSectionLengthM * MM_PER_M) / 2 - feedGapMm / 2,
    bMm: feedGapMm,
    cMm: straightSectionLengthM * MM_PER_M,
    dMm: overallLengthM * MM_PER_M,
    rMm: bendRadiusMm,
    rodDiameterMm,
    totalConductorLengthMm: totalConductorLengthM * MM_PER_M,
  };
  const foldedDipole: FoldedDipoleResult = {
    freeSpaceWavelengthM,
    correctedWavelengthM,
    overallLengthM,
    centerSpacingMm,
    bendRadiusMm,
    straightSectionLengthM,
    feedGapMm,
    rodDiameterMm,
    totalConductorLengthM,
    estimatedStraightDipoleImpedanceOhm,
    estimatedFoldedDipoleImpedanceOhm,
    transformedImpedanceOhm,
    quarterWaveTransformerImpedanceOhm,
    quarterWaveTransformerLengthM,
    feedLineImpedanceOhm,
    mismatchRatio,
    recommendedMatching: recommendedFoldedDipoleMatching(matchingOption),
    geometry,
  };

  return calculationOk(
    {
      antennaType: "foldedDipole",
      freeSpaceWavelengthM,
      correctedWavelengthM,
      totalDipoleLengthM: overallLengthM,
      eachDipoleArmLengthM: overallLengthM / 2,
      monopoleLengthM: correctedWavelengthM / 4,
      selectedLengthM: overallLengthM,
      selectedLengthLabel: "overall folded dipole length",
      foldedDipole,
    },
    FOLDED_DIPOLE_WARNINGS,
  );
}

function wavelengthFromFrequency(input: DipoleMonopoleInput): number {
  const frequency = input.frequency ?? input.frequencyMHz ?? Number.NaN;
  const unit = input.frequencyUnit ?? "MHz";
  const multiplier = unit === "GHz" ? 1_000_000_000 : 1_000_000;

  return SPEED_OF_LIGHT_M_PER_S / (frequency * multiplier);
}

function validateInput(input: DipoleMonopoleInput): string[] {
  const errors: string[] = [];

  const frequency = input.frequency ?? input.frequencyMHz ?? Number.NaN;
  const frequencyUnit = input.frequencyUnit ?? "MHz";

  if (!Number.isFinite(frequency) || frequency <= 0) {
    errors.push("Set frequency > 0.");
  }

  if (frequencyUnit !== "MHz" && frequencyUnit !== "GHz") {
    errors.push("Select frequency unit MHz or GHz.");
  }

  if (
    !Number.isFinite(input.velocityFactor) ||
    input.velocityFactor <= 0 ||
    input.velocityFactor > 1
  ) {
    errors.push("Set velocity factor > 0 and <= 1.");
  }

  if (
    input.antennaType !== "halfWaveDipole" &&
    input.antennaType !== "quarterWaveMonopole" &&
    input.antennaType !== "foldedDipole"
  ) {
    errors.push("Select a supported antenna type.");
  }

  if (input.antennaType === "foldedDipole") {
    validateFoldedDipoleInput(input, errors);
  }

  return errors;
}

function validateFoldedDipoleInput(
  input: DipoleMonopoleInput,
  errors: string[],
) {
  if (!Number.isFinite(input.rodDiameterMm) || (input.rodDiameterMm ?? 0) <= 0) {
    errors.push("Set rod diameter > 0 mm.");
  }

  if (!Number.isFinite(input.spacingMm) || (input.spacingMm ?? 0) <= 0) {
    errors.push("Set spacing > 0 mm.");
  }

  if (!Number.isFinite(input.feedGapMm) || (input.feedGapMm ?? -1) < 0) {
    errors.push("Set feed gap >= 0 mm.");
  }

  if (
    !Number.isFinite(input.feedLineImpedanceOhm) ||
    (input.feedLineImpedanceOhm ?? 0) <= 0
  ) {
    errors.push("Set feed line impedance > 0 Ohm.");
  }

  const matchingOption = input.matchingOption ?? "4To1Balun";

  if (
    matchingOption !== "none" &&
    matchingOption !== "4To1Balun" &&
    matchingOption !== "quarterWaveTransformer"
  ) {
    errors.push("Select a supported matching option.");
  }

  const frequency = input.frequency ?? input.frequencyMHz ?? Number.NaN;
  const frequencyUnit = input.frequencyUnit ?? "MHz";
  const multiplier = frequencyUnit === "GHz" ? 1_000_000_000 : 1_000_000;
  const freeSpaceWavelengthM = SPEED_OF_LIGHT_M_PER_S / (frequency * multiplier);
  const correctedWavelengthM = freeSpaceWavelengthM * input.velocityFactor;
  const overallLengthM = correctedWavelengthM / 2;
  const bendRadiusMm = (input.spacingMm ?? Number.NaN) / 2;
  const straightSectionLengthM = overallLengthM - (2 * bendRadiusMm) / MM_PER_M;

  if (Number.isFinite(straightSectionLengthM) && straightSectionLengthM <= 0) {
    errors.push("Set spacing smaller relative to frequency.");
  }
}

function impedanceMismatchRatio(impedanceOhm: number, referenceOhm: number): number {
  return Math.max(impedanceOhm / referenceOhm, referenceOhm / impedanceOhm);
}

function recommendedFoldedDipoleMatching(
  matchingOption: FoldedDipoleMatchingOption,
): string {
  if (matchingOption === "4To1Balun") {
    return "Use a 4:1 balun as a starting match estimate.";
  }

  if (matchingOption === "quarterWaveTransformer") {
    return "Use a quarter-wave transformer designed for the estimated folded dipole impedance and feed line impedance.";
  }

  return "No matching network selected; compare estimated folded dipole impedance directly with the feed line impedance.";
}
