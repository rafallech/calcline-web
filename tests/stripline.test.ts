import { describe, expect, it } from "vitest";
import {
  calculateStripline,
  characteristicImpedanceOhm,
  effectiveStripWidthMm,
  guidedWavelengthMm,
  propagationDelayPsPerMm,
} from "@/lib/calculators/stripline";

describe("stripline calculator", () => {
  it("calculates characteristic impedance, wavelength, and propagation delay", () => {
    const result = calculateStripline({
      wMm: 1.2,
      bMm: 3.2,
      tMm: 0.035,
      epsR: 4.4,
      fGHz: 2.4,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.effectiveWidthMm).toBeCloseTo(1.2787184664, 10);
    expect(result.value?.z0Ohm).toBeCloseTo(53.450977402, 10);
    expect(result.value?.guidedWavelengthMm).toBeCloseTo(59.5501860919, 10);
    expect(result.value?.propagationDelayPsPerMm).toBeCloseTo(6.9968994895, 10);
  });

  it("handles a zero-thickness conductor without width correction", () => {
    const result = calculateStripline({
      wMm: 1,
      bMm: 2,
      tMm: 0,
      epsR: 2.25,
      fGHz: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.effectiveWidthMm).toBe(1);
    expect(result.value?.z0Ohm).toBeCloseTo(66.7713635194, 10);
    expect(result.value?.guidedWavelengthMm).toBeCloseTo(199.8616386667, 10);
    expect(result.value?.propagationDelayPsPerMm).toBeCloseTo(5.003461428, 10);
  });

  it("validates all inputs", () => {
    const result = calculateStripline({
      wMm: 0,
      bMm: 0,
      tMm: -0.1,
      epsR: 0.5,
      fGHz: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set W > 0 mm.",
      "Set b > 0 mm.",
      "Set t >= 0 mm.",
      "Set eps_r >= 1.",
      "Set frequency > 0 GHz.",
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("exposes focused helper functions", () => {
    const effectiveWidthMm = effectiveStripWidthMm(1.2, 0.035);

    expect(effectiveWidthMm).toBeCloseTo(1.2787184664, 10);
    expect(characteristicImpedanceOhm(effectiveWidthMm, 3.2, 4.4)).toBeCloseTo(
      53.450977402,
      10,
    );
    expect(guidedWavelengthMm(2.4, 4.4)).toBeCloseTo(59.5501860919, 10);
    expect(propagationDelayPsPerMm(4.4)).toBeCloseTo(6.9968994895, 10);
  });
});
