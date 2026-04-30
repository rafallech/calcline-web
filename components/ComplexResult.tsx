import { formatComplex } from "@/lib/math/format";
import type { Complex } from "@/lib/math/complex";

type ComplexResultProps = {
  label: string;
  value: Complex;
  digits?: number;
  unit?: string;
};

export function ComplexResult({
  label,
  value,
  digits = 3,
  unit,
}: ComplexResultProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className="mt-2 break-words font-mono text-base font-semibold text-slate-950 sm:text-lg">
        {formatComplex(value, digits)}
        {unit ? (
          <span className="ml-2 font-sans text-sm font-normal text-slate-500">
            {unit}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
