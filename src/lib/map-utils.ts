/*
 * Utilitaires de carte adaptés de thesysdev/open-intelligent-ui (licence MIT).
 * https://github.com/thesysdev/open-intelligent-ui
 */
import type { LngLatBoundsLike } from "maplibre-gl";

/** Coordonnée au format [latitude, longitude]. */
export type LatLng = [number, number];

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return Number.NaN;
}

/** Retourne une coordonnée valide ou null (jamais de NaN ni de valeur hors limites). */
export function coordinate(lat: unknown, lng: unknown): LatLng | null {
  const a = toNumber(lat);
  const b = toNumber(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (Math.abs(a) > 90 || Math.abs(b) > 180) return null;
  return [a, b];
}

/** MapLibre attend [longitude, latitude]. */
export function lngLat(point: LatLng): [number, number] {
  return [point[1], point[0]];
}

/** Boîte englobante [[ouest, sud], [est, nord]] ou null si aucun point. */
export function boundsOf(points: LatLng[]): LngLatBoundsLike | null {
  if (points.length === 0) return null;
  let south = points[0][0];
  let north = points[0][0];
  let west = points[0][1];
  let east = points[0][1];
  for (const [lat, lng] of points) {
    if (lat < south) south = lat;
    if (lat > north) north = lat;
    if (lng < west) west = lng;
    if (lng > east) east = lng;
  }
  return [
    [west, south],
    [east, north],
  ];
}

/** Vrai si l'utilisateur demande de réduire les animations. */
export function reducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Début d'une polyligne selon une progression entre 0 et 1 (pour l'animation du tracé). */
export function partialLine(points: LatLng[], progress: number): LatLng[] {
  if (points.length < 2 || progress >= 1) return points;
  if (progress <= 0) return points.slice(0, 1);

  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const d = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    lengths.push(d);
    total += d;
  }
  if (total === 0) return points;

  let remaining = total * progress;
  const out: LatLng[] = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const d = lengths[i - 1];
    if (remaining >= d) {
      out.push(points[i]);
      remaining -= d;
      continue;
    }
    const t = d === 0 ? 0 : remaining / d;
    out.push([
      points[i - 1][0] + (points[i][0] - points[i - 1][0]) * t,
      points[i - 1][1] + (points[i][1] - points[i - 1][1]) * t,
    ]);
    break;
  }
  return out;
}

/** Premier emoji d'une chaîne, ou null si elle n'en contient pas. */
export function pinEmoji(value: string | undefined): string | null {
  if (!value) return null;
  const first = Array.from(value.trim())[0];
  return first && /\p{Extended_Pictographic}/u.test(first) ? first : null;
}

export type PinOptions = {
  label: string;
  /** Emoji ou numéro affiché dans l'épingle. */
  glyph: string;
  /** Vrai pour une épingle numérotée (pas d'emoji). */
  numbered: boolean;
  /** Décalage d'apparition en millisecondes. */
  delay: number;
  onSelect: () => void;
};

/**
 * Crée l'élément DOM d'une épingle. MapLibre positionne l'élément racine avec
 * `transform` : l'animation d'apparition vit donc sur l'élément de contenu.
 */
export function createPinElement(options: PinOptions): HTMLDivElement {
  const element = document.createElement("div");
  element.className = "ui-map-marker";
  element.tabIndex = 0;
  element.setAttribute("role", "button");
  element.setAttribute("aria-label", options.label);

  const content = document.createElement("div");
  content.className = "ui-map-marker-content";
  content.style.animationDelay = `${options.delay}ms`;

  const pin = document.createElement("span");
  pin.className = options.numbered ? "ui-map-pin ui-map-pin-number" : "ui-map-pin";
  pin.textContent = options.glyph;

  const label = document.createElement("span");
  label.className = "ui-map-label";
  label.textContent = options.label;

  content.append(pin, label);
  element.append(content);

  element.addEventListener("click", (event) => {
    event.stopPropagation();
    options.onSelect();
  });
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      options.onSelect();
    }
  });
  return element;
}
