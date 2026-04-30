export type Complex = {
  re: number;
  im: number;
};

export function add(a: Complex, b: Complex): Complex {
  return {
    re: a.re + b.re,
    im: a.im + b.im,
  };
}

export function sub(a: Complex, b: Complex): Complex {
  return {
    re: a.re - b.re,
    im: a.im - b.im,
  };
}

export function mul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function div(a: Complex, b: Complex): Complex {
  const denominator = b.re * b.re + b.im * b.im;

  return {
    re: (a.re * b.re + a.im * b.im) / denominator,
    im: (a.im * b.re - a.re * b.im) / denominator,
  };
}

export function abs(a: Complex): number {
  return Math.hypot(a.re, a.im);
}

export function argRad(a: Complex): number {
  return Math.atan2(a.im, a.re);
}

export function argDeg(a: Complex): number {
  return (argRad(a) * 180) / Math.PI;
}

export function conj(a: Complex): Complex {
  return {
    re: a.re,
    im: -a.im,
  };
}

export function fromPolar(mag: number, angleDeg: number): Complex {
  const angleRad = (angleDeg * Math.PI) / 180;

  return {
    re: mag * Math.cos(angleRad),
    im: mag * Math.sin(angleRad),
  };
}

export function isFiniteComplex(a: Complex): boolean {
  return Number.isFinite(a.re) && Number.isFinite(a.im);
}

export function formatComplex(a: Complex, digits = 3): string {
  const re = a.re.toFixed(digits);
  const imAbs = Math.abs(a.im).toFixed(digits);
  const sign = a.im < 0 ? "-" : "+";

  return `${re} ${sign} j${imAbs}`;
}
