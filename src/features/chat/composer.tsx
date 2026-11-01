"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  CheckSquare,
  HelpCircle,
  ChevronDown,
  ImageIcon,
  Network,
  Palette,
  Plus,
  Search,
  Smartphone,
  Square,
  Wand2,
  X,
} from "lucide-react";
import { CURATED_MODELS, type AiModelOption } from "@/lib/ai-config";
import { cn } from "@/lib/utils";
import { ModelProviderIcon, getModelProviderGroup } from "./provider-icons";

export function Composer({
  streaming,
  onSend,
  onStop,
  currentModel,
  onModelChange,
  availableModels,
  draftPrompt,
  onDraftHandled,
}: {
  streaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  currentModel: string;
  onModelChange: (model: string) => void;
  availableModels: AiModelOption[];
  draftPrompt?: string | null;
  onDraftHandled?: () => void;
}) {
  const [value, setValue] = useState("");
  const [attachedImage, setAttachedImage] = useState<{
    name: string;
    size: string;
    dataUrl: string;
  } | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [modelSearch, setModelSearch] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (draftPrompt !== undefined && draftPrompt !== null && draftPrompt !== "") {
      setValue(draftPrompt);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const len = draftPrompt.length;
          textareaRef.current.setSelectionRange(len, len);
        }
      }, 50);
      onDraftHandled?.();
    }
  }, [draftPrompt, onDraftHandled]);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelPickerRef.current && !modelPickerRef.current.contains(event.target as Node)) {
        setShowModelPicker(false);
      }
    }
    if (showModelPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModelPicker]);

  const canSend = (value.trim().length > 0 || attachedImage !== null) && !streaming;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} Mo` : `${sizeKb} Ko`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAttachedImage({
        name: file.name,
        size: sizeStr,
        dataUrl,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const submit = () => {
    if (!canSend) return;

    let fullPrompt = value.trim();

    if (attachedImage) {
      const imageContext = `[Image jointe : ${attachedImage.name} (${attachedImage.size})]\n[Données image : ${attachedImage.dataUrl.slice(0, 80)}...]\n`;
      fullPrompt = fullPrompt
        ? `${imageContext}${fullPrompt}`
        : `${imageContext}Analyse cette image et propose une composition visuelle ou des variantes graphiques adaptées.`;
    }

    onSend(fullPrompt);
    setValue("");
    setAttachedImage(null);
    setShowPresets(false);
    setShowModelPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
    }
  };

  const handlePreset = (presetText: string) => {
    setValue(presetText);
    setShowPresets(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = presetText.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 50);
  };

  const modelsList = availableModels && availableModels.length > 0 ? availableModels : CURATED_MODELS;
  const currentModelObj = modelsList.find((m) => m.id === currentModel);

  const groupedModels = useMemo(() => {
    const q = modelSearch.trim().toLowerCase();
    const filtered = modelsList.filter((m) => {
      if (!q) return true;
      return (
        m.label.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.hint.toLowerCase().includes(q) ||
        (m.category && m.category.toLowerCase().includes(q))
      );
    });

    const groups: { provider: string; models: typeof modelsList }[] = [];
    const providerMap = new Map<string, typeof modelsList>();
    const priority = ["OpenAI", "Anthropic", "Google Gemini", "Mistral", "DeepSeek", "Meta"];

    for (const m of filtered) {
      const p = getModelProviderGroup(m);
      if (!providerMap.has(p)) {
        providerMap.set(p, []);
      }
      providerMap.get(p)!.push(m);
    }

    for (const p of priority) {
      if (providerMap.has(p)) {
        groups.push({ provider: p, models: providerMap.get(p)! });
        providerMap.delete(p);
      }
    }

    for (const [p, list] of providerMap.entries()) {
      groups.push({ provider: p, models: list });
    }

    return groups;
  }, [modelsList, modelSearch]);

  return (
    <div className="shrink-0 px-3 pb-3 pt-2 sm:px-6 sm:pb-5">
      <div className="mx-auto w-full max-w-3xl">
        {/* Menu déroulant de raccourcis Canva */}
        {showPresets && (
          <div className="mb-2 rounded-xl border border-line/70 bg-panel/95 p-2.5 shadow-lg backdrop-blur-md animate-fade-in text-xs">
            <p className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted uppercase">
              Suggestions de base de prompt
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => handlePreset("Fais une fiche méthode sur ")}
                className="group flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-card/70 transition-colors border border-transparent hover:border-line/60"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:scale-105 transition-transform">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-ink text-xs group-hover:text-accent transition-colors">Fiche méthode</span>
                  <span className="text-[11px] text-muted truncate">Fais une fiche méthode sur…</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handlePreset("Crée une carte mentale sur ")}
                className="group flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-card/70 transition-colors border border-transparent hover:border-line/60"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 group-hover:scale-105 transition-transform">
                  <Network className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-ink text-xs group-hover:text-accent transition-colors">Carte mentale</span>
                  <span className="text-[11px] text-muted truncate">Crée une carte mentale sur…</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handlePreset("Crée une maquette d'interface interactive pour ")}
                className="group flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-card/70 transition-colors border border-transparent hover:border-line/60"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 group-hover:scale-105 transition-transform">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-ink text-xs group-hover:text-accent transition-colors">Maquette interactive</span>
                  <span className="text-[11px] text-muted truncate">Crée une maquette pour…</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handlePreset("Génère une illustration vectorielle SVG de ")}
                className="group flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-card/70 transition-colors border border-transparent hover:border-line/60"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
                  <Palette className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-ink text-xs group-hover:text-accent transition-colors">Graphisme SVG</span>
                  <span className="text-[11px] text-muted truncate">Génère un SVG de…</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handlePreset("Crée un questionnaire interactif QCM de 4 questions sur ")}
                className="group flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-card/70 transition-colors border border-transparent hover:border-line/60"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-ink text-xs group-hover:text-accent transition-colors">Quiz QCM</span>
                  <span className="text-[11px] text-muted truncate">Crée un quiz sur…</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handlePreset("Crée une checklist d'organisation pour ")}
                className="group flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-card/70 transition-colors border border-transparent hover:border-line/60"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 group-hover:scale-105 transition-transform">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-ink text-xs group-hover:text-accent transition-colors">Checklist d'organisation</span>
                  <span className="text-[11px] text-muted truncate">Crée une checklist pour…</span>
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-line/70 bg-card/85 shadow-xs transition-all focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/10 focus-within:bg-card">
          {/* Vignette d'image jointe */}
          {attachedImage && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-line bg-card p-2 mx-2 mt-2 animate-fade-in">
              <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-line bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachedImage.dataUrl}
                  alt={attachedImage.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">{attachedImage.name}</p>
                <p className="text-[10px] text-faint">{attachedImage.size} · Prête pour analyse / retouche</p>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="rounded-full p-1.5 text-muted hover:bg-ink/[0.05] hover:text-ink min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Retirer l'image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={
              streaming
                ? "Génération en cours…"
                : attachedImage
                  ? "Indiquez l'analyse ou la modification souhaitée sur cette image..."
                  : "Posez une question, demandez une carte mentale, une maquette, un SVG..."
            }
            aria-label="Votre message"
            className="max-h-[200px] w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed text-ink outline-none placeholder:text-faint/80"
          />

          <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-1 border-t border-line/40">
            <div className="flex items-center gap-1.5">
              {/* Bouton + pour joindre image */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Joindre une photo ou illustration à analyser"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:text-ink hover:bg-ink/[0.06] transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>

              {/* Sélecteur de modèle exactement comme l'image */}
              <div className="relative" ref={modelPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowModelPicker(!showModelPicker)}
                  title="Changer de modèle IA"
                  className="inline-flex h-8 items-center gap-2 rounded-xl border border-line/70 bg-panel/90 px-3 text-xs font-semibold text-ink hover:bg-card hover:border-line transition-colors shadow-2xs"
                >
                  <ModelProviderIcon
                    modelId={currentModel}
                    category={currentModelObj?.category}
                    className="h-4 w-4 shrink-0"
                  />
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {currentModelObj ? currentModelObj.label : currentModel}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted shrink-0 ml-0.5" />
                </button>

                {showModelPicker && (
                  <div className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 rounded-2xl border border-line/80 bg-panel/98 p-2.5 shadow-2xl backdrop-blur-2xl z-50 text-xs animate-fade-in">
                    {/* Champ de recherche */}
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted pointer-events-none" />
                      <input
                        type="text"
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        placeholder="Rechercher des modèles..."
                        autoFocus
                        className="w-full rounded-xl border border-line/70 bg-card/90 pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/70 outline-none focus:border-accent"
                      />
                    </div>

                    {/* Liste groupée par fournisseur */}
                    <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                      {groupedModels.length === 0 ? (
                        <p className="py-6 text-center text-xs text-muted">
                          Aucun modèle correspondant à &quot;{modelSearch}&quot;
                        </p>
                      ) : (
                        groupedModels.map((group) => (
                          <div key={group.provider} className="space-y-0.5">
                            <div className="px-2.5 pt-1 pb-1 text-[11px] font-semibold text-muted/80">
                              {group.provider}
                            </div>
                            {group.models.map((m) => {
                              const isCurrent = m.id === currentModel;
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => {
                                    onModelChange(m.id);
                                    setShowModelPicker(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                                    isCurrent
                                      ? "bg-accent/15 text-accent font-semibold"
                                      : "text-ink/90 hover:text-ink hover:bg-ink/[0.06]"
                                  )}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <ModelProviderIcon
                                      modelId={m.id}
                                      category={m.category}
                                      className="h-4 w-4 shrink-0"
                                    />
                                    <span className="truncate">{m.label}</span>
                                  </div>
                                  {isCurrent && (
                                    <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                title="Raccourcis visuels"
                className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs text-muted hover:bg-ink/[0.04] hover:text-ink transition-colors"
              >
                <Wand2 className="h-3.5 w-3.5 text-accent" />
                <span className="hidden sm:inline text-xs font-medium">Suggestions</span>
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {streaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-line/70 bg-ink/[0.03] px-3.5 text-xs font-semibold text-ink transition-colors hover:bg-ink/[0.06]"
                >
                  <Square className="h-3 w-3 fill-current" />
                  Arrêter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend}
                  aria-label="Envoyer le message"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                    canSend
                      ? "bg-accent text-white hover:bg-accent-strong shadow-xs"
                      : "cursor-not-allowed bg-ink/[0.04] text-faint"
                  )}
                >
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.2} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
