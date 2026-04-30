import type {
  SmithGridCurve,
  SmithGridData,
  SvgPoint,
} from "@/lib/visualization/smithChart";

export type SmithChartMarker = {
  id: string;
  label: string;
  point: SvgPoint;
  color?: string;
};

export type SmithChartTrace = {
  id: string;
  label: string;
  points: SvgPoint[];
  color?: string;
};

type SmithChartProps = {
  grid: SmithGridData;
  overlayCurves?: SmithGridCurve[];
  points?: SmithChartMarker[];
  traces?: SmithChartTrace[];
  title?: string;
  className?: string;
};

const DEFAULT_POINT_COLOR = "#0891b2";
const DEFAULT_TRACE_COLOR = "#f59e0b";
const GRID_STROKES: Record<SmithGridCurve["kind"], string> = {
  outerCircle: "#0f172a",
  realAxis: "#334155",
  resistance: "#cbd5e1",
  reactance: "#dbeafe",
};

export function SmithChart({
  grid,
  overlayCurves = [],
  points = [],
  traces = [],
  title = "Smith chart",
  className,
}: SmithChartProps) {
  const viewBox = buildViewBox(grid);
  const outerCurves = grid.curves.filter((curve) => curve.kind === "outerCircle");
  const axisCurves = grid.curves.filter((curve) => curve.kind === "realAxis");
  const gridCurves = grid.curves.filter(
    (curve) => curve.kind === "resistance" || curve.kind === "reactance",
  );
  const titleId = titleToId(title);
  const legendItems = [
    ...traces.map((trace) => ({
      id: `trace-${trace.id}`,
      label: trace.label,
      color: trace.color ?? DEFAULT_TRACE_COLOR,
      kind: "trace" as const,
    })),
    ...points.map((point) => ({
      id: `point-${point.id}`,
      label: point.label,
      color: point.color ?? DEFAULT_POINT_COLOR,
      kind: "point" as const,
    })),
  ];

  return (
    <section
      className={[
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <svg
          viewBox={viewBox}
          role="img"
          aria-labelledby={titleId}
          className="aspect-square min-w-0 flex-1 overflow-visible"
        >
          <title id={titleId}>{title}</title>
          <rect
            x={grid.viewport.centerX - grid.viewport.radius}
            y={grid.viewport.centerY - grid.viewport.radius}
            width={grid.viewport.radius * 2}
            height={grid.viewport.radius * 2}
            fill="#f8fafc"
            opacity="0.7"
          />
          <g aria-label="Smith chart grid">
            {gridCurves.map((curve) => (
              <GridCurve key={curve.id} curve={curve} />
            ))}
          </g>
          <g aria-label="Smith chart axes">
            {axisCurves.map((curve) => (
              <GridCurve key={curve.id} curve={curve} />
            ))}
          </g>
          <g aria-label="Smith chart outer circle">
            {outerCurves.map((curve) => (
              <GridCurve key={curve.id} curve={curve} />
            ))}
          </g>
          <g aria-label="Smith chart overlay">
            {overlayCurves.map((curve) => (
              <GridCurve
                key={curve.id}
                curve={curve}
                stroke="#a855f7"
                strokeDasharray="4 4"
                opacity={0.55}
              />
            ))}
          </g>
          <g aria-label="Smith chart traces">
            {traces.map((trace) => (
              <polyline
                key={trace.id}
                points={pointsToPolyline(trace.points)}
                fill="none"
                stroke={trace.color ?? DEFAULT_TRACE_COLOR}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
            ))}
          </g>
          <g aria-label="Smith chart point markers">
            {points.map((point, index) => (
              <PointMarker
                key={point.id}
                marker={point}
                labelOffset={index % 2 === 0 ? 1 : -1}
              />
            ))}
          </g>
        </svg>

        <div className="w-full shrink-0 space-y-3 lg:w-48">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Normalized reflection coefficient plane.
            </p>
          </div>

          {legendItems.length > 0 ? (
            <ul className="space-y-2 text-sm text-slate-700">
              {legendItems.map((item) => (
                <li key={item.id} className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={
                      item.kind === "point"
                        ? "h-2.5 w-2.5 shrink-0 rounded-full"
                        : "h-0.5 w-5 shrink-0 rounded-full"
                    }
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
              No points or traces to show.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function GridCurve({
  curve,
  stroke = GRID_STROKES[curve.kind],
  strokeDasharray,
  opacity = curve.kind === "reactance" ? 0.95 : 1,
}: {
  curve: SmithGridCurve;
  stroke?: string;
  strokeDasharray?: string;
  opacity?: number;
}) {
  return (
    <polyline
      points={pointsToPolyline(curve.points)}
      fill="none"
      stroke={stroke}
      strokeDasharray={strokeDasharray}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={curve.kind === "outerCircle" ? 2.25 : 1.25}
      opacity={opacity}
    />
  );
}

function PointMarker({
  marker,
  labelOffset,
}: {
  marker: SmithChartMarker;
  labelOffset: 1 | -1;
}) {
  const color = marker.color ?? DEFAULT_POINT_COLOR;
  const labelX = marker.point.x + 8;
  const labelY = marker.point.y + 12 * labelOffset;

  return (
    <>
      <circle
        cx={marker.point.x}
        cy={marker.point.y}
        r="4.5"
        fill="#ffffff"
        stroke={color}
        strokeWidth="2.5"
      />
      <text
        x={labelX}
        y={labelY}
        className="fill-slate-800 text-[10px] font-semibold"
      >
        {marker.label}
      </text>
    </>
  );
}

function buildViewBox(grid: SmithGridData): string {
  const padding = grid.viewport.radius * 0.18;
  const size = grid.viewport.radius * 2 + padding * 2;
  const minX = grid.viewport.centerX - grid.viewport.radius - padding;
  const minY = grid.viewport.centerY - grid.viewport.radius - padding;

  return `${minX} ${minY} ${size} ${size}`;
}

function pointsToPolyline(points: SvgPoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function titleToId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "smith-chart"}-title`;
}
