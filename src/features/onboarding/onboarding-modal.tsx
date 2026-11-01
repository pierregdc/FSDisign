"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  User,
  ExternalLink,
  ShieldCheck,
  Compass,
  Calculator,
  X,
  Loader2,
  Palette,
  Check,
  Paintbrush,
  Laptop,
} from "lucide-react";
import type { AccountUser } from "@/lib/ai-config";
import { THEMES, type ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

const ONBOARDING_STORAGE_KEY = "fsdisign_onboarding_completed_v1";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AccountUser | null;
  onConnectAccount?: (user: AccountUser) => void;
  currentTheme?: ThemeId;
  onThemeChange?: (theme: ThemeId) => void;
  initialStep?: 1 | 2 | 3;
}

export function shouldShowOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) !== "true";
}

export function OnboardingModal({
  isOpen,
  onClose,
  user,
  onConnectAccount,
  currentTheme = "sombre",
  onThemeChange,
  initialStep = 1,
}: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  // Formulaire de connexion France Student
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [connectedUser, setConnectedUser] = useState<AccountUser | null>(user);

  useEffect(() => {
    if (user) {
      setConnectedUser(user);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/auth/francestudent/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      const isSuccess = res.ok && (data.ok === true || data.success === true || Boolean(data.user));
      if (!isSuccess) {
        throw new Error(data.error || "Identifiants France Student invalides.");
      }

      setLoginSuccess(true);
      const newUser = data.user as AccountUser;
      setConnectedUser(newUser);
      if (onConnectAccount) {
        onConnectAccount(newUser);
      }

      // Passer à l'étape Apparence après un court délai de confirmation
      setTimeout(() => {
        setStep(3);
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion.";
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Barre supérieure avec indicateur d'étapes */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="relative h-7 w-7 rounded-lg overflow-hidden flex items-center justify-center bg-indigo-600/30">
              <Image
                src="/france-student-mark.png"
                alt="France Student"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-white tracking-tight">
                Guide de Démarrage · FSDisign
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                Étape {step} sur 3 ·{" "}
                {step === 1
                  ? "Présentation"
                  : step === 2
                  ? "Authentification"
                  : "Apparence"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Puces de progression (3 étapes) */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    step === s
                      ? "w-7 bg-indigo-500"
                      : step > s
                      ? "w-2.5 bg-emerald-500"
                      : "w-2 bg-slate-700"
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Passer le tutoriel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Corps du modal */}
        <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto">
          {/* ============================================================
              PAGE 1 : EXPLICATION DE L'APPLICATION
             ============================================================ */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Bienvenue dans votre Studio Étudiant</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Bienvenue sur FSDisign
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                  L&apos;application officielle de bureau France Student dédiée à la conception visuelle, la modélisation mathématique, la planification de voyages et aux widgets d&apos;intelligence artificielle interactifs.
                </p>
              </div>

              {/* Les 4 capacités piliers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-left">
                <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/70 space-y-1.5 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <Palette className="h-4 w-4 text-indigo-400" />
                    <span>Studio Canva &amp; Vectoriel</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Graphismes SVG, cartes mentales, schémas techniques et maquettes multi-écrans interactives sans barre flottante encombrante.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/70 space-y-1.5 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <Calculator className="h-4 w-4 text-emerald-400" />
                    <span>Module Mathématiques</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Résolution d&apos;équations pas à pas, figures géométriques fines (Pythagore), tracé analytique de courbes $f(x)$ et tableurs.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/70 space-y-1.5 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                    <Compass className="h-4 w-4 text-sky-400" />
                    <span>Voyage Multimodal</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Comparateur complet vol (éco/business), train (TGV/TER), voiture (essence vs Tesla Superchargeurs) et marche avec cartes ESRI.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/70 space-y-1.5 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <Laptop className="h-4 w-4 text-amber-400" />
                    <span>Widgets GPT-6 Intelligent UI</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Schémas éclatés avec simulation, recettes dynamiques avec minuteurs, partage d&apos;addition et matrices de décision en direct.
                  </p>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  <span>Suivant : Connexion à mon compte</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
              PAGE 2 : CONNEXION AU COMPTE FRANCE STUDENT
             ============================================================ */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                  <User className="h-3.5 w-3.5" />
                  <span>Authentification France Student</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Connectez votre compte étudiant
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                  Votre compte officiel issu de <strong>ia.francestudent.org</strong> déverrouille l&apos;accès illimité aux 13 modèles d&apos;IA de pointe (GPT-6 Sol, GPT-6 Luna, Claude Sonnet 5.5, Gemini 3.8 Flash, etc.) sans abonnement tiers.
                </p>
              </div>

              {connectedUser ? (
                <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/30 p-5 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        Compte France Student Actif
                      </div>
                      <div className="text-xs text-emerald-300 font-mono mt-0.5">
                        {connectedUser.name || connectedUser.email}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Vos identifiants ont été validés avec succès par l&apos;API officielle France Student. Vos modèles IA sont prêts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-emerald-500/20">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-all cursor-pointer"
                    >
                      <span>Continuer vers l&apos;Apparence</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="rounded-2xl bg-slate-950/60 p-5 border border-slate-800 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <span>Email étudiant ou identifiant</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemple@etudiant.fr"
                        required
                        className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <span>Mot de passe France Student</span>
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    {loginError && (
                      <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-start gap-2">
                        <span>{loginError}</span>
                      </div>
                    )}

                    {loginSuccess && (
                      <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Connexion réussie ! Passage à l&apos;apparence...</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Vérification auprès de ia.francestudent.org...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Se connecter à mon compte</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Liens d'aide et mode invité */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-1">
                    <a
                      href="https://ia.francestudent.org/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-white transition-colors underline"
                    >
                      <span>Créer un compte ou mot de passe oublié</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Passer cette étape (mode invité) →
                    </button>
                  </div>
                </form>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Retour
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
              PAGE 3 : PERSONNALISATION DE L'APPARENCE (20 Thèmes)
             ============================================================ */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                  <Paintbrush className="h-3.5 w-3.5" />
                  <span>Personnalisation Visuelle</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Choisissez votre apparence
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                  Sélectionnez votre univers graphique parmi les 20 thèmes conçus pour le confort de lecture, de code et de révision. L&apos;aperçu s&apos;applique immédiatement.
                </p>
              </div>

              {/* Grille des 20 thèmes visuels avec pastilles réelles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                  <span>20 thèmes disponibles :</span>
                  <span className="font-mono text-[11px] text-indigo-400">
                    Actif : {THEMES.find((t) => t.id === currentTheme)?.name || currentTheme}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
                  {THEMES.map((theme) => {
                    const isSelected = currentTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => onThemeChange?.(theme.id)}
                        className={cn(
                          "relative rounded-xl p-2.5 text-left transition-all border flex flex-col justify-between gap-2 cursor-pointer group",
                          isSelected
                            ? "border-indigo-500 bg-slate-950 shadow-md shadow-indigo-500/20"
                            : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900"
                        )}
                        style={{
                          background: isSelected ? undefined : theme.previewBg,
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-semibold text-white truncate">
                            {theme.name}
                          </span>
                          {isSelected ? (
                            <span className="h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span
                              className="h-3 w-3 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: theme.previewAccent }}
                            />
                          )}
                        </div>

                        {/* Échantillon de couleur */}
                        <div className="flex items-center gap-1.5 w-full pt-1">
                          <div
                            className="h-2 flex-1 rounded-full border border-white/10"
                            style={{ backgroundColor: theme.previewBg }}
                          />
                          <div
                            className="h-2 flex-1 rounded-full border border-white/10"
                            style={{ backgroundColor: theme.previewCard }}
                          />
                          <div
                            className="h-2 flex-1 rounded-full"
                            style={{ backgroundColor: theme.previewAccent }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bouton de finalisation et lancement */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Retour
                </button>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Lancer FranceStudent Studio</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
