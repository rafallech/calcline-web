import { describe, expect, it } from "vitest";
import {
  commonEffectivePermittivityPresets,
  commonFrequencyPresets,
  commonImpedancePresets,
  materialPresets,
  waveguidePresets,
} from "@/lib/data/presets";

describe("preset data", () => {
  it("uses unique ids across all presets", () => {
    const ids = [
      ...waveguidePresets,
      ...materialPresets,
      ...commonImpedancePresets,
      ...commonFrequencyPresets,
      ...commonEffectivePermittivityPresets,
    ].map((preset) => preset.id);

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

  it("defines common impedance preset values", () => {
    expect(
      commonImpedancePresets.map((preset) => ({
        id: preset.id,
        label: preset.label,
        ohms: preset.values.ohms,
      })),
    ).toEqual([
      { id: "impedance-50", label: "50 Ohm", ohms: 50 },
      { id: "impedance-75", label: "75 Ohm", ohms: 75 },
      { id: "impedance-100", label: "100 Ohm", ohms: 100 },
    ]);

    for (const preset of commonImpedancePresets) {
      expect(preset.values.ohms).toBeGreaterThan(0);
    }
  });

  it("defines common frequency preset values in GHz", () => {
    expect(
      commonFrequencyPresets.map((preset) => ({
        id: preset.id,
        label: preset.label,
        frequencyGHz: preset.values.frequencyGHz,
      })),
    ).toEqual([
      { id: "frequency-433mhz", label: "433 MHz", frequencyGHz: 0.433 },
      { id: "frequency-868mhz", label: "868 MHz", frequencyGHz: 0.868 },
      { id: "frequency-915mhz", label: "915 MHz", frequencyGHz: 0.915 },
      { id: "frequency-1-8ghz", label: "1.8 GHz", frequencyGHz: 1.8 },
      { id: "frequency-2-4ghz", label: "2.4 GHz", frequencyGHz: 2.4 },
      { id: "frequency-5-8ghz", label: "5.8 GHz", frequencyGHz: 5.8 },
      { id: "frequency-10ghz", label: "10 GHz", frequencyGHz: 10 },
    ]);

    for (const preset of commonFrequencyPresets) {
      expect(preset.values.frequencyGHz).toBeGreaterThan(0);
    }
  });

  it("defines common effective permittivity preset values", () => {
    expect(
      commonEffectivePermittivityPresets.map((preset) => ({
        id: preset.id,
        label: preset.label,
        epsEff: preset.values.epsEff,
      })),
    ).toEqual([
      { id: "eps-eff-1", label: "eps_eff 1", epsEff: 1 },
      { id: "eps-eff-2-2", label: "eps_eff 2.2", epsEff: 2.2 },
      { id: "eps-eff-3", label: "eps_eff 3", epsEff: 3 },
      { id: "eps-eff-4", label: "eps_eff 4", epsEff: 4 },
    ]);

    for (const preset of commonEffectivePermittivityPresets) {
      expect(preset.values.epsEff).toBeGreaterThanOrEqual(1);
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
    for (const preset of [
      ...waveguidePresets,
      ...materialPresets,
      ...commonImpedancePresets,
      ...commonFrequencyPresets,
      ...commonEffectivePermittivityPresets,
    ]) {
      expect(preset.label.trim().length).toBeGreaterThan(0);
    }
  });
});
