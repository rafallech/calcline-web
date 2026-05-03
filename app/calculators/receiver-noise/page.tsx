import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ReceiverNoiseCalculator } from "@/app/calculators/receiver-noise/ReceiverNoiseCalculator";
import { getCalculator } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Receiver Noise | CalcLine Web",
  description:
    "Receiver thermal noise floor, noise figure, minimum detectable signal, and sensitivity calculator.",
};

export default function ReceiverNoisePage() {
  const calculator = getCalculator("receiver-noise");

  if (!calculator) {
    return null;
  }

  return (
    <AppShell>
      <ReceiverNoiseCalculator calculator={calculator} />
    </AppShell>
  );
}
