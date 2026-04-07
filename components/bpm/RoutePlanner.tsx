"use client";

import React, { useCallback, useMemo, useState } from "react";
import { MapView } from "./MapView";

export interface RouteStop {
  id: string;
  label?: string;
  position: [number, number];
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface RoutePlannerProps {
  stops: RouteStop[];
  onReorder?: (next: RouteStop[]) => void;
  showDistance?: boolean;
  mapHeight?: number | string;
  className?: string;
}

export function RoutePlanner({
  stops: controlledStops,
  onReorder,
  showDistance = true,
  mapHeight = 360,
  className = "",
}: RoutePlannerProps) {
  const [local, setLocal] = useState<RouteStop[] | null>(null);
  const stops = onReorder ? controlledStops : local ?? controlledStops;

  const setStops = useCallback(
    (next: RouteStop[]) => {
      if (onReorder) onReorder(next);
      else setLocal(next);
    },
    [onReorder],
  );

  const move = useCallback(
    (index: number, dir: -1 | 1) => {
      const j = index + dir;
      if (j < 0 || j >= stops.length) return;
      const next = stops.slice();
      [next[index], next[j]] = [next[j], next[index]];
      setStops(next);
    },
    [stops, setStops],
  );

  const totalKm = useMemo(() => {
    let t = 0;
    for (let i = 1; i < stops.length; i++) {
      t += haversineKm(stops[i - 1].position, stops[i].position);
    }
    return t;
  }, [stops]);

  const center: [number, number] =
    stops[0]?.position ?? [48.8566, 2.3522];

  const markers = stops.map((s, i) => ({
    position: s.position,
    label: s.label ?? s.id,
    number: i + 1,
  }));

  const polyline: [number, number][][] =
    stops.length >= 2 ? [stops.map((s) => s.position)] : [];

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 1fr) 2fr",
        gap: 16,
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
          background: "var(--bpm-surface)",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {showDistance && stops.length > 1 && (
          <div
            style={{
              fontSize: "var(--bpm-font-size-base)",
              color: "var(--bpm-text-secondary)",
              marginBottom: 4,
            }}
          >
            Distance (orthodromique) :{" "}
            <strong style={{ color: "var(--bpm-text-primary)" }}>
              {totalKm.toFixed(2)} km
            </strong>
          </div>
        )}
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {stops.map((s, i) => (
            <li
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid var(--bpm-border)",
                fontSize: "var(--bpm-font-size-base)",
                color: "var(--bpm-text-primary)",
              }}
            >
              <span
                style={{
                  minWidth: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--bpm-accent)",
                  color: "var(--bpm-accent-contrast)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {i + 1}
              </span>
              <span style={{ flex: 1 }}>{s.label ?? s.id}</span>
              <button
                type="button"
                aria-label="Monter"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "var(--bpm-radius-sm)",
                  border: "1px solid var(--bpm-border)",
                  background: "var(--bpm-bg-secondary)",
                  color: "var(--bpm-text-primary)",
                  cursor: i === 0 ? "not-allowed" : "pointer",
                  opacity: i === 0 ? 0.5 : 1,
                }}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Descendre"
                disabled={i === stops.length - 1}
                onClick={() => move(i, 1)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "var(--bpm-radius-sm)",
                  border: "1px solid var(--bpm-border)",
                  background: "var(--bpm-bg-secondary)",
                  color: "var(--bpm-text-primary)",
                  cursor: i === stops.length - 1 ? "not-allowed" : "pointer",
                  opacity: i === stops.length - 1 ? 0.5 : 1,
                }}
              >
                ↓
              </button>
            </li>
          ))}
        </ul>
      </div>
      <MapView
        center={center}
        zoom={12}
        height={mapHeight}
        markers={markers}
        polylines={polyline}
        polylineColor="var(--bpm-accent)"
      />
    </div>
  );
}
