"use client";

import React, { useEffect, useState } from "react";

export type MachineStatusState = "running" | "idle" | "fault" | "unknown";

/**
 * @component bpm.machineStatus
 * @description Carte d'état machine avec indicateur LED animé (clignotement en production ou défaut).
 * @example
 * bpm.machineStatus({ title: "Machine A", state: "running", detail: "Lot #1234" })
 *
 * @param {object} props
 * @param {string} props.title - Nom de la machine. Obligatoire.
 * @param {"running"|"idle"|"fault"|"unknown"} props.state - État actuel. Obligatoire.
 * @param {string} [props.detail] - Détail additionnel affiché sous l'état. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.sensorGrid, bpm.liveGauge, bpm.statusBox
 */
export interface MachineStatusProps {
  title: string;
  state: MachineStatusState;
  detail?: string;
  className?: string;
}

const STATE_LABEL: Record<MachineStatusState, string> = {
  running: "En production",
  idle: "À l’arrêt",
  fault: "Défaut",
  unknown: "Inconnu",
};

export function MachineStatus({
  title,
  state,
  detail,
  className = "",
}: MachineStatusProps) {
  const color =
    state === "running"
      ? "var(--bpm-success)"
      : state === "idle"
        ? "var(--bpm-warning)"
        : state === "fault"
          ? "var(--bpm-error)"
          : "var(--bpm-text-muted)";

  const [pulse, setPulse] = useState(1);
  useEffect(() => {
    if (state !== "running" && state !== "fault") {
      setPulse(1);
      return;
    }
    const ms = state === "fault" ? 500 : 900;
    const id = window.setInterval(() => setPulse((x) => (x === 1 ? 0.55 : 1)), ms);
    return () => window.clearInterval(id);
  }, [state]);

  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        padding: 16,
        background: "var(--bpm-surface)",
        boxShadow: "var(--bpm-shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          aria-hidden
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: color,
            opacity: pulse,
            transform: `scale(${0.92 + pulse * 0.08})`,
            transition: "opacity 0.35s ease, transform 0.35s ease",
            boxShadow: `0 0 0 4px color-mix(in srgb, ${color} 30%, transparent)`,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "var(--bpm-text-primary)",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 13, color: "var(--bpm-text-secondary)", marginTop: 4 }}>
            {STATE_LABEL[state]}
          </div>
          {detail && (
            <div style={{ fontSize: 12, color: "var(--bpm-text-muted)", marginTop: 6 }}>{detail}</div>
          )}
        </div>
      </div>
    </div>
  );
}
