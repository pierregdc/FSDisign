"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { cn } from "@/lib/utils";

type ActionsBlock = Extract<UIBlock, { type: "actions" }>;

export function ActionsBlockView({
  block,
  onPrompt,
  disabled = false,
}: {
  block: ActionsBlock;
  onPrompt: (prompt: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      {block.title ? (
        <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
          <Sparkles className="h-3 w-3 text-accent" />
          {block.title}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {block.actions.map((action, index) => {
          const primary = action.variant === "primary";

          return (
            <button
              key={`${action.label}-${index}`}
              type="button"
              disabled={disabled}
              onClick={() => onPrompt(action.prompt)}
              className={cn(
                "group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-left text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
                primary
                  ? "border-transparent bg-accent text-white hover:bg-accent/90"
                  : "border-line bg-ink/[0.025] text-ink/85 hover:border-accent/30 hover:bg-accent/[0.06] hover:text-ink"
              )}
            >
              {action.label}
              <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
