import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { getCalculator } from "@/lib/calculators";
import { InteractiveSmithChartCalculator } from "./InteractiveSmithChartCalculator";

export const metadata: Metadata = {
  title: "Interactive Smith Chart | CalcLine Web",
  description:
    "Inspect reflection coefficient, normalized impedance, admittance, SWR, and return loss from a Smith chart point.",
};

export default function InteractiveSmithChartPage() {
  const calculator = getCalculator("interactive-smith-chart");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <InteractiveSmithChartCalculator calculator={calculator} />
    </AppShell>
  );
}
