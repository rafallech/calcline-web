import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { getCalculator } from "@/lib/calculators";
import { SingleStubCalculator } from "./SingleStubCalculator";

export const metadata: Metadata = {
  title: "Single Stub Matching Circuit | CalcLine Web",
  description: "Single-stub matching circuit solutions in wavelength units.",
};

export default function SingleStubPage() {
  const calculator = getCalculator("single-stub");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <SingleStubCalculator calculator={calculator} />
    </AppShell>
  );
}
