import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { MicrostripLossCalculator } from "@/app/calculators/microstrip-loss/MicrostripLossCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Microstrip Loss | CalcLine Web",
  description:
    "Approximate microstrip dielectric and conductor loss calculator.",
};

export default function MicrostripLossPage() {
  const calculator = getCalculator("microstrip-loss");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <MicrostripLossCalculator calculator={calculator} />
    </AppShell>
  );
}
