import { describe, expect, it } from "vitest";
import {
  calculateWilkinsonDivider,
  guidedWavelengthM,
  isolationResistorOhm,
  quarterWaveLineImpedanceOhm,
} from "@/lib/calculators/wilkinson";

describe("Wilkinson power divider calculator", () => {
  it("calculates classic 2-way equal split values for 50 Ohm", () => {
    const result = calculateWilkinsonDivider({
      z0Ohm: 50,
      fGHz: 2.4,
      epsEff: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.quarterWaveLineImpedanceOhm).toBeCloseTo(
      70.7106781187,
      10,
    );
    expect(result.value?.isolationResistorOhm).toBeCloseTo(100, 12);
    expect(result.value?.electricalLengthDeg).toBe(90);
    expect(result.value?.lambdaGM).toBeCloseTo(0.1249135242, 10);
    expect(result.value?.physicalLengthM).toBeCloseTo(0.031228381, 10);
  });

  it("uses eps_eff to shorten the physical length", () => {
    const result = calculateWilkinsonDivider({
      z0Ohm: 75,
      fGHz: 1,
      epsEff: 2.25,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.quarterWaveLineImpedanceOhm).toBeCloseTo(
      106.066017178,
      9,
    );
    expect(result.value?.isolationResistorOhm).toBeCloseTo(150, 12);
    expect(result.value?.lambdaGM).toBeCloseTo(0.1998616387, 10);
    expect(result.value?.physicalLengthM).toBeCloseTo(0.0499654097, 10);
  });

  it("validates all inputs", () => {
    const result = calculateWilkinsonDivider({
      z0Ohm: 0,
      fGHz: 0,
      epsEff: 0.5,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set Z0 > 0 Ohm.",
      "Set frequency > 0 GHz.",
      "Set eps_eff >= 1.",
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("exposes focused helpers for component checks", () => {
    expect(quarterWaveLineImpedanceOhm(50)).toBeCloseTo(70.7106781187, 10);
    expect(isolationResistorOhm(50)).toBe(100);
    expect(guidedWavelengthM(2.4, 1)).toBeCloseTo(0.1249135242, 10);
  });
});
