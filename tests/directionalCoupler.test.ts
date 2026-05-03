import { describe, expect, it } from "vitest";
import {
  branchArmImpedanceOhm,
  calculateDirectionalCoupler,
  guidedWavelengthM,
  seriesArmImpedanceOhm,
} from "@/lib/calculators/directionalCoupler";

describe("directional coupler calculator", () => {
  it("calculates a 50 Ohm branch-line 90 degree hybrid", () => {
    const result = calculateDirectionalCoupler({
      z0Ohm: 50,
      fGHz: 2.4,
      epsEff: 2.25,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([
      "Ideal branch-line model: no loss, discontinuity, dispersion, or tolerance effects are included.",
    ]);
    expect(result.value?.seriesArmImpedanceOhm).toBeCloseTo(
      35.3553390593,
      10,
    );
    expect(result.value?.branchArmImpedanceOhm).toBeCloseTo(50, 12);
    expect(result.value?.electricalLengthDeg).toBe(90);
    expect(result.value?.lambdaGM).toBeCloseTo(0.0832756828, 10);
    expect(result.value?.physicalLengthM).toBeCloseTo(0.0208189207, 10);
    expect(result.value?.idealSplitDb).toBeCloseTo(-3.0102999566, 10);
    expect(result.value?.phaseRelationDeg).toBe(90);
  });

  it("validates all inputs", () => {
    const result = calculateDirectionalCoupler({
      z0Ohm: 0,
      fGHz: 0,
      epsEff: 0.5,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set Z0 > 0 Ohm.",
      "Set center frequency > 0 GHz.",
      "Set eps_eff >= 1.",
    ]);
    expect(result.warnings).toEqual([
      "Ideal branch-line model: no loss, discontinuity, dispersion, or tolerance effects are included.",
    ]);
  });

  it("exposes focused helper functions", () => {
    expect(seriesArmImpedanceOhm(50)).toBeCloseTo(35.3553390593, 10);
    expect(branchArmImpedanceOhm(50)).toBe(50);
    expect(guidedWavelengthM(2.4, 1)).toBeCloseTo(0.1249135242, 10);
  });
});
