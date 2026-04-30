import type {
  SingleStubConfiguration,
  SingleStubResult,
  SingleStubSolution,
} from "@/lib/calculators/singleStub";
import type {
  LMatchElement,
  LMatchResult,
  LMatchSolution,
} from "@/lib/calculators/lMatch";

export type MatchingSolutionId = "solution1" | "solution2";

export type MatchingRecommendation = MatchingSolutionId | "none";

export type SingleStubComparisonInput = {
  configuration: SingleStubConfiguration;
  z0Ohm: number;
  result: SingleStubResult;
  warnings?: string[];
};

export type SingleStubComparisonItem = {
  id: MatchingSolutionId;
  label: string;
  dOverLambda: number;
  lOverLambda: number;
  totalLineOverLambda: number;
  distanceElectricalLengthDeg: number;
  stubElectricalLengthDeg: number;
  score: number;
  recommended: boolean;
  reasons: string[];
  warnings: string[];
};

export type SingleStubComparison = {
  type: "singleStub";
  configuration: SingleStubConfiguration;
  recommendedSolution: MatchingRecommendation;
  summary: string;
  items: [SingleStubComparisonItem, SingleStubComparisonItem];
};

export type LMatchComparisonInput = {
  z0Ohm: number;
  result: LMatchResult;
};

export type LMatchTopology = "LC" | "CL" | "LL" | "CC";

export type LMatchComparisonItem = {
  id: MatchingSolutionId;
  label: string;
  xOhm: number;
  bS: number;
  bMs: number;
  seriesElement: LMatchElement;
  parallelElement: LMatchElement;
  topology: LMatchTopology;
  normalizedAbsX: number;
  normalizedAbsB: number;
  componentPracticalityPenalty: number;
  score: number;
  recommended: boolean;
  reasons: string[];
  warnings: string[];
};

export type LMatchComparison = {
  type: "lMatch";
  recommendedSolution: MatchingRecommendation;
  summary: string;
  items: [LMatchComparisonItem, LMatchComparisonItem];
};

const SINGLE_STUB_TIE_TOLERANCE = 0.02;
const SINGLE_STUB_NEAR_TIE_TOLERANCE = 0.04;
const VERY_SHORT_STUB_LIMIT = 0.02;
const NEAR_HALF_WAVE_STUB_LIMIT = 0.48;
const PRACTICALITY_PENALTY = 2;
const L_MATCH_TIE_TOLERANCE = 0.05;

export function compareSingleStubSolutions(
  input: SingleStubComparisonInput,
): SingleStubComparison {
  const warnings = input.warnings ?? [];
  const items: [SingleStubComparisonItem, SingleStubComparisonItem] = [
    singleStubItem("solution1", input.result.solution1, warnings),
    singleStubItem("solution2", input.result.solution2, warnings),
  ];
  const recommendedSolution = chooseSingleStubRecommendation(items[0], items[1]);

  markRecommendation(items, recommendedSolution);
  addSingleStubRecommendationReasons(items, recommendedSolution);

  return {
    type: "singleStub",
    configuration: input.configuration,
    recommendedSolution,
    summary: singleStubSummary(items, recommendedSolution),
    items,
  };
}

function chooseSingleStubRecommendation(
  first: SingleStubComparisonItem,
  second: SingleStubComparisonItem,
): MatchingRecommendation {
  const totalDifference = Math.abs(
    first.totalLineOverLambda - second.totalLineOverLambda,
  );

  if (
    Number.isFinite(first.totalLineOverLambda) &&
    Number.isFinite(second.totalLineOverLambda) &&
    totalDifference > 0 &&
    totalDifference < SINGLE_STUB_TIE_TOLERANCE
  ) {
    const stubDifference = Math.abs(first.lOverLambda - second.lOverLambda);

    if (stubDifference > 1e-12) {
      return first.lOverLambda < second.lOverLambda ? first.id : second.id;
    }
  }

  return chooseLowerScore(first, second, SINGLE_STUB_TIE_TOLERANCE);
}

export function compareLMatchSolutions(
  input: LMatchComparisonInput,
): LMatchComparison {
  const items: [LMatchComparisonItem, LMatchComparisonItem] = [
    lMatchItem("solution1", input.result.solution1, input.z0Ohm),
    lMatchItem("solution2", input.result.solution2, input.z0Ohm),
  ];
  const recommendedSolution = chooseLowerScore(
    items[0],
    items[1],
    L_MATCH_TIE_TOLERANCE,
  );

  markRecommendation(items, recommendedSolution);
  addLMatchRecommendationReasons(items, recommendedSolution);

  return {
    type: "lMatch",
    recommendedSolution,
    summary: lMatchSummary(items, recommendedSolution),
    items,
  };
}

function singleStubItem(
  id: MatchingSolutionId,
  solution: SingleStubSolution,
  inheritedWarnings: string[],
): SingleStubComparisonItem {
  const warnings = [...inheritedWarnings];
  let practicalityPenalty = 0;

  if (solution.lOverLambda < VERY_SHORT_STUB_LIMIT) {
    practicalityPenalty += PRACTICALITY_PENALTY;
    warnings.push("Stub is very short and may be difficult to implement.");
  }

  if (solution.lOverLambda > NEAR_HALF_WAVE_STUB_LIMIT) {
    practicalityPenalty += PRACTICALITY_PENALTY;
    warnings.push("Stub is close to half-wave length.");
  }

  const totalLineOverLambda = solution.dOverLambda + solution.lOverLambda;

  return {
    id,
    label: labelForSolution(id),
    dOverLambda: solution.dOverLambda,
    lOverLambda: solution.lOverLambda,
    totalLineOverLambda,
    distanceElectricalLengthDeg: solution.dOverLambda * 360,
    stubElectricalLengthDeg: solution.lOverLambda * 360,
    score: totalLineOverLambda + practicalityPenalty,
    recommended: false,
    reasons: [],
    warnings,
  };
}

function lMatchItem(
  id: MatchingSolutionId,
  solution: LMatchSolution,
  z0Ohm: number,
): LMatchComparisonItem {
  const warnings = [
    ...elementWarnings(solution.seriesElement),
    ...elementWarnings(solution.parallelElement),
  ];
  const normalizedAbsX = Math.abs(solution.xOhm) / z0Ohm;
  const normalizedAbsB = Math.abs(solution.bS) * z0Ohm;
  const componentPracticalityPenalty =
    warnings.length * PRACTICALITY_PENALTY;
  const topology = topologyFromElements(
    solution.seriesElement,
    solution.parallelElement,
  );

  return {
    id,
    label: labelForSolution(id),
    xOhm: solution.xOhm,
    bS: solution.bS,
    bMs: solution.bMs,
    seriesElement: solution.seriesElement,
    parallelElement: solution.parallelElement,
    topology,
    normalizedAbsX,
    normalizedAbsB,
    componentPracticalityPenalty,
    score: normalizedAbsX + normalizedAbsB + componentPracticalityPenalty,
    recommended: false,
    reasons: [],
    warnings,
  };
}

function chooseLowerScore<T extends { id: MatchingSolutionId; score: number }>(
  first: T,
  second: T,
  tolerance: number,
): MatchingRecommendation {
  if (!Number.isFinite(first.score) && !Number.isFinite(second.score)) {
    return "none";
  }

  if (!Number.isFinite(first.score)) {
    return second.id;
  }

  if (!Number.isFinite(second.score)) {
    return first.id;
  }

  const difference = Math.abs(first.score - second.score);

  if (difference <= tolerance) {
    return "none";
  }

  return first.score < second.score ? first.id : second.id;
}

function markRecommendation<T extends { id: MatchingSolutionId; recommended: boolean }>(
  items: [T, T],
  recommendedSolution: MatchingRecommendation,
) {
  for (const item of items) {
    item.recommended = item.id === recommendedSolution;
  }
}

function addSingleStubRecommendationReasons(
  items: [SingleStubComparisonItem, SingleStubComparisonItem],
  recommendedSolution: MatchingRecommendation,
) {
  if (recommendedSolution === "none") {
    return;
  }

  const recommended = items.find((item) => item.id === recommendedSolution);
  const other = items.find((item) => item.id !== recommendedSolution);

  if (!recommended || !other) {
    return;
  }

  if (
    recommended.totalLineOverLambda + SINGLE_STUB_NEAR_TIE_TOLERANCE <
    other.totalLineOverLambda
  ) {
    recommended.reasons.push("Shorter total line length.");
  }

  if (recommended.lOverLambda < other.lOverLambda) {
    recommended.reasons.push("Shorter stub length.");
  }

  if (
    recommended.lOverLambda >= VERY_SHORT_STUB_LIMIT &&
    other.lOverLambda < VERY_SHORT_STUB_LIMIT
  ) {
    recommended.reasons.push("Avoids a very short stub.");
  }

  if (
    recommended.lOverLambda <= NEAR_HALF_WAVE_STUB_LIMIT &&
    other.lOverLambda > NEAR_HALF_WAVE_STUB_LIMIT
  ) {
    recommended.reasons.push("Avoids a near-half-wave stub.");
  }

  if (recommended.reasons.length === 0) {
    recommended.reasons.push("Lower combined distance and stub-length score.");
  }
}

function addLMatchRecommendationReasons(
  items: [LMatchComparisonItem, LMatchComparisonItem],
  recommendedSolution: MatchingRecommendation,
) {
  if (recommendedSolution === "none") {
    return;
  }

  const recommended = items.find((item) => item.id === recommendedSolution);
  const other = items.find((item) => item.id !== recommendedSolution);

  if (!recommended || !other) {
    return;
  }

  if (
    recommended.componentPracticalityPenalty <
    other.componentPracticalityPenalty
  ) {
    recommended.reasons.push("lower component values");
  }

  if (recommended.normalizedAbsX < other.normalizedAbsX) {
    recommended.reasons.push("lower series reactance");
  }

  if (recommended.normalizedAbsB < other.normalizedAbsB) {
    recommended.reasons.push("smaller shunt susceptance");
  }

  if (recommended.topology !== other.topology) {
    recommended.reasons.push(`simpler ${recommended.topology} realization`);
  }

  if (recommended.reasons.length === 0) {
    recommended.reasons.push("lower component values");
  }
}

function singleStubSummary(
  items: [SingleStubComparisonItem, SingleStubComparisonItem],
  recommendedSolution: MatchingRecommendation,
): string {
  if (recommendedSolution === "none") {
    return "No clear default: both single-stub solutions are similarly practical.";
  }

  const item = items.find((candidate) => candidate.id === recommendedSolution);

  return `${item?.label ?? "Recommended solution"} is recommended by the single-stub length heuristic.`;
}

function lMatchSummary(
  items: [LMatchComparisonItem, LMatchComparisonItem],
  recommendedSolution: MatchingRecommendation,
): string {
  if (recommendedSolution === "none") {
    return "No clear default: both L-section solutions have similar element scores.";
  }

  const item = items.find((candidate) => candidate.id === recommendedSolution);

  return `${item?.label ?? "Recommended solution"} is recommended by the L-section element heuristic.`;
}

function elementWarnings(element: LMatchElement): string[] {
  if (element.unit === "pF") {
    if (element.value < 0.1) {
      return [`${element.type} is very small.`];
    }

    if (element.value > 1000) {
      return [`${element.type} is very large.`];
    }
  }

  if (element.unit === "nH") {
    if (element.value < 0.5) {
      return [`${element.type} is very small.`];
    }

    if (element.value > 10000) {
      return [`${element.type} is very large.`];
    }
  }

  return [];
}

function topologyFromElements(
  seriesElement: LMatchElement,
  parallelElement: LMatchElement,
): LMatchTopology {
  return `${elementFamily(seriesElement)}${elementFamily(
    parallelElement,
  )}` as LMatchTopology;
}

function elementFamily(element: LMatchElement): "L" | "C" {
  return element.type.endsWith("s") || element.type.endsWith("p")
    ? element.type[0] === "L"
      ? "L"
      : "C"
    : "C";
}

function labelForSolution(id: MatchingSolutionId): string {
  return id === "solution1" ? "Solution #1" : "Solution #2";
}
