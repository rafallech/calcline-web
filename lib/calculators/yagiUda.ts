import {
  calculationError,
  calculationOk,
  type CalculatorCalculation,
} from "@/lib/calculators/result";

export type YagiDesignMode = "dl6wu";

export type YagiFrequencyUnit = "MHz" | "GHz";

export type YagiBoomType =
  | "dielectric"
  | "metalIsolated"
  | "metalThroughBoom";

export type YagiDrivenElementType = "straightDipole" | "foldedDipole";

export type YagiBalunRatio = "none" | "1:1" | "4:1";

export type YagiInput = {
  frequency: number;
  frequencyUnit: YagiFrequencyUnit;
  numberOfElements: number;
  elementDiameterMm: number;
  boomDiameterMm: number;
  designMode: YagiDesignMode;
  boomType?: YagiBoomType;
  drivenElementType?: YagiDrivenElementType;
  foldedDipoleSpacingMm?: number;
  feedLineImpedanceOhm?: number;
  balunRatio?: YagiBalunRatio;
};

export type YagiElement = {
  name: string;
  positionMm: number;
  spacingFromPreviousMm: number;
  lengthMm: number;
  halfLengthMm: number;
};

export type YagiResult = {
  designMode: YagiDesignMode;
  wavelengthMm: number;
  boomLengthMm: number;
  elements: YagiElement[];
  approximateGainDbi: number;
  estimatedFrontToBackRatioDb?: number;
  feed: YagiFeedResult;
  notes: string[];
};

export type YagiCalculation = CalculatorCalculation<YagiResult>;

export type YagiFeedResult = {
  drivenElementType: YagiDrivenElementType;
  straightDrivenImpedanceEstimateOhm: number;
  foldedTransformationRatio?: number;
  foldedFeedImpedanceEstimateOhm?: number;
  impedanceAfterBalunOhm: number;
  feedLineImpedanceOhm: number;
  mismatchRatio: number;
  recommendedBalun: string;
  feedNotes: string[];
  feedWarnings: string[];
  foldedDipoleSpacingMm?: number;
  foldedDipoleLoopWidthMm?: number;
  foldedDipoleConductorLengthMm?: number;
};

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;
const MM_PER_M = 1000;
const MAX_ELEMENTS = 24;
const MIN_DL6WU_ELEMENTS = 5;
const RECOMMENDED_DL6WU_ELEMENT_COUNTS = [10, 14, 19, 24];
const DEFAULT_FOLDED_DIPOLE_SPACING_MM = 20;
const DEFAULT_FEED_LINE_IMPEDANCE_OHM = 50;
const DEFAULT_BALUN_RATIO: YagiBalunRatio = "4:1";
const FOLDED_DIPOLE_TRANSFORMATION_RATIO = 4;
const STRONG_MISMATCH_RATIO = 1.5;

const DL6WU_APPROXIMATION_WARNING =
  "This is a DL6WU-inspired long-boom Yagi approximation using transparent tapered length and spacing coefficients, not a full published DL6WU table.";
const DESIGN_STARTING_POINT_WARNING =
  "The result is a design starting point. Final antenna dimensions depend on element diameter, mounting method, boom material, feed system and environment. Validate with NEC simulation or measurement before manufacturing.";

export function calculateYagiUda(input: YagiInput): YagiCalculation {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return calculationError(errors);
  }

  const wavelengthMm = wavelengthFromFrequency(input.frequency, input.frequencyUnit);
  const elements = calculateDl6wuInspiredElements(input, wavelengthMm);
  const boomLengthMm = elements[elements.length - 1]?.positionMm ?? 0;
  const feed = calculateFeed(input, elements);
  const warnings = [
    DL6WU_APPROXIMATION_WARNING,
    DESIGN_STARTING_POINT_WARNING,
    ...warningsForInput(input, wavelengthMm),
    ...feed.feedWarnings,
  ];

  return calculationOk(
    {
      designMode: input.designMode,
      wavelengthMm,
      boomLengthMm,
      elements,
      approximateGainDbi: approximateGainDbi(input.numberOfElements),
      estimatedFrontToBackRatioDb: approximateFrontToBackRatioDb(
        input.numberOfElements,
      ),
      feed,
      notes: [
        "Model assumes a straight boom, cylindrical elements, one reflector, one driven element, and directors placed after the driven element.",
        "Feed impedance, balun selection, boom correction, mast coupling, and environment effects are starting estimates only.",
      ],
    },
    warnings,
  );
}

export function wavelengthFromFrequency(
  frequency: number,
  unit: YagiFrequencyUnit,
): number {
  return (SPEED_OF_LIGHT_M_PER_S / frequencyToHz(frequency, unit)) * MM_PER_M;
}

export function frequencyToHz(
  frequency: number,
  unit: YagiFrequencyUnit,
): number {
  if (unit === "MHz") {
    return frequency * 1_000_000;
  }

  return frequency * 1_000_000_000;
}

function validateInput(input: YagiInput): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(input.frequency) || input.frequency <= 0) {
    errors.push("Set frequency > 0.");
  }

  if (input.frequencyUnit !== "MHz" && input.frequencyUnit !== "GHz") {
    errors.push("Select frequency unit MHz or GHz.");
  }

  if (
    !Number.isInteger(input.numberOfElements) ||
    input.numberOfElements < MIN_DL6WU_ELEMENTS
  ) {
    errors.push("Set number of elements >= 5 for DL6WU mode.");
  }

  if (
    !Number.isInteger(input.numberOfElements) ||
    input.numberOfElements > MAX_ELEMENTS
  ) {
    errors.push("Set number of elements <= 24.");
  }

  if (
    !Number.isFinite(input.elementDiameterMm) ||
    input.elementDiameterMm <= 0
  ) {
    errors.push("Set element diameter > 0 mm.");
  }

  if (!Number.isFinite(input.boomDiameterMm) || input.boomDiameterMm < 0) {
    errors.push("Set boom diameter >= 0 mm.");
  }

  const drivenElementType = input.drivenElementType ?? "straightDipole";
  const foldedDipoleSpacingMm =
    input.foldedDipoleSpacingMm ?? DEFAULT_FOLDED_DIPOLE_SPACING_MM;
  const feedLineImpedanceOhm =
    input.feedLineImpedanceOhm ?? DEFAULT_FEED_LINE_IMPEDANCE_OHM;
  const balunRatio = input.balunRatio ?? DEFAULT_BALUN_RATIO;

  if (
    drivenElementType === "foldedDipole" &&
    (!Number.isFinite(foldedDipoleSpacingMm) || foldedDipoleSpacingMm <= 0)
  ) {
    errors.push("Set folded dipole spacing > 0 mm.");
  }

  if (!Number.isFinite(feedLineImpedanceOhm) || feedLineImpedanceOhm <= 0) {
    errors.push("Set feed line impedance > 0 Ohm.");
  }

  if (balunRatio !== "none" && balunRatio !== "1:1" && balunRatio !== "4:1") {
    errors.push("Select supported balun ratio.");
  }

  if (
    input.drivenElementType !== undefined &&
    input.drivenElementType !== "straightDipole" &&
    input.drivenElementType !== "foldedDipole"
  ) {
    errors.push("Select supported driven element type.");
  }

  if (input.designMode !== "dl6wu") {
    errors.push("Select supported Yagi design mode.");
  }

  return errors;
}

function calculateDl6wuInspiredElements(
  input: YagiInput,
  wavelengthMm: number,
): YagiElement[] {
  const elements: YagiElement[] = [];
  const diameterCorrection = elementDiameterLengthCorrection(
    input.elementDiameterMm,
    wavelengthMm,
  );
  let positionMm = 0;

  elements.push(
    createElement("reflector", positionMm, 0, wavelengthMm, 0.505, diameterCorrection),
  );

  const reflectorToDrivenSpacingMm = wavelengthMm * 0.2;
  positionMm += reflectorToDrivenSpacingMm;
  elements.push(
    createElement(
      "driven element",
      positionMm,
      reflectorToDrivenSpacingMm,
      wavelengthMm,
      0.48,
      diameterCorrection * 0.7,
    ),
  );

  const directorCount = input.numberOfElements - 2;

  for (let directorIndex = 1; directorIndex <= directorCount; directorIndex += 1) {
    const spacingMm = directorSpacingWavelengths(directorIndex) * wavelengthMm;
    positionMm += spacingMm;
    elements.push(
      createElement(
        `director ${directorIndex}`,
        positionMm,
        spacingMm,
        wavelengthMm,
        directorLengthWavelengths(directorIndex, directorCount),
        diameterCorrection,
      ),
    );
  }

  return elements;
}

function createElement(
  name: string,
  positionMm: number,
  spacingFromPreviousMm: number,
  wavelengthMm: number,
  lengthWavelengths: number,
  diameterCorrection: number,
): YagiElement {
  const correctedLengthWavelengths = Math.max(
    0.38,
    lengthWavelengths - diameterCorrection,
  );
  const lengthMm = correctedLengthWavelengths * wavelengthMm;

  return {
    name,
    positionMm,
    spacingFromPreviousMm,
    lengthMm,
    halfLengthMm: lengthMm / 2,
  };
}

function directorSpacingWavelengths(directorIndex: number): number {
  if (directorIndex === 1) {
    return 0.12;
  }

  // Long-boom Yagis use wider director spacing than short educational designs.
  // This smooth progression is a project-start approximation, not a DL6WU table.
  return Math.min(0.23, 0.18 + (directorIndex - 2) * 0.008);
}

function directorLengthWavelengths(
  directorIndex: number,
  directorCount: number,
): number {
  const taper =
    directorCount <= 1 ? 0 : (directorIndex - 1) / (directorCount - 1);

  // Directors taper from roughly 0.455 lambda to 0.428 lambda for long-boom
  // behavior. These coefficients are intentionally visible until a traceable
  // DL6WU source table is selected for the production model.
  return 0.455 - 0.027 * taper;
}

function elementDiameterLengthCorrection(
  elementDiameterMm: number,
  wavelengthMm: number,
): number {
  const diameterRatio = elementDiameterMm / wavelengthMm;

  return Math.min(0.006, 0.015 * Math.sqrt(diameterRatio));
}

function approximateGainDbi(numberOfElements: number): number {
  return Math.min(17.2, 7.2 + 10 * Math.log10(numberOfElements - 2));
}

function approximateFrontToBackRatioDb(numberOfElements: number): number {
  return Math.min(28, 14 + 0.7 * numberOfElements);
}

function calculateFeed(input: YagiInput, elements: YagiElement[]): YagiFeedResult {
  const drivenElementType = input.drivenElementType ?? "straightDipole";
  const feedLineImpedanceOhm =
    input.feedLineImpedanceOhm ?? DEFAULT_FEED_LINE_IMPEDANCE_OHM;
  const balunRatio = input.balunRatio ?? DEFAULT_BALUN_RATIO;
  const straightDrivenImpedanceEstimateOhm =
    estimateStraightDrivenImpedanceOhm(input.numberOfElements);

  if (drivenElementType === "foldedDipole") {
    return calculateFoldedDipoleFeed({
      elements,
      foldedDipoleSpacingMm:
        input.foldedDipoleSpacingMm ?? DEFAULT_FOLDED_DIPOLE_SPACING_MM,
      feedLineImpedanceOhm,
      balunRatio,
      straightDrivenImpedanceEstimateOhm,
    });
  }

  const impedanceAfterBalunOhm = straightDrivenImpedanceEstimateOhm;
  const mismatchRatio = impedanceMismatchRatio(
    impedanceAfterBalunOhm,
    feedLineImpedanceOhm,
  );
  const feedWarnings = feedMismatchWarnings(
    mismatchRatio,
    impedanceAfterBalunOhm,
    feedLineImpedanceOhm,
  );

  return {
    drivenElementType,
    straightDrivenImpedanceEstimateOhm,
    impedanceAfterBalunOhm,
    feedLineImpedanceOhm,
    mismatchRatio,
    recommendedBalun: "1:1 current balun for symmetry; add matching if needed.",
    feedNotes: [
      "Straight driven element impedance is a coarse Yagi starting estimate, not a solved feed-point impedance.",
      "Parasitic elements, element diameter, spacing, boom mounting, and feed construction can move the measured impedance.",
    ],
    feedWarnings,
  };
}

function calculateFoldedDipoleFeed({
  elements,
  foldedDipoleSpacingMm,
  feedLineImpedanceOhm,
  balunRatio,
  straightDrivenImpedanceEstimateOhm,
}: {
  elements: YagiElement[];
  foldedDipoleSpacingMm: number;
  feedLineImpedanceOhm: number;
  balunRatio: YagiBalunRatio;
  straightDrivenImpedanceEstimateOhm: number;
}): YagiFeedResult {
  const foldedFeedImpedanceEstimateOhm =
    straightDrivenImpedanceEstimateOhm * FOLDED_DIPOLE_TRANSFORMATION_RATIO;
  const impedanceAfterBalunOhm =
    balunRatio === "4:1"
      ? foldedFeedImpedanceEstimateOhm / 4
      : foldedFeedImpedanceEstimateOhm;
  const mismatchRatio = impedanceMismatchRatio(
    impedanceAfterBalunOhm,
    feedLineImpedanceOhm,
  );
  const drivenElement = elements.find((element) => element.name === "driven element");
  const drivenElementLengthMm = drivenElement?.lengthMm ?? 0;
  const feedWarnings = [
    "Folded dipole feed impedance is approximate.",
    "Final matching requires NEC simulation or measurement.",
    ...feedMismatchWarnings(
      mismatchRatio,
      impedanceAfterBalunOhm,
      feedLineImpedanceOhm,
    ),
  ];

  return {
    drivenElementType: "foldedDipole",
    straightDrivenImpedanceEstimateOhm,
    foldedTransformationRatio: FOLDED_DIPOLE_TRANSFORMATION_RATIO,
    foldedFeedImpedanceEstimateOhm,
    impedanceAfterBalunOhm,
    feedLineImpedanceOhm,
    mismatchRatio,
    recommendedBalun:
      balunRatio === "4:1"
        ? "4:1 balun selected; verify transformed impedance in the final antenna."
        : "Consider a 4:1 balun for equal-diameter folded dipole starting designs.",
    feedNotes: [
      "Folded dipole uses the same driven element full length as the straight driven element.",
      "Equal conductor diameters are approximated with a 4:1 impedance transformation ratio.",
      "The folded loop geometry is a construction estimate and does not model end effects.",
    ],
    feedWarnings,
    foldedDipoleSpacingMm,
    foldedDipoleLoopWidthMm: foldedDipoleSpacingMm,
    foldedDipoleConductorLengthMm:
      2 * drivenElementLengthMm + 2 * foldedDipoleSpacingMm,
  };
}

function estimateStraightDrivenImpedanceOhm(numberOfElements: number): number {
  // Practical Yagi driven element resistance is commonly well below a free-space
  // half-wave dipole because of parasitic coupling. This smooth estimate is
  // intentionally visible and should be replaced by NEC or measured data for
  // final matching work.
  return Math.max(20, 30 - 0.35 * Math.max(0, numberOfElements - 5));
}

function impedanceMismatchRatio(impedanceOhm: number, referenceOhm: number): number {
  return Math.max(impedanceOhm / referenceOhm, referenceOhm / impedanceOhm);
}

function feedMismatchWarnings(
  mismatchRatio: number,
  impedanceAfterBalunOhm: number,
  feedLineImpedanceOhm: number,
): string[] {
  if (mismatchRatio <= STRONG_MISMATCH_RATIO) {
    return [];
  }

  return [
    `Estimated impedance after balun (${impedanceAfterBalunOhm.toFixed(1)} Ohm) differs strongly from feed line impedance (${feedLineImpedanceOhm.toFixed(1)} Ohm).`,
  ];
}

function warningsForInput(input: YagiInput, wavelengthMm: number): string[] {
  const warnings: string[] = [];
  const frequencyMHz =
    input.frequencyUnit === "MHz" ? input.frequency : input.frequency * 1000;

  if (frequencyMHz < 30 || frequencyMHz > 3000) {
    warnings.push(
      "Frequency is outside the recommended 30 MHz to 3 GHz range for this starting model.",
    );
  }

  if (input.boomType === "metalThroughBoom") {
    warnings.push(
      "Metal through-boom mounting usually requires element length correction; this version reports uncorrected starting dimensions.",
    );
  } else if (input.boomType === "metalIsolated") {
    warnings.push(
      "Metal isolated boom mounting can still affect tuning; verify the final design by simulation or measurement.",
    );
  }

  const elementDiameterRatio = input.elementDiameterMm / wavelengthMm;

  if (elementDiameterRatio < 0.002 || elementDiameterRatio > 0.02) {
    warnings.push(
      "Element diameter / wavelength is outside the typical 0.002 to 0.02 starting range; verify the geometry with NEC before manufacturing.",
    );
  }

  if (!RECOMMENDED_DL6WU_ELEMENT_COUNTS.includes(input.numberOfElements)) {
    warnings.push(
      "DL6WU long-boom starting designs are usually compared at 10, 14, 19, or 24 elements; verify other element counts carefully.",
    );
  }

  return warnings;
}
