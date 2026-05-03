import { describe, expect, it } from "vitest";
import { calculatorDefaults } from "@/lib/calculatorDefaults";
import { calculateImpedanceTransform } from "@/lib/calculators/impedanceTransform";
import { calculateLMatch } from "@/lib/calculators/lMatch";
import { calculateLoadImpedance } from "@/lib/calculators/loadImpedance";
import { calculateMicrostrip } from "@/lib/calculators/microstrip";
import { calculateRectangularWaveguide } from "@/lib/calculators/waveguide";
import { calculateSingleStub } from "@/lib/calculators/singleStub";
import { calculateVswr } from "@/lib/calculators/vswr";
import { calculateWavelength } from "@/lib/calculators/wavelength";
import type { Complex } from "@/lib/math/complex";

describe("default-value calculator regressions", () => {
  it("keeps Wavelength default result stable", () => {
    const result = calculateWavelength(calculatorDefaults.wavelength);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.lambda0M).toBeCloseTo(0.1249135242, 10);
    expect(result.value?.lambdaGM).toBeCloseTo(0.1249135242, 10);
    expect(result.value?.lengthInWavelengths).toBeCloseTo(1.0006922856, 10);
    expect(result.value?.electricalLengthDeg).toBeCloseTo(360.2492228, 7);
    expect(result.value?.electricalLengthRad).toBeCloseTo(6.2875350659, 10);
  });

  it("keeps Rectangular Waveguide default WR-90 results stable", () => {
    const result = calculateRectangularWaveguide(calculatorDefaults.waveguide);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([
      "Mode indices m and n are both 0, so fcmn is 0 GHz.",
    ]);
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
      fcmn: 0,
      unit: "GHz",
    });
  });

  it("keeps Microstrip Analysis default results stable", () => {
    const result = calculateMicrostrip(calculatorDefaults.microstrip);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.mode).toBe("analysis");

    if (result.value?.mode !== "analysis") {
      throw new Error("Expected analysis result");
    }

    expect(result.value.z0Ohm).toBeCloseTo(50.339, 3);
    expect(result.value.epsEff).toBeCloseTo(2.747, 3);
    expect(result.value.lambdaMm).toBeCloseTo(100.558, 3);
  });

  it("keeps Load Impedance default voltage-minimum result stable", () => {
    const result = calculateLoadImpedance(calculatorDefaults.loadImpedance);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.zL.re).toBeCloseTo(0.364251, 6);
    expect(result.value?.zL.im).toBeCloseTo(-0.285469, 6);
    expect(result.value?.r).toBeCloseTo(0.364251, 6);
    expect(result.value?.x).toBeCloseTo(-0.285469, 6);
  });

  it("keeps Impedance Transformation default result stable", () => {
    const result = calculateImpedanceTransform(
      calculatorDefaults.impedanceTransform,
    );

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.zTransformed).toEqual({ re: 2, im: 3 });
    expect(result.value?.r).toBe(2);
    expect(result.value?.x).toBe(3);
  });

  it("keeps VSWR default matched-load result stable", () => {
    const result = calculateVswr({
      type: calculatorDefaults.vswr.type,
      z0Ohm: calculatorDefaults.vswr.z0Ohm,
      vswr: calculatorDefaults.vswr.vswr,
      argGammaDeg: calculatorDefaults.vswr.argGammaDeg,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.vswr).toBe(1);
    expect(result.value?.magGamma).toBe(0);
    expectFiniteComplex(result.value?.gamma);
    expect(result.value?.gamma).toEqual({ re: 0, im: 0 });
    expect(result.value?.z).toEqual({ re: 1, im: 0 });
    expect(result.value?.y).toEqual({ re: 1, im: 0 });
    expect(result.value?.Z).toEqual({ re: 50, im: 0 });
    expect(result.value?.Y).toEqual({ re: 0.02, im: 0 });
  });

  it("returns finite Single Stub default solutions with the expected shape", () => {
    const result = calculateSingleStub(calculatorDefaults.singleStub);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.solution1.dOverLambda).toBeCloseTo(0, 12);
    expect(result.value?.solution1.lOverLambda).toBeCloseTo(0.125, 12);
    expect(result.value?.solution2.dOverLambda).toBeCloseTo(0.1762081912, 10);
    expect(result.value?.solution2.lOverLambda).toBeCloseTo(0.375, 12);
    expectFiniteNumber(result.value?.solution1.dOverLambda);
    expectFiniteNumber(result.value?.solution1.lOverLambda);
    expectFiniteNumber(result.value?.solution2.dOverLambda);
    expectFiniteNumber(result.value?.solution2.lOverLambda);
  });

  it("keeps L-section default results stable", () => {
    const result = calculateLMatch(calculatorDefaults.lMatch);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.solution1.xOhm).toBeCloseTo(122.4744871392, 10);
    expect(result.value?.solution1.bMs).toBeCloseTo(2.8989794856, 10);
    expect(result.value?.solution1.seriesElement).toMatchObject({
      type: "Ls",
      unit: "nH",
    });
    expect(result.value?.solution1.seriesElement.value).toBeCloseTo(
      38.9848400617,
      10,
    );
    expect(result.value?.solution1.parallelElement).toMatchObject({
      type: "Cp",
      unit: "pF",
    });
    expect(result.value?.solution1.parallelElement.value).toBeCloseTo(
      0.9227738301,
      10,
    );
    expect(result.value?.solution2.xOhm).toBeCloseTo(-122.4744871392, 10);
    expect(result.value?.solution2.bMs).toBeCloseTo(-6.8989794856, 10);
    expect(result.value?.solution2.seriesElement).toMatchObject({
      type: "Cs",
      unit: "pF",
    });
    expect(result.value?.solution2.parallelElement).toMatchObject({
      type: "Lp",
      unit: "nH",
    });
  });
});

function expectFiniteComplex(value: Complex | undefined) {
  expect(value).toBeDefined();
  expectFiniteNumber(value?.re);
  expectFiniteNumber(value?.im);
}

function expectFiniteNumber(value: number | undefined) {
  expect(value).toBeDefined();
  expect(Number.isFinite(value)).toBe(true);
}
