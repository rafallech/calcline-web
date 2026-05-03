import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type RfCascadeStageInput = {
  name: string;
  gainDb: number;
  noiseFigureDb: number;
  p1dBDbm?: number;
  oip3Dbm?: number;
};

export type RfCascadeInput = {
  inputPowerDbm: number;
  stages: RfCascadeStageInput[];
};

export type RfCascadeStageResult = {
  name: string;
  gainDb: number;
  cumulativeGainDb: number;
  outputPowerDbm: number;
};

export type RfCascadeIp3Result = {
  iip3Dbm: number;
  oip3Dbm: number;
};

export type RfCascadeResult = {
  totalGainDb: number;
  cascadedNoiseFigureDb: number;
  outputStages: RfCascadeStageResult[];
  cascadedIp3?: RfCascadeIp3Result;
};

export type RfCascadeCalculation = CalculatorCalculation<RfCascadeResult>;

export function calculateRfCascade(input: RfCascadeInput): RfCascadeCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  let cumulativeGainDb = 0;
  let cumulativeGainLinearBeforeStage = 1;
  let cascadedNoiseFactor = 0;
  const outputStages: RfCascadeStageResult[] = [];

  input.stages.forEach((stage, index) => {
    const stageGainLinear = dbToLinear(stage.gainDb);
    const stageNoiseFactor = dbToLinear(stage.noiseFigureDb);

    if (index === 0) {
      cascadedNoiseFactor = stageNoiseFactor;
    } else {
      cascadedNoiseFactor +=
        (stageNoiseFactor - 1) / cumulativeGainLinearBeforeStage;
    }

    cumulativeGainDb += stage.gainDb;
    outputStages.push({
      name: stage.name.trim() || `Stage ${index + 1}`,
      gainDb: stage.gainDb,
      cumulativeGainDb,
      outputPowerDbm: input.inputPowerDbm + cumulativeGainDb,
    });

    cumulativeGainLinearBeforeStage *= stageGainLinear;
  });

  return calculationOk({
    totalGainDb: cumulativeGainDb,
    cascadedNoiseFigureDb: linearToDb(cascadedNoiseFactor),
    outputStages,
    cascadedIp3: calculateCascadedIp3(input.stages, cumulativeGainDb),
  });
}

export function calculateCascadedNoiseFigureDb(
  stages: RfCascadeStageInput[],
): number {
  const result = calculateRfCascade({ inputPowerDbm: 0, stages });

  if (!result.value) {
    return Number.NaN;
  }

  return result.value.cascadedNoiseFigureDb;
}

export function calculateCascadedIp3(
  stages: RfCascadeStageInput[],
  totalGainDb: number,
): RfCascadeIp3Result | undefined {
  if (stages.some((stage) => stage.oip3Dbm === undefined)) {
    return undefined;
  }

  let denominator = 0;
  let precedingGainLinear = 1;

  for (const stage of stages) {
    const oip3Dbm = stage.oip3Dbm;

    if (oip3Dbm === undefined) {
      return undefined;
    }

    const iip3Dbm = oip3Dbm - stage.gainDb;
    denominator += precedingGainLinear / dbmToMw(iip3Dbm);
    precedingGainLinear *= dbToLinear(stage.gainDb);
  }

  const iip3Dbm = mwToDbm(1 / denominator);

  return {
    iip3Dbm,
    oip3Dbm: iip3Dbm + totalGainDb,
  };
}

function validateInput(input: RfCascadeInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.inputPowerDbm)) {
    errors.push("Set a finite input power in dBm.");
  }

  if (!Array.isArray(input.stages) || input.stages.length === 0) {
    errors.push("Add at least one RF stage.");
    return errors;
  }

  input.stages.forEach((stage, index) => {
    const label = stage.name.trim() || `Stage ${index + 1}`;

    if (!Number.isFinite(stage.gainDb)) {
      errors.push(`${label}: set a finite gain/loss in dB.`);
    }

    if (!Number.isFinite(stage.noiseFigureDb) || stage.noiseFigureDb < 0) {
      errors.push(`${label}: set noise figure >= 0 dB.`);
    }

    if (
      stage.p1dBDbm !== undefined &&
      !Number.isFinite(stage.p1dBDbm)
    ) {
      errors.push(`${label}: set a finite P1dB in dBm or leave it empty.`);
    }

    if (
      stage.oip3Dbm !== undefined &&
      !Number.isFinite(stage.oip3Dbm)
    ) {
      errors.push(`${label}: set a finite OIP3 in dBm or leave it empty.`);
    }
  });

  return errors;
}

function dbToLinear(valueDb: number): number {
  return 10 ** (valueDb / 10);
}

function linearToDb(value: number): number {
  return 10 * Math.log10(value);
}

function dbmToMw(valueDbm: number): number {
  return 10 ** (valueDbm / 10);
}

function mwToDbm(valueMw: number): number {
  return 10 * Math.log10(valueMw);
}
