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

export type CommonImpedancePreset = {
  id: string;
  label: string;
  description: string;
  values: {
    ohms: number;
  };
};

export type CommonFrequencyPreset = {
  id: string;
  label: string;
  description: string;
  values: {
    frequencyGHz: number;
  };
};

export type CommonEffectivePermittivityPreset = {
  id: string;
  label: string;
  description: string;
  values: {
    epsEff: number;
  };
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

export const commonImpedancePresets: CommonImpedancePreset[] = [
  {
    id: "impedance-50",
    label: "50 Ohm",
    description: "Common RF system impedance.",
    values: {
      ohms: 50,
    },
  },
  {
    id: "impedance-75",
    label: "75 Ohm",
    description: "Common coaxial and video system impedance.",
    values: {
      ohms: 75,
    },
  },
  {
    id: "impedance-100",
    label: "100 Ohm",
    description: "Common differential and matching reference impedance.",
    values: {
      ohms: 100,
    },
  },
];

export const commonFrequencyPresets: CommonFrequencyPreset[] = [
  {
    id: "frequency-433mhz",
    label: "433 MHz",
    description: "Common ISM and SRD frequency.",
    values: {
      frequencyGHz: 0.433,
    },
  },
  {
    id: "frequency-868mhz",
    label: "868 MHz",
    description: "Common European ISM and SRD frequency.",
    values: {
      frequencyGHz: 0.868,
    },
  },
  {
    id: "frequency-915mhz",
    label: "915 MHz",
    description: "Common ISM frequency.",
    values: {
      frequencyGHz: 0.915,
    },
  },
  {
    id: "frequency-1-8ghz",
    label: "1.8 GHz",
    description: "Common cellular band frequency.",
    values: {
      frequencyGHz: 1.8,
    },
  },
  {
    id: "frequency-2-4ghz",
    label: "2.4 GHz",
    description: "Common ISM, Wi-Fi, and Bluetooth frequency.",
    values: {
      frequencyGHz: 2.4,
    },
  },
  {
    id: "frequency-5-8ghz",
    label: "5.8 GHz",
    description: "Common ISM and Wi-Fi frequency.",
    values: {
      frequencyGHz: 5.8,
    },
  },
  {
    id: "frequency-10ghz",
    label: "10 GHz",
    description: "Common microwave reference frequency.",
    values: {
      frequencyGHz: 10,
    },
  },
];

export const commonEffectivePermittivityPresets: CommonEffectivePermittivityPreset[] =
  [
    {
      id: "eps-eff-1",
      label: "eps_eff 1",
      description: "Air or free-space propagation.",
      values: {
        epsEff: 1,
      },
    },
    {
      id: "eps-eff-2-2",
      label: "eps_eff 2.2",
      description: "Common low-loss RF substrate effective value.",
      values: {
        epsEff: 2.2,
      },
    },
    {
      id: "eps-eff-3",
      label: "eps_eff 3",
      description: "Mid-range quasi-TEM effective permittivity.",
      values: {
        epsEff: 3,
      },
    },
    {
      id: "eps-eff-4",
      label: "eps_eff 4",
      description: "Higher effective permittivity design value.",
      values: {
        epsEff: 4,
      },
    },
  ];
