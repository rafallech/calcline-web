import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { WilkinsonDividerCalculator } from "@/app/calculators/wilkinson-divider/WilkinsonDividerCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Wilkinson Power Divider | CalcLine Web",
  description:
    "Ideal 2-way equal split Wilkinson power divider calculator.",
};

export default function WilkinsonDividerPage() {
  const calculator = getCalculator("wilkinson-divider");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <WilkinsonDividerCalculator calculator={calculator} />
    </AppShell>
  );
}
