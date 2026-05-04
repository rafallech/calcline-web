import { describe, expect, it } from "vitest";
import {
  calculateYagiUda,
  wavelengthFromFrequency,
  type YagiInput,
} from "@/lib/calculators/yagiUda";

const baseInput: YagiInput = {
  frequency: 432,
  frequencyUnit: "MHz",
  numberOfElements: 10,
  elementDiameterMm: 4,
  boomDiameterMm: 20,
  designMode: "dl6wu",
  boomType: "metalIsolated",
  drivenElementType: "straightDipole",
  foldedDipoleSpacingMm: 20,
  feedLineImpedanceOhm: 50,
  balunRatio: "4:1",
};

describe("Yagi-Uda antenna calculator", () => {
  it("calculates wavelength from frequency", () => {
    expect(wavelengthFromFrequency(432, "MHz")).toBeCloseTo(
      693.9640231481,
      10,
    );
    expect(wavelengthFromFrequency(0.432, "GHz")).toBeCloseTo(
      693.9640231481,
      10,
    );
  });

  it("returns the requested number of elements", () => {
    const result = calculateYagiUda(baseInput);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.elements).toHaveLength(10);
    expect(result.value?.elements.map((element) => element.name)).toEqual([
      "reflector",
      "driven element",
      "director 1",
      "director 2",
      "director 3",
      "director 4",
      "director 5",
      "director 6",
      "director 7",
      "director 8",
    ]);
  });

  it("returns positive element lengths and half lengths", () => {
    const result = calculateYagiUda(baseInput);

    expect(result.ok).toBe(true);

    for (const element of result.value?.elements ?? []) {
      expect(element.lengthMm).toBeGreaterThan(0);
      expect(element.halfLengthMm).toBeCloseTo(element.lengthMm / 2, 12);
    }
  });

  it("returns monotonically increasing element positions", () => {
    const result = calculateYagiUda(baseInput);
    const elements = result.value?.elements ?? [];

    expect(result.ok).toBe(true);

    for (let index = 1; index < elements.length; index += 1) {
      expect(elements[index].positionMm).toBeGreaterThan(
        elements[index - 1].positionMm,
      );
      expect(elements[index].spacingFromPreviousMm).toBeGreaterThan(0);
    }
  });

  it("rejects too few elements for DL6WU mode", () => {
    const result = calculateYagiUda({
      ...baseInput,
      numberOfElements: 4,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toContain(
      "Set number of elements >= 5 for DL6WU mode.",
    );
  });

  it("returns a stable 432 MHz 10-element starting design", () => {
    const result = calculateYagiUda(baseInput);

    expect(result.ok).toBe(true);
    expect(result.value?.wavelengthMm).toBeCloseTo(693.9640231481, 10);
    expect(result.value?.boomLengthMm).toBeCloseTo(1213.049112463, 10);
    expect(result.value?.approximateGainDbi).toBeCloseTo(16.23089987, 8);
    expect(result.value?.estimatedFrontToBackRatioDb).toBeCloseTo(21, 12);
    expect(result.value?.feed.straightDrivenImpedanceEstimateOhm).toBeCloseTo(
      28.25,
      12,
    );
    expect(result.warnings).toContain(
      "This is a DL6WU-inspired long-boom Yagi approximation using transparent tapered length and spacing coefficients, not a full published DL6WU table.",
    );

    expect(result.value?.elements[0]).toMatchObject({
      name: "reflector",
      positionMm: 0,
      spacingFromPreviousMm: 0,
    });
    expect(result.value?.elements[0]?.lengthMm).toBeCloseTo(
      349.6615357827,
      10,
    );
    expect(result.value?.elements[1]?.positionMm).toBeCloseTo(
      138.7928046296,
      10,
    );
    expect(result.value?.elements[1]?.lengthMm).toBeCloseTo(
      332.5495239761,
      10,
    );
    expect(result.value?.elements[9]?.name).toBe("director 8");
    expect(result.value?.elements[9]?.lengthMm).toBeCloseTo(
      296.2263060003,
      10,
    );
  });

  it("warns for non-recommended element counts", () => {
    const result = calculateYagiUda({
      ...baseInput,
      numberOfElements: 12,
    });

    expect(result.ok).toBe(true);
    expect(result.warnings).toContain(
      "DL6WU long-boom starting designs are usually compared at 10, 14, 19, or 24 elements; verify other element counts carefully.",
    );
  });

  it("warns when element diameter to wavelength ratio is outside the typical range", () => {
    const result = calculateYagiUda({
      ...baseInput,
      elementDiameterMm: 0.5,
    });

    expect(result.ok).toBe(true);
    expect(result.warnings).toContain(
      "Element diameter / wavelength is outside the typical 0.002 to 0.02 starting range; verify the geometry with NEC before manufacturing.",
    );
  });

  it("applies folded dipole transformation without changing element geometry", () => {
    const straight = calculateYagiUda(baseInput);
    const folded = calculateYagiUda({
      ...baseInput,
      drivenElementType: "foldedDipole",
      foldedDipoleSpacingMm: 20,
      balunRatio: "none",
    });

    expect(straight.ok).toBe(true);
    expect(folded.ok).toBe(true);
    expect(folded.value?.elements).toEqual(straight.value?.elements);
    expect(folded.value?.feed.foldedTransformationRatio).toBe(4);
    expect(folded.value?.feed.foldedFeedImpedanceEstimateOhm).toBeCloseTo(
      (folded.value?.feed.straightDrivenImpedanceEstimateOhm ?? Number.NaN) * 4,
      12,
    );
  });

  it("divides folded dipole impedance by 4 for a 4:1 balun", () => {
    const result = calculateYagiUda({
      ...baseInput,
      drivenElementType: "foldedDipole",
      balunRatio: "4:1",
    });

    expect(result.ok).toBe(true);
    expect(result.value?.feed.impedanceAfterBalunOhm).toBeCloseTo(
      (result.value?.feed.foldedFeedImpedanceEstimateOhm ?? Number.NaN) / 4,
      12,
    );
    expect(result.value?.feed.recommendedBalun).toContain("4:1 balun");
  });

  it("does not expose active folded geometry for a straight dipole", () => {
    const result = calculateYagiUda(baseInput);

    expect(result.ok).toBe(true);
    expect(result.value?.feed.drivenElementType).toBe("straightDipole");
    expect(result.value?.feed.foldedTransformationRatio).toBeUndefined();
    expect(result.value?.feed.foldedFeedImpedanceEstimateOhm).toBeUndefined();
    expect(result.value?.feed.foldedDipoleSpacingMm).toBeUndefined();
    expect(result.value?.feed.foldedDipoleLoopWidthMm).toBeUndefined();
    expect(result.value?.feed.foldedDipoleConductorLengthMm).toBeUndefined();
  });

  it("rejects non-positive folded dipole spacing for folded dipole mode", () => {
    const result = calculateYagiUda({
      ...baseInput,
      drivenElementType: "foldedDipole",
      foldedDipoleSpacingMm: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toContain("Set folded dipole spacing > 0 mm.");
  });
});
