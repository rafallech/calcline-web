import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AntennaApertureCalculator } from "@/app/calculators/antenna-aperture/AntennaApertureCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Antenna Gain and Effective Aperture | CalcLine Web",
  description: "Convert antenna gain and effective aperture at frequency.",
};

export default function AntennaAperturePage() {
  const calculator = getCalculator("antenna-aperture");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <AntennaApertureCalculator calculator={calculator} />
    </AppShell>
  );
}
