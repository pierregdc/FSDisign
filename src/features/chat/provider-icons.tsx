import React from "react";
import type { AiModelOption } from "@/lib/ai-config";

/**
 * Logo officiel OpenAI (rosace emblématique)
 */
export function OpenAIIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4947zm-9.66-4.5242a4.4707 4.4707 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1402-2.0452zM2.342 8.324a4.4565 4.4565 0 0 1 2.3418-1.9778v5.682a.7948.7948 0 0 0 .3928.6812l5.8286 3.3685-2.02 1.1683a.071.071 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.342 8.324zm16.597 3.8558L13.1038 8.816l2.0199-1.1682a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6761 8.1042v-5.6772a.79.79 0 0 0-.407-.7147l-.0029-.0272zm2.0104-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.6583V7.326a.0757.0757 0 0 1 .0331-.0615l4.8777-2.815a4.5045 4.5045 0 0 1 6.6273 4.9965zM12 14.3794l-2.73-1.575a.7759.7759 0 0 1-.3928-.6813v-3.15a.7759.7759 0 0 1 .3928-.6813L12 6.7169l2.73 1.575a.7759.7759 0 0 1 .3927.6813v3.15a.7759.7759 0 0 1-.3927.6813L12 14.3794z" />
    </svg>
  );
}

/**
 * Logo officiel Anthropic Claude (astérisque géométrique terracotta)
 */
export function AnthropicIcon({
  className = "h-4 w-4",
  color = "#CC785C",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
      <path d="M17.472 14.382l4.896 2.827a1.08 1.08 0 0 1 .395 1.477l-1.32 2.285a1.08 1.08 0 0 1-1.477.395l-4.896-2.827a1.08 1.08 0 0 1-.395-1.477l1.32-2.285a1.08 1.08 0 0 1 1.477-.395zm-10.944 0l-4.896 2.827a1.08 1.08 0 0 0-.395 1.477l1.32 2.285a1.08 1.08 0 0 0 1.477.395l4.896-2.827a1.08 1.08 0 0 0 .395-1.477l-1.32-2.285a1.08 1.08 0 0 0-1.477-.395zM12 2.05a1.08 1.08 0 0 1 1.08 1.08v5.654a1.08 1.08 0 0 1-1.08 1.08 1.08 1.08 0 0 1-1.08-1.08V3.13A1.08 1.08 0 0 1 12 2.05zm5.736 6.314a1.08 1.08 0 0 1 1.477.395l2.827 4.896a1.08 1.08 0 0 1-.395 1.477l-2.285 1.32a1.08 1.08 0 0 1-1.477-.395l-2.827-4.896a1.08 1.08 0 0 1 .395-1.477l2.285-1.32zm-11.472 0l2.285 1.32a1.08 1.08 0 0 1 .395 1.477l-2.827 4.896a1.08 1.08 0 0 1-1.477.395l-2.285-1.32a1.08 1.08 0 0 1-.395-1.477l2.827-4.896a1.08 1.08 0 0 1 1.477-.395z" />
    </svg>
  );
}

/**
 * Logo officiel Google Gemini (étoile à 4 branches dégradée)
 */
export function GeminiIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="gemini-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4E82EE" />
          <stop offset="50%" stopColor="#9B72CB" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z"
        fill="url(#gemini-icon-grad)"
      />
    </svg>
  );
}

/**
 * Logo officiel Mistral AI (blocs empilés orange)
 */
export function MistralIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#FA520F" className={className} aria-hidden="true">
      <rect x="2" y="3" width="4" height="4" rx="0.5" />
      <rect x="18" y="3" width="4" height="4" rx="0.5" />
      <rect x="2" y="7" width="8" height="4" rx="0.5" />
      <rect x="14" y="7" width="8" height="4" rx="0.5" />
      <rect x="2" y="11" width="20" height="4" rx="0.5" />
      <rect x="6" y="15" width="12" height="4" rx="0.5" />
      <rect x="10" y="19" width="4" height="4" rx="0.5" />
    </svg>
  );
}

/**
 * Logo officiel DeepSeek (baleine / onde bleue)
 */
export function DeepSeekIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#0EA5E9" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 2.237.734 4.305 1.974 5.975L2.83 21.17a1 1 0 0 0 1.258 1.258l3.195-1.144C8.955 21.728 10.435 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm1 14.5c-2.485 0-4.5-1.567-4.5-3.5S10.515 9.5 13 9.5s4.5 1.567 4.5 3.5-2.015 3.5-4.5 3.5z" />
    </svg>
  );
}

/**
 * Logo Meta / Llama
 */
export function MetaIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#0081FB" className={className} aria-hidden="true">
      <path d="M16.65 3.5c-1.8 0-3.3 1-4.65 2.6-1.35-1.6-2.85-2.6-4.65-2.6C3.9 3.5 1.5 6.2 1.5 10c0 4.5 3.5 8.2 6.5 10 2.2 1.3 4 1.5 4 1.5s1.8-.2 4-1.5c3-1.8 6.5-5.5 6.5-10 0-3.8-2.4-6.5-5.85-6.5zm-9.3 13.3c-2.3-1.4-4.85-4.5-4.85-6.8 0-2.4 1.4-4.2 3.85-4.2 1.5 0 2.8.9 3.9 2.4-1.3 2.8-2.9 8.6-2.9 8.6zm9.3 0s-1.6-5.8-2.9-8.6c1.1-1.5 2.4-2.4 3.9-2.4 2.45 0 3.85 1.8 3.85 4.2 0 2.3-2.55 5.4-4.85 6.8z" />
    </svg>
  );
}

/**
 * Détermine le nom du groupe fournisseur pour les listes (OpenAI, Anthropic, Google, etc.)
 */
export function getModelProviderGroup(model: AiModelOption): string {
  const id = model.id.toLowerCase();
  const cat = (model.category || "").toLowerCase();

  if (id.startsWith("claude") || cat.includes("anthropic")) {
    return "Anthropic";
  }
  if (id.startsWith("gemini") || cat.includes("google") || cat.includes("gemini")) {
    return "Google Gemini";
  }
  if (id.startsWith("mistral") || cat.includes("mistral")) {
    return "Mistral";
  }
  if (id.startsWith("deepseek") || cat.includes("deepseek")) {
    return "DeepSeek";
  }
  if (id.startsWith("llama") || cat.includes("meta")) {
    return "Meta";
  }
  if (id.startsWith("gpt-") || cat.includes("openai")) {
    return "OpenAI";
  }
  return model.category || "Autres";
}

/**
 * Affiche l'icône correspondante selon le modèle sélectionné
 */
export function ModelProviderIcon({
  modelId,
  category,
  className = "h-4 w-4 shrink-0",
}: {
  modelId: string;
  category?: string;
  className?: string;
}) {
  const id = modelId.toLowerCase();
  const cat = (category || "").toLowerCase();

  if (id.startsWith("claude") || cat.includes("anthropic")) {
    return <AnthropicIcon className={className} />;
  }
  if (id.startsWith("gemini") || cat.includes("google") || cat.includes("gemini")) {
    return <GeminiIcon className={className} />;
  }
  if (id.startsWith("mistral") || cat.includes("mistral")) {
    return <MistralIcon className={className} />;
  }
  if (id.startsWith("deepseek") || cat.includes("deepseek")) {
    return <DeepSeekIcon className={className} />;
  }
  if (id.startsWith("llama") || cat.includes("meta")) {
    return <MetaIcon className={className} />;
  }
  // OpenAI par défaut (ex: gpt-6-luna, gpt-6-sol, gpt-5.6, etc.)
  return <OpenAIIcon className={className} />;
}
