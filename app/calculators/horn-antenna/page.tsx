import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { HornAntennaCalculator } from "@/app/calculators/horn-antenna/HornAntennaCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Horn Antenna | CalcLine Web",
  description: "Estimate horn antenna aperture gain and approximate beamwidth.",
};

export default function HornAntennaPage() {
  const calculator = getCalculator("horn-antenna");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <HornAntennaCalculator calculator={calculator} />
    </AppShell>
  );
}
