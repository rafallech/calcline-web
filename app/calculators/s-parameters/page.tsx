import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SParametersCalculator } from "@/app/calculators/s-parameters/SParametersCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "S-parameter Converter | CalcLine Web",
  description: "Convert S11 and S21 into RF reflection and transmission metrics.",
};

export default function SParametersPage() {
  const calculator = getCalculator("s-parameters");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <SParametersCalculator calculator={calculator} />
    </AppShell>
  );
}

