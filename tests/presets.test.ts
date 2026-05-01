import { describe, expect, it } from "vitest";
import {
  materialPresets,
  waveguidePresets,
} from "@/lib/data/presets";

describe("preset data", () => {
  it("uses unique ids across all presets", () => {
    const ids = [...waveguidePresets, ...materialPresets].map(
      (preset) => preset.id,
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("defines positive waveguide dimensions", () => {
    for (const preset of waveguidePresets) {
      expect(preset.values.aMm).toBeGreaterThan(0);
      expect(preset.values.bMm).toBeGreaterThan(0);
    }
  });

  it("defines the waveguide presets used by the Rectangular Waveguide selector", () => {
    expect(
      waveguidePresets.map((preset) => ({
        id: preset.id,
        label: preset.label,
        aMm: preset.values.aMm,
        bMm: preset.values.bMm,
      })),
    ).toEqual([
      { id: "wr-90", label: "WR-90", aMm: 22.86, bMm: 10.16 },
      { id: "wr-75", label: "WR-75", aMm: 19.05, bMm: 9.525 },
      { id: "wr-62", label: "WR-62", aMm: 15.799, bMm: 7.899 },
      { id: "wr-42", label: "WR-42", aMm: 10.668, bMm: 4.318 },
    ]);
  });

  it("defines material eps_r values greater than or equal to 1", () => {
    for (const preset of materialPresets) {
      expect(preset.values.epsR).toBeGreaterThanOrEqual(1);
    }
  });

  it("defines the material presets used by the Microstrip Line selector", () => {
    expect(
      materialPresets.map((preset) => ({
        id: preset.id,
        label: preset.label,
        epsR: preset.values.epsR,
        sourceNote: preset.sourceNote,
      })),
    ).toEqual([
      {
        id: "air",
        label: "Air",
        epsR: 1,
        sourceNote: undefined,
      },
      {
        id: "fr4-typical",
        label: "FR4 typical",
        epsR: 4.4,
        sourceNote:
          "FR4 eps_r is approximate and depends on laminate, frequency and manufacturer.",
      },
      {
        id: "rogers-ro4003c-design",
        label: "Rogers RO4003C design",
        epsR: 3.55,
        sourceNote: undefined,
      },
      {
        id: "rogers-ro4350b-design",
        label: "Rogers RO4350B design",
        epsR: 3.66,
        sourceNote: undefined,
      },
      {
        id: "alumina-96-typical",
        label: "Alumina 96% typical",
        epsR: 9.8,
        sourceNote: undefined,
      },
    ]);
  });

  it("defines a label for every preset", () => {
    for (const preset of [...waveguidePresets, ...materialPresets]) {
      expect(preset.label.trim().length).toBeGreaterThan(0);
    }
  });
});
