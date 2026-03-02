"use client";

import { useState, useCallback } from "react";
import {
  Title,
  Panel,
  Button,
  Selectbox,
  Input,
  NumberInput,
  DateInput,
  TimeInput,
  Textarea,
  Grid,
  Column,
} from "@/components/bpm";
import {
  calculateTRS,
  calculateAvailability,
  calculatePerformance,
  calculateQuality,
} from "@/lib/compute";

const LINES = [
  { value: "EXT-A", label: "Ligne Extrudeur A" },
  { value: "EXT-B", label: "Ligne Extrudeur B" },
  { value: "FORM-1", label: "Ligne Formeur 1" },
  { value: "COND-1", label: "Ligne Conditionnement 1" },
];

const SHIFTS = [
  { value: "matin", label: "Matin" },
  { value: "après-midi", label: "Après-midi" },
  { value: "nuit", label: "Nuit" },
];

type FormState = {
  lineCode: string;
  shift: string;
  operatorName: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  availableTime: number;
  plannedStops: number;
  unplannedStops: number;
  totalParts: number;
  goodParts: number;
  rawMaterialUsed: number;
  rawMaterialLost: number;
  notes: string;
};

const defaultForm: FormState = {
  lineCode: "EXT-A",
  shift: "matin",
  operatorName: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  availableTime: 480,
  plannedStops: 30,
  unplannedStops: 0,
  totalParts: 0,
  goodParts: 0,
  rawMaterialUsed: 0,
  rawMaterialLost: 0,
  notes: "",
};

export default function DemoSessionNewPage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [result, setResult] = useState<{
    trs: number;
    availability: number;
    performance: number;
    quality: number;
  } | null>(null);

  const update = useCallback((updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setResult(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const availableTime = form.availableTime || 0;
      const stopsTime = (form.plannedStops || 0) + (form.unplannedStops || 0);
      const goodParts = form.goodParts || 0;
      const totalParts = form.totalParts || 0;
      const netTimeHours = Math.max(0, (availableTime - stopsTime) / 60);
      const theoreticalRate = 120; // demo default
      const trs = calculateTRS({
        available_time: availableTime,
        stops_time: stopsTime,
        good_parts: goodParts,
        total_parts: totalParts,
        produced_parts: goodParts,
        theoretical_rate: theoreticalRate,
        net_time: netTimeHours,
      });
      const availability = calculateAvailability({
        available_time: availableTime,
        stops_time: stopsTime,
      });
      const performance = calculatePerformance({
        produced_parts: goodParts,
        theoretical_rate: theoreticalRate,
        net_time: netTimeHours,
      });
      const quality = calculateQuality({
        good_parts: goodParts,
        total_parts: totalParts,
      });
      setResult({
        trs: Math.round(trs * 100) / 100,
        availability: Math.round(availability * 100) / 100,
        performance: Math.round(performance * 100) / 100,
        quality: Math.round(quality * 100) / 100,
      });
    },
    [form]
  );

  const resetForm = useCallback(() => {
    setForm(defaultForm);
    setResult(null);
  }, []);

  return (
    <div className="space-y-6">
      <Title level={1}>Saisir une session (simulation)</Title>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Grid cols={2}>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Ligne de production
            </label>
            <Selectbox
              options={LINES}
              value={form.lineCode}
              onChange={(v) => update({ lineCode: String(v) })}
            />
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Shift
            </label>
            <Selectbox
              options={SHIFTS}
              value={form.shift}
              onChange={(v) => update({ shift: String(v) })}
            />
          </Column>
        </Grid>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            Opérateur
          </label>
          <Input
            value={form.operatorName}
            onChange={(v) => update({ operatorName: v })}
            placeholder="Nom de l'opérateur"
          />
        </div>
        <Grid cols={2}>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Début
            </label>
            <div className="flex gap-2">
              <DateInput
                value={form.startDate || null}
                onChange={(v) => update({ startDate: v ? v.toISOString().slice(0, 10) : "" })}
              />
              <TimeInput
                value={form.startTime || null}
                onChange={(v) => update({ startTime: v ? `${String(v.getHours()).padStart(2, "0")}:${String(v.getMinutes()).padStart(2, "0")}` : "" })}
              />
            </div>
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Fin
            </label>
            <div className="flex gap-2">
              <DateInput
                value={form.endDate || null}
                onChange={(v) => update({ endDate: v ? v.toISOString().slice(0, 10) : "" })}
              />
              <TimeInput
                value={form.endTime || null}
                onChange={(v) => update({ endTime: v ? `${String(v.getHours()).padStart(2, "0")}:${String(v.getMinutes()).padStart(2, "0")}` : "" })}
              />
            </div>
          </Column>
        </Grid>
        <Grid cols={3}>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Temps disponible (min)
            </label>
            <NumberInput
              value={form.availableTime}
              onChange={(v) => update({ availableTime: v ?? 0 })}
              min={0}
            />
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Arrêts planifiés (min)
            </label>
            <NumberInput
              value={form.plannedStops}
              onChange={(v) => update({ plannedStops: v ?? 0 })}
              min={0}
            />
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Arrêts non planifiés (min)
            </label>
            <NumberInput
              value={form.unplannedStops}
              onChange={(v) => update({ unplannedStops: v ?? 0 })}
              min={0}
            />
          </Column>
        </Grid>
        <Grid cols={3}>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Pièces produites
            </label>
            <NumberInput
              value={form.totalParts}
              onChange={(v) => update({ totalParts: v ?? 0 })}
              min={0}
            />
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Pièces conformes
            </label>
            <NumberInput
              value={form.goodParts}
              onChange={(v) => update({ goodParts: v ?? 0 })}
              min={0}
            />
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Matière utilisée (kg)
            </label>
            <NumberInput
              value={form.rawMaterialUsed}
              onChange={(v) => update({ rawMaterialUsed: v ?? 0 })}
              min={0}
            />
          </Column>
        </Grid>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            Matière perdue (kg)
          </label>
          <NumberInput
            value={form.rawMaterialLost}
            onChange={(v) => update({ rawMaterialLost: v ?? 0 })}
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            Notes
          </label>
          <Textarea
            value={form.notes}
            onChange={(v) => update({ notes: v })}
            placeholder="Notes optionnelles"
            rows={3}
          />
        </div>
        <Button type="submit">Enregistrer (simulation)</Button>
      </form>

      {result && (
        <Panel title="Résultat (simulation)" variant="success">
          <p className="text-sm mb-2">
            Session enregistrée (simulation) — TRS calculé : {result.trs}% |
            Disponibilité : {result.availability}% | Performance : {result.performance}% |
            Qualité : {result.quality}%
          </p>
          <p className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            En production réelle, cette session serait enregistrée en base et
            déclencherait une alerte si TRS &lt; 70%.
          </p>
          <Button variant="secondary" size="small" onClick={resetForm} className="mt-3">
            Nouvelle saisie
          </Button>
        </Panel>
      )}
    </div>
  );
}
