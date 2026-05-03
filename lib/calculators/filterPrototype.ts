import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type FilterPrototypeInput = {
  order: number;
  cutoffFrequencyMHz: number;
  z0Ohm: number;
};

export type FilterPrototypeElement = {
  index: number;
  gValue: number;
  kind: "series-inductor" | "shunt-capacitor";
  label: string;
  value: number;
  unit: "H" | "F";
};

export type FilterPrototypeResult = {
  topology: "butterworth-low-pass";
  gValues: number[];
  elements: FilterPrototypeElement[];
};

export type FilterPrototypeCalculation =
  CalculatorCalculation<FilterPrototypeResult>;

export function calculateFilterPrototype(
  input: FilterPrototypeInput,
): FilterPrototypeCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const gValues = butterworthGValues(input.order);
  const angularCutoffRadPerS = 2 * Math.PI * input.cutoffFrequencyMHz * 1e6;
  const elements = gValues.slice(1, -1).map((gValue, index) => {
    const elementIndex = index + 1;
    const isSeries = elementIndex % 2 === 1;

    if (isSeries) {
      return {
        index: elementIndex,
        gValue,
        kind: "series-inductor" as const,
        label: `L${elementIndex}`,
        value: (input.z0Ohm * gValue) / angularCutoffRadPerS,
        unit: "H" as const,
      };
    }

    return {
      index: elementIndex,
      gValue,
      kind: "shunt-capacitor" as const,
      label: `C${elementIndex}`,
      value: gValue / (input.z0Ohm * angularCutoffRadPerS),
      unit: "F" as const,
    };
  });

  return calculationOk({
    topology: "butterworth-low-pass",
    gValues,
    elements,
  });
}

export function butterworthGValues(order: number): number[] {
  const values = [1];

  for (let index = 1; index <= order; index += 1) {
    values.push(2 * Math.sin(((2 * index - 1) * Math.PI) / (2 * order)));
  }

  values.push(1);

  return values;
}

function validateInput(input: FilterPrototypeInput): string[] {
  const errors: string[] = [];

  if (
    !Number.isInteger(input.order) ||
    input.order < 1 ||
    input.order > 10
  ) {
    errors.push("Set order n as an integer from 1 to 10.");
  }

  if (
    !Number.isFinite(input.cutoffFrequencyMHz) ||
    input.cutoffFrequencyMHz <= 0
  ) {
    errors.push("Set cutoff frequency > 0 MHz.");
  }

  if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  return errors;
}
