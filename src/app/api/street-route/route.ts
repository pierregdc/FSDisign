/*
 * Proxy de tracé routier, adapté de thesysdev/open-intelligent-ui (licence MIT).
 * https://github.com/thesysdev/open-intelligent-ui
 *
 * Interroge le serveur de démonstration OSRM (données OpenStreetMap) et renvoie
 * les points du tracé au format [latitude, longitude].
 */
import { NextResponse } from "next/server";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";
const MAX_POINTS_IN = 20;
const MAX_POINTS_OUT = 600;
const CACHE_LIMIT = 100;
const CACHE_TTL_MS = 60 * 60 * 1000;

type LatLng = [number, number];

const cache = new Map<string, { at: number; points: LatLng[] }>();

function parseCoords(raw: string | null): string | null {
  if (!raw || raw.length > 1000) return null;
  const parts = raw.split(";");
  if (parts.length < 2 || parts.length > MAX_POINTS_IN) return null;
  for (const part of parts) {
    const pair = part.split(",");
    if (pair.length !== 2) return null;
    const lng = Number(pair[0]);
    const lat = Number(pair[1]);
    if (!pair[0].trim() || !pair[1].trim()) return null;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return null;
  }
  return parts.join(";");
}

function downsample(points: LatLng[]): LatLng[] {
  if (points.length <= MAX_POINTS_OUT) return points;
  const step = (points.length - 1) / (MAX_POINTS_OUT - 1);
  const out: LatLng[] = [];
  for (let i = 0; i < MAX_POINTS_OUT; i += 1) {
    out.push(points[Math.round(i * step)]);
  }
  return out;
}

export async function GET(request: Request) {
  const coords = parseCoords(new URL(request.url).searchParams.get("coords"));
  if (!coords) {
    return NextResponse.json(
      { error: "Paramètre coords invalide (format : lng,lat;lng,lat, 2 à 20 points)." },
      { status: 400 },
    );
  }

  const cached = cache.get(coords);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json({ points: cached.points });
  }

  try {
    const response = await fetch(
      `${OSRM_URL}/${coords}?overview=full&geometries=geojson&steps=false`,
      { signal: AbortSignal.timeout(8000), cache: "no-store" },
    );
    if (!response.ok) throw new Error(`OSRM HTTP ${response.status}`);

    const data = (await response.json()) as {
      code?: string;
      routes?: { geometry?: { coordinates?: unknown } }[];
    };
    const raw = data.routes?.[0]?.geometry?.coordinates;
    if (data.code !== "Ok" || !Array.isArray(raw)) throw new Error("Aucun itinéraire");

    const points: LatLng[] = [];
    for (const item of raw) {
      if (!Array.isArray(item)) continue;
      const lng = Number(item[0]);
      const lat = Number(item[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) points.push([lat, lng]);
    }
    if (points.length < 2) throw new Error("Itinéraire vide");

    const result = downsample(points);
    if (cache.size >= CACHE_LIMIT) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(coords, { at: Date.now(), points: result });
    return NextResponse.json({ points: result });
  } catch {
    return NextResponse.json({ error: "Itinéraire indisponible." }, { status: 502 });
  }
}
