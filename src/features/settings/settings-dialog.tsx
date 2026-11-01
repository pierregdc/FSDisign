"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  Palette,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  CURATED_MODELS,
  type AccountSession,
  type AccountUser,
  type AiMode,
  type ClientAiSession,
  type ClientKeySession,
  type PublicAiConfig,
} from "@/lib/ai-config";
import type { Conversation } from "@/lib/chat-types";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  SettingsNavigation,
  AppearanceSettings,
  type SettingsTabId,
} from "./settings-navigation";
import {
  NotificationsTab,
  UsageTab,
  ProjectsTab,
  UpdatesTab,
} from "./settings-tabs";
import { type ThemeId } from "@/lib/themes";

type ConnectionStatus = "idle" | "testing" | "success" | "error";

export function SettingsDialog({
  onClose,
  config,
  session,
  mode,
  model,
  onConnectAccount,
  onDisconnectAccount,
  onAccountModelChange,
  onClearAll,
  currentTheme,
  onSelectTheme,
  initialTab = "appearance",
  conversations = [],
  onSelectConversation,
  onLaunchPrompt,
  onOpenOnboarding,
}: {
  onClose: () => void;
  config: PublicAiConfig | null;
  session: ClientAiSession | null;
  mode: AiMode;
  model: string;
  onConnectKey: (session: ClientKeySession) => void;
  onDisconnectKey: () => void;
  onConnectAccount: (session: AccountSession) => void;
  onDisconnectAccount: () => void;
  onAccountModelChange: (model: string) => void;
  onClearAll: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  initialTab?: SettingsTabId;
  conversations?: Conversation[];
  onSelectConversation?: (id: string) => void;
  onLaunchPrompt?: (prompt: string) => void;
  onOpenOnboarding?: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [accountStatus, setAccountStatus] = useState<ConnectionStatus>("idle");
  const [accountMessage, setAccountMessage] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const closeDialog = useCallback(() => {
    setConfirmClear(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 30);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [closeDialog]);

  const models = config?.models ?? CURATED_MODELS;
  const account = session?.kind === "account" ? session : null;
  const isLive = mode === "live";
  const accountBusy = accountStatus === "testing";

  const connectionTitle = account
    ? "Compte France Student connecté"
    : isLive
      ? "Connexion active"
      : "Non connecté";

  const connectionBadge = account
    ? "Synchronisé"
    : isLive
      ? "Session active"
      : "Non connecté";

  const connectAccount = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setAccountStatus("error");
      setAccountMessage("Renseignez votre email et votre mot de passe France Student.");
      return;
    }
    if (!consent) {
      setAccountStatus("error");
      setAccountMessage("Veuillez cocher la case d’autorisation pour continuer.");
      return;
    }

    setAccountStatus("testing");
    setAccountMessage("");

    try {
      const response = await fetch("/api/auth/francestudent/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          model,
        }),
      });

      const body = (await response.json().catch(() => null)) as {
        error?: string;
        user?: AccountUser;
        defaultModel?: string;
      } | null;

      if (!response.ok || !body?.user) {
        setAccountStatus("error");
        setAccountMessage(body?.error || `Échec de la connexion (${response.status}).`);
        return;
      }

      const resolvedModel = body.defaultModel || model;
      onConnectAccount({
        kind: "account",
        model: resolvedModel,
        user: body.user,
      });

      setAccountStatus("success");
      setAccountMessage(`Connecté en tant que ${body.user.name}.`);
      setPassword("");
    } catch {
      setAccountStatus("error");
      setAccountMessage("Impossible de joindre le serveur. Vérifiez votre connexion.");
    }
  };

  const disconnectAccount = async () => {
    try {
      await fetch("/api/auth/francestudent/logout", { method: "POST" });
    } catch {
      // Ignoré
    }
    onDisconnectAccount();
    setAccountStatus("idle");
    setAccountMessage("Session France Student fermée.");
  };



  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeDialog}
      />

      <div
        className="animate-rise relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-line bg-canvas shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Tab Bar */}
        <div className="flex md:hidden overflow-x-auto border-b border-line bg-sidebar p-2 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("appearance")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors",
              activeTab === "appearance" ? "bg-accent text-white" : "text-muted hover:text-ink"
            )}
          >
            <Palette className="h-3.5 w-3.5" />
            Apparence
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors",
              activeTab === "account" ? "bg-accent text-white" : "text-muted hover:text-ink"
            )}
          >
            Compte
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("usage")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors",
              activeTab === "usage" ? "bg-accent text-white" : "text-muted hover:text-ink"
            )}
          >
            Usage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors",
              activeTab === "projects" ? "bg-accent text-white" : "text-muted hover:text-ink"
            )}
          >
            <FolderKanban className="h-3.5 w-3.5" />
            Projets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("updates")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors",
              activeTab === "updates" ? "bg-accent text-white" : "text-muted hover:text-ink"
            )}
          >
            Mises à jour
          </button>
        </div>

        {/* Master Layout: Left Sidebar + Right Main Area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Navigation Sidebar */}
          <aside className="w-72 shrink-0 border-r border-line bg-sidebar p-4 overflow-y-auto hidden md:block">
            <SettingsNavigation
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              user={account?.user}
              isLive={isLive}
              onLogout={account ? disconnectAccount : undefined}
            />
          </aside>

          {/* Right Main Content */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 relative bg-canvas">
            {/* Bouton fermeture ✕ en haut à droite exactement comme sur ia.francestudent.org */}
            <div className="absolute right-6 top-6 z-20">
              <button
                ref={closeRef}
                type="button"
                onClick={closeDialog}
                aria-label="Fermer les réglages"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ink/[0.08] hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeTab === "appearance" && (
              <AppearanceSettings currentTheme={currentTheme} onSelectTheme={onSelectTheme} />
            )}

            {activeTab === "notifications" && <NotificationsTab />}

            {activeTab === "usage" && (
              <UsageTab
                model={model}
                mode={mode}
                config={config}
                conversations={conversations}
              />
            )}

            

            {activeTab === "projects" && (
              <ProjectsTab
                conversations={conversations}
                isAccountConnected={Boolean(session?.kind === "account")}
                onSelectConversation={
                  onSelectConversation
                    ? (id) => {
                        onSelectConversation(id);
                        closeDialog();
                      }
                    : undefined
                }
                onLaunchPrompt={
                  onLaunchPrompt
                    ? (prompt) => {
                        onLaunchPrompt(prompt);
                        closeDialog();
                      }
                    : undefined
                }
              />
            )}

            {activeTab === "updates" && <UpdatesTab />}

                        {activeTab === "account" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 id="settings-title" className="text-xl font-bold tracking-tight text-ink">
                    Mon compte France Student
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Reliez votre compte étudiant officiel{" "}
                    <a
                      href={SITE.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-accent underline"
                    >
                      ia.francestudent.org
                    </a>{" "}
                    à l&apos;application Canva UI
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-2xl border p-4",
                    isLive ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", isLive ? "bg-emerald-500" : "bg-amber-500")} />
                      <p className="text-sm font-bold text-ink">{connectionTitle}</p>
                    </div>
                    <span className="rounded-full border border-line bg-panel px-2.5 py-0.5 text-[10px] font-semibold text-faint">
                      {connectionBadge}
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-line/60 bg-panel/60 p-2.5">
                      <dt className="text-faint text-[10px] uppercase font-bold">Modèle IA actif</dt>
                      <dd className="mt-0.5 font-bold text-ink truncate">{isLive ? model : "Connexion requise"}</dd>
                    </div>
                    <div className="rounded-xl border border-line/60 bg-panel/60 p-2.5">
                      <dt className="text-faint text-[10px] uppercase font-bold">Plateforme source</dt>
                      <dd className="mt-0.5 font-bold text-ink">ia.francestudent.org</dd>
                    </div>
                  </dl>

                  {account && (
                    <div className="mt-4 space-y-3 border-t border-line/60 pt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-ink">{account.user.name}</p>
                          <p className="text-[11px] text-faint">{account.user.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={disconnectAccount}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Se déconnecter
                        </button>
                      </div>

                      <div>
                        <label htmlFor="account-model-select" className="mb-1 block text-[11px] font-semibold text-muted">
                          Modèle utilisé avec votre compte
                        </label>
                        <select
                          id="account-model-select"
                          value={account.model}
                          onChange={(e) => onAccountModelChange(e.target.value)}
                          className="w-full rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-accent"
                        >
                          {Array.from(new Set(models.map((m) => m.category || "Autres"))).map((cat) => (
                            <optgroup key={cat} label={cat}>
                              {models
                                .filter((m) => (m.category || "Autres") === cat)
                                .map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.label} ({item.hint})
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lien direct vers le portail officiel ia.francestudent.org/login */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel p-4">
                  <div>
                    <p className="text-xs font-bold text-ink">Portail officiel France Student IA</p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      Gérez votre abonnement étudiant ou réinitialisez votre mot de passe sur{" "}
                      <span className="font-mono text-ink">ia.francestudent.org</span>
                    </p>
                  </div>
                  <a
                    href={`${SITE.url}/login`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink transition-colors hover:border-accent/50"
                  >
                    Ouvrir ia.francestudent.org
                    <ExternalLink className="h-3.5 w-3.5 text-accent" />
                  </a>
                </div>

                {!account && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void connectAccount();
                    }}
                    className="rounded-2xl border border-line bg-panel p-5 space-y-4"
                  >
                    <h4 className="text-sm font-bold text-ink">Connexion avec identifiants France Student</h4>
                    <p className="text-xs text-muted leading-relaxed">
                      Utilisez l&apos;email et le mot de passe de votre compte étudiant (comme sur ia.francestudent.org).
                    </p>

                    <div>
                      <label htmlFor="fs-email" className="block text-xs font-semibold text-ink mb-1">
                        Email
                      </label>
                      <input
                        id="fs-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre.email@etudiant.fr"
                        className="w-full rounded-xl border border-line bg-canvas/60 px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label htmlFor="fs-password" className="block text-xs font-semibold text-ink mb-1">
                        Mot de passe
                      </label>
                      <div className="relative">
                        <input
                          id="fs-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-line bg-canvas/60 py-2 pl-3 pr-10 text-xs text-ink outline-none focus:border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((curr) => !curr)}
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-faint hover:text-ink"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-1">
                      <input
                        id="fs-consent-cb"
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 rounded border-line"
                      />
                      <label htmlFor="fs-consent-cb" className="text-[11px] text-muted">
                        J&apos;autorise la connexion directe avec les serveurs de France Student IA (jeton stocké en cookie HttpOnly sécurisé).
                      </label>
                    </div>

                    {accountMessage && (
                      <p
                        className={cn(
                          "text-xs p-2.5 rounded-xl border",
                          accountStatus === "error"
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {accountMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={accountBusy}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-bold text-white hover:bg-accent-strong disabled:opacity-50"
                    >
                      {accountBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                      Se connecter à France Student
                    </button>
                  </form>
                )}

                {onOpenOnboarding && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenOnboarding();
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-line bg-card/60 px-4 py-2.5 text-xs font-semibold text-ink hover:bg-ink/[0.05] transition-colors cursor-pointer w-full justify-center"
                    >
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span>Relancer le tutoriel guidé de démarrage</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 id="settings-title" className="text-xl font-bold tracking-tight text-ink">
                    Sécurité & Confidentialité
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Architecture de sécurité de France Student Intelligent UI (Canva Studio)
                  </p>
                </div>

                <div className="rounded-2xl border border-line bg-panel p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-ink">Cookie de session HttpOnly</p>
                      <p className="mt-1 text-xs text-muted leading-relaxed">
                        Lors d&apos;une connexion avec votre compte France Student, le jeton d&apos;authentification est stocké dans un cookie <code className="font-mono text-ink">HttpOnly</code> (<code className="font-mono text-ink">SameSite=Lax</code>) inaccessible au JavaScript tiers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border-t border-line/60 pt-4">
                    <KeyRound className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-ink">Sécurité de la session et du bac à sable SVG</p>
                      <p className="mt-1 text-xs text-muted leading-relaxed">
                        La session est sécurisée via cookie sécurisé. Tous les rendus SVG et composants d&apos;interface générés par l&apos;IA sont nettoyés et isolés avant affichage pour bloquer toute injection de script.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "customization" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 id="settings-title" className="text-xl font-bold tracking-tight text-ink">
                    Personnalisation Canva UI
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Options de génération en streaming, gestion de l&apos;historique et préférences du studio
                  </p>
                </div>

                <div className="rounded-2xl border border-line bg-panel p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink">Génération réactive en streaming (parsePartialUI)</p>
                      <p className="text-[11px] text-faint">
                        Afficher les blocs, SVG, schémas et graphiques en direct au fil des tokens générés
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold">
                      Actif
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-line/60 pt-3">
                    <div>
                      <p className="text-xs font-bold text-ink">10 Moteurs Canva Studio (Zod Schema)</p>
                      <p className="text-[11px] text-faint">
                        SVG, Diagrammes, Maquettes UI, Studio Image, Documents Visuels, Graphiques, KPI, Quiz, Cartes, Calculatrices
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("projects")}
                      className="rounded-lg border border-line bg-card px-2.5 py-1 text-[11px] font-semibold text-accent hover:border-accent/50"
                    >
                      Voir les 10 moteurs
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-line/60 pt-3">
                    <div>
                      <p className="text-xs font-bold text-ink">Thème visuel actif</p>
                      <p className="text-[11px] text-faint">
                        20 thèmes officiels synchronisés avec la charte graphique de ia.francestudent.org
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("appearance")}
                      className="rounded-lg border border-line bg-card px-2.5 py-1 text-[11px] font-semibold text-accent hover:border-accent/50"
                    >
                      Changer de thème
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-line/60 pt-3">
                    <div>
                      <p className="text-xs font-bold text-ink">Historique des discussions</p>
                      <p className="text-[11px] text-faint">
                        Réinitialiser toutes les discussions et créations de la session actuelle
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirmClear) {
                          setConfirmClear(true);
                          return;
                        }
                        onClearAll();
                        setConfirmClear(false);
                        closeDialog();
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors",
                        confirmClear
                          ? "border-rose-500/50 bg-rose-500/10 text-rose-500"
                          : "border-line bg-card text-muted hover:text-rose-500"
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {confirmClear ? "Confirmer l'effacement" : "Effacer les discussions"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
