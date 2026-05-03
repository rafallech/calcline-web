import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { CoplanarWaveguideCalculator } from "@/app/calculators/coplanar-waveguide/CoplanarWaveguideCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Coplanar Waveguide | CalcLine Web",
  description:
    "Coplanar waveguide impedance, effective permittivity, and guided wavelength calculator.",
};

export default function CoplanarWaveguidePage() {
  const calculator = getCalculator("coplanar-waveguide");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <CoplanarWaveguideCalculator calculator={calculator} />
    </AppShell>
  );
}
