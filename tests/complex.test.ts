import { describe, expect, it } from "vitest";
import {
  abs,
  add,
  argDeg,
  argRad,
  conj,
  div,
  formatComplex,
  fromPolar,
  isFiniteComplex,
  mul,
  sub,
  type Complex,
} from "@/lib/math/complex";

function expectComplexCloseTo(actual: Complex, expected: Complex) {
  expect(actual.re).toBeCloseTo(expected.re, 12);
  expect(actual.im).toBeCloseTo(expected.im, 12);
}

describe("complex math", () => {
  it("adds and subtracts complex values", () => {
    const a = { re: 3, im: 4 };
    const b = { re: 1, im: -2 };

    expect(add(a, b)).toEqual({ re: 4, im: 2 });
    expect(sub(a, b)).toEqual({ re: 2, im: 6 });
  });

  it("multiplies complex values", () => {
    expect(mul({ re: 3, im: 4 }, { re: 1, im: -2 })).toEqual({
      re: 11,
      im: -2,
    });
  });

  it("divides complex values", () => {
    expectComplexCloseTo(div({ re: 3, im: 4 }, { re: 1, im: -2 }), {
      re: -1,
      im: 2,
    });
  });

  it("computes magnitude and angle", () => {
    const value = { re: 0, im: 2 };

    expect(abs(value)).toBe(2);
    expect(argRad(value)).toBeCloseTo(Math.PI / 2, 12);
    expect(argDeg(value)).toBeCloseTo(90, 12);
  });

  it("conjugates and creates values from polar coordinates", () => {
    expect(conj({ re: 3, im: -4 })).toEqual({ re: 3, im: 4 });

    expectComplexCloseTo(fromPolar(2, 90), {
      re: 0,
      im: 2,
    });
  });

  it("checks whether both parts are finite", () => {
    expect(isFiniteComplex({ re: 1, im: 0 })).toBe(true);
    expect(isFiniteComplex({ re: Number.POSITIVE_INFINITY, im: 0 })).toBe(
      false,
    );
    expect(isFiniteComplex({ re: 1, im: Number.NaN })).toBe(false);
  });

  it("formats values as R + jX", () => {
    expect(formatComplex({ re: 1.23456, im: -7.8 }, 2)).toBe("1.23 - j7.80");
    expect(formatComplex({ re: 1, im: 2 }, 1)).toBe("1.0 + j2.0");
  });
});
