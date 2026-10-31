export type AiMode = "unconfigured" | "live";
export type AiSource = "server" | "client" | "none";

export type AiConfig = {
  mode: AiMode;
  apiKey?: string;
  baseUrl: string;
  model: string;
  source: AiSource;
};

export type AiModelOption = {
  id: string;
  label: string;
  hint: string;
  tier: "economique" | "equilibre" | "qualite";
  category?: string;
  agentId?: number;
};

export type PublicAiConfig = {
  mode: AiMode;
  serverConfigured: boolean;
  model: string;
  baseUrlHost: string;
  provider: "France Student";
  models: AiModelOption[];
};

export type AccountUser = {
  id?: number;
  name: string;
  email: string;
  avatar?: string | null;
};

export type ClientKeySession = {
  kind: "key";
  apiKey: string;
  model: string;
};

export type AccountSession = {
  kind: "account";
  model: string;
  user: AccountUser;
};

export type ClientAiSession = ClientKeySession | AccountSession;

export type AccountSessionInfo = {
  connected: boolean;
  user?: AccountUser;
  defaultModel?: string;
  expired?: boolean;
  warning?: string;
};

export const DEFAULT_MODEL = "gpt-6-luna";
export const DEFAULT_BASE_URL = "https://api.francestudent.ai/v1";

/**
 * Les 13 modèles officiels réels extraits directement de l'interface F12 de ia.francestudent.org
 * avec leurs identifiants d'agent réels (-1001, -1002, -1003, -1005, -2001, -2002, -2003, -2004, -3001, -3002, 64, 65, 66).
 */
export const CURATED_MODELS: AiModelOption[] = [
  // --- OpenAI GPT-6 ---
  {
    id: "gpt-6-luna",
    label: "GPT 6 Luna",
    hint: "OpenAI · Rapide et économique (par défaut)",
    tier: "economique",
    category: "OpenAI GPT-6",
    agentId: -1002,
  },
  {
    id: "gpt-6.1-terra",
    label: "GPT-6.1 Terra",
    hint: "OpenAI · Équilibré et récent",
    tier: "equilibre",
    category: "OpenAI GPT-6",
    agentId: -1005,
  },
  {
    id: "gpt-6.1-sol",
    label: "GPT 6.1 Sol",
    hint: "OpenAI · Raisonnement avancé & synthèse",
    tier: "qualite",
    category: "OpenAI GPT-6",
    agentId: -1003,
  },
  {
    id: "gpt-6-sol",
    label: "GPT 6 Sol",
    hint: "OpenAI · Raisonnement supérieur",
    tier: "qualite",
    category: "OpenAI GPT-6",
    agentId: -1001,
  },

  // --- Anthropic Claude ---
  {
    id: "claude-haiku-5-5",
    label: "Claude Haiku 5.5",
    hint: "Anthropic · Rapide, à l'aise en rédaction",
    tier: "economique",
    category: "Anthropic Claude",
    agentId: -2002,
  },
  {
    id: "claude-sonnet-5-5",
    label: "Claude Sonnet 5.5",
    hint: "Anthropic · Qualité de raisonnement supérieure",
    tier: "qualite",
    category: "Anthropic Claude",
    agentId: -2003,
  },
  {
    id: "claude-opus-5-5",
    label: "Claude Opus 5.5",
    hint: "Anthropic · Raisonnement approfondi",
    tier: "qualite",
    category: "Anthropic Claude",
    agentId: -2001,
  },
  {
    id: "claude-fable-5-1",
    label: "Claude Fable 5.1",
    hint: "Anthropic · Multimodal créatif & précis",
    tier: "qualite",
    category: "Anthropic Claude",
    agentId: -2004,
  },

  // --- Google Gemini ---
  {
    id: "gemini-3.8-flash-tiered",
    label: "Gemini 3.8 Flash",
    hint: "Google Gemini · Vitesse ultra-rapide",
    tier: "economique",
    category: "Google Gemini",
    agentId: -3002,
  },
  {
    id: "gemini-pro-agent",
    label: "Gemini 3.1 Pro",
    hint: "Google Gemini · Raisonnement et multimodal",
    tier: "qualite",
    category: "Google Gemini",
    agentId: -3001,
  },

  // --- OpenAI GPT-5.6 ---
  {
    id: "gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    hint: "OpenAI · Bon compromis vitesse/coût",
    tier: "economique",
    category: "OpenAI GPT-5.6",
    agentId: 65,
  },
  {
    id: "gpt-5.6-terra",
    label: "GPT-5.6 Terra",
    hint: "OpenAI · Polyvalent et stable",
    tier: "equilibre",
    category: "OpenAI GPT-5.6",
    agentId: 66,
  },
  {
    id: "gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    hint: "OpenAI · Raisonnement complet",
    tier: "qualite",
    category: "OpenAI GPT-5.6",
    agentId: 64,
  },
];

function cleanKey(raw: string | undefined) {
  const value = raw?.trim();
  if (!value || value.length > 500) return undefined;
  // Une clé API est un jeton ASCII imprimable, sans espace ni saut de ligne.
  if (!/^[\x21-\x7E]+$/.test(value)) return undefined;
  return value;
}

function cleanModel(raw: string | undefined) {
  const value = raw?.trim();
  if (!value || value.length > 120) return undefined;
  if (!/^[a-zA-Z0-9._/-]+$/.test(value)) return undefined;
  return value;
}

function normalizeBaseUrl(raw: string | undefined) {
  const value = raw?.trim();
  if (!value) return null;
  return value.replace(/\/+$/, "");
}

/**
 * Configuration lue uniquement côté serveur. La clé API ne doit jamais
 * traverser la frontière client, sauf lorsqu'un utilisateur fournit la sienne
 * pour la durée de son onglet.
 */
export function getAiConfig(overrides?: {
  apiKey?: string;
  model?: string;
}): AiConfig {
  const clientKey = cleanKey(overrides?.apiKey);
  const serverKey =
    cleanKey(process.env.FRANCESTUDENT_API_KEY) ?? cleanKey(process.env.AI_API_KEY);
  const apiKey = clientKey ?? serverKey;

  const explicitBaseUrl = normalizeBaseUrl(
    process.env.FRANCESTUDENT_BASE_URL ?? process.env.AI_BASE_URL
  );
  const baseUrl = explicitBaseUrl ?? DEFAULT_BASE_URL;

  const model =
    cleanModel(overrides?.model) ??
    cleanModel(process.env.FRANCESTUDENT_MODEL) ??
    cleanModel(process.env.AI_MODEL) ??
    DEFAULT_MODEL;

  // En production avec l'API France Student, le mode live nécessite
  // impérativement une clé API réelle (serveur ou client).
  const configured = Boolean(apiKey);

  return {
    mode: configured ? "live" : "unconfigured",
    apiKey,
    baseUrl,
    model,
    source: clientKey ? "client" : serverKey ? "server" : "none",
  };
}

export function getPublicAiConfig(): PublicAiConfig {
  const config = getAiConfig();

  let baseUrlHost = "api.francestudent.ai";
  try {
    baseUrlHost = new URL(config.baseUrl).host;
  } catch {
    baseUrlHost = config.baseUrl;
  }

  return {
    mode: config.mode,
    serverConfigured: config.mode === "live",
    model: config.model,
    baseUrlHost,
    provider: "France Student",
    models: CURATED_MODELS,
  };
}

export function isValidModelId(id: string | null | undefined): boolean {
  if (!id) return false;
  const cleaned = cleanModel(id);
  return Boolean(cleaned && cleaned === id.trim());
}

export function getModelDisplayName(modelId?: string | null): string {
  if (!modelId) return "GPT 6 Luna";
  const found = CURATED_MODELS.find(
    (m) => m.id.toLowerCase() === modelId.toLowerCase()
  );
  if (found) return found.label;
  return modelId;
}
