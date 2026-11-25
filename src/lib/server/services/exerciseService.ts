import "server-only";
import { mergeExercises } from "@/lib/domain";
import type { ExerciseDTO } from "@/lib/domain";
import type { ExerciseCreateInput } from "@/lib/validation/schemas";
import { prisma } from "../db";
import { toExerciseDTO } from "../mappers";

/** Built-in catalog merged with the user's custom exercises. */
export async function listExercises(userId: string): Promise<ExerciseDTO[]> {
  const custom = await prisma.exercise.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
  return mergeExercises(custom.map(toExerciseDTO));
}

export async function listCustomExercises(userId: string): Promise<ExerciseDTO[]> {
  const custom = await prisma.exercise.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
  return custom.map(toExerciseDTO);
}

export async function createExercise(
  userId: string,
  input: ExerciseCreateInput,
): Promise<ExerciseDTO> {
  const row = await prisma.exercise.create({
    data: { userId, name: input.name, muscleGroup: input.muscleGroup },
  });
  return toExerciseDTO(row);
}

/** Ownership-scoped delete (no-op if not found / not owned). */
export async function deleteExercise(userId: string, id: string): Promise<void> {
  await prisma.exercise.deleteMany({ where: { id, userId } });
}
