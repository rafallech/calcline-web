import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { DirectionalCouplerCalculator } from "@/app/calculators/directional-coupler/DirectionalCouplerCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Directional Coupler | CalcLine Web",
  description:
    "Ideal branch-line 90 degree hybrid coupler calculator.",
};

export default function DirectionalCouplerPage() {
  const calculator = getCalculator("directional-coupler");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <DirectionalCouplerCalculator calculator={calculator} />
    </AppShell>
  );
}
