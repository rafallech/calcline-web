import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { DipoleMonopoleCalculator } from "@/app/calculators/dipole-monopole/DipoleMonopoleCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Dipole and Monopole Antenna | CalcLine Web",
  description: "Estimate half-wave dipole and quarter-wave monopole lengths.",
};

export default function DipoleMonopolePage() {
  const calculator = getCalculator("dipole-monopole");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <DipoleMonopoleCalculator calculator={calculator} />
    </AppShell>
  );
}
