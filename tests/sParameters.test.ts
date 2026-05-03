import { describe, expect, it } from "vitest";
import {
  calculateSParameters,
  dbToMagnitude,
  magnitudeToDb,
} from "@/lib/calculators/sParameters";

describe("S-parameter converter", () => {
  it("calculates reflection metrics from S11 magnitude and angle", () => {
    const result = calculateSParameters({
      s11Format: "magnitude",
      s11Value: 0.5,
      s11AngleDeg: 60,
      s21Format: "magnitude",
      s21Value: 2,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.gamma.re).toBeCloseTo(0.25, 12);
    expect(result.value?.gamma.im).toBeCloseTo(0.4330127019, 10);
    expect(result.value?.returnLossDb).toBeCloseTo(6.0205999133, 10);
    expect(result.value?.vswr).toBeCloseTo(3, 12);
    expect(result.value?.reflectedPowerPercent).toBeCloseTo(25, 12);
    expect(result.value?.mismatchLossDb).toBeCloseTo(1.2493873661, 10);
    expect(result.value?.s21Linear).toBeCloseTo(2, 12);
    expect(result.value?.s21Db).toBeCloseTo(6.0205999133, 10);
    expect(result.value?.transferKind).toBe("gain");
    expect(result.value?.transferDb).toBeCloseTo(6.0205999133, 10);
  });

  it("calculates from S11 dB and S21 dB", () => {
    const result = calculateSParameters({
      s11Format: "dB",
      s11Value: -20,
      s11AngleDeg: -450,
      s21Format: "dB",
      s21Value: -3,
      z0Ohm: 75,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.s11Magnitude).toBeCloseTo(0.1, 12);
    expect(result.value?.returnLossDb).toBeCloseTo(20, 12);
    expect(result.value?.vswr).toBeCloseTo(1.2222222222, 10);
    expect(result.value?.reflectedPowerPercent).toBeCloseTo(1, 12);
    expect(result.value?.mismatchLossDb).toBeCloseTo(0.043648054, 9);
    expect(result.value?.s21Linear).toBeCloseTo(0.7079457844, 10);
    expect(result.value?.s21Db).toBeCloseTo(-3, 12);
    expect(result.value?.transferKind).toBe("insertionLoss");
    expect(result.value?.transferDb).toBeCloseTo(3, 12);
  });

  it("handles perfect input match and zero S21", () => {
    const result = calculateSParameters({
      s11Format: "magnitude",
      s11Value: 0,
      s11AngleDeg: 0,
      s21Format: "magnitude",
      s21Value: 0,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.returnLossDb).toBe(Number.POSITIVE_INFINITY);
    expect(result.value?.vswr).toBe(1);
    expect(result.value?.mismatchLossDb).toBeCloseTo(0, 12);
    expect(result.value?.s21Db).toBe(Number.NEGATIVE_INFINITY);
  });

  it("validates passive S11 magnitude and Z0", () => {
    const result = calculateSParameters({
      s11Format: "magnitude",
      s11Value: 1,
      s11AngleDeg: 0,
      s21Format: "magnitude",
      s21Value: -1,
      z0Ohm: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set Z0 > 0 Ohm.",
      "Set |S21| >= 0.",
    ]);
  });

  it("validates converted S11 dB magnitude", () => {
    const result = calculateSParameters({
      s11Format: "dB",
      s11Value: 0,
      s11AngleDeg: 0,
      s21Format: "dB",
      s21Value: 0,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(["Set |S11| < 1 for the passive case."]);
  });

  it("exposes magnitude and dB helpers", () => {
    expect(dbToMagnitude(-20)).toBeCloseTo(0.1, 12);
    expect(dbToMagnitude(6)).toBeCloseTo(1.995262315, 9);
    expect(magnitudeToDb(0.5)).toBeCloseTo(-6.0205999133, 10);
  });
});

