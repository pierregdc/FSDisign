/*
 * Fonds de carte adaptés de thesysdev/open-intelligent-ui (licence MIT).
 * https://github.com/thesysdev/open-intelligent-ui
 *
 * - Fond principal : tuiles vectorielles OpenFreeMap (données OpenStreetMap).
 * - Repli : tuiles raster Esri World Street Map si les tuiles vectorielles échouent.
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

const COLORS = {
  background: "#f4f2f0",
  green: "#bce9b0",
  park: "#b7e7aa",
  campus: "#ede8d7",
  water: "#a2dff5",
  waterway: "#91d6ef",
  building: "#e9e6e2",
  street: "#cdd1d9",
  road: "#b1b9c8",
  ferry: "#89cfe9",
  label: "#50545a",
  minor: "#687078",
  halo: "#ffffff",
};

const FONT = ["Noto Sans Regular"];
const FONT_BOLD = ["Noto Sans Bold"];

/** Style vectoriel clair (schéma OpenMapTiles servi par OpenFreeMap). */
export function vectorStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      places: {
        type: "vector",
        url: "https://tiles.openfreemap.org/planet",
        attribution:
          '&copy; <a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": COLORS.background } },
      {
        id: "landcover",
        type: "fill",
        source: "places",
        "source-layer": "landcover",
        filter: ["in", "class", "wood", "grass", "farmland"],
        paint: { "fill-color": COLORS.green, "fill-opacity": 0.55 },
      },
      {
        id: "parks",
        type: "fill",
        source: "places",
        "source-layer": "park",
        paint: { "fill-color": COLORS.park, "fill-opacity": 0.8 },
      },
      {
        id: "school",
        type: "fill",
        source: "places",
        "source-layer": "landuse",
        filter: ["in", "class", "school", "university", "hospital"],
        paint: { "fill-color": COLORS.campus },
      },
      {
        id: "water",
        type: "fill",
        source: "places",
        "source-layer": "water",
        paint: { "fill-color": COLORS.water },
      },
      {
        id: "waterways",
        type: "line",
        source: "places",
        "source-layer": "waterway",
        paint: { "line-color": COLORS.waterway, "line-width": 1.2 },
      },
      {
        id: "buildings",
        type: "fill",
        source: "places",
        "source-layer": "building",
        minzoom: 14,
        paint: { "fill-color": COLORS.building, "fill-opacity": 0.9 },
      },
      {
        id: "streets",
        type: "line",
        source: "places",
        "source-layer": "transportation",
        filter: ["in", "class", "minor", "service", "tertiary", "residential", "path", "pedestrian"],
        minzoom: 12,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": COLORS.street,
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.6, 16, 4],
        },
      },
      {
        id: "main-roads",
        type: "line",
        source: "places",
        "source-layer": "transportation",
        filter: ["in", "class", "motorway", "trunk", "primary", "secondary"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": COLORS.road,
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.5, 10, 1.5, 16, 7],
        },
      },
      {
        id: "ferries",
        type: "line",
        source: "places",
        "source-layer": "transportation",
        filter: ["==", "class", "ferry"],
        paint: { "line-color": COLORS.ferry, "line-width": 1.2, "line-dasharray": [2, 2] },
      },
      {
        id: "water-labels",
        type: "symbol",
        source: "places",
        "source-layer": "water_name",
        layout: { "text-field": ["get", "name"], "text-font": FONT, "text-size": 11 },
        paint: { "text-color": COLORS.minor, "text-halo-color": COLORS.halo, "text-halo-width": 1.2 },
      },
      {
        id: "road-labels",
        type: "symbol",
        source: "places",
        "source-layer": "transportation_name",
        minzoom: 13,
        layout: {
          "text-field": ["get", "name"],
          "text-font": FONT,
          "text-size": 11,
          "symbol-placement": "line",
        },
        paint: { "text-color": COLORS.minor, "text-halo-color": COLORS.halo, "text-halo-width": 1.5 },
      },
      {
        id: "place-labels",
        type: "symbol",
        source: "places",
        "source-layer": "place",
        filter: ["in", "class", "city", "town", "village", "suburb", "neighbourhood"],
        layout: {
          "text-field": ["get", "name"],
          "text-font": FONT_BOLD,
          "text-size": ["interpolate", ["linear"], ["zoom"], 4, 11, 12, 15],
        },
        paint: { "text-color": COLORS.label, "text-halo-color": COLORS.halo, "text-halo-width": 1.6 },
      },
    ],
  };
}

/** Style raster de repli (Esri World Street Map). */
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
        attribution: "Tiles &copy; Esri",
      },
    },
    layers: [{ "id": "raster", "type": "raster", "source": "places" }],
  };
}
