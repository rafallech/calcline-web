import { describe, expect, it } from "vitest";
import {
  calculateSingleStub,
  parBX,
  parT1,
  parT2,
  valD,
} from "@/lib/calculators/singleStub";

describe("single stub helper functions", () => {
  it("calculates parT1 and parT2 for the general case", () => {
    expect(parT1(75, 25, 50)).toBeCloseTo(2.7320508075688767, 12);
    expect(parT2(75, 25, 50)).toBeCloseTo(-0.7320508075688772, 12);
  });

  it("uses the equal R and ZY0 branch for parT1 and parT2", () => {
    expect(parT1(50, 25, 50)).toBeCloseTo(-0.25, 12);
    expect(parT2(50, 25, 50)).toBeCloseTo(-0.25, 12);
  });

  it("calculates valD for negative, positive, and zero t", () => {
    expect(valD(-1)).toBeCloseTo(0.375, 12);
    expect(valD(1)).toBeCloseTo(0.125, 12);
    expect(valD(0)).toBeCloseTo(0, 12);
  });

  it("calculates parBX for both matching solutions", () => {
    const t1 = parT1(75, 25, 50);
    const t2 = parT2(75, 25, 50);

    expect(parBX(75, 25, 50, t1)).toBeCloseTo(0.011547005383792514, 12);
    expect(parBX(75, 25, 50, t2)).toBeCloseTo(-0.011547005383792514, 12);
  });

  it("handles R = 0 without altering the input value", () => {
    expect(parT1(0, 25, 50)).toBeCloseTo(-0.5, 12);
    expect(parT2(0, 25, 50)).toBeCloseTo(-0.5, 12);
  });

  it("calculates Single Open Stub Shunt solutions", () => {
    const result = calculateSingleStub({
      configuration: "openShunt",
      rL: 75,
      xL: 25,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.solution1.dOverLambda).toBeCloseTo(0.1941558073, 10);
    expect(result.value?.solution1.lOverLambda).toBeCloseTo(0.4166666667, 10);
    expect(result.value?.solution2.dOverLambda).toBeCloseTo(0.3994277136, 10);
    expect(result.value?.solution2.lOverLambda).toBeCloseTo(0.0833333333, 10);
  });

  it("calculates Single Short Stub Shunt solutions", () => {
    const result = calculateSingleStub({
      configuration: "shortShunt",
      rL: 75,
      xL: 25,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.solution1.dOverLambda).toBeCloseTo(0.1941558073, 10);
    expect(result.value?.solution1.lOverLambda).toBeCloseTo(0.1666666667, 10);
    expect(result.value?.solution2.dOverLambda).toBeCloseTo(0.3994277136, 10);
    expect(result.value?.solution2.lOverLambda).toBeCloseTo(0.3333333333, 10);
  });

  it("calculates Single Open Stub Series solutions", () => {
    const result = calculateSingleStub({
      configuration: "openSeries",
      rL: 75,
      xL: 25,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.solution1.dOverLambda).toBeCloseTo(0.4441558073, 10);
    expect(result.value?.solution1.lOverLambda).toBeCloseTo(0.1666666667, 10);
    expect(result.value?.solution2.dOverLambda).toBeCloseTo(0.1494277136, 10);
    expect(result.value?.solution2.lOverLambda).toBeCloseTo(0.3333333333, 10);
  });

  it("calculates Single Short Stub Series solutions", () => {
    const result = calculateSingleStub({
      configuration: "shortSeries",
      rL: 75,
      xL: 25,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.solution1.dOverLambda).toBeCloseTo(0.4441558073, 10);
    expect(result.value?.solution1.lOverLambda).toBeCloseTo(0.4166666667, 10);
    expect(result.value?.solution2.dOverLambda).toBeCloseTo(0.1494277136, 10);
    expect(result.value?.solution2.lOverLambda).toBeCloseTo(0.0833333333, 10);
  });

  it("validates full calculator inputs", () => {
    const result = calculateSingleStub({
      configuration: "openSeries",
      rL: -1,
      xL: Number.NaN,
      z0Ohm: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set R_L >= 0 Ohm.",
      "Set X_L as a finite number.",
      "Set Z0 > 0 Ohm.",
    ]);
  });
});
