import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { FilterPrototypeCalculator } from "@/app/calculators/filter-prototype/FilterPrototypeCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Microwave Filter Prototype | CalcLine Web",
  description:
    "Butterworth low-pass prototype g-values and scaled L/C element calculator.",
};

export default function FilterPrototypePage() {
  const calculator = getCalculator("filter-prototype");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <FilterPrototypeCalculator calculator={calculator} />
    </AppShell>
  );
}
