import { describe, expect, it } from "vitest";
import {
  compareLMatchSolutions,
  compareSingleStubSolutions,
} from "@/lib/calculators/matchingComparison";

describe("single-stub matching comparison", () => {
  it("recommends the shorter combined distance and stub length", () => {
    const comparison = compareSingleStubSolutions({
      configuration: "openShunt",
      z0Ohm: 50,
      result: {
        solution1: { dOverLambda: 0.2, lOverLambda: 0.3 },
        solution2: { dOverLambda: 0.1, lOverLambda: 0.1 },
      },
    });

    expect(comparison.recommendedSolution).toBe("solution2");
    expect(comparison.items[1]).toMatchObject({
      recommended: true,
      totalLineOverLambda: 0.2,
    });
    expect(comparison.items[1].reasons).toContain(
      "Shorter total line length.",
    );
    expect(comparison.summary).toContain("Solution #2");
  });

  it("uses shorter stub length when total lengths are close", () => {
    const comparison = compareSingleStubSolutions({
      configuration: "shortSeries",
      z0Ohm: 50,
      result: {
        solution1: { dOverLambda: 0.12, lOverLambda: 0.18 },
        solution2: { dOverLambda: 0.2, lOverLambda: 0.08 },
      },
    });

    expect(comparison.recommendedSolution).toBe("solution2");
    expect(comparison.items[1].reasons).toContain("Shorter stub length.");
  });

  it("reports no clear default for near ties", () => {
    const comparison = compareSingleStubSolutions({
      configuration: "shortShunt",
      z0Ohm: 50,
      result: {
        solution1: { dOverLambda: 0.1, lOverLambda: 0.2 },
        solution2: { dOverLambda: 0.11, lOverLambda: 0.2 },
      },
    });

    expect(comparison.recommendedSolution).toBe("none");
    expect(comparison.items.every((item) => !item.recommended)).toBe(true);
    expect(comparison.summary).toContain("No clear default");
  });

  it("adds practical warnings and inherited warnings", () => {
    const comparison = compareSingleStubSolutions({
      configuration: "openSeries",
      z0Ohm: 50,
      warnings: ["Use the lower-loss physical layout when possible."],
      result: {
        solution1: { dOverLambda: 0.15, lOverLambda: 0.01 },
        solution2: { dOverLambda: 0.15, lOverLambda: 0.49 },
      },
    });

    expect(comparison.items[0].warnings).toContain(
      "Stub is very short and may be difficult to implement.",
    );
    expect(comparison.items[0].warnings).toContain(
      "Use the lower-loss physical layout when possible.",
    );
    expect(comparison.items[1].warnings).toContain(
      "Stub is close to half-wave length.",
    );
  });
});

describe("L-section matching comparison", () => {
  it("recommends the lower normalized element score", () => {
    const comparison = compareLMatchSolutions({
      z0Ohm: 100,
      result: {
        solution1: {
          xOhm: 25,
          bS: 0.002,
          bMs: 2,
          seriesElement: { type: "Ls", value: 8, unit: "nH" },
          parallelElement: { type: "Cp", value: 1, unit: "pF" },
        },
        solution2: {
          xOhm: -120,
          bS: -0.01,
          bMs: -10,
          seriesElement: { type: "Cs", value: 2, unit: "pF" },
          parallelElement: { type: "Lp", value: 30, unit: "nH" },
        },
      },
    });

    expect(comparison.recommendedSolution).toBe("solution1");
    expect(comparison.items[0]).toMatchObject({
      topology: "LC",
      normalizedAbsX: 0.25,
      normalizedAbsB: 0.2,
      recommended: true,
    });
    expect(comparison.items[1].topology).toBe("CL");
    expect(comparison.items[0].reasons).toContain("lower series reactance");
    expect(comparison.items[0].reasons).toContain(
      "smaller shunt susceptance",
    );
    expect(comparison.items[0].reasons).toContain(
      "simpler LC realization",
    );
  });

  it("adds warnings for very small and very large components", () => {
    const comparison = compareLMatchSolutions({
      z0Ohm: 50,
      result: {
        solution1: {
          xOhm: 20,
          bS: 0.005,
          bMs: 5,
          seriesElement: { type: "Cs", value: 0.05, unit: "pF" },
          parallelElement: { type: "Lp", value: 20000, unit: "nH" },
        },
        solution2: {
          xOhm: 25,
          bS: 0.006,
          bMs: 6,
          seriesElement: { type: "Ls", value: 0.4, unit: "nH" },
          parallelElement: { type: "Cp", value: 1200, unit: "pF" },
        },
      },
    });

    expect(comparison.items[0].warnings).toEqual([
      "Cs is very small.",
      "Lp is very large.",
    ]);
    expect(comparison.items[1].warnings).toEqual([
      "Ls is very small.",
      "Cp is very large.",
    ]);
    expect(comparison.items[0].componentPracticalityPenalty).toBe(4);
  });

  it("reports no clear default for similar L-section scores", () => {
    const comparison = compareLMatchSolutions({
      z0Ohm: 100,
      result: {
        solution1: {
          xOhm: 50,
          bS: 0.005,
          bMs: 5,
          seriesElement: { type: "Ls", value: 10, unit: "nH" },
          parallelElement: { type: "Cp", value: 2, unit: "pF" },
        },
        solution2: {
          xOhm: -52,
          bS: -0.0049,
          bMs: -4.9,
          seriesElement: { type: "Cs", value: 10, unit: "pF" },
          parallelElement: { type: "Lp", value: 100, unit: "nH" },
        },
      },
    });

    expect(comparison.recommendedSolution).toBe("none");
    expect(comparison.summary).toContain("No clear default");
  });
});
