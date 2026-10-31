"use client";

import { useId, useState } from "react";
import {
  ArrowUpRight,
  Calculator as CalculatorIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  ListOrdered,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { evaluateExpression } from "@/lib/expression";
import { cn, formatNumber } from "@/lib/utils";
import { iconFor } from "./icon-map";
import { MarkdownBlockView } from "@/features/display";

type BlockOf<T extends UIBlock["type"]> = Extract<UIBlock, { type: T }>;

/* ------------------------------------------------------------------ */
/* Onglets : sélecteur de sous-sections (schéma interactif)     */
/* ------------------------------------------------------------------ */

export function TabsBlockView({ block }: { block: BlockOf<"tabs"> }) {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const index = Math.min(active, block.tabs.length - 1);
  const tab = block.tabs[index];

  return (
    <div className="rounded-2xl border border-line bg-ink/[0.02] p-4 sm:p-5">
      {block.title ? <p className="mb-3 text-sm font-medium text-ink">{block.title}</p> : null}

      <div role="tablist" aria-label={block.title ?? "Sections"} className="flex flex-wrap gap-1.5">
 {block.tabs.map((item, i) => {
   const Icon = item.icon ? iconFor(item.icon) : null;
   const selected = i === index;
          return (
     <button
       key={`${item.label}-${i}`}
       id={`${baseId}-tab-${i}`}
       type="button"
       role="tab"
       aria-selected={selected}
       aria-controls={`${baseId}-panel`}
       onClick={() => setActive(i)}
       className={cn(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
  selected
    ? "border-accent bg-accent text-white shadow-sm"
    : "border-line bg-panel text-muted hover:border-accent/30 hover:text-accent"
       )}
     >
       {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
       {item.label}
     </button>
   );
 })}
      </div>

      <div
        key={index}
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${index}`}
        className="animate-rise mt-4 rounded-xl border border-line bg-panel p-4"
      >
 <MarkdownBlockView block={{ type: "markdown", content: tab.content }} />
 {tab.points && tab.points.length > 0 ? (
   <ul className="mt-3 space-y-1.5">
     {tab.points.map((point, i) => (
       <li key={`${point}-${i}`} className="flex gap-2 text-sm text-ink/80">
         <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
         <span>{point}</span>
       </li>
     ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cartes : grille ou carrousel     */
/* ------------------------------------------------------------------ */

export function CardsBlockView({
  block,
  onPrompt,
  disabled = false,
}: {
  block: BlockOf<"cards">;
  onPrompt: (prompt: string) => void;
  disabled?: boolean;
}) {
  const carousel = block.layout === "carousel";

  return (
    <div>
      {block.title ? <p className="mb-3 text-sm font-medium text-ink">{block.title}</p> : null}
      <div
        className={cn(
   carousel
     ? "-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2"
     : "grid gap-3 sm:grid-cols-2"
        )}
      >
        {block.items.map((item, i) => {
   const Icon = iconFor(item.icon);
          const clickable = Boolean(item.prompt);
   const body = (
     <>
       <div className="flex items-start justify-between gap-2">
         <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
    <Icon className="h-4 w-4" />
  </span>
         {item.badge ? (
           <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
      {item.badge}
    </span>
  ) : clickable ? (
    <ArrowUpRight className="h-3.5 w-3.5 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
         ) : null}
       </div>
       <p className="mt-3 text-sm font-semibold text-ink">{item.title}</p>
       {item.text ? (
  <p className="mt-1 text-xs leading-relaxed text-muted">{item.text}</p>
       ) : null}
     </>
   );
   const className = cn(
     "group rounded-2xl border border-line bg-panel p-4 text-left shadow-[0_1px_2px_rgba(10,27,61,0.03)]",
            carousel && "w-64 shrink-0 snap-start",
     clickable &&
       "transition-colors hover:border-accent/30 hover:bg-accent/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
          );

   return clickable ? (
     <button
       key={`${item.title}-${i}`}
       type="button"
       disabled={disabled}
       onClick={() => onPrompt(item.prompt as string)}
       className={className}
     >
       {body}
     </button>
   ) : (
     <div key={`${item.title}-${i}`} className={className}>
       {body}
     </div>
   );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Étapes dépliables         */
/* ------------------------------------------------------------------ */

export function StepsBlockView({ block }: { block: BlockOf<"steps"> }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-line bg-ink/[0.02] p-5">
      <div className="mb-4 flex items-center gap-2">
        <ListOrdered className="h-4 w-4 text-accent" />
        <p className="text-sm font-medium text-ink">{block.title ?? "Étapes"}</p>
      </div>
      <ol className="space-y-2">
        {block.items.map((item, i) => {
   const expandable = Boolean(item.detail);
   const isOpen = open === i;
          const header = (
     <>
       <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
         {i + 1}
       </span>
       <span className="min-w-0 flex-1 text-left">
         <span className="block text-sm font-medium text-ink">{item.title}</span>
         {item.description ? (
    <span className="mt-0.5 block text-xs text-muted">{item.description}</span>
  ) : null}
       </span>
       {expandable ? (
         <ChevronDown
    className={cn("h-4 w-4 shrink-0 text-faint transition-transform", isOpen && "rotate-180")}
  />
       ) : null}
     </>
   );

   return (
     <li key={`${item.title}-${i}`} className="rounded-xl border border-line bg-panel">
       {expandable ? (
         <button
    type="button"
    aria-expanded={isOpen}
    onClick={() => setOpen(isOpen ? null : i)}
    className="flex w-full items-start gap-3 p-3"
         >
    {header}
  </button>
       ) : (
  <div className="flex items-start gap-3 p-3">{header}</div>
)}
       {expandable && isOpen ? (
         <p className="animate-rise whitespace-pre-wrap border-t border-line px-4 py-3 text-sm leading-relaxed text-ink/80">
    {item.detail}
         </p>
       ) : null}
            </li>
   );
 })}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Flashcards retournables          */
/* ------------------------------------------------------------------ */

export function FlashcardsBlockView({ block }: { block: BlockOf<"flashcards"> }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const total = block.cards.length;
  const current = block.cards[Math.min(index, total - 1)];

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((previous) => (previous + delta + total) % total);
  };

  return (
    <div className="rounded-2xl border border-line bg-ink/[0.02] p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
 <div className="flex items-center gap-2">
   <Layers className="h-4 w-4 text-accent" />
   <p className="text-sm font-medium text-ink">{block.title ?? "Flashcards"}</p>
 </div>
        <span className="text-[11px] tabular-nums text-faint">
   {Math.min(index, total - 1) + 1}/{total}
 </span>
      </div>

      <button
 type="button"
        onClick={() => setFlipped((value) => !value)}
        aria-label={flipped ? "Voir la question" : "Voir la réponse"}
 className={cn(
          "flex min-h-[9rem] w-full flex-col items-center justify-center gap-2 rounded-2xl border p-6 text-center transition-colors",
   flipped
     ? "border-accent/30 bg-accent-soft"
     : "border-line bg-panel hover:border-accent/30"
 )}
      >
 <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
   {flipped ? "Réponse" : "Question"}
        </span>
        <span className="text-base font-medium leading-snug text-ink">
   {flipped ? current.back : current.front}
        </span>
        <span className="text-[11px] text-faint">Cliquer pour retourner</span>
      </button>

      {total > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-2">
   <button
     type="button"
     onClick={() => go(-1)}
     aria-label="Carte précédente"
     className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
     <ChevronLeft className="h-4 w-4" />
          </button>
          <button
     type="button"
            onClick={() => go(1)}
            aria-label="Carte suivante"
     className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
     <ChevronRight className="h-4 w-4" />
   </button>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calculatrice : plusieurs entrées liées, résultats calculés   */
/* ------------------------------------------------------------------ */

export function CalculatorBlockView({ block }: { block: BlockOf<"calculator"> }) {
  const baseId = useId();
  const clampTo = (input: BlockOf<"calculator">["inputs"][number], value: number) => {
    const min = Math.min(input.min, input.max);
    const max = Math.max(input.min, input.max);
    return Math.min(max, Math.max(min, value));
  };

  const initial = () =>
    Object.fromEntries(block.inputs.map((input) => [input.name, clampTo(input, input.defaultValue)]));

  const [values, setValues] = useState<Record<string, number>>(initial);
  const touched = block.inputs.some((input) => values[input.name] !== clampTo(input, input.defaultValue));

  const setValue = (name: string, value: number) => {
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  return (
    <div className="rounded-2xl border border-line bg-ink/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
   <CalculatorIcon className="h-4 w-4 text-accent" />
   <p className="text-sm font-medium text-ink">{block.title ?? "Calculatrice"}</p>
        </div>
        {touched ? (
   <button
     type="button"
     onClick={() => setValues(initial())}
     className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-faint transition-colors hover:bg-ink/[0.05] hover:text-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Réinitialiser
   </button>
 ) : null}
      </div>
      {block.description ? <p className="mt-1 text-xs text-muted">{block.description}</p> : null}

      <div className="mt-4 space-y-4">
        {block.inputs.map((input) => {
          const min = Math.min(input.min, input.max);
   const max = Math.max(input.min, input.max);
   const step = input.step && input.step > 0 ? input.step : 1;
   const value = values[input.name] ?? input.defaultValue;
   const id = `${baseId}-${input.name}`;

   return (
     <div key={input.name}>
       <div className="flex items-center justify-between gap-3">
         <label htmlFor={id} className="text-sm text-ink/80">
    {input.label}
         </label>
         <span className="flex items-center gap-1.5">
    <input
      type="number"
      inputMode="decimal"
      value={value}
      min={min}
      max={max}
      step={step}
      aria-label={`${input.label} (valeur)`}
      onChange={(event) => {
 const next = Number(event.target.value);
        if (Number.isFinite(next)) setValue(input.name, clampTo(input, next));
      }}
      className="w-24 rounded-lg border border-line bg-panel px-2 py-1 text-right text-sm tabular-nums text-ink outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
    />
    {input.unit ? <span className="text-xs text-muted">{input.unit}</span> : null}
  </span>
       </div>
       <input
  id={id}
         type="range"
  min={min}
  max={max}
  step={step}
  value={value}
         onChange={(event) => setValue(input.name, clampTo(input, Number(event.target.value)))}
         className="mt-2 h-1.5 w-full cursor-pointer accent-accent"
       />
     </div>
   );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {block.outputs.map((output, i) => {
   const result = evaluateExpression(output.formula, values);
   return (
     <div
key={`${output.label}-${i}`}
       className={cn(
         "rounded-2xl border p-4",
  output.highlight ? "border-accent/30 bg-accent-soft" : "border-line bg-panel"
       )}
     >
       <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
         {output.label}
       </p>
<p className="mt-2 flex items-center gap-1.5 text-2xl font-semibold tracking-tight text-ink tabular-nums">
  {result === null ? "—" : formatNumber(result, output.decimals ?? 2)}
         {result !== null && output.unit ? (
    <span className="text-sm font-normal text-muted">{output.unit}</span>
  ) : null}
       </p>
     </div>
          );
        })}
      </div>

      {block.hint ? (
 <p className="mt-3 flex items-center gap-1.5 text-xs text-faint">
   <Sparkles className="h-3 w-3" />
          {block.hint}
 </p>
      ) : null}
    </div>
  );
}
