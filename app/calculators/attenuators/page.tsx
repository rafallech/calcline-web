import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AttenuatorsCalculator } from "@/app/calculators/attenuators/AttenuatorsCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Resistive Attenuators | CalcLine Web",
  description: "Pi and T resistive attenuator calculator.",
};

export default function AttenuatorsPage() {
  const calculator = getCalculator("attenuators");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <AttenuatorsCalculator calculator={calculator} />
    </AppShell>
  );
}

