import { describe, expect, it } from "vitest";
import { calculatorDefaults, defaultNumber } from "@/lib/calculatorDefaults";
import { calculateImpedanceTransform } from "@/lib/calculators/impedanceTransform";
import { calculateLMatch } from "@/lib/calculators/lMatch";
import { calculateLoadImpedance } from "@/lib/calculators/loadImpedance";
import { calculateMicrostrip } from "@/lib/calculators/microstrip";
import { calculateRectangularWaveguide } from "@/lib/calculators/waveguide";
import { calculateSingleStub } from "@/lib/calculators/singleStub";
import { calculateVswr } from "@/lib/calculators/vswr";

describe("calculator defaults", () => {
  it("keeps default values aligned with the technical specification", () => {
    expect(calculatorDefaults.waveguide).toEqual({
      aMm: 22.86,
      bMm: 10.16,
      epsR: 1,
      m: 0,
      n: 0,
    });
    expect(calculatorDefaults.microstrip).toEqual({
      mode: "analysis",
      hMm: 1.5,
      wMm: 3.38,
      z0Ohm: 50,
      epsR: 3.5,
      fGHz: 1.8,
    });
    expect(calculatorDefaults.loadImpedance).toEqual({
      lambdaMm: 100,
      swr: 3,
      dMm: 5,
      minimumType: "voltage",
    });
    expect(calculatorDefaults.impedanceTransform).toEqual({
      lambdaMm: 100,
      rL: 2,
      xL: 3,
      dMm: 0,
      direction: "generator",
    });
    expect(calculatorDefaults.vswr.z0Ohm).toBe(50);
    expect(calculatorDefaults.singleStub).toEqual({
      rL: 50,
      xL: 50,
      z0Ohm: 50,
      configuration: "openSeries",
    });
    expect(calculatorDefaults.lMatch).toEqual({
      rL: 200,
      xL: -100,
      z0Ohm: 100,
      fMHz: 500,
    });
  });

  it("provides string values for form defaults", () => {
    expect(defaultNumber(calculatorDefaults.waveguide.aMm)).toBe("22.86");
    expect(defaultNumber(calculatorDefaults.lMatch.xL)).toBe("-100");
  });

  it("produces valid calculator results from the default values", () => {
    expect(calculateRectangularWaveguide(calculatorDefaults.waveguide)).toMatchObject({
      ok: true,
      errors: [],
      warnings: ["Mode indices m and n are both 0, so fcmn is 0 GHz."],
    });
    expect(calculateMicrostrip(calculatorDefaults.microstrip)).toMatchObject({
      ok: true,
      errors: [],
    });
    expect(calculateLoadImpedance(calculatorDefaults.loadImpedance)).toMatchObject({
      ok: true,
      errors: [],
    });
    expect(
      calculateImpedanceTransform(calculatorDefaults.impedanceTransform),
    ).toMatchObject({
      ok: true,
      errors: [],
    });
    expect(
      calculateVswr({
        type: calculatorDefaults.vswr.type,
        z0Ohm: calculatorDefaults.vswr.z0Ohm,
        vswr: calculatorDefaults.vswr.vswr,
        argGammaDeg: calculatorDefaults.vswr.argGammaDeg,
      }),
    ).toMatchObject({
      ok: true,
      errors: [],
    });
    expect(calculateSingleStub(calculatorDefaults.singleStub)).toMatchObject({
      ok: true,
      errors: [],
    });
    expect(calculateLMatch(calculatorDefaults.lMatch)).toMatchObject({
      ok: true,
      errors: [],
    });
  });
});
