"use client";

import type { UIBlock } from "@/lib/ui-schema";
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

export function BlockRenderer({
  block,
  onPrompt,
  disabled = false,
}: {
  block: UIBlock;
  onPrompt: (prompt: string) => void;
  disabled?: boolean;
}) {
  switch (block.type) {
    case "markdown":
      return <MarkdownBlockView block={block} />;
    case "heading":
      return <HeadingBlockView block={block} />;
    case "callout":
      return <CalloutBlockView block={block} />;
    case "stats":
      return <StatsBlockView block={block} />;
    case "table":
      return <TableBlockView block={block} />;
    case "chart":
      return <ChartBlockView block={block} />;
    case "checklist":
      return <ChecklistBlockView block={block} />;
    case "timeline":
      return <TimelineBlockView block={block} />;
    case "compare":
      return <CompareBlockView block={block} />;
    case "slider":
      return <SliderBlockView block={block} />;
    case "form":
      return <FormBlockView block={block} onPrompt={onPrompt} disabled={disabled} />;
    case "actions":
      return <ActionsBlockView block={block} onPrompt={onPrompt} disabled={disabled} />;
    case "tabs":
      return <TabsBlockView block={block} />;
    case "cards":
      return <CardsBlockView block={block} onPrompt={onPrompt} disabled={disabled} />;
    case "steps":
      return <StepsBlockView block={block} />;
    case "flashcards":
      return <FlashcardsBlockView block={block} />;
    case "calculator":
      return <CalculatorBlockView block={block} />;
    case "sources":
      return <SourcesBlockView block={block} />;
    case "map":
      return <MapBlockView block={block} />;
    case "svg":
      return <SvgBlockView block={block} />;
    case "diagram":
      return <DiagramBlockView block={block} />;
    case "mockup":
      return <MockupBlockView block={block} />;
    case "quiz":
      return <QuizBlockView block={block} />;
    case "imageStudio":
      return <ImageStudioBlockView block={block} onPrompt={onPrompt} />;
    case "kpi":
      return <KpiBlockView block={block} />;
    case "visualDoc":
      return <VisualDocBlockView block={block} />;
    default:
      return null;
  }
}
