import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { WavelengthCalculator } from "@/app/calculators/wavelength/WavelengthCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Wavelength and Electrical Length | CalcLine Web",
  description:
    "Wavelength and electrical length calculator for RF and microwave lines.",
};

export default function WavelengthPage() {
  const calculator = getCalculator("wavelength");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <WavelengthCalculator calculator={calculator} />
    </AppShell>
  );
}

