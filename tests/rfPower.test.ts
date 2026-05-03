import { describe, expect, it } from "vitest";
import {
  calculateRfPower,
  dbmToWatts,
  dbwToWatts,
  wattsToDbm,
} from "@/lib/calculators/rfPower";

describe("RF Power and dB converter", () => {
  it("converts 0 dBm to 1 mW", () => {
    const result = calculateRfPower({
      type: "dBm",
      value: 0,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.w).toBeCloseTo(0.001, 12);
    expect(result.value?.mW).toBeCloseTo(1, 12);
    expect(result.value?.dBW).toBeCloseTo(-30, 12);
  });

  it("converts 30 dBm to 1 W", () => {
    const result = calculateRfPower({
      type: "dBm",
      value: 30,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.w).toBeCloseTo(1, 12);
    expect(result.value?.mW).toBeCloseTo(1000, 9);
    expect(result.value?.dBW).toBeCloseTo(0, 12);
  });

  it("converts 0 dBW to 1 W", () => {
    const result = calculateRfPower({
      type: "dBW",
      value: 0,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.w).toBeCloseTo(1, 12);
    expect(result.value?.mW).toBeCloseTo(1000, 9);
    expect(result.value?.dBm).toBeCloseTo(30, 12);
  });

  it("calculates voltage and current for a 50 Ohm load", () => {
    const result = calculateRfPower({
      type: "W",
      value: 1,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.vrms).toBeCloseTo(Math.sqrt(50), 12);
    expect(result.value?.vpp).toBeCloseTo(20, 12);
    expect(result.value?.irms).toBeCloseTo(Math.sqrt(50) / 50, 12);
  });

  it("calculates power from Vrms and Vpp", () => {
    const fromVrms = calculateRfPower({
      type: "Vrms",
      value: Math.sqrt(50),
      z0Ohm: 50,
    });
    const fromVpp = calculateRfPower({
      type: "Vpp",
      value: 20,
      z0Ohm: 50,
    });

    expect(fromVrms.ok).toBe(true);
    expect(fromVpp.ok).toBe(true);
    expect(fromVrms.value?.w).toBeCloseTo(1, 12);
    expect(fromVpp.value?.w).toBeCloseTo(1, 12);
  });

  it("validates power, voltage, and impedance inputs", () => {
    const powerResult = calculateRfPower({
      type: "W",
      value: -1,
      z0Ohm: 0,
    });
    const voltageResult = calculateRfPower({
      type: "Vrms",
      value: -1,
      z0Ohm: 50,
    });

    expect(powerResult.ok).toBe(false);
    expect(powerResult.errors).toEqual(["Set power >= 0.", "Set Z0 > 0 Ohm."]);
    expect(voltageResult.ok).toBe(false);
    expect(voltageResult.errors).toEqual(["Set voltage >= 0."]);
  });

  it("exposes conversion helpers for focused verification", () => {
    expect(dbmToWatts(0)).toBeCloseTo(0.001, 12);
    expect(dbmToWatts(30)).toBeCloseTo(1, 12);
    expect(dbwToWatts(0)).toBeCloseTo(1, 12);
    expect(wattsToDbm(1)).toBeCloseTo(30, 12);
  });
});

