"use client";

/*
 * Hook adapté de thesysdev/open-intelligent-ui (licence MIT).
 * https://github.com/thesysdev/open-intelligent-ui
 *
 * Demande à /api/street-route (proxy OSRM) le tracé routier passant par les points.
 * Retour : undefined = chargement, null = indisponible (ou non demandé), tableau = tracé.
 */
import { useEffect, useState } from "react";
import { coordinate, type LatLng } from "@/lib/map-utils";

const DEBOUNCE_MS = 700;
const TIMEOUT_MS = 10_000;
const CACHE_LIMIT = 64;

const cache = new Map<string, LatLng[]>();

function remember(key: string, points: LatLng[]) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, points);
}

function routeKey(points: LatLng[] | null): string | null {
  if (!points || points.length < 2) return null;
  return points.map(([lat, lng]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join(";");
}

function parsePoints(data: unknown): LatLng[] | null {
  if (!data || typeof data !== "object") return null;
  const raw = (data as { points?: unknown }).points;
  if (!Array.isArray(raw)) return null;
  const points: LatLng[] = [];
  for (const item of raw) {
    if (!Array.isArray(item)) return null;
    const point = coordinate(item[0], item[1]);
    if (!point) return null;
    points.push(point);
  }
  return points.length >= 2 ? points : null;
}

export function useStreetRoute(points: LatLng[] | null): LatLng[] | null | undefined {
  const key = routeKey(points);
  const [result, setResult] = useState<{ key: string; points: LatLng[] | null } | null>(null);

  useEffect(() => {
    if (!key || cache.has(key)) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const response = await fetch(`/api/street-route?coords=${encodeURIComponent(key)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const parsed = parsePoints(await response.json());
        if (!parsed) throw new Error("Réponse invalide");
 remember(key, parsed);
        setResult({ key, points: parsed });
      } catch {
        if (!controller.signal.aborted || result === null) {
          setResult({ key, points: null });
        }
      } finally {
 window.clearTimeout(timeout);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
    // `result` volontairement exclu : il ne sert qu'à éviter un état redondant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!key) return null;
  const cached = cache.get(key);
  if (cached) return cached;
  return result?.key === key ? result.points : undefined;
}
