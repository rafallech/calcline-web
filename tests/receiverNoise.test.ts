import { describe, expect, it } from "vitest";
import {
  bandwidthToHz,
  calculateReceiverNoise,
  thermalNoiseDensityDbmPerHz,
} from "@/lib/calculators/receiverNoise";

describe("receiver noise calculator", () => {
  it("calculates thermal noise density near -174 dBm/Hz at 290 K", () => {
    expect(thermalNoiseDensityDbmPerHz(290)).toBeCloseTo(-173.9751871942, 10);
  });

  it("calculates receiver noise budget values", () => {
    const result = calculateReceiverNoise({
      bandwidth: 1,
      bandwidthUnit: "MHz",
      noiseFigureDb: 3,
      temperatureK: 290,
      requiredSnrDb: 10,
      gainDb: 20,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.bandwidthHz).toBe(1_000_000);
    expect(result.value?.thermalNoiseDensityDbmPerHz).toBeCloseTo(
      -173.9751871942,
      10,
    );
    expect(result.value?.thermalNoiseFloorDbm).toBeCloseTo(
      -113.9751871942,
      10,
    );
    expect(result.value?.noiseFloorWithNfDbm).toBeCloseTo(
      -110.9751871942,
      10,
    );
    expect(result.value?.minimumDetectableSignalDbm).toBeCloseTo(
      -100.9751871942,
      10,
    );
    expect(result.value?.sensitivityEstimateDbm).toBeCloseTo(
      -120.9751871942,
      10,
    );
  });

  it("treats omitted gain as 0 dB", () => {
    const result = calculateReceiverNoise({
      bandwidth: 1000,
      bandwidthUnit: "Hz",
      noiseFigureDb: 0,
      temperatureK: 290,
      requiredSnrDb: 0,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.gainDb).toBe(0);
    expect(result.value?.sensitivityEstimateDbm).toBeCloseTo(
      result.value?.minimumDetectableSignalDbm ?? Number.NaN,
      12,
    );
  });

  it("validates required inputs", () => {
    const result = calculateReceiverNoise({
      bandwidth: 0,
      bandwidthUnit: "MHz",
      noiseFigureDb: Number.NaN,
      temperatureK: 0,
      requiredSnrDb: Number.NaN,
      gainDb: Number.NaN,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set bandwidth > 0.",
      "Set a finite noise figure in dB.",
      "Set temperature > 0 K.",
      "Set a finite required SNR in dB.",
      "Set a finite gain in dB or leave it empty.",
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("converts bandwidth units", () => {
    expect(bandwidthToHz(2, "Hz")).toBe(2);
    expect(bandwidthToHz(2, "kHz")).toBe(2_000);
    expect(bandwidthToHz(2, "MHz")).toBe(2_000_000);
  });
});
