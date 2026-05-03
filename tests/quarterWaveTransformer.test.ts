import { describe, expect, it } from "vitest";
import {
  calculateQuarterWaveTransformer,
  freeSpaceWavelengthM,
  guidedWavelengthM,
} from "@/lib/calculators/quarterWaveTransformer";

describe("quarter-wave transformer calculator", () => {
  it("calculates transformer impedance and quarter-wave length", () => {
    const result = calculateQuarterWaveTransformer({
      z0Ohm: 50,
      rLOhm: 100,
      fGHz: 2.4,
      epsEff: 2.25,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([
      "Basic quarter-wave transformer model assumes a purely real load resistance.",
    ]);
    expect(result.value?.ztOhm).toBeCloseTo(70.7106781187, 10);
    expect(result.value?.electricalLengthDeg).toBe(90);
    expect(result.value?.lambda0M).toBeCloseTo(0.1249135242, 10);
    expect(result.value?.lambdaGM).toBeCloseTo(0.0832756828, 10);
    expect(result.value?.physicalLengthM).toBeCloseTo(0.0208189207, 10);
  });

  it("calculates a matched transformer without changing the warning contract", () => {
    const result = calculateQuarterWaveTransformer({
      z0Ohm: 50,
      rLOhm: 50,
      fGHz: 1,
      epsEff: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.ztOhm).toBeCloseTo(50, 12);
    expect(result.value?.physicalLengthM).toBeCloseTo(0.0749481145, 10);
    expect(result.warnings.length).toBe(1);
  });

  it("validates all inputs", () => {
    const result = calculateQuarterWaveTransformer({
      z0Ohm: 0,
      rLOhm: -1,
      fGHz: 0,
      epsEff: 0.5,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set Z0 > 0 Ohm.",
      "Set RL > 0 Ohm.",
      "Set frequency > 0 GHz.",
      "Set eps_eff >= 1.",
    ]);
    expect(result.warnings).toEqual([
      "Basic quarter-wave transformer model assumes a purely real load resistance.",
    ]);
  });

  it("exposes wavelength helpers for focused verification", () => {
    const lambda0M = freeSpaceWavelengthM(2.4);

    expect(lambda0M).toBeCloseTo(0.1249135242, 10);
    expect(guidedWavelengthM(lambda0M, 2.25)).toBeCloseTo(0.0832756828, 10);
  });
});

