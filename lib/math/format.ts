import type { Complex } from "@/lib/math/complex";

export function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;

  return Math.round(value * factor) / factor;
}

export function formatNumber(value: number, digits = 3): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  return roundTo(value, digits).toFixed(digits);
}

export function formatComplex(value: Complex, digits = 3): string {
  const re = formatNumber(value.re, digits);
  const im = formatNumber(Math.abs(value.im), digits);
  const sign = value.im < 0 ? "-" : "+";

  return `${re} ${sign} j${im}`;
}

export function formatWithUnit(value: number, unit: string, digits = 3): string {
  return `${formatNumber(value, digits)} ${unit}`;
}
