"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MapBlockView } from "@/features/map";
import { ChartBlockView } from "@/features/chart";
import { VisualDocBlockView } from "@/features/visual-doc";
import { DiagramBlockView } from "@/features/diagram";
import { SvgBlockView } from "@/features/svg";
import { QuizBlockView } from "@/features/quiz";
import { KpiBlockView } from "@/features/kpi";
import { MockupBlockView } from "@/features/mockup";
import type { UIBlock } from "@/lib/ui-schema";

function GalleryContent() {
  const searchParams = useSearchParams();
  const blockType = searchParams.get("block") || "map";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 flex flex-col items-center justify-start">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
              FranceStudent Studio UI Test Benchmark
            </span>
            <h1 className="text-xl font-bold text-white capitalize">
              Module en test : {blockType}
            </h1>
          </div>
          <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs text-sky-400 font-mono">
            Rendu Réel 1200x800
          </span>
        </div>

        <div className="w-full">
          {blockType === "map" && (
            <MapBlockView
              block={{
                type: "map",
                title: "Campus Universitaires & Espaces Étudiants à Paris",
                caption: "Points d'intérêt principaux pour les étudiants internationaux de France Student.",
                height: 420,
                route: true,
                markers: [
                  {
                    lat: 48.8566,
                    lng: 2.3522,
                    label: "Centre d'Accueil France Student (Hôtel de Ville)",
                    category: "Accueil",
                    description: "Guichet unique d'orientation administrative et de validation des dossiers d'études.",
                    icon: "pin",
                  },
                  {
                    lat: 48.8462,
                    lng: 2.3449,
                    label: "Sorbonne Université (Campus Pierre et Marie Curie)",
                    category: "Universités",
                    description: "Pôle scientifique d'excellence et bibliothèque universitaire générale.",
                    icon: "college",
                  },
                  {
                    lat: 48.8268,
                    lng: 2.3601,
                    label: "Bibliothèque Nationale François-Mitterrand (BnF)",
                    category: "Bibliothèques",
                    description: "Espace de travail silencieux et centre de documentation national.",
                    icon: "book",
                  },
                  {
                    lat: 48.8205,
                    lng: 2.3384,
                    label: "Cité Internationale Universitaire de Paris",
                    category: "Résidences",
                    description: "Résidence étudiante internationale et restaurant universitaire Crous.",
                    icon: "home",
                  },
                ],
              }}
            />
          )}

          {blockType === "chart" && (
            <div className="space-y-6">
              <ChartBlockView
                block={{
                  type: "chart",
                  chartType: "bar",
                  title: "Budget moyen mensuel d'un étudiant en France",
                  unit: "€",
                  data: [
                    { label: "Logement", value: 550 },
                    { label: "Alimentation", value: 240 },
                    { label: "Transports", value: 85 },
                    { label: "Santé & Assurances", value: 45 },
                    { label: "Fournitures & Livres", value: 65 },
                    { label: "Loisirs & Culture", value: 90 },
                  ],
                }}
              />
              <ChartBlockView
                block={{
                  type: "chart",
                  chartType: "line",
                  title: "Progression des inscriptions internationales (2020 - 2026)",
                  unit: "étudiants",
                  data: [
                    { label: "2020", value: 1200 },
                    { label: "2021", value: 1850 },
                    { label: "2022", value: 2900 },
                    { label: "2023", value: 4100 },
                    { label: "2024", value: 5600 },
                    { label: "2025", value: 7400 },
                    { label: "2026", value: 9800 },
                  ],
                }}
              />
            </div>
          )}

          {blockType === "visualDoc" && (
            <VisualDocBlockView
              block={{
                type: "visualDoc",
                docType: "sheet",
                badge: "Fiche Méthode Officielle",
                title: "Méthodologie de la Dissertation Universitaire",
                subtitle: "Guide pas-à-pas pour réussir l'introduction, la problématique et le plan détaillé.",
                author: "Pôle Pédagogique France Student",
                sections: [
                  {
                    heading: "L'Analyse du sujet et la définition des termes",
                    content: "Ne commencez jamais par la rédaction. Déconstruisez chaque mot-clé du sujet en identifiant ses synonymes, ses antonymes et les champs sémantiques associés. Délimitez le cadre chronologique et géographique.",
                    bullets: [
                      "Interroger le sens premier et le sens dérivé de chaque concept",
                      "Repérer les connecteurs logiques (et, ou, dans, face à)",
                      "Identifier la tension ou le paradoxe sous-jacent",
                    ],
                    takeaway: "Une bonne analyse évite à 100% le hors-sujet qui est la première cause d'échec.",
                  },
                  {
                    heading: "La Construction de la problématique",
                    highlight: true,
                    content: "La problématique n'est pas une simple reformulation de la consigne. C'est la question centrale qui naît de la contradiction identifiée lors de l'analyse.",
                    bullets: [
                      "Doit pouvoir susciter un débat ou une controverse légitime",
                      "Doit déboucher sur une réponse argumentée en 2 ou 3 parties",
                    ],
                    takeaway: "Une problématique réussie appelle une démonstration, jamais un simple 'oui' ou 'non'.",
                  },
                  {
                    heading: "L'Introduction selon la règle de l'entonnoir",
                    content: "Respectez rigoureusement les 4 étapes : Accroche (contexte historique ou citation), Définition des termes et cadrage, Problématique explicite, et Annonce élégante du plan.",
                    takeaway: "L'introduction représente la première impression du correcteur : soignez le style et l'orthographe.",
                  },
                ],
              }}
            />
          )}

          {blockType === "diagram" && (
            <DiagramBlockView
              block={{
                type: "diagram",
                diagramType: "mindmap",
                title: "Écosystème Pédagogique & Technologies Éducatives Avancées",
                nodes: [
                  {
                    id: "root",
                    label: "Intelligence Artificielle & Nouvelles Technologies d'Apprentissage",
                    category: "Pôle Majeur",
                    description: "Modèles d'apprentissage et tuteurs cognitifs pour la personnalisation du parcours universitaire.",
                    x: 400,
                    y: 60,
                    color: "#0284c7",
                  },
                  {
                    id: "tools",
                    label: "Outils d'Analyse Automatisée des Dossiers Universitaires",
                    category: "Méthodologie",
                    description: "Extraction sémantique, plans de dissertation assistés et synthèse rapide de corpus académiques.",
                    x: 220,
                    y: 200,
                    color: "#10b981",
                  },
                  {
                    id: "vis",
                    label: "Modélisation Graphique des Compétences & Cartographie",
                    category: "Cognition Visuelle",
                    description: "Représentation structurée des concepts et cartographie des relations logiques complexes.",
                    x: 580,
                    y: 200,
                    color: "#8b5cf6",
                  },
                  {
                    id: "flash",
                    label: "Fiches Synthétiques de Révision Pédagogique",
                    x: 120,
                    y: 330,
                    color: "#10b981",
                  },
                  {
                    id: "quiz",
                    label: "Évaluation Formative & QCM Adaptatifs",
                    x: 290,
                    y: 420,
                    color: "#f59e0b",
                  },
                  {
                    id: "mind",
                    label: "Cartes Conceptuelles & Structuration de la Pensée",
                    x: 510,
                    y: 420,
                    color: "#8b5cf6",
                  },
                  {
                    id: "mock",
                    label: "Prototypage & Interfaces Étudiantes Interactives",
                    x: 680,
                    y: 330,
                    color: "#ec4899",
                  },
                ],
                edges: [
                  { from: "root", to: "tools" },
                  { from: "root", to: "vis" },
                  { from: "tools", to: "flash" },
                  { from: "tools", to: "quiz" },
                  { from: "vis", to: "mind" },
                  { from: "vis", to: "mock" },
                ],
              }}
            />
          )}

          {blockType === "quiz" && (
            <QuizBlockView
              block={{
                type: "quiz",
                title: "Évaluation Méthodologique & Algorithmique",
                description: "Testez votre compréhension des notions fondamentales du programme universitaire France Student.",
                questions: [
                  {
                    id: "q1",
                    question: "Quelle est la principale caractéristique d'une fonction récursive en algorithmique ?",
                    options: [
                      { id: "a", label: "Elle s'exécute uniquement en mémoire vive sans utiliser la pile d'appels." },
                      { id: "b", label: "Elle s'appelle elle-même et possède au moins une condition d'arrêt (cas de base).", correct: true },
                      { id: "c", label: "Elle ne peut traiter que des structures de données linéaires comme les listes." },
                      { id: "d", label: "Elle est obligatoirement plus rapide qu'une boucle itérative classique." },
                    ],
                    explanation: "Une fonction récursive résout un problème en le décomposant en sous-problèmes identiques par auto-appel. Le cas de base est indispensable pour éviter une récursion infinie (Stack Overflow).",
                  },
                  {
                    id: "q2",
                    question: "Dans une dissertation académique, quel est le rôle d'une véritable problématique ?",
                    options: [
                      { id: "a", label: "Résumer chronologiquement les faits historiques évoqués dans le sujet." },
                      { id: "b", label: "Formuler la question centrale née de la tension ou contradiction du sujet.", correct: true },
                      { id: "c", label: "Donner immédiatement son avis personnel dès les premières lignes." },
                      { id: "d", label: "Traduire les termes du sujet en anglais académique." },
                    ],
                    explanation: "La problématique n'est pas une simple reformulation : elle met en lumière le paradoxe du sujet et dicte l'ensemble du plan de démonstration en 2 ou 3 parties.",
                  },
                ],
              }}
            />
          )}

          {blockType === "kpi" && (
            <KpiBlockView
              block={{
                type: "kpi",
                title: "Tableau de Bord de Révision Hebdomadaire",
                items: [
                  { label: "Heures d'étude", value: "34 h", change: "+15 %", trend: "up", hint: "vs sem. passée", target: "40 h" },
                  { label: "Fiches maîtrisées", value: "28", change: "+4", trend: "up", hint: "sur 32 fiches", target: "32" },
                  { label: "Score moyen Quiz", value: "17.4/20", change: "+1.2 pt", trend: "up", hint: "sur 12 tests", target: "18/20" },
                  { label: "Rappels en attente", value: "3", change: "-2", trend: "down", hint: "avant vendredi", target: "0 tâche" },
                ],
              }}
            />
          )}

          {blockType === "mockup" && (
            <MockupBlockView
              block={{
                type: "mockup",
                title: "Application Mobile Étudiante - France Student",
                device: "mobile",
                screens: [
                  {
                    id: "home",
                    name: "Accueil Étudiant",
                    type: "dashboard",
                    title: "France Student Mobile",
                    subtitle: "Espace personnel · Thomas Laurent",
                    elements: [
                      {
                        id: "next_course",
                        kind: "card",
                        label: "Prochain cours en Amphi",
                        value: "Droit Constitutionnel II · Amphi 4",
                        meta: "Aujourd'hui · Dans 25 min",
                        targetScreenId: "planning",
                      },
                      {
                        id: "metric_moyenne",
                        kind: "kpi",
                        label: "Moyenne générale",
                        value: "15.8 / 20",
                        meta: "+0.4 pt · Rang : 4ème / 142",
                      },
                      {
                        id: "metric_ects",
                        kind: "kpi",
                        label: "Crédits ECTS validés",
                        value: "24 / 30 ECTS",
                        meta: "Semestre 1 validé · Cible 60 ECTS",
                      },
                      {
                        id: "btn_fiches",
                        kind: "button",
                        label: "Consulter l'emploi du temps complet",
                        value: "3 cours planifiés aujourd'hui",
                        targetScreenId: "planning",
                      },
                    ],
                  },
                  {
                    id: "planning",
                    name: "Planning & Cours",
                    type: "custom",
                    title: "Emploi du Temps Hebdomadaire",
                    subtitle: "Semaine 42 · Faculté de Droit & Sciences Éco",
                    elements: [
                      {
                        id: "c1",
                        kind: "card",
                        label: "08:30 - 10:30 · Droit Constitutionnel II",
                        value: "Amphi 4 · Pr. Laurent",
                        meta: "En cours · CM Obligatoire",
                      },
                      {
                        id: "c2",
                        kind: "card",
                        label: "11:00 - 13:00 · Économie Politique & Monnaie",
                        value: "Salle 204 · Dr. Benali",
                        meta: "À venir · TD Noté",
                      },
                      {
                        id: "c3",
                        kind: "card",
                        label: "14:30 - 16:30 · Méthodologie du Cas Pratique",
                        value: "Amphi Michelet · Mme Girard",
                        meta: "Après-midi · Atelier",
                      },
                    ],
                  },
                  {
                    id: "chat",
                    name: "Assistant Tuteur",
                    type: "chat",
                    title: "Tuteur Pédagogique IA",
                    subtitle: "Assistance continue aux devoirs et révisions",
                    elements: [],
                  },
                ],
              }}
            />
          )}

          {blockType === "svg" && (
            <SvgBlockView
              block={{
                type: "svg",
                title: "Schéma d'Architecture Vectorielle France Student",
                description: "Représentation modulaire des couches logicielles, des micro-services et du flux temps réel.",
                code: `<svg viewBox="0 0 800 420" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#1e40af" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#4338ca" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#047857" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#b45309" stop-opacity="0.95"/>
    </linearGradient>

    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="1" fill="#334155" opacity="0.3"/>
    </pattern>
  </defs>

  <rect width="800" height="420" rx="20" fill="#0b1120"/>
  <rect width="800" height="420" rx="20" fill="url(#grid)"/>

  <!-- Connectors with clean spacing (no overlap) -->
  <!-- Top Connector: Studio -> IA -->
  <path d="M 330 115 L 350 115" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6 4"/>
  <path d="M 450 115 L 470 115" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6 4"/>
  <polygon points="464,110 474,115 464,120" fill="#38bdf8"/>
  <rect x="350" y="102" width="100" height="26" rx="13" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="400" y="119" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">Flux SSE &amp; JSON</text>

  <!-- Bottom Connector: Offline -> Visuel -->
  <path d="M 330 305 L 340 305" stroke="#34d399" stroke-width="2.5" stroke-dasharray="6 4"/>
  <polygon points="336,300 326,305 336,310" fill="#34d399"/>
  <path d="M 460 305 L 470 305" stroke="#34d399" stroke-width="2.5" stroke-dasharray="6 4"/>
  <rect x="340" y="292" width="120" height="26" rx="13" fill="#0f172a" stroke="#34d399" stroke-width="1.5"/>
  <text x="400" y="309" fill="#34d399" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">Sync &amp; Cache Local</text>

  <path d="M 190 175 L 190 245" stroke="#38bdf8" stroke-width="2.5"/>
  <polygon points="185,240 190,250 195,240" fill="#38bdf8"/>

  <path d="M 610 175 L 610 245" stroke="#818cf8" stroke-width="2.5"/>
  <polygon points="605,240 610,250 615,240" fill="#818cf8"/>

  <!-- Node 1: Client Studio -->
  <rect x="50" y="55" width="280" height="120" rx="16" fill="url(#skyGrad)" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="70" y="75" width="36" height="36" rx="8" fill="#ffffff" fill-opacity="0.15"/>
  <text x="88" y="98" fill="#ffffff" font-size="18" text-anchor="middle" font-family="sans-serif">💻</text>
  <text x="120" y="88" fill="#ffffff" font-size="15" font-weight="bold" font-family="sans-serif">Interface Studio Client</text>
  <text x="120" y="108" fill="#bae6fd" font-size="11" font-family="sans-serif">React 19 · Next.js · Electron Standalone</text>
  <rect x="70" y="130" width="115" height="22" rx="11" fill="#ffffff" fill-opacity="0.2"/>
  <text x="127" y="145" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">Application Desktop</text>

  <!-- Node 2: Moteur IA -->
  <rect x="470" y="55" width="280" height="120" rx="16" fill="url(#indigoGrad)" stroke="#818cf8" stroke-width="1.5"/>
  <rect x="490" y="75" width="36" height="36" rx="8" fill="#ffffff" fill-opacity="0.15"/>
  <text x="508" y="98" fill="#ffffff" font-size="18" text-anchor="middle" font-family="sans-serif">⚡</text>
  <text x="540" y="88" fill="#ffffff" font-size="15" font-weight="bold" font-family="sans-serif">Moteur IA & Tuteurs</text>
  <text x="540" y="108" fill="#e0e7ff" font-size="11" font-family="sans-serif">Streaming SSE · RAG Sémantique</text>
  <rect x="490" y="130" width="105" height="22" rx="11" fill="#ffffff" fill-opacity="0.2"/>
  <text x="542" y="145" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">Temps Réel Zod</text>

  <!-- Node 3: Studio Visuel -->
  <rect x="50" y="245" width="280" height="120" rx="16" fill="url(#emeraldGrad)" stroke="#34d399" stroke-width="1.5"/>
  <rect x="70" y="265" width="36" height="36" rx="8" fill="#ffffff" fill-opacity="0.15"/>
  <text x="88" y="288" fill="#ffffff" font-size="18" text-anchor="middle" font-family="sans-serif">🎨</text>
  <text x="120" y="278" fill="#ffffff" font-size="15" font-weight="bold" font-family="sans-serif">Composants Visuels</text>
  <text x="120" y="298" fill="#a7f3d0" font-size="11" font-family="sans-serif">Cartes ESRI · Chart · Mindmap · Quiz</text>
  <rect x="70" y="320" width="115" height="22" rx="11" fill="#ffffff" fill-opacity="0.2"/>
  <text x="127" y="335" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">Rendu Frameless</text>

  <!-- Node 4: Stockage & Cache -->
  <rect x="470" y="245" width="280" height="120" rx="16" fill="url(#amberGrad)" stroke="#fbbf24" stroke-width="1.5"/>
  <rect x="490" y="265" width="36" height="36" rx="8" fill="#ffffff" fill-opacity="0.15"/>
  <text x="508" y="288" fill="#ffffff" font-size="18" text-anchor="middle" font-family="sans-serif">🗄️</text>
  <text x="540" y="278" fill="#ffffff" font-size="15" font-weight="bold" font-family="sans-serif">Persistance & Offline</text>
  <text x="540" y="298" fill="#fde68a" font-size="11" font-family="sans-serif">Chiffrement AES · SQLite · IndexedDB</text>
  <rect x="490" y="320" width="105" height="22" rx="11" fill="#ffffff" fill-opacity="0.2"/>
  <text x="542" y="335" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">Données Locales</text>
</svg>`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Chargement du test...</div>}>
      <GalleryContent />
    </Suspense>
  );
}
