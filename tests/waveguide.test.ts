import { describe, expect, it } from "vitest";
import {
  calculateRectangularWaveguide,
  cutoffFrequencyGHz,
} from "@/lib/calculators/waveguide";

describe("rectangular waveguide calculator", () => {
  it("calculates WR-90 reference cutoff frequencies in GHz", () => {
    const result = calculateRectangularWaveguide({
      aMm: 22.86,
      bMm: 10.16,
      epsR: 1,
      m: 1,
      n: 0,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value).toEqual({
      fc10: 6.562,
      fc20: 13.123,
      fc30: 19.685,
      fc01: 14.764,
      fc02: 29.528,
      fc03: 44.291,
      fc11: 16.156,
      fc12: 30.248,
      fc13: 44.775,
      fcmn: 6.562,
      unit: "GHz",
    });
  });

  it("calculates the selected m,n mode using web-standard m along a and n along b", () => {
    const result = calculateRectangularWaveguide({
      aMm: 22.86,
      bMm: 10.16,
      epsR: 1,
      m: 1,
      n: 2,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.fcmn).toBe(30.248);
  });

  it("validates dimensions, dielectric constant, and mode indices", () => {
    const result = calculateRectangularWaveguide({
      aMm: 0,
      bMm: -1,
      epsR: 0.5,
      m: 1.2,
      n: -1,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set a > 0 mm.",
      "Set b > 0 mm.",
      "Set eps_r >= 1.",
      "Set m as a non-negative integer.",
      "Set n as a non-negative integer.",
    ]);
  });

  it("uses the equivalent AIA cutoff formula", () => {
    expect(cutoffFrequencyGHz(22.86 / 1000, 10.16 / 1000, 1, 1, 0)).toBeCloseTo(
      6.561679790026247,
      12,
    );
  });
});
