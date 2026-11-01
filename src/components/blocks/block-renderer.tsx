"use client";

import React from "react";
import type { UIBlock } from "@/lib/ui-schema";
import { cn } from "@/lib/utils";
import {
  CalloutBlockView,
  CompareBlockView,
  HeadingBlockView,
  MarkdownBlockView,
  SourcesBlockView,
  StatsBlockView,
  TableBlockView,
  TimelineBlockView,
} from "@/features/display";
import { ChartBlockView } from "@/features/chart";
import { ChecklistBlockView } from "@/features/checklist";
import { SliderBlockView } from "@/features/slider";
import { FormBlockView } from "@/features/form";
import { ActionsBlockView } from "@/features/actions";
import { MapBlockView } from "@/features/map";
import {
  CalculatorBlockView,
  CardsBlockView,
  FlashcardsBlockView,
  StepsBlockView,
  TabsBlockView,
} from "@/features/rich-content";
import { SvgBlockView } from "@/features/svg";
import { DiagramBlockView } from "@/features/diagram";
import { MockupBlockView } from "@/features/mockup";
import { QuizBlockView } from "@/features/quiz";
import { ImageStudioBlockView } from "@/features/image-studio";
import { KpiBlockView } from "@/features/kpi";
import { VisualDocBlockView } from "@/features/visual-doc";
import { TravelBlockView } from "@/features/travel";
import { MathBlockView } from "@/features/math";
import { IntelligentUiBlockView } from "@/features/intelligent-ui";

/**
 * Petite étiquette Bêta pour identifier clairement les modules en cours d'expérimentation.
 * Exclus de la Bêta selon la consigne : map, maths, et les blocs de base.
 */
export function BetaBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 select-none shadow-xs backdrop-blur-xs",
        className
      )}
      title="Module en version Bêta"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      Bêta
    </span>
  );
}

/**
 * Blocs stables exemptés du badge Bêta :
 * - Map & Travel
 * - Maths (équations, géométrie, courbes f(x), tableur)
 * - Blocs de base (markdown, titres, callouts, tables, listes de tâches, actions, sources, étapes, cartes, onglets, stats)
 */
const EXEMPT_FROM_BETA = new Set<UIBlock["type"]>([
  "markdown",
  "heading",
  "callout",
  "stats",
  "table",
  "checklist",
  "actions",
  "sources",
  "steps",
  "cards",
  "tabs",
  "map",
  "travel",
  "math",
]);

export function BlockRenderer({
  block,
  onPrompt,
  disabled = false,
}: {
  block: UIBlock;
  onPrompt: (prompt: string) => void;
  disabled?: boolean;
}) {
  const isBeta = !EXEMPT_FROM_BETA.has(block.type);

  let content: React.ReactNode = null;

  switch (block.type) {
    case "markdown":
      content = <MarkdownBlockView block={block} />;
      break;
    case "heading":
      content = <HeadingBlockView block={block} />;
      break;
    case "callout":
      content = <CalloutBlockView block={block} />;
      break;
    case "stats":
      content = <StatsBlockView block={block} />;
      break;
    case "table":
      content = <TableBlockView block={block} />;
      break;
    case "chart":
      content = <ChartBlockView block={block} />;
      break;
    case "checklist":
      content = <ChecklistBlockView block={block} />;
      break;
    case "timeline":
      content = <TimelineBlockView block={block} />;
      break;
    case "compare":
      content = <CompareBlockView block={block} />;
      break;
    case "slider":
      content = <SliderBlockView block={block} />;
      break;
    case "form":
      content = <FormBlockView block={block} onPrompt={onPrompt} disabled={disabled} />;
      break;
    case "actions":
      content = <ActionsBlockView block={block} onPrompt={onPrompt} disabled={disabled} />;
      break;
    case "tabs":
      content = <TabsBlockView block={block} />;
      break;
    case "cards":
      content = <CardsBlockView block={block} onPrompt={onPrompt} disabled={disabled} />;
      break;
    case "steps":
      content = <StepsBlockView block={block} />;
      break;
    case "flashcards":
      content = <FlashcardsBlockView block={block} />;
      break;
    case "calculator":
      content = <CalculatorBlockView block={block} />;
      break;
    case "sources":
      content = <SourcesBlockView block={block} />;
      break;
    case "map":
      content = <MapBlockView block={block} />;
      break;
    case "svg":
      content = <SvgBlockView block={block} />;
      break;
    case "diagram":
      content = <DiagramBlockView block={block} />;
      break;
    case "mockup":
      content = <MockupBlockView block={block} />;
      break;
    case "quiz":
      content = <QuizBlockView block={block} />;
      break;
    case "imageStudio":
      content = <ImageStudioBlockView block={block} onPrompt={onPrompt} />;
      break;
    case "kpi":
      content = <KpiBlockView block={block} />;
      break;
    case "visualDoc":
      content = <VisualDocBlockView block={block} />;
      break;
    case "travel":
      content = <TravelBlockView block={block} />;
      break;
    case "math":
      content = <MathBlockView block={block} />;
      break;
    case "intelligentUi":
      content = <IntelligentUiBlockView block={block} onPrompt={onPrompt} />;
      break;
    default:
      return null;
  }

  if (!content) return null;

  if (isBeta) {
    return (
      <div className="relative group/beta-block">
        <div className="mb-2 flex items-center justify-end">
          <BetaBadge />
        </div>
        {content}
      </div>
    );
  }

  return content;
}
