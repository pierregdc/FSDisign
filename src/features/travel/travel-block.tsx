"use client";

import { useMemo, useState } from "react";
import {
  Plane,
  Train,
  Car,
  Footprints,
  Clock,
  Euro,
  Leaf,
  MapPin,
  Zap,
  Fuel,
  Navigation,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  Flame,
  BatteryCharging,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { cn } from "@/lib/utils";
import { MapBlockView } from "@/features/map";

type TravelBlockData = Extract<UIBlock, { type: "travel" }>;

type TravelTab = "overview" | "train" | "flight" | "car" | "walking" | "map";
type FlightClass = "eco" | "premium" | "business";
type CarEngine = "thermal" | "electric";

export function TravelBlockView({
  block,
  defaultTab = "overview",
  defaultCarEngine = "thermal",
}: {
  block: TravelBlockData;
  defaultTab?: TravelTab;
  defaultCarEngine?: CarEngine;
}) {
  const [activeTab, setActiveTab] = useState<TravelTab>(defaultTab);
  const [flightClass, setFlightClass] = useState<FlightClass>("eco");
  const [carEngine, setCarEngine] = useState<CarEngine>(defaultCarEngine);

  // Formatage des données
  const originName = block.origin.name;
  const destName = block.destination.name;

  // Marqueurs cartographiques enrichis automatiquement si non fournis
  const mapBlockData = useMemo(() => {
    const markers = block.mapMarkers && block.mapMarkers.length > 0
      ? block.mapMarkers
      : [
          ...(block.origin.lat && block.origin.lng
            ? [{
                lat: block.origin.lat,
                lng: block.origin.lng,
                label: `Départ : ${originName}`,
                category: "Départ",
                icon: "📍",
                description: block.origin.address || `Point de départ à ${originName}`,
              }]
            : []),
          ...(block.destination.lat && block.destination.lng
            ? [{
                lat: block.destination.lat,
                lng: block.destination.lng,
                label: `Arrivée : ${destName}`,
                category: "Arrivée",
                icon: "🎯",
                description: block.destination.address || `Point d'arrivée à ${destName}`,
              }]
            : []),
        ];

    return {
      type: "map" as const,
      title: `Carte du trajet : ${originName} → ${destName}`,
      caption: `Itinéraire multimodal et points de passage entre ${originName} et ${destName}.`,
      height: 380,
      route: markers.length >= 2,
      markers: markers.length > 0 ? markers : [
        {
          lat: 48.8566,
          lng: 2.3522,
          label: originName,
          category: "Départ",
          icon: "📍",
          description: "Origine du voyage",
        },
        {
          lat: 43.2965,
          lng: 5.3698,
          label: destName,
          category: "Arrivée",
          icon: "🎯",
          description: "Destination du voyage",
        },
      ],
    };
  }, [block, originName, destName]);

  return (
    <div className="w-full space-y-6 text-slate-100 font-sans">
      {/* En-tête sans contour général lourd */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/40 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-400">
                <Navigation className="h-3.5 w-3.5" />
                Planificateur Multimodal
              </span>
              {block.distanceKm && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-0.5 text-xs text-slate-300 font-mono">
                  <Compass className="h-3 w-3 text-slate-400" />
                  ~{block.distanceKm} km
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>{originName}</span>
              <ArrowRight className="h-5 w-5 text-sky-400 shrink-0" />
              <span>{destName}</span>
            </h2>
            {block.summary && (
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {block.summary}
              </p>
            )}
          </div>

          {block.recommendation && (
            <div className="rounded-xl bg-emerald-500/10 p-3.5 md:max-w-xs shrink-0">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Conseil France Student
                  </div>
                  <div className="text-xs text-emerald-200/90 mt-0.5 leading-snug">
                    {block.recommendation}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barre d'onglets de navigation entre modes de transport */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "overview"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Comparatif Global</span>
          </button>

          {block.train && (
            <button
              type="button"
              onClick={() => setActiveTab("train")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "train"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Train className="h-4 w-4" />
              <span>Train</span>
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] text-emerald-300 font-mono font-bold">
                {block.train.duration.replace(/\s*\(.*\)/, "")}
              </span>
            </button>
          )}

          {block.flight && (
            <button
              type="button"
              onClick={() => setActiveTab("flight")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "flight"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Plane className="h-4 w-4" />
              <span>Avion</span>
              <span className="rounded-full bg-indigo-400/20 px-2 py-0.5 text-[10px] text-indigo-300 font-mono font-bold">
                {block.flight.duration.replace(/\s*\(.*\)/, "")}
              </span>
            </button>
          )}

          {block.car && (
            <button
              type="button"
              onClick={() => setActiveTab("car")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "car"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Car className="h-4 w-4" />
              <span>Voiture (Essence & Tesla)</span>
              <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] text-amber-300 font-mono font-bold">
                {block.car.duration.replace(/\s*\(.*\)/, "")}
              </span>
            </button>
          )}

          {block.walking && (
            <button
              type="button"
              onClick={() => setActiveTab("walking")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "walking"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Footprints className="h-4 w-4" />
              <span>À pied</span>
              <span className="rounded-full bg-rose-400/20 px-2 py-0.5 text-[10px] text-rose-300 font-mono font-bold">
                {block.walking.distance}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("map")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ml-auto",
              activeTab === "map"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <MapPin className="h-4 w-4 text-sky-400" />
            <span>Carte & Itinéraire</span>
          </button>
        </div>
      </div>

      {/* CONTENU SELON L'ONGLET SÉLECTIONNÉ */}

      {/* 1. ONGLET COMPARATIF GLOBAL */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Carte Train */}
            {block.train && (
              <div
                onClick={() => setActiveTab("train")}
                className="group relative cursor-pointer rounded-2xl bg-slate-900/70 p-5 backdrop-blur-sm transition-all hover:bg-slate-800/80 hover:translate-y-[-2px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                      <Train className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Train
                      </h4>
                      <p className="text-[11px] text-slate-400">Centre à centre-ville</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    ⭐ Top Étudiant
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      Durée
                    </span>
                    <span className="font-semibold text-white font-mono">
                      {block.train.duration.replace(/\s*\(.*\)/, "")}
                      <span className="text-[10px] text-emerald-400 ml-1 font-normal font-sans">Direct</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Euro className="h-3.5 w-3.5 text-emerald-400" />
                      Tarif
                    </span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      dès {block.train.price || block.train.prices?.standard}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                      Impact CO2
                    </span>
                    <span className="font-semibold text-emerald-300 font-mono">
                      {block.train.co2Kg ? `${block.train.co2Kg} kg` : "2.1 kg"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{block.train.trainTypes?.join(" · ") || "TGV INOUI · OUIGO"}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            )}

            {/* Carte Avion */}
            {block.flight && (
              <div
                onClick={() => setActiveTab("flight")}
                className="group relative cursor-pointer rounded-2xl bg-slate-900/70 p-5 backdrop-blur-sm transition-all hover:bg-slate-800/80 hover:translate-y-[-2px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                      <Plane className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        Vol / Avion
                      </h4>
                      <p className="text-[11px] text-slate-400">Ligne directe régulière</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                    Rapide
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" />
                      Durée vol
                    </span>
                    <span className="font-semibold text-white font-mono">
                      {block.flight.duration.replace(/\s*\(.*\)/, "")}
                      <span className="text-[10px] text-indigo-300 ml-1 font-normal font-sans">Vol direct</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Euro className="h-3.5 w-3.5 text-indigo-400" />
                      Tarif Éco
                    </span>
                    <span className="font-semibold text-indigo-300 font-mono">
                      dès {block.flight.prices.eco}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Leaf className="h-3.5 w-3.5 text-indigo-400" />
                      Impact CO2
                    </span>
                    <span className="font-semibold text-amber-300 font-mono">
                      {block.flight.co2Kg ? `${block.flight.co2Kg} kg` : "104 kg"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {block.flight.airports.departureCode} → {block.flight.airports.arrivalCode}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            )}

            {/* Carte Voiture */}
            {block.car && (
              <div
                onClick={() => setActiveTab("car")}
                className="group relative cursor-pointer rounded-2xl bg-slate-900/70 p-5 backdrop-blur-sm transition-all hover:bg-slate-800/80 hover:translate-y-[-2px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        Voiture
                      </h4>
                      <p className="text-[11px] text-slate-400">Essence &amp; Tesla / VE</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Autonomie
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      Temps route
                    </span>
                    <span className="font-semibold text-white font-mono">
                      {block.car.duration.replace(/\s*\(.*\)/, "")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Fuel className="h-3.5 w-3.5 text-amber-400" />
                      Carburant
                    </span>
                    <span className="font-semibold text-slate-200 font-mono">
                      {block.car.thermal.fuelCost.replace(/\s*\(.*\)/, "")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Zap className="h-3.5 w-3.5 text-sky-400" />
                      Recharge Tesla
                    </span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {block.car.electric.chargingCost.replace(/\s*\(.*\)/, "")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{block.car.distance} · {block.car.tolls ? "Péages estimés" : "Autoroute"}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            )}

            {/* Carte À pied */}
            {block.walking && (
              <div
                onClick={() => setActiveTab("walking")}
                className="group relative cursor-pointer rounded-2xl bg-slate-900/70 p-5 backdrop-blur-sm transition-all hover:bg-slate-800/80 hover:translate-y-[-2px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                      <Footprints className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                        À pied
                      </h4>
                      <p className="text-[11px] text-slate-400">Mobilité &amp; rando</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                    0g CO2
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-rose-400" />
                      Étape marche
                    </span>
                    <span className="font-semibold text-white font-mono">
                      {block.walking.distance} (~2h45)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Flame className="h-3.5 w-3.5 text-rose-400" />
                      Calories
                    </span>
                    <span className="font-semibold text-rose-300 font-mono">
                      {block.walking.calories?.replace(/\s*(brûlées|kcal).*/, "") || "740"} kcal
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Euro className="h-3.5 w-3.5 text-rose-400" />
                      Budget
                    </span>
                    <span className="font-semibold text-emerald-400 font-mono">0 € (Gratuit)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{block.walking.steps || "18 500 pas"}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            )}
          </div>

          {/* Tableau synthétique comparatif direct */}
          <div className="rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-400" />
                Matrice d&apos;aide à la décision étudiante
              </h3>
              <span className="text-xs text-slate-400">Données estimées pour 1 passager</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pr-4">Mode</th>
                    <th className="pb-3 px-4">Durée totale</th>
                    <th className="pb-3 px-4">Budget estimé</th>
                    <th className="pb-3 px-4">Impact Carbone</th>
                    <th className="pb-3 px-4">Confort &amp; Services</th>
                    <th className="pb-3 pl-4 text-right">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {block.train && (
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-white flex items-center gap-2">
                        <Train className="h-4 w-4 text-emerald-400" />
                        Train (TGV / OUIGO)
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">{block.train.duration}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                        {block.train.price || block.train.prices?.standard}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300 font-mono text-[11px]">
                          <Leaf className="h-3 w-3" />
                          {block.train.co2Kg ? `${block.train.co2Kg} kg` : "Très faible"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        Prises, Wi-Fi TGV, bar, bagages illimités
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <span className="rounded-full bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 text-[11px]">
                          ⭐ Choix n°1
                        </span>
                      </td>
                    </tr>
                  )}

                  {block.flight && (
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-white flex items-center gap-2">
                        <Plane className="h-4 w-4 text-indigo-400" />
                        Avion (Ligne régulière)
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        {block.flight.duration} + transit
                      </td>
                      <td className="py-3.5 px-4 font-mono text-indigo-300 font-semibold">
                        {block.flight.prices.eco}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-300 font-mono text-[11px]">
                          {block.flight.co2Kg ? `${block.flight.co2Kg} kg` : "Élevé"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        Enregistrement, contrôle sûreté, rapide en vol
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <span className="rounded-full bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-1 text-[11px]">
                          Si urgence
                        </span>
                      </td>
                    </tr>
                  )}

                  {block.car && (
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-white flex items-center gap-2">
                        <Car className="h-4 w-4 text-amber-400" />
                        Voiture (Thermique)
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">{block.car.duration}</td>
                      <td className="py-3.5 px-4 font-mono text-amber-400 font-semibold">
                        {block.car.thermal.totalCost || block.car.thermal.fuelCost}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-rose-300 font-mono text-[11px]">
                          {block.car.thermal.co2Kg ? `${block.car.thermal.co2Kg} kg` : "Important"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        Flexibilité totale, arrêts aires de repos
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <span className="rounded-full bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-1 text-[11px]">
                          Idéal covoiturage
                        </span>
                      </td>
                    </tr>
                  )}

                  {block.car && (
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-white flex items-center gap-2">
                        <Zap className="h-4 w-4 text-sky-400" />
                        Voiture (Électrique / Tesla)
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        {block.car.duration} + {block.car.electric.chargingTime}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-sky-300 font-semibold">
                        {block.car.electric.totalCost || block.car.electric.chargingCost}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300 font-mono text-[11px]">
                          {block.car.electric.co2Kg ? `${block.car.electric.co2Kg} kg` : "Faible"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        Superchargeurs 250 kW, silence, conduite fluide
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <span className="rounded-full bg-sky-500/20 text-sky-300 font-semibold px-2.5 py-1 text-[11px]">
                          Éco-mobilité
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ONGLET TRAIN */}
      {activeTab === "train" && block.train && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Liaison Ferroviaire Directe
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {block.train.stations.departure} → {block.train.stations.arrival}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Tarif Jeune / Standard</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {block.train.price?.replace(/\s*\(.*\)/, "") || block.train.prices?.standard?.replace(/\s*\(.*\)/, "") || "19 €"}
                  </div>
                </div>
                {block.train.prices?.firstClass && (
                  <div className="text-right border-l border-slate-800 pl-3">
                    <div className="text-xs text-slate-400">1ère Classe</div>
                    <div className="text-lg font-bold font-mono text-slate-200">
                      {block.train.prices.firstClass.replace(/\s*\(.*\)/, "")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline du trajet */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:to-sky-400">
              <div className="relative">
                <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                <h4 className="font-semibold text-white text-sm">Gare de départ</h4>
                <p className="text-xs text-slate-300 font-medium">{block.train.stations.departure}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Accès facile en transport en commun · Commerces &amp; salons d&apos;attente
                </p>
              </div>

              {block.train.connections && (
                <div className="relative rounded-xl bg-slate-800/40 p-3.5 my-2">
                  <div className="flex items-start gap-2.5">
                    <Navigation className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-sky-300">
                        Transports de liaison recommandés (Autre transport si nécessaire)
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        {block.train.connections}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-sky-400 ring-4 ring-sky-500/20" />
                <h4 className="font-semibold text-white text-sm">Gare d&apos;arrivée</h4>
                <p className="text-xs text-slate-300 font-medium">{block.train.stations.arrival}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Arrivée directe au cœur de la ville · Correspondances métros &amp; bus locales
                </p>
              </div>
            </div>

            {/* Badges types de train & éco-score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
              <div className="rounded-xl bg-slate-800/30 p-3.5">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Types de trains</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {block.train.trainTypes?.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300"
                    >
                      {t}
                    </span>
                  )) || (
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
                      TGV INOUI
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/30 p-3.5">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Éco-Empreinte</div>
                <div className="mt-1 flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold font-mono text-emerald-300">
                    {block.train.co2Kg ? `${block.train.co2Kg} kg CO2` : "2.1 kg CO2"}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">-98% vs avion</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/30 p-3.5">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Fréquence &amp; Temps</div>
                <div className="mt-1 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-400" />
                  <span className="text-sm font-bold font-mono text-white">
                    {block.train.duration.replace(/\s*\(.*\)/, "")}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {block.train.frequency || "Toutes les 45 min"}
                  </span>
                </div>
              </div>
            </div>

            {block.train.tips && (
              <div className="rounded-xl bg-slate-800/40 p-4 text-xs text-slate-300 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{block.train.tips}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ONGLET VOL / AVION */}
      {activeTab === "flight" && block.flight && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Vol Régulier Direct
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {block.flight.airports.departure.includes(block.flight.airports.departureCode || "###")
                    ? block.flight.airports.departure
                    : `${block.flight.airports.departure} (${block.flight.airports.departureCode || "DEP"})`}{" "}
                  →{" "}
                  {block.flight.airports.arrival.includes(block.flight.airports.arrivalCode || "###")
                    ? block.flight.airports.arrival
                    : `${block.flight.airports.arrival} (${block.flight.airports.arrivalCode || "ARR"})`}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Compagnies : {block.flight.airlines?.join(", ") || "Air France, Transavia, EasyJet"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Durée du vol :</span>
                <span className="rounded-lg bg-indigo-500/20 px-3 py-1 font-mono font-bold text-indigo-300 text-sm">
                  {block.flight.duration.replace(/\s*\(.*\)/, "")}
                  <span className="text-[10px] text-indigo-200 ml-1.5 font-normal font-sans">Vol direct</span>
                </span>
              </div>
            </div>

            {/* Sélecteur interactif de classe de vol */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Sélectionnez votre classe de voyage :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFlightClass("eco")}
                  className={cn(
                    "flex flex-col p-4 rounded-xl text-left transition-all cursor-pointer",
                    flightClass === "eco"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                      : "bg-slate-800/40 text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Économique</span>
                    <span className="text-sm font-mono font-bold">
                      {block.flight.prices.eco}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-2">
                    1 bagage cabine inclus (8 kg) · Siège standard · Boisson offerte
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFlightClass("premium")}
                  className={cn(
                    "flex flex-col p-4 rounded-xl text-left transition-all cursor-pointer",
                    flightClass === "premium"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                      : "bg-slate-800/40 text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Éco Premium</span>
                    <span className="text-sm font-mono font-bold">
                      {block.flight.prices.premium || "145 €"}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-2">
                    Bagage en soute 23 kg inclus · Siège plus spacieux (+15cm) · Embarquement prioritaire
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFlightClass("business")}
                  className={cn(
                    "flex flex-col p-4 rounded-xl text-left transition-all cursor-pointer",
                    flightClass === "business"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                      : "bg-slate-800/40 text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Affaires / Business</span>
                    <span className="text-sm font-mono font-bold">
                      {block.flight.prices.business || "290 €"}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-2">
                    Accès Lounge aéroport · Coupe-file SkyPriority · Billet 100% modifiable &amp; remboursable
                  </p>
                </button>
              </div>
            </div>

            {/* Infos aéroports & transferts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
              <div className="rounded-xl bg-slate-800/30 p-4 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase">
                  Aéroport de départ ({block.flight.airports.departureCode})
                </div>
                <div className="text-sm font-semibold text-white">
                  {block.flight.airports.departure}
                </div>
                <p className="text-xs text-slate-300">
                  Liaison conseillée : RER B direct ou navette OrlyBus (compter 45 min avant enregistrement).
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/30 p-4 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase">
                  Aéroport d&apos;arrivée ({block.flight.airports.arrivalCode})
                </div>
                <div className="text-sm font-semibold text-white">
                  {block.flight.airports.arrival}
                </div>
                <p className="text-xs text-slate-300">
                  Liaison conseillée : Tramway direct ligne 2 ou navette aéroport vers la gare centrale.
                </p>
              </div>
            </div>

            {block.flight.tips && (
              <div className="rounded-xl bg-slate-800/40 p-4 text-xs text-slate-300 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{block.flight.tips}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ONGLET VOITURE (ESSENCE VS TESLA / ÉLECTRIQUE) */}
      {activeTab === "car" && block.car && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Itinéraire Routier &amp; Autoroutes
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {originName} → {destName} ({block.car.distance})
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {block.car.routeHighway || "Via autoroutes principales avec aires de repos"} · Péages : {block.car.tolls || "Estimés"}
                </p>
              </div>

              {/* Bascule interactive Essence / Diesel vs Électrique / Tesla */}
              <div className="flex items-center rounded-xl bg-slate-800/80 p-1">
                <button
                  type="button"
                  onClick={() => setCarEngine("thermal")}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                    carEngine === "thermal"
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  )}
                >
                  <Fuel className="h-4 w-4" />
                  <span>⛽ Essence / Diesel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCarEngine("electric")}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                    carEngine === "electric"
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-300 hover:text-white"
                  )}
                >
                  <Zap className="h-4 w-4" />
                  <span>⚡ Électrique / Tesla</span>
                </button>
              </div>
            </div>

            {/* Vue MOTEUR THERMIQUE */}
            {carEngine === "thermal" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-slate-800/30 p-4">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Temps de route</div>
                    <div className="mt-1 text-lg font-bold font-mono text-white">
                      {block.car.duration.replace(/\s*\(.*\)/, "")}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Hors pauses recommandées</div>
                  </div>

                  <div className="rounded-xl bg-slate-800/30 p-4">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Consommation moyenne</div>
                    <div className="mt-1 text-lg font-bold font-mono text-amber-400">
                      {block.car.thermal.consumption.replace(/\s*\(.*\)/, "")}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Moyenne à 130 km/h autoroute</div>
                  </div>

                  <div className="rounded-xl bg-slate-800/30 p-4">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Budget Carburant</div>
                    <div className="mt-1 text-lg font-bold font-mono text-amber-300">
                      {block.car.thermal.fuelCost.replace(/\s*\(.*\)/, "")}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Essence SP95-E10 ou Gazole</div>
                  </div>

                  <div className="rounded-xl bg-slate-800/30 p-4">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Coût total trajet</div>
                    <div className="mt-1 text-lg font-bold font-mono text-white">
                      {block.car.thermal.totalCost?.replace(/\s*\(.*\)/, "") || `${parseFloat(block.car.thermal.fuelCost || "75") + 64.8} €`}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Carburant + Péages autoroute</div>
                  </div>
                </div>

                {/* Stations essence recommandées */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Fuel className="h-4 w-4" />
                    Stations essence &amp; Aires de repos recommandées sur le parcours
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {block.car.thermal.gasStations && block.car.thermal.gasStations.length > 0 ? (
                      block.car.thermal.gasStations.map((st, i) => (
                        <div key={i} className="rounded-xl bg-slate-800/40 p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{st.name}</span>
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300 font-mono">
                              {st.brand || "TotalEnergies"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">{st.location || "Sur le trajet"}</p>
                          {st.services && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {st.services.map((srv) => (
                                <span
                                  key={srv}
                                  className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-300"
                                >
                                  {srv}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="rounded-xl bg-slate-800/40 p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">Aire de Beaune - Tailly</span>
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300 font-mono">
                              TotalEnergies
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">Autoroute A6 km 312</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-300">
                              Café &amp; Restauration
                            </span>
                            <span className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-300">
                              Gonflage gratuit
                            </span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-800/40 p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">Aire de Montélimar Est</span>
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300 font-mono">
                              Shell
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">Autoroute A7 km 598</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-300">
                              Boutique Nougat
                            </span>
                            <span className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-300">
                              Sanitaires propres
                            </span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-800/40 p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">Aire du Jura</span>
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300 font-mono">
                              Avia
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">Autoroute A39</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-300">
                              Espace détente
                            </span>
                            <span className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-300">
                              Wi-Fi gratuit
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Vue MOTEUR ÉLECTRIQUE / TESLA */}
            {carEngine === "electric" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-slate-800/30 p-4">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Autonomie Véhicule</div>
                    <div className="mt-1 text-lg font-bold font-mono text-sky-400">
                      {block.car.electric.autonomy.replace(/\s*\(.*\)/, "")}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tesla Model 3 / Y Long Range</div>
                  </div>

                  <div className="rounded-xl bg-slate-800/30 p-4">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Arrêts Recharge</div>
                    <div className="mt-1 text-lg font-bold font-mono text-emerald-400">
                      {block.car.electric.chargingStops} arrêt{block.car.electric.chargingStops > 1 ? "s" : ""}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {block.car.electric.chargingTime.replace(/\s*\(.*\)/, "")} de pause
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-800/30 p-4">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Coût Supercharge</div>
                    <div className="mt-1 text-lg font-bold font-mono text-emerald-300">
                      {block.car.electric.chargingCost.replace(/\s*\(.*\)/, "")}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      ~60% d&apos;économie vs essence
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-800/30 p-4">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Recharge + Péages</div>
                    <div className="mt-1 text-lg font-bold font-mono text-white">
                      {block.car.electric.totalCost?.replace(/\s*\(.*\)/, "") || `${parseFloat(block.car.electric.chargingCost || "32") + 64.8} €`}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Émissions : {block.car.electric.co2Kg ? `${block.car.electric.co2Kg} kg` : "14 kg CO2"}
                    </div>
                  </div>
                </div>

                {/* Stations Superchargeurs Tesla recommandées */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Bornes Superchargeurs Tesla V3 &amp; Ionity recommandées
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {block.car.electric.superchargers && block.car.electric.superchargers.length > 0 ? (
                      block.car.electric.superchargers.map((sc, i) => (
                        <div key={i} className="rounded-xl bg-slate-800/40 p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{sc.name}</span>
                            <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] text-sky-300 font-mono">
                              {sc.powerKw || "250 kW"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">{sc.location || "Sur l'autoroute"}</p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{sc.stalls || "16 bornes disponibles"}</span>
                            <span className="font-semibold text-emerald-400">
                              Arrêt : {sc.duration || "20 min"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="rounded-xl bg-slate-800/40 p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">Tesla Supercharger Beaune</span>
                            <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] text-sky-300 font-mono">
                              250 kW V3
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">Sortie A6 Beaune Centre</p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>16 bornes V3 CCS</span>
                            <span className="font-semibold text-emerald-400">Arrêt 20 min (20% → 80%)</span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-800/40 p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">Tesla Supercharger Montélimar</span>
                            <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] text-sky-300 font-mono">
                              250 kW V3
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">Hôtel Ibis A7 Montélimar Nord</p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>20 bornes V3 CCS</span>
                            <span className="font-semibold text-emerald-400">Arrêt 22 min (15% → 75%)</span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-800/40 p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">Station Ionity Val-de-Meuse</span>
                            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300 font-mono">
                              350 kW HPC
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">Aire de repos A31</p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>8 bornes ultra-rapides</span>
                            <span className="font-semibold text-indigo-300">Pause café &amp; recharge</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {block.car.tips && (
              <div className="rounded-xl bg-slate-800/40 p-4 text-xs text-slate-300 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{block.car.tips}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. ONGLET À PIED */}
      {activeTab === "walking" && block.walking && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Mobilité Douce &amp; Randonnée Pédestre
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Parcours à pied : {block.walking.distance} · {block.walking.duration}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Profil d&apos;effort : {block.walking.difficulty || "Modéré"} · Dénivelé : {block.walking.elevation || "+85m / -70m"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-rose-500/20 px-3 py-1 font-mono font-bold text-rose-300 text-sm flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-rose-400" />
                  {block.walking.calories || "650 kcal"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-800/30 p-4">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Distance</div>
                <div className="mt-1 text-lg font-bold font-mono text-white">
                  {block.walking.distance}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Par chemins &amp; voies piétonnes</div>
              </div>

              <div className="rounded-xl bg-slate-800/30 p-4">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Nombre de pas</div>
                <div className="mt-1 text-lg font-bold font-mono text-rose-400">
                  {block.walking.steps || "18 000 pas"}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Objectif santé quotidien atteint</div>
              </div>

              <div className="rounded-xl bg-slate-800/30 p-4">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Rythme estimé</div>
                <div className="mt-1 text-lg font-bold font-mono text-slate-200">
                  ~4.8 km/h
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Marche active régulière</div>
              </div>

              <div className="rounded-xl bg-slate-800/30 p-4">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Empreinte CO2</div>
                <div className="mt-1 text-lg font-bold font-mono text-emerald-400">
                  0.0 kg (Zéro)
                </div>
                <div className="text-[10px] text-emerald-300 mt-0.5">100% neutre &amp; écologique</div>
              </div>
            </div>

            {block.walking.highlights && block.walking.highlights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Points d&apos;intérêt sur le chemin piétonnier
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {block.walking.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-slate-800/40 p-3 text-xs text-slate-200 flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {block.walking.tips && (
              <div className="rounded-xl bg-slate-800/40 p-4 text-xs text-slate-300 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{block.walking.tips}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. ONGLET CARTE DU PARCOURS */}
      {activeTab === "map" && (
        <div className="rounded-2xl bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-400" />
                Tracé cartographique ESRI du trajet
              </h3>
              <p className="text-xs text-slate-400">
                Visualisez les étapes, les gares, les aéroports et les stations de recharge le long du trajet.
              </p>
            </div>
            <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-400 font-mono">
              ESRI World Street HD
            </span>
          </div>

          <MapBlockView block={mapBlockData} />
        </div>
      )}
    </div>
  );
}
