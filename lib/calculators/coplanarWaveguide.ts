import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type CoplanarWaveguideMode = "cpw" | "grounded";

export type CoplanarWaveguideInput = {
  mode: CoplanarWaveguideMode;
  wMm: number;
  sMm: number;
  hMm: number;
  epsR: number;
  fGHz: number;
};

export type CoplanarWaveguideResult = {
  z0Ohm: number;
  epsEff: number;
  guidedWavelengthMm: number;
};

export type CoplanarWaveguideCalculation =
  CalculatorCalculation<CoplanarWaveguideResult>;

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;
const GROUNDED_PLACEHOLDER =
  "Grounded CPW is a placeholder and requires a separate model.";

export function calculateCoplanarWaveguide(
  input: CoplanarWaveguideInput,
): CoplanarWaveguideCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  if (input.mode === "grounded") {
    return calculationError([GROUNDED_PLACEHOLDER], [GROUNDED_PLACEHOLDER]);
  }

  const epsEff = effectivePermittivity(
    input.wMm,
    input.sMm,
    input.hMm,
    input.epsR,
  );

  return calculationOk({
    z0Ohm: characteristicImpedanceOhm(input.wMm, input.sMm, epsEff),
    epsEff,
    guidedWavelengthMm: guidedWavelengthMm(input.fGHz, epsEff),
  });
}

export function effectivePermittivity(
  wMm: number,
  sMm: number,
  hMm: number,
  epsR: number,
): number {
  const k = coplanarModulus(wMm, sMm);
  const kPrime = complementaryModulus(k);
  const k1 = finiteSubstrateModulus(wMm, sMm, hMm);
  const k1Prime = complementaryModulus(k1);
  const fillingFactor =
    (completeEllipticIntegralFirstKind(k1) /
      completeEllipticIntegralFirstKind(k1Prime)) *
    (completeEllipticIntegralFirstKind(kPrime) /
      completeEllipticIntegralFirstKind(k));

  return 1 + ((epsR - 1) / 2) * fillingFactor;
}

export function characteristicImpedanceOhm(
  wMm: number,
  sMm: number,
  epsEff: number,
): number {
  const k = coplanarModulus(wMm, sMm);
  const kPrime = complementaryModulus(k);

  return (
    (30 * Math.PI) /
    Math.sqrt(epsEff) *
    (completeEllipticIntegralFirstKind(kPrime) /
      completeEllipticIntegralFirstKind(k))
  );
}

export function guidedWavelengthMm(fGHz: number, epsEff: number): number {
  return (
    (SPEED_OF_LIGHT_M_PER_S / (fGHz * 1_000_000_000 * Math.sqrt(epsEff))) *
    1000
  );
}

export function completeEllipticIntegralFirstKind(k: number): number {
  return Math.PI / (2 * arithmeticGeometricMean(1, Math.sqrt(1 - k * k)));
}

function coplanarModulus(wMm: number, sMm: number): number {
  return wMm / (wMm + 2 * sMm);
}

function finiteSubstrateModulus(wMm: number, sMm: number, hMm: number): number {
  return (
    Math.sinh((Math.PI * wMm) / (4 * hMm)) /
    Math.sinh((Math.PI * (wMm + 2 * sMm)) / (4 * hMm))
  );
}

function complementaryModulus(k: number): number {
  return Math.sqrt(1 - k * k);
}

function arithmeticGeometricMean(a: number, b: number): number {
  let currentA = a;
  let currentB = b;

  for (let index = 0; index < 32; index += 1) {
    const nextA = (currentA + currentB) / 2;
    const nextB = Math.sqrt(currentA * currentB);

    if (Math.abs(nextA - nextB) <= Number.EPSILON * nextA) {
      return nextA;
    }

    currentA = nextA;
    currentB = nextB;
  }

  return (currentA + currentB) / 2;
}

function validateInput(input: CoplanarWaveguideInput): string[] {
  const errors: string[] = [];

  if (input.mode !== "cpw" && input.mode !== "grounded") {
    errors.push("Select CPW or grounded CPW mode.");
  }

  if (!Number.isFinite(input.wMm) || input.wMm <= 0) {
    errors.push("Set W > 0 mm.");
  }

  if (!Number.isFinite(input.sMm) || input.sMm <= 0) {
    errors.push("Set S > 0 mm.");
  }

  if (!Number.isFinite(input.hMm) || input.hMm <= 0) {
    errors.push("Set h > 0 mm.");
  }

  if (!Number.isFinite(input.epsR) || input.epsR < 1) {
    errors.push("Set eps_r >= 1.");
  }

  if (!Number.isFinite(input.fGHz) || input.fGHz <= 0) {
    errors.push("Set frequency > 0 GHz.");
  }

  return errors;
}
