"use client";

import { useId, useState } from "react";
import { Minus, Plus, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { evaluateFormula } from "@/lib/formula";
import { cn, formatNumber } from "@/lib/utils";

type SliderBlock = Extract<UIBlock, { type: "slider" }>;

export function SliderBlockView({ block }: { block: SliderBlock }) {
  const inputId = useId();
  const min = Math.min(block.min, block.max);
  const max = Math.max(block.min, block.max);
  const step = block.step && block.step > 0 ? block.step : 1;
  const clamp = (value: number) => Math.min(max, Math.max(min, value));

  const [value, setValue] = useState(() => clamp(block.defaultValue));
  const [touched, setTouched] = useState(false);

  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const computed = block.formula ? evaluateFormula(block.formula, value) : null;
  const hasResult = Boolean(block.formula || block.resultLabel);
  const resultValue = block.formula ? computed : value;
  const resultUnit = block.resultUnit ?? block.unit ?? "";

  const update = (next: number) => {
    setTouched(true);
    setValue(clamp(Number(next.toFixed(6))));
  };

  const shift = (direction: 1 | -1) => {
    update(value + step * direction);
  };

  return (
    <div className="rounded-2xl border border-line bg-ink/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-accent" />
          <p className="text-sm font-medium text-ink">{block.title ?? "Simulateur"}</p>
        </div>
        {touched ? (
          <button
            type="button"
            onClick={() => {
              setValue(clamp(block.defaultValue));
              setTouched(false);
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-faint transition-colors hover:bg-ink/[0.05] hover:text-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Réinitialiser
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <label htmlFor={inputId} className="text-sm text-ink/80">
          {block.label}
        </label>
        <span className="rounded-lg bg-ink/[0.05] px-2.5 py-1 text-sm font-medium tabular-nums text-ink">
          {formatNumber(value, 2)}
          {block.unit ? <span className="ml-1 text-xs font-normal text-muted">{block.unit}</span> : null}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={value <= min}
          aria-label="Diminuer"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => update(Number(event.target.value))}
          className="studio-range w-full"
          style={{
            background: `linear-gradient(90deg, #0139b7 0%, #ff4b8c ${progress}%, rgba(10,27,61,0.08) ${progress}%, rgba(10,27,61,0.08) 100%)`,
          }}
        />

        <button
          type="button"
          onClick={() => shift(1)}
          disabled={value >= max}
          aria-label="Augmenter"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {hasResult ? (
        <div
          className={cn(
            "mt-5 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-accent/15 bg-accent/[0.055] px-4 py-3"
          )}
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent/80">
              {block.resultLabel ?? "Résultat"}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-ink">
              {resultValue === null ? "—" : formatNumber(resultValue, 2)}
              {resultValue !== null && resultUnit ? (
                <span className="ml-1 text-sm font-normal text-muted">{resultUnit}</span>
              ) : null}
            </p>
          </div>
          {resultValue === null ? (
            <p className="text-xs text-amber-600">Formule indisponible</p>
          ) : null}
        </div>
      ) : null}

      {block.hint ? (
        <p className="mt-3 text-xs leading-relaxed text-faint">{block.hint}</p>
      ) : null}
    </div>
  );
}
