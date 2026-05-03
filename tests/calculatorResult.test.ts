import { describe, expect, it } from "vitest";
import { calculateImpedanceTransform } from "@/lib/calculators/impedanceTransform";
import { calculateLMatch } from "@/lib/calculators/lMatch";
import { calculateLoadImpedance } from "@/lib/calculators/loadImpedance";
import { calculateMicrostrip } from "@/lib/calculators/microstrip";
import { calculateRectangularWaveguide } from "@/lib/calculators/waveguide";
import { calculateSingleStub } from "@/lib/calculators/singleStub";
import { calculateVswr } from "@/lib/calculators/vswr";
import { calculateWavelength } from "@/lib/calculators/wavelength";

describe("calculator result contract", () => {
  it("returns ok, value, errors, and warnings for validation failures", () => {
    const invalidResults = [
      calculateWavelength({
        frequency: 0,
        frequencyUnit: "GHz",
        epsEff: 1,
        physicalLength: 1,
        lengthUnit: "mm",
      }),
      calculateRectangularWaveguide({
        aMm: 0,
        bMm: 10,
        epsR: 1,
        m: 1,
        n: 0,
      }),
      calculateMicrostrip({
        mode: "analysis",
        hMm: 0,
        wMm: 1,
        epsR: 3.5,
        fGHz: 1,
      }),
      calculateLoadImpedance({
        lambdaMm: 0,
        swr: 3,
        dMm: 1,
        minimumType: "voltage",
      }),
      calculateImpedanceTransform({
        lambdaMm: 0,
        rL: 1,
        xL: 0,
        dMm: 1,
        direction: "generator",
      }),
      calculateVswr({
        type: "vswr",
        z0Ohm: 0,
        vswr: 1,
        argGammaDeg: 0,
      }),
      calculateSingleStub({
        rL: 50,
        xL: 0,
        z0Ohm: 0,
        configuration: "openSeries",
      }),
      calculateLMatch({
        rL: 50,
        xL: 0,
        z0Ohm: 0,
        fMHz: 100,
      }),
    ];

    for (const result of invalidResults) {
      expect(Object.keys(result).sort()).toEqual([
        "errors",
        "ok",
        "value",
        "warnings",
      ]);
      expect(result.ok).toBe(false);
      expect(result.value).toBeUndefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(Array.isArray(result.warnings)).toBe(true);
    }
  });
});
