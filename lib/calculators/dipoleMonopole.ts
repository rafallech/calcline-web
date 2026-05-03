import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type DipoleMonopoleAntennaType =
  | "halfWaveDipole"
  | "quarterWaveMonopole";

export type DipoleMonopoleInput = {
  frequencyMHz: number;
  velocityFactor: number;
  antennaType: DipoleMonopoleAntennaType;
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
};

export type DipoleMonopoleCalculation =
  CalculatorCalculation<DipoleMonopoleResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;
const ANTENNA_LENGTH_WARNING =
  "Dipole and monopole lengths are starting estimates; trim and tune with measurement in the final installation.";

export function calculateDipoleMonopole(
  input: DipoleMonopoleInput,
): DipoleMonopoleCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const freeSpaceWavelengthM = wavelengthFromMHz(input.frequencyMHz);
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

function validateInput(input: DipoleMonopoleInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.frequencyMHz) || input.frequencyMHz <= 0) {
    errors.push("Set frequency > 0 MHz.");
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
    input.antennaType !== "quarterWaveMonopole"
  ) {
    errors.push("Select a supported antenna type.");
  }

  return errors;
}
