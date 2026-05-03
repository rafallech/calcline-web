import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type AttenuatorTopology = "pi" | "t";

export type AttenuatorInput = {
  topology: AttenuatorTopology;
  z0Ohm: number;
  attenuationDb: number;
};

export type PiAttenuatorResult = {
  topology: "pi";
  rSeriesOhm: number;
  rShuntInputOhm: number;
  rShuntOutputOhm: number;
};

export type TAttenuatorResult = {
  topology: "t";
  rSeriesInputOhm: number;
  rSeriesOutputOhm: number;
  rShuntOhm: number;
};

export type AttenuatorResult = {
  voltageRatio: number;
  powerRatio: number;
  resistors: PiAttenuatorResult | TAttenuatorResult;
};

export type AttenuatorCalculation = CalculatorCalculation<AttenuatorResult>;

export function calculateAttenuator(
  input: AttenuatorInput,
): AttenuatorCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const voltageRatio = attenuationDbToVoltageRatio(input.attenuationDb);
  const powerRatio = attenuationDbToPowerRatio(input.attenuationDb);

  return calculationOk({
    voltageRatio,
    powerRatio,
    resistors:
      input.topology === "pi"
        ? calculatePiResistors(input.z0Ohm, voltageRatio)
        : calculateTResistors(input.z0Ohm, voltageRatio),
  });
}

export function attenuationDbToVoltageRatio(attenuationDb: number): number {
  return 10 ** (attenuationDb / 20);
}

export function attenuationDbToPowerRatio(attenuationDb: number): number {
  return 10 ** (attenuationDb / 10);
}

export function calculatePiResistors(
  z0Ohm: number,
  voltageRatio: number,
): PiAttenuatorResult {
  const rShuntOhm = z0Ohm * ((voltageRatio + 1) / (voltageRatio - 1));

  return {
    topology: "pi",
    rSeriesOhm: z0Ohm * ((voltageRatio * voltageRatio - 1) / (2 * voltageRatio)),
    rShuntInputOhm: rShuntOhm,
    rShuntOutputOhm: rShuntOhm,
  };
}

export function calculateTResistors(
  z0Ohm: number,
  voltageRatio: number,
): TAttenuatorResult {
  const rSeriesOhm = z0Ohm * ((voltageRatio - 1) / (voltageRatio + 1));

  return {
    topology: "t",
    rSeriesInputOhm: rSeriesOhm,
    rSeriesOutputOhm: rSeriesOhm,
    rShuntOhm:
      (2 * z0Ohm * voltageRatio) / (voltageRatio * voltageRatio - 1),
  };
}

function validateInput(input: AttenuatorInput): string[] {
  const errors: string[] = [];

  if (input.topology !== "pi" && input.topology !== "t") {
    errors.push("Select a supported attenuator topology.");
  }

  if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  if (!Number.isFinite(input.attenuationDb) || input.attenuationDb <= 0) {
    errors.push("Set attenuation > 0 dB.");
  }

  return errors;
}

