import { describe, expect, it } from "vitest";
import {
  degToRad,
  GHzToHz,
  HzToGHz,
  MHzToHz,
  mmToM,
  mToMm,
  radToDeg,
} from "@/lib/math/units";

describe("unit conversions", () => {
  it("converts millimeters and meters", () => {
    expect(mmToM(1500)).toBe(1.5);
    expect(mToMm(1.5)).toBe(1500);
  });

  it("converts MHz, GHz, and Hz", () => {
    expect(MHzToHz(2.4)).toBe(2_400_000);
    expect(GHzToHz(2.4)).toBe(2_400_000_000);
    expect(HzToGHz(2_400_000_000)).toBe(2.4);
  });

  it("converts degrees and radians", () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 12);
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90, 12);
  });
});
