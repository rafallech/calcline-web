export type CalculatorCalculation<Result> = {
  ok: boolean;
  value?: Result;
  errors: string[];
  warnings: string[];
};

export type CalculatorResultRow = {
  label: string;
  value: string | number;
  unit?: string;
  note?: string;
};

export type CalculatorResultSection = {
  title: string;
  description?: string;
  rows: CalculatorResultRow[];
};

export type CalculatorResultSummary = {
  title: string;
  inputs: CalculatorResultRow[];
  sections: CalculatorResultSection[];
  warnings: string[];
};

export function calculationOk<Result>(
  value: Result,
  warnings: string[] = [],
): CalculatorCalculation<Result> {
  return {
    ok: true,
    value,
    errors: [],
    warnings,
  };
}

export function calculationError<Result>(
  errors: string[],
  warnings: string[] = [],
): CalculatorCalculation<Result> {
  return {
    ok: false,
    value: undefined,
    errors,
    warnings,
  };
}
