import Link from "next/link";
import Image from "next/image";
import type { CalculatorInfo } from "@/lib/calculators";

type CalculatorCardProps = {
  calculator: CalculatorInfo;
};

export function CalculatorCard({ calculator }: CalculatorCardProps) {
  return (
    <Link
      href={calculator.route}
      className="group flex min-h-44 flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2"
    >
      <div>
        <div className="flex items-start gap-4">
          <Image
            src={calculator.icon.src}
            alt={calculator.icon.alt}
            width={75}
            height={50}
            className="h-12 w-[72px] shrink-0 rounded border border-slate-200 bg-white object-contain p-1"
          />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              {calculator.shortTitle}
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {calculator.title}
            </h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {calculator.description}
        </p>
      </div>
      <span className="mt-5 text-sm font-semibold text-cyan-800 group-hover:text-cyan-950">
        Open calculator page
      </span>
    </Link>
  );
}
