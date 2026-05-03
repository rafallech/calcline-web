import { describe, expect, it } from "vitest";
import { formatReportDate, formatResultsText, formatTextReport } from "@/lib/resultText";

describe("text report formatting", () => {
  it("formats a calculator report with date, inputs, results, units, and warnings", () => {
    const report = formatTextReport({
      title: "Example Calculator",
      generatedAt: new Date("2026-05-03T19:45:00.000Z"),
      inputs: [
        { label: "frequency", value: "2.4", unit: "GHz" },
        { label: "Z0", value: 50, unit: "Ohm" },
      ],
      sections: [
        {
          title: "Results",
          items: [
            { label: "wavelength", value: "0.124914", unit: "m" },
            { label: "gain", value: "10", unit: "dBi" },
          ],
        },
      ],
      warnings: ["Approximate design estimate."],
    });

    expect(report).toBe(
      [
        "Example Calculator",
        "Date: 2026-05-03T19:45:00.000Z",
        "",
        "Inputs:",
        "- frequency: 2.4 GHz",
        "- Z0: 50 Ohm",
        "",
        "Results:",
        "- wavelength: 0.124914 m",
        "- gain: 10 dBi",
        "",
        "Warnings:",
        "- Approximate design estimate.",
      ].join("\n"),
    );
  });

  it("uses the shared report formatter for copied results", () => {
    const report = formatResultsText({
      title: "No Warning Calculator",
      inputs: [{ label: "frequency", value: 1, unit: "GHz" }],
      sections: [
        {
          title: "Results",
          items: [{ label: "lambda", value: 0.3, unit: "m" }],
        },
      ],
    });

    expect(report).toContain("No Warning Calculator\nDate: ");
    expect(report).toContain("\nInputs:\n- frequency: 1 GHz");
    expect(report).toContain("\nResults:\n- lambda: 0.3 m");
    expect(report).not.toContain("Warnings:");
  });

  it("formats string and Date report dates", () => {
    expect(formatReportDate("manual date")).toBe("manual date");
    expect(formatReportDate(new Date("2026-05-03T00:00:00.000Z"))).toBe(
      "2026-05-03T00:00:00.000Z",
    );
  });
});
