import { describe, expect, it } from "vitest";
import { abs, type Complex } from "@/lib/math/complex";
import {
  chartPointFromGamma,
  gammaFromChartPoint,
  gammaFromNormalizedAdmittance,
  gammaFromNormalizedImpedance,
  gammaFromSvgPoint,
  generateSmithGrid,
  isDrawableGamma,
  normalizedAdmittanceFromGamma,
  normalizedImpedanceFromAdmittance,
  normalizedImpedanceFromGamma,
  sampleConstantGammaCircle,
  sampleTransmissionLineTrace,
  svgPointFromGamma,
} from "@/lib/visualization/smithChart";

function expectComplexCloseTo(actual: Complex, expected: Complex) {
  expect(actual.re).toBeCloseTo(expected.re, 12);
  expect(actual.im).toBeCloseTo(expected.im, 12);
}

describe("Smith chart conversions", () => {
  it("maps matched normalized impedance to the chart center", () => {
    expectComplexCloseTo(gammaFromNormalizedImpedance({ re: 1, im: 0 }), {
      re: 0,
      im: 0,
    });

    expectComplexCloseTo(normalizedImpedanceFromGamma({ re: 0, im: 0 }), {
      re: 1,
      im: 0,
    });
  });

  it("round-trips normalized impedance through Gamma", () => {
    const z = { re: 2, im: 1 };
    const gamma = gammaFromNormalizedImpedance(z);

    expectComplexCloseTo(gamma, { re: 0.4, im: 0.2 });
    expectComplexCloseTo(normalizedImpedanceFromGamma(gamma), z);
  });

  it("uses equivalent admittance and impedance points", () => {
    const y = { re: 0.4, im: -0.2 };
    const z = normalizedImpedanceFromAdmittance(y);

    expectComplexCloseTo(z, { re: 2, im: 1 });
    expectComplexCloseTo(gammaFromNormalizedAdmittance(y), {
      re: 0.4,
      im: 0.2,
    });
    expectComplexCloseTo(normalizedAdmittanceFromGamma({ re: 0.4, im: 0.2 }), y);
  });

  it("checks the minimal drawable Gamma range", () => {
    expect(isDrawableGamma({ re: 0.999, im: 0 })).toBe(true);
    expect(isDrawableGamma({ re: 1, im: 0 })).toBe(false);
    expect(isDrawableGamma({ re: Number.NaN, im: 0 })).toBe(false);
  });
});

describe("Smith chart coordinates", () => {
  it("maps Gamma to normalized chart coordinates with an inverted y axis", () => {
    const point = chartPointFromGamma({ re: 0.4, im: 0.2 });

    expect(point.x).toBeCloseTo(0.4, 12);
    expect(point.y).toBeCloseTo(-0.2, 12);
    expectComplexCloseTo(gammaFromChartPoint(point), { re: 0.4, im: 0.2 });
  });

  it("maps Gamma to SVG coordinates and back", () => {
    const viewport = {
      centerX: 100,
      centerY: 80,
      radius: 50,
    };
    const gamma = { re: 0.4, im: 0.2 };
    const point = svgPointFromGamma(gamma, viewport);

    expect(point.x).toBeCloseTo(120, 12);
    expect(point.y).toBeCloseTo(70, 12);
    expectComplexCloseTo(gammaFromSvgPoint(point, viewport), gamma);
  });
});

describe("Smith chart sampling", () => {
  it("samples a constant-Gamma circle", () => {
    const points = sampleConstantGammaCircle(0.5, 5);

    expect(points).toHaveLength(5);
    expectComplexCloseTo(points[0], { re: 0.5, im: 0 });
    expectComplexCloseTo(points[4], { re: 0.5, im: 0 });
    for (const point of points) {
      expect(abs(point)).toBeCloseTo(0.5, 12);
    }
  });

  it("samples a transmission-line trace on a constant VSWR circle", () => {
    const start = { re: 0.4, im: 0.2 };
    const points = sampleTransmissionLineTrace(start, 0.5, 9);

    expect(points).toHaveLength(9);
    expectComplexCloseTo(points[0], start);
    expectComplexCloseTo(points[8], start);
    for (const point of points) {
      expect(abs(point)).toBeCloseTo(abs(start), 12);
    }
  });
});

describe("Smith chart grid", () => {
  it("generates basic grid curves as SVG point sets", () => {
    const viewport = {
      centerX: 100,
      centerY: 100,
      radius: 80,
    };
    const grid = generateSmithGrid({
      viewport,
      samples: 17,
      resistanceValues: [0.5, 1],
      reactanceValues: [0.5],
      minorResistanceValues: [],
      minorReactanceValues: [],
    });

    expect(grid.viewport).toEqual(viewport);
    expect(grid.curves.map((curve) => curve.id)).toEqual([
      "outer-circle",
      "real-axis",
      "resistance-0-5",
      "resistance-1",
      "reactance-0-5",
      "reactance-minus-0-5",
    ]);

    for (const curve of grid.curves) {
      expect(curve.points.length).toBeGreaterThanOrEqual(2);
      expect(curve.detail).toBe("major");
      for (const point of curve.points) {
        expect(point.x).toBeGreaterThanOrEqual(20 - 1e-9);
        expect(point.x).toBeLessThanOrEqual(180 + 1e-9);
        expect(point.y).toBeGreaterThanOrEqual(20 - 1e-9);
        expect(point.y).toBeLessThanOrEqual(180 + 1e-9);
      }
    }
    expect(grid.labels.map((label) => label.id)).toEqual([
      "label-r-0-5",
      "label-r-1",
      "label-x-0-5",
      "label-x-minus-0-5",
    ]);
  });

  it("places the real axis across the Smith chart diameter", () => {
    const grid = generateSmithGrid({
      viewport: {
        centerX: 10,
        centerY: 20,
        radius: 5,
      },
      resistanceValues: [],
      reactanceValues: [],
      minorResistanceValues: [],
      minorReactanceValues: [],
    });
    const realAxis = grid.curves.find((curve) => curve.id === "real-axis");

    expect(realAxis?.points).toEqual([
      { x: 5, y: 20 },
      { x: 15, y: 20 },
    ]);
  });

  it("uses exact constant-resistance circle geometry", () => {
    const grid = generateSmithGrid({
      samples: 73,
      resistanceValues: [1],
      reactanceValues: [],
      minorResistanceValues: [],
      minorReactanceValues: [],
      showLabels: false,
    });
    const resistanceCircle = grid.curves.find(
      (curve) => curve.id === "resistance-1",
    );

    expect(resistanceCircle).toBeDefined();
    expect(resistanceCircle?.points).toHaveLength(73);

    for (const point of resistanceCircle?.points ?? []) {
      const gamma = gammaFromSvgPoint(point);
      const distanceFromCenter = Math.hypot(gamma.re - 0.5, gamma.im);

      expect(distanceFromCenter).toBeCloseTo(0.5, 12);
      expect(abs(gamma)).toBeLessThanOrEqual(1 + 1e-12);
    }
  });

  it("uses exact constant-reactance arc geometry", () => {
    const grid = generateSmithGrid({
      samples: 73,
      resistanceValues: [],
      reactanceValues: [1],
      minorResistanceValues: [],
      minorReactanceValues: [],
      showLabels: false,
    });
    const reactanceArc = grid.curves.find(
      (curve) => curve.id === "reactance-1",
    );
    const points = reactanceArc?.points ?? [];
    const firstGamma = gammaFromSvgPoint(points[0]);
    const lastGamma = gammaFromSvgPoint(points[points.length - 1]);

    expect(points).toHaveLength(73);
    expectComplexCloseTo(firstGamma, { re: 0, im: 1 });
    expectComplexCloseTo(lastGamma, { re: 1, im: 0 });

    for (const point of points) {
      const gamma = gammaFromSvgPoint(point);
      const distanceFromCenter = Math.hypot(gamma.re - 1, gamma.im - 1);

      expect(distanceFromCenter).toBeCloseTo(1, 12);
      expect(abs(gamma)).toBeLessThanOrEqual(1 + 1e-12);
    }
  });

  it("adds a denser default major and minor grid", () => {
    const grid = generateSmithGrid();
    const resistanceCurves = grid.curves.filter(
      (curve) => curve.kind === "resistance",
    );
    const reactanceCurves = grid.curves.filter(
      (curve) => curve.kind === "reactance",
    );

    expect(resistanceCurves.some((curve) => curve.detail === "minor")).toBe(
      true,
    );
    expect(reactanceCurves.some((curve) => curve.detail === "minor")).toBe(
      true,
    );
    expect(resistanceCurves.length).toBeGreaterThan(5);
    expect(reactanceCurves.length).toBeGreaterThan(10);
    expect(grid.labels.length).toBeGreaterThan(0);
  });
});
