import { describe, expect, it } from "vitest";
import {
  calculateLinkBudget,
  distanceToM,
  freeSpacePathLossDb,
  frequencyToHz,
} from "@/lib/calculators/linkBudget";

describe("link budget calculator", () => {
  it("calculates FSPL for 1 km at 1 GHz", () => {
    const fsplDb = freeSpacePathLossDb(1_000_000_000, 1000);

    expect(fsplDb).toBeCloseTo(92.4477832219, 10);
  });

  it("calculates FSPL through calculator units", () => {
    const result = calculateLinkBudget({
      transmitPowerDbm: 30,
      txAntennaGainDbi: 10,
      rxAntennaGainDbi: 12,
      frequency: 2400,
      frequencyUnit: "MHz",
      distance: 5,
      distanceUnit: "km",
      txCableLossDb: 1,
      rxCableLossDb: 2,
      additionalLossesDb: 3,
      receiverSensitivityDbm: -90,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.eirpDbm).toBeCloseTo(39, 12);
    expect(result.value?.fsplDb).toBeCloseTo(114.0314081428, 10);
    expect(result.value?.receivedPowerDbm).toBeCloseTo(-68.0314081428, 10);
    expect(result.value?.linkMarginDb).toBeCloseTo(21.9685918572, 10);
  });

  it("calculates equivalent FSPL with GHz and m units", () => {
    const mhzKm = calculateLinkBudget({
      transmitPowerDbm: 0,
      txAntennaGainDbi: 0,
      rxAntennaGainDbi: 0,
      frequency: 1000,
      frequencyUnit: "MHz",
      distance: 1,
      distanceUnit: "km",
      txCableLossDb: 0,
      rxCableLossDb: 0,
      additionalLossesDb: 0,
      receiverSensitivityDbm: -100,
    });
    const ghzM = calculateLinkBudget({
      transmitPowerDbm: 0,
      txAntennaGainDbi: 0,
      rxAntennaGainDbi: 0,
      frequency: 1,
      frequencyUnit: "GHz",
      distance: 1000,
      distanceUnit: "m",
      txCableLossDb: 0,
      rxCableLossDb: 0,
      additionalLossesDb: 0,
      receiverSensitivityDbm: -100,
    });

    expect(mhzKm.ok).toBe(true);
    expect(ghzM.ok).toBe(true);
    expect(mhzKm.value?.fsplDb).toBeCloseTo(ghzM.value?.fsplDb ?? 0, 12);
  });

  it("validates frequency and distance", () => {
    const result = calculateLinkBudget({
      transmitPowerDbm: 0,
      txAntennaGainDbi: 0,
      rxAntennaGainDbi: 0,
      frequency: 0,
      frequencyUnit: "GHz",
      distance: 0,
      distanceUnit: "m",
      txCableLossDb: 0,
      rxCableLossDb: 0,
      additionalLossesDb: 0,
      receiverSensitivityDbm: -100,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual(["Set frequency > 0.", "Set distance > 0."]);
  });

  it("exposes unit conversion helpers", () => {
    expect(frequencyToHz(1, "MHz")).toBe(1_000_000);
    expect(frequencyToHz(1, "GHz")).toBe(1_000_000_000);
    expect(distanceToM(1, "m")).toBe(1);
    expect(distanceToM(1, "km")).toBe(1000);
  });
});
