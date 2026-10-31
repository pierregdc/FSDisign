import type { AiMode } from "@/lib/ai-config";

export type ChatStatus = "streaming" | "done" | "error";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: ChatStatus;
  mode?: AiMode;
  model?: string;
  error?: string;
  stopped?: boolean;
  incomplete?: boolean;
  fallback?: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  /** Identifiant de la conversation correspondante chez France Student. */
  remoteChatId?: string;
};
