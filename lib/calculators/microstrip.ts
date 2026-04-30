import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type MicrostripAnalysisInput = {
  mode: "analysis";
  hMm: number;
  wMm: number;
  epsR: number;
  fGHz: number;
};

export type MicrostripSynthesisInput = {
  mode: "synthesis";
  hMm: number;
  z0Ohm: number;
  epsR: number;
  fGHz: number;
};

export type MicrostripInput = MicrostripAnalysisInput | MicrostripSynthesisInput;

export type MicrostripAnalysisResult = {
  mode: "analysis";
  z0Ohm: number;
  epsEff: number;
  lambdaMm: number;
};

export type MicrostripSynthesisResult = {
  mode: "synthesis";
  wMm: number;
  epsEff: number;
  lambdaMm: number;
};

export type MicrostripResult =
  | MicrostripAnalysisResult
  | MicrostripSynthesisResult;

export type MicrostripCalculation = CalculatorCalculation<MicrostripResult>;

export function calculateMicrostrip(
  input: MicrostripInput,
): MicrostripCalculation {
  const errors = validateInput(input);
  const warnings: string[] = [];

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  if (input.mode === "analysis") {
    const epsEff = effectivePermittivity(input.hMm, input.wMm, input.epsR);
    const z0Ohm = characteristicImpedance(input.hMm, input.wMm, epsEff);
    const lambdaMm = guidedWavelengthMm(input.fGHz, epsEff);

    return calculationOk(
      {
        mode: "analysis",
        z0Ohm,
        epsEff,
        lambdaMm,
      },
      warnings,
    );
  }

  const wMm = synthesizeWidthMm(input.hMm, input.z0Ohm, input.epsR);
  const epsEff = effectivePermittivity(input.hMm, wMm, input.epsR);
  const lambdaMm = guidedWavelengthMm(input.fGHz, epsEff);

  return calculationOk(
    {
      mode: "synthesis",
      wMm,
      epsEff,
      lambdaMm,
    },
    warnings,
  );
}

export function effectivePermittivity(
  hMm: number,
  wMm: number,
  epsR: number,
): number {
  // docs/technical-spec.md: Hammerstad-style eps_eff approximation used by Microstrip Analysis and Synthesis.
  return (
    (epsR + 1) / 2 +
    ((epsR - 1) / 2) * (1 / Math.sqrt(1 + (12 * hMm) / wMm))
  );
}

export function characteristicImpedance(
  hMm: number,
  wMm: number,
  epsEff: number,
): number {
  const widthRatio = wMm / hMm;

  if (widthRatio < 1) {
    // docs/technical-spec.md: narrow microstrip branch for W/H < 1.
    return (
      (60 / Math.sqrt(epsEff)) *
      Math.log((8 * hMm) / wMm + wMm / (4 * hMm))
    );
  }

  // docs/technical-spec.md: wide microstrip branch for W/H >= 1.
  return (
    (120 * Math.PI) /
    (Math.sqrt(epsEff) *
      (widthRatio + 1.393 + 0.667 * Math.log(widthRatio + 1.444)))
  );
}

export function synthesizeWidthMm(
  hMm: number,
  z0Ohm: number,
  epsR: number,
): number {
  // docs/technical-spec.md: Microstrip Synthesis computes W/H from the target Z0 using the A/B closed-form branches.
  const a =
    (z0Ohm / 60) * Math.sqrt((epsR + 1) / 2) +
    ((epsR - 1) / (epsR + 1)) * (0.23 + 0.11 / epsR);
  const b = (377 * Math.PI) / (2 * z0Ohm * Math.sqrt(epsR));
  const widthRatio1 = (8 * Math.exp(a)) / (Math.exp(2 * a) - 2);
  const widthRatio2 =
    (2 / Math.PI) *
    (b -
      1 -
      Math.log(2 * b - 1) +
      ((epsR - 1) / (2 * epsR)) *
        (Math.log(b - 1) + 0.39 - 0.61 / epsR));
  const widthRatio = Math.abs(widthRatio1) < 2 ? widthRatio1 : widthRatio2;

  return hMm * widthRatio;
}

export function guidedWavelengthMm(fGHz: number, epsEff: number): number {
  // docs/technical-spec.md: guided wavelength, lambda = c/(f sqrt(eps_eff)).
  return (0.3 / (fGHz * Math.sqrt(epsEff))) * 1000;
}

function validateInput(input: MicrostripInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.hMm) || input.hMm <= 0) {
    errors.push("Set H > 0 mm.");
  }

  if (!Number.isFinite(input.epsR) || input.epsR < 1) {
    errors.push("Set eps_r >= 1.");
  }

  if (!Number.isFinite(input.fGHz) || input.fGHz <= 0) {
    errors.push("Set f > 0 GHz.");
  }

  if (input.mode === "analysis") {
    if (!Number.isFinite(input.wMm) || input.wMm <= 0) {
      errors.push("Set W > 0 mm.");
    }
  } else if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  return errors;
}
