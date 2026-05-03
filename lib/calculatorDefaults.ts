import type { ImpedanceTransformDirection } from "@/lib/calculators/impedanceTransform";
import type { CoplanarWaveguideMode } from "@/lib/calculators/coplanarWaveguide";
import type { LoadImpedanceMinimumType } from "@/lib/calculators/loadImpedance";
import type { MicrostripLossMode } from "@/lib/calculators/microstripLoss";
import type { MicrostripInput } from "@/lib/calculators/microstrip";
import type { ReceiverNoiseBandwidthUnit } from "@/lib/calculators/receiverNoise";
import type { SingleStubConfiguration } from "@/lib/calculators/singleStub";

export const calculatorDefaults = {
  wavelength: {
    frequency: 2.4,
    frequencyUnit: "GHz",
    epsEff: 1,
    physicalLength: 125,
    lengthUnit: "mm",
  },
  rfPower: {
    type: "dBm",
    value: 0,
    z0Ohm: 50,
  },
  quarterWaveTransformer: {
    z0Ohm: 50,
    rLOhm: 100,
    fGHz: 2.4,
    epsEff: 1,
  },
  sParameters: {
    s11Format: "magnitude",
    s11Value: 0.1,
    s11AngleDeg: 0,
    s21Format: "dB",
    s21Value: -3,
    z0Ohm: 50,
  },
  linkBudget: {
    transmitPowerDbm: 30,
    txAntennaGainDbi: 10,
    rxAntennaGainDbi: 12,
    frequency: 2.4,
    frequencyUnit: "GHz",
    distance: 5,
    distanceUnit: "km",
    txCableLossDb: 1,
    rxCableLossDb: 2,
    additionalLossesDb: 3,
    receiverSensitivityDbm: -90,
  },
  receiverNoise: {
    bandwidth: 1,
    bandwidthUnit: "MHz" as ReceiverNoiseBandwidthUnit,
    noiseFigureDb: 3,
    temperatureK: 290,
    requiredSnrDb: 10,
    gainDb: 0,
  },
  rfCascade: {
    inputPowerDbm: -30,
    stages: [
      {
        name: "LNA",
        gainDb: 15,
        noiseFigureDb: 1,
        p1dBDbm: 10,
        oip3Dbm: 35,
      },
      {
        name: "Filter",
        gainDb: -3,
        noiseFigureDb: 3,
        oip3Dbm: 40,
      },
      {
        name: "IF amp",
        gainDb: 20,
        noiseFigureDb: 4,
        p1dBDbm: 15,
        oip3Dbm: 30,
      },
    ],
  },
  filterPrototype: {
    order: 3,
    cutoffFrequencyMHz: 100,
    z0Ohm: 50,
  },
  patchAntenna: {
    fGHz: 2.4,
    epsR: 4.4,
    hMm: 1.6,
  },
  attenuators: {
    topology: "pi",
    z0Ohm: 50,
    attenuationDb: 6,
  },
  wilkinsonDivider: {
    z0Ohm: 50,
    fGHz: 2.4,
    epsEff: 1,
  },
  directionalCoupler: {
    z0Ohm: 50,
    fGHz: 2.4,
    epsEff: 1,
  },
  stripline: {
    wMm: 1.2,
    bMm: 3.2,
    tMm: 0.035,
    epsR: 4.4,
    fGHz: 2.4,
  },
  coplanarWaveguide: {
    mode: "cpw" as CoplanarWaveguideMode,
    wMm: 1.2,
    sMm: 0.2,
    hMm: 1.6,
    epsR: 4.4,
    fGHz: 2.4,
  },
  microstripLoss: {
    mode: "simplified" as MicrostripLossMode,
    attenuationDbPerM: 0.8,
    frequencyGHz: 10,
    wMm: 2,
    hMm: 0.8,
    epsR: 3.5,
    epsEff: 2.7,
    tanDelta: 0.002,
    conductivitySPerM: 58_000_000,
    copperThicknessUm: 35,
    lineLengthM: 0.25,
  },
  waveguide: {
    aMm: 22.86,
    bMm: 10.16,
    epsR: 1,
    m: 0,
    n: 0,
  },
  microstrip: {
    mode: "analysis" as MicrostripInput["mode"],
    hMm: 1.5,
    wMm: 3.38,
    z0Ohm: 50,
    epsR: 3.5,
    fGHz: 1.8,
  },
  loadImpedance: {
    lambdaMm: 100,
    swr: 3,
    dMm: 5,
    minimumType: "voltage" as LoadImpedanceMinimumType,
  },
  impedanceTransform: {
    lambdaMm: 100,
    rL: 2,
    xL: 3,
    dMm: 0,
    direction: "generator" as ImpedanceTransformDirection,
  },
  vswr: {
    type: "vswr",
    z0Ohm: 50,
    vswr: 1,
    magGamma: 0,
    argGammaDeg: 0,
    reGamma: 0,
    imGamma: 0,
    r: 1,
    x: 0,
    g: 1,
    b: 0,
    rOhm: 50,
    xOhm: 0,
    gS: 0.02,
    bS: 0,
  },
  singleStub: {
    rL: 50,
    xL: 50,
    z0Ohm: 50,
    configuration: "openSeries" as SingleStubConfiguration,
  },
  lMatch: {
    rL: 200,
    xL: -100,
    z0Ohm: 100,
    fMHz: 500,
  },
} as const;

export function defaultNumber(value: number): string {
  return String(value);
}
