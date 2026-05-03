import { describe, expect, it } from "vitest";
import {
  calculatePiTMatching,
  minimumRequiredQ,
} from "@/lib/calculators/piTMatching";

describe("Pi and T matching calculator", () => {
  it("calculates a Pi matching network", () => {
    const result = calculatePiTMatching({
      network: "pi",
      sourceResistanceOhm: 50,
      loadResistanceOhm: 200,
      frequencyMHz: 100,
      targetQ: 3,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.virtualResistanceOhm).toBeCloseTo(20, 12);
    expect(result.value?.sourceQ).toBeCloseTo(1.2247448714, 10);
    expect(result.value?.loadQ).toBeCloseTo(3, 12);
    expect(result.value?.reactancesOhm.centerSeries).toBeCloseTo(
      84.4948974278,
      10,
    );
    expect(result.value?.susceptancesS.sourceShunt).toBeCloseTo(
      0.0244948974,
      10,
    );
    expect(result.value?.susceptancesS.loadShunt).toBeCloseTo(0.015, 12);
    expect(result.value?.elements.map((element) => element.label)).toEqual([
      "Csource",
      "Lseries",
      "Cload",
    ]);
    expect(result.value?.elements[0]?.value).toBeCloseTo(38.9848400617, 10);
    expect(result.value?.elements[1]?.value).toBeCloseTo(134.4778059168, 10);
    expect(result.value?.elements[2]?.value).toBeCloseTo(23.8732414638, 10);
  });

  it("calculates a T matching network", () => {
    const result = calculatePiTMatching({
      network: "t",
      sourceResistanceOhm: 50,
      loadResistanceOhm: 200,
      frequencyMHz: 100,
      targetQ: 3,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.virtualResistanceOhm).toBeCloseTo(500, 12);
    expect(result.value?.sourceQ).toBeCloseTo(3, 12);
    expect(result.value?.loadQ).toBeCloseTo(1.2247448714, 10);
    expect(result.value?.reactancesOhm.sourceSeries).toBeCloseTo(150, 12);
    expect(result.value?.reactancesOhm.loadSeries).toBeCloseTo(
      244.9489742783,
      10,
    );
    expect(result.value?.susceptancesS.centerShunt).toBeCloseTo(
      0.0084494897,
      10,
    );
    expect(result.value?.elements.map((element) => element.label)).toEqual([
      "Lsource",
      "Cshunt",
      "Lload",
    ]);
    expect(result.value?.elements[0]?.value).toBeCloseTo(238.7324146378, 10);
    expect(result.value?.elements[1]?.value).toBeCloseTo(13.4477805917, 10);
    expect(result.value?.elements[2]?.value).toBeCloseTo(389.8484006168, 10);
  });

  it("validates inputs and infeasible Q", () => {
    const invalid = calculatePiTMatching({
      network: "pi",
      sourceResistanceOhm: 0,
      loadResistanceOhm: 0,
      frequencyMHz: 0,
      targetQ: 0,
    });

    expect(invalid.ok).toBe(false);
    expect(invalid.errors).toEqual([
      "Set source resistance > 0 Ohm.",
      "Set load resistance > 0 Ohm.",
      "Set frequency > 0 MHz.",
      "Set Q > 0.",
    ]);

    const infeasible = calculatePiTMatching({
      network: "pi",
      sourceResistanceOhm: 50,
      loadResistanceOhm: 200,
      frequencyMHz: 100,
      targetQ: 1,
    });

    expect(infeasible.ok).toBe(false);
    expect(infeasible.errors).toEqual([
      "Set Q >= 1.7321 for this resistance ratio.",
    ]);
  });

  it("calculates the minimum feasible Q", () => {
    expect(minimumRequiredQ(50, 200)).toBeCloseTo(1.7320508076, 10);
    expect(minimumRequiredQ(100, 100)).toBe(0);
  });
});
