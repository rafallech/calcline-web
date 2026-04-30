import {
  abs as complexAbs,
  add,
  argDeg,
  div,
  fromPolar,
  isFiniteComplex,
  mul,
  sub,
  type Complex,
} from "@/lib/math/complex";
import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type VswrInput =
  | {
      type: "vswr";
      z0Ohm: number;
      vswr: number;
      argGammaDeg: number;
    }
  | {
      type: "gammaPolar";
      z0Ohm: number;
      magGamma: number;
      argGammaDeg: number;
    }
  | {
      type: "gammaRect";
      z0Ohm: number;
      reGamma: number;
      imGamma: number;
    }
  | {
      type: "normalizedImpedance";
      z0Ohm: number;
      r: number;
      x: number;
    }
  | {
      type: "normalizedAdmittance";
      z0Ohm: number;
      g: number;
      b: number;
    }
  | {
      type: "impedance";
      z0Ohm: number;
      rOhm: number;
      xOhm: number;
    }
  | {
      type: "admittance";
      z0Ohm: number;
      gS: number;
      bS: number;
    };

export type VswrResult = {
  vswr: number;
  magGamma: number;
  argGammaDeg: number;
  gamma: Complex;
  z: Complex;
  y: Complex;
  Z: Complex;
  Y: Complex;
};

export type VswrCalculation = CalculatorCalculation<VswrResult>;

const ONE: Complex = { re: 1, im: 0 };

export function calculateVswr(input: VswrInput): VswrCalculation {
  const errors = validateInput(input);
  const warnings: string[] = [];

  if (errors.length > 0) {
    return calculationError(errors, warnings);
  }

  const gamma = gammaFromInput(input);
  const magGamma = complexAbs(gamma);

  if (!isFiniteComplex(gamma) || !Number.isFinite(magGamma) || magGamma >= 1) {
    return calculationError(
      [
        ...errors,
        "Set input values that produce |Gamma| < 1.",
      ],
      warnings,
    );
  }

  const oneMinusGamma = sub(ONE, gamma);
  const onePlusGamma = add(ONE, gamma);
  // docs/technical-spec.md: normalized impedance/admittance from reflection coefficient.
  const z = div(onePlusGamma, oneMinusGamma);
  const y = div(ONE, z);
  const Z = scaleComplex(z, input.z0Ohm);
  const Y = scaleComplex(y, 1 / input.z0Ohm);

  if (!isFiniteComplex(z) || !isFiniteComplex(y) || !isFiniteComplex(Z) || !isFiniteComplex(Y)) {
    return calculationError(
      [
        ...errors,
        "Set input values that produce finite impedance and admittance.",
      ],
      warnings,
    );
  }

  return calculationOk(
    {
      vswr: (1 + magGamma) / (1 - magGamma),
      magGamma,
      argGammaDeg: argDeg(gamma),
      gamma,
      z,
      y,
      Z,
      Y,
    },
    warnings,
  );
}

function validateInput(input: VswrInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.z0Ohm) || input.z0Ohm <= 0) {
    errors.push("Set Z0 > 0 Ohm.");
  }

  switch (input.type) {
    case "vswr":
      if (!Number.isFinite(input.vswr) || input.vswr < 1) {
        errors.push("Set VSWR >= 1.");
      }
      if (!Number.isFinite(input.argGammaDeg)) {
        errors.push("Set arg(Gamma) as a finite angle in degrees.");
      }
      break;
    case "gammaPolar":
      if (!Number.isFinite(input.magGamma) || input.magGamma < 0 || input.magGamma >= 1) {
        errors.push("Set 0 <= |Gamma| < 1.");
      }
      if (!Number.isFinite(input.argGammaDeg)) {
        errors.push("Set arg(Gamma) as a finite angle in degrees.");
      }
      break;
    case "gammaRect": {
      const gamma = { re: input.reGamma, im: input.imGamma };
      if (!isFiniteComplex(gamma)) {
        errors.push("Set Re(Gamma) and Im(Gamma) as finite numbers.");
      } else if (complexAbs(gamma) >= 1) {
        errors.push("Set sqrt(Re(Gamma)^2 + Im(Gamma)^2) < 1.");
      }
      break;
    }
    case "normalizedImpedance":
      if (!Number.isFinite(input.r) || input.r < 0) {
        errors.push("Set r >= 0.");
      }
      if (!Number.isFinite(input.x)) {
        errors.push("Set x as a finite number.");
      }
      break;
    case "normalizedAdmittance":
      if (!Number.isFinite(input.g) || input.g < 0) {
        errors.push("Set g >= 0.");
      }
      if (!Number.isFinite(input.b)) {
        errors.push("Set b as a finite number.");
      }
      if (input.g === 0 && input.b === 0) {
        errors.push("Set normalized admittance magnitude > 0.");
      }
      break;
    case "impedance":
      if (!Number.isFinite(input.rOhm) || input.rOhm < 0) {
        errors.push("Set R >= 0 Ohm.");
      }
      if (!Number.isFinite(input.xOhm)) {
        errors.push("Set X as a finite number.");
      }
      break;
    case "admittance":
      if (!Number.isFinite(input.gS) || input.gS < 0) {
        errors.push("Set G >= 0 S.");
      }
      if (!Number.isFinite(input.bS)) {
        errors.push("Set B as a finite number.");
      }
      if (input.gS === 0 && input.bS === 0) {
        errors.push("Set admittance magnitude > 0 S.");
      }
      break;
  }

  return errors;
}

function gammaFromInput(input: VswrInput): Complex {
  switch (input.type) {
    case "vswr":
      // docs/technical-spec.md: |Gamma| = (VSWR - 1) / (VSWR + 1), then polar-to-rectangular.
      return fromPolar((input.vswr - 1) / (input.vswr + 1), input.argGammaDeg);
    case "gammaPolar":
      return fromPolar(input.magGamma, input.argGammaDeg);
    case "gammaRect":
      return { re: input.reGamma, im: input.imGamma };
    case "normalizedImpedance":
      return gammaFromNormalizedImpedance({ re: input.r, im: input.x });
    case "normalizedAdmittance":
      return gammaFromNormalizedAdmittance({ re: input.g, im: input.b });
    case "impedance":
      return gammaFromNormalizedImpedance({
        re: input.rOhm / input.z0Ohm,
        im: input.xOhm / input.z0Ohm,
      });
    case "admittance":
      return gammaFromNormalizedAdmittance({
        re: input.gS * input.z0Ohm,
        im: input.bS * input.z0Ohm,
      });
  }
}

function gammaFromNormalizedImpedance(z: Complex): Complex {
  // docs/technical-spec.md: Gamma = (z - 1) / (z + 1).
  return div(sub(z, ONE), add(z, ONE));
}

function gammaFromNormalizedAdmittance(y: Complex): Complex {
  // docs/technical-spec.md: admittance input is converted through z = 1 / y before Gamma.
  const z = div(ONE, y);

  return gammaFromNormalizedImpedance(z);
}

function scaleComplex(value: Complex, factor: number): Complex {
  return mul(value, { re: factor, im: 0 });
}
