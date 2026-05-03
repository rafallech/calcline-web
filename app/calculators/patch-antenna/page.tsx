import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { PatchAntennaCalculator } from "@/app/calculators/patch-antenna/PatchAntennaCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Microstrip Patch Antenna | CalcLine Web",
  description: "Approximate rectangular microstrip patch antenna dimensions.",
};

export default function PatchAntennaPage() {
  const calculator = getCalculator("patch-antenna");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <PatchAntennaCalculator calculator={calculator} />
    </AppShell>
  );
}

