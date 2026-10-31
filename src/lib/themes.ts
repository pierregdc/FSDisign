export type ThemeId =
  | "clair"
  | "gris"
  | "sombre"
  | "gradient"
  | "gradien"
  | "graphite"
  | "aurora"
  | "synthwave"
  | "lagoon"
  | "ember"
  | "matcha"
  | "midnight"
  | "rose"
  | "citrus"
  | "ocean"
  | "dusk"
  | "obsidian"
  | "amethyst"
  | "spruce"
  | "ruby"
  | "cobalt";

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  category: "light" | "dark" | "gradient" | "colored";
  previewBg: string;
  previewCard: string;
  previewAccent: string;
  preview: {
    sidebar: string;
    main: string;
    surface: string;
    border: string;
    pillPrimary: string;
    pillSecondary: string;
    dots: string;
  };
  colors: {
    canvas: string;
    panel: string;
    card: string;
    raised: string;
    line: string;
    ink: string;
    muted: string;
    faint: string;
    accent: string;
    accentStrong: string;
    accentSoft: string;
    sidebarBg: string;
    bgGradient: string;
  };
};

export const THEMES: ThemeDefinition[] = [
  {
    id: "clair",
    name: "Clair",
    category: "light",
    previewBg: "#ffffff",
    previewCard: "#f1f3f5",
    previewAccent: "#868e96",
    preview: {
      sidebar: "#f8f9fa",
      main: "#ffffff",
      surface: "#f1f3f5",
      border: "#dee2e6",
      pillPrimary: "#adb5bd",
      pillSecondary: "#dee2e6",
      dots: "#ced4da",
    },
    colors: {
      canvas: "#f5f7fc",
      panel: "#ffffff",
      card: "#f8fafc",
      raised: "#ffffff",
      line: "#e2e7f2",
      ink: "#0a1b3d",
      muted: "#52617a",
      faint: "#8490a5",
      accent: "#0139b7",
      accentStrong: "#002b8a",
      accentSoft: "#e9efff",
      sidebarBg: "#f1f5f9",
      bgGradient:
        "radial-gradient(1000px 620px at 100% -10%, rgba(1, 57, 183, 0.075), transparent 62%), radial-gradient(820px 520px at -10% 105%, rgba(255, 75, 140, 0.05), transparent 60%)",
    },
  },
  {
    id: "gris",
    name: "Gris",
    category: "dark",
    previewBg: "#212529",
    previewCard: "#2b3035",
    previewAccent: "#6c757d",
    preview: {
      sidebar: "#1a1d20",
      main: "#212529",
      surface: "#2b3035",
      border: "#343a40",
      pillPrimary: "#6c757d",
      pillSecondary: "#495057",
      dots: "#495057",
    },
    colors: {
      canvas: "#1b1d21",
      panel: "#23262b",
      card: "#2a2e35",
      raised: "#323740",
      line: "#383e48",
      ink: "#f1f3f5",
      muted: "#adb5bd",
      faint: "#868e96",
      accent: "#0284c7",
      accentStrong: "#0369a1",
      accentSoft: "rgba(2, 132, 199, 0.2)",
      sidebarBg: "#16181b",
      bgGradient:
        "radial-gradient(900px 500px at 90% -10%, rgba(148, 163, 184, 0.08), transparent 60%)",
    },
  },
  {
    id: "sombre",
    name: "Sombre",
    category: "dark",
    previewBg: "#141619",
    previewCard: "#1d2024",
    previewAccent: "#495057",
    preview: {
      sidebar: "#0f1113",
      main: "#141619",
      surface: "#1d2024",
      border: "#2b3035",
      pillPrimary: "#6c757d",
      pillSecondary: "#343a40",
      dots: "#495057",
    },
    colors: {
      canvas: "#0d0f12",
      panel: "#15181e",
      card: "#1c2028",
      raised: "#252a34",
      line: "#2a303c",
      ink: "#f8fafc",
      muted: "#94a3b8",
      faint: "#64748b",
      accent: "#0284c7",
      accentStrong: "#0369a1",
      accentSoft: "rgba(2, 132, 199, 0.18)",
      sidebarBg: "#090b0e",
      bgGradient:
        "radial-gradient(900px 500px at 90% -10%, rgba(56, 189, 248, 0.07), transparent 60%)",
    },
  },
  {
    id: "gradient",
    name: "Gradient",
    category: "gradient",
    previewBg: "#1a1744",
    previewCard: "#25215e",
    previewAccent: "#6366f1",
    preview: {
      sidebar: "linear-gradient(180deg, #1b1747 0%, #121030 100%)",
      main: "linear-gradient(135deg, #211d54 0%, #141236 100%)",
      surface: "rgba(79, 70, 229, 0.22)",
      border: "rgba(99, 102, 241, 0.35)",
      pillPrimary: "#818cf8",
      pillSecondary: "#4f46e5",
      dots: "#6366f1",
    },
    colors: {
      canvas: "#110f29",
      panel: "#19163b",
      card: "#211d4c",
      raised: "#2c2763",
      line: "#37307a",
      ink: "#f5f3ff",
      muted: "#c7d2fe",
      faint: "#818cf8",
      accent: "#6366f1",
      accentStrong: "#4f46e5",
      accentSoft: "rgba(99, 102, 241, 0.22)",
      sidebarBg: "#0c0b1f",
      bgGradient:
        "radial-gradient(1000px 600px at 85% -5%, rgba(99, 102, 241, 0.22), transparent 65%), radial-gradient(800px 500px at 10% 100%, rgba(139, 92, 246, 0.16), transparent 60%)",
    },
  },
  {
    id: "graphite",
    name: "Graphite",
    category: "dark",
    previewBg: "#222428",
    previewCard: "#2c2f34",
    previewAccent: "#71717a",
    preview: {
      sidebar: "#1a1c1f",
      main: "#222428",
      surface: "#2c2f34",
      border: "#3f3f46",
      pillPrimary: "#a1a1aa",
      pillSecondary: "#52525b",
      dots: "#71717a",
    },
    colors: {
      canvas: "#16171a",
      panel: "#1f2024",
      card: "#27292e",
      raised: "#313339",
      line: "#383b42",
      ink: "#fafafa",
      muted: "#a1a1aa",
      faint: "#71717a",
      accent: "#52525b",
      accentStrong: "#3f3f46",
      accentSoft: "rgba(161, 161, 170, 0.18)",
      sidebarBg: "#111214",
      bgGradient:
        "radial-gradient(900px 500px at 80% 0%, rgba(161, 161, 170, 0.08), transparent 60%)",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    category: "colored",
    previewBg: "#08292c",
    previewCard: "#0f393d",
    previewAccent: "#2dd4bf",
    preview: {
      sidebar: "linear-gradient(180deg, #0b3336 0%, #051c1f 100%)",
      main: "linear-gradient(135deg, #0d3b3f 0%, #072226 100%)",
      surface: "rgba(20, 184, 166, 0.18)",
      border: "rgba(45, 212, 191, 0.3)",
      pillPrimary: "#5eead4",
      pillSecondary: "#14b8a6",
      dots: "#2dd4bf",
    },
    colors: {
      canvas: "#051b1e",
      panel: "#0a2a2e",
      card: "#0f363b",
      raised: "#15464d",
      line: "#1b565e",
      ink: "#f0fdfa",
      muted: "#99f6e4",
      faint: "#5eead4",
      accent: "#0d9488",
      accentStrong: "#0f766e",
      accentSoft: "rgba(45, 212, 191, 0.18)",
      sidebarBg: "#031315",
      bgGradient:
        "radial-gradient(1000px 600px at 85% -10%, rgba(45, 212, 191, 0.18), transparent 62%), radial-gradient(800px 500px at 10% 105%, rgba(14, 165, 233, 0.12), transparent 60%)",
    },
  },
  {
    id: "synthwave",
    name: "Synthwave",
    category: "colored",
    previewBg: "#280b3a",
    previewCard: "#381250",
    previewAccent: "#c084fc",
    preview: {
      sidebar: "linear-gradient(180deg, #2e0d42 0%, #190626 100%)",
      main: "linear-gradient(135deg, #35104c 0%, #1e082d 100%)",
      surface: "rgba(168, 85, 247, 0.2)",
      border: "rgba(192, 132, 252, 0.35)",
      pillPrimary: "#d8b4fe",
      pillSecondary: "#9333ea",
      dots: "#c084fc",
    },
    colors: {
      canvas: "#190626",
      panel: "#270b3a",
      card: "#33104b",
      raised: "#431661",
      line: "#541d78",
      ink: "#faf5ff",
      muted: "#e9d5ff",
      faint: "#c084fc",
      accent: "#9333ea",
      accentStrong: "#7e22ce",
      accentSoft: "rgba(192, 132, 252, 0.2)",
      sidebarBg: "#12041c",
      bgGradient:
        "radial-gradient(950px 580px at 90% -5%, rgba(192, 132, 252, 0.2), transparent 62%), radial-gradient(800px 500px at 0% 100%, rgba(236, 72, 153, 0.14), transparent 60%)",
    },
  },
  {
    id: "lagoon",
    name: "Lagoon",
    category: "colored",
    previewBg: "#092a3a",
    previewCard: "#103b50",
    previewAccent: "#38bdf8",
    preview: {
      sidebar: "linear-gradient(180deg, #0b3144 0%, #061c28 100%)",
      main: "linear-gradient(135deg, #0d384d 0%, #07212e 100%)",
      surface: "rgba(14, 165, 233, 0.18)",
      border: "rgba(56, 189, 248, 0.32)",
      pillPrimary: "#7dd3fc",
      pillSecondary: "#0284c7",
      dots: "#38bdf8",
    },
    colors: {
      canvas: "#061d29",
      panel: "#0a2c3d",
      card: "#0f384e",
      raised: "#154965",
      line: "#1b5a7c",
      ink: "#f0f9ff",
      muted: "#bae6fd",
      faint: "#7dd3fc",
      accent: "#0284c7",
      accentStrong: "#0369a1",
      accentSoft: "rgba(56, 189, 248, 0.18)",
      sidebarBg: "#04141d",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(56, 189, 248, 0.18), transparent 62%)",
    },
  },
  {
    id: "ember",
    name: "Ember",
    category: "colored",
    previewBg: "#2e1608",
    previewCard: "#42200d",
    previewAccent: "#fb923c",
    preview: {
      sidebar: "linear-gradient(180deg, #361a0a 0%, #1e0d04 100%)",
      main: "linear-gradient(135deg, #3d1e0c 0%, #231006 100%)",
      surface: "rgba(249, 115, 22, 0.18)",
      border: "rgba(251, 146, 60, 0.32)",
      pillPrimary: "#fdba74",
      pillSecondary: "#ea580c",
      dots: "#fb923c",
    },
    colors: {
      canvas: "#1d0d04",
      panel: "#2c1508",
      card: "#3a1c0b",
      raised: "#4d2610",
      line: "#5e2f14",
      ink: "#fff7ed",
      muted: "#fed7aa",
      faint: "#fb923c",
      accent: "#ea580c",
      accentStrong: "#c2410c",
      accentSoft: "rgba(249, 115, 22, 0.2)",
      sidebarBg: "#140802",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(249, 115, 22, 0.18), transparent 62%)",
    },
  },
  {
    id: "matcha",
    name: "Matcha",
    category: "colored",
    previewBg: "#132916",
    previewCard: "#1c3b20",
    previewAccent: "#4ade80",
    preview: {
      sidebar: "linear-gradient(180deg, #16301a 0%, #0c1b0e 100%)",
      main: "linear-gradient(135deg, #19361d 0%, #0e2011 100%)",
      surface: "rgba(34, 197, 94, 0.18)",
      border: "rgba(74, 222, 128, 0.3)",
      pillPrimary: "#86efac",
      pillSecondary: "#16a34a",
      dots: "#4ade80",
    },
    colors: {
      canvas: "#0c1b0e",
      panel: "#132a16",
      card: "#1a371e",
      raised: "#234828",
      line: "#2b5831",
      ink: "#f0fdf4",
      muted: "#bbf7d0",
      faint: "#86efac",
      accent: "#16a34a",
      accentStrong: "#15803d",
      accentSoft: "rgba(74, 222, 128, 0.18)",
      sidebarBg: "#081209",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(74, 222, 128, 0.16), transparent 62%)",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    category: "dark",
    previewBg: "#0a1324",
    previewCard: "#111f38",
    previewAccent: "#60a5fa",
    preview: {
      sidebar: "linear-gradient(180deg, #0c172c 0%, #070d19 100%)",
      main: "linear-gradient(135deg, #0e1b33 0%, #08101f 100%)",
      surface: "rgba(59, 130, 246, 0.16)",
      border: "rgba(96, 165, 250, 0.28)",
      pillPrimary: "#93c5fd",
      pillSecondary: "#1d4ed8",
      dots: "#60a5fa",
    },
    colors: {
      canvas: "#070d19",
      panel: "#0d172a",
      card: "#132038",
      raised: "#1b2d4d",
      line: "#233961",
      ink: "#f8fafc",
      muted: "#94a3b8",
      faint: "#64748b",
      accent: "#2563eb",
      accentStrong: "#1d4ed8",
      accentSoft: "rgba(59, 130, 246, 0.2)",
      sidebarBg: "#050912",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(59, 130, 246, 0.15), transparent 62%)",
    },
  },
  {
    id: "rose",
    name: "Rose",
    category: "colored",
    previewBg: "#2e0d1e",
    previewCard: "#42142b",
    previewAccent: "#fb7185",
    preview: {
      sidebar: "linear-gradient(180deg, #361024 0%, #1d0813 100%)",
      main: "linear-gradient(135deg, #3d1228 0%, #220a17 100%)",
      surface: "rgba(244, 63, 94, 0.18)",
      border: "rgba(251, 113, 133, 0.32)",
      pillPrimary: "#fda4af",
      pillSecondary: "#e11d48",
      dots: "#fb7185",
    },
    colors: {
      canvas: "#1d0712",
      panel: "#2c0d1d",
      card: "#3a1226",
      raised: "#4c1932",
      line: "#5e203e",
      ink: "#fff1f2",
      muted: "#fecdd3",
      faint: "#fda4af",
      accent: "#e11d48",
      accentStrong: "#be123c",
      accentSoft: "rgba(244, 63, 94, 0.2)",
      sidebarBg: "#14040c",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(244, 63, 94, 0.18), transparent 62%)",
    },
  },
  {
    id: "citrus",
    name: "Citrus",
    category: "colored",
    previewBg: "#2b2407",
    previewCard: "#3d330b",
    previewAccent: "#facc15",
    preview: {
      sidebar: "linear-gradient(180deg, #332b09 0%, #1c1704 100%)",
      main: "linear-gradient(135deg, #3a310a 0%, #211c06 100%)",
      surface: "rgba(234, 179, 8, 0.18)",
      border: "rgba(250, 204, 21, 0.32)",
      pillPrimary: "#fde047",
      pillSecondary: "#ca8a04",
      dots: "#facc15",
    },
    colors: {
      canvas: "#1b1604",
      panel: "#292207",
      card: "#362d0a",
      raised: "#473b0e",
      line: "#594a12",
      ink: "#fefce8",
      muted: "#fef08a",
      faint: "#fde047",
      accent: "#b45309",
      accentStrong: "#92400e",
      accentSoft: "rgba(234, 179, 8, 0.2)",
      sidebarBg: "#120f02",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(234, 179, 8, 0.16), transparent 62%)",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    category: "colored",
    previewBg: "#082438",
    previewCard: "#0e3450",
    previewAccent: "#38bdf8",
    preview: {
      sidebar: "linear-gradient(180deg, #0a2b42 0%, #051826 100%)",
      main: "linear-gradient(135deg, #0c314b 0%, #061c2c 100%)",
      surface: "rgba(2, 132, 199, 0.2)",
      border: "rgba(56, 189, 248, 0.3)",
      pillPrimary: "#7dd3fc",
      pillSecondary: "#0284c7",
      dots: "#38bdf8",
    },
    colors: {
      canvas: "#051826",
      panel: "#09263b",
      card: "#0e324d",
      raised: "#144263",
      line: "#1a527a",
      ink: "#f0f9ff",
      muted: "#bae6fd",
      faint: "#7dd3fc",
      accent: "#0284c7",
      accentStrong: "#0369a1",
      accentSoft: "rgba(14, 165, 233, 0.2)",
      sidebarBg: "#03101a",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(14, 165, 233, 0.18), transparent 62%)",
    },
  },
  {
    id: "dusk",
    name: "Dusk",
    category: "colored",
    previewBg: "#1e1436",
    previewCard: "#2b1d4c",
    previewAccent: "#a78bfa",
    preview: {
      sidebar: "linear-gradient(180deg, #241840 0%, #140d24 100%)",
      main: "linear-gradient(135deg, #281b47 0%, #170f2b 100%)",
      surface: "rgba(139, 92, 246, 0.18)",
      border: "rgba(167, 139, 250, 0.32)",
      pillPrimary: "#c4b5fd",
      pillSecondary: "#7c3aed",
      dots: "#a78bfa",
    },
    colors: {
      canvas: "#140d24",
      panel: "#1f1538",
      card: "#291c4a",
      raised: "#372661",
      line: "#453078",
      ink: "#faf5ff",
      muted: "#ddd6fe",
      faint: "#c4b5fd",
      accent: "#7c3aed",
      accentStrong: "#6d28d9",
      accentSoft: "rgba(139, 92, 246, 0.2)",
      sidebarBg: "#0d0818",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(139, 92, 246, 0.18), transparent 62%)",
    },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    category: "dark",
    previewBg: "#0b0d12",
    previewCard: "#131720",
    previewAccent: "#38bdf8",
    preview: {
      sidebar: "linear-gradient(180deg, #0d1017 0%, #07080c 100%)",
      main: "linear-gradient(135deg, #10141d 0%, #090b10 100%)",
      surface: "rgba(30, 41, 59, 0.65)",
      border: "rgba(51, 65, 85, 0.6)",
      pillPrimary: "#64748b",
      pillSecondary: "#334155",
      dots: "#475569",
    },
    colors: {
      canvas: "#08090a",
      panel: "#101216",
      card: "#14161b",
      raised: "#1a1d24",
      line: "#232730",
      ink: "#f3f4f6",
      muted: "#9ca3af",
      faint: "#6b7280",
      accent: "#0284c7",
      accentStrong: "#0369a1",
      accentSoft: "rgba(2, 132, 199, 0.2)",
      sidebarBg: "#060708",
      bgGradient:
        "radial-gradient(900px 500px at 90% -10%, rgba(2, 132, 199, 0.08), transparent 60%)",
    },
  },
  {
    id: "amethyst",
    name: "Amethyst",
    category: "colored",
    previewBg: "#210d33",
    previewCard: "#30134a",
    previewAccent: "#c084fc",
    preview: {
      sidebar: "linear-gradient(180deg, #270f3d 0%, #150821 100%)",
      main: "linear-gradient(135deg, #2c1145 0%, #180926 100%)",
      surface: "rgba(168, 85, 247, 0.18)",
      border: "rgba(192, 132, 252, 0.32)",
      pillPrimary: "#d8b4fe",
      pillSecondary: "#9333ea",
      dots: "#c084fc",
    },
    colors: {
      canvas: "#140720",
      panel: "#210c33",
      card: "#2b1042",
      raised: "#391657",
      line: "#481c6d",
      ink: "#faf5ff",
      muted: "#e9d5ff",
      faint: "#d8b4fe",
      accent: "#9333ea",
      accentStrong: "#7e22ce",
      accentSoft: "rgba(168, 85, 247, 0.2)",
      sidebarBg: "#0d0415",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(168, 85, 247, 0.18), transparent 62%)",
    },
  },
  {
    id: "spruce",
    name: "Spruce",
    category: "colored",
    previewBg: "#09241e",
    previewCard: "#0f362d",
    previewAccent: "#34d399",
    preview: {
      sidebar: "linear-gradient(180deg, #0b2b24 0%, #061713 100%)",
      main: "linear-gradient(135deg, #0d3129 0%, #071b16 100%)",
      surface: "rgba(16, 185, 129, 0.18)",
      border: "rgba(52, 211, 153, 0.3)",
      pillPrimary: "#6ee7b7",
      pillSecondary: "#059669",
      dots: "#34d399",
    },
    colors: {
      canvas: "#061713",
      panel: "#0b2620",
      card: "#10332b",
      raised: "#16443a",
      line: "#1c5448",
      ink: "#ecfdf5",
      muted: "#a7f3d0",
      faint: "#6ee7b7",
      accent: "#059669",
      accentStrong: "#047857",
      accentSoft: "rgba(16, 185, 129, 0.2)",
      sidebarBg: "#040f0c",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(16, 185, 129, 0.16), transparent 62%)",
    },
  },
  {
    id: "ruby",
    name: "Ruby",
    category: "colored",
    previewBg: "#2b0a0e",
    previewCard: "#3d1016",
    previewAccent: "#f87171",
    preview: {
      sidebar: "linear-gradient(180deg, #330c11 0%, #1c0609 100%)",
      main: "linear-gradient(135deg, #3a0e14 0%, #21080b 100%)",
      surface: "rgba(220, 38, 38, 0.18)",
      border: "rgba(248, 113, 113, 0.3)",
      pillPrimary: "#fca5a5",
      pillSecondary: "#dc2626",
      dots: "#f87171",
    },
    colors: {
      canvas: "#1a0608",
      panel: "#290a0e",
      card: "#360e13",
      raised: "#47131a",
      line: "#591820",
      ink: "#fef2f2",
      muted: "#fecaca",
      faint: "#fca5a5",
      accent: "#dc2626",
      accentStrong: "#b91c1c",
      accentSoft: "rgba(220, 38, 38, 0.2)",
      sidebarBg: "#120405",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(220, 38, 38, 0.18), transparent 62%)",
    },
  },
  {
    id: "cobalt",
    name: "Cobalt",
    category: "colored",
    previewBg: "#091936",
    previewCard: "#102652",
    previewAccent: "#60a5fa",
    preview: {
      sidebar: "linear-gradient(180deg, #0b1e40 0%, #061024 100%)",
      main: "linear-gradient(135deg, #0d224a 0%, #07132b 100%)",
      surface: "rgba(37, 99, 235, 0.2)",
      border: "rgba(96, 165, 250, 0.32)",
      pillPrimary: "#93c5fd",
      pillSecondary: "#2563eb",
      dots: "#60a5fa",
    },
    colors: {
      canvas: "#061024",
      panel: "#0a1b3b",
      card: "#0f254f",
      raised: "#16336b",
      line: "#1d4085",
      ink: "#eff6ff",
      muted: "#bfdbfe",
      faint: "#93c5fd",
      accent: "#2563eb",
      accentStrong: "#1d4ed8",
      accentSoft: "rgba(37, 99, 235, 0.2)",
      sidebarBg: "#040b18",
      bgGradient:
        "radial-gradient(950px 560px at 90% -10%, rgba(37, 99, 235, 0.18), transparent 62%)",
    },
  },
];

export const THEME_STORAGE_KEY = "france-student:theme:v1";

export function getTheme(id: string): ThemeDefinition {
  const normalized =
    id === "gradien" ? "gradient" : id === "crimson" ? "ruby" : id === "light" ? "clair" : id === "dark" ? "sombre" : id;
  return (
    THEMES.find((t) => t.id === normalized) ||
    THEMES.find((t) => t.id === "obsidian") ||
    THEMES[0]
  );
}
