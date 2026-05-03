import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { MultisectionTransformerCalculator } from "@/app/calculators/multisection-transformer/MultisectionTransformerCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Multi-section Impedance Transformer | CalcLine Web",
  description:
    "Binomial multi-section quarter-wave impedance transformer calculator.",
};

export default function MultisectionTransformerPage() {
  const calculator = getCalculator("multisection-transformer");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <MultisectionTransformerCalculator calculator={calculator} />
    </AppShell>
  );
}
