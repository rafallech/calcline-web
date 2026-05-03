import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { StriplineCalculator } from "@/app/calculators/stripline/StriplineCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Stripline | CalcLine Web",
  description:
    "Symmetric stripline characteristic impedance, guided wavelength, and propagation delay calculator.",
};

export default function StriplinePage() {
  const calculator = getCalculator("stripline");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <StriplineCalculator calculator={calculator} />
    </AppShell>
  );
}
