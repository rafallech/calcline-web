export type CalculatorCalculation<Result> = {
  ok: boolean;
  value?: Result;
  errors: string[];
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
