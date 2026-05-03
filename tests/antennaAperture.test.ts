import { describe, expect, it } from "vitest";
import {
  calculateAntennaAperture,
  effectiveApertureFromGain,
  gainDbiToLinear,
  gainFromEffectiveAperture,
  wavelengthFromGHz,
} from "@/lib/calculators/antennaAperture";

describe("antenna gain and effective aperture calculator", () => {
  it("calculates effective aperture from gain in dBi", () => {
    const result = calculateAntennaAperture({
      mode: "gainDbi",
      frequencyGHz: 2.4,
      gainDbi: 10,
      efficiency: 0.8,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.wavelengthM).toBeCloseTo(0.1249135242, 10);
    expect(result.value?.gainLinear).toBeCloseTo(10, 12);
    expect(result.value?.gainDbi).toBeCloseTo(10, 12);
    expect(result.value?.effectiveApertureM2).toBeCloseTo(
      0.0124167821,
      10,
    );
    expect(result.value?.directivityEstimateLinear).toBeCloseTo(12.5, 12);
    expect(result.value?.directivityEstimateDbi).toBeCloseTo(
      10.9691001301,
      10,
    );
    expect(result.value?.efficiencyUsed).toBe(0.8);
  });

  it("calculates gain from effective aperture", () => {
    const result = calculateAntennaAperture({
      mode: "effectiveAperture",
      frequencyGHz: 2.4,
      effectiveApertureM2: 0.012416782059496912,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.gainLinear).toBeCloseTo(10, 12);
    expect(result.value?.gainDbi).toBeCloseTo(10, 12);
    expect(result.value?.directivityEstimateLinear).toBeCloseTo(10, 12);
    expect(result.value?.efficiencyUsed).toBe(1);
  });

  it("validates inputs", () => {
    const result = calculateAntennaAperture({
      mode: "effectiveAperture",
      frequencyGHz: 0,
      effectiveApertureM2: -1,
      efficiency: 1.2,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set frequency > 0 GHz.",
      "Set effective aperture Ae > 0 m^2.",
      "Set efficiency > 0 and <= 1, or leave it blank.",
    ]);
  });

  it("exposes focused helper functions", () => {
    const wavelengthM = wavelengthFromGHz(2.4);
    const gainLinear = gainDbiToLinear(10);
    const apertureM2 = effectiveApertureFromGain(gainLinear, wavelengthM);

    expect(wavelengthM).toBeCloseTo(0.1249135242, 10);
    expect(gainLinear).toBeCloseTo(10, 12);
    expect(apertureM2).toBeCloseTo(0.0124167821, 10);
    expect(gainFromEffectiveAperture(apertureM2, wavelengthM)).toBeCloseTo(
      10,
      12,
    );
  });
});
