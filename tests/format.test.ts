import { describe, expect, it } from "vitest";
import {
  formatComplex,
  formatNumber,
  formatWithUnit,
  roundTo,
} from "@/lib/math/format";

describe("format helpers", () => {
  it("rounds numbers to the requested precision", () => {
    expect(roundTo(1.23456, 3)).toBe(1.235);
    expect(roundTo(-1.23456, 2)).toBe(-1.23);
  });

  it("formats finite and non-finite numbers", () => {
    expect(formatNumber(1.2, 3)).toBe("1.200");
    expect(formatNumber(1.23456, 2)).toBe("1.23");
    expect(formatNumber(Number.POSITIVE_INFINITY, 2)).toBe("Infinity");
    expect(formatNumber(Number.NaN, 2)).toBe("NaN");
  });

  it("formats numbers with units", () => {
    expect(formatWithUnit(6.56168, "GHz", 3)).toBe("6.562 GHz");
    expect(formatWithUnit(50, "Ohm", 1)).toBe("50.0 Ohm");
  });

  it("formats complex values as R + jX", () => {
    expect(formatComplex({ re: 50, im: 12.3456 }, 2)).toBe("50.00 + j12.35");
    expect(formatComplex({ re: 50, im: -12.3456 }, 2)).toBe(
      "50.00 - j12.35",
    );
  });
});
