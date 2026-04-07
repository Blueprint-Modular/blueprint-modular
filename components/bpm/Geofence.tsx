"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MapView } from "./MapView";
import type { MapMarker, MapPolygonSpec } from "./MapViewLeaflet";

export interface GeofenceZone {
  id: string;
  name?: string;
  positions: [number, number][];
  color?: string;
}

export interface GeofenceProps {
  zones: GeofenceZone[];
  onZonesChange?: (next: GeofenceZone[]) => void;
  center: [number, number];
  zoom?: number;
  height?: number | string;
  className?: string;
}

export function Geofence({
  zones: controlledZones,
  onZonesChange,
  center,
  zoom = 14,
  height = 400,
  className = "",
}: GeofenceProps) {
  const [local, setLocal] = useState<GeofenceZone[] | null>(null);
  const zones = onZonesChange ? controlledZones : local ?? controlledZones;
  const [selectedId, setSelectedId] = useState<string | null>(
    zones[0]?.id ?? null,
  );

  useEffect(() => {
    if (selectedId && !zones.some((z) => z.id === selectedId)) {
      setSelectedId(zones[0]?.id ?? null);
    }
  }, [zones, selectedId]);

  const setZones = useCallback(
    (next: GeofenceZone[]) => {
      if (onZonesChange) onZonesChange(next);
      else setLocal(next);
    },
    [onZonesChange],
  );

  const onMapClick = useCallback(
    (latlng: [number, number]) => {
      if (!selectedId) return;
      const next = zones.map((z) =>
        z.id === selectedId
          ? { ...z, positions: [...z.positions, latlng] }
          : z,
      );
      setZones(next);
    },
    [zones, selectedId, setZones],
  );

  const polygons: MapPolygonSpec[] = useMemo(
    () =>
      zones
        .filter((z) => z.positions.length >= 3)
        .map((z) => ({
          id: z.id,
          positions: [...z.positions, z.positions[0]],
          color: z.color,
          fillOpacity: z.id === selectedId ? 0.28 : 0.15,
        })),
    [zones, selectedId],
  );

  const vertexMarkers: MapMarker[] = useMemo(
    () =>
      zones.flatMap((z) =>
        z.positions.length < 3
          ? z.positions.map((p, i) => ({
              position: p,
              label: `${z.name ?? z.id} #${i + 1}`,
            }))
          : [],
      ),
    [zones],
  );

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: "var(--bpm-font-size-base)", color: "var(--bpm-text-secondary)" }}>
          Zone active :
        </span>
        <select
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(e.target.value || null)}
          style={{
            padding: "6px 10px",
            borderRadius: "var(--bpm-radius-sm)",
            border: "1px solid var(--bpm-border)",
            background: "var(--bpm-surface)",
            color: "var(--bpm-text-primary)",
            fontSize: "var(--bpm-font-size-base)",
          }}
        >
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name ?? z.id} ({z.positions.length} pts)
            </option>
          ))}
        </select>
        <span style={{ fontSize: 13, color: "var(--bpm-text-muted)" }}>
          Cliquez sur la carte pour ajouter un point au polygone.
        </span>
      </div>
      <MapView
        center={center}
        zoom={zoom}
        height={height}
        markers={vertexMarkers}
        polygons={polygons}
        onMapClick={onMapClick}
      />
    </div>
  );
}
