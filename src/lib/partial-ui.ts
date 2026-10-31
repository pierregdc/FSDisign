import { Allow, parse } from "partial-json";
import {
  BlockSchema,
  UIResponseSchema,
  type UIBlock,
} from "@/lib/ui-schema";

export type ParsedUI = {
  title?: string;
  blocks: UIBlock[];
  followUps: string[];
  complete: boolean;
};

const EMPTY: ParsedUI = { blocks: [], followUps: [], complete: false };

/**
 * Le modèle peut entourer le JSON de ```json ... ``` ou ajouter un préambule.
 * On isole le premier objet JSON et on ignore le reste.
 */
export function extractJsonCandidate(raw: string): string {
  let text = raw.trim();

  text = text.replace(/^```(?:json)?\s*/i, "");
  text = text.replace(/\s*```\s*$/i, "");

  const start = text.indexOf("{");
  if (start === -1) return "";

  return text.slice(start);
}

/**
 * Parse un JSON partiel ou extrait automatiquement les codes SVG directs.
 */
export function parsePartialUI(raw: string): ParsedUI {
  const svgRegex = /<svg\b[^>]*>[\s\S]*?<\/svg>/i;
  const directSvgMatch = raw.match(svgRegex);

  const candidate = extractJsonCandidate(raw);
  if (!candidate) {
    if (directSvgMatch) {
      return {
        title: "Graphisme Vectoriel SVG",
        blocks: [
          {
            type: "svg",
            title: "Graphisme Vectoriel SVG",
            code: directSvgMatch[0],
            description: "Illustration vectorielle générée",
          },
        ],
        followUps: ["Modifier les couleurs", "Ajouter une animation", "Télécharger le SVG"],
        complete: true,
      };
    }
    return EMPTY;
  }

  let value: unknown;
  try {
    value = parse(candidate, Allow.ALL);
  } catch {
    if (directSvgMatch) {
      return {
        title: "Graphisme Vectoriel SVG",
        blocks: [
          {
            type: "svg",
            title: "Graphisme Vectoriel SVG",
            code: directSvgMatch[0],
          },
        ],
        followUps: [],
        complete: true,
      };
    }
    return EMPTY;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return EMPTY;
  }

  const record = value as Record<string, unknown>;
  const blocks: UIBlock[] = [];

  if (Array.isArray(record.blocks)) {
    for (const candidateBlock of record.blocks) {
      if (candidateBlock && typeof candidateBlock === "object") {
        const blk = candidateBlock as Record<string, unknown>;
        if (blk.type === "svg" && !blk.code) {
          blk.code = blk.svg || blk.content || blk.markup || "";
        }
      }
      const result = BlockSchema.safeParse(candidateBlock);
      if (result.success) blocks.push(result.data);
    }
  }

  // Si le JSON racine est lui-même un bloc unique (ex: { "type": "svg", ... })
  if (blocks.length === 0 && typeof record.type === "string") {
    if (record.type === "svg" && !record.code) {
      record.code = record.svg || record.content || record.markup || "";
    }
    const singleResult = BlockSchema.safeParse(record);
    if (singleResult.success) blocks.push(singleResult.data);
  }

  // Fallback direct SVG si le JSON n'avait pas de bloc SVG mais que du SVG est présent
  if (directSvgMatch && !blocks.some((b) => b.type === "svg")) {
    blocks.push({
      type: "svg",
      title: (typeof record.title === "string" ? record.title : undefined) || "Graphisme Vectoriel SVG",
      code: directSvgMatch[0],
    });
  }

  const followUps = Array.isArray(record.followUps)
    ? record.followUps
        .filter((item): item is string => typeof item === "string")
        .slice(0, 6)
    : [];

  const title =
    typeof record.title === "string" && record.title.trim().length > 0
      ? record.title
      : undefined;

  let complete = false;
  try {
    const full = JSON.parse(candidate) as unknown;
    complete = UIResponseSchema.safeParse(full).success;
  } catch {
    complete = false;
  }

  return { title, blocks, followUps, complete };
}
