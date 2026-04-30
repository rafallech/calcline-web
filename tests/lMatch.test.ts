import { describe, expect, it } from "vitest";
import { calculateLMatch } from "@/lib/calculators/lMatch";

describe("L-section matching calculator", () => {
  it("calculates both solutions when R_L >= Z0", () => {
    const result = calculateLMatch({
      rL: 200,
      xL: -100,
      z0Ohm: 100,
      fMHz: 500,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.solution1.xOhm).toBeCloseTo(122.4744871392, 10);
    expect(result.value?.solution1.bS).toBeCloseTo(0.0028989795, 10);
    expect(result.value?.solution1.bMs).toBeCloseTo(2.8989794856, 10);
    expect(result.value?.solution1.seriesElement).toMatchObject({
      type: "Ls",
      unit: "nH",
    });
    expect(result.value?.solution1.seriesElement.value).toBeCloseTo(38.9848400617, 10);
    expect(result.value?.solution1.parallelElement).toMatchObject({
      type: "Cp",
      unit: "pF",
    });
    expect(result.value?.solution1.parallelElement.value).toBeCloseTo(0.9227738301, 10);

    expect(result.value?.solution2.xOhm).toBeCloseTo(-122.4744871392, 10);
    expect(result.value?.solution2.bS).toBeCloseTo(-0.0068989795, 10);
    expect(result.value?.solution2.bMs).toBeCloseTo(-6.8989794856, 10);
    expect(result.value?.solution2.seriesElement).toMatchObject({
      type: "Cs",
      unit: "pF",
    });
    expect(result.value?.solution2.seriesElement.value).toBeCloseTo(2.5989893374, 10);
    expect(result.value?.solution2.parallelElement).toMatchObject({
      type: "Lp",
      unit: "nH",
    });
    expect(result.value?.solution2.parallelElement.value).toBeCloseTo(46.138691505, 10);
  });

  it("calculates both solutions when R_L < Z0", () => {
    const result = calculateLMatch({
      rL: 50,
      xL: 25,
      z0Ohm: 100,
      fMHz: 500,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.solution1.xOhm).toBeCloseTo(25, 12);
    expect(result.value?.solution1.bS).toBeCloseTo(0.01, 12);
    expect(result.value?.solution1.bMs).toBeCloseTo(10, 12);
    expect(result.value?.solution1.seriesElement.type).toBe("Ls");
    expect(result.value?.solution1.seriesElement.value).toBeCloseTo(7.9577471546, 10);
    expect(result.value?.solution1.parallelElement.type).toBe("Cp");
    expect(result.value?.solution1.parallelElement.value).toBeCloseTo(3.1830988618, 10);

    expect(result.value?.solution2.xOhm).toBeCloseTo(-75, 12);
    expect(result.value?.solution2.bS).toBeCloseTo(-0.01, 12);
    expect(result.value?.solution2.bMs).toBeCloseTo(-10, 12);
    expect(result.value?.solution2.seriesElement.type).toBe("Cs");
    expect(result.value?.solution2.seriesElement.value).toBeCloseTo(4.2441318158, 10);
    expect(result.value?.solution2.parallelElement.type).toBe("Lp");
    expect(result.value?.solution2.parallelElement.value).toBeCloseTo(31.8309886184, 10);
  });

  it("validates input ranges", () => {
    const result = calculateLMatch({
      rL: 0,
      xL: Number.NaN,
      z0Ohm: 0,
      fMHz: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set Z0 > 0 Ohm.",
      "Set R_L > 0 Ohm for L-section matching.",
      "Set X_L as a finite number.",
      "Set f > 0 MHz.",
    ]);
  });

  it("returns a readable square-root error for invalid radicands", () => {
    const result = calculateLMatch({
      rL: 50,
      xL: 0,
      z0Ohm: 100,
      fMHz: 500,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);

    const impossible = calculateLMatch({
      rL: -1,
      xL: 0,
      z0Ohm: 100,
      fMHz: 500,
    });

    expect(impossible.ok).toBe(false);
    expect(impossible.errors).toEqual(["Set R_L >= 0 Ohm."]);
  });

  it("reports non-finite matching solutions, such as an already matched load", () => {
    const result = calculateLMatch({
      rL: 100,
      xL: 0,
      z0Ohm: 100,
      fMHz: 500,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set input values that produce finite L-section matching solutions.",
    ]);
  });
});
