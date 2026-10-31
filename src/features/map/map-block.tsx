"use client";

/*
 * Bloc carte inspiré de thesysdev/open-intelligent-ui (licence MIT) :
 * MapLibre GL, tuiles OpenFreeMap avec repli raster, épingles emoji ou numérotées,
 * filtre par catégorie, recentrage, plein écran et itinéraire routier animé.
 * https://github.com/thesysdev/open-intelligent-ui
 */
import "maplibre-gl/dist/maplibre-gl.css";
import "./map-block.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, LocateFixed, Maximize2, Minimize2 } from "lucide-react";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import type { UIBlock } from "@/lib/ui-schema";
import { cn } from "@/lib/utils";
import {
  boundsOf,
  coordinate,
  createPinElement,
  lngLat,
  partialLine,
  pinEmoji,
  reducedMotion,
  type LatLng,
} from "@/lib/map-utils";
import { loadMapLibre, rasterStyle, vectorStyle, type MapLibre } from "./map-basemap";
import { useStreetRoute } from "./use-street-route";

type MapBlock = Extract<UIBlock, { type: "map" }>;
type GeoData = Parameters<GeoJSONSource["setData"]>[0];

type Place = {
  key: string;
  label: string;
  point: LatLng;
  category?: string;
  description?: string;
  glyph: string;
  numbered: boolean;
};

const ROUTE_SOURCE = "route";

function lineData(points: LatLng[]): GeoData {
  if (points.length < 2) return { type: "FeatureCollection", features: [] };
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: points.map(lngLat) },
  };
}

export function MapBlockView({ block }: { block: MapBlock }) {
  const places = useMemo<Place[]>(() => {
    const result: Place[] = [];
    block.markers.forEach((marker, index) => {
      const point = coordinate(marker.lat, marker.lng);
      if (!point) return;
      const emoji = pinEmoji(marker.icon);
      result.push({
        key: String(index),
        label: marker.label,
 point,
        category: marker.category,
        description: marker.description,
        glyph: emoji ?? String(result.length + 1),
 numbered: !emoji,
      });
    });
    return result;
  }, [block.markers]);

  const categories = useMemo(
    () => Array.from(new Set(places.flatMap((place) => (place.category ? [place.category] : [])))),
    [places],
  );

  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [styleVersion, setStyleVersion] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);
  const [failed, setFailed] = useState(false);
  const [initial] = useState<LatLng>(() => places[0]?.point ?? [48.8566, 2.3522]);

  const visible = useMemo(
    () => (category ? places.filter((place) => place.category === category) : places),
    [places, category],
  );
  const selectedPlace = visible.find((place) => place.key === selected) ?? null;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const libRef = useRef<MapLibre | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const fittedRef = useRef(false);
  const fitRef = useRef<(animate: boolean) => void>(() => {});

  const routePoints = useMemo(() => visible.map((place) => place.point), [visible]);
  const routeWanted = Boolean(block.route) && routePoints.length >= 2;
  const street = useStreetRoute(routeWanted ? routePoints : null);

  // Création de la carte (une seule fois par bloc).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let map: MapLibreMap | null = null;
    let observer: ResizeObserver | null = null;
    const markers = markersRef.current;

    loadMapLibre()
      .then((maplibre) => {
        if (disposed) return;
 libRef.current = maplibre;

        const coarse = window.matchMedia("(pointer: coarse)").matches;
 const instance = new maplibre.Map({
          container,
          style: vectorStyle(),
          center: lngLat(initial),
          zoom: 4,
          attributionControl: false,
   dragRotate: false,
   scrollZoom: false,
          pitchWithRotate: false,
          cooperativeGestures: coarse,
 });
        map = instance;
        instance.touchZoomRotate.disableRotation();
 instance.addControl(new maplibre.AttributionControl({ compact: true }), "bottom-right");
        instance.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

 let tileLoaded = false;
        let fellBack = false;

        instance.on("data", (event) => {
   if ((event as { tile?: unknown }).tile) tileLoaded = true;
        });
        instance.on("error", (event) => {
   const sourceId = (event as { sourceId?: string }).sourceId;
   if (sourceId !== "places" || tileLoaded || fellBack) return;
   fellBack = true;
   setUsingFallback(true);
   instance.setStyle(rasterStyle());
 });
 instance.on("click", () => setSelected(null));
        instance.on("style.load", () => {
   if (!instance.getSource(ROUTE_SOURCE)) {
     instance.addSource(ROUTE_SOURCE, { type: "geojson", data: lineData([]) });
     instance.addLayer({
       id: "route-casing",
       type: "line",
       source: ROUTE_SOURCE,
       layout: { "line-cap": "round", "line-join": "round" },
       paint: { "line-color": "#ffffff", "line-width": 7, "line-opacity": 0.95 },
     });
     instance.addLayer({
       id: "route-line",
       type: "line",
       source: ROUTE_SOURCE,
       layout: { "line-cap": "round", "line-join": "round" },
       paint: { "line-color": "#0284c7", "line-width": 3.8 },
     });
          }
   setStyleVersion((value) => value + 1);
        });

        mapRef.current = instance;
        observer = new ResizeObserver(() => {
          instance.resize();
          fitRef.current(false);
        });
        observer.observe(container);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      observer?.disconnect();
      markers.forEach((marker) => marker.remove());
      markers.clear();
      map?.remove();
      mapRef.current = null;
      fittedRef.current = false;
    };
  }, [initial]);

  // Épingles : ajout / retrait selon le filtre.
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!map || !lib || styleVersion === 0) return;

    const markers = markersRef.current;
    const wanted = new Set(visible.map((place) => place.key));
    for (const [key, marker] of markers) {
      if (!wanted.has(key)) {
        marker.remove();
        markers.delete(key);
      }
    }
    visible.forEach((place, index) => {
      if (markers.has(place.key)) return;
      const element = createPinElement({
 label: place.label,
 glyph: place.glyph,
        numbered: place.numbered,
        delay: Math.min(index, 12) * 60,
        onSelect: () => setSelected(place.key),
      });
      const marker = new lib.Marker({ element, anchor: "center" })
 .setLngLat(lngLat(place.point))
        .addTo(map);
      markers.set(place.key, marker);
    });
  }, [visible, styleVersion]);

  // Épingle sélectionnée : surbrillance et centrage.
  useEffect(() => {
    markersRef.current.forEach((marker, key) => {
      marker.getElement().classList.toggle("ui-map-marker-selected", key === selected);
    });
  }, [selected, visible, styleVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;
    const place = places.find((item) => item.key === selected);
    if (!place) return;
    map.easeTo({ center: lngLat(place.point), duration: reducedMotion() ? 0 : 400 });
  }, [selected, places, styleVersion]);

  // Cadrage sur les épingles visibles.
  const fit = useCallback(
    (animate: boolean) => {
      const map = mapRef.current;
      if (!map) return;
      const bounds = boundsOf(visible.map((place) => place.point));
      if (!bounds) return;
      const compact = map.getContainer().clientHeight < 320;
      map.fitBounds(bounds, {
        maxZoom: 12.4,
        padding: {
          top: compact ? 45 : 65,
          bottom: compact ? 45 : 75,
   left: 60,
   right: 60,
 },
        duration: animate && !reducedMotion() ? 600 : 0,
      });
    },
    [visible],
  );
  fitRef.current = fit;

  useEffect(() => {
    if (styleVersion === 0) return;
    fit(false);
    const timer = window.setTimeout(() => {
      fit(false);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [fit, styleVersion, fullscreen]);

  // Tracé de l'itinéraire (routier si disponible, sinon lignes droites), animé une fois.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || styleVersion === 0) return;
    const source = map.getSource(ROUTE_SOURCE) as GeoJSONSource | undefined;
    if (!source) return;

    const line = routeWanted ? (street ?? (street === null ? routePoints : null)) : null;
    if (!line || line.length < 2) {
      source.setData(lineData([]));
      return;
    }
    if (reducedMotion()) {
      source.setData(lineData(line));
      return;
    }

    const duration = 1100;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      source.setData(lineData(partialLine(line, eased)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [street, routePoints, routeWanted, styleVersion]);

  // Plein écran : Échap, verrouillage du défilement, zoom à la molette.
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      if (fullscreen) map.scrollZoom.enable();
      else map.scrollZoom.disable();
    }
    if (!fullscreen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen, styleVersion]);

  const height = block.height ?? 360;
  let status: string | null = null;
  if (routeWanted && street === undefined) status = "Calcul de l'itinéraire…";
  else if (routeWanted && street === null) status = "Itinéraire routier indisponible : tracé en lignes droites";
  else if (usingFallback) status = "Fond de carte de secours";

  return (
    <figure className="space-y-3">
      {block.title ? <p className="text-sm font-medium text-ink">{block.title}</p> : null}

      {fullscreen ? (
 <div className="ui-map-backdrop" onClick={() => setFullscreen(false)} aria-hidden="true" />
      ) : null}

      <div style={{ height }}>
        <div className={cn("ui-map", fullscreen && "ui-map-fullscreen")} style={{ height: "100%" }}>
   <div ref={containerRef} className="ui-map-canvas" />

          {failed ? (
     <div className="absolute inset-0 z-[4] flex items-center justify-center p-6 text-center text-sm text-muted">
       La carte ne peut pas s&apos;afficher sur cet appareil (WebGL indisponible). La liste des lieux
reste disponible ci-dessous.
     </div>
          ) : null}

          <div className="ui-map-toolbar">
     {categories.length > 1 ? (
       <select
  className="ui-map-pill"
         aria-label="Filtrer par catégorie"
  value={category}
  onChange={(event) => setCategory(event.target.value)}
       >
         <option value="">Toutes les catégories</option>
  {categories.map((item) => (
           <option key={item} value={item}>
      {item}
    </option>
  ))}
       </select>
     ) : null}
     <div className="ui-map-actions">
       <button type="button" className="ui-map-pill" onClick={() => fit(true)} aria-label="Recentrer la carte">
         <LocateFixed className="h-3.5 w-3.5" />
  Recentrer
       </button>
       <button
  type="button"
         className="ui-map-pill"
         onClick={() => setFullscreen((value) => !value)}
  aria-label={fullscreen ? "Quitter le plein écran" : "Afficher en plein écran"}
       >
  {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
  {fullscreen ? "Quitter" : "Plein écran"}
       </button>
     </div>
          </div>

          {status ? <div className="ui-map-status">{status}</div> : null}
        </div>
      </div>

      {selectedPlace ? (
        <div className="rounded-2xl border border-line bg-ink/[0.02] p-4">
   <div className="flex flex-wrap items-center gap-2">
     <span className="text-lg leading-none">{selectedPlace.numbered ? `#${selectedPlace.glyph}` : selectedPlace.glyph}</span>
     <p className="text-sm font-medium text-ink">{selectedPlace.label}</p>
     {selectedPlace.category ? (
       <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
  {selectedPlace.category}
</span>
     ) : null}
   </div>
          {selectedPlace.description ? (
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{selectedPlace.description}</p>
   ) : null}
   <a
     href={`https://www.openstreetmap.org/?mlat=${selectedPlace.point[0]}&mlon=${selectedPlace.point[1]}#map=16/${selectedPlace.point[0]}/${selectedPlace.point[1]}`}
     target="_blank"
            rel="noreferrer"
     className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline"
   >
     Ouvrir dans OpenStreetMap
     <ExternalLink className="h-3 w-3" />
   </a>
 </div>
      ) : null}

      <ol className="flex flex-wrap gap-2">
        {visible.map((place) => (
   <li key={place.key}>
     <button
       type="button"
       onClick={() => setSelected(place.key)}
       aria-pressed={place.key === selected}
className={cn(
         "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
         place.key === selected
    ? "border-accent bg-accent/10 text-accent"
    : "border-line text-ink/80 hover:border-accent/50",
       )}
     >
       <span aria-hidden="true">{place.numbered ? `${place.glyph}.` : place.glyph}</span>
       {place.label}
     </button>
   </li>
        ))}
      </ol>

      {block.caption ? <figcaption className="text-xs text-muted">{block.caption}</figcaption> : null}
      {block.route ? (
 <p className="text-[11px] text-faint">
   Tracé routier OSRM / OpenStreetMap : aperçu indicatif, pas un guidage.
        </p>
      ) : null}
    </figure>
  );
}
