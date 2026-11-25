import "server-only";
import type { CardioDTO } from "@/lib/domain";
import type { CardioCreateInput } from "@/lib/validation/schemas";
import { prisma } from "../db";
import { NotFoundError } from "../http";
import { toCardioDTO } from "../mappers";

const SELECT = {
  id: true,
  date: true,
  type: true,
  minutes: true,
  distanceKm: true,
  pace: true,
  kcal: true,
  notes: true,
} as const;

export async function getCardioByDate(
  userId: string,
  date: string,
): Promise<CardioDTO[]> {
  const rows = await prisma.cardio.findMany({
    where: { userId, date },
    orderBy: { createdAt: "asc" },
    select: SELECT,
  });
  return rows.map(toCardioDTO);
}

export async function getCardioBetween(
  userId: string,
  from: string,
  to: string,
): Promise<CardioDTO[]> {
  const rows = await prisma.cardio.findMany({
    where: { userId, date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
    select: SELECT,
  });
  return rows.map(toCardioDTO);
}

export async function createCardio(
  userId: string,
  input: CardioCreateInput,
): Promise<CardioDTO> {
  const row = await prisma.cardio.create({
    data: {
      userId,
      date: input.date,
      type: input.type,
      minutes: input.minutes,
      distanceKm: input.distanceKm ?? null,
      pace: input.pace ?? null,
      kcal: input.kcal ?? null,
      notes: input.notes ?? null,
    },
    select: SELECT,
  });
  return toCardioDTO(row);
}

export async function updateCardio(
  userId: string,
  id: string,
  input: Partial<CardioCreateInput>,
): Promise<CardioDTO> {
  const existing = await prisma.cardio.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Cardio session not found");
  const row = await prisma.cardio.update({
    where: { id },
    data: {
      type: input.type,
      minutes: input.minutes,
      distanceKm: input.distanceKm,
      pace: input.pace,
      kcal: input.kcal,
      notes: input.notes,
    },
    select: SELECT,
  });
  return toCardioDTO(row);
}

export async function deleteCardio(userId: string, id: string): Promise<void> {
  await prisma.cardio.deleteMany({ where: { id, userId } });
}
