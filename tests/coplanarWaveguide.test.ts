import { describe, expect, it } from "vitest";
import {
  calculateCoplanarWaveguide,
  characteristicImpedanceOhm,
  completeEllipticIntegralFirstKind,
  effectivePermittivity,
  guidedWavelengthMm,
} from "@/lib/calculators/coplanarWaveguide";

describe("coplanar waveguide calculator", () => {
  it("calculates CPW impedance, effective permittivity, and guided wavelength", () => {
    const result = calculateCoplanarWaveguide({
      mode: "cpw",
      wMm: 1.2,
      sMm: 0.2,
      hMm: 1.6,
      epsR: 4.4,
      fGHz: 2.4,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.epsEff).toBeCloseTo(2.6281836945, 10);
    expect(result.value?.z0Ohm).toBeCloseTo(54.8949702628, 10);
    expect(result.value?.guidedWavelengthMm).toBeCloseTo(77.0515896265, 10);
  });

  it("keeps the grounded CPW mode as an explicit placeholder", () => {
    const result = calculateCoplanarWaveguide({
      mode: "grounded",
      wMm: 1.2,
      sMm: 0.2,
      hMm: 1.6,
      epsR: 4.4,
      fGHz: 2.4,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Grounded CPW is a placeholder and requires a separate model.",
    ]);
    expect(result.warnings).toEqual([
      "Grounded CPW is a placeholder and requires a separate model.",
    ]);
  });

  it("validates all numeric inputs", () => {
    const result = calculateCoplanarWaveguide({
      mode: "cpw",
      wMm: 0,
      sMm: 0,
      hMm: 0,
      epsR: 0.5,
      fGHz: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set W > 0 mm.",
      "Set S > 0 mm.",
      "Set h > 0 mm.",
      "Set eps_r >= 1.",
      "Set frequency > 0 GHz.",
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("exposes focused helper functions", () => {
    const epsEff = effectivePermittivity(2, 0.5, 10, 2.2);

    expect(completeEllipticIntegralFirstKind(0)).toBeCloseTo(Math.PI / 2, 12);
    expect(epsEff).toBeCloseTo(1.5974921862, 10);
    expect(characteristicImpedanceOhm(2, 0.5, epsEff)).toBeCloseTo(
      78.4648189586,
      10,
    );
    expect(guidedWavelengthMm(1, epsEff)).toBeCloseTo(237.1927070306, 10);
  });
});
