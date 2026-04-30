import type {
  LMatchComparison,
  LMatchComparisonItem,
  SingleStubComparison,
  SingleStubComparisonItem,
} from "@/lib/calculators/matchingComparison";
import { formatNumber, formatWithUnit } from "@/lib/math/format";

type MatchingComparisonData = SingleStubComparison | LMatchComparison;

type MatchingComparisonProps = {
  comparison?: MatchingComparisonData;
  title?: string;
};

export function MatchingComparison({
  comparison,
  title = "Comparison",
}: MatchingComparisonProps) {
  if (!comparison) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
        Matching comparison will be shown after valid solutions are available.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Compare both matching variants using practical length and component
          heuristics.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {comparison.items.map((item) => (
          <SolutionCard
            key={item.id}
            comparison={comparison}
            item={item}
          />
        ))}
      </div>

      <ComparisonSummary comparison={comparison} />
    </section>
  );
}

function SolutionCard({
  comparison,
  item,
}: {
  comparison: MatchingComparisonData;
  item: SingleStubComparisonItem | LMatchComparisonItem;
}) {
  const rows =
    comparison.type === "singleStub"
      ? singleStubRows(item as SingleStubComparisonItem)
      : lMatchRows(item as LMatchComparisonItem);

  return (
    <article
      className={[
        "rounded-lg border bg-white p-4 shadow-sm",
        item.recommended
          ? "border-cyan-300 ring-1 ring-cyan-100"
          : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            {item.label}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
            Score {formatNumber(item.score, 3)}
          </p>
        </div>
        {item.recommended ? (
          <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
            Recommended
          </span>
        ) : null}
      </div>

      <dl className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 bg-white px-3 py-2.5"
          >
            <dt className="font-medium text-slate-600">{row.label}</dt>
            <dd className="break-words text-right font-semibold text-slate-950">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {item.reasons.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm leading-6 text-slate-600">
          {item.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}

      {item.warnings.length > 0 ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
          {item.warnings.join(" ")}
        </div>
      ) : null}
    </article>
  );
}

function ComparisonSummary({
  comparison,
}: {
  comparison: MatchingComparisonData;
}) {
  const preferred = preferredItem(comparison);
  const metric = comparison.type === "singleStub" ? shorterStubText(comparison) : smallerElementsText(comparison);
  const preferredLabel = preferred?.label ?? "No clear default";
  const reason = preferred?.reasons[0] ?? comparison.summary;

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Comparison Summary
      </h3>
      <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-3">
        <SummaryItem label={comparison.type === "singleStub" ? "Shorter stub" : "Smaller elements"} value={metric} />
        <SummaryItem label="Preferred variant" value={preferredLabel} />
        <SummaryItem label="Reason" value={reason} />
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function singleStubRows(item: SingleStubComparisonItem) {
  return [
    { label: "d / lambda", value: formatNumber(item.dOverLambda, 5) },
    { label: "l / lambda", value: formatNumber(item.lOverLambda, 5) },
    {
      label: "d + l",
      value: formatNumber(item.totalLineOverLambda, 5),
    },
    {
      label: "Distance angle",
      value: formatWithUnit(item.distanceElectricalLengthDeg, "deg", 2),
    },
    {
      label: "Stub angle",
      value: formatWithUnit(item.stubElectricalLengthDeg, "deg", 2),
    },
  ];
}

function lMatchRows(item: LMatchComparisonItem) {
  return [
    { label: "Topology", value: item.topology },
    { label: "X", value: formatWithUnit(item.xOhm, "Ohm", 4) },
    { label: "B", value: formatWithUnit(item.bMs, "mS", 4) },
    {
      label: "Series element",
      value: `${item.seriesElement.type} ${formatWithUnit(
        item.seriesElement.value,
        item.seriesElement.unit,
        4,
      )}`,
    },
    {
      label: "Parallel element",
      value: `${item.parallelElement.type} ${formatWithUnit(
        item.parallelElement.value,
        item.parallelElement.unit,
        4,
      )}`,
    },
  ];
}

function preferredItem(comparison: MatchingComparisonData) {
  if (comparison.recommendedSolution === "none") {
    return undefined;
  }

  return comparison.items.find(
    (item) => item.id === comparison.recommendedSolution,
  );
}

function shorterStubText(comparison: SingleStubComparison): string {
  const [first, second] = comparison.items;
  const shorter = first.lOverLambda <= second.lOverLambda ? first : second;

  return `${shorter.label}: ${formatNumber(shorter.lOverLambda, 5)} lambda`;
}

function smallerElementsText(comparison: LMatchComparison): string {
  const [first, second] = comparison.items;
  const smaller = first.score <= second.score ? first : second;

  return `${smaller.label}: ${smaller.topology}, score ${formatNumber(
    smaller.score,
    3,
  )}`;
}
