import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { BlockSchema, UIResponseSchema } from "../src/lib/ui-schema.ts";
import { parsePartialUI } from "../src/lib/partial-ui.ts";
import { uiToText } from "../src/lib/ui-text.ts";

test("Canva Schema: SvgBlock validates valid vector SVG code", () => {
  const sample = {
    type: "svg",
    title: "Logo vectoriel",
    description: "Logo minimaliste pour France Student",
    code: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#0139b7"/></svg>',
    viewBox: "0 0 100 100",
    animated: true,
  };

  const parsed = BlockSchema.safeParse(sample);
  assert.equal(parsed.success, true, "Valid SvgBlock should parse successfully");
  if (parsed.success) {
    assert.equal(parsed.data.type, "svg");
    assert.equal(parsed.data.title, "Logo vectoriel");
  }
});

test("Canva Schema: DiagramBlock validates mindmap, flowchart, and technical architecture schemas", () => {
  const mindmapSample = {
    type: "diagram",
    diagramType: "mindmap",
    title: "Carte mentale Système Solaire",
    nodes: [
      { id: "root", label: "Soleil", shape: "round", color: "#f59e0b" },
      { id: "earth", label: "Terre", shape: "round", color: "#3b82f6" },
      { id: "mars", label: "Mars", shape: "round", color: "#ef4444" },
    ],
    edges: [
      { from: "root", to: "earth", label: "orbite", arrow: true },
      { from: "root", to: "mars", label: "orbite", arrow: true },
    ],
    interactive: true,
    animated: true,
  };

  const parsed = BlockSchema.safeParse(mindmapSample);
  assert.equal(parsed.success, true, "Valid DiagramBlock should parse successfully");

  const text = uiToText({ title: "Test", blocks: [parsed.data], followUps: [] });
  assert.ok(text.includes("Carte mentale"), "uiToText must render diagram title");
  assert.ok(text.includes("Soleil"), "uiToText must render diagram nodes");
});

test("Canva Schema: MockupBlock validates interface prototypes and screens navigation", () => {
  const mockupSample = {
    type: "mockup",
    device: "mobile",
    title: "Maquette App Étudiant",
    activeScreenId: "screen_login",
    screens: [
      {
        id: "screen_login",
        name: "Connexion",
        type: "login",
        elements: [
          { id: "btn_login", kind: "button", label: "Se connecter", targetScreenId: "screen_home", variant: "primary" },
        ],
      },
      {
        id: "screen_home",
        name: "Dashboard",
        type: "dashboard",
        elements: [
          { id: "kpi_solde", kind: "kpi", label: "Solde", value: "450 €" },
        ],
      },
    ],
  };

  const parsed = BlockSchema.safeParse(mockupSample);
  assert.equal(parsed.success, true, "Valid MockupBlock should parse successfully");
  if (parsed.success) {
    assert.equal(parsed.data.screens.length, 2);
  }
});

test("Canva Schema: TravelBlock validates multimodal journey with flight, train, car (thermal/electric), and walking", () => {
  const travelSample = {
    type: "travel",
    title: "Trajet Paris - Marseille",
    origin: { name: "Paris", lat: 48.8566, lng: 2.3522 },
    destination: { name: "Marseille", lat: 43.2965, lng: 5.3698 },
    distanceKm: 775,
    summary: "Trajet complet multimodal entre Paris et Marseille",
    recommendation: "Le TGV reste le meilleur compromis",
    flight: {
      duration: "1h20",
      direct: true,
      airports: {
        departure: "Paris-Orly",
        arrival: "Marseille-Provence",
        departureCode: "ORY",
        arrivalCode: "MRS",
      },
      prices: { eco: "49 €", premium: "135 €", business: "260 €" },
      co2Kg: 104,
      airlines: ["Air France", "Transavia"],
    },
    train: {
      duration: "3h15",
      stations: { departure: "Paris Gare de Lyon", arrival: "Marseille Saint-Charles" },
      trainTypes: ["TGV INOUI", "OUIGO"],
      prices: { standard: "19 €", firstClass: "59 €" },
      price: "19 €",
      transfers: 0,
      connections: "Métro Ligne 14",
      co2Kg: 2.1,
    },
    car: {
      duration: "7h30",
      distance: "775 km",
      tolls: "64.80 €",
      thermal: {
        consumption: "6.4 L/100km",
        fuelCost: "88 €",
        totalCost: "152.80 €",
        co2Kg: 126,
        gasStations: [{ name: "Total Beaune", brand: "TotalEnergies" }],
      },
      electric: {
        autonomy: "480 km",
        chargingStops: 2,
        chargingTime: "42 min",
        chargingCost: "32 €",
        totalCost: "96.80 €",
        co2Kg: 14,
        superchargers: [{ name: "Tesla Beaune", powerKw: "250 kW" }],
      },
    },
    walking: {
      duration: "2h45",
      distance: "14 km",
      steps: "18 500 pas",
      calories: "740 kcal",
      elevation: "+140m / -120m",
      difficulty: "moderate",
    },
    mapMarkers: [
      { label: "Paris", lat: 48.8566, lng: 2.3522, icon: "📍" },
      { label: "Marseille", lat: 43.2965, lng: 5.3698, icon: "🎯" },
    ],
  };

  const parsed = BlockSchema.safeParse(travelSample);
  assert.equal(parsed.success, true, "Valid TravelBlock should parse successfully");
  if (parsed.success) {
    assert.equal(parsed.data.type, "travel");
    assert.equal(parsed.data.distanceKm, 775);
    assert.equal(parsed.data.flight?.prices.eco, "49 €");
    assert.equal(parsed.data.train?.stations.departure, "Paris Gare de Lyon");
    assert.equal(parsed.data.car?.electric.chargingStops, 2);
  }

  const text = uiToText({ title: "Voyage", blocks: [parsed.data], followUps: [] });
  assert.ok(text.includes("Trajet Paris - Marseille"), "uiToText must render travel title");
  assert.ok(text.includes("Vol"), "uiToText must render flight info");
  assert.ok(text.includes("Train"), "uiToText must render train info");
  assert.ok(text.includes("Voiture"), "uiToText must render car info");
  assert.ok(text.includes("À pied"), "uiToText must render walking info");
});

test("Canva Schema: MathBlock validates formulas, geometry, function plot, and spreadsheet", () => {
  const mathSample = {
    type: "math",
    title: "Résolution Polynôme & Géométrie",
    description: "Analyse complète",
    topic: "analysis",
    summary: "Δ = 4 > 0, deux racines réelles",
    formulas: [
      {
        name: "Second Degré",
        latex: "x^2 - 4x + 3 = 0",
        explanation: "Méthode du discriminant",
        variables: [{ symbol: "a", meaning: "Coeff quadratique", value: "1" }],
        steps: [{ step: 1, title: "Calcul Delta", latex: "\\Delta = 4" }],
      },
    ],
    geometry: {
      shapeType: "right_triangle",
      title: "Triangle ABC",
      theorems: ["Pythagore"],
      properties: [{ label: "Hypoténuse", value: "5 cm" }],
    },
    functionPlot: {
      fn: "x^2 - 4*x + 3",
      label: "f(x)",
      xMin: -2,
      xMax: 6,
      keyPoints: [{ x: 1, y: 0, label: "Racine x1", type: "root" }],
    },
    spreadsheet: {
      title: "Table de valeurs",
      columns: [
        { id: "x", header: "x" },
        { id: "fx", header: "f(x)", formula: "=x^2-4x+3" },
      ],
      rows: [
        { x: 0, fx: 3 },
        { x: 1, fx: 0 },
      ],
    },
  };

  const parsed = BlockSchema.safeParse(mathSample);
  assert.equal(parsed.success, true, "Valid MathBlock should parse successfully");
  if (parsed.success) {
    assert.equal(parsed.data.type, "math");
    assert.equal(parsed.data.formulas?.length, 1);
    assert.equal(parsed.data.geometry?.shapeType, "right_triangle");
    assert.equal(parsed.data.functionPlot?.fn, "x^2 - 4*x + 3");
    assert.equal(parsed.data.spreadsheet?.rows.length, 2);
  }

  const text = uiToText({ title: "Mathématiques", blocks: [parsed.data], followUps: [] });
  assert.ok(text.includes("Résolution Polynôme"), "uiToText must render math title");
  assert.ok(text.includes("Second Degré"), "uiToText must render formula name");
  assert.ok(text.includes("Triangle ABC"), "uiToText must render geometry title");
  assert.ok(text.includes("f(x)"), "uiToText must render function plot label");
  assert.ok(text.includes("Table de valeurs"), "uiToText must render spreadsheet header");
});

test("Canva Schema: QuizBlock validates interactive questionnaire with correct option and explanation", () => {
  const quizSample = {
    type: "quiz",
    title: "Quiz Algorithmique",
    questions: [
      {
        id: "q1",
        question: "Quelle est la complexité d'une recherche binaire dans une liste triée ?",
        explanation: "La dichotomie divise par 2 l'espace de recherche à chaque étape, donc O(log n).",
        options: [
          { id: "opt1", label: "O(n)", correct: false },
          { id: "opt2", label: "O(log n)", correct: true },
          { id: "opt3", label: "O(n^2)", correct: false },
        ],
      },
    ],
  };

  const parsed = BlockSchema.safeParse(quizSample);
  assert.equal(parsed.success, true, "Valid QuizBlock should parse successfully");
});

test("Canva Schema: ImageStudioBlock validates image compositions, prompts, and elements", () => {
  const imageSample = {
    type: "imageStudio",
    title: "Affiche Étudiante",
    prompt: "Affiche moderne pour le festival étudiant d'automne",
    category: "poster",
    aspectRatio: "16:9",
    elements: [
      { id: "el1", label: "Titre festival", type: "text", color: "#ffffff" },
      { id: "el2", label: "Scène musicale", type: "subject", color: "#6366f1" },
    ],
  };

  const parsed = BlockSchema.safeParse(imageSample);
  assert.equal(parsed.success, true, "Valid ImageStudioBlock should parse successfully");
});

test("Canva Schema: KpiBlock and VisualDocBlock validate structured visual reports", () => {
  const kpiSample = {
    type: "kpi",
    title: "Indicateurs de budget",
    items: [
      { label: "Dépenses logement", value: "520 €", trend: "up", status: "warning", change: "+5%" },
      { label: "Bourse reçue", value: "600 €", trend: "neutral", status: "success" },
    ],
  };
  const docSample = {
    type: "visualDoc",
    title: "Fiche Synthèse : Droit constitutionnel",
    docType: "sheet",
    sections: [
      { heading: "La Constitution de 1958", content: "Adoptée le 4 octobre 1958...", takeaway: "Norme suprême de l'ordre juridique français." },
    ],
  };

  assert.equal(BlockSchema.safeParse(kpiSample).success, true);
  assert.equal(BlockSchema.safeParse(docSample).success, true);
  assert.equal(UIResponseSchema.safeParse({ title: "Visual Doc", blocks: [kpiSample, docSample], followUps: ["Download"] }).success, true);
});

test("Partial UI Parser handles streaming Canva blocks accurately", () => {
  const streamChunk = JSON.stringify({
    title: "Création Canva",
    blocks: [
      {
        type: "svg",
        code: '<svg viewBox="0 0 10 10"><rect width="10" height="10"/></svg>',
      },
      {
        type: "kpi",
        items: [{ label: "Total", value: "100" }],
      },
    ],
    followUps: ["Modifier les couleurs", "Exporter en PNG"],
  });

  const parsed = parsePartialUI(streamChunk);
  assert.equal(parsed.complete, true);
  assert.equal(parsed.blocks.length, 2);
  assert.equal(parsed.blocks[0].type, "svg");
  assert.equal(parsed.blocks[1].type, "kpi");
  assert.equal(parsed.followUps.length, 2);
});

test("Canva Export: ensureSvgXmlns injects required xmlns and xmlns:xlink", async () => {
  const { ensureSvgXmlns } = await import("../src/lib/canva-export.ts");
  const rawSvg = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
  const normalized = ensureSvgXmlns(rawSvg);
  assert.ok(normalized.includes('xmlns="http://www.w3.org/2000/svg"'), "Must inject xmlns");
  assert.ok(normalized.includes('xmlns:xlink="http://www.w3.org/1999/xlink"'), "Must inject xmlns:xlink");

  // Already populated SVG must not get duplicate attributes
  const existing = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 10 10"><rect/></svg>';
  const resExisting = ensureSvgXmlns(existing);
  const xmlnsCount = (resExisting.match(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g) || []).length;
  assert.equal(xmlnsCount, 1, "Must not duplicate xmlns attribute");
});

test("Canva Schema: ChartBlock validates histogram chartType", () => {
  const histogramSample = {
    type: "chart",
    chartType: "histogram",
    title: "Distribution des notes",
    data: [
      { label: "0-5", value: 3 },
      { label: "6-10", value: 12 },
      { label: "11-15", value: 25 },
      { label: "16-20", value: 10 },
    ],
    unit: "étudiants",
  };

  const parsed = BlockSchema.safeParse(histogramSample);
  assert.equal(parsed.success, true, "Histogram ChartBlock must validate successfully");
  if (parsed.success) {
    assert.equal(parsed.data.type, "chart");
    assert.equal(parsed.data.chartType, "histogram");
  }
});

test("Codebase verification: Zero mock or simulated AI logic exists in codebase", () => {
  const filesToCheck = [
    "src/lib/ai-config.ts",
    "src/lib/ai-upstream.ts",
    "src/lib/francestudent-auth.ts",
    "src/app/api/chat/route.ts",
    "src/components/blocks/mockup-block.tsx",
    "src/components/blocks/svg-block.tsx",
    "src/components/blocks/diagram-block.tsx",
    "src/components/blocks/image-studio-block.tsx",
    "src/components/chat/settings-navigation.tsx",
    "src/components/chat/settings-tabs.tsx",
    "src/components/chat/settings-dialog.tsx",
  ];

  for (const rel of filesToCheck) {
    const full = path.resolve(process.cwd(), rel);
    const content = fs.readFileSync(full, "utf-8");
    assert.equal(content.includes("demo-response"), false, `${rel} must not import demo-response`);
    assert.equal(content.includes("demoStream"), false, `${rel} must not define demoStream`);
    assert.equal(content.includes("Réponse simulée"), false, `${rel} must not contain 'Réponse simulée'`);
  }
});

test("Appearance System: All 20 themes have complete tokens, preview mockups, and readable contrast", async () => {
  const { THEMES, getTheme } = await import("../src/lib/themes.ts");
  assert.equal(THEMES.length, 20, "Must provide all 20 themes from France Student IA");

  const hexToLum = (hex) => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const contrastRatio = (hex1, hex2) => {
    const l1 = hexToLum(hex1);
    const l2 = hexToLum(hex2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  for (const theme of THEMES) {
    assert.ok(theme.id && theme.name, "Theme must have id and name");
    assert.ok(theme.colors.canvas && theme.colors.panel && theme.colors.card && theme.colors.raised, `${theme.name} must define surface colors`);
    assert.ok(theme.colors.ink && theme.colors.muted && theme.colors.faint, `${theme.name} must define text colors`);
    assert.ok(theme.colors.accent && theme.colors.accentStrong && theme.colors.accentSoft, `${theme.name} must define accent colors`);
    assert.ok(theme.colors.sidebarBg && theme.colors.bgGradient, `${theme.name} must define sidebarBg and bgGradient`);
    assert.ok(theme.preview && theme.preview.sidebar && theme.preview.main && theme.preview.surface, `${theme.name} must define miniature preview mockup tokens`);

    const inkCanvasRatio = contrastRatio(theme.colors.ink, theme.colors.canvas);
    const inkPanelRatio = contrastRatio(theme.colors.ink, theme.colors.panel);
    const inkCardRatio = contrastRatio(theme.colors.ink, theme.colors.card);
    assert.ok(inkCanvasRatio >= 7, `${theme.name} ink/canvas contrast (${inkCanvasRatio.toFixed(2)}) must be >= 7`);
    assert.ok(inkPanelRatio >= 7, `${theme.name} ink/panel contrast (${inkPanelRatio.toFixed(2)}) must be >= 7`);
    assert.ok(inkCardRatio >= 6, `${theme.name} ink/card contrast (${inkCardRatio.toFixed(2)}) must be >= 6`);

    const whiteAccentRatio = contrastRatio("#ffffff", theme.colors.accent);
    assert.ok(whiteAccentRatio >= 3.0, `${theme.name} white/accent button contrast (${whiteAccentRatio.toFixed(2)}) must be readable`);

    assert.equal(getTheme(theme.id).id, theme.id, `getTheme('${theme.id}') must return matching theme`);
  }

  // Verify globals.css defines --color-card and --color-sidebar and .prose-studio
  const globalsCss = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf-8");
  assert.ok(globalsCss.includes("--color-card"), "globals.css must define --color-card");
  assert.ok(globalsCss.includes("--color-sidebar"), "globals.css must define --color-sidebar");
  assert.ok(globalsCss.includes(".prose-studio"), "globals.css must define .prose-studio");
  assert.ok(globalsCss.includes(".animate-rise"), "globals.css must define .animate-rise");
});


test("Partial UI Parser extracts direct raw SVG and normalizes svg/content properties", () => {
  const rawSvgOutput = 'Voici votre illustration vectorielle :\n```xml\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect fill="#1e293b" width="800" height="500"/><circle cx="400" cy="250" r="100" fill="#38bdf8"/></svg>\n```';
  const parsedDirect = parsePartialUI(rawSvgOutput);
  assert.equal(parsedDirect.blocks.length, 1);
  assert.equal(parsedDirect.blocks[0].type, "svg");
  assert.ok(parsedDirect.blocks[0].code.includes('<circle'));

  const blockWithSvgProp = JSON.stringify({
    title: "Mon logo",
    blocks: [
      {
        type: "svg",
        svg: '<svg viewBox="0 0 50 50"><path d="M10 10"/></svg>',
      },
    ],
  });
  const parsedNormalized = parsePartialUI(blockWithSvgProp);
  assert.equal(parsedNormalized.blocks.length, 1);
  assert.equal(parsedNormalized.blocks[0].type, "svg");
  assert.ok(parsedNormalized.blocks[0].code.includes('M10 10'));
});
