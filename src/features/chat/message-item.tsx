"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { DEFAULT_MODEL, getModelDisplayName } from "@/lib/ai-config";
import type { ChatMessage } from "@/lib/chat-types";
import { parsePartialUI } from "@/lib/partial-ui";
import { uiToText } from "@/lib/ui-text";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/features/chat/brand";
import { ModelProviderIcon } from "@/features/chat/provider-icons";
import { UIResponseView } from "@/features/chat/ui-response-view";
import { MarkdownBlockView } from "@/features/display";

function ModelBadge({
  mode,
  model,
}: {
  mode?: ChatMessage["mode"];
  model?: string;
}) {
  const modelId = model || DEFAULT_MODEL;
  const label = getModelDisplayName(modelId);

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-card/70 px-2 py-0.5 text-[10px] font-semibold text-ink shadow-2xs">
      <ModelProviderIcon modelId={modelId} className="h-3 w-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
}

function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function ThinkingState() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-2.5 max-w-lg space-y-3 animate-fade-in" aria-label="Génération de l'interface en cours">
      <div className="flex items-center gap-3">
        {/* Point pulsant élégant */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
        </span>

        <span className="text-xs font-semibold text-ink">
          Génération de l&apos;interface…
        </span>

        {/* Compteur temps discret */}
        <span className="text-[11px] font-mono text-muted/70 tabular-nums">
          {formatSeconds(seconds)}
        </span>
      </div>

      {/* Ligne fluide discrète */}
      <div className="h-1 w-64 rounded-full bg-line/80 overflow-hidden relative">
        <div className="absolute inset-y-0 w-24 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent animate-shimmer-sweep" />
      </div>

      <p className="text-[11px] text-muted/80">
        Composition de l&apos;interface visuelle · la réponse apparaîtra finalisée d&apos;un coup.
      </p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copié" : "Copier la réponse"}
      aria-label={copied ? "Réponse copiée" : "Copier la réponse"}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-faint transition-colors hover:bg-ink/[0.05] hover:text-ink"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export function MessageItem({
  message,
  activeModel,
  onPrompt,
  onRetry,
  onRegenerate,
  canRegenerate = false,
  disabled = false,
}: {
  message: ChatMessage;
  activeModel?: string;
  onPrompt: (prompt: string) => void;
  onRetry: () => void;
  onRegenerate: () => void;
  canRegenerate?: boolean;
  disabled?: boolean;
}) {
  const isStreaming = message.status === "streaming";
  // En mode rendu en 1 seul coup : on attend la fin du streaming pour parser et afficher l'interface complète
  const parsed = useMemo(() => {
    if (isStreaming) {
      return { title: undefined, blocks: [], followUps: [], complete: false };
    }
    return parsePartialUI(message.content);
  }, [message.content, isStreaming]);

  const hasBlocks = parsed.blocks.length > 0;
  const copyText = hasBlocks
    ? uiToText({ title: parsed.title, blocks: parsed.blocks, followUps: parsed.followUps })
    : message.fallback ?? message.content;

  if (message.role === "user") {
    return (
      <div className="animate-rise flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-accent px-4 py-2.5 text-[14px] leading-relaxed text-white shadow-xs sm:max-w-[75%] sm:px-4.5">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise flex gap-3 sm:gap-4">
      <BrandMark size="sm" className="mt-0.5" />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex min-h-7 items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold text-ink"
              title="FranceStudent CANVA · Intelligent UI"
            >
              Intelligent UI
            </span>
            <ModelBadge mode={message.mode} model={message.model || activeModel} />
            {isStreaming ? (
              <span className="text-[10px] text-faint">en cours de composition…</span>
            ) : null}
          </div>

          <div className="flex items-center gap-0.5 opacity-70 transition-opacity hover:opacity-100">
            {canRegenerate && !isStreaming ? (
              <button
                type="button"
                onClick={onRegenerate}
                title="Régénérer la réponse"
                aria-label="Régénérer la réponse"
                disabled={disabled}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-faint transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            ) : null}
            {copyText ? <CopyButton text={copyText} /> : null}
          </div>
        </div>

        {message.status === "error" ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">
                  La réponse n’a pas pu aboutir
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">
                  {message.error ?? "Une erreur inattendue est survenue."}
                </p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-300 transition-colors hover:bg-rose-500/25"
                >
                  <RotateCcw className="h-3 w-3" />
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {message.status !== "error" && isStreaming ? (
          <ThinkingState />
        ) : null}

        {!isStreaming && hasBlocks ? (
          <div className={cn(message.status === "error" && "mb-3", "animate-response-reveal")}>
            <UIResponseView
              ui={parsed}
              streaming={false}
              onPrompt={onPrompt}
              disabled={disabled}
            />
          </div>
        ) : null}

        {!isStreaming && !hasBlocks && message.fallback ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 animate-response-reveal">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">
              <Sparkles className="h-3 w-3" />
              Réponse non structurée
            </p>
            {message.fallback.trim().startsWith("{") ||
            message.fallback.trim().startsWith("```") ? (
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-line bg-card p-3 text-xs leading-relaxed text-ink/70">
                {message.fallback}
              </pre>
            ) : (
              <MarkdownBlockView block={{ type: "markdown", content: message.fallback }} />
            )}
          </div>
        ) : null}

        {message.stopped ? (
          <p className="mt-3 text-[11px] text-faint">Génération interrompue.</p>
        ) : null}

        {message.incomplete && !isStreaming && !message.stopped ? (
          <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-600 dark:text-amber-400">
            La réponse s’est arrêtée avant la fin. Vous pouvez la régénérer.
          </p>
        ) : null}

        {!isStreaming && !hasBlocks && !message.fallback && message.status === "done" ? (
          <p className="text-sm text-muted">La réponse est vide.</p>
        ) : null}
      </div>
    </div>
  );
}
