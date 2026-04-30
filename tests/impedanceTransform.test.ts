import { describe, expect, it } from "vitest";
import { calculateImpedanceTransform } from "@/lib/calculators/impedanceTransform";

describe("impedance transformation calculator", () => {
  it("transforms normalized impedance towards generator", () => {
    const result = calculateImpedanceTransform({
      lambdaMm: 100,
      rL: 2,
      xL: 3,
      dMm: 10,
      direction: "generator",
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.zTransformed.re).toBeCloseTo(0.872323, 6);
    expect(result.value?.zTransformed.im).toBeCloseTo(-2.084542, 6);
    expect(result.value?.r).toBe(result.value?.zTransformed.re);
    expect(result.value?.x).toBe(result.value?.zTransformed.im);
  });

  it("transforms normalized impedance towards load by negating distance", () => {
    const result = calculateImpedanceTransform({
      lambdaMm: 100,
      rL: 2,
      xL: 3,
      dMm: 10,
      direction: "load",
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.zTransformed.re).toBeCloseTo(0.250029, 6);
    expect(result.value?.zTransformed.im).toBeCloseTo(0.82927, 6);
    expect(result.value?.r).toBe(result.value?.zTransformed.re);
    expect(result.value?.x).toBe(result.value?.zTransformed.im);
  });

  it("returns unchanged impedance when distance is zero", () => {
    const result = calculateImpedanceTransform({
      lambdaMm: 100,
      rL: 2,
      xL: 3,
      dMm: 0,
      direction: "generator",
    });

    expect(result.ok).toBe(true);
    expect(result.value?.zTransformed).toEqual({ re: 2, im: 3 });
  });

  it("validates input ranges", () => {
    const result = calculateImpedanceTransform({
      lambdaMm: 0,
      rL: -1,
      xL: Number.NaN,
      dMm: -1,
      direction: "generator",
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set lambda > 0 mm.",
      "Set R_L / Z0 >= 0.",
      "Set X_L / Z0 as a finite number.",
      "Set d >= 0 mm.",
    ]);
  });
});
