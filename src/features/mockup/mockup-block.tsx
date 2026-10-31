"use client";

import { useState } from "react";
import {
  ArrowRight,
  Battery,
  ChevronRight,
  Layers,
  LayoutTemplate,
  Lock,
  Mail,
  Menu,
  MessageSquare,
  Monitor,
  Send,
  Smartphone,
  User,
  Wifi,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { CanvaToolbar, type VersionSnapshot } from "@/features/canva";
import { cn } from "@/lib/utils";

type MockupBlockData = Extract<UIBlock, { type: "mockup" }>;

export function MockupBlockView({ block }: { block: MockupBlockData }) {
  const [device, setDevice] = useState<"desktop" | "mobile" | "web" | "tablet">(block.device || "mobile");
  const [activeScreenId, setActiveScreenId] = useState<string>(
    block.activeScreenId || block.screens[0]?.id || "screen_1"
  );
  const [isWireframe, setIsWireframe] = useState(false);
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);

  // Messages d'interaction du prototype d'écran de chat
  const [prototypeChatMessages, setPrototypeChatMessages] = useState<Array<{ sender: string; text: string }>>([
    { sender: "user", text: "Bonjour, j'aimerais avoir des informations sur les bourses." },
    { sender: "assistant", text: "Bonjour ! Avec plaisir. Quelles sont vos questions ?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const currentScreen =
    block.screens.find((s) => s.id === activeScreenId) || block.screens[0];

  const handleNavigate = (targetScreenId?: string) => {
    if (targetScreenId && block.screens.some((s) => s.id === targetScreenId)) {
      setActiveScreenId(targetScreenId);
    }
  };

  const handleSendPrototypeChat = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setPrototypeChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userText },
      { sender: "assistant", text: `Message enregistré dans le prototype : "${userText}". Les modules interactifs sont opérationnels.` },
    ]);
    setChatInput("");
  };

  const mockupHtmlContent = `<div class="max-w-2xl mx-auto space-y-6">
    <div class="text-center">
      <h2 class="text-xl font-bold">${block.title || "Maquette d'interface"}</h2>
      <p class="text-xs text-slate-500">Format : ${device.toUpperCase()} · ${block.screens.length} écrans</p>
    </div>
    <div class="space-y-4">
      ${block.screens.map((screen) => `
        <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50">
          <div class="border-b border-slate-200 pb-2 mb-3">
            <h3 class="font-bold text-sm text-slate-800">${screen.name} (${screen.type})</h3>
            ${screen.subtitle ? `<p class="text-xs text-slate-500">${screen.subtitle}</p>` : ""}
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${screen.elements.map((el) => `
              <div class="p-3 rounded-lg border border-slate-200 bg-white text-xs">
                <span class="font-semibold text-slate-700">${el.label || el.kind}</span>
                ${el.value ? `<p class="text-slate-900 font-bold mt-0.5">${el.value}</p>` : ""}
                ${el.targetScreenId ? `<span class="inline-block mt-1 text-[10px] text-indigo-600 font-medium">Navigue vers → ${el.targetScreenId}</span>` : ""}
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  </div>`;

  return (
    <div className="space-y-3">
      {/* Barre d'outils Canva */}
      <CanvaToolbar
        title={block.title || `Maquette d'interface (${device})`}
        jsonData={block}
        htmlContent={mockupHtmlContent}
        versions={versions}
        onSaveVersion={(name) =>
          setVersions([
            { id: crypto.randomUUID(), name, timestamp: Date.now(), data: { activeScreenId, device } },
            ...versions,
          ])
        }
        onRestoreVersion={(v) => {
          const d = v.data as { activeScreenId: string; device: typeof device };
          if (d?.activeScreenId) setActiveScreenId(d.activeScreenId);
          if (d?.device) setDevice(d.device);
        }}
      />

      <div className="rounded-2xl border-0 bg-transparent p-0 sm:p-1 shadow-none">
        {/* En-tête */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4 text-accent" />
              <span>{block.title || "Prototype & Maquette d'interface interactive"}</span>
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Écran actif : <span className="font-semibold text-ink">{currentScreen?.name}</span> ({block.screens.length} écrans disponibles)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Wireframe */}
            <button
              type="button"
              onClick={() => setIsWireframe(!isWireframe)}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-medium transition-colors",
                isWireframe
                  ? "border-accent/40 bg-accent/10 text-accent font-semibold"
                  : "border-line bg-panel text-muted hover:text-ink"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{isWireframe ? "Mode Wireframe actif" : "Wireframe"}</span>
            </button>

            {/* Commutateur de Device */}
            <div className="flex items-center rounded-lg border border-line bg-panel p-0.5">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                title="Format Desktop"
                className={cn(
                  "p-1.5 rounded transition-colors",
                  device === "desktop" ? "bg-card text-accent shadow-xs" : "text-muted hover:text-ink"
                )}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                title="Format Mobile"
                className={cn(
                  "p-1.5 rounded transition-colors",
                  device === "mobile" ? "bg-card text-accent shadow-xs" : "text-muted hover:text-ink"
                )}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation entre écrans du prototype */}
        {block.screens.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-1.5 border-b border-line/60 pb-3">
            <span className="self-center text-[11px] font-semibold text-muted mr-1">Écrans :</span>
            {block.screens.map((screen) => (
              <button
                key={screen.id}
                type="button"
                onClick={() => setActiveScreenId(screen.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  activeScreenId === screen.id
                    ? "bg-accent text-white shadow-xs"
                    : "bg-panel text-muted hover:bg-ink/[0.05] hover:text-ink border border-line"
                )}
              >
                {screen.name}
              </button>
            ))}
          </div>
        )}

        {/* Zone de rendu de la Maquette (Châssis Device) */}
        <div className="flex justify-center p-1 sm:p-3 bg-transparent">
          {device === "mobile" ? (
            /* Châssis Smartphone */
            <div
              className={cn(
                "w-full max-w-[340px] rounded-[36px] border-2 border-slate-700/60 bg-card shadow-xl overflow-hidden transition-all duration-300",
                isWireframe && "grayscale contrast-125 border-dashed border-slate-500"
              )}
            >
              {/* Barre de statut mobile */}
              <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-muted bg-panel/50">
                <span>09:41</span>
                <div className="h-4 w-20 rounded-full bg-slate-800 self-center" />
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  <Battery className="h-3 w-3" />
                </div>
              </div>

              {/* Contenu de l'écran mobile */}
              <div className="min-h-[460px] p-4 flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex items-center justify-between border-b border-line pb-2">
                    <h4 className="font-bold text-sm text-ink">{currentScreen?.title || currentScreen?.name}</h4>
                    <Menu className="h-4 w-4 text-muted" />
                  </div>

                  {currentScreen?.subtitle && (
                    <p className="text-xs text-muted mb-4">{currentScreen.subtitle}</p>
                  )}

                  {/* Rendu des éléments de l'écran */}
                  {currentScreen?.type === "login" ? (
                    <div className="space-y-3 mt-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted">Adresse e-mail</label>
                        <div className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2">
                          <Mail className="h-4 w-4 text-muted" />
                          <input
                            type="email"
                            placeholder="etudiant@francestudent.org"
                            className="w-full bg-transparent text-xs text-ink outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted">Mot de passe</label>
                        <div className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2">
                          <Lock className="h-4 w-4 text-muted" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-transparent text-xs text-ink outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNavigate(block.screens[1]?.id)}
                        className="w-full rounded-xl bg-accent py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-strong transition-colors"
                      >
                        Se connecter
                      </button>
                    </div>
                  ) : currentScreen?.type === "chat" ? (
                    <div className="flex flex-col h-[340px] justify-between">
                      <div className="space-y-2 overflow-y-auto pr-1">
                        {prototypeChatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={cn(
                              "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                              msg.sender === "user"
                                ? "ml-auto bg-accent text-white"
                                : "bg-panel text-ink border border-line"
                            )}
                          >
                            {msg.text}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 border-t border-line pt-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendPrototypeChat()}
                          placeholder="Écrivez un message..."
                          className="flex-1 rounded-full border border-line bg-panel px-3 py-1.5 text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSendPrototypeChat}
                          className="rounded-full bg-accent p-2 text-white hover:bg-accent-strong"
                        >
                          <Send className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Rendu générique des éléments */
                    <div className="space-y-2.5">
                      {currentScreen?.elements.map((el) => (
                        <div key={el.id}>
                          {el.kind === "button" ? (
                            <button
                              type="button"
                              onClick={() => handleNavigate(el.targetScreenId)}
                              className={cn(
                                "w-full rounded-xl py-2 px-3 text-xs font-semibold flex items-center justify-between transition-colors",
                                el.variant === "primary"
                                  ? "bg-accent text-white hover:bg-accent-strong"
                                  : "border border-line bg-panel text-ink hover:bg-ink/[0.04]"
                              )}
                            >
                              <span>{el.label || "Action"}</span>
                              {el.targetScreenId && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                            </button>
                          ) : el.kind === "kpi" ? (
                            <div className="rounded-xl border border-line bg-panel p-3">
                              <span className="text-[11px] text-muted">{el.label}</span>
                              <p className="text-lg font-bold text-ink mt-0.5">{el.value || "1 250 €"}</p>
                            </div>
                          ) : el.kind === "input" ? (
                            <div className="space-y-1">
                              <label className="text-[11px] font-medium text-muted">{el.label}</label>
                              <input
                                type="text"
                                placeholder={el.value || "Saisir..."}
                                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-xs outline-none"
                              />
                            </div>
                          ) : (
                            <div className="rounded-xl border border-line bg-panel/70 p-2.5 text-xs text-ink">
                              <p className="font-medium">{el.label}</p>
                              {el.value && <p className="text-muted text-[11px] mt-0.5">{el.value}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Barre de navigation basse */}
                <div className="mt-4 flex justify-around border-t border-line pt-2 text-muted">
                  <button type="button" className="text-accent flex flex-col items-center gap-0.5">
                    <LayoutTemplate className="h-4 w-4" />
                    <span className="text-[9px]">Accueil</span>
                  </button>
                  <button type="button" className="flex flex-col items-center gap-0.5 hover:text-ink">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-[9px]">Chat</span>
                  </button>
                  <button type="button" className="flex flex-col items-center gap-0.5 hover:text-ink">
                    <User className="h-4 w-4" />
                    <span className="text-[9px]">Profil</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Châssis Fenêtre Desktop / Web */
            <div
              className={cn(
                "w-full max-w-2xl rounded-2xl border border-line/60 bg-card shadow-xl overflow-hidden transition-all duration-300",
                isWireframe && "grayscale contrast-125 border-dashed border-slate-500"
              )}
            >
              {/* Barre de titre fenêtre */}
              <div className="flex items-center gap-2 border-b border-line bg-panel px-4 py-2 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="mx-auto w-3/5 rounded-md border border-line bg-card px-2.5 py-1 text-center font-mono text-[11px] text-faint truncate">
                  https://app.francestudent.org/{currentScreen?.name.toLowerCase().replace(/\s+/g, "-")}
                </div>
              </div>

              {/* Corps d'écran Desktop */}
              <div className="p-6 min-h-[380px]">
                <div className="flex items-center justify-between border-b border-line pb-4 mb-5">
                  <div>
                    <h4 className="text-base font-bold text-ink">{currentScreen?.title || currentScreen?.name}</h4>
                    {currentScreen?.subtitle && <p className="text-xs text-muted mt-0.5">{currentScreen.subtitle}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentScreen?.elements.map((el) => (
                    <div key={el.id} className="rounded-xl border border-line bg-panel p-3.5">
                      <p className="text-xs font-semibold text-ink">{el.label}</p>
                      {el.value && <p className="text-sm font-bold text-accent mt-1">{el.value}</p>}
                      {el.targetScreenId && (
                        <button
                          type="button"
                          onClick={() => handleNavigate(el.targetScreenId)}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                        >
                          <span>Voir l&apos;écran</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="mt-3 text-center text-[11px] text-faint">
          Prototype cliquable : cliquez sur les boutons et les onglets pour tester les transitions d&apos;écrans.
        </p>
      </div>
    </div>
  );
}
