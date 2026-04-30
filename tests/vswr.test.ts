import { describe, expect, it } from "vitest";
import { calculateVswr } from "@/lib/calculators/vswr";

describe("VSWR calculator", () => {
  it("converts VSWR and angle into reflection coefficient using sine for Im(Gamma)", () => {
    const result = calculateVswr({
      type: "vswr",
      z0Ohm: 50,
      vswr: 3,
      argGammaDeg: 30,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.value?.vswr).toBeCloseTo(3, 12);
    expect(result.value?.magGamma).toBeCloseTo(0.5, 12);
    expect(result.value?.argGammaDeg).toBeCloseTo(30, 12);
    expect(result.value?.gamma.re).toBeCloseTo(0.4330127019, 10);
    // The old AIA blocks appeared to use cos for Im(Gamma); the web version uses the correct sin formula.
    expect(result.value?.gamma.im).toBeCloseTo(0.25, 12);
  });

  it("converts polar Gamma into all dependent values", () => {
    const result = calculateVswr({
      type: "gammaPolar",
      z0Ohm: 50,
      magGamma: 0.5,
      argGammaDeg: 30,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.vswr).toBeCloseTo(3, 12);
    expect(result.value?.gamma.re).toBeCloseTo(0.4330127019, 10);
    expect(result.value?.gamma.im).toBeCloseTo(0.25, 12);
    expect(result.value?.z.re).toBeCloseTo(1.9532542189, 10);
    expect(result.value?.z.im).toBeCloseTo(1.3021694793, 10);
    expect(result.value?.y.re).toBeCloseTo(0.3544380888, 10);
    expect(result.value?.y.im).toBeCloseTo(-0.2362920592, 10);
    expect(result.value?.Z.re).toBeCloseTo(97.6627109439, 10);
    expect(result.value?.Z.im).toBeCloseTo(65.1084739626, 10);
    expect(result.value?.Y.re).toBeCloseTo(0.0070887618, 10);
    expect(result.value?.Y.im).toBeCloseTo(-0.0047258412, 10);
  });

  it("converts rectangular Gamma", () => {
    const result = calculateVswr({
      type: "gammaRect",
      z0Ohm: 50,
      reGamma: 0.4330127019,
      imGamma: 0.25,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.vswr).toBeCloseTo(3, 9);
    expect(result.value?.magGamma).toBeCloseTo(0.5, 10);
    expect(result.value?.argGammaDeg).toBeCloseTo(30, 9);
  });

  it("converts normalized impedance", () => {
    const result = calculateVswr({
      type: "normalizedImpedance",
      z0Ohm: 50,
      r: 2,
      x: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.gamma.re).toBeCloseTo(0.4, 12);
    expect(result.value?.gamma.im).toBeCloseTo(0.2, 12);
    expect(result.value?.vswr).toBeCloseTo(2.6180339887, 10);
    expect(result.value?.z.re).toBeCloseTo(2, 12);
    expect(result.value?.z.im).toBeCloseTo(1, 12);
    expect(result.value?.y.re).toBeCloseTo(0.4, 12);
    expect(result.value?.y.im).toBeCloseTo(-0.2, 12);
    expect(result.value?.Z.re).toBeCloseTo(100, 12);
    expect(result.value?.Z.im).toBeCloseTo(50, 12);
    expect(result.value?.Y.re).toBeCloseTo(0.008, 12);
    expect(result.value?.Y.im).toBeCloseTo(-0.004, 12);
  });

  it("converts normalized admittance", () => {
    const result = calculateVswr({
      type: "normalizedAdmittance",
      z0Ohm: 50,
      g: 0.4,
      b: -0.2,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.z.re).toBeCloseTo(2, 12);
    expect(result.value?.z.im).toBeCloseTo(1, 12);
    expect(result.value?.gamma.re).toBeCloseTo(0.4, 12);
    expect(result.value?.gamma.im).toBeCloseTo(0.2, 12);
  });

  it("converts impedance in Ohm", () => {
    const result = calculateVswr({
      type: "impedance",
      z0Ohm: 50,
      rOhm: 100,
      xOhm: 50,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.z.re).toBeCloseTo(2, 12);
    expect(result.value?.z.im).toBeCloseTo(1, 12);
    expect(result.value?.Y.re).toBeCloseTo(0.008, 12);
    expect(result.value?.Y.im).toBeCloseTo(-0.004, 12);
  });

  it("converts admittance in siemens", () => {
    const result = calculateVswr({
      type: "admittance",
      z0Ohm: 50,
      gS: 0.008,
      bS: -0.004,
    });

    expect(result.ok).toBe(true);
    expect(result.value?.z.re).toBeCloseTo(2, 12);
    expect(result.value?.z.im).toBeCloseTo(1, 12);
    expect(result.value?.Z.re).toBeCloseTo(100, 12);
    expect(result.value?.Z.im).toBeCloseTo(50, 12);
  });

  it("validates direct VSWR and Gamma inputs", () => {
    expect(
      calculateVswr({
        type: "vswr",
        z0Ohm: 0,
        vswr: 0.9,
        argGammaDeg: Number.NaN,
      }),
    ).toMatchObject({
      ok: false,
      errors: [
        "Set Z0 > 0 Ohm.",
        "Set VSWR >= 1.",
        "Set arg(Gamma) as a finite angle in degrees.",
      ],
    });

    expect(
      calculateVswr({
        type: "gammaPolar",
        z0Ohm: 50,
        magGamma: 1,
        argGammaDeg: 0,
      }),
    ).toMatchObject({
      ok: false,
      errors: ["Set 0 <= |Gamma| < 1."],
    });

    expect(
      calculateVswr({
        type: "gammaRect",
        z0Ohm: 50,
        reGamma: 0.8,
        imGamma: 0.8,
      }),
    ).toMatchObject({
      ok: false,
      errors: ["Set sqrt(Re(Gamma)^2 + Im(Gamma)^2) < 1."],
    });
  });

  it("validates impedance and admittance inputs", () => {
    expect(
      calculateVswr({
        type: "normalizedImpedance",
        z0Ohm: 50,
        r: -1,
        x: Number.NaN,
      }),
    ).toMatchObject({
      ok: false,
      errors: ["Set r >= 0.", "Set x as a finite number."],
    });

    expect(
      calculateVswr({
        type: "normalizedAdmittance",
        z0Ohm: 50,
        g: 0,
        b: 0,
      }),
    ).toMatchObject({
      ok: false,
      errors: ["Set normalized admittance magnitude > 0."],
    });

    expect(
      calculateVswr({
        type: "impedance",
        z0Ohm: 50,
        rOhm: -1,
        xOhm: Number.NaN,
      }),
    ).toMatchObject({
      ok: false,
      errors: ["Set R >= 0 Ohm.", "Set X as a finite number."],
    });

    expect(
      calculateVswr({
        type: "admittance",
        z0Ohm: 50,
        gS: 0,
        bS: 0,
      }),
    ).toMatchObject({
      ok: false,
      errors: ["Set admittance magnitude > 0 S."],
    });
  });
});
