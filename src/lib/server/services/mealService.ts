import "server-only";
import type { MealDTO } from "@/lib/domain";
import type { MealCreateInput, MealUpdateInput } from "@/lib/validation/schemas";
import { prisma } from "../db";
import { NotFoundError } from "../http";
import { toMealDTO } from "../mappers";
import { deletePhoto } from "./photoService";

const SELECT = {
  id: true,
  date: true,
  slot: true,
  name: true,
  kcal: true,
  protein: true,
  carbs: true,
  fat: true,
  photoUrl: true,
} as const;

export async function getMealsByDate(
  userId: string,
  date: string,
): Promise<MealDTO[]> {
  const rows = await prisma.meal.findMany({
    where: { userId, date },
    orderBy: { createdAt: "asc" },
    select: SELECT,
  });
  return rows.map(toMealDTO);
}

export async function getMealsBetween(
  userId: string,
  from: string,
  to: string,
): Promise<MealDTO[]> {
  const rows = await prisma.meal.findMany({
    where: { userId, date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
    select: SELECT,
  });
  return rows.map(toMealDTO);
}

export async function createMeal(
  userId: string,
  input: MealCreateInput,
): Promise<MealDTO> {
  const row = await prisma.meal.create({
    data: {
      userId,
      date: input.date,
      slot: input.slot,
      name: input.name,
      kcal: input.kcal,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
      photoUrl: input.photoUrl ?? null,
    },
    select: SELECT,
  });
  return toMealDTO(row);
}

export async function updateMeal(
  userId: string,
  id: string,
  input: MealUpdateInput,
): Promise<MealDTO> {
  const existing = await prisma.meal.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Meal not found");

  // If the photo is being replaced or cleared, remove the old file.
  if (input.photoUrl !== undefined && input.photoUrl !== existing.photoUrl) {
    await deletePhoto(existing.photoUrl);
  }

  const row = await prisma.meal.update({
    where: { id },
    data: {
      slot: input.slot,
      name: input.name,
      kcal: input.kcal,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
      photoUrl: input.photoUrl,
    },
    select: SELECT,
  });
  return toMealDTO(row);
}

export async function deleteMeal(userId: string, id: string): Promise<void> {
  const existing = await prisma.meal.findFirst({ where: { id, userId } });
  if (!existing) return;
  await deletePhoto(existing.photoUrl);
  await prisma.meal.delete({ where: { id } });
}
