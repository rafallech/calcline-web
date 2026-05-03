import { describe, expect, it } from "vitest";
import {
  attenuationDbToPowerRatio,
  attenuationDbToVoltageRatio,
  calculateAttenuator,
  calculatePiResistors,
  calculateTResistors,
} from "@/lib/calculators/attenuators";

describe("resistive attenuators calculator", () => {
  it("calculates a 6 dB T attenuator for 50 Ohm", () => {
    const result = calculateAttenuator({
      topology: "t",
      z0Ohm: 50,
      attenuationDb: 6,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.voltageRatio).toBeCloseTo(1.995262315, 9);
    expect(result.value?.powerRatio).toBeCloseTo(3.9810717055, 10);
    expect(result.value?.resistors.topology).toBe("t");

    if (result.value?.resistors.topology !== "t") {
      throw new Error("Expected T attenuator");
    }

    expect(result.value.resistors.rSeriesInputOhm).toBeCloseTo(16.61394246, 8);
    expect(result.value.resistors.rSeriesOutputOhm).toBeCloseTo(16.61394246, 8);
    expect(result.value.resistors.rShuntOhm).toBeCloseTo(66.93104065, 8);
  });

  it("calculates a 6 dB Pi attenuator for 50 Ohm", () => {
    const result = calculateAttenuator({
      topology: "pi",
      z0Ohm: 50,
      attenuationDb: 6,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.resistors.topology).toBe("pi");

    if (result.value?.resistors.topology !== "pi") {
      throw new Error("Expected Pi attenuator");
    }

    expect(result.value.resistors.rSeriesOhm).toBeCloseTo(37.35187703, 8);
    expect(result.value.resistors.rShuntInputOhm).toBeCloseTo(150.47602375, 8);
    expect(result.value.resistors.rShuntOutputOhm).toBeCloseTo(150.47602375, 8);
  });

  it("validates impedance and attenuation", () => {
    const result = calculateAttenuator({
      topology: "pi",
      z0Ohm: 0,
      attenuationDb: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual(["Set Z0 > 0 Ohm.", "Set attenuation > 0 dB."]);
  });

  it("exposes helper formulas for focused verification", () => {
    const voltageRatio = attenuationDbToVoltageRatio(20);
    const powerRatio = attenuationDbToPowerRatio(20);
    const pi = calculatePiResistors(50, voltageRatio);
    const t = calculateTResistors(50, voltageRatio);

    expect(voltageRatio).toBeCloseTo(10, 12);
    expect(powerRatio).toBeCloseTo(100, 12);
    expect(pi.rSeriesOhm).toBeCloseTo(247.5, 12);
    expect(pi.rShuntInputOhm).toBeCloseTo(61.1111111111, 10);
    expect(t.rSeriesInputOhm).toBeCloseTo(40.9090909091, 10);
    expect(t.rShuntOhm).toBeCloseTo(10.101010101, 10);
  });
});
