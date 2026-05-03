import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { RfPowerCalculator } from "@/app/calculators/rf-power/RfPowerCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "RF Power and dB Converter | CalcLine Web",
  description: "Convert RF power, dB levels, voltage, and current.",
};

export default function RfPowerPage() {
  const calculator = getCalculator("rf-power");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <RfPowerCalculator calculator={calculator} />
    </AppShell>
  );
}

