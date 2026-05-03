import { describe, expect, it } from "vitest";
import {
  calculatePatchAntenna,
  effectiveLengthM,
  effectivePermittivity,
  lengthExtensionM,
  patchWidthM,
} from "@/lib/calculators/patchAntenna";

describe("microstrip patch antenna calculator", () => {
  it("calculates rectangular patch design dimensions", () => {
    const result = calculatePatchAntenna({
      fGHz: 2.4,
      epsR: 4.4,
      hMm: 1.6,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([
      "Patch dimensions are a design approximation; tune with EM simulation or measurement.",
    ]);
    expect(result.value?.wMm).toBeCloseTo(38.0099749575, 10);
    expect(result.value?.epsEff).toBeCloseTo(4.0856764443, 10);
    expect(result.value?.deltaLMm).toBeCloseTo(0.7388121658, 10);
    expect(result.value?.leffMm).toBeCloseTo(30.8992174161, 10);
    expect(result.value?.lMm).toBeCloseTo(29.4215930844, 10);
  });

  it("validates all inputs", () => {
    const result = calculatePatchAntenna({
      fGHz: 0,
      epsR: 1,
      hMm: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set frequency > 0 GHz.",
      "Set eps_r > 1.",
      "Set h > 0 mm.",
    ]);
    expect(result.warnings).toEqual([
      "Patch dimensions are a design approximation; tune with EM simulation or measurement.",
    ]);
  });

  it("exposes formula helpers for focused verification", () => {
    const frequencyHz = 2.4e9;
    const hM = 0.0016;
    const wM = patchWidthM(frequencyHz, 4.4);
    const epsEff = effectivePermittivity(4.4, hM, wM);
    const deltaLM = lengthExtensionM(hM, wM, epsEff);
    const leffM = effectiveLengthM(frequencyHz, epsEff);

    expect(wM).toBeCloseTo(0.038009975, 10);
    expect(epsEff).toBeCloseTo(4.0856764443, 10);
    expect(deltaLM).toBeCloseTo(0.0007388122, 10);
    expect(leffM).toBeCloseTo(0.0308992174, 10);
  });
});
