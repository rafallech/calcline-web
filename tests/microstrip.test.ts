import { describe, expect, it } from "vitest";
import {
  calculateMicrostrip,
  characteristicImpedance,
  effectivePermittivity,
  guidedWavelengthMm,
  synthesizeWidthMm,
} from "@/lib/calculators/microstrip";

describe("microstrip calculator", () => {
  it("calculates analysis reference values from the technical spec", () => {
    const result = calculateMicrostrip({
      mode: "analysis",
      hMm: 1.5,
      wMm: 3.38,
      epsR: 3.5,
      fGHz: 1.8,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.mode).toBe("analysis");

    if (result.value?.mode !== "analysis") {
      throw new Error("Expected analysis result");
    }

    expect(result.value.z0Ohm).toBeCloseTo(50.339, 3);
    expect(result.value.epsEff).toBeCloseTo(2.747, 3);
    expect(result.value.lambdaMm).toBeCloseTo(100.558, 3);
  });

  it("calculates synthesis reference values from the technical spec", () => {
    const result = calculateMicrostrip({
      mode: "synthesis",
      hMm: 1.5,
      z0Ohm: 50,
      epsR: 3.5,
      fGHz: 1.8,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.mode).toBe("synthesis");

    if (result.value?.mode !== "synthesis") {
      throw new Error("Expected synthesis result");
    }

    expect(result.value.wMm).toBeCloseTo(3.389, 3);
    expect(result.value.epsEff).toBeCloseTo(2.748, 3);
    expect(result.value.lambdaMm).toBeCloseTo(100.548, 3);
  });

  it("validates analysis inputs", () => {
    const result = calculateMicrostrip({
      mode: "analysis",
      hMm: 0,
      wMm: -1,
      epsR: 0.5,
      fGHz: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set H > 0 mm.",
      "Set eps_r >= 1.",
      "Set f > 0 GHz.",
      "Set W > 0 mm.",
    ]);
  });

  it("validates synthesis inputs", () => {
    const result = calculateMicrostrip({
      mode: "synthesis",
      hMm: Number.NaN,
      z0Ohm: 0,
      epsR: 1,
      fGHz: 1.8,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual(["Set H > 0 mm.", "Set Z0 > 0 Ohm."]);
  });

  it("exposes small formula helpers for focused verification", () => {
    const epsEff = effectivePermittivity(1.5, 3.38, 3.5);
    const z0Ohm = characteristicImpedance(1.5, 3.38, epsEff);
    const wMm = synthesizeWidthMm(1.5, 50, 3.5);
    const lambdaMm = guidedWavelengthMm(1.8, epsEff);

    expect(epsEff).toBeCloseTo(2.747009297, 10);
    expect(z0Ohm).toBeCloseTo(50.3391369033, 10);
    expect(wMm).toBeCloseTo(3.3892366146, 10);
    expect(lambdaMm).toBeCloseTo(100.5584764975, 10);
  });
});
