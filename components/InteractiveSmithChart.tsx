"use client";

import type { PointerEvent } from "react";
import { useMemo, useRef, useState } from "react";
import type { Complex } from "@/lib/math/complex";
import {
  generateSmithGrid,
  isPointInsideSmithChart,
  svgPointFromGamma,
  svgPointToGamma,
  type SmithGridCurve,
  type SmithGridData,
  type SmithGridLabel,
  type SvgPoint,
} from "@/lib/visualization/smithChart";

type InteractiveSmithChartProps = {
  selectedGamma?: Complex;
  onSelect: (gamma: Complex) => void;
  onOutsideClick?: () => void;
};

const VIEWPORT = {
  centerX: 160,
  centerY: 160,
  radius: 136,
};

const GRID_STROKES: Record<SmithGridCurve["kind"], string> = {
  outerCircle: "#0f172a",
  realAxis: "#334155",
  resistance: "#94a3b8",
  reactance: "#93c5fd",
};

export function InteractiveSmithChart({
  selectedGamma,
  onSelect,
  onOutsideClick,
}: InteractiveSmithChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverPoint, setHoverPoint] = useState<SvgPoint | null>(null);
  const grid = useMemo(
    () =>
      generateSmithGrid({
        viewport: VIEWPORT,
        samples: 361,
      }),
    [],
  );
  const viewBox = buildViewBox(grid);
  const selectedPoint = selectedGamma
    ? svgPointFromGamma(selectedGamma, grid.viewport)
    : null;
  const hoverGamma =
    hoverPoint && isPointInsideSmithChart(hoverPoint, grid.viewport)
      ? svgPointToGamma(hoverPoint, grid.viewport)
      : null;
  const hoverSvgPoint = hoverGamma
    ? svgPointFromGamma(hoverGamma, grid.viewport)
    : null;

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    const point = eventToSvgPoint(event);

    if (!point) {
      return;
    }

    if (!isPointInsideSmithChart(point, grid.viewport)) {
      onOutsideClick?.();
      return;
    }

    onSelect(svgPointToGamma(point, grid.viewport));
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    setHoverPoint(eventToSvgPoint(event));
  }

  function eventToSvgPoint(event: PointerEvent<SVGSVGElement>): SvgPoint | null {
    const svg = svgRef.current;

    if (!svg) {
      return null;
    }

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();

    if (!matrix) {
      return null;
    }

    const transformed = point.matrixTransform(matrix.inverse());

    return {
      x: transformed.x,
      y: transformed.y,
    };
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
      <svg
        ref={svgRef}
        viewBox={viewBox}
        role="img"
        aria-labelledby="interactive-smith-chart-title"
        className="aspect-square w-full touch-manipulation select-none overflow-visible"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverPoint(null)}
        style={{ cursor: "crosshair" }}
      >
        <title id="interactive-smith-chart-title">
          Interactive Smith chart
        </title>
        <defs>
          <clipPath id="interactive-smith-chart-clip">
            <circle
              cx={grid.viewport.centerX}
              cy={grid.viewport.centerY}
              r={grid.viewport.radius}
            />
          </clipPath>
        </defs>
        <circle
          cx={grid.viewport.centerX}
          cy={grid.viewport.centerY}
          r={grid.viewport.radius}
          fill="#f8fafc"
          stroke="#e2e8f0"
          strokeWidth="1"
        />
        <g
          aria-label="Smith chart grid"
          clipPath="url(#interactive-smith-chart-clip)"
        >
          {grid.curves
            .filter(
              (curve) =>
                curve.kind === "resistance" || curve.kind === "reactance",
            )
            .map((curve) => (
              <GridCurve key={curve.id} curve={curve} />
            ))}
        </g>
        <g aria-label="Smith chart axes">
          {grid.curves
            .filter((curve) => curve.kind === "realAxis")
            .map((curve) => (
              <GridCurve key={curve.id} curve={curve} />
            ))}
        </g>
        <g aria-label="Smith chart outer circle">
          {grid.curves
            .filter((curve) => curve.kind === "outerCircle")
            .map((curve) => (
              <GridCurve key={curve.id} curve={curve} />
            ))}
        </g>
        <g aria-label="Smith chart labels">
          {grid.labels.map((label) => (
            <GridLabel key={label.id} label={label} />
          ))}
        </g>
        {hoverSvgPoint ? <HoverMarker point={hoverSvgPoint} /> : null}
        {selectedPoint ? <SelectedMarker point={selectedPoint} /> : null}
      </svg>
    </div>
  );
}

function GridCurve({ curve }: { curve: SmithGridCurve }) {
  return (
    <path
      d={pointsToPath(curve.points)}
      fill="none"
      stroke={GRID_STROKES[curve.kind]}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={curveStrokeWidth(curve)}
      opacity={defaultCurveOpacity(curve)}
    />
  );
}

function GridLabel({ label }: { label: SmithGridLabel }) {
  const isReactance = label.kind === "reactance";

  return (
    <text
      x={label.point.x}
      y={label.point.y}
      dy={isReactance ? "0.32em" : "-0.45em"}
      textAnchor="middle"
      className="pointer-events-none select-none fill-slate-500 text-[8px] font-medium"
      opacity={isReactance ? 0.85 : 0.9}
    >
      {label.text}
    </text>
  );
}

function HoverMarker({ point }: { point: SvgPoint }) {
  return (
    <g aria-label="Hovered Smith chart point" className="pointer-events-none">
      <line
        x1={point.x - 7}
        y1={point.y}
        x2={point.x + 7}
        y2={point.y}
        stroke="#475569"
        strokeDasharray="2 2"
        strokeWidth="1.4"
      />
      <line
        x1={point.x}
        y1={point.y - 7}
        x2={point.x}
        y2={point.y + 7}
        stroke="#475569"
        strokeDasharray="2 2"
        strokeWidth="1.4"
      />
    </g>
  );
}

function SelectedMarker({ point }: { point: SvgPoint }) {
  return (
    <g aria-label="Selected Smith chart point" className="pointer-events-none">
      <circle
        cx={point.x}
        cy={point.y}
        r="10"
        fill="#fdf2f8"
        stroke="#be185d"
        strokeWidth="2.5"
      />
      <path
        d={`M ${point.x} ${point.y - 13} L ${point.x + 13} ${point.y} L ${
          point.x
        } ${point.y + 13} L ${point.x - 13} ${point.y} Z`}
        fill="none"
        stroke="#be185d"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <circle cx={point.x} cy={point.y} r="3" fill="#be185d" />
    </g>
  );
}

function buildViewBox(grid: SmithGridData): string {
  const padding = grid.viewport.radius * 0.18;
  const size = grid.viewport.radius * 2 + padding * 2;
  const minX = grid.viewport.centerX - grid.viewport.radius - padding;
  const minY = grid.viewport.centerY - grid.viewport.radius - padding;

  return `${minX} ${minY} ${size} ${size}`;
}

function pointsToPath(points: SvgPoint[]): string {
  if (points.length === 0) {
    return "";
  }

  const [first, ...rest] = points;

  return [
    `M ${formatSvgNumber(first.x)} ${formatSvgNumber(first.y)}`,
    ...rest.map(
      (point) => `L ${formatSvgNumber(point.x)} ${formatSvgNumber(point.y)}`,
    ),
  ].join(" ");
}

function curveStrokeWidth(curve: SmithGridCurve): number {
  if (curve.kind === "outerCircle") {
    return 2.4;
  }

  if (curve.kind === "realAxis") {
    return 1.45;
  }

  return curve.detail === "major" ? 1.05 : 0.65;
}

function defaultCurveOpacity(curve: SmithGridCurve): number {
  if (curve.kind === "outerCircle" || curve.kind === "realAxis") {
    return 1;
  }

  return curve.detail === "major" ? 0.72 : 0.34;
}

function formatSvgNumber(value: number): string {
  return Number(value.toFixed(4)).toString();
}
