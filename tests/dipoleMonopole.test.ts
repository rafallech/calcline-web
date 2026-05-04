import { describe, expect, it } from "vitest";
import {
  calculateFoldedDipole,
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
      "Set frequency > 0.",
      "Set velocity factor > 0 and <= 1.",
      "Select a supported antenna type.",
    ]);
  });

  it("exposes wavelength helper", () => {
    expect(wavelengthFromMHz(300)).toBeCloseTo(0.9993081933, 10);
  });

  it("calculates positive folded dipole dimensions at 100 MHz", () => {
    const result = calculateDipoleMonopole({
      antennaType: "foldedDipole",
      frequency: 100,
      frequencyUnit: "MHz",
      velocityFactor: 0.95,
      rodDiameterMm: 6,
      spacingMm: 50,
      feedGapMm: 20,
      feedLineImpedanceOhm: 75,
      matchingOption: "4To1Balun",
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([
      "Folded dipole impedance is approximate.",
      "Dimensions depend on conductor diameter and mounting.",
      "Verify final antenna by measurement or NEC simulation.",
    ]);
    expect(result.value?.foldedDipole?.freeSpaceWavelengthM).toBeCloseTo(
      2.99792458,
      10,
    );
    expect(result.value?.foldedDipole?.correctedWavelengthM).toBeCloseTo(
      2.848028351,
      10,
    );
    expect(result.value?.foldedDipole?.overallLengthM).toBeGreaterThan(0);
    expect(result.value?.foldedDipole?.straightSectionLengthM).toBeGreaterThan(0);
    expect(result.value?.foldedDipole?.totalConductorLengthM).toBeGreaterThan(0);
    expect(result.value?.foldedDipole?.geometry.aMm).toBeGreaterThan(0);
    expect(result.value?.foldedDipole?.geometry.bMm).toBe(20);
    expect(result.value?.foldedDipole?.geometry.rMm).toBe(25);
  });

  it("estimates folded dipole impedance as 4 times straight dipole impedance", () => {
    const result = calculateFoldedDipole({
      antennaType: "foldedDipole",
      frequency: 100,
      frequencyUnit: "MHz",
      velocityFactor: 0.95,
      rodDiameterMm: 6,
      spacingMm: 50,
      feedGapMm: 20,
      feedLineImpedanceOhm: 75,
      matchingOption: "none",
    });

    const folded = result.value?.foldedDipole;

    expect(result.ok).toBe(true);
    expect(folded?.estimatedStraightDipoleImpedanceOhm).toBe(73);
    expect(folded?.estimatedFoldedDipoleImpedanceOhm).toBe(
      (folded?.estimatedStraightDipoleImpedanceOhm ?? Number.NaN) * 4,
    );
  });

  it("divides folded dipole impedance by 4 for a 4:1 balun", () => {
    const result = calculateDipoleMonopole({
      antennaType: "foldedDipole",
      frequency: 100,
      frequencyUnit: "MHz",
      velocityFactor: 0.95,
      rodDiameterMm: 6,
      spacingMm: 50,
      feedGapMm: 20,
      feedLineImpedanceOhm: 75,
      matchingOption: "4To1Balun",
    });

    expect(result.ok).toBe(true);
    expect(result.value?.foldedDipole?.estimatedFoldedDipoleImpedanceOhm).toBe(
      292,
    );
    expect(result.value?.foldedDipole?.transformedImpedanceOhm).toBe(73);
  });

  it("calculates quarter-wave transformer impedance and length", () => {
    const result = calculateDipoleMonopole({
      antennaType: "foldedDipole",
      frequency: 100,
      frequencyUnit: "MHz",
      velocityFactor: 0.95,
      rodDiameterMm: 6,
      spacingMm: 50,
      feedGapMm: 20,
      feedLineImpedanceOhm: 50,
      matchingOption: "quarterWaveTransformer",
    });

    expect(result.ok).toBe(true);
    expect(
      result.value?.foldedDipole?.quarterWaveTransformerImpedanceOhm,
    ).toBeCloseTo(Math.sqrt(292 * 50), 12);
    expect(result.value?.foldedDipole?.quarterWaveTransformerLengthM).toBeCloseTo(
      0.71200708775,
      10,
    );
  });

  it("rejects spacing that is too large relative to frequency", () => {
    const result = calculateDipoleMonopole({
      antennaType: "foldedDipole",
      frequency: 100,
      frequencyUnit: "MHz",
      velocityFactor: 0.95,
      rodDiameterMm: 6,
      spacingMm: 2000,
      feedGapMm: 20,
      feedLineImpedanceOhm: 75,
      matchingOption: "4To1Balun",
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Set spacing smaller relative to frequency.");
  });

  it("rejects non-positive folded dipole frequency", () => {
    const result = calculateDipoleMonopole({
      antennaType: "foldedDipole",
      frequency: 0,
      frequencyUnit: "MHz",
      velocityFactor: 0.95,
      rodDiameterMm: 6,
      spacingMm: 50,
      feedGapMm: 20,
      feedLineImpedanceOhm: 75,
      matchingOption: "4To1Balun",
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Set frequency > 0.");
  });
});
