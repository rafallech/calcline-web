import type { ImpedanceTransformDirection } from "@/lib/calculators/impedanceTransform";
import type { LoadImpedanceMinimumType } from "@/lib/calculators/loadImpedance";
import type { MicrostripInput } from "@/lib/calculators/microstrip";
import type { SingleStubConfiguration } from "@/lib/calculators/singleStub";

export const calculatorDefaults = {
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
