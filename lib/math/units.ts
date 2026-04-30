export function mmToM(value: number): number {
  return value / 1000;
}

export function mToMm(value: number): number {
  return value * 1000;
}

export function MHzToHz(value: number): number {
  return value * 1_000_000;
}

export function GHzToHz(value: number): number {
  return value * 1_000_000_000;
}

export function HzToGHz(value: number): number {
  return value / 1_000_000_000;
}

export function degToRad(value: number): number {
  return (value * Math.PI) / 180;
}

export function radToDeg(value: number): number {
  return (value * 180) / Math.PI;
}
