"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Menu, Palette, Settings2 } from "lucide-react";
import {
  CURATED_MODELS,
  DEFAULT_MODEL,
  isValidModelId,
  type AccountSession,
  type AccountSessionInfo,
  type AiMode,
  type ClientAiSession,
  type ClientKeySession,
  type PublicAiConfig,
} from "@/lib/ai-config";
import type { ChatMessage, Conversation } from "@/lib/chat-types";
import { parsePartialUI } from "@/lib/partial-ui";
import { SITE } from "@/lib/site";
import { createId, truncate } from "@/lib/utils";
import { BrandMark } from "@/features/chat/brand";
import { Sidebar } from "@/features/chat/sidebar";
import { EmptyState } from "@/features/chat/empty-state";
import { MessageItem } from "@/features/chat/message-item";
import { Composer } from "@/features/chat/composer";
import { SettingsDialog } from "@/features/settings/settings-dialog";
import { OnboardingModal, shouldShowOnboarding } from "@/features/onboarding";
import { getTheme, THEME_STORAGE_KEY, type ThemeId } from "@/lib/themes";
import type { SettingsTabId } from "@/features/settings/settings-navigation";

const KEY_SESSION_STORAGE_KEY = "france-student:intelligent-ui:session:v1";
const ACCOUNT_MODEL_STORAGE_KEY = "france-student:intelligent-ui:account-model:v1";

function readStoredKeySession(): ClientKeySession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(KEY_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ClientKeySession> | null;
    const apiKey = typeof parsed?.apiKey === "string" ? parsed.apiKey.trim() : "";
    const model = typeof parsed?.model === "string" ? parsed.model.trim() : "";

    if (!apiKey || !model || apiKey.length > 500 || model.length > 120) return null;
    return { kind: "key", apiKey, model };
  } catch {
    return null;
  }
}

function storeKeySession(session: ClientKeySession | null) {
  try {
    if (session) {
      window.sessionStorage.setItem(KEY_SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.sessionStorage.removeItem(KEY_SESSION_STORAGE_KEY);
    }
  } catch {
    // Le stockage peut Ãªtre bloquÃ© (navigation privÃ©e, politique du navigateur).
  }
}

function readStoredAccountModel(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const model = window.localStorage.getItem(ACCOUNT_MODEL_STORAGE_KEY)?.trim();
    return model && isValidModelId(model) ? model : null;
  } catch {
    return null;
  }
}

function storeAccountModel(model: string) {
  try {
    if (isValidModelId(model)) {
      window.localStorage.setItem(ACCOUNT_MODEL_STORAGE_KEY, model);
    }
  } catch {
    // Le stockage peut Ãªtre bloquÃ©.
  }
}

type ChatEvent =
  | { type: "meta"; mode: AiMode; model: string; source?: string }
  | { type: "chat"; chatId: string }
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

function newConversation(): Conversation {
  return {
    id: createId("conv"),
    title: "Nouvelle discussion",
    messages: [],
    createdAt: Date.now(),
  };
}

// Identifiant fixe pour la conversation initiale : Ã©vite d'Ã©valuer une valeur
// alÃ©atoire pendant le prerender. Les identifiants suivants sont crÃ©Ã©s dans des
// gestionnaires d'Ã©vÃ©nements, aprÃ¨s hydratation.
const INITIAL_CONVERSATION: Conversation = {
  id: "conv_initial",
  title: "Nouvelle discussion",
  messages: [],
  createdAt: 0,
};

function toApiMessages(messages: ChatMessage[]) {
  const relevant = messages.filter(
    (message) =>
      message.role === "user" ||
      (message.role === "assistant" && message.status === "done" && message.content.trim())
  );

  const selected: Array<{ role: "user" | "assistant"; content: string }> = [];
  let total = 0;

  for (let index = relevant.length - 1; index >= 0; index -= 1) {
    const message = relevant[index];
    const content = message.content.trim();
    if (!content) continue;
    if (selected.length >= 16 || total + content.length > 60000) break;
    selected.unshift({ role: message.role, content });
    total += content.length;
  }

  return selected;
}

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    INITIAL_CONVERSATION,
  ]);
  const [activeId, setActiveId] = useState<string>(INITIAL_CONVERSATION.id);
  const [streamingConversationId, setStreamingConversationId] = useState<string | null>(
    null
  );
  const [config, setConfig] = useState<PublicAiConfig | null>(null);
  const [keySession, setKeySession] = useState<ClientKeySession | null>(null);
  const [account, setAccount] = useState<AccountSession | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTabId>("appearance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stickToBottom, setStickToBottom] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>("clair");
  const [draftPrompt, setDraftPrompt] = useState<string | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (shouldShowOnboarding()) {
      setOnboardingOpen(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (saved) setCurrentTheme(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const theme = getTheme(currentTheme);
    const root = document.documentElement;
    root.style.setProperty("--theme-canvas", theme.colors.canvas);
    root.style.setProperty("--theme-panel", theme.colors.panel);
    root.style.setProperty("--theme-card", theme.colors.card);
    root.style.setProperty("--theme-raised", theme.colors.raised);
    root.style.setProperty("--theme-line", theme.colors.line);
    root.style.setProperty("--theme-ink", theme.colors.ink);
    root.style.setProperty("--theme-muted", theme.colors.muted);
    root.style.setProperty("--theme-faint", theme.colors.faint);
    root.style.setProperty("--theme-accent", theme.colors.accent);
    root.style.setProperty("--theme-accent-strong", theme.colors.accentStrong);
    root.style.setProperty("--theme-accent-soft", theme.colors.accentSoft);
    root.style.setProperty("--theme-sidebar", theme.colors.sidebarBg);
    root.style.setProperty("--theme-bg-gradient", theme.colors.bgGradient);
    const isLight = theme.category === "light";
    root.style.colorScheme = isLight ? "light" : "dark";
    root.classList.toggle("dark", !isLight);
    root.classList.toggle("light", isLight);
    root.setAttribute("data-theme", currentTheme);
    document.body.style.backgroundColor = theme.colors.canvas;
    document.body.style.color = theme.colors.ink;
    window.localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  }, [currentTheme]);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ??
    conversations[0];

  const activeMessages = useMemo(
    () => activeConversation?.messages ?? [],
    [activeConversation]
  );
  const session: ClientAiSession | null = account ?? keySession;
  const isStreaming = streamingConversationId !== null;
  const isConfigured = Boolean(session || config?.serverConfigured);
  const effectiveMode: AiMode = isConfigured ? "live" : "unconfigured";
  const effectiveModel = session?.model ?? config?.model ?? DEFAULT_MODEL;

  useEffect(() => {
    setKeySession(readStoredKeySession());

    let cancelled = false;
    fetch("/api/auth/francestudent/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: AccountSessionInfo | null) => {
        if (cancelled || !data?.connected || !data.user) return;

        const storedModel = readStoredAccountModel();
        setKeySession(null);
        storeKeySession(null);
        setAccount({
          kind: "account",
          model: storedModel ?? data.defaultModel ?? DEFAULT_MODEL,
          user: data.user,
        });
      })
      .catch(() => {
        // La session compte est facultative : le mode clÃ© reste disponible.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/config", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: PublicAiConfig) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) {
          setConfig({
            mode: "unconfigured",
            serverConfigured: false,
            model: DEFAULT_MODEL,
            baseUrlHost: "api.francestudent.ai",
            provider: "France Student",
            models: CURATED_MODELS,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    if (!stickToBottom) return;
    scrollToBottom(isStreaming ? "auto" : "smooth");
  }, [activeMessages, activeId, isStreaming, scrollToBottom, stickToBottom]);

  const runCompletion = useCallback(
    async (
      conversationId: string,
      history: ChatMessage[],
      options: { remoteChatId?: string; restart?: boolean } = {}
    ) => {
      if (abortRef.current) return;

      const controller = new AbortController();
      abortRef.current = controller;
      setStreamingConversationId(conversationId);

      const assistantId = createId("msg");
      const placeholder: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        status: "streaming",
        mode: effectiveMode,
        model: effectiveModel,
      };

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, messages: [...conversation.messages, placeholder] }
            : conversation
        )
      );

      let raw = "";
      let streamError: string | null = null;
      let streamFinished = false;

      const updateAssistant = (updater: (message: ChatMessage) => ChatMessage) => {
        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  messages: conversation.messages.map((message) =>
                    message.id === assistantId ? updater(message) : message
                  ),
                }
              : conversation
          )
        );
      };

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: toApiMessages(history),
            apiKey: session?.kind === "key" ? session.apiKey : undefined,
            model: session?.model,
            chatId: options.remoteChatId,
            resetChat: options.restart && Boolean(options.remoteChatId),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
            code?: string;
          } | null;
          if (
            response.status === 401 &&
            session?.kind === "account" &&
            data?.code === "session_expired"
          ) {
            setAccount(null);
          }
          throw new Error(data?.error ?? `Erreur serveur (${response.status}).`);
        }

        if (!response.body) {
          throw new Error("Le serveur n'a pas renvoyé de flux de réponse.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const handleLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) return false;

          const payload = trimmed.slice(5).trim();
          if (!payload) return false;

          let event: ChatEvent;
          try {
            event = JSON.parse(payload) as ChatEvent;
          } catch {
            return false;
          }

          if (event.type === "meta") {
            updateAssistant((message) => ({
              ...message,
              mode: event.mode,
              model: event.model || message.model || effectiveModel,
            }));
            return false;
          }

          if (event.type === "chat") {
            setConversations((previous) =>
              previous.map((conversation) =>
                conversation.id === conversationId
                  ? { ...conversation, remoteChatId: event.chatId }
                  : conversation
              )
            );
            return false;
          }

          if (event.type === "delta") {
            raw += event.text;
            // On accumule dans raw sans mettre à jour content en continu :
            // la réponse finale apparaîtra en 1 seule fois à la fin de manière animée et stylisée !
            return false;
          }

          if (event.type === "error") {
            streamError = event.message;
            return true;
          }

          if (event.type === "done") {
            return true;
          }

          return false;
        };

        while (!streamFinished) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          buffer = buffer.replace(/\r\n/g, "\n");

          let separator = buffer.indexOf("\n\n");
          while (separator !== -1) {
            const chunk = buffer.slice(0, separator);
            buffer = buffer.slice(separator + 2);

            for (const line of chunk.split("\n")) {
              if (handleLine(line)) {
                streamFinished = true;
                break;
              }
            }

            if (streamFinished) break;
            separator = buffer.indexOf("\n\n");
          }
        }

        if (!streamFinished && buffer.trim()) {
          for (const line of buffer.split("\n")) {
            if (handleLine(line)) {
              streamFinished = true;
              break;
            }
          }
        }

        if (streamFinished) {
          await reader.cancel().catch(() => undefined);
        }

        if (streamError) {
          throw new Error(streamError);
        }

        const parsed = parsePartialUI(raw);
        if (parsed.blocks.length === 0) {
          const fallback = raw.trim();
          if (!fallback) {
            updateAssistant((message) => ({
              ...message,
              status: "error",
              error: "Le modèle a renvoyé une réponse vide.",
            }));
          } else {
            updateAssistant((message) => ({
              ...message,
              content: raw,
              status: "done",
              fallback,
              incomplete: false,
            }));
          }
        } else {
          updateAssistant((message) => ({
            ...message,
            content: raw,
            status: "done",
            incomplete: !parsed.complete,
          }));
        }
      } catch (error) {
        if (controller.signal.aborted) {
          updateAssistant((message) => ({
            ...message,
            content: raw,
            status: "done",
            stopped: true,
            incomplete: false,
          }));
        } else {
          updateAssistant((message) => ({
            ...message,
            content: raw,
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Une erreur inattendue est survenue.",
          }));
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        setStreamingConversationId((current) =>
          current === conversationId ? null : current
        );
      }
    },
    [effectiveMode, session]
  );

  const sendMessage = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content || abortRef.current) return;

      if (!session && !config?.serverConfigured) {
        setSettingsOpen(true);
        return;
      }

      const conversation = activeConversation;
      if (!conversation) return;

      const userMessage: ChatMessage = {
        id: createId("msg"),
        role: "user",
        content,
        status: "done",
      };

      const history = [...conversation.messages, userMessage];

      setConversations((previous) =>
        previous.map((item) =>
          item.id === conversation.id
            ? {
                ...item,
                title:
                  item.messages.length === 0 ? truncate(content, 48) : item.title,
                messages: history,
              }
            : item
        )
      );

      setStickToBottom(true);
      void runCompletion(conversation.id, history, {
        remoteChatId: conversation.remoteChatId,
      });
    },
    [activeConversation, config?.serverConfigured, runCompletion, session]
  );

  const retryMessage = useCallback(
    (messageId: string) => {
      if (abortRef.current) return;

      const conversation = conversations.find((item) =>
        item.messages.some((message) => message.id === messageId)
      );
      if (!conversation) return;

      const index = conversation.messages.findIndex(
        (message) => message.id === messageId
      );
      if (index < 0) return;

      const history = conversation.messages
        .slice(0, index)
        .filter((message) => message.status !== "error");

      if (!history.some((message) => message.role === "user")) return;

      setConversations((previous) =>
        previous.map((item) =>
          item.id === conversation.id
            ? {
                ...item,
                messages: item.messages.filter((message) => message.id !== messageId),
              }
            : item
        )
      );

      setStickToBottom(true);
      void runCompletion(conversation.id, history, {
        remoteChatId: conversation.remoteChatId,
        restart: true,
      });
    },
    [conversations, runCompletion]
  );

  const regenerateMessage = useCallback(
    (messageId: string) => {
      if (abortRef.current) return;

      const conversation = conversations.find((item) =>
        item.messages.some((message) => message.id === messageId)
      );
      if (!conversation) return;

      const index = conversation.messages.findIndex(
        (message) => message.id === messageId
      );
      if (index < 0) return;

      const history = conversation.messages.slice(0, index);
      if (!history.some((message) => message.role === "user")) return;

      setConversations((previous) =>
        previous.map((item) =>
          item.id === conversation.id
            ? { ...item, messages: item.messages.slice(0, index) }
            : item
        )
      );

      setStickToBottom(true);
      void runCompletion(conversation.id, history, {
        remoteChatId: conversation.remoteChatId,
        restart: true,
      });
    },
    [conversations, runCompletion]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const startNewConversation = useCallback(() => {
    abortRef.current?.abort();

    if (activeConversation && activeConversation.messages.length === 0) {
      setSidebarOpen(false);
      return;
    }

    const conversation = newConversation();
    setConversations((previous) => [conversation, ...previous]);
    setActiveId(conversation.id);
    setStickToBottom(true);
  }, [activeConversation]);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
    setStickToBottom(true);
  }, []);

  const deleteRemoteChat = useCallback((chatId: string) => {
    void fetch("/api/chats/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId }),
    }).catch(() => undefined);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      if (streamingConversationId === id) {
        abortRef.current?.abort();
      }

      const target = conversations.find((conversation) => conversation.id === id);
      if (target?.remoteChatId) deleteRemoteChat(target.remoteChatId);

      const remaining = conversations.filter(
        (conversation) => conversation.id !== id
      );

      if (remaining.length === 0) {
        const conversation = newConversation();
        setConversations([conversation]);
        setActiveId(conversation.id);
        return;
      }

      setConversations(remaining);
      if (id === activeId) {
        setActiveId(remaining[0].id);
      }
    },
    [activeId, conversations, deleteRemoteChat, streamingConversationId]
  );

  const clearAll = useCallback(() => {
    abortRef.current?.abort();
    for (const conversation of conversations) {
      if (conversation.remoteChatId) deleteRemoteChat(conversation.remoteChatId);
    }
    const conversation = newConversation();
    setConversations([conversation]);
    setActiveId(conversation.id);
    setStickToBottom(true);
  }, [conversations, deleteRemoteChat]);

  const openSettingsTab = useCallback((tab: SettingsTabId = "appearance") => {
    setSettingsTab(tab);
    setSettingsOpen(true);
    setSidebarOpen(false);
  }, []);

  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const connectKeySession = useCallback((next: ClientKeySession) => {
    setAccount(null);
    setKeySession(next);
    storeKeySession(next);
  }, []);

  const disconnectKeySession = useCallback(() => {
    setKeySession(null);
    storeKeySession(null);
  }, []);

  const connectAccountSession = useCallback((next: AccountSession) => {
    setKeySession(null);
    storeKeySession(null);
    setAccount(next);
    storeAccountModel(next.model);
  }, []);

  const updateAccountModel = useCallback((nextModel: string) => {
    setAccount((current) => (current ? { ...current, model: nextModel } : current));
    storeAccountModel(nextModel);
  }, []);

  const disconnectAccountSession = useCallback(async () => {
    const remoteIds = conversations
      .map((conversation) => conversation.remoteChatId)
      .filter((chatId): chatId is string => Boolean(chatId));

    await Promise.allSettled(
      remoteIds.map((chatId) =>
        fetch("/api/chats/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId }),
        })
      )
    );

    await fetch("/api/auth/francestudent/logout", { method: "POST" }).catch(
      () => undefined
    );

    setAccount(null);
    setConversations((previous) =>
      previous.map((conversation) => ({
        ...conversation,
        remoteChatId: undefined,
      }))
    );
  }, [conversations]);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;
    const distance =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    setStickToBottom(distance < 100);
  };

  const lastAssistantId = useMemo(() => {
    for (let index = activeMessages.length - 1; index >= 0; index -= 1) {
      if (activeMessages[index].role === "assistant") {
        return activeMessages[index].id;
      }
    }
    return null;
  }, [activeMessages]);

  const isLive = effectiveMode === "live";

  return (
    <div className="flex h-dvh overflow-hidden bg-transparent text-ink">
      <Sidebar
        conversations={conversations}
        activeId={activeConversation?.id ?? ""}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNew={startNewConversation}
        onSelect={selectConversation}
        onDelete={deleteConversation}
        onOpenSettings={() => openSettingsTab("account")}
        onOpenAppearance={() => openSettingsTab("appearance")}
        onOpenProjects={() => openSettingsTab("projects")}
        config={config}
        session={session}
        mode={effectiveMode}
        model={effectiveModel}
        streamingConversationId={streamingConversationId}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-13 shrink-0 items-center gap-2 border-b border-line/60 bg-canvas/80 px-3 backdrop-blur-md sm:px-5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 items-center gap-2.5">
            <BrandMark size="sm" className="lg:hidden" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink sm:text-[13px]">
                {activeConversation?.title ?? "Nouvelle discussion"}
              </p>
              <p className="hidden text-[10px] text-faint sm:block">
                {activeMessages.length === 0
                  ? "Offre IA · studio visuel interactif"
                  : `${activeMessages.filter((message) => message.role === "user").length} ${
                      activeMessages.filter((message) => message.role === "user").length > 1
                        ? "questions"
                        : "question"
                    }`}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => openSettingsTab("appearance")}
              title={`Thème d'affichage : ${getTheme(currentTheme).name}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-card/60 px-2.5 py-1 text-[11px] font-medium text-muted transition-colors hover:border-line hover:bg-card hover:text-ink"
            >
              <Palette className="h-3 w-3 text-accent" />
              <span className="hidden sm:inline text-faint">Thème :</span>
              <span className="font-semibold text-ink">{getTheme(currentTheme).name}</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title={
                !isLive
                  ? "Non connecté — cliquer pour se connecter à France Student"
                  : session?.kind === "account"
                    ? `Compte France Student · ${effectiveModel}`
                    : session
                      ? `Clé API · ${effectiveModel}`
                      : `Connexion serveur · ${effectiveModel}`
              }
              className={
                !isLive
                  ? "inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.08] px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 transition-colors hover:bg-amber-500/15"
                  : "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/15"
              }
            >
              <span
                className={
                  !isLive
                    ? "h-1.5 w-1.5 rounded-full bg-amber-500"
                    : "h-1.5 w-1.5 rounded-full bg-green"
                }
              />
              <span className="font-semibold">{!isLive ? "Hors ligne" : "Connecté"}</span>
              <span className="hidden max-w-[120px] truncate font-normal opacity-70 sm:inline">
                · {!isLive ? "connexion requise" : effectiveModel}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Ouvrir les réglages"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-ink/[0.04] hover:text-ink"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <main className="relative min-h-0 flex-1">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto"
          >
            {activeMessages.length === 0 ? (
              <div className="min-h-full">
                <EmptyState
                  onPrompt={sendMessage}
                  onDraftPrompt={(promptBase) => setDraftPrompt(promptBase)}
                  onOpenSettings={() => setSettingsOpen(true)}
                  config={config}
                  session={session}
                  mode={effectiveMode}
                  model={effectiveModel}
                />
              </div>
            ) : (
              <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
                <div className="space-y-8">
                  {activeMessages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      activeModel={effectiveModel}
                      onPrompt={sendMessage}
                      onRetry={() => retryMessage(message.id)}
                      onRegenerate={() => regenerateMessage(message.id)}
                      canRegenerate={
                        message.role === "assistant" &&
                        message.id === lastAssistantId &&
                        message.status === "done" &&
                        !isStreaming
                      }
                      disabled={isStreaming}
                    />
                  ))}
                </div>
                <div ref={bottomRef} className="h-10 shrink-0" />
              </div>
            )}
          </div>

          {!stickToBottom && activeMessages.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setStickToBottom(true);
                scrollToBottom("smooth");
              }}
              className="absolute bottom-5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-accent/30 bg-panel/95 px-3.5 py-1.5 text-[11px] font-semibold text-accent shadow-xl backdrop-blur-md transition-all hover:border-accent hover:bg-accent/10 hover:shadow-2xl hover:-translate-y-0.5"
            >
              <ArrowDown className="h-3 w-3" />
              Dernier message
            </button>
          ) : null}
        </main>

        <Composer
          streaming={isStreaming}
          onSend={sendMessage}
          onStop={stopStreaming}
          currentModel={effectiveModel}
          onModelChange={(newModel) => {
            if (session?.kind === "account") {
              updateAccountModel(newModel);
            } else if (session?.kind === "key") {
              const updated = { ...session, model: newModel };
              setKeySession(updated);
              storeKeySession(updated);
            }
          }}
          availableModels={config?.models || CURATED_MODELS}
          draftPrompt={draftPrompt}
          onDraftHandled={() => setDraftPrompt(null)}
        />
      </div>

      {settingsOpen ? (
        <SettingsDialog
          onClose={closeSettings}
          config={config}
          session={session}
          mode={effectiveMode}
          model={effectiveModel}
          onConnectKey={connectKeySession}
          onDisconnectKey={disconnectKeySession}
          onConnectAccount={connectAccountSession}
          onDisconnectAccount={() => void disconnectAccountSession()}
          onAccountModelChange={updateAccountModel}
          onClearAll={clearAll}
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
          initialTab={settingsTab}
          conversations={conversations}
          onSelectConversation={setActiveId}
          onLaunchPrompt={sendMessage}
          onOpenOnboarding={() => setOnboardingOpen(true)}
        />
      ) : null}

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        user={account?.user ?? null}
        onConnectAccount={(user) => {
          setAccount({
            kind: "account",
            model: effectiveModel,
            user,
          });
        }}
        currentTheme={currentTheme}
        onThemeChange={(newTheme) => {
          setCurrentTheme(newTheme);
          try {
            window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
          } catch {
            // ignore
          }
        }}
      />
    </div>
  );
}
