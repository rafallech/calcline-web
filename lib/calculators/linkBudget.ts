import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type LinkBudgetFrequencyUnit = "MHz" | "GHz";
export type LinkBudgetDistanceUnit = "m" | "km";

export type LinkBudgetInput = {
  transmitPowerDbm: number;
  txAntennaGainDbi: number;
  rxAntennaGainDbi: number;
  frequency: number;
  frequencyUnit: LinkBudgetFrequencyUnit;
  distance: number;
  distanceUnit: LinkBudgetDistanceUnit;
  txCableLossDb: number;
  rxCableLossDb: number;
  additionalLossesDb: number;
  receiverSensitivityDbm: number;
};

export type LinkBudgetResult = {
  eirpDbm: number;
  fsplDb: number;
  receivedPowerDbm: number;
  linkMarginDb: number;
};

export type LinkBudgetCalculation = CalculatorCalculation<LinkBudgetResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;

const frequencyUnitScaleToHz: Record<LinkBudgetFrequencyUnit, number> = {
  MHz: 1_000_000,
  GHz: 1_000_000_000,
};

const distanceUnitScaleToM: Record<LinkBudgetDistanceUnit, number> = {
  m: 1,
  km: 1000,
};

export function calculateLinkBudget(
  input: LinkBudgetInput,
): LinkBudgetCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const frequencyHz = frequencyToHz(input.frequency, input.frequencyUnit);
  const distanceM = distanceToM(input.distance, input.distanceUnit);
  const fsplDb = freeSpacePathLossDb(frequencyHz, distanceM);
  const eirpDbm =
    input.transmitPowerDbm + input.txAntennaGainDbi - input.txCableLossDb;
  const receivedPowerDbm =
    eirpDbm -
    fsplDb +
    input.rxAntennaGainDbi -
    input.rxCableLossDb -
    input.additionalLossesDb;

  return calculationOk({
    eirpDbm,
    fsplDb,
    receivedPowerDbm,
    linkMarginDb: receivedPowerDbm - input.receiverSensitivityDbm,
  });
}

export function freeSpacePathLossDb(
  frequencyHz: number,
  distanceM: number,
): number {
  const wavelengthM = SPEED_OF_LIGHT_M_PER_S / frequencyHz;

  return 20 * Math.log10((4 * Math.PI * distanceM) / wavelengthM);
}

export function frequencyToHz(
  value: number,
  unit: LinkBudgetFrequencyUnit,
): number {
  return value * frequencyUnitScaleToHz[unit];
}

export function distanceToM(
  value: number,
  unit: LinkBudgetDistanceUnit,
): number {
  return value * distanceUnitScaleToM[unit];
}

function validateInput(input: LinkBudgetInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.transmitPowerDbm)) {
    errors.push("Set transmit power as a finite dBm value.");
  }

  if (!Number.isFinite(input.txAntennaGainDbi)) {
    errors.push("Set TX antenna gain as a finite dBi value.");
  }

  if (!Number.isFinite(input.rxAntennaGainDbi)) {
    errors.push("Set RX antenna gain as a finite dBi value.");
  }

  if (!Number.isFinite(input.frequency) || input.frequency <= 0) {
    errors.push("Set frequency > 0.");
  }

  if (!isLinkBudgetFrequencyUnit(input.frequencyUnit)) {
    errors.push("Select a supported frequency unit.");
  }

  if (!Number.isFinite(input.distance) || input.distance <= 0) {
    errors.push("Set distance > 0.");
  }

  if (!isLinkBudgetDistanceUnit(input.distanceUnit)) {
    errors.push("Select a supported distance unit.");
  }

  if (!Number.isFinite(input.txCableLossDb)) {
    errors.push("Set TX cable loss as a finite dB value.");
  }

  if (!Number.isFinite(input.rxCableLossDb)) {
    errors.push("Set RX cable loss as a finite dB value.");
  }

  if (!Number.isFinite(input.additionalLossesDb)) {
    errors.push("Set additional losses as a finite dB value.");
  }

  if (!Number.isFinite(input.receiverSensitivityDbm)) {
    errors.push("Set receiver sensitivity as a finite dBm value.");
  }

  return errors;
}

function isLinkBudgetFrequencyUnit(
  unit: string,
): unit is LinkBudgetFrequencyUnit {
  return unit in frequencyUnitScaleToHz;
}

function isLinkBudgetDistanceUnit(
  unit: string,
): unit is LinkBudgetDistanceUnit {
  return unit in distanceUnitScaleToM;
}

