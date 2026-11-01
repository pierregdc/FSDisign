"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Lock,
  User,
  ExternalLink,
  ShieldCheck,
  Compass,
  Calculator,
  HelpCircle,
  X,
  ChevronRight,
  AlertCircle,
  Loader2,
  Layers,
  Palette,
} from "lucide-react";
import type { AccountUser, AiModelOption } from "@/lib/ai-config";
import { cn } from "@/lib/utils";

const ONBOARDING_STORAGE_KEY = "fsdisign_onboarding_completed_v1";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AccountUser | null;
  onConnectAccount?: (user: AccountUser) => void;
  availableModels?: readonly AiModelOption[];
  currentModel?: string;
  onModelChange?: (model: string) => void;
  onLaunchPrompt?: (prompt: string) => void;
  initialStep?: 1 | 2 | 3 | 4;
}

export function OnboardingModal({
  isOpen,
  onClose,
  user,
  onConnectAccount,
  availableModels = [],
  currentModel,
  onModelChange,
  onLaunchPrompt,
  initialStep = 1,
}: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialStep);

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

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Identifiants France Student invalides.");
      }

      setLoginSuccess(true);
      const newUser = data.user as AccountUser;
      setConnectedUser(newUser);
      if (onConnectAccount) {
        onConnectAccount(newUser);
      }

      // Passer à l'étape suivante après 1 seconde
      setTimeout(() => {
        setStep(3);
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion.";
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFinish = (initialPrompt?: string) => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    onClose();
    if (initialPrompt && onLaunchPrompt) {
      onLaunchPrompt(initialPrompt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Barre supérieure avec indicateur d'étapes */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
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
                Étape {step} sur 4
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Puces de progression */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    step === s ? "w-6 bg-indigo-500" : step > s ? "w-2.5 bg-emerald-500" : "w-1.5 bg-slate-700"
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleFinish()}
              className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Passer le tutoriel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CONTENU PRINCIPAL PAR ÉTAPE */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto max-h-[75vh]">
          {/* ÉTAPE 1 : BIENVENUE & PRÉSENTATION */}
          {step === 1 && (
            <div className="space-y-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                Bienvenue dans votre Studio UI Design
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Bienvenue sur FSDisign
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                  L&apos;application officielle de bureau France Student dédiée à la création d&apos;interfaces, diagrammes, calculs mathématiques et voyages.
                </p>
              </div>

              {/* Les 4 capacités clés */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <Palette className="h-4 w-4 text-indigo-400" />
                    Studio Canva &amp; Vectoriel
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Graphismes SVG, cartes mentales, schémas techniques et maquettes multi-écrans interactives.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <Calculator className="h-4 w-4 text-emerald-400" />
                    Module Mathématiques
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Résolution d&apos;équations, figures géométriques fines, tracé de fonctions $f(x)$ et tableurs.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                    <Compass className="h-4 w-4 text-sky-400" />
                    Système de Voyage Multimodal
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Itinéraires train, vol, voiture thermique / Tesla et marche à pied avec cartes ESRI intégrées.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    Modèles IA France Student
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Accès direct aux 13 modèles IA officiels sans configuration manuelle de serveur.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  <span>Configurer mon compte étudiant</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : TUTORIEL CONNEXION COMPTE FRANCE STUDENT */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                  <User className="h-4 w-4" />
                  Authentification France Student
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Connectez votre compte étudiant
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  Votre compte France Student (issu de <strong className="text-slate-300 font-mono">ia.francestudent.org</strong>) déverrouille l&apos;accès illimité aux modèles d&apos;IA sans abonnement tiers.
                </p>
              </div>

              {connectedUser ? (
                /* Déjà connecté */
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
                        {connectedUser.email || connectedUser.name}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Vos identifiants ont été validés avec succès par l&apos;API officielle France Student.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-emerald-500/20">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-all cursor-pointer"
                    >
                      <span>Continuer vers les modèles</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Formulaire de connexion guidé */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-3 rounded-2xl bg-slate-950/60 p-5 border border-slate-800">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        Email étudiant ou identifiant
                      </label>
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemple@etudiant.fr"
                        className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-slate-400" />
                        Mot de passe France Student
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {loginError && (
                      <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    {loginSuccess && (
                      <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Connexion réussie ! Redirection...</span>
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

          {/* ÉTAPE 3 : CHOIX DU MODÈLE & EXEMPLES */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                  Intelligence &amp; Modèles
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Choisissez votre modèle IA par défaut
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  Tous les modèles sont synchronisés avec votre compte France Student et disposent des capacités graphiques avancées.
                </p>
              </div>

              {/* Sélecteur de modèle */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Modèle IA recommandé pour le studio :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(availableModels.length > 0
                    ? availableModels.slice(0, 6)
                    : [
                        { id: "gpt-4o", label: "GPT-4o Omnimodal", hint: "OpenAI" },
                        { id: "claude-3-7-sonnet", label: "Claude 3.7 Sonnet", hint: "Anthropic" },
                        { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", hint: "Google" },
                        { id: "deepseek-r1", label: "DeepSeek R1 Raisonneur", hint: "DeepSeek" },
                      ]
                  ).map((m: any) => {
                    const isSelected = currentModel === m.id;
                    const displayName = m.label || m.name || m.id;
                    const displayHint = m.hint || m.provider || "France Student AI";
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onModelChange?.(m.id)}
                        className={cn(
                          "rounded-xl p-3 text-left transition-all border flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                            : "bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60"
                        )}
                      >
                        <div>
                          <div className="text-xs font-bold">{displayName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{displayHint}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Raccourcis de démarrage rapide */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block">
                  Exemples de commandes prêtes à l&apos;emploi :
                </span>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="rounded-xl bg-slate-950/60 p-3 text-slate-300 border border-slate-800/60">
                    <span className="font-semibold text-white">📐 Mathématiques :</span> « Résous l&apos;équation x² - 4x + 3 = 0 avec la courbe f(x), les étapes et un tableur de variations. »
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-3 text-slate-300 border border-slate-800/60">
                    <span className="font-semibold text-white">🚆 Voyage multimodal :</span> « Trajet Paris - Marseille en TGV, avion, Tesla avec arrêts Superchargeurs et tracé à pied. »
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-3 text-slate-300 border border-slate-800/60">
                    <span className="font-semibold text-white">🎨 Studio UI :</span> « Crée une carte mentale sur l&apos;intelligence artificielle générative avec des sous-branches. »
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Retour
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  <span>Continuer</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 : FINALISATION & LANCEMENT */}
          {step === 4 && (
            <div className="space-y-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Configuration terminée avec succès
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Tout est prêt !
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                  Votre espace FSDisign est prêt à générer vos interfaces et documents. Vous pourrez relancer ce guide à tout moment depuis les <strong>Paramètres</strong>.
                </p>
              </div>

              {/* Récapitulatif du profil */}
              <div className="rounded-2xl bg-slate-950/60 p-5 border border-slate-800 space-y-3 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Compte étudiant :</span>
                  <span className="font-semibold text-white">
                    {connectedUser ? connectedUser.name || connectedUser.email : "Mode local / invité"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Modèle sélectionné :</span>
                  <span className="font-mono text-indigo-300 font-semibold">
                    {currentModel || "Claude 3.7 Sonnet"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Modules activés :</span>
                  <span className="text-emerald-400 font-semibold">
                    Canva, Math, Travel, Quizz, Diagrammes
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleFinish(
                      "Résous l'équation x² - 4x + 3 = 0 avec la courbe f(x), les étapes et un tableur de variations."
                    )
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                >
                  <Calculator className="h-4 w-4 text-emerald-400" />
                  <span>Tester le module Mathématiques</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFinish()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Ouvrir l&apos;application</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function shouldShowOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== "true";
  } catch {
    return false;
  }
}
