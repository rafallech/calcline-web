export type WaveguidePreset = {
  id: string;
  label: string;
  description: string;
  values: {
    aMm: number;
    bMm: number;
  };
  sourceNote?: string;
};

export type MaterialPreset = {
  id: string;
  label: string;
  description: string;
  values: {
    epsR: number;
  };
  sourceNote?: string;
};

export const waveguidePresets: WaveguidePreset[] = [
  {
    id: "wr-90",
    label: "WR-90",
    description: "Standard rectangular waveguide.",
    values: {
      aMm: 22.86,
      bMm: 10.16,
    },
  },
  {
    id: "wr-75",
    label: "WR-75",
    description: "Standard rectangular waveguide.",
    values: {
      aMm: 19.05,
      bMm: 9.525,
    },
  },
  {
    id: "wr-62",
    label: "WR-62",
    description: "Standard rectangular waveguide.",
    values: {
      aMm: 15.799,
      bMm: 7.899,
    },
  },
  {
    id: "wr-42",
    label: "WR-42",
    description: "Standard rectangular waveguide.",
    values: {
      aMm: 10.668,
      bMm: 4.318,
    },
  },
];

export const materialPresets: MaterialPreset[] = [
  {
    id: "air",
    label: "Air",
    description: "Air dielectric.",
    values: {
      epsR: 1,
    },
  },
  {
    id: "fr4-typical",
    label: "FR4 typical",
    description: "Typical FR4 laminate.",
    values: {
      epsR: 4.4,
    },
    sourceNote:
      "FR4 eps_r is approximate and depends on laminate, frequency and manufacturer.",
  },
  {
    id: "rogers-ro4003c-design",
    label: "Rogers RO4003C design",
    description: "Rogers RO4003C design value.",
    values: {
      epsR: 3.55,
    },
  },
  {
    id: "rogers-ro4350b-design",
    label: "Rogers RO4350B design",
    description: "Rogers RO4350B design value.",
    values: {
      epsR: 3.66,
    },
  },
  {
    id: "alumina-96-typical",
    label: "Alumina 96% typical",
    description: "Typical 96% alumina ceramic.",
    values: {
      epsR: 9.8,
    },
  },
];
