"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  CheckSquare,
  Download,
  Info,
  Link2,
  Search,
  Sparkles,
  Square,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { cn, hostnameOf } from "@/lib/utils";

type BlockOf<T extends UIBlock["type"]> = Extract<UIBlock, { type: T }>;

export function MarkdownBlockView({ block }: { block: BlockOf<"markdown"> }) {
  return (
    <div className="prose-studio">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) =>
            href ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
                <ArrowUpRight className="ml-0.5 inline h-3 w-3 opacity-60" />
              </a>
            ) : (
              <span>{children}</span>
            ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-line">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {block.content}
      </ReactMarkdown>
    </div>
  );
}

export function HeadingBlockView({ block }: { block: BlockOf<"heading"> }) {
  if (block.level === 3) {
    return (
      <h3 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
        {block.text}
      </h3>
    );
  }
  return (
    <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
      {block.text}
    </h2>
  );
}

const calloutStyles = {
  info: {
    icon: Info,
    box: "border-sky-500/20 bg-sky-500/[0.05]",
    iconClass: "text-sky-500",
    title: "text-sky-600 dark:text-sky-300",
  },
  success: {
    icon: CheckCircle2,
    box: "border-emerald-500/20 bg-emerald-500/[0.05]",
    iconClass: "text-emerald-500",
    title: "text-emerald-600 dark:text-emerald-300",
  },
  warning: {
    icon: AlertTriangle,
    box: "border-amber-500/20 bg-amber-500/[0.05]",
    iconClass: "text-amber-500",
    title: "text-amber-600 dark:text-amber-300",
  },
  danger: {
    icon: XCircle,
    box: "border-rose-500/20 bg-rose-500/[0.05]",
    iconClass: "text-rose-500",
    title: "text-rose-600 dark:text-rose-300",
  },
} as const;

export function CalloutBlockView({ block }: { block: BlockOf<"callout"> }) {
  const style = calloutStyles[block.variant ?? "info"];
  const Icon = style.icon;

  return (
    <div className={cn("flex gap-3 rounded-xl border p-3.5", style.box)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.iconClass)} />
      <div className="min-w-0">
        {block.title ? (
          <p className={cn("text-xs font-semibold mb-0.5", style.title)}>{block.title}</p>
        ) : null}
        <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-ink/85">
          {block.content}
        </p>
      </div>
    </div>
  );
}

export function StatsBlockView({ block }: { block: BlockOf<"stats"> }) {
  const count = block.items.length;
  const gridClass =
    count === 1
      ? "grid-cols-1"
      : count === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : count === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-2 lg:grid-cols-4";

  return (
    <div className={cn("grid gap-2.5", gridClass)}>
      {block.items.map((item, index) => {
        const TrendIcon =
          item.trend === "up" ? TrendingUp : item.trend === "down" ? TrendingDown : null;
        const trendClass =
          item.trend === "up"
            ? "text-emerald-600"
            : item.trend === "down"
              ? "text-rose-600"
              : "text-muted";

        return (
          <div
            key={`${item.label}-${index}`}
            className="rounded-xl border border-line/70 bg-card p-3.5 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-medium tracking-wide text-muted">
                {item.label}
              </p>
              {TrendIcon ? <TrendIcon className={cn("h-3.5 w-3.5", trendClass)} /> : null}
            </div>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink">
              {item.value}
            </p>
            {item.hint ? <p className="mt-0.5 text-[11px] text-faint">{item.hint}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

export function TableBlockView({ block }: { block: BlockOf<"table"> }) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Filtrage et tri réels
  const filteredRows = useMemo(() => {
    let rows = block.rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q)));
    }
    if (sortCol !== null) {
      rows = [...rows].sort((a, b) => {
        const valA = a[sortCol] ?? "";
        const valB = b[sortCol] ?? "";
        const numA = parseFloat(valA.replace(/[^\d.-]/g, ""));
        const numB = parseFloat(valB.replace(/[^\d.-]/g, ""));
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortAsc ? numA - numB : numB - numA;
        }
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return rows;
  }, [block.rows, search, sortCol, sortAsc]);

  const handleExportCsv = () => {
    const csvContent = [
      block.columns.join(","),
      ...filteredRows.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${block.caption || "tableau"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      {/* Barre de recherche et options du tableau */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer dans le tableau..."
            className="w-full rounded-lg border border-line/70 bg-card pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-faint/70 outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span className="text-[11px]">{filteredRows.length} lignes</span>
          <button
            type="button"
            onClick={handleExportCsv}
            title="Exporter en CSV"
            className="inline-flex items-center gap-1 rounded-md border border-line/70 bg-card px-2 py-1 text-[11px] font-medium text-muted hover:text-ink hover:border-line transition-colors"
          >
            <Download className="h-3 w-3" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line/70 bg-card shadow-2xs">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line/60 bg-ink/[0.02]">
              {block.columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  onClick={() => {
                    if (sortCol === index) setSortAsc(!sortAsc);
                    else {
                      setSortCol(index);
                      setSortAsc(true);
                    }
                  }}
                  className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{column}</span>
                    {sortCol === index && (
                      <span>{sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-line/70 last:border-b-0 hover:bg-ink/[0.02] transition-colors"
              >
                {block.columns.map((_, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn(
                      "px-4 py-3 align-top text-xs sm:text-sm text-ink/80",
                      cellIndex === 0 && "font-medium text-ink"
                    )}
                  >
                    {row[cellIndex] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption ? (
        <p className="mt-1 px-1 text-xs text-faint">{block.caption}</p>
      ) : null}
    </div>
  );
}

export function TimelineBlockView({ block }: { block: BlockOf<"timeline"> }) {
  const [layout, setLayout] = useState<"vertical" | "horizontal">(block.layout || "vertical");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalItems = block.items.length;
  const completedCount = block.items.filter(
    (item, idx) => item.status === "completed" || checkedItems[`item_${idx}`]
  ).length;
  const progressPercent = Math.round((completedCount / totalItems) * 100);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "completed":
        return <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600">Terminé</span>;
      case "in_progress":
        return <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold text-accent">En cours</span>;
      case "to_prepare":
        return <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-600">À préparer</span>;
      case "pending":
      default:
        return <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[9px] font-bold text-slate-500">À venir</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 mb-4">
        <div>
          {block.title ? <h4 className="text-sm font-semibold text-ink">{block.title}</h4> : null}
          <p className="text-xs text-muted mt-0.5">
            Progression : <span className="font-bold text-accent">{completedCount}</span> sur {totalItems} étapes ({progressPercent}%)
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-line bg-panel p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setLayout("vertical")}
            className={cn(
              "px-2 py-1 rounded text-[11px] font-medium transition-colors",
              layout === "vertical" ? "bg-accent text-white shadow-xs" : "text-muted hover:text-ink"
            )}
          >
            Vertical
          </button>
          <button
            type="button"
            onClick={() => setLayout("horizontal")}
            className={cn(
              "px-2 py-1 rounded text-[11px] font-medium transition-colors",
              layout === "horizontal" ? "bg-accent text-white shadow-xs" : "text-muted hover:text-ink"
            )}
          >
            Horizontal
          </button>
        </div>
      </div>

      {/* Barre de progression visuelle */}
      <div className="mb-5 h-2 w-full rounded-full bg-line overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {layout === "vertical" ? (
        <ol className="relative ml-2 border-l-2 border-line">
          {block.items.map((item, index) => {
            const isDone = item.status === "completed" || checkedItems[`item_${index}`];

            return (
              <li
                key={`${item.title}-${index}`}
                className={cn("relative pl-6", index === block.items.length - 1 ? "" : "pb-6")}
              >
                <span
                  className={cn(
                    "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-canvas shadow-xs transition-colors",
                    isDone ? "bg-emerald-500" : "bg-accent"
                  )}
                />

                <div className="flex flex-wrap items-center gap-2">
                  {item.date && (
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                      {item.date}
                    </span>
                  )}
                  {getStatusBadge(item.status)}
                </div>

                <div className="mt-1 flex items-start justify-between gap-2">
                  <div>
                    <p className={cn("text-sm font-semibold text-ink", isDone && "line-through opacity-70")}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.description}</p>
                    )}
                  </div>

                  {/* Case à cocher pour suivi des étapes */}
                  <button
                    type="button"
                    onClick={() => toggleCheck(`item_${index}`)}
                    className="text-muted hover:text-accent p-1 transition-colors"
                  >
                    {isDone ? <CheckSquare className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4" />}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        /* Disposition Horizontale */
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-4 min-w-[600px] pt-2">
            {block.items.map((item, index) => {
              const isDone = item.status === "completed" || checkedItems[`item_${index}`];

              return (
                <div key={`${item.title}-${index}`} className="flex-1 min-w-[150px] relative">
                  <div className="flex items-center mb-2">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2 border-canvas shrink-0",
                        isDone ? "bg-emerald-500" : "bg-accent"
                      )}
                    />
                    {index < block.items.length - 1 && (
                      <div className="h-0.5 w-full bg-line ml-1" />
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-accent uppercase">{item.date || `Étape ${index + 1}`}</span>
                  <p className={cn("text-xs font-semibold text-ink mt-0.5", isDone && "line-through opacity-70")}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-[11px] text-muted mt-1 leading-snug line-clamp-3">{item.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function CompareBlockView({ block }: { block: BlockOf<"compare"> }) {
  const columns = [
    {
      ...block.left,
      accent: "border-accent/20 bg-accent/[0.04]",
      dot: "bg-accent",
      label: "text-accent",
    },
    {
      ...block.right,
      accent: "border-pink/20 bg-pink/[0.05]",
      dot: "bg-pink",
      label: "text-pink",
    },
  ];

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        {columns.map((column) => (
          <div key={column.title} className={cn("rounded-2xl border p-5", column.accent)}>
            <p className={cn("text-sm font-semibold", column.label)}>{column.title}</p>
            <ul className="mt-3 space-y-2.5">
              {column.points.map((point, index) => (
                <li key={`${point}-${index}`} className="flex gap-2.5 text-sm text-ink/80">
                  <span className={cn("mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full", column.dot)} />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {block.verdict ? (
        <div className="mt-3 flex gap-3 rounded-2xl border border-accent/20 bg-accent/[0.06] p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
              Verdict
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">{block.verdict}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SourcesBlockView({ block }: { block: BlockOf<"sources"> }) {
  return (
    <div className="rounded-2xl border border-line bg-ink/[0.02] p-2">
      <ul className="divide-y divide-line/70">
        {block.items.map((item, index) => {
          const content = (
            <>
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink/[0.05] text-muted">
                <Link2 className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start gap-2">
                  <span className="text-sm font-medium text-ink">{item.title}</span>
                  {item.url ? (
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint transition-colors group-hover:text-accent" />
                  ) : null}
                </span>
                {item.url ? (
                  <span className="mt-0.5 block truncate text-[11px] text-faint">
                    {hostnameOf(item.url)}
                  </span>
                ) : null}
                {item.snippet ? (
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {item.snippet}
                  </span>
                ) : null}
              </span>
            </>
          );

          return (
            <li key={`${item.title}-${index}`}>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-ink/[0.03]"
                >
                  {content}
                </a>
              ) : (
                <div className="flex gap-3 px-3 py-3">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
