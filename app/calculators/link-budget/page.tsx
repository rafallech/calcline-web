import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { LinkBudgetCalculator } from "@/app/calculators/link-budget/LinkBudgetCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Link Budget | CalcLine Web",
  description: "Free-space RF link budget calculator.",
};

export default function LinkBudgetPage() {
  const calculator = getCalculator("link-budget");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <LinkBudgetCalculator calculator={calculator} />
    </AppShell>
  );
}

