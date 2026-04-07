"use client";

import React, { useMemo } from "react";

export interface MapMarker {
  position: [number, number];
  label?: string;
  /** Affiché dans un divIcon si défini */
  number?: number;
}

export interface MapPolygonSpec {
  id: string;
  positions: [number, number][];
  color?: string;
  fillOpacity?: number;
}

export interface MapViewLeafletInnerProps {
  rl: typeof import("react-leaflet");
  L: typeof import("leaflet");
  center: [number, number];
  zoom: number;
  height: number | string;
  markers: MapMarker[];
  onMarkerClick?: (index: number, marker: MapMarker) => void;
  tileUrl: string;
  tileAttribution?: string;
  polylines?: [number, number][][];
  polylineColor?: string;
  polygons?: MapPolygonSpec[];
  onMapClick?: (latlng: [number, number]) => void;
  className?: string;
}

function LeafletMapClick({
  useMapEvents,
  onMapClick,
}: {
  useMapEvents: typeof import("react-leaflet").useMapEvents;
  onMapClick: (latlng: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/**
 * Carte Leaflet : à utiliser uniquement après import dynamique de `react-leaflet` et `leaflet`.
 */
export function MapViewLeafletInner({
  rl,
  L,
  center,
  zoom,
  height,
  markers,
  onMarkerClick,
  tileUrl,
  tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  polylines,
  polylineColor,
  polygons,
  onMapClick,
  className = "",
}: MapViewLeafletInnerProps) {
  const { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon } = rl;
  const h = typeof height === "number" ? `${height}px` : height;

  const numberedIcon = useMemo(() => {
    return (n: number) =>
      L.divIcon({
        className: "bpm-map-marker-num",
        html: `<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:var(--bpm-accent);color:var(--bpm-accent-contrast);font-size:12px;font-weight:600;border:2px solid var(--bpm-border-strong)">${n}</span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
  }, [L]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: h, width: "100%", background: "var(--bpm-bg-secondary)" }}
      className={"bpm-mapview-leaflet rounded-lg " + className}
    >
      <TileLayer attribution={tileAttribution} url={tileUrl} />
      {onMapClick ? (
        <LeafletMapClick useMapEvents={rl.useMapEvents} onMapClick={onMapClick} />
      ) : null}
      {polygons?.map((z) => (
        <Polygon
          key={z.id}
          positions={z.positions}
          pathOptions={{
            color: z.color ?? "var(--bpm-accent)",
            fillColor: z.color ?? "var(--bpm-accent)",
            fillOpacity: z.fillOpacity ?? 0.2,
          }}
        />
      ))}
      {polylines?.map((pts, i) => (
        <Polyline
          key={i}
          positions={pts}
          pathOptions={{ color: polylineColor ?? "var(--bpm-accent)", weight: 3 }}
        />
      ))}
      {markers.map((m, i) => {
        const pos = L.latLng(m.position[0], m.position[1]);
        const icon =
          m.number != null
            ? numberedIcon(m.number)
            : undefined;
        return (
          <Marker
            key={i}
            position={pos}
            eventHandlers={{
              click: () => onMarkerClick?.(i, m),
            }}
            {...(icon ? { icon } : {})}
          >
            {m.label ? <Popup>{m.label}</Popup> : null}
          </Marker>
        );
      })}
    </MapContainer>
  );
}
