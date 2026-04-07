"use client";

import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapViewLeafletInner } from "./MapViewLeaflet";
import type { MapMarker, MapPolygonSpec } from "./MapViewLeaflet";

export type { MapMarker, MapPolygonSpec };

const OSM_TILE =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export interface MapViewProps {
  center: [number, number];
  zoom?: number;
  height?: number | string;
  markers?: MapMarker[];
  onMarkerClick?: (index: number, marker: MapMarker) => void;
  tileUrl?: string;
  tileAttribution?: string;
  polylines?: [number, number][][];
  polylineColor?: string;
  polygons?: MapPolygonSpec[];
  onMapClick?: (latlng: [number, number]) => void;
  className?: string;
}

type LeafletMods = {
  rl: typeof import("react-leaflet");
  L: typeof import("leaflet");
};

function fixLeafletDefaultIcons(L: typeof import("leaflet")) {
  type IconProto = { _getIconUrl?: string };
  const proto = L.Icon.Default.prototype as unknown as IconProto;
  delete proto._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export function MapView({
  center,
  zoom = 13,
  height = 320,
  markers = [],
  onMarkerClick,
  tileUrl = OSM_TILE,
  tileAttribution,
  polylines,
  polylineColor,
  polygons,
  onMapClick,
  className = "",
}: MapViewProps) {
  const [mods, setMods] = useState<LeafletMods | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [L, rl] = await Promise.all([
          import("leaflet"),
          import("react-leaflet"),
        ]);
        if (cancelled) return;
        fixLeafletDefaultIcons(L.default);
        setMods({ rl, L: L.default });
        setLoadError(null);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Map load failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <div
        className={className}
        style={{
          height: typeof height === "number" ? height : height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bpm-bg-secondary)",
          color: "var(--bpm-text-secondary)",
          fontSize: "var(--bpm-font-size-base)",
          borderRadius: "var(--bpm-radius)",
        }}
      >
        {loadError}
      </div>
    );
  }

  if (!mods) {
    return (
      <div
        className={className}
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bpm-bg-secondary)",
          color: "var(--bpm-text-muted)",
          fontSize: "var(--bpm-font-size-base)",
          borderRadius: "var(--bpm-radius)",
        }}
      >
        …
      </div>
    );
  }

  return (
    <MapViewLeafletInner
      rl={mods.rl}
      L={mods.L}
      center={center}
      zoom={zoom}
      height={height}
      markers={markers}
      onMarkerClick={onMarkerClick}
      tileUrl={tileUrl}
      tileAttribution={tileAttribution}
      polylines={polylines}
      polylineColor={polylineColor}
      polygons={polygons}
      onMapClick={onMapClick}
      className={className}
    />
  );
}
