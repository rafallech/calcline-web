import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { RfCascadeCalculator } from "@/app/calculators/rf-cascade/RfCascadeCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "RF Cascade | CalcLine Web",
  description:
    "RF cascade gain, Friis noise figure, stage output power, and cascaded IP3 calculator.",
};

export default function RfCascadePage() {
  const calculator = getCalculator("rf-cascade");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <RfCascadeCalculator calculator={calculator} />
    </AppShell>
  );
}
