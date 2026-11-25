import "server-only";
import { Prisma } from "@prisma/client";
import type {
  CardioDTO,
  ExerciseDTO,
  MealDTO,
  MealSlot,
  MuscleGroup,
  SettingsDTO,
  ThemeMode,
  Unit,
  WeightEntryDTO,
  WorkoutDTO,
} from "@/lib/domain";

/** Reusable include so the workout shape is defined once. */
export const workoutInclude = {
  entries: {
    orderBy: { position: "asc" },
    include: { sets: { orderBy: { position: "asc" } } },
  },
} satisfies Prisma.WorkoutInclude;

export type WorkoutRow = Prisma.WorkoutGetPayload<{ include: typeof workoutInclude }>;

export function toWorkoutDTO(w: WorkoutRow): WorkoutDTO {
  return {
    id: w.id,
    date: w.date,
    entries: w.entries.map((e) => ({
      id: e.id,
      exerciseId: e.exerciseId,
      exerciseName: e.exerciseName,
      muscleGroup: e.muscleGroup as MuscleGroup,
      notes: e.notes ?? null,
      sets: e.sets.map((s) => ({ reps: s.reps, weight: s.weight })),
    })),
  };
}

export function toCardioDTO(c: {
  id: string;
  date: string;
  type: string;
  minutes: number;
  distanceKm: number | null;
  pace: string | null;
  kcal: number | null;
  notes: string | null;
}): CardioDTO {
  return {
    id: c.id,
    date: c.date,
    type: c.type,
    minutes: c.minutes,
    distanceKm: c.distanceKm,
    pace: c.pace,
    kcal: c.kcal,
    notes: c.notes,
  };
}

export function toMealDTO(m: {
  id: string;
  date: string;
  slot: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  photoUrl: string | null;
}): MealDTO {
  return {
    id: m.id,
    date: m.date,
    slot: m.slot as MealSlot,
    name: m.name,
    kcal: m.kcal,
    protein: m.protein,
    carbs: m.carbs,
    fat: m.fat,
    photoUrl: m.photoUrl,
  };
}

export function toWeightDTO(w: {
  id: string;
  date: string;
  kg: number;
}): WeightEntryDTO {
  return { id: w.id, date: w.date, kg: w.kg };
}

export function toExerciseDTO(e: {
  id: string;
  name: string;
  muscleGroup: string;
}): ExerciseDTO {
  return {
    id: e.id,
    name: e.name,
    muscleGroup: e.muscleGroup as MuscleGroup,
    isCustom: true,
  };
}

export function toSettingsDTO(s: {
  unit: string;
  themePreset: string;
  themeMode: string;
  accent: string | null;
  accent2: string | null;
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  weeklyWorkoutGoal: number;
  weeklyCardioGoal: number;
  weightGoalStart: number | null;
  weightGoalTarget: number | null;
  weightGoalDate: string | null;
}): SettingsDTO {
  return {
    unit: s.unit as Unit,
    themePreset: s.themePreset,
    themeMode: s.themeMode as ThemeMode,
    accent: s.accent,
    accent2: s.accent2,
    targets: {
      kcal: s.targetKcal,
      protein: s.targetProtein,
      carbs: s.targetCarbs,
      fat: s.targetFat,
    },
    weeklyWorkoutGoal: s.weeklyWorkoutGoal,
    weeklyCardioGoal: s.weeklyCardioGoal,
    weightGoal: {
      start: s.weightGoalStart,
      target: s.weightGoalTarget,
      date: s.weightGoalDate,
    },
  };
}
