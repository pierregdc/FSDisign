"use client";

import { useId, useState } from "react";
import type { UIBlock } from "@/lib/ui-schema";
import { formatCompact, formatNumber } from "@/lib/utils";

type ChartBlock = Extract<UIBlock, { type: "chart" }>;

const WIDTH = 720;
const HEIGHT = 300;
const PAD = { top: 24, right: 20, bottom: 54, left: 54 };

function niceStep(raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const exponent = Math.floor(Math.log10(raw));
  const fraction = raw / 10 ** exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
}

/** Palette de couleurs moderne et accessible (thème FranceStudent). */
const PIE_COLORS = [
  "#0ea5e9", // Sky 500
  "#6366f1", // Indigo 500
  "#10b981", // Emerald 500
  "#f59e0b", // Amber 500
  "#ec4899", // Pink 500
  "#8b5cf6", // Violet 500
  "#14b8a6", // Teal 500
  "#64748b", // Slate 500
];

/** Calcule une courbe de Bézier cubique (Catmull-Rom) ultra-fluide pour les graphiques en ligne. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;

  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

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
    <div className="w-full py-2">
      <div className="mb-3 flex min-h-5 flex-wrap items-center justify-between gap-2">
        {block.title ? (
          <h4 className="text-sm font-semibold text-white">{block.title}</h4>
        ) : (
          <span />
        )}
        <span className="text-[11px] tabular-nums text-slate-400">
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
                stroke="transparent"
                strokeWidth="1.5"
                opacity={hover === null || hover === slice.index ? 1 : 0.35}
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
                fontWeight="700"
                className="fill-white"
              >
                {active ? `${formatNumber(active.fraction * 100, 0)} %` : formatCompact(total)}
              </text>
              <text x={center} y={center + 16} textAnchor="middle" fontSize="10" className="fill-slate-400">
                {active ? active.point.label : "Total"}
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
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                hover === slice.index ? "bg-slate-800/80" : ""
              }`}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: PIE_COLORS[slice.index % PIE_COLORS.length] }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-slate-200 font-medium">{slice.point.label}</span>
              <span className="tabular-nums text-slate-300 font-semibold">
                {formatNumber(slice.point.value, 1)}
                {unit}
              </span>
              <span className="w-12 text-right text-xs tabular-nums text-slate-400">
                {formatNumber(slice.fraction * 100, 0)} %
              </span>
            </li>
          ))}
        </ul>
      </div>

      {block.caption ? (
        <p className="mt-3 px-1 text-xs leading-relaxed text-slate-400">{block.caption}</p>
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
    <div className="w-full py-2 text-center">
      {block.title && <h4 className="text-sm font-semibold text-white mb-2">{block.title}</h4>}
      <div className="flex flex-col items-center justify-center">
        <svg viewBox="0 0 300 160" className="w-56 h-auto">
          <path
            d="M 60 130 A 90 90 0 0 1 240 130"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 60 130 A 90 90 0 0 1 240 130"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="18"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * percent) / 100}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          <text x="150" y="115" textAnchor="middle" fontSize="24" fontWeight="bold" className="fill-white">
            {formatNumber(currentVal, 1)}{block.unit ? ` ${block.unit}` : ""}
          </text>
          <text x="150" y="135" textAnchor="middle" fontSize="11" className="fill-slate-400">
            {firstPoint.label} ({percent}%)
          </text>
        </svg>
      </div>
      {block.caption && <p className="mt-1 text-xs text-slate-400">{block.caption}</p>}
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

  const linePoints = block.data.map((point, index) => ({
    x: xAt(index),
    y: yAt(point.value),
  }));

  const smoothCurve = smoothPath(linePoints);
  const areaSmooth =
    linePoints.length > 0
      ? `${smoothCurve} L ${linePoints[linePoints.length - 1].x.toFixed(1)},${zeroY.toFixed(1)} L ${linePoints[0].x.toFixed(1)},${zeroY.toFixed(1)} Z`
      : "";

  return (
    <div className="w-full py-2">
      <div className="mb-3 flex min-h-5 flex-wrap items-center justify-between gap-2">
        {block.title ? (
          <h4 className="text-sm font-semibold text-white">{block.title}</h4>
        ) : (
          <span />
        )}
        <span className="text-[11px] tabular-nums text-slate-400">
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
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Lignes de repère horizontales */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yAt(tick)}
              y2={yAt(tick)}
              stroke="rgba(255,255,255,0.07)"
              strokeDasharray={tick === 0 ? undefined : "3 5"}
            />
            <text
              x={PAD.left - 10}
              y={yAt(tick) + 3.5}
              textAnchor="end"
              fontSize="10"
              className="fill-slate-400"
            >
              {formatCompact(tick)}
            </text>
          </g>
        ))}

        {/* Barres */}
        {block.chartType === "bar" || block.chartType === "histogram"
          ? block.data.map((point, index) => {
              const isHistogram = block.chartType === "histogram";
              const barWidth = isHistogram ? Math.min(68, slot * 0.9) : Math.min(46, slot * 0.52);
              const x = PAD.left + slot * index + (slot - barWidth) / 2;
              const y = Math.min(yAt(point.value), zeroY);
              const height = Math.max(3, Math.abs(zeroY - yAt(point.value)));
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
                    opacity={hover === null || isActive ? 1 : 0.45}
                    className="transition-all duration-150"
                  />
                  {/* Valeur toujours lisible au-dessus de chaque barre */}
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(PAD.top + 10, y - 6)}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    className={isActive ? "fill-sky-300 font-bold" : "fill-slate-300"}
                  >
                    {formatCompact(point.value)}
                  </text>
                </g>
              );
            })
          : null}

        {/* Courbe / Aire (Lissée Catmull-Rom) */}
        {block.chartType === "line" || block.chartType === "area" ? (
          <>
            {areaSmooth ? <path d={areaSmooth} fill={`url(#${gradientId}-area)`} /> : null}
            <path
              d={smoothCurve}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {linePoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={hover === index ? 5.5 : 3.5}
                fill="#0f172a"
                stroke={hover === index ? "#38bdf8" : "#818cf8"}
                strokeWidth="2.5"
                className="transition-all duration-150"
              />
            ))}
            {hover !== null ? (
              <line
                x1={xAt(hover)}
                x2={xAt(hover)}
                y1={PAD.top}
                y2={PAD.top + plotHeight}
                stroke="rgba(255,255,255,0.18)"
                strokeDasharray="3 4"
              />
            ) : null}
          </>
        ) : null}

        {/* Étiquettes de l'axe X : multi-lignes intelligentes pour ne JAMAIS couper le texte */}
        {block.data.map((point, index) => {
          const isHovered = hover === index;
          const label = point.label;
          const words = label.split(" ");
          const hasMultipleWords = words.length >= 2 && label.length > 10;

          return (
            <g key={`labels-${point.label}-${index}`}>
              {hasMultipleWords ? (
                <text
                  x={xAt(index)}
                  y={HEIGHT - PAD.bottom + 18}
                  textAnchor="middle"
                  fontSize="10"
                  className={isHovered ? "fill-sky-300 font-semibold" : "fill-slate-400 font-normal"}
                >
                  <tspan x={xAt(index)} dy="0">
                    {words.slice(0, Math.ceil(words.length / 2)).join(" ")}
                  </tspan>
                  <tspan x={xAt(index)} dy="12">
                    {words.slice(Math.ceil(words.length / 2)).join(" ")}
                  </tspan>
                </text>
              ) : (
                <text
                  x={xAt(index)}
                  y={HEIGHT - PAD.bottom + 22}
                  textAnchor="middle"
                  fontSize="10"
                  className={isHovered ? "fill-sky-300 font-semibold" : "fill-slate-400 font-normal"}
                >
                  {label}
                </text>
              )}

              {/* Zone interactive invisible pour le survol */}
              <rect
                x={PAD.left + slot * index}
                y={PAD.top}
                width={slot}
                height={plotHeight + 30}
                fill="transparent"
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(index)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="presentation"
                className="cursor-pointer"
              />
            </g>
          );
        })}
      </svg>

      {block.caption ? (
        <p className="mt-2 px-1 text-xs leading-relaxed text-slate-400">{block.caption}</p>
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
