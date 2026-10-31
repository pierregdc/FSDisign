import React from "react";
import type { AiModelOption } from "@/lib/ai-config";

/**
 * Logo officiel OpenAI (rosace / spirale emblématique)
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
 * Logo officiel Anthropic Claude (étoile / astérisque corail rayonnante)
 */
export function AnthropicIcon({
  className = "h-4 w-4",
  color = "#D97706",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <g stroke={color} strokeWidth="2.3" strokeLinecap="round">
        <line x1="12" y1="2.5" x2="12" y2="6.2" />
        <line x1="12" y1="17.8" x2="12" y2="21.5" />
        <line x1="2.5" y1="12" x2="6.2" y2="12" />
        <line x1="17.8" y1="12" x2="21.5" y2="12" />
        <line x1="5.28" y1="5.28" x2="7.9" y2="7.9" />
        <line x1="16.1" y1="16.1" x2="18.72" y2="18.72" />
        <line x1="5.28" y1="18.72" x2="7.9" y2="16.1" />
        <line x1="16.1" y1="7.9" x2="18.72" y2="5.28" />
        <line x1="3.5" y1="8.5" x2="6.9" y2="9.8" />
        <line x1="17.1" y1="14.2" x2="20.5" y2="15.5" />
        <line x1="3.5" y1="15.5" x2="6.9" y2="14.2" />
        <line x1="17.1" y1="9.8" x2="20.5" y2="8.5" />
        <line x1="8.5" y1="3.5" x2="9.8" y2="6.9" />
        <line x1="14.2" y1="17.1" x2="15.5" y2="20.5" />
        <line x1="15.5" y1="3.5" x2="14.2" y2="6.9" />
        <line x1="9.8" y1="17.1" x2="8.5" y2="20.5" />
      </g>
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
 * Logo officiel DeepSeek (baleine / nageoire bleue)
 */
export function DeepSeekIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#1E88E5" className={className} aria-hidden="true">
      <path d="M12 3C7.03 3 3 7.03 3 12c0 2.12.74 4.07 1.97 5.61L3.5 21l3.5-.97C8.47 20.61 10.18 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1.5 5.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S9 10.83 9 10s.67-1.5 1.5-1.5zm6 7c-1.18 1.52-3 2.5-5.04 2.5-1.07 0-2.07-.27-2.96-.75l-.46-.27-1.54.43.43-1.54-.27-.46C6.27 14.57 6 13.57 6 12.5c0-3.03 2.47-5.5 5.5-5.5s5.5 2.47 5.5 5.5c0 1.07-.31 2.07-.84 2.92l.34.58z" />
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
