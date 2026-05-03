import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type PiTMatchingNetwork = "pi" | "t";

export type PiTMatchingInput = {
  network: PiTMatchingNetwork;
  sourceResistanceOhm: number;
  loadResistanceOhm: number;
  frequencyMHz: number;
  targetQ: number;
};

export type PiTElementValue = {
  label: string;
  kind: "series-inductor" | "shunt-capacitor";
  value: number;
  unit: "nH" | "pF";
};

export type PiTMatchingResult = {
  network: PiTMatchingNetwork;
  virtualResistanceOhm: number;
  sourceQ: number;
  loadQ: number;
  targetQ: number;
  reactancesOhm: {
    sourceSeries?: number;
    centerSeries?: number;
    loadSeries?: number;
  };
  susceptancesS: {
    sourceShunt?: number;
    centerShunt?: number;
    loadShunt?: number;
  };
  elements: PiTElementValue[];
};

export type PiTMatchingCalculation = CalculatorCalculation<PiTMatchingResult>;

export function calculatePiTMatching(
  input: PiTMatchingInput,
): PiTMatchingCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const minimumQ = minimumRequiredQ(
    input.sourceResistanceOhm,
    input.loadResistanceOhm,
  );

  if (input.targetQ < minimumQ) {
    return calculationError([
      `Set Q >= ${minimumQ.toFixed(4)} for this resistance ratio.`,
    ]);
  }

  return calculationOk(
    input.network === "pi" ? calculatePi(input) : calculateT(input),
  );
}

export function minimumRequiredQ(
  sourceResistanceOhm: number,
  loadResistanceOhm: number,
): number {
  const high = Math.max(sourceResistanceOhm, loadResistanceOhm);
  const low = Math.min(sourceResistanceOhm, loadResistanceOhm);

  return Math.sqrt(high / low - 1);
}

function calculatePi(input: PiTMatchingInput): PiTMatchingResult {
  const omega = angularFrequency(input.frequencyMHz);
  const virtualResistanceOhm =
    Math.max(input.sourceResistanceOhm, input.loadResistanceOhm) /
    (input.targetQ ** 2 + 1);
  const sourceQ = Math.sqrt(
    input.sourceResistanceOhm / virtualResistanceOhm - 1,
  );
  const loadQ = Math.sqrt(input.loadResistanceOhm / virtualResistanceOhm - 1);
  const sourceShuntS = sourceQ / input.sourceResistanceOhm;
  const loadShuntS = loadQ / input.loadResistanceOhm;
  const centerSeriesOhm = (sourceQ + loadQ) * virtualResistanceOhm;

  return {
    network: "pi",
    virtualResistanceOhm,
    sourceQ,
    loadQ,
    targetQ: input.targetQ,
    reactancesOhm: {
      centerSeries: centerSeriesOhm,
    },
    susceptancesS: {
      sourceShunt: sourceShuntS,
      loadShunt: loadShuntS,
    },
    elements: [
      shuntCapacitor("Csource", sourceShuntS, omega),
      seriesInductor("Lseries", centerSeriesOhm, omega),
      shuntCapacitor("Cload", loadShuntS, omega),
    ],
  };
}

function calculateT(input: PiTMatchingInput): PiTMatchingResult {
  const omega = angularFrequency(input.frequencyMHz);
  const virtualResistanceOhm =
    Math.min(input.sourceResistanceOhm, input.loadResistanceOhm) *
    (input.targetQ ** 2 + 1);
  const sourceQ = Math.sqrt(
    virtualResistanceOhm / input.sourceResistanceOhm - 1,
  );
  const loadQ = Math.sqrt(virtualResistanceOhm / input.loadResistanceOhm - 1);
  const sourceSeriesOhm = sourceQ * input.sourceResistanceOhm;
  const loadSeriesOhm = loadQ * input.loadResistanceOhm;
  const centerShuntS = (sourceQ + loadQ) / virtualResistanceOhm;

  return {
    network: "t",
    virtualResistanceOhm,
    sourceQ,
    loadQ,
    targetQ: input.targetQ,
    reactancesOhm: {
      sourceSeries: sourceSeriesOhm,
      loadSeries: loadSeriesOhm,
    },
    susceptancesS: {
      centerShunt: centerShuntS,
    },
    elements: [
      seriesInductor("Lsource", sourceSeriesOhm, omega),
      shuntCapacitor("Cshunt", centerShuntS, omega),
      seriesInductor("Lload", loadSeriesOhm, omega),
    ],
  };
}

function seriesInductor(
  label: string,
  reactanceOhm: number,
  omega: number,
): PiTElementValue {
  return {
    label,
    kind: "series-inductor",
    value: (reactanceOhm / omega) * 1e9,
    unit: "nH",
  };
}

function shuntCapacitor(
  label: string,
  susceptanceS: number,
  omega: number,
): PiTElementValue {
  return {
    label,
    kind: "shunt-capacitor",
    value: (susceptanceS / omega) * 1e12,
    unit: "pF",
  };
}

function angularFrequency(frequencyMHz: number): number {
  return 2 * Math.PI * frequencyMHz * 1_000_000;
}

function validateInput(input: PiTMatchingInput): string[] {
  const errors: string[] = [];

  if (input.network !== "pi" && input.network !== "t") {
    errors.push("Select Pi or T network.");
  }

  if (
    !Number.isFinite(input.sourceResistanceOhm) ||
    input.sourceResistanceOhm <= 0
  ) {
    errors.push("Set source resistance > 0 Ohm.");
  }

  if (
    !Number.isFinite(input.loadResistanceOhm) ||
    input.loadResistanceOhm <= 0
  ) {
    errors.push("Set load resistance > 0 Ohm.");
  }

  if (!Number.isFinite(input.frequencyMHz) || input.frequencyMHz <= 0) {
    errors.push("Set frequency > 0 MHz.");
  }

  if (!Number.isFinite(input.targetQ) || input.targetQ <= 0) {
    errors.push("Set Q > 0.");
  }

  return errors;
}
