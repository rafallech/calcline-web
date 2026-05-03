import { describe, expect, it } from "vitest";
import {
  calculateHornAntenna,
  directivityFromAperture,
  wavelengthFromGHz,
} from "@/lib/calculators/hornAntenna";

describe("horn antenna calculator", () => {
  it("calculates aperture gain and approximate beamwidth", () => {
    const result = calculateHornAntenna({
      frequencyGHz: 10,
      apertureWidthMm: 100,
      apertureHeightMm: 50,
      apertureEfficiency: 0.6,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([
      "Horn antenna gain and beamwidth are aperture approximations; verify final designs with EM simulation or measurement.",
    ]);
    expect(result.value?.wavelengthM).toBeCloseTo(0.0299792458, 12);
    expect(result.value?.apertureAreaM2).toBeCloseTo(0.005, 12);
    expect(result.value?.directivityLinear).toBeCloseTo(69.9098648423, 10);
    expect(result.value?.gainLinear).toBeCloseTo(41.9459189054, 10);
    expect(result.value?.gainDbi).toBeCloseTo(16.2268971289, 10);
    expect(result.value?.beamwidthEPlaneDeg).toBeCloseTo(33.576755296, 10);
    expect(result.value?.beamwidthHPlaneDeg).toBeCloseTo(20.086094686, 10);
  });

  it("allows unity aperture efficiency", () => {
    const result = calculateHornAntenna({
      frequencyGHz: 10,
      apertureWidthMm: 100,
      apertureHeightMm: 50,
      apertureEfficiency: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.gainLinear).toBeCloseTo(
      result.value?.directivityLinear ?? Number.NaN,
      12,
    );
  });

  it("validates all inputs", () => {
    const result = calculateHornAntenna({
      frequencyGHz: 0,
      apertureWidthMm: 0,
      apertureHeightMm: -1,
      apertureEfficiency: 1.2,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set frequency > 0 GHz.",
      "Set aperture width > 0 mm.",
      "Set aperture height > 0 mm.",
      "Set aperture efficiency > 0 and <= 1.",
    ]);
  });

  it("exposes focused helper functions", () => {
    expect(wavelengthFromGHz(10)).toBeCloseTo(0.0299792458, 12);
    expect(directivityFromAperture(0.005, 0.0299792458)).toBeCloseTo(
      69.9098648423,
      10,
    );
  });
});
