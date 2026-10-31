"use client";

import {
  ArrowDownCircle,
  BarChart2,
  Bell,
  FolderKanban,
  LogIn,
  LogOut,
  Palette,
  Sparkles,
  User,
} from "lucide-react";
import { BrandMark } from "@/features/chat/brand";
import { SITE } from "@/lib/site";
import { THEMES, type ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";
import type { AccountUser } from "@/lib/ai-config";

export type SettingsTabId =
  | "account"
  | "security"
  | "customization"
  | "appearance"
  | "notifications"
  | "usage"
  | "projects"
  | "updates";

export function SettingsNavigation({
  activeTab,
  onSelectTab,
  user,
  isLive,
  onLogout,
}: {
  activeTab: SettingsTabId;
  onSelectTab: (tab: SettingsTabId) => void;
  user?: AccountUser | null;
  isLive?: boolean;
  onLogout?: () => void;
}) {
  const navItemClass = (tab: SettingsTabId) =>
    cn(
      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] font-medium transition-colors",
      activeTab === tab
        ? "bg-accent/20 text-ink font-semibold shadow-2xs"
        : "text-muted hover:bg-ink/[0.05] hover:text-ink"
    );

  return (
    <div className="flex h-full flex-col justify-between text-xs select-none">
      <div className="space-y-5">
        {/* En-tête FranceStudent */}
        <div className="px-2 py-1 space-y-1">
          <div className="flex items-center gap-2.5">
            <BrandMark size="sm" />
            <span className="font-black text-[15px] tracking-tight text-ink uppercase">
              FRANCESTUDENT
            </span>
          </div>
          <p className="pl-9 text-[10px] font-semibold tracking-wide text-accent uppercase">
            Studio UI Design
          </p>
        </div>

        {/* Section 1 : Réglages du compte */}
        <div>
          <p className="px-3 text-[11px] font-medium text-faint">
            Réglages du compte
          </p>
          <div className="mt-1.5 space-y-0.5">
            <button
              type="button"
              onClick={() => onSelectTab("account")}
              className={navItemClass("account")}
            >
              <User className="h-4 w-4 shrink-0 text-muted" />
              <span>Mon compte</span>
            </button>
          </div>
        </div>

        {/* Section 2 : Réglages de l'app */}
        <div>
          <p className="px-3 text-[11px] font-medium text-faint">
            Réglages de l&apos;app
          </p>
          <div className="mt-1.5 space-y-0.5">
            <button
              type="button"
              onClick={() => onSelectTab("customization")}
              className={navItemClass("customization")}
            >
              <Sparkles className="h-4 w-4 shrink-0 text-muted" />
              <span>Personnalisation</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("appearance")}
              className={navItemClass("appearance")}
            >
              <Palette className="h-4 w-4 shrink-0 text-muted" />
              <span>Apparence</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("notifications")}
              className={navItemClass("notifications")}
            >
              <Bell className="h-4 w-4 shrink-0 text-muted" />
              <span>Notifications</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("usage")}
              className={cn(navItemClass("usage"), "justify-between")}
            >
              <span className="flex items-center gap-3">
                <BarChart2 className="h-4 w-4 shrink-0 text-muted" />
                <span>Usage</span>
              </span>
              <span className="rounded-full bg-sky-500/15 border border-sky-500/25 px-2 py-0.5 text-[8px] font-extrabold text-sky-400 uppercase tracking-wider">
                NOUVEAU
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("projects")}
              className={cn(navItemClass("projects"), "justify-between")}
            >
              <span className="flex items-center gap-3">
                <FolderKanban className="h-4 w-4 shrink-0 text-muted" />
                <span>Projets</span>
              </span>
              <span className="rounded-full bg-accent/15 border border-accent/25 px-2 py-0.5 text-[8px] font-extrabold text-accent uppercase tracking-wider">
                ESPACE
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("updates")}
              className={cn(navItemClass("updates"), "justify-between")}
            >
              <span className="flex items-center gap-3">
                <ArrowDownCircle className="h-4 w-4 shrink-0 text-muted" />
                <span>Mises à jour</span>
              </span>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[8px] font-extrabold text-emerald-500 uppercase tracking-wider">
                AUTO
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pied de barre latérale : profil réel + dépôt GitHub source + réseaux */}
      <div className="border-t border-line/60 pt-3 mt-4 space-y-3">
        {user ? (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-card/40 p-1.5 border border-line/40">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="h-8 w-8 rounded-full bg-white border border-line flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                <svg viewBox="0 0 36 36" className="h-6 w-6" aria-hidden="true">
                  <rect x="6" y="6" width="6" height="6" fill="#4ade80" />
                  <rect x="24" y="6" width="6" height="6" fill="#4ade80" />
                  <rect x="12" y="12" width="12" height="12" fill="#22c55e" />
                  <rect x="6" y="18" width="6" height="6" fill="#16a34a" />
                  <rect x="24" y="18" width="6" height="6" fill="#16a34a" />
                  <rect x="12" y="24" width="12" height="6" fill="#4ade80" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-ink" title={user.name}>{user.name}</p>
                <p className="truncate text-[11px] text-muted font-mono" title={user.email}>{user.email}</p>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Se déconnecter de France Student"
                aria-label="Se déconnecter"
                className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onSelectTab("account")}
            className="flex w-full items-center justify-between rounded-xl border border-line bg-panel/70 px-2.5 py-2 text-left transition-colors hover:border-accent/40 hover:bg-panel"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full border border-line bg-card flex items-center justify-center shrink-0">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    isLive ? "bg-emerald-500" : "bg-amber-500"
                  )}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-ink">
                  {isLive ? "Clé API active" : "Non connecté"}
                </p>
                <p className="truncate text-[10px] text-muted">
                  {isLive ? "Session API directe" : "Connecter votre compte"}
                </p>
              </div>
            </div>
            <LogIn className="h-3.5 w-3.5 text-accent shrink-0" />
          </button>
        )}

        <div className="px-1 flex items-center justify-between gap-2 text-[10px] text-faint">
          <div className="leading-tight min-w-0">
            <span className="block truncate font-semibold text-muted">
              France Student CANVA
            </span>
            <a
              href={SITE.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-ink transition-colors"
            >
              ia.francestudent.org
            </a>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="https://discord.gg/francestudent"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord France Student"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-panel text-muted hover:text-ink hover:border-ink/30 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppearanceSettings({
  currentTheme,
  onSelectTheme,
}: {
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
}) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="border-b border-line/60 pb-3">
        <h2
          id="settings-title"
          className="text-xl font-bold tracking-tight text-ink"
        >
          Apparence & Thèmes
        </h2>
        <p className="mt-1 text-xs text-muted">
          Personnalisez les nuances visuelles et les contrastes du Studio UI Design (20 thèmes officiels).
        </p>
      </div>

      <div className="max-h-[calc(78vh-130px)] overflow-y-auto pr-1 pb-6 scrollbar-thin">
        <div className="grid grid-cols-2 gap-x-3.5 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {THEMES.map((theme) => {
          const isSelected = theme.id === currentTheme;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              aria-pressed={isSelected}
              className="group flex flex-col items-center gap-2 text-center focus:outline-none"
            >
              {/* Conteneur extérieur sombre de la carte avec bordure active nette */}
              <div
                className={cn(
                  "w-full rounded-2xl p-2.5 transition-all duration-150",
                  "bg-[#22242a] dark:bg-[#22242a]",
                  isSelected
                    ? "ring-1 ring-ink/90 shadow-lg scale-[1.02]"
                    : "ring-1 ring-white/5 hover:ring-ink/40 hover:scale-[1.01]"
                )}
              >
                {/* Miniature de fenêtre d'application fidèle à ia.francestudent.org */}
                <div
                  className="h-[74px] w-full rounded-xl overflow-hidden flex border shadow-inner"
                  style={{
                    borderColor: theme.preview.border,
                    background: theme.preview.main,
                  }}
                >
                  {/* Barre latérale gauche miniature */}
                  <div
                    className="w-[30%] h-full p-1.5 flex flex-col justify-between border-r"
                    style={{
                      background: theme.preview.sidebar,
                      borderColor: theme.preview.border,
                    }}
                  >
                    <div className="space-y-1.5">
                      {/* 3 petits points de fenêtre */}
                      <div className="flex items-center gap-0.5">
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ backgroundColor: theme.preview.dots }}
                        />
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ backgroundColor: theme.preview.dots }}
                        />
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ backgroundColor: theme.preview.dots }}
                        />
                      </div>
                      {/* 2 barres de menu */}
                      <div className="space-y-1">
                        <div
                          className="h-1 w-4/5 rounded-full"
                          style={{ backgroundColor: theme.preview.pillPrimary }}
                        />
                        <div
                          className="h-1 w-3/5 rounded-full opacity-75"
                          style={{ backgroundColor: theme.preview.pillSecondary }}
                        />
                      </div>
                    </div>

                    {/* Barre profil en bas de la mini-sidebar */}
                    <div
                      className="h-1.5 w-3/5 rounded-full opacity-85"
                      style={{ backgroundColor: theme.preview.pillPrimary }}
                    />
                  </div>

                  {/* Zone principale droite miniature */}
                  <div className="flex-1 h-full p-1.5 flex flex-col justify-between">
                    {/* Barre de titre supérieure */}
                    <div
                      className="h-1.5 w-2/5 rounded-full"
                      style={{ backgroundColor: theme.preview.pillPrimary }}
                    />

                    {/* Grille centrale de 3 cartes */}
                    <div className="grid grid-cols-3 gap-1 my-0.5">
                      {[0, 1, 2].map((idx) => (
                        <div
                          key={idx}
                          className="h-5 rounded-[4px] border"
                          style={{
                            backgroundColor: theme.preview.surface,
                            borderColor: theme.preview.border,
                          }}
                        />
                      ))}
                    </div>

                    {/* Carte large inférieure (composer) */}
                    <div
                      className="h-4 w-full rounded-[4px] border"
                      style={{
                        backgroundColor: theme.preview.surface,
                        borderColor: theme.preview.border,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Nom du thème sous la carte */}
              <span
                className={cn(
                  "text-xs tracking-tight transition-colors",
                  isSelected
                    ? "font-bold text-ink"
                    : "font-medium text-muted group-hover:text-ink"
                )}
              >
                {theme.name}
              </span>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
