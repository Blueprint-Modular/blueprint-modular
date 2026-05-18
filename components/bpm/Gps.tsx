"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

/** Carte Leaflet chargée côté client uniquement (évite erreurs SSR). */
const LeafletMap = dynamic(
  () => import("./GpsMap").then((m) => m.GpsMap),
  { ssr: false }
);

/** État du cycle de vie de la géolocalisation. */
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
  /** Classes CSS additionnelles. */
  className?: string;
  /** Mode : 'display' = affichage position, 'picker' = sélection d'un point sur la carte. Default: 'display'. */
  mode?: "display" | "picker";
  /** Position courante (mode picker). */
  value?: { lat: number; lng: number } | null;
  /** Callback à chaque déplacement du marker ou clic sur la carte (mode picker). */
  onChange?: (coords: { lat: number; lng: number }) => void;
}

const DEFAULT_CENTER = { lat: 48.8566, lng: 2.3522 };

/**
 * @component bpm.gps
 * @description Composant de géolocalisation avec carte Leaflet : affiche la position courante de l'utilisateur (mode `display`) ou permet de sélectionner un point sur la carte (mode `picker`).
 * @example
 * // Mode display : récupération et affichage de la position du navigateur
 * bpm.gps({
 *   label: "Ma position",
 *   onLocation: ({ lat, lng, accuracy }) => console.log(lat, lng, accuracy),
 * })
 *
 * @example
 * // Mode picker : sélection contrôlée d'un point sur la carte
 * const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
 * bpm.gps({
 *   mode: "picker",
 *   value: point,
 *   onChange: setPoint,
 *   height: 400,
 * })
 *
 * @param {object} props
 * @param {string} [props.label] - Titre affiché au-dessus du bloc. Optionnel.
 * @param {boolean} [props.showMap=true] - Affiche la carte Leaflet sous les contrôles. Optionnel.
 * @param {function} [props.onLocation] - Callback appelé en mode `display` quand la position du navigateur est obtenue. Reçoit `{ lat, lng, accuracy }`. Optionnel.
 * @param {number} [props.height=300] - Hauteur de la carte en pixels. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles appliquées au conteneur racine. Optionnel.
 * @param {"display"|"picker"} [props.mode="display"] - Mode du composant : `display` pour afficher la position courante, `picker` pour sélectionner un point. Optionnel.
 * @param {{lat:number,lng:number}|null} [props.value=null] - Position courante en mode `picker` (composant contrôlé). Optionnel.
 * @param {function} [props.onChange] - Callback appelé en mode `picker` à chaque clic sur la carte ou déplacement du marqueur. Reçoit `{ lat, lng }`. Optionnel.
 *
 * @note SSR-safe : la carte Leaflet est chargée dynamiquement avec `ssr: false`. L'accès à `navigator.geolocation` est encapsulé dans un handler utilisateur, jamais exécuté pendant le rendu.
 * @note Permission requise : le navigateur demande l'autorisation à l'utilisateur lors du premier clic sur « Localiser ». En cas de refus (code 1), le statut passe à `error` avec le message « Autorisation refusée ».
 *
 * @parent bpm.card, bpm.panel, bpm.modal
 * @associated bpm.mapView, bpm.geofence, bpm.routePlanner, bpm.addressInput
 */
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
        borderRadius: "var(--bpm-radius)",
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
                borderRadius: "var(--bpm-radius)",
                border: "none",
                background: "var(--bpm-accent)",
                color: "var(--bpm-accent-contrast)",
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
            <p style={{ margin: 0, fontSize: "var(--bpm-font-size-sm)", color: "var(--bpm-error)" }}>
              {errorMessage}
            </p>
          )}
        </div>
        {showMap && (
          <div style={{ width: "100%", height: height, borderRadius: "var(--bpm-radius)", overflow: "hidden" }}>
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
