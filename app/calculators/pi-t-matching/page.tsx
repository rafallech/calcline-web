import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { PiTMatchingCalculator } from "@/app/calculators/pi-t-matching/PiTMatchingCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Pi and T Matching Networks | CalcLine Web",
  description:
    "Ideal low-pass Pi and T matching network calculator from resistance ratio and target Q.",
};

export default function PiTMatchingPage() {
  const calculator = getCalculator("pi-t-matching");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <PiTMatchingCalculator calculator={calculator} />
    </AppShell>
  );
}
