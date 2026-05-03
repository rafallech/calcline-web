import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type RfPowerInputType = "dBm" | "dBW" | "W" | "mW" | "Vrms" | "Vpp";

export type RfPowerInput = {
  type: RfPowerInputType;
  value: number;
  z0Ohm: number;
};

export type RfPowerResult = {
  dBm: number;
  dBW: number;
  w: number;
  mW: number;
  vrms: number;
  vpp: number;
  irms: number;
};

export type RfPowerCalculation = CalculatorCalculation<RfPowerResult>;

export function calculateRfPower(input: RfPowerInput): RfPowerCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const w = inputPowerW(input);
  const vrms = Math.sqrt(w * input.z0Ohm);

  return calculationOk({
    dBm: wattsToDbm(w),
    dBW: wattsToDbw(w),
    w,
    mW: w * 1000,
    vrms,
    vpp: 2 * Math.sqrt(2) * vrms,
    irms: vrms / input.z0Ohm,
  });
}

export function dbmToWatts(value: number): number {
  return 10 ** ((value - 30) / 10);
}

export function dbwToWatts(value: number): number {
  return 10 ** (value / 10);
}

export function wattsToDbm(value: number): number {
  if (value === 0) {
    return Number.NEGATIVE_INFINITY;
  }

  return 10 * Math.log10(value * 1000);
}

export function wattsToDbw(value: number): number {
  if (value === 0) {
    return Number.NEGATIVE_INFINITY;
  }

  return 10 * Math.log10(value);
}

function inputPowerW(input: RfPowerInput): number {
  switch (input.type) {
    case "dBm":
      return dbmToWatts(input.value);
    case "dBW":
      return dbwToWatts(input.value);
    case "W":
      return input.value;
    case "mW":
      return input.value / 1000;
    case "Vrms":
      return (input.value * input.value) / input.z0Ohm;
    case "Vpp": {
      const vrms = input.value / (2 * Math.sqrt(2));
      return (vrms * vrms) / input.z0Ohm;
    }
  }
}

function validateInput(input: RfPowerInput): string[] {
  const errors: string[] = [];

  if (!isRfPowerInputType(input.type)) {
    errors.push("Select a supported input type.");
  }

  if (!Number.isFinite(input.value)) {
    errors.push("Set a finite input value.");
  } else if (requiresNonNegativeValue(input.type) && input.value < 0) {
    if (input.type === "Vrms" || input.type === "Vpp") {
      errors.push("Set voltage >= 0.");
    } else {
      errors.push("Set power >= 0.");
    }
  }

  if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  return errors;
}

function isRfPowerInputType(type: string): type is RfPowerInputType {
  return (
    type === "dBm" ||
    type === "dBW" ||
    type === "W" ||
    type === "mW" ||
    type === "Vrms" ||
    type === "Vpp"
  );
}

function requiresNonNegativeValue(type: RfPowerInputType): boolean {
  return type === "W" || type === "mW" || type === "Vrms" || type === "Vpp";
}

