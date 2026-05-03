import { describe, expect, it } from "vitest";
import {
  calculateCascadedIp3,
  calculateCascadedNoiseFigureDb,
  calculateRfCascade,
} from "@/lib/calculators/rfCascade";

const exampleStages = [
  { name: "LNA", gainDb: 15, noiseFigureDb: 1, oip3Dbm: 35 },
  { name: "Filter", gainDb: -3, noiseFigureDb: 3, oip3Dbm: 40 },
  { name: "IF amp", gainDb: 20, noiseFigureDb: 4, oip3Dbm: 30 },
];

describe("RF cascade calculator", () => {
  it("calculates Friis cascaded noise figure", () => {
    expect(calculateCascadedNoiseFigureDb(exampleStages)).toBeCloseTo(
      1.416980356,
      9,
    );
  });

  it("calculates gain, output powers, and cascaded IP3", () => {
    const result = calculateRfCascade({
      inputPowerDbm: -30,
      stages: exampleStages,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.totalGainDb).toBe(32);
    expect(result.value?.cascadedNoiseFigureDb).toBeCloseTo(1.416980356, 9);
    expect(result.value?.outputStages.map((stage) => stage.outputPowerDbm)).toEqual(
      [-15, -18, 2],
    );
    expect(result.value?.cascadedIp3?.iip3Dbm).toBeCloseTo(-2.0316296149, 10);
    expect(result.value?.cascadedIp3?.oip3Dbm).toBeCloseTo(29.9683703851, 10);
  });

  it("omits cascaded IP3 when any OIP3 field is missing", () => {
    const result = calculateRfCascade({
      inputPowerDbm: 0,
      stages: [
        { name: "Stage 1", gainDb: 10, noiseFigureDb: 2, oip3Dbm: 30 },
        { name: "Stage 2", gainDb: 5, noiseFigureDb: 3 },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.value?.cascadedIp3).toBeUndefined();
  });

  it("validates the stage list and stage values", () => {
    const result = calculateRfCascade({
      inputPowerDbm: Number.NaN,
      stages: [
        {
          name: "",
          gainDb: Number.NaN,
          noiseFigureDb: -1,
          p1dBDbm: Number.NaN,
          oip3Dbm: Number.NaN,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set a finite input power in dBm.",
      "Stage 1: set a finite gain/loss in dB.",
      "Stage 1: set noise figure >= 0 dB.",
      "Stage 1: set a finite P1dB in dBm or leave it empty.",
      "Stage 1: set a finite OIP3 in dBm or leave it empty.",
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("exposes focused IP3 helper", () => {
    const ip3 = calculateCascadedIp3(exampleStages, 32);

    expect(ip3?.iip3Dbm).toBeCloseTo(-2.0316296149, 10);
    expect(ip3?.oip3Dbm).toBeCloseTo(29.9683703851, 10);
  });
});
