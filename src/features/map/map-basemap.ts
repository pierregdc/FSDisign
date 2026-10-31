/*
 * Fonds de carte adaptés de thesysdev/open-intelligent-ui (licence MIT).
 * https://github.com/thesysdev/open-intelligent-ui
 *
 * - Fond principal : CartoDB Voyager @2x (ultra-net, fiable, données OpenStreetMap).
 * - Vectoriel : OpenFreeMap Bright si nécessaire.
 */
import type { StyleSpecification } from "maplibre-gl";

export type MapLibre = typeof import("maplibre-gl");

let loader: Promise<MapLibre> | null = null;

/** Charge MapLibre GL à la demande (uniquement côté navigateur). */
export function loadMapLibre(): Promise<MapLibre> {
  if (!loader) {
    loader = import("maplibre-gl").then(
      (module) => (module.default ?? module) as unknown as MapLibre,
    );
  }
  return loader;
}

/** Style raster haute définition ESRI World Street Map (sans clé d'API, ultra-fluide). */
export function rasterStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      places: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution:
          '&copy; <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a> &copy; OpenStreetMap contributors',
      },
    },
    layers: [{ id: "raster", type: "raster", source: "places" }],
  };
}

/** Style par défaut utilisé pour l'affichage de cartes. */
export function defaultMapStyle(): StyleSpecification {
  return rasterStyle();
}

export function vectorStyle(): StyleSpecification {
  return rasterStyle();
}
