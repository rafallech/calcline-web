import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { LoadImpedanceCalculator } from "@/app/calculators/load-impedance/LoadImpedanceCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Load Impedance Calculation | CalcLine Web",
  description: "Normalized load impedance calculator from SWR and wave minimum.",
};

export default function LoadImpedancePage() {
  const calculator = getCalculator("load-impedance");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <LoadImpedanceCalculator calculator={calculator} />
    </AppShell>
  );
}
