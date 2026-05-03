import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type ReceiverNoiseBandwidthUnit = "Hz" | "kHz" | "MHz";

export type ReceiverNoiseInput = {
  bandwidth: number;
  bandwidthUnit: ReceiverNoiseBandwidthUnit;
  noiseFigureDb: number;
  temperatureK: number;
  requiredSnrDb: number;
  gainDb?: number;
};

export type ReceiverNoiseResult = {
  thermalNoiseDensityDbmPerHz: number;
  thermalNoiseFloorDbm: number;
  noiseFloorWithNfDbm: number;
  minimumDetectableSignalDbm: number;
  sensitivityEstimateDbm: number;
  bandwidthHz: number;
  gainDb: number;
};

export type ReceiverNoiseCalculation =
  CalculatorCalculation<ReceiverNoiseResult>;

const BOLTZMANN_J_PER_K = 1.380_649e-23;

export function calculateReceiverNoise(
  input: ReceiverNoiseInput,
): ReceiverNoiseCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const bandwidthHz = bandwidthToHz(input.bandwidth, input.bandwidthUnit);
  const gainDb = input.gainDb ?? 0;
  const thermalNoiseDensityDbmPerHzValue = thermalNoiseDensityDbmPerHz(
    input.temperatureK,
  );
  const thermalNoiseFloorDbm =
    thermalNoiseDensityDbmPerHzValue + 10 * Math.log10(bandwidthHz);
  const noiseFloorWithNfDbm = thermalNoiseFloorDbm + input.noiseFigureDb;
  const minimumDetectableSignalDbm =
    noiseFloorWithNfDbm + input.requiredSnrDb;

  return calculationOk({
    thermalNoiseDensityDbmPerHz: thermalNoiseDensityDbmPerHzValue,
    thermalNoiseFloorDbm,
    noiseFloorWithNfDbm,
    minimumDetectableSignalDbm,
    sensitivityEstimateDbm: minimumDetectableSignalDbm - gainDb,
    bandwidthHz,
    gainDb,
  });
}

export function thermalNoiseDensityDbmPerHz(temperatureK: number): number {
  return 10 * Math.log10((BOLTZMANN_J_PER_K * temperatureK) / 0.001);
}

export function bandwidthToHz(
  bandwidth: number,
  unit: ReceiverNoiseBandwidthUnit,
): number {
  switch (unit) {
    case "Hz":
      return bandwidth;
    case "kHz":
      return bandwidth * 1_000;
    case "MHz":
      return bandwidth * 1_000_000;
  }
}

function validateInput(input: ReceiverNoiseInput): string[] {
  const errors: string[] = [];
  const gainDb = input.gainDb ?? 0;

  if (!Number.isFinite(input.bandwidth) || input.bandwidth <= 0) {
    errors.push("Set bandwidth > 0.");
  }

  if (
    input.bandwidthUnit !== "Hz" &&
    input.bandwidthUnit !== "kHz" &&
    input.bandwidthUnit !== "MHz"
  ) {
    errors.push("Select Hz, kHz, or MHz bandwidth unit.");
  }

  if (!Number.isFinite(input.noiseFigureDb)) {
    errors.push("Set a finite noise figure in dB.");
  }

  if (!Number.isFinite(input.temperatureK) || input.temperatureK <= 0) {
    errors.push("Set temperature > 0 K.");
  }

  if (!Number.isFinite(input.requiredSnrDb)) {
    errors.push("Set a finite required SNR in dB.");
  }

  if (!Number.isFinite(gainDb)) {
    errors.push("Set a finite gain in dB or leave it empty.");
  }

  return errors;
}
