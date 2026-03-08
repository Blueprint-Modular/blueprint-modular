"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

/** Carte Leaflet chargée côté client uniquement (évite erreurs SSR). */
const LeafletMap = dynamic(
  () => import("./GpsMap").then((m) => m.GpsMap),
  { ssr: false }
);

export type GpsStatus = "idle" | "loading" | "success" | "error";

export interface GpsProps {
  /** Titre affiché au-dessus du bloc. */
  label?: string;
  /** Afficher une carte Leaflet. Default: true. */
  showMap?: boolean;
  /** Callback appelé quand la position est obtenue (mode display). */
  onLocation?: (coords: { lat: number; lng: number; accuracy: number }) => void;
  /** Hauteur de la carte en px. Default: 300. */
  height?: number;
  className?: string;
  /** Mode : 'display' = affichage position, 'picker' = sélection d'un point sur la carte. Default: 'display'. */
  mode?: "display" | "picker";
  /** Position courante (mode picker). */
  value?: { lat: number; lng: number } | null;
  /** Callback à chaque déplacement du marker ou clic sur la carte (mode picker). */
  onChange?: (coords: { lat: number; lng: number }) => void;
}

const DEFAULT_CENTER = { lat: 48.8566, lng: 2.3522 };

export function Gps({
  label,
  showMap = true,
  onLocation,
  height = 300,
  className = "",
  mode = "display",
  value = null,
  onChange,
}: GpsProps) {
  const [status, setStatus] = useState<GpsStatus>("idle");
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pickerCoords = value ?? (mode === "picker" ? null : coords);

  const locate = useCallback(() => {
    if (!navigator?.geolocation) {
      setErrorMessage("Géolocalisation non disponible");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? 0,
        };
        setCoords(c);
        setStatus("success");
        onLocation?.(c);
        if (mode === "picker") onChange?.({ lat: c.lat, lng: c.lng });
      },
      (err) => {
        setErrorMessage(
          err.code === 1
            ? "Autorisation refusée"
            : err.message || "Impossible d'obtenir la position"
        );
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [onLocation, mode, onChange]);

  const handlePickerChange = useCallback(
    (lat: number, lng: number) => {
      onChange?.({ lat, lng });
    },
    [onChange]
  );

  return (
    <div
      className={`bpm-gps ${className}`.trim()}
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--bpm-bg-primary)",
      }}
    >
      {label && (
        <div
          className="bpm-gps-label"
          style={{
            padding: "8px 12px",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--bpm-text-primary)",
          }}
        >
          {label}
        </div>
      )}
      <div style={{ padding: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: showMap ? 8 : 0 }}>
          {(mode === "display" || mode === "picker") && (
            <button
              type="button"
              onClick={locate}
              disabled={status === "loading"}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "var(--bpm-accent)",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: status === "loading" ? "wait" : "pointer",
              }}
            >
              {status === "loading"
                ? "Localisation…"
                : mode === "picker"
                ? "Ma position"
                : "Localiser"}
            </button>
          )}
          {mode === "display" && status === "success" && coords && (
            <p
              className="bpm-caption"
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "var(--bpm-text-secondary)",
              }}
            >
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)} (±{Math.round(coords.accuracy)} m)
            </p>
          )}
          {mode === "display" && status === "error" && errorMessage && (
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--bpm-error, #dc2626)" }}>
              {errorMessage}
            </p>
          )}
        </div>
        {showMap && (
          <div style={{ width: "100%", height: height, borderRadius: 8, overflow: "hidden" }}>
            <LeafletMap
              mode={mode}
              center={
                mode === "picker" && pickerCoords
                  ? { lat: pickerCoords.lat, lng: pickerCoords.lng }
                  : coords
                  ? { lat: coords.lat, lng: coords.lng }
                  : DEFAULT_CENTER
              }
              markerPosition={
                mode === "picker" && pickerCoords
                  ? pickerCoords
                  : coords
                  ? { lat: coords.lat, lng: coords.lng }
                  : null
              }
              onMarkerChange={handlePickerChange}
              onMapClick={mode === "picker" ? handlePickerChange : undefined}
              height={height}
            />
          </div>
        )}
      </div>
    </div>
  );
}
