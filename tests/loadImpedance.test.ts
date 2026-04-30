import { describe, expect, it } from "vitest";
import { calculateLoadImpedance } from "@/lib/calculators/loadImpedance";

describe("load impedance calculator", () => {
  it("calculates normalized load impedance for a voltage minimum", () => {
    const result = calculateLoadImpedance({
      lambdaMm: 100,
      swr: 3,
      dMm: 5,
      minimumType: "voltage",
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.zL.re).toBeCloseTo(0.364251, 6);
    expect(result.value?.zL.im).toBeCloseTo(-0.285469, 6);
    expect(result.value?.r).toBe(result.value?.zL.re);
    expect(result.value?.x).toBe(result.value?.zL.im);
  });

  it("calculates normalized load impedance for a current minimum", () => {
    const result = calculateLoadImpedance({
      lambdaMm: 100,
      swr: 3,
      dMm: 5,
      minimumType: "current",
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.zL.re).toBeCloseTo(1.700746, 6);
    expect(result.value?.zL.im).toBeCloseTo(1.332898, 6);
    expect(result.value?.r).toBe(result.value?.zL.re);
    expect(result.value?.x).toBe(result.value?.zL.im);
  });

  it("validates input ranges", () => {
    const result = calculateLoadImpedance({
      lambdaMm: 0,
      swr: 0.5,
      dMm: -1,
      minimumType: "voltage",
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set lambda > 0 mm.",
      "Set d >= 0 mm.",
      "Set SWR >= 1.",
    ]);
  });
});
