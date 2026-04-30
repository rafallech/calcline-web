import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ImpedanceTransformCalculator } from "@/app/calculators/impedance-transform/ImpedanceTransformCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Impedance Transformation | CalcLine Web",
  description: "Normalized impedance transformation along a transmission line.",
};

export default function ImpedanceTransformPage() {
  const calculator = getCalculator("impedance-transform");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <ImpedanceTransformCalculator calculator={calculator} />
    </AppShell>
  );
}
