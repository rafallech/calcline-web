import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { MicrostripCalculator } from "@/app/calculators/microstrip/MicrostripCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Microstrip Line | CalcLine Web",
  description: "Analysis and synthesis calculator for microstrip lines.",
};

export default function MicrostripPage() {
  const calculator = getCalculator("microstrip");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <MicrostripCalculator calculator={calculator} />
    </AppShell>
  );
}
