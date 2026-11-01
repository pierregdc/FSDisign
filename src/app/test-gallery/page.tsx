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
import { TravelBlockView } from "@/features/travel";
import { MathBlockView } from "@/features/math";
import { OnboardingModal } from "@/features/onboarding";
import { CURATED_MODELS } from "@/lib/ai-config";
import type { UIBlock } from "@/lib/ui-schema";

function GalleryContent() {
  const searchParams = useSearchParams();
  const blockType = searchParams.get("block") || "map";
  const onboardingStep = (parseInt(searchParams.get("step") || "1", 10) || 1) as 1 | 2 | 3 | 4;
  const travelTab = (searchParams.get("tab") as "overview" | "train" | "flight" | "car" | "walking" | "map") || "overview";
  const carEngine = (searchParams.get("engine") as "thermal" | "electric") || "thermal";
  const mathTab = (searchParams.get("mathTab") as "overview" | "formulas" | "geometry" | "functionPlot" | "spreadsheet") || "overview";
  const onlyMode = searchParams.get("only");

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
          {blockType === "onboarding" && (
            <div className="relative min-h-[600px] w-full flex items-center justify-center">
              <OnboardingModal
                key={onboardingStep}
                isOpen={true}
                initialStep={onboardingStep}
                onClose={() => {}}
                user={null}
                availableModels={CURATED_MODELS}
                currentModel="gpt-4o"
              />
            </div>
          )}

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

          {blockType === "travel" && onlyMode === "walking" && (
            <TravelBlockView
              block={{
                type: "travel",
                title: "Itinéraire à pied : Vieux-Port de Marseille → Callelongue",
                origin: {
                  name: "Vieux-Port de Marseille",
                  lat: 43.2951,
                  lng: 5.3744,
                  address: "Quai de la Fraternité, 13001 Marseille",
                },
                destination: {
                  name: "Callelongue (Porte des Calanques)",
                  lat: 43.2125,
                  lng: 5.3528,
                  address: "Callelongue, 13008 Marseille",
                },
                distanceKm: 14,
                summary:
                  "Randonnée littorale exceptionnelle longeant la Corniche Kennedy, le Vallon des Auffes, les plages du Prado et l'entrée sauvage du Parc National des Calanques.",
                recommendation:
                  "Parcours idéal pour les étudiants marseillais en week-end : 100% accessible en bus RTM (ligne 83 au départ, ligne 20 au retour) et 100% gratuit avec des panoramas maritimes grandioses.",
                walking: {
                  duration: "2h45 (Randonnée côtière)",
                  distance: "14 km",
                  steps: "18 500 pas",
                  calories: "740 kcal brûlées",
                  elevation: "+140 m / -120 m",
                  difficulty: "moderate",
                  highlights: [
                    "Vieux-Port & Ombrière de Norman Foster",
                    "Palais du Pharo avec vue panoramique",
                    "Port pittoresque du Vallon des Auffes",
                    "Corniche Kennedy face aux îles du Frioul",
                    "Anse de Malmousque & Bains militaires",
                    "Port de Callelongue et début des Calanques",
                  ],
                  tips: "Prévoir 1,5L d'eau par personne, casquette, crème solaire et de bonnes baskets. Retour possible en bus RTM n°20 depuis Callelongue jusqu'à la Madrague de Montredon.",
                },
              }}
            />
          )}

          {blockType === "travel" && onlyMode !== "walking" && (
            <TravelBlockView
              defaultTab={travelTab}
              defaultCarEngine={carEngine}
              block={{
                type: "travel",
                title: "Itinéraire & Plan de Voyage : Paris → Marseille",
                origin: {
                  name: "Paris (Île-de-France)",
                  lat: 48.8566,
                  lng: 2.3522,
                  address: "Centre d'Accueil Étudiant, Paris",
                },
                destination: {
                  name: "Marseille (Bouches-du-Rhône)",
                  lat: 43.2965,
                  lng: 5.3698,
                  address: "Campus Universitaire d'Aix-Marseille",
                },
                distanceKm: 775,
                summary:
                  "Liaison majeure entre la capitale et la façade méditerranéenne. Trajet direct disponible en TGV haute vitesse, vol direct régulier, autoroute du Soleil A6/A7 (thermique & Tesla) ou étapes cyclables et pédestres.",
                recommendation:
                  "Pour un étudiant, le TGV INOUI ou OUIGO depuis Paris Gare de Lyon reste imbattable : 3h15 de centre à centre, sans attente d'enregistrement, dès 19 € en OUIGO ou 29 € avec la Carte Avantage Jeune, avec un impact carbone quasi nul (2,1 kg CO2 contre 104 kg en avion).",
                flight: {
                  duration: "1h20 (vol direct)",
                  direct: true,
                  airports: {
                    departure: "Paris-Orly (ORY)",
                    arrival: "Marseille-Provence (MRS)",
                    departureCode: "ORY",
                    arrivalCode: "MRS",
                  },
                  prices: {
                    eco: "49 €",
                    premium: "135 €",
                    business: "260 €",
                  },
                  co2Kg: 104,
                  airlines: ["Air France", "Transavia", "EasyJet"],
                  frequency: "6 vols par jour",
                  tips: "Compter 45 min de trajet en RER B ou OrlyBus au départ, et 25 min de navette bus aéroport vers la gare Saint-Charles à l'arrivée.",
                },
                train: {
                  duration: "3h15 (Direct sans escale)",
                  stations: {
                    departure: "Paris Gare de Lyon",
                    arrival: "Marseille Saint-Charles",
                  },
                  trainTypes: ["TGV INOUI", "OUIGO Grande Vitesse"],
                  prices: {
                    standard: "19 € (OUIGO) / 35 € (TGV)",
                    firstClass: "59 € (1ère classe TGV)",
                  },
                  price: "19 €",
                  transfers: 0,
                  connections:
                    "Métro Ligne 14 ou Métro Ligne 1 jusqu'à Paris Gare de Lyon. À l'arrivée : Métro M1/M2 direct vers le Vieux-Port et le campus universitaire Aix-Marseille.",
                  co2Kg: 2.1,
                  frequency: "Un TGV toutes les 45 min",
                  tips: "Prises électriques 230V et USB à chaque siège, Wi-Fi TGV gratuit à bord, espace bar pour réviser ou déjeuner.",
                },
                car: {
                  duration: "7h30 (hors pauses)",
                  distance: "775 km",
                  tolls: "64,80 € (Péages autoroutes APRR & ASF)",
                  routeHighway: "Autoroute du Soleil A6 & A7 via Lyon et la Vallée du Rhône",
                  thermal: {
                    consumption: "6.4 L / 100 km (Moyenne 130 km/h)",
                    fuelCost: "88,50 € (Essence SP95-E10)",
                    totalCost: "153,30 € (Carburant + Péages)",
                    co2Kg: 126,
                    gasStations: [
                      {
                        name: "TotalEnergies Aire de Beaune-Tailly",
                        location: "Autoroute A6 km 312",
                        brand: "TotalEnergies",
                        services: ["Café & Restauration", "Sanitaires propres", "Gonflage"],
                      },
                      {
                        name: "Shell Aire de Montélimar Est",
                        location: "Autoroute A7 km 598",
                        brand: "Shell",
                        services: ["Boutique Nougat", "Espace détente", "Wi-Fi"],
                      },
                      {
                        name: "Avia Aire de Mâcon",
                        location: "Autoroute A6 km 385",
                        brand: "Avia",
                        services: ["Restauration bio", "Douches routières"],
                      },
                    ],
                  },
                  electric: {
                    autonomy: "480 km (Tesla Model 3 / Y Long Range)",
                    chargingStops: 2,
                    chargingTime: "42 min total (2x 21 min)",
                    chargingCost: "32,40 € (Réseau Superchargeurs Tesla)",
                    totalCost: "97,20 € (Recharge + Péages)",
                    co2Kg: 14,
                    superchargers: [
                      {
                        name: "Tesla Supercharger Beaune",
                        location: "Sortie A6 Beaune Centre",
                        powerKw: "250 kW V3",
                        stalls: "16 bornes",
                        duration: "20 min (20% → 80%)",
                      },
                      {
                        name: "Tesla Supercharger Montélimar Nord",
                        location: "Hôtel Ibis A7 Montélimar",
                        powerKw: "250 kW V3",
                        stalls: "20 bornes",
                        duration: "22 min (15% → 75%)",
                      },
                      {
                        name: "Station Ionity Val de Saône",
                        location: "Autoroute A6 km 355",
                        powerKw: "350 kW HPC",
                        stalls: "8 bornes CCS",
                        duration: "18 min",
                      },
                    ],
                  },
                  tips: "Le covoiturage (ex: Blablacar) permet de diviser la facture par 3 ou 4. Arrêt obligatoire toutes les 2h conseillé pour la sécurité.",
                },
                walking: {
                  duration: "2h45 (Étape urbaine & Calanques)",
                  distance: "14 km",
                  steps: "18 500 pas",
                  calories: "740 kcal brûlées",
                  elevation: "+140 m / -120 m",
                  difficulty: "moderate",
                  highlights: [
                    "Parcours du Vieux-Port au Palais du Pharo",
                    "Traversée panoramique de la Corniche Kennedy",
                    "Sentier maritime vers Callelongue & calanques",
                  ],
                  tips: "Prévoir de bonnes chaussures de marche, 1,5 L d'eau et une protection solaire.",
                },
                mapMarkers: [
                  {
                    label: "Paris Gare de Lyon (Départ Train & Voiture)",
                    lat: 48.8443,
                    lng: 2.3744,
                    category: "Départ",
                    icon: "🚆",
                    description: "Point de départ ferroviaire et départ autoroute A6.",
                  },
                  {
                    label: "Tesla Supercharger & Aire de Beaune",
                    lat: 47.026,
                    lng: 4.8377,
                    category: "Recharge & Essence",
                    icon: "⚡",
                    description: "16 bornes 250 kW V3 + Station essence TotalEnergies.",
                  },
                  {
                    label: "Lyon Part-Dieu (Étape intermédiaire)",
                    lat: 45.7601,
                    lng: 4.8596,
                    category: "Étape",
                    icon: "🏙️",
                    description: "Noeud de correspondance TGV et carrefour autoroutier A6/A7.",
                  },
                  {
                    label: "Tesla Supercharger Montélimar Nord",
                    lat: 44.5583,
                    lng: 4.7508,
                    category: "Recharge & Essence",
                    icon: "🔋",
                    description: "20 bornes 250 kW + Aire Shell Nougat de Montélimar.",
                  },
                  {
                    label: "Marseille Saint-Charles (Arrivée)",
                    lat: 43.3031,
                    lng: 5.3806,
                    category: "Arrivée",
                    icon: "🎯",
                    description: "Gare TGV centrale, métro M1/M2, accès Vieux-Port.",
                  },
                ],
              }}
            />
          )}

          {blockType === "math" && (
            <MathBlockView
              defaultTab={mathTab}
              block={{
                type: "math",
                title: "Étude de fonction & Géométrie euclidienne",
                description:
                  "Analyse complète d'une fonction quadratique, démonstration géométrique du théorème de Pythagore et tableur de valeurs.",
                topic: "analysis",
                summary:
                  "Le discriminant Δ = 4 admet deux zéros réels x₁ = 1 et x₂ = 3. Le sommet S(2, -1) constitue un minimum global. En géométrie, c² = a² + b² confirme l'orthogonalité en A.",
                formulas: [
                  {
                    name: "Équation du second degré",
                    latex: "x^2 - 4x + 3 = 0",
                    explanation: "Résolution par la méthode du discriminant avec factorisation canonique.",
                    variables: [
                      { symbol: "a", meaning: "Quadratique", value: "1" },
                      { symbol: "b", meaning: "Linéaire", value: "-4" },
                      { symbol: "c", meaning: "Constante", value: "3" },
                      { symbol: "Δ", meaning: "Discriminant", value: "4" },
                      { symbol: "x₁", meaning: "Racine 1", value: "1" },
                      { symbol: "x₂", meaning: "Racine 2", value: "3" },
                    ],
                    steps: [
                      {
                        step: 1,
                        title: "Coefficients",
                        latex: "a = 1, b = -4, c = 3",
                        explanation: "Forme canonique P(x) = ax² + bx + c.",
                      },
                      {
                        step: 2,
                        title: "Discriminant",
                        latex: "\\Delta = b^2 - 4ac = 16 - 12 = 4",
                        explanation: "Δ > 0, deux racines réelles distinctes.",
                      },
                      {
                        step: 3,
                        title: "Racines réelles",
                        latex: "x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} \\implies x_1 = 1, x_2 = 3",
                        explanation: "Points de passage sur l'axe des abscisses.",
                      },
                      {
                        step: 4,
                        title: "Sommet de la parabole",
                        latex: "S(2, -1) \\quad \\text{avec} \\; f'(2) = 0",
                        explanation: "Minimum absolu de la fonction.",
                      },
                    ],
                  },
                  {
                    name: "Théorème de Pythagore",
                    latex: "c^2 = a^2 + b^2 \\iff c = \\sqrt{a^2 + b^2}",
                    explanation: "Relation métrique fondamentale dans le triangle rectangle.",
                    variables: [
                      { symbol: "a", meaning: "Côté adjacent AB", value: "4 cm" },
                      { symbol: "b", meaning: "Côté opposé AC", value: "3 cm" },
                      { symbol: "c", meaning: "Hypoténuse BC", value: "5 cm" },
                    ],
                  },
                ],
                geometry: {
                  shapeType: "right_triangle",
                  title: "Triangle rectangle ABC",
                  description:
                    "Triangle rectangle en A avec a = 4 cm, b = 3 cm et hypoténuse c = 5 cm.",
                  theorems: [
                    "Pythagore (BC² = AB² + AC²)",
                    "Trigonométrie (cos α = 0.8)",
                    "Aire S = 6 cm²",
                  ],
                  properties: [
                    { label: "Côté a", value: "4.00 cm" },
                    { label: "Côté b", value: "3.00 cm" },
                    { label: "Hypoténuse c", value: "5.00 cm" },
                    { label: "Aire S", value: "6.00 cm²" },
                    { label: "Périmètre P", value: "12.00 cm" },
                    { label: "Angle α", value: "36.87°" },
                    { label: "Angle β", value: "53.13°" },
                    { label: "Rayon R", value: "2.50 cm" },
                  ],
                },
                functionPlot: {
                  fn: "x^2 - 4*x + 3",
                  label: "f(x) = x² - 4x + 3",
                  fn2: "2*x - 4",
                  label2: "f'(x) = 2x - 4",
                  xMin: -2,
                  xMax: 6,
                  yMin: -3,
                  yMax: 15,
                  description:
                    "Parabole convexe avec zéros en x=1 et x=3, et minimum en S(2, -1).",
                  keyPoints: [
                    { x: 1, y: 0, label: "x₁ (1, 0)", type: "root" },
                    { x: 3, y: 0, label: "x₂ (3, 0)", type: "root" },
                    { x: 2, y: -1, label: "S(2, -1)", type: "extremum" },
                    { x: 0, y: 3, label: "(0, 3)", type: "intercept" },
                  ],
                },
                spreadsheet: {
                  title: "Table de valeurs",
                  description:
                    "Échantillonnage régulier de x, f(x), de la dérivée f'(x) et des variations.",
                  columns: [
                    { id: "x", header: "x" },
                    { id: "fx", header: "f(x)", formula: "=x² - 4x + 3" },
                    { id: "fprime", header: "f'(x)", formula: "=2x - 4" },
                    { id: "xsquared", header: "x²", formula: "=x²" },
                    { id: "variation", header: "Variation" },
                  ],
                  rows: [
                    { x: -2, fx: 15, fprime: -8, xsquared: 4, variation: "Décroissante ↘" },
                    { x: -1, fx: 8, fprime: -6, xsquared: 1, variation: "Décroissante ↘" },
                    { x: 0, fx: 3, fprime: -4, xsquared: 0, variation: "Décroissante ↘" },
                    { x: 1, fx: 0, fprime: -2, xsquared: 1, variation: "Zéro 🎯" },
                    { x: 2, fx: -1, fprime: 0, xsquared: 4, variation: "Minimum ⬇" },
                    { x: 3, fx: 0, fprime: 2, xsquared: 9, variation: "Zéro 🎯" },
                    { x: 4, fx: 3, fprime: 4, xsquared: 16, variation: "Croissante ↗" },
                    { x: 5, fx: 8, fprime: 6, xsquared: 25, variation: "Croissante ↗" },
                    { x: 6, fx: 15, fprime: 8, xsquared: 36, variation: "Croissante ↗" },
                  ],
                  summary:
                    "La dérivée f'(x) s'annule en x=2, confirmant le minimum en S(2, -1).",
                },
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
