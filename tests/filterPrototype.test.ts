import { describe, expect, it } from "vitest";
import {
  butterworthGValues,
  calculateFilterPrototype,
} from "@/lib/calculators/filterPrototype";

describe("filter prototype calculator", () => {
  it("calculates first-order Butterworth prototype values", () => {
    const result = calculateFilterPrototype({
      order: 1,
      cutoffFrequencyMHz: 100,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.value?.gValues).toEqual([1, 2, 1]);
    expect(result.value?.elements).toHaveLength(1);
    expect(result.value?.elements[0]).toMatchObject({
      index: 1,
      kind: "series-inductor",
      label: "L1",
      unit: "H",
    });
    expect(result.value?.elements[0]?.value).toBeCloseTo(159.1549431e-9, 16);
  });

  it("calculates third-order Butterworth L-C-L sequence", () => {
    const result = calculateFilterPrototype({
      order: 3,
      cutoffFrequencyMHz: 100,
      z0Ohm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.gValues[0]).toBe(1);
    expect(result.value?.gValues[1]).toBeCloseTo(1, 12);
    expect(result.value?.gValues[2]).toBeCloseTo(2, 12);
    expect(result.value?.gValues[3]).toBeCloseTo(1, 12);
    expect(result.value?.gValues[4]).toBe(1);
    expect(result.value?.elements.map((element) => element.label)).toEqual([
      "L1",
      "C2",
      "L3",
    ]);
    expect(result.value?.elements[0]?.value).toBeCloseTo(79.57747155e-9, 16);
    expect(result.value?.elements[1]?.value).toBeCloseTo(63.66197724e-12, 16);
    expect(result.value?.elements[2]?.value).toBeCloseTo(79.57747155e-9, 16);
  });

  it("calculates fifth-order normalized g-values", () => {
    const values = butterworthGValues(5);

    expect(values).toHaveLength(7);
    expect(values[0]).toBe(1);
    expect(values[1]).toBeCloseTo(0.6180339887, 10);
    expect(values[2]).toBeCloseTo(1.6180339887, 10);
    expect(values[3]).toBeCloseTo(2, 12);
    expect(values[4]).toBeCloseTo(1.6180339887, 10);
    expect(values[5]).toBeCloseTo(0.6180339887, 10);
    expect(values[6]).toBe(1);
  });

  it("validates order, cutoff frequency, and impedance", () => {
    const result = calculateFilterPrototype({
      order: 11,
      cutoffFrequencyMHz: 0,
      z0Ohm: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.errors).toEqual([
      "Set order n as an integer from 1 to 10.",
      "Set cutoff frequency > 0 MHz.",
      "Set Z0 > 0 Ohm.",
    ]);
  });
});
