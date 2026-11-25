import "server-only";
import type { WeightEntryDTO } from "@/lib/domain";
import type { WeightUpsertInput } from "@/lib/validation/schemas";
import { prisma } from "../db";
import { toWeightDTO } from "../mappers";

const SELECT = { id: true, date: true, kg: true } as const;

export async function getWeights(userId: string): Promise<WeightEntryDTO[]> {
  const rows = await prisma.weightEntry.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    select: SELECT,
  });
  return rows.map(toWeightDTO);
}

export async function getWeightsBetween(
  userId: string,
  from: string,
  to: string,
): Promise<WeightEntryDTO[]> {
  const rows = await prisma.weightEntry.findMany({
    where: { userId, date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
    select: SELECT,
  });
  return rows.map(toWeightDTO);
}

/** One weight per day — upsert keeps the latest value for a date. */
export async function upsertWeight(
  userId: string,
  input: WeightUpsertInput,
): Promise<WeightEntryDTO> {
  const row = await prisma.weightEntry.upsert({
    where: { userId_date: { userId, date: input.date } },
    create: { userId, date: input.date, kg: input.kg },
    update: { kg: input.kg },
    select: SELECT,
  });
  return toWeightDTO(row);
}

export async function deleteWeight(userId: string, id: string): Promise<void> {
  await prisma.weightEntry.deleteMany({ where: { id, userId } });
}
