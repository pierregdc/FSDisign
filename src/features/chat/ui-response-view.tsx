"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import type { ParsedUI } from "@/lib/partial-ui";
import { BlockRenderer } from "@/components/blocks/block-renderer";

export function UIResponseView({
  ui,
  streaming,
  onPrompt,
  disabled = false,
}: {
  ui: ParsedUI;
  streaming: boolean;
  onPrompt: (prompt: string) => void;
  disabled?: boolean;
}) {
  const blocks = ui.blocks.slice(0, 24);

  return (
    <div>
      {ui.title ? (
        <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-accent">
          <Sparkles className="h-3 w-3 text-accent" />
          {ui.title}
        </p>
      ) : null}

      <div className="space-y-3.5">
        {blocks.map((block, index) => (
          <div key={`${block.type}-${index}`} className="animate-rise">
            <BlockRenderer block={block} onPrompt={onPrompt} disabled={disabled} />
          </div>
        ))}
      </div>

      {streaming ? (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-faint">
          <span className="inline-flex gap-1">
            <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:0ms]" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:160ms]" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:320ms]" />
          </span>
          L’interface se construit…
        </div>
      ) : null}

      {!streaming && ui.followUps.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-medium text-faint">
            Suggestions pour continuer
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ui.followUps.map((followUp, index) => (
              <button
                key={`${followUp}-${index}`}
                type="button"
                disabled={disabled}
                onClick={() => onPrompt(followUp)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-card/70 px-3 py-1 text-xs text-muted shadow-2xs transition-colors hover:border-accent/30 hover:bg-card hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{followUp}</span>
                <ArrowUpRight className="h-3 w-3 opacity-40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-80" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
