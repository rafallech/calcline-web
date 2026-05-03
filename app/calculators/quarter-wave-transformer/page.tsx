import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { QuarterWaveTransformerCalculator } from "@/app/calculators/quarter-wave-transformer/QuarterWaveTransformerCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Quarter-wave Transformer | CalcLine Web",
  description:
    "Ideal quarter-wave impedance transformer calculator for real loads.",
};

export default function QuarterWaveTransformerPage() {
  const calculator = getCalculator("quarter-wave-transformer");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <QuarterWaveTransformerCalculator calculator={calculator} />
    </AppShell>
  );
}

