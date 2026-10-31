"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Battery,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  Layers,
  LayoutTemplate,
  Lock,
  Mail,
  Menu,
  MessageSquare,
  Monitor,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  Wifi,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { CanvaToolbar, type VersionSnapshot } from "@/features/canva";
import { cn } from "@/lib/utils";

type MockupBlockData = Extract<UIBlock, { type: "mockup" }>;

type NormalizedElement = {
  id: string;
  kind: string;
  label: string;
  value?: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  targetScreenId?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
};

type NormalizedScreen = {
  id: string;
  name: string;
  title: string;
  subtitle?: string;
  type: "login" | "chat" | "dashboard" | "form" | "menu" | "custom";
  elements: NormalizedElement[];
};

export function MockupBlockView({ block }: { block: MockupBlockData }) {
  const [device, setDevice] = useState<"desktop" | "mobile" | "web" | "tablet">(
    block.device || "mobile"
  );
  const [isWireframe, setIsWireframe] = useState(false);
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);

  // Messages interactifs pour le simulateur de tuteur chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "Bonjour Thomas ! Je suis votre tuteur France Student. Comment puis-je vous aider pour vos révisions aujourd'hui ?",
    },
    {
      sender: "user",
      text: "Peux-tu me résumer le principe de la Question Prioritaire de Constitutionnalité (QPC) ?",
    },
    {
      sender: "bot",
      text: "La QPC (art. 61-1 de la Constitution) permet à tout justiciable de soutenir, lors d'un procès, qu'une disposition législative porte atteinte aux droits et libertés garantis par la Constitution.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Normalisation tolérante de tous les écrans
  const normalizedScreens: NormalizedScreen[] = useMemo(() => {
    const rawScreens = block.screens || [];
    return rawScreens.map((rawScreen: unknown, sIdx: number) => {
      const s = rawScreen as Record<string, unknown>;
      const sName = String(s.name || s.title || `Écran ${sIdx + 1}`);
      const sTitle = String(s.title || s.name || `Écran ${sIdx + 1}`);
      const sType = (s.type as NormalizedScreen["type"]) || (sIdx === 0 ? "dashboard" : "custom");
      const rawElements = (s.elements as unknown[]) || [];

      const elements: NormalizedElement[] = rawElements.map((rawEl: unknown, elIdx: number) => {
        const el = rawEl as Record<string, unknown>;
        return {
          id: String(el.id || `el-${elIdx}`),
          kind: String(el.kind || el.type || "card"),
          label: String(el.label || el.title || el.name || ""),
          value: el.value ? String(el.value) : el.subtitle ? String(el.subtitle) : undefined,
          subtitle: el.subtitle ? String(el.subtitle) : el.meta ? String(el.meta) : undefined,
          meta: el.meta ? String(el.meta) : undefined,
          badge: el.badge ? String(el.badge) : undefined,
          targetScreenId: el.targetScreenId ? String(el.targetScreenId) : undefined,
          variant: (el.variant as NormalizedElement["variant"]) || "primary",
        };
      });

      return {
        id: String(s.id || `screen-${sIdx}`),
        name: sName,
        title: sTitle,
        subtitle: s.subtitle ? String(s.subtitle) : s.header ? String(s.header) : undefined,
        type: sType,
        elements,
      };
    });
  }, [block.screens]);

  const [activeScreenId, setActiveScreenId] = useState<string>(
    block.activeScreenId || normalizedScreens[0]?.id || "screen_0"
  );

  const currentScreen =
    normalizedScreens.find((s) => s.id === activeScreenId) || normalizedScreens[0];

  const handleNavigate = (targetScreenId?: string) => {
    if (targetScreenId && normalizedScreens.some((s) => s.id === targetScreenId)) {
      setActiveScreenId(targetScreenId);
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text },
      {
        sender: "bot",
        text: `Excellente question sur "${text}". Cette notion est abordée dans la fiche de méthodologie N° 3.`,
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <CanvaToolbar
        title={block.title || "Prototype d'interface"}
        jsonData={block}
        versions={versions}
        onSaveVersion={(name) =>
          setVersions([
            { id: crypto.randomUUID(), name, timestamp: Date.now(), data: { activeScreenId, device } },
            ...versions,
          ])
        }
      />

      {/* En-tête sans contour général */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <LayoutTemplate className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold tracking-tight text-white">
              {block.title || "Prototype & Maquette d'Interface"}
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Navigation interactive entre écrans · Cliquez sur les boutons pour explorer le flux utilisateur.
          </p>
        </div>

        {/* Contrôles de prévisualisation : Wireframe + Format Desktop/Mobile */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsWireframe(!isWireframe)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-all",
              isWireframe
                ? "border-sky-500/40 bg-sky-500/15 text-sky-400 font-semibold"
                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{isWireframe ? "Wireframe actif" : "Filaire"}</span>
          </button>

          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/60 p-0.5">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              title="Vue Ordinateur"
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all",
                device === "desktop"
                  ? "bg-sky-500 text-white font-semibold shadow-xs"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Web</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              title="Vue Mobile"
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all",
                device === "mobile"
                  ? "bg-sky-500 text-white font-semibold shadow-xs"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barre d'onglets pour switcher d'écran au prototype */}
      {normalizedScreens.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Écrans du flux :
          </span>
          {normalizedScreens.map((screen) => (
            <button
              key={screen.id}
              type="button"
              onClick={() => setActiveScreenId(screen.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5",
                activeScreenId === screen.id
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              )}
            >
              {screen.type === "chat" ? (
                <MessageSquare className="h-3 w-3" />
              ) : screen.type === "dashboard" ? (
                <LayoutTemplate className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>{screen.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Châssis de Simulation de l'interface */}
      <div className="flex justify-center items-center py-2">
        {device === "mobile" ? (
          /* ================= CHÂSSIS SMARTPHONE MODERNE ================= */
          <div
            className={cn(
              "w-full max-w-[370px] rounded-[44px] border-[5px] border-slate-700/80 bg-slate-950 shadow-2xl p-4 transition-all duration-300 relative select-none",
              isWireframe && "grayscale contrast-125 border-dashed border-slate-600"
            )}
          >
            {/* Dynamic Island / Capteur caméra */}
            <div className="w-24 h-4.5 bg-black rounded-full mx-auto flex items-center justify-center gap-2 px-3 shadow-inner">
              <div className="h-2 w-2 rounded-full bg-slate-900 border border-slate-800" />
              <div className="h-1.5 w-1.5 rounded-full bg-blue-950/80" />
            </div>

            {/* Barre de statut mobile */}
            <div className="flex items-center justify-between px-3 pt-2 pb-3 text-[11px] font-semibold text-slate-400">
              <span className="font-mono">09:41</span>
              <div className="flex items-center gap-2">
                <Wifi className="h-3 w-3 text-slate-300" />
                <span className="text-[10px] font-mono font-bold text-slate-300">5G</span>
                <Battery className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            </div>

            {/* En-tête interne de l'application mobile */}
            <div className="flex items-center justify-between px-1 pb-3 mb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  TL
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Thomas Laurent</h4>
                  <p className="text-[10px] text-slate-400">Paris 1 Panthéon-Sorbonne</p>
                </div>
              </div>
              <div className="relative">
                <button
                  type="button"
                  title="Notifications"
                  className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
                >
                  <Bell className="h-3.5 w-3.5" />
                </button>
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              </div>
            </div>

            {/* Titre de l'écran actif */}
            <div className="mb-3 px-1 flex items-center justify-between">
              <div>
                <h5 className="text-sm font-extrabold text-white">{currentScreen.title}</h5>
                {currentScreen.subtitle && (
                  <p className="text-[11px] text-slate-400">{currentScreen.subtitle}</p>
                )}
              </div>
              <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-400 capitalize">
                {currentScreen.type}
              </span>
            </div>

            {/* Zone de Contenu de l'Écran Mobile */}
            <div className="min-h-[440px] max-h-[500px] overflow-y-auto space-y-3 pr-0.5 custom-scrollbar">
              {currentScreen.type === "chat" ? (
                /* Écran Chat / Tuteur interactif */
                <div className="flex flex-col h-[420px] justify-between">
                  <div className="space-y-2.5 overflow-y-auto pr-1">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed transition-all",
                          msg.sender === "user"
                            ? "ml-auto bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-tr-xs shadow-md shadow-sky-500/10"
                            : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-xs shadow-sm"
                        )}
                      >
                        <p className="text-[10px] font-semibold mb-1 opacity-70">
                          {msg.sender === "user" ? "Vous" : "Tuteur IA France Student"}
                        </p>
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  {/* Zone de saisie du chat prototype */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                      placeholder="Posez une question au tuteur..."
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleSendChat}
                      className="rounded-xl bg-sky-500 hover:bg-sky-400 p-2 text-white shadow-md transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Écran Dashboard ou Planning standard */
                <div className="space-y-3">
                  {currentScreen.elements.map((el) => {
                    if (el.kind === "kpi") {
                      return (
                        <div
                          key={el.id}
                          className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-3.5 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-[11px] font-medium text-slate-400">{el.label}</span>
                            <p className="text-xl font-extrabold text-white font-mono mt-0.5">
                              {el.value}
                            </p>
                            {el.subtitle && (
                              <p className="text-[10px] text-slate-400 mt-0.5">{el.subtitle}</p>
                            )}
                          </div>
                          {el.meta && (
                            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              {el.meta}
                            </span>
                          )}
                        </div>
                      );
                    }

                    if (el.kind === "button") {
                      return (
                        <button
                          key={el.id}
                          type="button"
                          onClick={() => handleNavigate(el.targetScreenId)}
                          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 p-3.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20 transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 text-left">
                            <BookOpen className="h-4 w-4 shrink-0" />
                            <div>
                              <span>{el.label}</span>
                              {el.value && (
                                <p className="text-[10px] font-normal text-sky-100 opacity-90">
                                  {el.value}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        </button>
                      );
                    }

                    // Card standard
                    return (
                      <div
                        key={el.id}
                        className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-3.5 hover:border-sky-500/40 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-white">{el.label}</span>
                          {el.badge && (
                            <span className="rounded-full bg-sky-500/15 border border-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-400 shrink-0">
                              {el.badge}
                            </span>
                          )}
                        </div>

                        {el.value && (
                          <p className="text-sm font-semibold text-sky-400 mt-1">{el.value}</p>
                        )}

                        {el.subtitle && (
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {el.subtitle}
                          </p>
                        )}

                        {el.targetScreenId && (
                          <button
                            type="button"
                            onClick={() => handleNavigate(el.targetScreenId)}
                            className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                          >
                            <span>Ouvrir l&apos;écran associé</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Barre de navigation basse mobile */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex justify-around text-slate-400">
              <button
                type="button"
                onClick={() => handleNavigate("home")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  activeScreenId === "home" ? "text-sky-400 font-bold" : "hover:text-white"
                )}
              >
                <LayoutTemplate className="h-4 w-4" />
                <span className="text-[9px]">Accueil</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate("planning")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  activeScreenId === "planning" ? "text-sky-400 font-bold" : "hover:text-white"
                )}
              >
                <Calendar className="h-4 w-4" />
                <span className="text-[9px]">Planning</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate("chat")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  activeScreenId === "chat" ? "text-sky-400 font-bold" : "hover:text-white"
                )}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-[9px]">Tuteur</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center gap-1 hover:text-white transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="text-[9px]">Profil</span>
              </button>
            </div>

            {/* Barre Home gesture iOS */}
            <div className="h-1 w-28 rounded-full bg-slate-700/80 mx-auto mt-2.5" />
          </div>
        ) : (
          /* ================= CHÂSSIS FENÊTRE DESKTOP / WEB ================= */
          <div
            className={cn(
              "w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden transition-all duration-300",
              isWireframe && "grayscale contrast-125 border-dashed border-slate-600"
            )}
          >
            {/* Barre de titre macOS */}
            <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="mx-auto flex w-3/5 items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 font-mono text-[11px] text-slate-400">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span className="truncate">
                  https://app.francestudent.org/{currentScreen.name.toLowerCase().replace(/\s+/g, "-")}
                </span>
              </div>
            </div>

            {/* Corps d'application Desktop */}
            <div className="flex min-h-[460px]">
              {/* Sidebar Desktop */}
              <div className="w-52 border-r border-slate-800 bg-slate-900/40 p-4 space-y-4 shrink-0 hidden sm:block">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <GraduationCap className="h-5 w-5 text-sky-400" />
                  <span>France Student</span>
                </div>
                <nav className="space-y-1">
                  {normalizedScreens.map((screen) => (
                    <button
                      key={screen.id}
                      type="button"
                      onClick={() => setActiveScreenId(screen.id)}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-left transition-colors",
                        activeScreenId === screen.id
                          ? "bg-sky-500 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      {screen.type === "chat" ? (
                        <MessageSquare className="h-3.5 w-3.5" />
                      ) : screen.type === "dashboard" ? (
                        <LayoutTemplate className="h-3.5 w-3.5" />
                      ) : (
                        <Calendar className="h-3.5 w-3.5" />
                      )}
                      <span className="truncate">{screen.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Contenu principal Desktop */}
              <div className="flex-1 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-lg font-bold text-white">{currentScreen.title}</h4>
                    {currentScreen.subtitle && (
                      <p className="text-xs text-slate-400 mt-0.5">{currentScreen.subtitle}</p>
                    )}
                  </div>
                  <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-400 capitalize">
                    {currentScreen.type}
                  </span>
                </div>

                {currentScreen.type === "chat" ? (
                  <div className="h-[340px] flex flex-col justify-between">
                    <div className="space-y-3 overflow-y-auto pr-2">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed",
                            msg.sender === "user"
                              ? "ml-auto bg-sky-500 text-white"
                              : "bg-slate-900 border border-slate-800 text-slate-200"
                          )}
                        >
                          <p className="text-[10px] font-bold opacity-70 mb-1">
                            {msg.sender === "user" ? "Vous" : "Tuteur IA"}
                          </p>
                          {msg.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                        placeholder="Poser une question..."
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={handleSendChat}
                        className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentScreen.elements.map((el) => (
                      <div
                        key={el.id}
                        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-sky-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-bold text-white">{el.label}</p>
                          {el.badge && (
                            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                              {el.badge}
                            </span>
                          )}
                        </div>
                        {el.value && (
                          <p className="text-base font-bold text-sky-400 font-mono">{el.value}</p>
                        )}
                        {el.subtitle && (
                          <p className="text-xs text-slate-400 leading-relaxed">{el.subtitle}</p>
                        )}
                        {el.targetScreenId && (
                          <button
                            type="button"
                            onClick={() => handleNavigate(el.targetScreenId)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:underline pt-1"
                          >
                            <span>Accéder à l&apos;écran</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Prototype interactif : cliquez sur les écrans, les onglets ou le commutateur Web/Mobile pour tester la navigation.
      </p>
    </div>
  );
}
