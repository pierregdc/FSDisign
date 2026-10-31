"use client";

import { useState } from "react";
import { Check, ListChecks, RotateCcw } from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { cn } from "@/lib/utils";

type ChecklistBlock = Extract<UIBlock, { type: "checklist" }>;

export function ChecklistBlockView({ block }: { block: ChecklistBlock }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(block.items.map((item) => [item.id, Boolean(item.checked)]))
  );

  const done = block.items.filter((item) => checked[item.id]).length;
  const total = block.items.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const toggle = (id: string) => {
    setChecked((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const reset = () => {
    setChecked(Object.fromEntries(block.items.map((item) => [item.id, false])));
  };

  return (
    <div className="rounded-2xl border border-line bg-ink/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-accent" />
          <p className="text-sm font-medium text-ink">{block.title ?? "Checklist"}</p>
        </div>
        {done > 0 ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-faint transition-colors hover:bg-ink/[0.05] hover:text-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Réinitialiser
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.07]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-pink transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="shrink-0 text-[11px] tabular-nums text-faint">
          {done}/{total}
        </span>
      </div>

      <ul className="mt-4 space-y-1">
        {block.items.map((item) => {
          const isChecked = Boolean(checked[item.id]);

          return (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-ink/[0.03]">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isChecked}
                  onChange={() => toggle(item.id)}
                />
                <span
                  className={cn(
                    "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-accent/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-canvas",
                    isChecked
                      ? "border-accent bg-accent text-white"
                      : "border-ink/15 bg-transparent"
                  )}
                >
                  {isChecked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                </span>
                <span
                  className={cn(
                    "text-sm leading-relaxed transition-colors",
                    isChecked ? "text-faint line-through" : "text-ink/85"
                  )}
                >
                  {item.label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
