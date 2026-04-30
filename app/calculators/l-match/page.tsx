import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { getCalculator } from "@/lib/calculators";
import { LMatchCalculator } from "./LMatchCalculator";

export const metadata: Metadata = {
  title: "L-section Matching Network | CalcLine Web",
  description: "L-section matching solutions and ideal element values.",
};

export default function LMatchPage() {
  const calculator = getCalculator("l-match");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <LMatchCalculator calculator={calculator} />
    </AppShell>
  );
}
