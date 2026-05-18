"use client";

import React, { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface GpsMapProps {
  mode: "display" | "picker";
  center: { lat: number; lng: number };
  markerPosition: { lat: number; lng: number } | null;
  onMarkerChange?: (lat: number, lng: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  height: number;
}

/**
 * @component bpm.gpsMap
 * @description Carte Leaflet avec marqueur GPS (mode affichage ou picker) et gestion des clics.
 * @example
 * bpm.gpsMap({ mode: "picker", center: { lat: 48.85, lng: 2.35 }, markerPosition: pos, onMapClick: setPos, height: 300 })
 *
 * @param {object} props
 * @param {"display"|"picker"} props.mode - Mode affichage ou sélection. Obligatoire.
 * @param {object} props.center - Centre initial {lat, lng}. Obligatoire.
 * @param {object|null} props.markerPosition - Position du marqueur {lat, lng} ou null. Obligatoire.
 * @param {function} [props.onMarkerChange] - Callback au déplacement du marqueur (mode picker). Optionnel.
 * @param {function} [props.onMapClick] - Callback au clic sur la carte (mode picker). Optionnel.
 * @param {number} props.height - Hauteur de la carte en pixels. Obligatoire.
 *
 * @associated bpm.gps, bpm.mapView, bpm.geofence
 */
export function GpsMap({
  mode,
  center,
  markerPosition,
  onMarkerChange,
  onMapClick,
  height,
}: GpsMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current).setView([center.lat, center.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center.lat, center.lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    if (markerPosition) {
      const icon = L.divIcon({
        className: "bpm-gps-marker",
        html: "<div style=\"width:24px;height:24px;background:var(--bpm-accent,#048dc3);border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)\"></div>",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const marker = L.marker([markerPosition.lat, markerPosition.lng], {
        icon,
        draggable: mode === "picker",
      }).addTo(map);
      if (mode === "picker" && onMarkerChange) {
        marker.on("dragend", () => {
          const latlng = marker.getLatLng();
          onMarkerChange(latlng.lat, latlng.lng);
        });
      }
      markerRef.current = marker;
    }
  }, [markerPosition?.lat, markerPosition?.lng, mode, onMarkerChange]);

  const handleClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (mode !== "picker" || !onMapClick) return;
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
    [mode, onMapClick]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.off("click", handleClick);
    if (mode === "picker" && onMapClick) {
      map.on("click", handleClick);
    }
    return () => {
      map.off("click", handleClick);
    };
  }, [mode, onMapClick, handleClick]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height, minHeight: 200 }}
      className="bpm-gps-map"
    />
  );
}
