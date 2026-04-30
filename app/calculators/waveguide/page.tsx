import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { WaveguideCalculator } from "@/app/calculators/waveguide/WaveguideCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Rectangular Waveguide | CalcLine Web",
  description: "Cutoff frequency calculator for rectangular waveguides.",
};

export default function WaveguidePage() {
  const calculator = getCalculator("waveguide");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <WaveguideCalculator calculator={calculator} />
    </AppShell>
  );
}
