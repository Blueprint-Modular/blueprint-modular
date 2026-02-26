import { prisma } from "@/lib/prisma";

/**
 * Génère le prochain numéro d'actif selon le pattern de la config (ex: NXTF-[TYPE]-[YEAR]-[SEQ:4]).
 */
export async function generateAssetReference(
  domainId: string,
  assetTypeId: string,
  prefix: string
): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${assetTypeId.toUpperCase()}-${year}-`;
  const existing = await prisma.asset.findMany({
    where: {
      domainId,
      reference: { startsWith: pattern },
    },
    orderBy: { reference: "desc" },
    take: 1,
    select: { reference: true },
  });
  const lastSeq = existing[0]?.reference
    ? parseInt(existing[0].reference.slice(pattern.length), 10) || 0
    : 0;
  const nextSeq = lastSeq + 1;
  return `${pattern}${String(nextSeq).padStart(4, "0")}`;
}

/** Génère le prochain numéro de ticket (pattern ex: TK-[YEAR]-[SEQ:4] ou OT-[YEAR]-[SEQ:4]). */
export async function generateTicketReference(
  domainId: string,
  patternPrefix: string
): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${patternPrefix}-${year}-`;
  const existing = await prisma.ticket.findMany({
    where: { domainId, reference: { startsWith: pattern } },
    orderBy: { reference: "desc" },
    take: 1,
    select: { reference: true },
  });
  const lastSeq = existing[0]?.reference
    ? parseInt(existing[0].reference.slice(pattern.length), 10) || 0
    : 0;
  return `${pattern}${String(lastSeq + 1).padStart(4, "0")}`;
}

/** Génère le prochain numéro de mise à disposition (pattern ex: MAD-[YEAR]-[SEQ:4]). */
export async function generateAssignmentReference(
  domainId: string,
  patternPrefix: string
): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${patternPrefix}-${year}-`;
  const existing = await prisma.assignment.findMany({
    where: { domainId, reference: { startsWith: pattern } },
    orderBy: { reference: "desc" },
    take: 1,
    select: { reference: true },
  });
  const lastSeq = existing[0]?.reference
    ? parseInt(existing[0].reference.slice(pattern.length), 10) || 0
    : 0;
  return `${pattern}${String(lastSeq + 1).padStart(4, "0")}`;
}

/** Génère le prochain numéro de demande de changement (ex: CHG-2026-0001). */
export async function generateChangeReference(domainId: string): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `CHG-${year}-`;
  const existing = await prisma.changeRequest.findMany({
    where: { domainId, reference: { startsWith: pattern } },
    orderBy: { reference: "desc" },
    take: 1,
    select: { reference: true },
  });
  const lastSeq = existing[0]?.reference
    ? parseInt(existing[0].reference.slice(pattern.length), 10) || 0
    : 0;
  return `${pattern}${String(lastSeq + 1).padStart(4, "0")}`;
}
