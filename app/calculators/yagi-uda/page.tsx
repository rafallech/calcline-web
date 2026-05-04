import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { YagiUdaCalculator } from "@/app/calculators/yagi-uda/YagiUdaCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Yagi-Uda Antenna Designer | CalcLine Web",
  description:
    "Generate DL6WU-inspired Yagi-Uda antenna starting dimensions.",
};

export default function YagiUdaPage() {
  const calculator = getCalculator("yagi-uda");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <YagiUdaCalculator calculator={calculator} />
    </AppShell>
  );
}
