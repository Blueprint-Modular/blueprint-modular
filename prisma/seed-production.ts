/**
 * Seed données production (Phase 1).
 * S'accroche à l'organisation par défaut créée par seed-organizations (DEFAULT_ORG_SLUG).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_ORG_SLUG = process.env.DEFAULT_ORG_SLUG ?? "default";

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

async function main() {
  const org = await prisma.organization.findFirst({
    where: { slug: DEFAULT_ORG_SLUG },
  });
  if (!org) {
    throw new Error(
      "Organisation par défaut introuvable — lancer seed-organizations.ts d'abord"
    );
  }

  const orgId = org.id;

  // Idempotent : supprimer les données production existantes pour cette org
  await prisma.productionAlert.deleteMany({ where: { organizationId: orgId } });
  await prisma.productionSession.deleteMany({ where: { organizationId: orgId } });
  await prisma.productionLine.deleteMany({ where: { organizationId: orgId } });

  // 4 lignes de production (noms démo — usine type agroalimentaire)
  const linesData = [
    { name: "Ligne Extrudeur A", code: "EXT-A", rate: 120 },
    { name: "Ligne Extrudeur B", code: "EXT-B", rate: 115 },
    { name: "Ligne Formeur 1", code: "FORM-1", rate: 95 },
    { name: "Ligne Conditionnement 1", code: "COND-1", rate: 150 },
  ];

  const createdLines = await Promise.all(
    linesData.map(({ name, code, rate }) =>
      prisma.productionLine.create({
        data: {
          name,
          code,
          status: "active",
          theoreticalRate: rate,
          organizationId: orgId,
        },
      })
    )
  );

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // 30 jours de sessions, 2 par ligne par jour
  const sessions: Array<{
    lineId: string;
    startedAt: Date;
    endedAt: Date;
    availableTime: number;
    stopsTime: number;
    plannedStops: number;
    unplannedStops: number;
    totalParts: number;
    goodParts: number;
    rejectedParts: number;
    rawMaterialUsed: number;
    rawMaterialLost: number;
    operatorName: string;
    shift: string;
    organizationId: string;
  }> = [];

  const shifts = ["matin", "après-midi", "nuit"];
  const operators = ["Marie D.", "Jean L.", "Sophie M.", "Pierre R.", "Luc B."];

  for (let d = 29; d >= 0; d--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - d);
    dayStart.setHours(6, 0, 0, 0);

    for (const line of createdLines) {
      const rate = line.theoreticalRate;
      for (let s = 0; s < 2; s++) {
        const start = new Date(dayStart);
        start.setHours(6 + s * 8, 0, 0, 0);
        const end = new Date(start);
        end.setHours(14 + s * 8, 0, 0, 0);

        const availableTime = 8 * 60; // 480 min
        const stopsTime = randomBetween(35, 75);
        const plannedStops = stopsTime * randomBetween(0.35, 0.5);
        const unplannedStops = stopsTime - plannedStops;
        const netMin = availableTime - stopsTime;
        const netHours = netMin / 60;
        const totalParts = Math.round(
          rate * netHours * randomBetween(0.88, 1.02)
        );
        const qualityRate = randomBetween(0.92, 0.99);
        const goodParts = Math.round(totalParts * qualityRate);
        const rejectedParts = totalParts - goodParts;
        const rawUsed = totalParts * randomBetween(0.08, 0.12); // kg/unité
        const lossRate = randomBetween(0.03, 0.08);
        const rawMaterialLost = rawUsed * (lossRate / (1 - lossRate));
        const rawMaterialUsed = rawUsed;

        sessions.push({
          lineId: line.id,
          startedAt: start,
          endedAt: end,
          availableTime,
          stopsTime,
          plannedStops,
          unplannedStops,
          totalParts,
          goodParts,
          rejectedParts,
          rawMaterialUsed,
          rawMaterialLost,
          operatorName: operators[randomInt(0, operators.length - 1)],
          shift: shifts[s],
          organizationId: orgId,
        });
      }
    }
  }

  await prisma.productionSession.createMany({ data: sessions });

  // 15-20 alertes variées (types : trs_low, loss_high, line_stopped, quality_issue)
  const alertTypes = [
    "trs_low",
    "loss_high",
    "line_stopped",
    "quality_issue",
  ] as const;
  const severities = ["info", "warning", "critical"] as const;
  const messages: Record<string, string> = {
    trs_low: "TRS sous le seuil cible",
    loss_high: "Pertes matière élevées sur la période",
    line_stopped: "Arrêt non planifié ligne",
    quality_issue: "Taux de rebut anormal",
  };

  const alertsToCreate: Array<{
    lineId: string;
    type: string;
    severity: string;
    message: string;
    value: number | null;
    threshold: number | null;
    organizationId: string;
  }> = [];

  for (let i = 0; i < 18; i++) {
    const line = createdLines[i % createdLines.length];
    const type = alertTypes[randomInt(0, alertTypes.length - 1)];
    const severity =
      type === "trs_low" || type === "loss_high"
        ? severities[randomInt(1, 2)]
        : severities[randomInt(0, 2)];
    const value =
      type === "trs_low"
        ? randomBetween(62, 72)
        : type === "loss_high"
          ? randomBetween(6, 10)
          : null;
    const threshold = type === "trs_low" ? 70 : type === "loss_high" ? 5 : null;

    alertsToCreate.push({
      lineId: line.id,
      type,
      severity,
      message: messages[type] + ` — ${line.code}`,
      value: value ?? null,
      threshold: threshold ?? null,
      organizationId: orgId,
    });
  }

  await prisma.productionAlert.createMany({ data: alertsToCreate });

  const sessionCount = await prisma.productionSession.count({
    where: { organizationId: orgId },
  });
  const alertCount = await prisma.productionAlert.count({
    where: { organizationId: orgId },
  });

  console.log("✅ Seed production terminé");
  console.log(`   Org : ${org.name} (${DEFAULT_ORG_SLUG})`);
  console.log(`   Lignes : ${createdLines.length} (EXT-A, EXT-B, FORM-1, COND-1)`);
  console.log(`   Sessions : ${sessionCount}`);
  console.log(`   Alertes : ${alertCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
