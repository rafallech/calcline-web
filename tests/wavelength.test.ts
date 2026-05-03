import { describe, expect, it } from "vitest";
import {
  calculateWavelength,
  frequencyToHz,
  lengthToM,
} from "@/lib/calculators/wavelength";

describe("wavelength and electrical length calculator", () => {
  it("calculates free-space and guided wavelength for a practical RF line", () => {
    const result = calculateWavelength({
      frequency: 2.4,
      frequencyUnit: "GHz",
      epsEff: 2.25,
      physicalLength: 25,
      lengthUnit: "mm",
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.lambda0M).toBeCloseTo(0.1249135242, 10);
    expect(result.value?.lambdaGM).toBeCloseTo(0.0832756828, 10);
    expect(result.value?.lengthInWavelengths).toBeCloseTo(0.3002076857, 10);
    expect(result.value?.electricalLengthDeg).toBeCloseTo(108.0747668, 7);
    expect(result.value?.electricalLengthRad).toBeCloseTo(1.8862605198, 10);
  });

  it("allows zero physical length", () => {
    const result = calculateWavelength({
      frequency: 100,
      frequencyUnit: "MHz",
      epsEff: 1,
      physicalLength: 0,
      lengthUnit: "m",
    });

    expect(result.ok).toBe(true);
    expect(result.value?.lengthInWavelengths).toBe(0);
    expect(result.value?.electricalLengthDeg).toBe(0);
    expect(result.value?.electricalLengthRad).toBe(0);
  });

  it("validates numeric inputs", () => {
    const result = calculateWavelength({
      frequency: 0,
      frequencyUnit: "GHz",
      epsEff: 0.9,
      physicalLength: -1,
      lengthUnit: "mm",
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set frequency > 0.",
      "Set eps_eff >= 1.",
      "Set physical length >= 0.",
    ]);
  });

  it("exposes unit conversion helpers for focused verification", () => {
    expect(frequencyToHz(1, "Hz")).toBe(1);
    expect(frequencyToHz(1, "kHz")).toBe(1_000);
    expect(frequencyToHz(1, "MHz")).toBe(1_000_000);
    expect(frequencyToHz(1, "GHz")).toBe(1_000_000_000);
    expect(lengthToM(1, "mm")).toBe(0.001);
    expect(lengthToM(1, "cm")).toBe(0.01);
    expect(lengthToM(1, "m")).toBe(1);
  });
});
