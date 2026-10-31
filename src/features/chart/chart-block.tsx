"use client";

import { useId, useState } from "react";
import type { UIBlock } from "@/lib/ui-schema";
import { formatCompact, formatNumber } from "@/lib/utils";

type ChartBlock = Extract<UIBlock, { type: "chart" }>;

const WIDTH = 720;
const HEIGHT = 300;
const PAD = { top: 18, right: 18, bottom: 46, left: 54 };

function niceStep(raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const exponent = Math.floor(Math.log10(raw));
  const fraction = raw / 10 ** exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
}

function shortLabel(label: string) {
  return label.length > 11 ? `${label.slice(0, 10)}…` : label;
}

const PIE_COLORS = [
  "#0139b7",
  "#ff4b8c",
  "#12b886",
  "#f59f00",
  "#7048e8",
  "#15aabf",
  "#e8590c",
  "#868e96",
];

function arcPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number
) {
  const fullTurn = Math.PI * 2;
  const safeEnd = end - start >= fullTurn - 0.0001 ? start + fullTurn - 0.0001 : end;
  const large = safeEnd - start > Math.PI ? 1 : 0;
  const point = (radius: number, angle: number) =>
    `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;

  if (inner <= 0) {
    return `M${cx},${cy} L${point(outer, start)} A${outer},${outer} 0 ${large} 1 ${point(outer, safeEnd)} Z`;
  }

  return `M${point(outer, start)} A${outer},${outer} 0 ${large} 1 ${point(outer, safeEnd)} L${point(inner, safeEnd)} A${inner},${inner} 0 ${large} 0 ${point(inner, start)} Z`;
}

function PieChartView({ block }: { block: ChartBlock }) {
  const [hover, setHover] = useState<number | null>(null);

  const size = 220;
  const center = size / 2;
  const outerRadius = 100;
  const innerRadius = block.chartType === "donut" ? 62 : 0;

  const positives = block.data.map((point) => Math.max(0, point.value));
  const total = positives.reduce((sum, value) => sum + value, 0);

  const cumulativeBefore = positives.map((_, position) =>
    positives.slice(0, position).reduce((sum, value) => sum + value, 0)
  );
  const slices = block.data.map((point, index) => {
    const fraction = total > 0 ? positives[index] / total : 0;
    const start = -Math.PI / 2 + (total > 0 ? cumulativeBefore[index] / total : 0) * Math.PI * 2;
    const end = start + fraction * Math.PI * 2;
    return { point, index, fraction, start, end };
  });

  const active = hover !== null ? slices[hover] : null;
  const unit = block.unit ? ` ${block.unit}` : "";

  return (
    <div className="rounded-xl border border-line/70 bg-card p-4 shadow-2xs">
      <div className="mb-3 flex min-h-5 flex-wrap items-center justify-between gap-2">
        {block.title ? (
          <h4 className="text-sm font-medium text-ink">{block.title}</h4>
        ) : (
   <span />
        )}
        <span className="text-[11px] tabular-nums text-faint">
   {active
     ? `${active.point.label} · ${formatNumber(active.point.value, 1)}${unit}`
     : block.unit
       ? `en ${block.unit}`
       : ""}
 </span>
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="h-auto w-44 shrink-0 sm:w-52"
   role="img"
          aria-label={`Graphique ${block.chartType === "donut" ? "en anneau" : "circulaire"}${
     block.title ? ` : ${block.title}` : ""
   }`}
 >
          {slices.map((slice) =>
     slice.fraction > 0 ? (
       <path
         key={`${slice.point.label}-${slice.index}`}
         d={arcPath(center, center, outerRadius, innerRadius, slice.start, slice.end)}
  fill={PIE_COLORS[slice.index % PIE_COLORS.length]}
         stroke="#ffffff"
         strokeWidth="2"
         opacity={hover === null || hover === slice.index ? 1 : 0.4}
         className="cursor-pointer transition-opacity duration-150"
  onMouseEnter={() => setHover(slice.index)}
         onMouseLeave={() => setHover(null)}
       />
     ) : null
   )}
   {innerRadius > 0 ? (
            <>
       <text
         x={center}
         y={center - 2}
  textAnchor="middle"
         fontSize="22"
         fontWeight="600"
         fill="#0a1b3d"
       >
  {active ? `${formatNumber(active.fraction * 100, 0)} %` : formatCompact(total)}
       </text>
       <text x={center} y={center + 16} textAnchor="middle" fontSize="10" fill="#8490a5">
  {active ? active.point.label : "total"}
       </text>
     </>
   ) : null}
 </svg>

        <ul className="w-full min-w-0 flex-1 space-y-1.5">
          {slices.map((slice) => (
     <li
       key={`legend-${slice.point.label}-${slice.index}`}
       onMouseEnter={() => setHover(slice.index)}
       onMouseLeave={() => setHover(null)}
       className={`flex items-center gap-2.5 rounded-lg px-2 py-1 text-sm transition-colors ${
         hover === slice.index ? "bg-ink/[0.05]" : ""
}`}
     >
       <span
  className="size-2.5 shrink-0 rounded-full"
  style={{ backgroundColor: PIE_COLORS[slice.index % PIE_COLORS.length] }}
         aria-hidden="true"
/>
       <span className="min-w-0 flex-1 truncate text-ink">{slice.point.label}</span>
       <span className="tabular-nums text-muted">
  {formatNumber(slice.point.value, 1)}
         {unit}
       </span>
       <span className="w-12 text-right text-xs tabular-nums text-faint">
         {formatNumber(slice.fraction * 100, 0)} %
       </span>
     </li>
   ))}
        </ul>
      </div>

      {block.caption ? (
 <p className="mt-3 px-1 text-xs leading-relaxed text-faint">{block.caption}</p>
      ) : null}
    </div>
  );
}

function GaugeChartView({ block }: { block: ChartBlock }) {
  const firstPoint = block.data[0] || { label: "Indicateur", value: 50 };
  const maxVal = block.data[1]?.value || 100;
  const currentVal = Math.min(maxVal, Math.max(0, firstPoint.value));
  const percent = Math.min(100, Math.max(0, Math.round((currentVal / maxVal) * 100)));

  return (
    <div className="rounded-2xl border border-line bg-ink/[0.02] p-4 sm:p-5 text-center">
      {block.title && <h4 className="text-sm font-medium text-ink mb-2">{block.title}</h4>}
      <div className="flex flex-col items-center justify-center">
        <svg viewBox="0 0 300 160" className="w-56 h-auto">
          {/* Arc de fond */}
          <path
            d="M 60 130 A 90 90 0 0 1 240 130"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="18"
            strokeLinecap="round"
          />
          {/* Arc de valeur */}
          <path
            d="M 60 130 A 90 90 0 0 1 240 130"
            fill="none"
            stroke="#0139b7"
            strokeWidth="18"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * percent) / 100}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          <text x="150" y="115" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#0f172a">
            {formatNumber(currentVal, 1)}{block.unit ? ` ${block.unit}` : ""}
          </text>
          <text x="150" y="135" textAnchor="middle" fontSize="11" fill="#64748b">
            {firstPoint.label} ({percent}%)
          </text>
        </svg>
      </div>
      {block.caption && <p className="mt-1 text-xs text-faint">{block.caption}</p>}
    </div>
  );
}

export function ChartBlockView({ block }: { block: ChartBlock }) {
  if (block.chartType === "gauge") {
    return <GaugeChartView block={block} />;
  }
  if (block.chartType === "pie" || block.chartType === "donut") {
    return <PieChartView block={block} />;
  }
  return <CartesianChartView block={block} />;
}

function CartesianChartView({ block }: { block: ChartBlock }) {
  const [hover, setHover] = useState<number | null>(null);
  const rawId = useId();
  const gradientId = `chart-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const values = block.data.map((point) => point.value);
  const rawMin = Math.min(0, ...values);
  const rawMax = Math.max(0, ...values);
  const rawSpan = rawMax - rawMin || Math.abs(rawMax) || 1;
  const tickStep = niceStep(rawSpan / 4);
  const min = Math.floor(rawMin / tickStep) * tickStep;
  const max = Math.ceil(rawMax / tickStep) * tickStep;
  const range = max - min || 1;

  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const slot = plotWidth / block.data.length;

  const xAt = (index: number) => PAD.left + slot * (index + 0.5);
  const yAt = (value: number) => PAD.top + ((max - value) / range) * plotHeight;
  const zeroY = yAt(0);

  const ticks = Array.from({ length: 5 }, (_, index) => min + (range / 4) * index);
  const active = hover !== null ? block.data[hover] : null;
  const labelEvery = Math.ceil(block.data.length / 8);

  const linePoints = block.data.map((point, index) => ({
    x: xAt(index),
    y: yAt(point.value),
  }));
  const linePath = linePoints
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const areaPath =
    linePoints.length > 0
      ? `${linePath} L${linePoints[linePoints.length - 1].x},${zeroY} L${linePoints[0].x},${zeroY} Z`
      : "";

  return (
    <div className="rounded-xl border border-line/70 bg-card p-4 shadow-2xs">
      <div className="mb-3 flex min-h-5 flex-wrap items-center justify-between gap-2">
        {block.title ? (
          <h4 className="text-sm font-medium text-ink">{block.title}</h4>
        ) : (
          <span />
        )}
        <span className="text-[11px] tabular-nums text-faint">
          {active
            ? `${active.label} · ${formatNumber(active.value, 1)}${block.unit ? ` ${block.unit}` : ""}`
            : block.unit
              ? `en ${block.unit}`
              : ""}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`Graphique ${
          block.chartType === "bar"
            ? "en barres"
            : block.chartType === "histogram"
              ? "en histogramme"
              : "en courbe"
        }${block.title ? ` : ${block.title}` : ""}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0139b7" />
            <stop offset="100%" stopColor="#ff4b8c" />
          </linearGradient>
          <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0139b7" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0139b7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yAt(tick)}
              y2={yAt(tick)}
              stroke="rgba(10,27,61,0.08)"
              strokeDasharray={tick === 0 ? undefined : "3 5"}
            />
            <text
              x={PAD.left - 10}
              y={yAt(tick) + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="#8490a5"
            >
              {formatCompact(tick)}
            </text>
          </g>
        ))}

        {block.chartType === "bar" || block.chartType === "histogram"
          ? block.data.map((point, index) => {
              const isHistogram = block.chartType === "histogram";
              const barWidth = isHistogram ? Math.min(68, slot * 0.9) : Math.min(46, slot * 0.56);
              const x = PAD.left + slot * index + (slot - barWidth) / 2;
              const y = Math.min(yAt(point.value), zeroY);
              const height = Math.max(2, Math.abs(zeroY - yAt(point.value)));
              const isActive = hover === index;

              return (
                <g key={`${point.label}-${index}`}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    rx={isHistogram ? 2 : Math.min(6, height / 2)}
                    fill={`url(#${gradientId})`}
                    opacity={hover === null || isActive ? 1 : 0.42}
                    className="transition-opacity duration-150"
                  />
                  {isActive ? (
                    <text
                      x={x + barWidth / 2}
                      y={Math.max(PAD.top + 11, y - 7)}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#0a1b3d"
                    >
                      {formatNumber(point.value, 1)}
                    </text>
                  ) : null}
                </g>
              );
            })
          : null}

        {block.chartType === "line" || block.chartType === "area" ? (
          <>
            {areaPath ? <path d={areaPath} fill={`url(#${gradientId}-area)`} /> : null}
            <path
              d={linePath}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {linePoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={hover === index ? 5 : 3.5}
                fill="#ffffff"
                stroke={hover === index ? "#ff4b8c" : "#0139b7"}
                strokeWidth="2"
                className="transition-all duration-150"
              />
            ))}
            {hover !== null ? (
              <line
                x1={xAt(hover)}
                x2={xAt(hover)}
                y1={PAD.top}
                y2={PAD.top + plotHeight}
                stroke="rgba(10,27,61,0.14)"
                strokeDasharray="3 4"
              />
            ) : null}
          </>
        ) : null}

        {block.data.map((point, index) => {
          const showLabel =
            index % labelEvery === 0 || index === block.data.length - 1;

          return (
            <g key={`labels-${point.label}-${index}`}>
              {showLabel ? (
                <text
                  x={xAt(index)}
                  y={HEIGHT - PAD.bottom + 22}
                  textAnchor="middle"
                  fontSize="10"
                  fill={hover === index ? "#0a1b3d" : "#8490a5"}
                >
                  {shortLabel(point.label)}
                </text>
              ) : null}
              <rect
                x={PAD.left + slot * index}
                y={PAD.top}
                width={slot}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(index)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="presentation"
              />
            </g>
          );
        })}
      </svg>

      {block.caption ? (
        <p className="mt-1 px-1 text-xs leading-relaxed text-faint">{block.caption}</p>
      ) : null}

      <ul className="sr-only">
        {block.data.map((point) => (
          <li key={point.label}>
            {point.label} : {point.value}
            {block.unit ? ` ${block.unit}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
