export type CalculatorSlug =
  | "wavelength"
  | "rf-power"
  | "quarter-wave-transformer"
  | "s-parameters"
  | "link-budget"
  | "receiver-noise"
  | "rf-cascade"
  | "patch-antenna"
  | "attenuators"
  | "wilkinson-divider"
  | "directional-coupler"
  | "stripline"
  | "coplanar-waveguide"
  | "microstrip-loss"
  | "waveguide"
  | "microstrip"
  | "load-impedance"
  | "impedance-transform"
  | "vswr"
  | "single-stub"
  | "l-match";

export type CalculatorCategory =
  | "transmission-lines"
  | "matching"
  | "rf-utilities"
  | "passive-components"
  | "antennas"
  | "system-calculators";

export type CalculatorInfo = {
  slug: CalculatorSlug;
  title: string;
  shortTitle: string;
  category: CalculatorCategory;
  sourceScreen: string;
  description: string;
  route: string;
  icon: {
    src: string;
    alt: string;
  };
};

export const calculatorCategories: {
  id: CalculatorCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "transmission-lines",
    label: "Transmission Lines",
    description: "Line, waveguide, wavelength, and impedance transformation tools.",
  },
  {
    id: "matching",
    label: "Matching",
    description: "Stub and lumped-element matching calculators.",
  },
  {
    id: "rf-utilities",
    label: "RF Utilities",
    description: "Conversions and RF parameter helper tools.",
  },
  {
    id: "passive-components",
    label: "Passive Components",
    description: "Ideal passive RF component design aids.",
  },
  {
    id: "antennas",
    label: "Antennas",
    description: "Antenna sizing and approximation calculators.",
  },
  {
    id: "system-calculators",
    label: "System Calculators",
    description: "End-to-end RF system and link calculations.",
  },
];

export const calculators: CalculatorInfo[] = [
  {
    slug: "wavelength",
    title: "Wavelength and Electrical Length",
    shortTitle: "Wavelength",
    category: "transmission-lines",
    sourceScreen: "New calculator",
    description:
      "Convert frequency, effective permittivity, and physical length into wavelength and electrical length.",
    route: "/calculators/wavelength",
    icon: {
      src: "/icons/calculators/wavelength.svg",
      alt: "Wavelength and electrical length calculator icon",
    },
  },
  {
    slug: "rf-power",
    title: "RF Power and dB Converter",
    shortTitle: "RF Power",
    category: "rf-utilities",
    sourceScreen: "New calculator",
    description:
      "Convert RF power between dBm, dBW, watts, milliwatts, voltage, and current.",
    route: "/calculators/rf-power",
    icon: {
      src: "/icons/calculators/rf-power.svg",
      alt: "RF power and dB converter icon",
    },
  },
  {
    slug: "quarter-wave-transformer",
    title: "Quarter-wave Transformer",
    shortTitle: "Quarter-wave",
    category: "passive-components",
    sourceScreen: "New calculator",
    description:
      "Design an ideal quarter-wave impedance transformer for real source and load resistances.",
    route: "/calculators/quarter-wave-transformer",
    icon: {
      src: "/icons/calculators/quarter-wave-transformer.svg",
      alt: "Quarter-wave transformer calculator icon",
    },
  },
  {
    slug: "s-parameters",
    title: "S-parameter Converter",
    shortTitle: "S-parameters",
    category: "rf-utilities",
    sourceScreen: "New calculator",
    description:
      "Convert S11 and S21 into reflection, mismatch, VSWR, return loss, and gain metrics.",
    route: "/calculators/s-parameters",
    icon: {
      src: "/icons/calculators/s-parameters.svg",
      alt: "S-parameter converter calculator icon",
    },
  },
  {
    slug: "link-budget",
    title: "Link Budget",
    shortTitle: "Link Budget",
    category: "system-calculators",
    sourceScreen: "New calculator",
    description:
      "Estimate EIRP, free-space path loss, received power, and link margin.",
    route: "/calculators/link-budget",
    icon: {
      src: "/icons/calculators/link-budget.svg",
      alt: "Link budget calculator icon",
    },
  },
  {
    slug: "receiver-noise",
    title: "Receiver Noise",
    shortTitle: "Receiver Noise",
    category: "system-calculators",
    sourceScreen: "New calculator",
    description:
      "Estimate thermal noise floor, noise figure impact, detectable signal, and receiver sensitivity.",
    route: "/calculators/receiver-noise",
    icon: {
      src: "/icons/calculators/receiver-noise.svg",
      alt: "Receiver noise calculator icon",
    },
  },
  {
    slug: "rf-cascade",
    title: "RF Cascade",
    shortTitle: "RF Cascade",
    category: "system-calculators",
    sourceScreen: "New calculator",
    description:
      "Analyze RF chain gain, Friis noise figure, stage output powers, and optional cascaded IP3.",
    route: "/calculators/rf-cascade",
    icon: {
      src: "/icons/calculators/rf-cascade.svg",
      alt: "RF cascade calculator icon",
    },
  },
  {
    slug: "patch-antenna",
    title: "Microstrip Patch Antenna",
    shortTitle: "Patch Antenna",
    category: "antennas",
    sourceScreen: "New calculator",
    description:
      "Estimate rectangular microstrip patch dimensions from resonant frequency, substrate permittivity, and height.",
    route: "/calculators/patch-antenna",
    icon: {
      src: "/icons/calculators/patch-antenna.svg",
      alt: "Microstrip patch antenna calculator icon",
    },
  },
  {
    slug: "attenuators",
    title: "Resistive Attenuators",
    shortTitle: "Attenuators",
    category: "passive-components",
    sourceScreen: "New calculator",
    description:
      "Design ideal symmetric Pi and T resistive attenuators for a target attenuation.",
    route: "/calculators/attenuators",
    icon: {
      src: "/icons/calculators/attenuators.svg",
      alt: "Resistive attenuator calculator icon",
    },
  },
  {
    slug: "wilkinson-divider",
    title: "Wilkinson Power Divider",
    shortTitle: "Wilkinson",
    category: "passive-components",
    sourceScreen: "New calculator",
    description:
      "Design an ideal 2-way equal split Wilkinson divider with quarter-wave branches and isolation resistor.",
    route: "/calculators/wilkinson-divider",
    icon: {
      src: "/icons/calculators/wilkinson-divider.svg",
      alt: "Wilkinson power divider calculator icon",
    },
  },
  {
    slug: "directional-coupler",
    title: "Directional Coupler",
    shortTitle: "Directional Coupler",
    category: "passive-components",
    sourceScreen: "New calculator",
    description:
      "Design an ideal branch-line 90 degree hybrid coupler at the center frequency.",
    route: "/calculators/directional-coupler",
    icon: {
      src: "/icons/calculators/directional-coupler.svg",
      alt: "Directional coupler calculator icon",
    },
  },
  {
    slug: "stripline",
    title: "Stripline",
    shortTitle: "Stripline",
    category: "transmission-lines",
    sourceScreen: "New calculator",
    description:
      "Estimate symmetric stripline impedance, guided wavelength, and propagation delay.",
    route: "/calculators/stripline",
    icon: {
      src: "/icons/calculators/stripline.svg",
      alt: "Stripline calculator icon",
    },
  },
  {
    slug: "coplanar-waveguide",
    title: "Coplanar Waveguide",
    shortTitle: "CPW",
    category: "transmission-lines",
    sourceScreen: "New calculator",
    description:
      "Estimate CPW impedance, effective permittivity, and guided wavelength.",
    route: "/calculators/coplanar-waveguide",
    icon: {
      src: "/icons/calculators/coplanar-waveguide.svg",
      alt: "Coplanar waveguide calculator icon",
    },
  },
  {
    slug: "microstrip-loss",
    title: "Microstrip Loss",
    shortTitle: "Microstrip Loss",
    category: "transmission-lines",
    sourceScreen: "New calculator",
    description:
      "Estimate microstrip line loss from known attenuation or approximate conductor and dielectric terms.",
    route: "/calculators/microstrip-loss",
    icon: {
      src: "/icons/calculators/microstrip-loss.svg",
      alt: "Microstrip loss calculator icon",
    },
  },
  {
    slug: "waveguide",
    title: "Rectangular Waveguide",
    shortTitle: "Waveguide",
    category: "transmission-lines",
    sourceScreen: "Screen_RectWaveguide",
    description:
      "Cutoff frequencies for standard and custom rectangular waveguide modes.",
    route: "/calculators/waveguide",
    icon: {
      src: "/icons/calculators/waveguide.png",
      alt: "Rectangular waveguide calculator icon",
    },
  },
  {
    slug: "microstrip",
    title: "Microstrip Line",
    shortTitle: "Microstrip",
    category: "transmission-lines",
    sourceScreen: "Screen_Microstrip2",
    description:
      "Analysis and synthesis workflow for microstrip width, impedance, and wavelength.",
    route: "/calculators/microstrip",
    icon: {
      src: "/icons/calculators/microstrip.png",
      alt: "Microstrip line calculator icon",
    },
  },
  {
    slug: "load-impedance",
    title: "Load Impedance Calculation",
    shortTitle: "Load Impedance",
    category: "transmission-lines",
    sourceScreen: "Screen_Impedance",
    description:
      "Normalized load impedance from SWR and the distance to a wave minimum.",
    route: "/calculators/load-impedance",
    icon: {
      src: "/icons/calculators/load-impedance.png",
      alt: "Load impedance calculation icon",
    },
  },
  {
    slug: "impedance-transform",
    title: "Impedance Transformation",
    shortTitle: "Transformation",
    category: "transmission-lines",
    sourceScreen: "Screen_Impedance2",
    description:
      "Transmission-line impedance transformation toward the generator or load.",
    route: "/calculators/impedance-transform",
    icon: {
      src: "/icons/calculators/impedance-transform.png",
      alt: "Impedance transformation calculator icon",
    },
  },
  {
    slug: "vswr",
    title: "VSWR Calculation",
    shortTitle: "VSWR",
    category: "rf-utilities",
    sourceScreen: "Screen_VSWR",
    description:
      "Conversions between VSWR, reflection coefficient, impedance, and admittance.",
    route: "/calculators/vswr",
    icon: {
      src: "/icons/calculators/vswr.png",
      alt: "VSWR calculation icon",
    },
  },
  {
    slug: "single-stub",
    title: "Single Stub Matching Circuit",
    shortTitle: "Single Stub",
    category: "matching",
    sourceScreen: "Screen_Matching",
    description:
      "Series and shunt single-stub matching with open or shorted stubs.",
    route: "/calculators/single-stub",
    icon: {
      src: "/icons/calculators/single-stub.png",
      alt: "Single stub matching circuit icon",
    },
  },
  {
    slug: "l-match",
    title: "L-section Matching Network",
    shortTitle: "L-section",
    category: "matching",
    sourceScreen: "Screen_Matching2",
    description:
      "L-section matching network solutions with ideal element values.",
    route: "/calculators/l-match",
    icon: {
      src: "/icons/calculators/l-match.png",
      alt: "L-section matching network icon",
    },
  },
];

export function getCalculator(slug: CalculatorSlug) {
  return calculators.find((calculator) => calculator.slug === slug);
}
