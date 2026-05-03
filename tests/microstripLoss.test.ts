import { describe, expect, it } from "vitest";
import {
  calculateMicrostripLoss,
  conductorLossDbPerM,
  dielectricLossDbPerM,
  microstripCharacteristicImpedanceOhm,
} from "@/lib/calculators/microstripLoss";

describe("microstrip loss calculator", () => {
  it("calculates simple attenuation over line length", () => {
    const result = calculateMicrostripLoss({
      mode: "simplified",
      attenuationDbPerM: 0.8,
      lineLengthM: 0.25,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([
      "Microstrip loss is an approximate design estimate; verify critical designs with EM simulation or measurement.",
    ]);
    expect(result.value?.dielectricLossDb).toBeUndefined();
    expect(result.value?.conductorLossDb).toBeUndefined();
    expect(result.value?.totalLossDb).toBeCloseTo(0.2, 12);
    expect(result.value?.lossPerMeterDb).toBeCloseTo(0.8, 12);
  });

  it("validates simple attenuation inputs", () => {
    const result = calculateMicrostripLoss({
      mode: "simplified",
      attenuationDbPerM: -1,
      lineLengthM: -0.1,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set attenuation >= 0 dB/m.",
      "Set line length >= 0 m.",
    ]);
  });

  it("calculates advanced approximate dielectric and conductor loss", () => {
    const result = calculateMicrostripLoss({
      mode: "advanced",
      frequencyGHz: 10,
      wMm: 2,
      hMm: 0.8,
      epsR: 3.5,
      epsEff: 2.7,
      tanDelta: 0.002,
      conductivitySPerM: 58_000_000,
      copperThicknessUm: 35,
      lineLengthM: 0.1,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.dielectricLossDb).toBeCloseTo(0.2636781029, 10);
    expect(result.value?.conductorLossDb).toBeCloseTo(0.2278457073, 10);
    expect(result.value?.totalLossDb).toBeCloseTo(0.4915238102, 10);
    expect(result.value?.lossPerMeterDb).toBeCloseTo(4.915238102, 9);
  });

  it("exposes focused advanced helper functions", () => {
    expect(
      dielectricLossDbPerM(10, 3.5, 2.7, 0.002),
    ).toBeCloseTo(2.6367810293, 10);
    expect(
      conductorLossDbPerM(10, 2, 0.8, 2.7, 58_000_000, 35),
    ).toBeCloseTo(2.2784570727, 10);
    expect(microstripCharacteristicImpedanceOhm(0.8, 2, 2.7)).toBeCloseTo(
      47.71575532,
      10,
    );
  });
});
