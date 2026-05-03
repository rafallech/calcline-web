import { describe, expect, it } from "vitest";
import { calculateAttenuator } from "@/lib/calculators/attenuators";
import { calculateCoplanarWaveguide } from "@/lib/calculators/coplanarWaveguide";
import { calculateImpedanceTransform } from "@/lib/calculators/impedanceTransform";
import { calculateLMatch } from "@/lib/calculators/lMatch";
import { calculateLinkBudget } from "@/lib/calculators/linkBudget";
import { calculateLoadImpedance } from "@/lib/calculators/loadImpedance";
import { calculateMicrostrip } from "@/lib/calculators/microstrip";
import { calculatePatchAntenna } from "@/lib/calculators/patchAntenna";
import { calculateQuarterWaveTransformer } from "@/lib/calculators/quarterWaveTransformer";
import { calculateRfPower } from "@/lib/calculators/rfPower";
import { calculateRectangularWaveguide } from "@/lib/calculators/waveguide";
import { calculateSingleStub } from "@/lib/calculators/singleStub";
import { calculateSParameters } from "@/lib/calculators/sParameters";
import { calculateStripline } from "@/lib/calculators/stripline";
import { calculateVswr } from "@/lib/calculators/vswr";
import { calculateWavelength } from "@/lib/calculators/wavelength";
import { calculateWilkinsonDivider } from "@/lib/calculators/wilkinson";

describe("calculator result contract", () => {
  it("returns ok, value, errors, and warnings for validation failures", () => {
    const invalidResults = [
      calculateAttenuator({
        topology: "pi",
        z0Ohm: 0,
        attenuationDb: 6,
      }),
      calculateWavelength({
        frequency: 0,
        frequencyUnit: "GHz",
        epsEff: 1,
        physicalLength: 1,
        lengthUnit: "mm",
      }),
      calculateRfPower({
        type: "W",
        value: -1,
        z0Ohm: 50,
      }),
      calculateQuarterWaveTransformer({
        z0Ohm: 0,
        rLOhm: 50,
        fGHz: 1,
        epsEff: 1,
      }),
      calculateSParameters({
        s11Format: "magnitude",
        s11Value: 1,
        s11AngleDeg: 0,
        s21Format: "magnitude",
        s21Value: 1,
        z0Ohm: 50,
      }),
      calculateLinkBudget({
        transmitPowerDbm: 0,
        txAntennaGainDbi: 0,
        rxAntennaGainDbi: 0,
        frequency: 0,
        frequencyUnit: "GHz",
        distance: 1,
        distanceUnit: "m",
        txCableLossDb: 0,
        rxCableLossDb: 0,
        additionalLossesDb: 0,
        receiverSensitivityDbm: -100,
      }),
      calculatePatchAntenna({
        fGHz: 0,
        epsR: 4.4,
        hMm: 1.6,
      }),
      calculateWilkinsonDivider({
        z0Ohm: 0,
        fGHz: 1,
        epsEff: 1,
      }),
      calculateStripline({
        wMm: 0,
        bMm: 1,
        tMm: 0,
        epsR: 1,
        fGHz: 1,
      }),
      calculateCoplanarWaveguide({
        mode: "cpw",
        wMm: 0,
        sMm: 1,
        hMm: 1,
        epsR: 1,
        fGHz: 1,
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
