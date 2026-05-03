import { describe, expect, it } from "vitest";
import {
  calculateDipoleMonopole,
  wavelengthFromMHz,
} from "@/lib/calculators/dipoleMonopole";

describe("dipole and monopole antenna calculator", () => {
  it("calculates half-wave dipole dimensions", () => {
    const result = calculateDipoleMonopole({
      frequencyMHz: 300,
      velocityFactor: 0.95,
      antennaType: "halfWaveDipole",
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([
      "Dipole and monopole lengths are starting estimates; trim and tune with measurement in the final installation.",
    ]);
    expect(result.value?.freeSpaceWavelengthM).toBeCloseTo(0.9993081933, 10);
    expect(result.value?.correctedWavelengthM).toBeCloseTo(0.9493427837, 10);
    expect(result.value?.totalDipoleLengthM).toBeCloseTo(0.4746713918, 10);
    expect(result.value?.eachDipoleArmLengthM).toBeCloseTo(0.2373356959, 10);
    expect(result.value?.monopoleLengthM).toBeCloseTo(0.2373356959, 10);
    expect(result.value?.selectedLengthM).toBeCloseTo(0.4746713918, 10);
    expect(result.value?.selectedLengthLabel).toBe("total dipole length");
  });

  it("selects quarter-wave monopole length", () => {
    const result = calculateDipoleMonopole({
      frequencyMHz: 150,
      velocityFactor: 1,
      antennaType: "quarterWaveMonopole",
    });

    expect(result.ok).toBe(true);
    expect(result.value?.freeSpaceWavelengthM).toBeCloseTo(1.9986163867, 10);
    expect(result.value?.selectedLengthM).toBeCloseTo(0.4996540967, 10);
    expect(result.value?.selectedLengthLabel).toBe("monopole length");
  });

  it("validates all inputs", () => {
    const result = calculateDipoleMonopole({
      frequencyMHz: 0,
      velocityFactor: 1.2,
      antennaType: "unsupported" as never,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set frequency > 0 MHz.",
      "Set velocity factor > 0 and <= 1.",
      "Select a supported antenna type.",
    ]);
  });

  it("exposes wavelength helper", () => {
    expect(wavelengthFromMHz(300)).toBeCloseTo(0.9993081933, 10);
  });
});
