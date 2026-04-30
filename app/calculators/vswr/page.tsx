import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { getCalculator } from "@/lib/calculators";
import { VswrCalculator } from "./VswrCalculator";

export const metadata: Metadata = {
  title: "VSWR Calculation | CalcLine Web",
  description:
    "Convert between VSWR, reflection coefficient, impedance, and admittance.",
};

export default function VswrPage() {
  const calculator = getCalculator("vswr");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <VswrCalculator calculator={calculator} />
    </AppShell>
  );
}
