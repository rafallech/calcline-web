import { describe, expect, it } from "vitest";
import {
  binomialCoefficient,
  binomialSectionImpedancesOhm,
  calculateMultisectionTransformer,
  guidedWavelengthM,
} from "@/lib/calculators/multisectionTransformer";

describe("multi-section impedance transformer calculator", () => {
  it("calculates a one-section binomial transformer as quarter-wave midpoint", () => {
    const result = calculateMultisectionTransformer({
      z0Ohm: 50,
      zLOhm: 100,
      sections: 1,
      fGHz: 2.4,
      epsEff: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.sections).toHaveLength(1);
    expect(result.value?.sections[0]?.impedanceOhm).toBeCloseTo(
      70.7106781187,
      10,
    );
    expect(result.value?.lambdaGM).toBeCloseTo(0.1249135242, 10);
    expect(result.value?.sectionLengthM).toBeCloseTo(0.031228381, 10);
  });

  it("calculates three-section binomial impedances", () => {
    const result = calculateMultisectionTransformer({
      z0Ohm: 50,
      zLOhm: 100,
      sections: 3,
      fGHz: 2.4,
      epsEff: 2.25,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.sections.map((section) => section.impedanceOhm)).toEqual([
      expect.closeTo(54.5253866333, 10),
      expect.closeTo(70.7106781187, 10),
      expect.closeTo(91.7004043205, 10),
    ]);
    expect(result.value?.lambdaGM).toBeCloseTo(0.0832756828, 10);
    expect(result.value?.sectionLengthM).toBeCloseTo(0.0208189207, 10);
    expect(result.value?.bandwidthNote).toContain("Chebyshev");
  });

  it("validates all inputs", () => {
    const result = calculateMultisectionTransformer({
      z0Ohm: 0,
      zLOhm: 0,
      sections: 11,
      fGHz: 0,
      epsEff: 0.5,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set Z0 > 0 Ohm.",
      "Set ZL > 0 Ohm.",
      "Set N as an integer from 1 to 10.",
      "Set center frequency > 0 GHz.",
      "Set eps_eff >= 1.",
    ]);
  });

  it("exposes focused helper functions", () => {
    expect(binomialCoefficient(3, 0)).toBe(1);
    expect(binomialCoefficient(3, 1)).toBe(3);
    expect(binomialCoefficient(3, 2)).toBe(3);
    expect(binomialCoefficient(3, 3)).toBe(1);
    expect(binomialSectionImpedancesOhm(50, 200, 2)).toEqual([
      expect.closeTo(70.7106781187, 10),
      expect.closeTo(141.4213562373, 10),
    ]);
    expect(guidedWavelengthM(2.4, 1)).toBeCloseTo(0.1249135242, 10);
  });
});
