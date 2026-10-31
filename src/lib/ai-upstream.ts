import type { AiConfig } from "@/lib/ai-config";
import { SYSTEM_PROMPT } from "@/lib/ui-prompt";

export type UpstreamMessage = {
  role: "user" | "assistant";
  content: string;
};

export class UpstreamError extends Error {
  status: number;
  detail: string;

  constructor(message: string, status = 502, detail = "") {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
    this.detail = detail;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textFromContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        const record = asRecord(part);
        return typeof record?.text === "string" ? record.text : "";
      })
      .join("");
  }
  return "";
}

/**
 * L'endpoint France Student utilise le format OpenAI Responses. Il ne conserve
 * que le dernier message user : on lui transmet donc l'historique et les
 * instructions dans un seul message, pour rester sans état côté serveur.
 */
export function buildConversationPrompt(messages: UpstreamMessage[]) {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    throw new UpstreamError("La dernière demande doit être un message utilisateur.", 400);
  }

  const history = messages.slice(0, -1);
  const transcript = history
    .map((message) => {
      const label = message.role === "user" ? "Étudiant" : "Assistant";
      return `${label} :\n${message.content}`;
    })
    .join("\n\n");

  return [
    "<instructions>",
    SYSTEM_PROMPT,
    "</instructions>",
    "---",
    "## Contexte de la conversation",
    transcript || "(Aucun échange précédent.)",
    "---",
    "## Nouvelle demande de l'étudiant",
    last.content,
    "---",
    "Rappel : réponds uniquement avec l'objet JSON conforme au schéma, sans texte autour.",
  ].join("\n\n");
}

async function safeText(response: Response) {
  try {
    return (await response.text()).trim();
  } catch {
    return "";
  }
}

function extractDetail(raw: string) {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw) as unknown;
    const record = asRecord(parsed);
    const error = asRecord(record?.error);
    if (typeof error?.message === "string") return error.message.slice(0, 400);
    if (typeof record?.message === "string") return record.message.slice(0, 400);
  } catch {
    // Pas du JSON : on nettoie le texte brut.
  }
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
}

function friendlyError(status: number, detail: string) {
  const suffix = detail ? ` Détail : ${detail}` : "";
  switch (status) {
    case 400:
      return `La requête n'a pas été acceptée par France Student.${suffix}`;
    case 401:
      return "Votre clé API France Student a été refusée. Vérifiez-la ou générez-en une nouvelle depuis votre compte.";
    case 402:
      return "Le budget API de votre compte France Student est épuisé.";
    case 403:
      return "Votre compte France Student n'a pas accès à ce modèle ou à cette fonctionnalité.";
    case 404:
      return "Le modèle demandé est introuvable. Choisissez un autre modèle dans les réglages.";
    case 429:
      return "La limite de débit de l'Offre IA est atteinte. Patientez quelques instants avant de réessayer.";
    default:
      if (status >= 500) {
        return `France Student rencontre une erreur (${status}). Réessayez dans un instant.${suffix}`;
      }
      return `France Student a répondu avec le statut ${status}.${suffix}`;
  }
}

async function requestResponse(
  config: AiConfig,
  prompt: string,
  signal: AbortSignal,
  stream: boolean
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: stream ? "text/event-stream, application/json" : "application/json",
  };
  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(`${config.baseUrl}/responses`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      input: [{ role: "user", content: prompt }],
      stream,
    }),
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await safeText(response);
    throw new UpstreamError(
      friendlyError(response.status, extractDetail(detail)),
      response.status,
      detail
    );
  }

  return response;
}

/**
 * Ouvre le flux de génération France Student.
 */
export async function openChatCompletion(
  config: AiConfig,
  messages: UpstreamMessage[],
  signal: AbortSignal
) {
  return requestResponse(config, buildConversationPrompt(messages), signal, true);
}

type SseEvent = {
  event: string;
  data: string;
};

type ParsedSseEvent = {
  delta?: string;
  final?: string;
  chatId?: string;
  done?: boolean;
};

function parseSseBlock(block: string): SseEvent | null {
  const lines = block.split(/\r?\n/);
  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data: ")) {
      dataLines.push(line.slice(6));
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5));
    }
  }

  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}

async function* readSse(response: Response): AsyncGenerator<SseEvent> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");

      let separator = buffer.indexOf("\n\n");
      while (separator !== -1) {
        const block = buffer.slice(0, separator);
        buffer = buffer.slice(separator + 2);

        const event = parseSseBlock(block);
        if (event) yield event;

        separator = buffer.indexOf("\n\n");
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      const event = parseSseBlock(buffer);
      if (event) yield event;
    }
  } finally {
    reader.releaseLock();
  }
}

function extractResponseText(record: Record<string, unknown> | null): string {
  if (!record) return "";

  if (typeof record.output_text === "string" && record.output_text) {
    return record.output_text;
  }

  const message = asRecord(record.message);
  if (message) {
    const content = textFromContent(message.content);
    if (content) return content;
  }

  const output = record.output;
  if (Array.isArray(output)) {
    const text = output
      .map((item) => {
        const itemRecord = asRecord(item);
        if (!itemRecord) return "";
        if (itemRecord.type === "message") {
          return textFromContent(itemRecord.content);
        }
        return typeof itemRecord.text === "string" ? itemRecord.text : "";
      })
      .join("");
    if (text) return text;
  }

  if (typeof record.content === "string" && record.content) {
    return record.content;
  }

  const choices = record.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const choice = asRecord(choices[0]);
    const choiceMessage = asRecord(choice?.message);
    if (choiceMessage) {
      const content = textFromContent(choiceMessage.content);
      if (content) return content;
    }
  }

  return "";
}

function parseSseEvent(event: SseEvent): ParsedSseEvent {
  const trimmedData = event.data.trim();
  if (trimmedData === "[DONE]" || trimmedData === "DONE") return { done: true };

  let parsed: unknown;
  try {
    parsed = JSON.parse(event.data) as unknown;
  } catch {
    // Si ce n'est pas du JSON, mais du texte brut envoyé par un provider SSE
    if (trimmedData === "[DONE]" || trimmedData === "DONE") return { done: true };
    if (trimmedData) {
      return { delta: event.data };
    }
    return {};
  }

  const record = asRecord(parsed);
  if (!record) {
    if (typeof parsed === "string" && parsed) {
      return { delta: parsed };
    }
    return {};
  }

  const type = typeof record.type === "string" ? record.type : event.event;
  const chatId =
    typeof record.chat_id === "string"
      ? record.chat_id
      : typeof record.chatId === "string"
        ? record.chatId
        : typeof record.conversation_id === "string"
          ? record.conversation_id
          : typeof record.conversationId === "string"
            ? record.conversationId
            : typeof record.id === "string" && (record.id.startsWith("chat") || record.id.startsWith("conv"))
              ? record.id
              : undefined;

  const errorRecord = asRecord(record.error);
  const responseRecord = asRecord(record.response);
  const responseError = asRecord(responseRecord?.error);

  if (
    type === "error" ||
    type === "response.failed" ||
    type === "response.error" ||
    errorRecord ||
    responseError
  ) {
    const message =
      (typeof record.message === "string" && record.message) ||
      (typeof errorRecord?.message === "string" && errorRecord.message) ||
      (typeof responseError?.message === "string" && responseError.message) ||
      "France Student a interrompu la génération.";
    throw new UpstreamError(message.slice(0, 400), 502, message);
  }

  // 1. Format OpenAI /responses (France Student Responses API)
  if (type === "response.output_text.delta") {
    const delta =
      typeof record.delta === "string"
        ? record.delta
        : typeof record.text === "string"
          ? record.text
          : "";
    if (delta) return { delta, chatId };
  }

  if (type === "response.output_text.done") {
    const text = typeof record.text === "string" ? record.text : "";
    if (text) return { final: text, chatId };
  }

  // 2. Format OpenAI standard Chat Completions (choices[0].delta)
  const choices = Array.isArray(record.choices) ? record.choices : null;
  if (choices && choices.length > 0) {
    const firstChoice = asRecord(choices[0]);
    const deltaObj = asRecord(firstChoice?.delta);
    const finishReason = firstChoice?.finish_reason;

    if (deltaObj) {
      const deltaContent =
        typeof deltaObj.content === "string"
          ? deltaObj.content
          : typeof deltaObj.text === "string"
            ? deltaObj.text
            : "";
      if (deltaContent) {
        return { delta: deltaContent, chatId, done: finishReason === "stop" };
      }
    }

    if (typeof firstChoice?.text === "string" && firstChoice.text) {
      return { delta: firstChoice.text, chatId, done: finishReason === "stop" };
    }

    if (finishReason === "stop") {
      return { done: true, chatId };
    }
  }

  // 3. Format Anthropic Claude streaming (content_block_delta)
  if (type === "content_block_delta" || type === "text_delta") {
    const deltaObj = asRecord(record.delta);
    const text =
      typeof deltaObj?.text === "string"
        ? deltaObj.text
        : typeof record.text === "string"
          ? record.text
          : "";
    if (text) return { delta: text, chatId };
  }

  if (
    type === "message_stop" ||
    (type === "message_delta" && Boolean(asRecord(record.delta)?.stop_reason))
  ) {
    return { done: true, chatId };
  }

  // 4. Format Google Gemini streaming
  const candidates = Array.isArray(record.candidates) ? record.candidates : null;
  if (candidates && candidates.length > 0) {
    const first = asRecord(candidates[0]);
    const content = asRecord(first?.content);
    const parts = Array.isArray(content?.parts) ? content.parts : null;
    if (parts && parts.length > 0) {
      const partObj = asRecord(parts[0]);
      if (typeof partObj?.text === "string" && partObj.text) {
        return { delta: partObj.text, chatId, done: first?.finishReason === "STOP" };
      }
    }
    if (first?.finishReason === "STOP") {
      return { done: true, chatId };
    }
  }

  // 5. Formats génériques / France Student /chats/stream
  if (typeof record.delta === "string" && record.delta) {
    return { delta: record.delta, chatId };
  }
  if (typeof record.text === "string" && record.text && type !== "response.output_text.done") {
    return { delta: record.text, chatId };
  }
  if (typeof record.content === "string" && record.content) {
    return { delta: record.content, chatId };
  }
  if (typeof record.chunk === "string" && record.chunk) {
    return { delta: record.chunk, chatId };
  }

  // 6. Événements de fin de génération
  if (
    type === "completed" ||
    type === "response.completed" ||
    type === "done" ||
    record.done === true ||
    record.is_done === true
  ) {
    const final =
      extractResponseText(responseRecord) ||
      extractResponseText(record) ||
      extractResponseText(asRecord(record.message));
    return { final: final || undefined, done: true, chatId };
  }

  return chatId ? { chatId } : {};
}

async function* readSseText(text: string): AsyncGenerator<SseEvent> {
  for (const block of text.replace(/\r\n/g, "\n").split("\n\n")) {
    const event = parseSseBlock(block);
    if (event) yield event;
  }
}

/**
 * Lit une réponse France Student, en SSE ou en JSON complet.
 * `onChatId` est appelé dès qu'un identifiant de conversation distante apparaît.
 */
export async function* readChatCompletion(
  response: Response,
  options?: { onChatId?: (chatId: string) => void }
): AsyncGenerator<string> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("text/event-stream")) {
    let sawDelta = false;

    for await (const event of readSse(response)) {
      const result = parseSseEvent(event);
      if (result.chatId) options?.onChatId?.(result.chatId);

      if (result.delta) {
        sawDelta = true;
        yield result.delta;
      }

      if (result.final && !sawDelta) {
        sawDelta = true;
        yield result.final;
      }

      if (result.done) return;
    }

    return;
  }

  const text = (await response.text()).trim();
  if (!text) {
    throw new UpstreamError("France Student a renvoyé une réponse vide.", 502);
  }

  if (text.startsWith("data:")) {
    let sawDelta = false;

    for await (const event of readSseText(text)) {
      const result = parseSseEvent(event);
      if (result.chatId) options?.onChatId?.(result.chatId);

      if (result.delta) {
        sawDelta = true;
        yield result.delta;
      }

      if (result.final && !sawDelta) {
        sawDelta = true;
        yield result.final;
      }

      if (result.done) return;
    }

    return;
  }

  try {
    const parsed = JSON.parse(text) as unknown;
    const content = extractResponseText(asRecord(parsed));
    if (content) {
      yield content;
      return;
    }
    throw new UpstreamError("France Student a renvoyé un JSON sans contenu texte.", 502);
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    throw new UpstreamError("France Student a renvoyé une réponse illisible.", 502);
  }
}

/**
 * Vérifie une clé et un modèle avec un échange minimal. Le flux est interrompu
 * dès le premier texte reçu : l'objectif est de valider l'authentification,
 * pas de générer une réponse complète.
 */
export async function testConnection(config: AiConfig): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await requestResponse(
      config,
      "Réponds uniquement par le mot OK.",
      controller.signal,
      true
    );

    for await (const delta of readChatCompletion(response)) {
      if (delta) break;
    }
  } catch (error) {
    if (controller.signal.aborted) {
      throw new UpstreamError(
        "La vérification de la clé a expiré (30 s). Vérifiez votre connexion et réessayez.",
        504
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
