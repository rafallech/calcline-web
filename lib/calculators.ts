export type CalculatorSlug =
  | "wavelength"
  | "rf-power"
  | "quarter-wave-transformer"
  | "waveguide"
  | "microstrip"
  | "load-impedance"
  | "impedance-transform"
  | "vswr"
  | "single-stub"
  | "l-match";

export type CalculatorInfo = {
  slug: CalculatorSlug;
  title: string;
  shortTitle: string;
  sourceScreen: string;
  description: string;
  route: string;
  icon: {
    src: string;
    alt: string;
  };
};

export const calculators: CalculatorInfo[] = [
  {
    slug: "wavelength",
    title: "Wavelength and Electrical Length",
    shortTitle: "Wavelength",
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
    slug: "waveguide",
    title: "Rectangular Waveguide",
    shortTitle: "Waveguide",
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
