import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type MicrostripLossMode = "simplified" | "advanced";

export type MicrostripLossSimplifiedInput = {
  mode: "simplified";
  attenuationDbPerM: number;
  lineLengthM: number;
};

export type MicrostripLossAdvancedInput = {
  mode: "advanced";
  frequencyGHz: number;
  wMm: number;
  hMm: number;
  epsR: number;
  epsEff: number;
  tanDelta: number;
  conductivitySPerM: number;
  copperThicknessUm: number;
  lineLengthM: number;
};

export type MicrostripLossInput =
  | MicrostripLossSimplifiedInput
  | MicrostripLossAdvancedInput;

export type MicrostripLossResult = {
  dielectricLossDb?: number;
  conductorLossDb?: number;
  totalLossDb: number;
  lossPerMeterDb: number;
};

export type MicrostripLossCalculation =
  CalculatorCalculation<MicrostripLossResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;
const VACUUM_PERMEABILITY_H_PER_M = 4 * Math.PI * 1e-7;

export function calculateMicrostripLoss(
  input: MicrostripLossInput,
): MicrostripLossCalculation {
  const errors = validateInput(input);
  const warnings = [
    "Microstrip loss is an approximate design estimate; verify critical designs with EM simulation or measurement.",
  ];

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  if (input.mode === "simplified") {
    return calculationOk(
      {
        totalLossDb: input.attenuationDbPerM * input.lineLengthM,
        lossPerMeterDb: input.attenuationDbPerM,
      },
      warnings,
    );
  }

  const dielectricLossPerM = dielectricLossDbPerM(
    input.frequencyGHz,
    input.epsR,
    input.epsEff,
    input.tanDelta,
  );
  const conductorLossPerM = conductorLossDbPerM(
    input.frequencyGHz,
    input.wMm,
    input.hMm,
    input.epsEff,
    input.conductivitySPerM,
    input.copperThicknessUm,
  );
  const lossPerMeterDb = dielectricLossPerM + conductorLossPerM;

  return calculationOk(
    {
      dielectricLossDb: dielectricLossPerM * input.lineLengthM,
      conductorLossDb: conductorLossPerM * input.lineLengthM,
      totalLossDb: lossPerMeterDb * input.lineLengthM,
      lossPerMeterDb,
    },
    warnings,
  );
}

export function dielectricLossDbPerM(
  frequencyGHz: number,
  epsR: number,
  epsEff: number,
  tanDelta: number,
): number {
  if (epsR === 1 || tanDelta === 0) {
    return 0;
  }

  const frequencyHz = frequencyGHz * 1_000_000_000;
  const k0 = (2 * Math.PI * frequencyHz) / SPEED_OF_LIGHT_M_PER_S;
  const alphaNpPerM =
    (k0 * epsR * (epsEff - 1) * tanDelta) /
    (2 * Math.sqrt(epsEff) * (epsR - 1));

  return nepersToDb(alphaNpPerM);
}

export function conductorLossDbPerM(
  frequencyGHz: number,
  wMm: number,
  hMm: number,
  epsEff: number,
  conductivitySPerM: number,
  copperThicknessUm: number,
): number {
  const frequencyHz = frequencyGHz * 1_000_000_000;
  const surfaceResistanceOhm = Math.sqrt(
    (Math.PI * frequencyHz * VACUUM_PERMEABILITY_H_PER_M) / conductivitySPerM,
  );
  const z0Ohm = microstripCharacteristicImpedanceOhm(hMm, wMm, epsEff);
  const effectiveWidthMeters = effectiveWidthM(
    wMm / 1000,
    copperThicknessUm / 1e6,
  );

  return nepersToDb(surfaceResistanceOhm / (z0Ohm * effectiveWidthMeters));
}

export function microstripCharacteristicImpedanceOhm(
  hMm: number,
  wMm: number,
  epsEff: number,
): number {
  const widthRatio = wMm / hMm;

  if (widthRatio < 1) {
    return (
      (60 / Math.sqrt(epsEff)) *
      Math.log((8 * hMm) / wMm + wMm / (4 * hMm))
    );
  }

  return (
    (120 * Math.PI) /
    (Math.sqrt(epsEff) *
      (widthRatio + 1.393 + 0.667 * Math.log(widthRatio + 1.444)))
  );
}

function effectiveWidthM(wM: number, thicknessM: number): number {
  if (thicknessM === 0) {
    return wM;
  }

  return (
    wM +
    (thicknessM / Math.PI) * (1 + Math.log((4 * Math.PI * wM) / thicknessM))
  );
}

function nepersToDb(valueNp: number): number {
  return 8.686 * valueNp;
}

function validateInput(input: MicrostripLossInput): string[] {
  const errors: string[] = [];

  if (input.mode === "simplified") {
    if (
      !Number.isFinite(input.attenuationDbPerM) ||
      input.attenuationDbPerM < 0
    ) {
      errors.push("Set attenuation >= 0 dB/m.");
    }

    if (!Number.isFinite(input.lineLengthM) || input.lineLengthM < 0) {
      errors.push("Set line length >= 0 m.");
    }

    return errors;
  }

  if (input.mode !== "advanced") {
    errors.push("Select simplified or advanced mode.");
    return errors;
  }

  if (!Number.isFinite(input.frequencyGHz) || input.frequencyGHz <= 0) {
    errors.push("Set frequency > 0 GHz.");
  }

  if (!Number.isFinite(input.wMm) || input.wMm <= 0) {
    errors.push("Set W > 0 mm.");
  }

  if (!Number.isFinite(input.hMm) || input.hMm <= 0) {
    errors.push("Set h > 0 mm.");
  }

  if (!Number.isFinite(input.epsR) || input.epsR <= 1) {
    errors.push("Set eps_r > 1.");
  }

  if (!Number.isFinite(input.epsEff) || input.epsEff < 1) {
    errors.push("Set eps_eff >= 1.");
  }

  if (!Number.isFinite(input.tanDelta) || input.tanDelta < 0) {
    errors.push("Set tan_delta >= 0.");
  }

  if (
    !Number.isFinite(input.conductivitySPerM) ||
    input.conductivitySPerM <= 0
  ) {
    errors.push("Set conductor conductivity > 0 S/m.");
  }

  if (
    !Number.isFinite(input.copperThicknessUm) ||
    input.copperThicknessUm < 0
  ) {
    errors.push("Set copper thickness >= 0 um.");
  }

  if (!Number.isFinite(input.lineLengthM) || input.lineLengthM < 0) {
    errors.push("Set line length >= 0 m.");
  }

  return errors;
}
