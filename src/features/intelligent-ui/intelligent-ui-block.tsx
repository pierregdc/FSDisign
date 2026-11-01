"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Cpu,
  Utensils,
  Receipt,
  Scale,
  Gamepad2,
  Layers,
  Sparkles,
  Check,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Users,
  Trophy,
  Sliders,
  ArrowUpRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { cn } from "@/lib/utils";

type IntelligentUiBlockType = Extract<UIBlock, { type: "intelligentUi" }>;

export type IntelligentUiTab =
  | "overview"
  | "explodedDiagram"
  | "smartRecipe"
  | "billSplitter"
  | "decisionMatrix"
  | "tileGame";

export function IntelligentUiBlockView({
  block,
  onPrompt,
  initialTab,
}: {
  block: IntelligentUiBlockType;
  onPrompt?: (prompt: string) => void;
  initialTab?: IntelligentUiTab;
}) {
  const availableSections = useMemo(() => {
    const list: { id: IntelligentUiTab; label: string; icon: React.ReactNode }[] = [];
    if (block.explodedDiagram) {
      list.push({
        id: "explodedDiagram",
        label: "Schéma Éclaté",
        icon: <Cpu className="h-3.5 w-3.5" />,
      });
    }
    if (block.smartRecipe) {
      list.push({
        id: "smartRecipe",
        label: "Recette Dynamique",
        icon: <Utensils className="h-3.5 w-3.5" />,
      });
    }
    if (block.billSplitter) {
      list.push({
        id: "billSplitter",
        label: "Partage d'Addition",
        icon: <Receipt className="h-3.5 w-3.5" />,
      });
    }
    if (block.decisionMatrix) {
      list.push({
        id: "decisionMatrix",
        label: "Matrice de Décision",
        icon: <Scale className="h-3.5 w-3.5" />,
      });
    }
    if (block.tileGame) {
      list.push({
        id: "tileGame",
        label: "Mini-Jeu Tuiles",
        icon: <Gamepad2 className="h-3.5 w-3.5" />,
      });
    }
    return list;
  }, [
    block.explodedDiagram,
    block.smartRecipe,
    block.billSplitter,
    block.decisionMatrix,
    block.tileGame,
  ]);

  const resolvedDefaultTab: IntelligentUiTab = useMemo(() => {
    if (initialTab) return initialTab;
    if (block.defaultTab) return block.defaultTab;
    if (availableSections.length === 1) return availableSections[0].id;
    return "overview";
  }, [initialTab, block.defaultTab, availableSections]);

  const [activeTab, setActiveTab] = useState<IntelligentUiTab>(resolvedDefaultTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ================= 1. STATE SCHÉMA ÉCLATÉ =================
  const diagram = block.explodedDiagram;
  const [selectedPartId, setSelectedPartId] = useState<string>(
    diagram?.parts?.[0]?.id || ""
  );
  const [isExploded, setIsExploded] = useState<boolean>(true);
  const [simValue, setSimValue] = useState<number>(
    diagram?.simulationDefault ?? 80
  );

  const activePart = useMemo(() => {
    if (!diagram?.parts?.length) return null;
    return (
      diagram.parts.find((p) => p.id === selectedPartId) || diagram.parts[0]
    );
  }, [diagram, selectedPartId]);

  const simRatio = useMemo(() => {
    const def = diagram?.simulationDefault || 80;
    return def > 0 ? simValue / def : 1;
  }, [simValue, diagram]);

  // ================= 2. STATE RECETTE DYNAMIQUE =================
  const recipe = block.smartRecipe;
  const [servings, setServings] = useState<number>(
    recipe?.defaultServings ?? 4
  );
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");
  const [checkedIngredients, setCheckedIngredients] = useState<
    Record<string, boolean>
  >({});
  const [activeTimers, setActiveTimers] = useState<
    Record<number, { remaining: number; running: boolean; total: number }>
  >({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          const stepNum = Number(key);
          const t = next[stepNum];
          if (t && t.running && t.remaining > 0) {
            next[stepNum] = {
              ...t,
              remaining: t.remaining - 1,
              running: t.remaining - 1 > 0,
            };
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTimer = (stepNumber: number, durationSeconds: number) => {
    setActiveTimers((prev) => {
      const current = prev[stepNumber];
      if (!current) {
        return {
          ...prev,
          [stepNumber]: {
            remaining: durationSeconds,
            running: true,
            total: durationSeconds,
          },
        };
      }
      return {
        ...prev,
        [stepNumber]: {
          ...current,
          running: !current.running,
        },
      };
    });
  };

  const resetTimer = (stepNumber: number, durationSeconds: number) => {
    setActiveTimers((prev) => ({
      ...prev,
      [stepNumber]: {
        remaining: durationSeconds,
        running: false,
        total: durationSeconds,
      },
    }));
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ================= 3. STATE PARTAGE D'ADDITION =================
  const splitter = block.billSplitter;
  const [tipPercent, setTipPercent] = useState<number>(
    splitter?.defaultTipPercent ?? 10
  );
  const [splitMode, setSplitMode] = useState<"equal" | "assigned">("equal");
  const [billItems, setBillItems] = useState(() => splitter?.items || []);
  const [participants, setParticipants] = useState(
    () => splitter?.participants || ["Alice", "Lucas", "Chloé", "Hugo"]
  );
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const currency = splitter?.currency || "€";

  const billSummary = useMemo(() => {
    const subtotal = billItems.reduce((acc, it) => acc + it.price, 0);
    const tipAmount = (subtotal * tipPercent) / 100;
    const total = subtotal + tipAmount;

    const perPerson: Record<string, { base: number; tip: number; total: number }> =
      {};
    const count = Math.max(1, participants.length);

    if (splitMode === "equal") {
      const eachBase = subtotal / count;
      const eachTip = tipAmount / count;
      for (const p of participants) {
        perPerson[p] = {
          base: eachBase,
          tip: eachTip,
          total: eachBase + eachTip,
        };
      }
    } else {
      for (const p of participants) {
        perPerson[p] = { base: 0, tip: 0, total: 0 };
      }
      let unassignedTotal = 0;
      for (const item of billItems) {
        if (item.assignedTo && perPerson[item.assignedTo] !== undefined) {
          perPerson[item.assignedTo].base += item.price;
        } else {
          unassignedTotal += item.price;
        }
      }
      const sharedPerPerson = unassignedTotal / count;
      for (const p of participants) {
        perPerson[p].base += sharedPerPerson;
        const shareRatio = subtotal > 0 ? perPerson[p].base / subtotal : 1 / count;
        perPerson[p].tip = tipAmount * shareRatio;
        perPerson[p].total = perPerson[p].base + perPerson[p].tip;
      }
    }

    return { subtotal, tipAmount, total, perPerson };
  }, [billItems, tipPercent, participants, splitMode]);

  const cycleItemAssignee = (itemId: string) => {
    setBillItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const currentIdx = it.assignedTo
          ? participants.indexOf(it.assignedTo)
          : -1;
        const nextPerson =
          currentIdx + 1 < participants.length
            ? participants[currentIdx + 1]
            : undefined;
        return { ...it, assignedTo: nextPerson };
      })
    );
  };

  const handleAddBillItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newItemPrice.replace(",", "."));
    if (!newItemLabel.trim() || isNaN(price) || price <= 0) return;
    setBillItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        label: newItemLabel.trim(),
        price,
        assignedTo: participants[0],
      },
    ]);
    setNewItemLabel("");
    setNewItemPrice("");
  };

  // ================= 4. STATE MATRICE DE DÉCISION =================
  const matrix = block.decisionMatrix;
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const c of matrix?.criteria || []) {
      initial[c.id] = c.defaultWeight;
    }
    return initial;
  });

  const rankedOptions = useMemo(() => {
    if (!matrix) return [];
    const totalWeight = matrix.criteria.reduce(
      (sum, c) => sum + (weights[c.id] ?? c.defaultWeight),
      0
    );
    return matrix.options
      .map((opt) => {
        let weightedSum = 0;
        for (const c of matrix.criteria) {
          const w = weights[c.id] ?? c.defaultWeight;
          const s = opt.scores[c.id] ?? 5;
          weightedSum += w * s;
        }
        const matchPercent =
          totalWeight > 0 ? Math.round((weightedSum / (totalWeight * 10)) * 100) : 0;
        return {
          ...opt,
          matchPercent,
          weightedScore:
            totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : "0.0",
        };
      })
      .sort((a, b) => b.matchPercent - a.matchPercent);
  }, [matrix, weights]);

  // ================= 5. STATE MINI-JEU DE TUILES =================
  const game = block.tileGame;
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongFlash, setWrongFlash] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [lastHint, setLastHint] = useState<string | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  const rightColumnOrder = useMemo(() => {
    if (!game?.pairs) return [];
    const copy = [...game.pairs];
    // Mélange déterministe selon shuffleSeed
    for (let i = copy.length - 1; i > 0; i--) {
      const j = (i * 7 + shuffleSeed * 3 + 1) % (i + 1);
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }, [game, shuffleSeed]);

  const handleTileSelect = (side: "left" | "right", pairId: string) => {
    if (matchedIds.includes(pairId)) return;
    const nextLeft = side === "left" ? pairId : selectedLeft;
    const nextRight = side === "right" ? pairId : selectedRight;

    if (side === "left") setSelectedLeft(pairId);
    if (side === "right") setSelectedRight(pairId);

    if (nextLeft && nextRight) {
      setMoves((m) => m + 1);
      if (nextLeft === nextRight) {
        setMatchedIds((prev) => [...prev, nextLeft]);
        setStreak((s) => s + 1);
        const found = game?.pairs.find((p) => p.id === nextLeft);
        setLastHint(
          found?.hint || `Association validée : ${found?.leftLabel} ↔ ${found?.rightLabel}`
        );
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setStreak(0);
        setWrongFlash(true);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setWrongFlash(false);
        }, 550);
      }
    }
  };

  const resetGame = () => {
    setMatchedIds([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setStreak(0);
    setMoves(0);
    setLastHint(null);
    setShuffleSeed((s) => s + 1);
  };

  const showSection = (id: IntelligentUiTab) =>
    activeTab === "overview" || activeTab === id;

  return (
    <div className="w-full space-y-6 text-slate-100 animate-fade-in">
      {/* En-tête minimaliste FS Smart UI */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-wide text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>FS Smart UI · Composants Interactifs</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400 shadow-xs">
              <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
              Bêta
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
            {block.title || "Interface Intelligente Interactive"}
          </h3>
          {block.subtitle && (
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {block.subtitle}
            </p>
          )}
        </div>

        {/* Navigation par onglets si plusieurs sous-modules sont présents */}
        {availableSections.length > 1 && (
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-900/70 p-1 border border-slate-800/70">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                activeTab === "overview"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Vue complète</span>
            </button>
            {availableSections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveTab(sec.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                  activeTab === sec.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {sec.icon}
                <span>{sec.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
          1. SCHÉMA ÉCLATÉ & EXPLORATION MÉCANIQUE / PHYSIQUE (Exploded Diagram)
         ===================================================================== */}
      {diagram && showSection("explodedDiagram") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-indigo-400">
                  01 · Schéma Éclaté &amp; Simulation
                </span>
                {diagram.category && (
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] text-slate-400 border border-slate-800">
                    {diagram.category}
                  </span>
                )}
              </div>
              <h4 className="text-base font-semibold text-white mt-0.5">
                {diagram.objectName}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExploded((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              >
                {isExploded ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Vue Éclatée active</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Vue Assemblée</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Canevas Vectoriel Interactif avec Hotspots */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-950/70 border border-slate-800/70 p-4 space-y-4">
              <div className="relative w-full aspect-[16/10] rounded-xl bg-slate-950 overflow-hidden border border-slate-900">
                <svg
                  viewBox="0 0 100 65"
                  className="w-full h-full select-none"
                >
                  <defs>
                    <pattern
                      id="gpt6-blueprint-grid"
                      width="5"
                      height="5"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 5 0 L 0 0 0 5"
                        fill="none"
                        stroke="rgba(148,163,184,0.06)"
                        strokeWidth="0.2"
                      />
                    </pattern>
                    <radialGradient id="gpt6-hotspot-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
                      <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                    </radialGradient>
                  </defs>

                  {/* Grille technique subtile */}
                  <rect width="100" height="65" fill="url(#gpt6-blueprint-grid)" />

                  {/* Axes d'assemblage éclaté */}
                  <line
                    x1="10"
                    y1="32.5"
                    x2="90"
                    y2="32.5"
                    stroke="rgba(99,102,241,0.22)"
                    strokeWidth="0.3"
                    strokeDasharray="1.2 1.2"
                  />

                  {/* Lignes de liaison entre les composants */}
                  {diagram.parts.map((part, idx) => {
                    const nextPart = diagram.parts[idx + 1];
                    if (!nextPart) return null;
                    const offset1 = isExploded ? (idx - (diagram.parts.length - 1) / 2) * 3.5 : 0;
                    const offset2 = isExploded ? (idx + 1 - (diagram.parts.length - 1) / 2) * 3.5 : 0;
                    const x1 = Math.max(8, Math.min(92, part.x + offset1));
                    const y1 = (part.y * 65) / 100;
                    const x2 = Math.max(8, Math.min(92, nextPart.x + offset2));
                    const y2 = (nextPart.y * 65) / 100;

                    return (
                      <g key={`link-${part.id}`}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="rgba(148,163,184,0.28)"
                          strokeWidth="0.45"
                          strokeDasharray={isExploded ? "1.2 0.8" : undefined}
                        />
                      </g>
                    );
                  })}

                  {/* Sous-ensembles mécaniques / engrenages vectoriels */}
                  {diagram.parts.map((part, idx) => {
                    const isSelected = activePart?.id === part.id;
                    const offset = isExploded
                      ? (idx - (diagram.parts.length - 1) / 2) * 3.5
                      : 0;
                    const cx = Math.max(8, Math.min(92, part.x + offset));
                    const cy = (part.y * 65) / 100;
                    const radius = isSelected ? 7.2 : 5.4;

                    return (
                      <g
                        key={part.id}
                        onClick={() => setSelectedPartId(part.id)}
                        className="cursor-pointer transition-all duration-300"
                      >
                        {isSelected && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={13}
                            fill="url(#gpt6-hotspot-glow)"
                          />
                        )}

                        {/* Anneau technique extérieur */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={radius}
                          fill="rgba(15,23,42,0.9)"
                          stroke={isSelected ? "#818cf8" : "rgba(148,163,184,0.35)"}
                          strokeWidth={isSelected ? "0.7" : "0.4"}
                          strokeDasharray={isSelected ? "2 1" : undefined}
                        />

                        {/* Point central numéroté */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={3.2}
                          fill={isSelected ? "#4f46e5" : "#1e293b"}
                          stroke={isSelected ? "#c7d2fe" : "#475569"}
                          strokeWidth="0.4"
                        />

                        <text
                          x={cx}
                          y={cy + 1}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="2.7"
                          fontWeight="600"
                          fontFamily="monospace"
                        >
                          {idx + 1}
                        </text>

                        {/* Étiquette flottante */}
                        <g transform={`translate(${cx}, ${cy + radius + 3.2})`}>
                          <rect
                            x="-17"
                            y="-2.4"
                            width="34"
                            height="4.4"
                            rx="1.2"
                            fill={
                              isSelected
                                ? "rgba(79,70,229,0.9)"
                                : "rgba(15,23,42,0.85)"
                            }
                            stroke={
                              isSelected
                                ? "rgba(165,180,252,0.6)"
                                : "rgba(51,65,85,0.6)"
                            }
                            strokeWidth="0.25"
                          />
                          <text
                            x="0"
                            y="0.5"
                            textAnchor="middle"
                            fill={isSelected ? "#ffffff" : "#cbd5e1"}
                            fontSize="2.0"
                            fontWeight="500"
                          >
                            {part.name.slice(0, 24)}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* Barre de statut en surimpression */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="rounded-md bg-slate-900/80 backdrop-blur px-2 py-1 text-[10px] font-mono text-slate-300 border border-slate-800">
                    {isExploded ? "MODE : ÉCLATÉ AXIAL" : "MODE : ASSEMBLÉ"} · {diagram.parts.length} COMPOSANTS
                  </span>
                  <span className="rounded-md bg-indigo-950/80 backdrop-blur px-2 py-1 text-[10px] font-mono text-indigo-300 border border-indigo-500/30">
                    {diagram.simulationLabel || "Simulation"} : {simValue} {diagram.simulationUnit || "RPM"}
                  </span>
                </div>
              </div>

              {/* Curseur de simulation physique en temps réel */}
              <div className="rounded-xl bg-slate-900/50 border border-slate-800/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{diagram.simulationLabel || "Paramètre de simulation dynamique"}</span>
                  </span>
                  <span className="font-mono font-semibold text-indigo-300">
                    {simValue} {diagram.simulationUnit || "RPM"}
                  </span>
                </div>
                <input
                  type="range"
                  min={diagram.simulationMin ?? 20}
                  max={diagram.simulationMax ?? 160}
                  value={simValue}
                  onChange={(e) => setSimValue(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Min : {diagram.simulationMin ?? 20} {diagram.simulationUnit || "RPM"}</span>
                  <span>Nominal : {diagram.simulationDefault ?? 80} {diagram.simulationUnit || "RPM"}</span>
                  <span>Max : {diagram.simulationMax ?? 160} {diagram.simulationUnit || "RPM"}</span>
                </div>
              </div>
            </div>

            {/* Panneau d'inspection de la pièce sélectionnée */}
            <div className="lg:col-span-5 space-y-3">
              {/* Sélecteur rapide de pièces */}
              <div className="flex flex-wrap gap-1.5">
                {diagram.parts.map((part, idx) => {
                  const isSelected = activePart?.id === part.id;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => setSelectedPartId(part.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all border cursor-pointer",
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500 text-white"
                          : "bg-slate-900/50 border-slate-800/70 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      )}
                    >
                      <span className="font-mono text-[10px] text-indigo-400">
                        0{idx + 1}
                      </span>
                      <span>{part.name}</span>
                    </button>
                  );
                })}
              </div>

              {activePart && (
                <div className="rounded-2xl bg-slate-900/40 border border-slate-800/70 p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">
                      Composant sélectionné
                    </span>
                    <h5 className="text-base font-semibold text-white">
                      {activePart.name}
                    </h5>
                    <p className="text-xs font-medium text-slate-300">
                      {activePart.role}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activePart.description}
                  </p>

                  {/* Métriques recalculées en temps réel selon le curseur */}
                  {activePart.metrics && activePart.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {activePart.metrics.map((m, i) => {
                        const factor = m.scaleFactor ?? 1;
                        const computed =
                          factor === 0
                            ? m.baseValue
                            : m.baseValue * (1 + (simRatio - 1) * factor);
                        return (
                          <div
                            key={i}
                            className="rounded-xl bg-slate-950/70 border border-slate-800/60 p-3"
                          >
                            <div className="text-[10px] text-slate-400">
                              {m.label}
                            </div>
                            <div className="text-sm font-mono font-semibold text-white mt-0.5">
                              {computed.toFixed(1)}{" "}
                              <span className="text-xs font-normal text-indigo-400">
                                {m.unit}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {onPrompt && (
                    <button
                      type="button"
                      onClick={() =>
                        onPrompt(
                          `Explique en détail le fonctionnement physique et mécanique du composant "${activePart.name}" dans "${diagram.objectName}" avec ses formules et cas pratiques.`
                        )
                      }
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 px-3.5 py-2 text-xs font-medium text-indigo-300 transition-all cursor-pointer"
                    >
                      <span>Approfondir « {activePart.name} » avec GPT-6</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          2. RECETTE & PLANIFICATEUR DE PORTIONS DYNAMIQUE (Smart Recipe)
         ===================================================================== */}
      {recipe && showSection("smartRecipe") && (
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-emerald-400">
                02 · Planificateur &amp; Recette Dynamique
              </span>
              <h4 className="text-base font-semibold text-white mt-0.5">
                {recipe.dishName}
              </h4>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                {recipe.prepTime && <span>Préparation : {recipe.prepTime}</span>}
                {recipe.cookTime && <span>· Cuisson : {recipe.cookTime}</span>}
                {recipe.difficulty && <span>· Niveau : {recipe.difficulty}</span>}
                {recipe.caloriesPerServing && (
                  <span className="text-emerald-400 font-mono">
                    · {recipe.caloriesPerServing * servings} kcal total ({recipe.caloriesPerServing} kcal/pers.)
                  </span>
                )}
              </div>
            </div>

            {/* Contrôles : sélecteur de convives + bascule Métrique / Impérial */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white cursor-pointer"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-xs font-mono font-semibold text-white min-w-[72px] text-center">
                  {servings} {servings > 1 ? "convives" : "convive"}
                </span>
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.min(24, s + 1))}
                  className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setUnitSystem("metric")}
                  className={cn(
                    "rounded-lg px-2.5 py-1 font-medium transition-all cursor-pointer",
                    unitSystem === "metric"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  Métrique (g/ml)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem("imperial")}
                  className={cn(
                    "rounded-lg px-2.5 py-1 font-medium transition-all cursor-pointer",
                    unitSystem === "imperial"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  Impérial (oz/cups)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Liste d'ingrédients mise à l'échelle automatiquement */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/35 border border-slate-800/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Ingrédients calibrés ({servings} pers.)
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  {Object.values(checkedIngredients).filter(Boolean).length}/
                  {recipe.ingredients.length} cochés
                </span>
              </div>

              <div className="divide-y divide-slate-800/50">
                {recipe.ingredients.map((ing, i) => {
                  const isChecked = !!checkedIngredients[ing.name];
                  const rawAmount =
                    unitSystem === "imperial" && ing.amountImperialPerServing
                      ? ing.amountImperialPerServing * servings
                      : ing.amountPerServing * servings;
                  const formattedAmount =
                    rawAmount >= 10
                      ? Math.round(rawAmount)
                      : Math.round(rawAmount * 10) / 10;
                  const unit =
                    unitSystem === "imperial" && ing.unitImperial
                      ? ing.unitImperial
                      : ing.unitMetric;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setCheckedIngredients((prev) => ({
                          ...prev,
                          [ing.name]: !prev[ing.name],
                        }))
                      }
                      className="w-full py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-900/40 px-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "h-4 w-4 rounded flex items-center justify-center border transition-all",
                            isChecked
                              ? "bg-emerald-500 border-emerald-500 text-slate-950"
                              : "border-slate-700 bg-slate-950"
                          )}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </span>
                        <span
                          className={cn(
                            "text-xs transition-all",
                            isChecked
                              ? "line-through text-slate-500"
                              : "text-slate-200"
                          )}
                        >
                          {ing.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-emerald-300">
                        {formattedAmount} {unit}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Étapes de préparation avec minuteurs interactifs intégrés */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-900/35 border border-slate-800/70 p-4 space-y-3">
              <span className="text-xs font-semibold text-white block">
                Étapes &amp; Minuteurs interactifs
              </span>
              <div className="space-y-2.5">
                {recipe.steps.map((st) => {
                  const timer = activeTimers[st.stepNumber];
                  const remaining = timer ? timer.remaining : st.durationSeconds || 0;
                  const isRunning = !!timer?.running;

                  return (
                    <div
                      key={st.stepNumber}
                      className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-semibold flex items-center justify-center">
                            {st.stepNumber}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {st.title}
                          </span>
                        </div>

                        {st.durationSeconds && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                toggleTimer(st.stepNumber, st.durationSeconds!)
                              }
                              className={cn(
                                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-mono font-medium transition-all cursor-pointer border",
                                isRunning
                                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                  : "bg-slate-900 border-slate-800 text-emerald-300 hover:border-emerald-500/40"
                              )}
                            >
                              {isRunning ? (
                                <Pause className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                              <span>{formatTimer(remaining)}</span>
                            </button>
                            {timer && (
                              <button
                                type="button"
                                onClick={() =>
                                  resetTimer(st.stepNumber, st.durationSeconds!)
                                }
                                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                                title="Réinitialiser le minuteur"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pl-7">
                        {st.instruction}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          3. PARTAGE D'ADDITION & BUDGET DE GROUPE (Bill Splitter)
         ===================================================================== */}
      {splitter && showSection("billSplitter") && (
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-sky-400">
                03 · Calculateur &amp; Partage d&apos;Addition en Direct
              </span>
              <h4 className="text-base font-semibold text-white mt-0.5">
                {splitter.eventName}
              </h4>
            </div>

            <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSplitMode("equal")}
                className={cn(
                  "rounded-lg px-3 py-1 font-medium transition-all cursor-pointer",
                  splitMode === "equal"
                    ? "bg-sky-600 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                Partage Égal
              </button>
              <button
                type="button"
                onClick={() => setSplitMode("assigned")}
                className={cn(
                  "rounded-lg px-3 py-1 font-medium transition-all cursor-pointer",
                  splitMode === "assigned"
                    ? "bg-sky-600 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                Par Article Assigné
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Liste des articles + ajout rapide */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-900/35 border border-slate-800/70 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Détail de la note ({billItems.length} lignes)
                </span>
                <span className="text-[11px] text-slate-400">
                  {splitMode === "assigned"
                    ? "Cliquez sur un prénom pour réassigner"
                    : "Répartition équitable entre tous"}
                </span>
              </div>

              <div className="divide-y divide-slate-800/50">
                {billItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-slate-200 font-medium">
                        {item.label}
                      </span>
                      {splitMode === "assigned" && (
                        <button
                          type="button"
                          onClick={() => cycleItemAssignee(item.id)}
                          className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-[10px] font-medium text-sky-300 hover:bg-sky-500/25 transition-colors cursor-pointer"
                        >
                          {item.assignedTo || "Commun (Tous)"}
                        </button>
                      )}
                    </div>
                    <span className="text-xs font-mono font-semibold text-white">
                      {item.price.toFixed(2)} {currency}
                    </span>
                  </div>
                ))}
              </div>

              {/* Formulaire d'ajout de dépense à la volée */}
              <form
                onSubmit={handleAddBillItem}
                className="flex items-center gap-2 pt-2 border-t border-slate-800/60"
              >
                <input
                  type="text"
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  placeholder="Ajouter un article (ex: Dessert)..."
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="Prix €"
                  className="w-24 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-xl bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Ajouter</span>
                </button>
              </form>

              {/* Curseur de pourboire / frais de service */}
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Pourboire / Service :</span>
                  <span className="font-mono font-semibold text-sky-300">
                    {tipPercent}% (+{billSummary.tipAmount.toFixed(2)} {currency})
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={1}
                  value={tipPercent}
                  onChange={(e) => setTipPercent(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            {/* Synthèse par participant */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/35 border border-slate-800/70 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div>
                  <span className="text-[11px] text-slate-400 block">
                    Total général (avec service)
                  </span>
                  <span className="text-lg font-mono font-bold text-white">
                    {billSummary.total.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">
                    Participants
                  </span>
                  <span className="text-sm font-mono font-semibold text-sky-400">
                    {participants.length} personnes
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {participants.map((person) => {
                  const share = billSummary.perPerson[person] || {
                    base: 0,
                    tip: 0,
                    total: 0,
                  };
                  return (
                    <div
                      key={person}
                      className="rounded-xl bg-slate-950/70 border border-slate-800/70 p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                          {person}
                        </span>
                        <span className="text-[10px] font-mono text-sky-400">
                          {billSummary.total > 0
                            ? Math.round((share.total / billSummary.total) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="text-sm font-mono font-bold text-white">
                        {share.total.toFixed(2)} {currency}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Base {share.base.toFixed(2)}{currency} + Tip {share.tip.toFixed(2)}{currency}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          4. MATRICE DE DÉCISION PONDÉRÉE (Decision Matrix)
         ===================================================================== */}
      {matrix && showSection("decisionMatrix") && (
        <section className="space-y-4 pt-2">
          <div>
            <span className="text-xs font-medium text-amber-400">
              04 · Comparateur &amp; Matrice de Décision Pondérée
            </span>
            <h4 className="text-base font-semibold text-white mt-0.5">
              {matrix.topic}
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Curseurs de pondération des critères */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/35 border border-slate-800/70 p-4 space-y-3">
              <span className="text-xs font-semibold text-white block">
                Ajustez vos priorités (1 à 10) :
              </span>
              <div className="space-y-3">
                {matrix.criteria.map((c) => {
                  const val = weights[c.id] ?? c.defaultWeight;
                  return (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{c.label}</span>
                        <span className="font-mono font-semibold text-amber-300">
                          {val} / 10
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={val}
                        onChange={(e) =>
                          setWeights((prev) => ({
                            ...prev,
                            [c.id]: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Classement dynamique en temps réel */}
            <div className="lg:col-span-7 space-y-2.5">
              {rankedOptions.map((opt, idx) => (
                <div
                  key={opt.id}
                  className={cn(
                    "rounded-2xl p-4 border transition-all",
                    idx === 0
                      ? "bg-amber-950/20 border-amber-500/40"
                      : "bg-slate-900/35 border-slate-800/70"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "h-6 w-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center",
                          idx === 0
                            ? "bg-amber-500 text-slate-950"
                            : "bg-slate-800 text-slate-300"
                        )}
                      >
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {opt.name}
                          </span>
                          {idx === 0 && (
                            <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                              Meilleur choix
                            </span>
                          )}
                        </div>
                        {opt.tagline && (
                          <p className="text-[11px] text-slate-400">
                            {opt.tagline}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-mono font-bold text-white">
                        {opt.matchPercent}%
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400">
                        Note : {opt.weightedScore}/10
                      </span>
                    </div>
                  </div>

                  {/* Barre de score */}
                  <div className="mt-3 h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        idx === 0 ? "bg-amber-400" : "bg-slate-600"
                      )}
                      style={{ width: `${opt.matchPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          5. MINI-JEU D'APPRENTISSAGE PAR TUILES (Tile Matching Game)
         ===================================================================== */}
      {game && showSection("tileGame") && (
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-purple-400">
                05 · Mini-Jeu Interactif d&apos;Association Conceptuelle
              </span>
              <h4 className="text-base font-semibold text-white mt-0.5">
                {game.title}
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                Paires :{" "}
                <strong className="text-white">
                  {matchedIds.length}/{game.pairs.length}
                </strong>
              </span>
              <span className="text-xs font-mono text-purple-300">
                Série : 🔥 x{streak}
              </span>
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Mélanger</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/35 border border-slate-800/70 p-4 space-y-4">
            {matchedIds.length === game.pairs.length ? (
              <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-5 text-center space-y-2">
                <Trophy className="h-7 w-7 text-emerald-400 mx-auto" />
                <div className="text-sm font-semibold text-white">
                  Félicitations ! Toutes les paires ont été associées en {moves} coups.
                </div>
                {lastHint && (
                  <p className="text-xs text-emerald-300">{lastHint}</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Colonne gauche : Concepts */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                    Concepts / Termes
                  </span>
                  {game.pairs.map((p) => {
                    const isMatched = matchedIds.includes(p.id);
                    const isSelected = selectedLeft === p.id;
                    return (
                      <button
                        key={`left-${p.id}`}
                        type="button"
                        disabled={isMatched}
                        onClick={() => handleTileSelect("left", p.id)}
                        className={cn(
                          "w-full rounded-xl p-3 text-left text-xs font-medium border transition-all cursor-pointer flex items-center justify-between",
                          isMatched
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 opacity-60"
                            : isSelected
                            ? wrongFlash
                              ? "bg-rose-950/50 border-rose-500 text-rose-200"
                              : "bg-purple-950/50 border-purple-500 text-white"
                            : "bg-slate-950/70 border-slate-800/80 text-slate-200 hover:border-slate-700"
                        )}
                      >
                        <span>{p.leftLabel}</span>
                        {isMatched && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Colonne droite : Définitions / Équivalents mélangés */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                    Correspondances / Formules
                  </span>
                  {rightColumnOrder.map((p) => {
                    const isMatched = matchedIds.includes(p.id);
                    const isSelected = selectedRight === p.id;
                    return (
                      <button
                        key={`right-${p.id}`}
                        type="button"
                        disabled={isMatched}
                        onClick={() => handleTileSelect("right", p.id)}
                        className={cn(
                          "w-full rounded-xl p-3 text-left text-xs font-medium border transition-all cursor-pointer flex items-center justify-between",
                          isMatched
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 opacity-60"
                            : isSelected
                            ? wrongFlash
                              ? "bg-rose-950/50 border-rose-500 text-rose-200"
                              : "bg-purple-950/50 border-purple-500 text-white"
                            : "bg-slate-950/70 border-slate-800/80 text-slate-200 hover:border-slate-700"
                        )}
                      >
                        <span>{p.rightLabel}</span>
                        {isMatched && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {lastHint && matchedIds.length < game.pairs.length && (
              <div className="rounded-xl bg-purple-950/20 border border-purple-500/30 px-3.5 py-2 text-xs text-purple-200">
                💡 {lastHint}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
