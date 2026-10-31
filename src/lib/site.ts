const DEFAULT_SITE_URL = "https://ia.francestudent.org";
const DEFAULT_GITHUB_URL = "https://github.com/pierregdc/FSDisign";

function normalizeUrl(raw: string | undefined, fallback: string): string {
  const value = raw?.trim();
  if (!value) return fallback;

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

const githubUrl = normalizeUrl(process.env.NEXT_PUBLIC_GITHUB_URL, DEFAULT_GITHUB_URL);

export const SITE = {
  name: "FranceStudent - UI Design",
  brand: "FranceStudent UI Design",
  product: "UI Design",
  fullName: "FranceStudent - UI Design",
  tagline: "L'interface générative & Studio UI Design de France Student.",
  description:
    "Application FranceStudent - UI Design (pierregdc/FSDisign). Studio complet de création visuelle et d'interfaces : illustrations, affiches, logos, SVG, cartes mentales, schémas, maquettes et mini-apps avec tous les modèles IA de ia.francestudent.org.",
  sourceUrl: "https://ia.francestudent.org/",
  sourceHost: "ia.francestudent.org",
  sourceName: "France Student IA",
  offerUrl: "https://my.francestudent.org/store/offreia",
  accountUrl: "https://my.francestudent.org/",
  loginUrl: "https://ia.francestudent.org/login",
  supportUrl: "https://my.francestudent.org/submitticket.php",
  apiDocsUrl: "https://api.francestudent.ai/swagger-ui/index.html",
  websiteUrl: "https://francestudent.org/",
  url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL),
  githubUrl,
  githubConfigured: Boolean(process.env.NEXT_PUBLIC_GITHUB_URL?.trim()),
  license: "MIT",
} as const;
