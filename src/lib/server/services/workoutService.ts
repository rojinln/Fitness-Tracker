import "server-only";
import type { WorkoutDTO } from "@/lib/domain";
import type {
  WorkoutEntryCreateInput,
  WorkoutEntryUpdateInput,
} from "@/lib/validation/schemas";
import { prisma } from "../db";
import { NotFoundError } from "../http";
import { toWorkoutDTO, workoutInclude } from "../mappers";

export async function getWorkoutByDate(
  userId: string,
  date: string,
): Promise<WorkoutDTO | null> {
  const workout = await prisma.workout.findUnique({
    where: { userId_date: { userId, date } },
    include: workoutInclude,
  });
  return workout ? toWorkoutDTO(workout) : null;
}

export async function getWorkoutsBetween(
  userId: string,
  from: string,
  to: string,
): Promise<WorkoutDTO[]> {
  const rows = await prisma.workout.findMany({
    where: { userId, date: { gte: from, lte: to } },
    include: workoutInclude,
    orderBy: { date: "asc" },
  });
  return rows.map(toWorkoutDTO);
}

export async function getAllWorkouts(userId: string): Promise<WorkoutDTO[]> {
  const rows = await prisma.workout.findMany({
    where: { userId },
    include: workoutInclude,
    orderBy: { date: "asc" },
  });
  return rows.map(toWorkoutDTO);
}

/** Append an exercise entry to a day, creating that day's workout if needed. */
export async function addEntry(
  userId: string,
  input: WorkoutEntryCreateInput,
): Promise<WorkoutDTO> {
  const workout = await prisma.workout.upsert({
    where: { userId_date: { userId, date: input.date } },
    create: { userId, date: input.date },
    update: {},
  });
  const position = await prisma.workoutEntry.count({
    where: { workoutId: workout.id },
  });
  await prisma.workoutEntry.create({
    data: {
      workoutId: workout.id,
      exerciseId: input.exerciseId,
      exerciseName: input.exerciseName,
      muscleGroup: input.muscleGroup,
      notes: input.notes ?? null,
      position,
      sets: {
        create: input.sets.map((s, i) => ({
          position: i,
          reps: s.reps,
          weight: s.weight,
        })),
      },
    },
  });
  const result = await getWorkoutByDate(userId, input.date);
  if (!result) throw new NotFoundError("Workout not found after create");
  return result;
}

export async function updateEntry(
  userId: string,
  entryId: string,
  input: WorkoutEntryUpdateInput,
): Promise<WorkoutDTO> {
  const entry = await prisma.workoutEntry.findUnique({
    where: { id: entryId },
    include: { workout: true },
  });
  if (!entry || entry.workout.userId !== userId) {
    throw new NotFoundError("Workout entry not found");
  }
  await prisma.$transaction([
    prisma.workoutSet.deleteMany({ where: { entryId } }),
    prisma.workoutEntry.update({
      where: { id: entryId },
      data: {
        notes: input.notes ?? null,
        sets: {
          create: input.sets.map((s, i) => ({
            position: i,
            reps: s.reps,
            weight: s.weight,
          })),
        },
      },
    }),
  ]);
  const result = await getWorkoutByDate(userId, entry.workout.date);
  if (!result) throw new NotFoundError("Workout not found after update");
  return result;
}

export async function deleteEntry(userId: string, entryId: string): Promise<void> {
  const entry = await prisma.workoutEntry.findUnique({
    where: { id: entryId },
    include: { workout: true },
  });
  if (!entry || entry.workout.userId !== userId) {
    throw new NotFoundError("Workout entry not found");
  }
  await prisma.workoutEntry.delete({ where: { id: entryId } });
  const remaining = await prisma.workoutEntry.count({
    where: { workoutId: entry.workoutId },
  });
  if (remaining === 0) {
    await prisma.workout.delete({ where: { id: entry.workoutId } });
  }
}
