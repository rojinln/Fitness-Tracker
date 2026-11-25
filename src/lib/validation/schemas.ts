/**
 * Zod schemas — the single source of truth for input shapes. Used by API route
 * handlers to validate requests and by client forms to parse/guard, so client
 * and server never drift.
 */
import { z } from "zod";
import { MEAL_SLOTS, MUSCLE_GROUPS, type MealSlot, type MuscleGroup } from "@/lib/domain";

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date");

// Spread + cast to a mutable tuple so z.enum infers the literal union
// regardless of the source arrays being `readonly` (`as const`).
const muscleGroup = z.enum([...MUSCLE_GROUPS] as [MuscleGroup, ...MuscleGroup[]]);
const mealSlot = z.enum([...MEAL_SLOTS] as [MealSlot, ...MealSlot[]]);

/* ---------- auth ---------- */
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Use at least 8 characters").max(200),
  name: z.string().trim().max(80).optional().default(""),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

/* ---------- workouts ---------- */
export const workoutSetSchema = z.object({
  reps: z.coerce.number().int().min(0).max(10_000),
  weight: z.coerce.number().min(0).max(100_000),
});

export const workoutEntryCreateSchema = z.object({
  date: dateStr,
  exerciseId: z.string().min(1),
  exerciseName: z.string().trim().min(1).max(80),
  muscleGroup,
  notes: z.string().trim().max(500).nullish(),
  sets: z.array(workoutSetSchema).min(1, "Add at least one set"),
});
export type WorkoutEntryCreateInput = z.infer<typeof workoutEntryCreateSchema>;

export const workoutEntryUpdateSchema = z.object({
  notes: z.string().trim().max(500).nullish(),
  sets: z.array(workoutSetSchema).min(1, "Add at least one set"),
});
export type WorkoutEntryUpdateInput = z.infer<typeof workoutEntryUpdateSchema>;

/* ---------- cardio ---------- */
const cardioFields = {
  date: dateStr,
  type: z.string().trim().min(1).max(40),
  minutes: z.coerce.number().int().min(1).max(100_000),
  distanceKm: z.coerce.number().min(0).max(100_000).nullish(),
  pace: z.string().trim().max(40).nullish(),
  kcal: z.coerce.number().int().min(0).max(100_000).nullish(),
  notes: z.string().trim().max(500).nullish(),
};
export const cardioCreateSchema = z.object(cardioFields);
export const cardioUpdateSchema = z.object(cardioFields).partial();
export type CardioCreateInput = z.infer<typeof cardioCreateSchema>;

/* ---------- meals ---------- */
export const mealCreateSchema = z.object({
  date: dateStr,
  slot: mealSlot,
  name: z.string().trim().min(1).max(120),
  kcal: z.coerce.number().int().min(0).max(100_000).default(0),
  protein: z.coerce.number().int().min(0).max(100_000).default(0),
  carbs: z.coerce.number().int().min(0).max(100_000).default(0),
  fat: z.coerce.number().int().min(0).max(100_000).default(0),
  photoUrl: z.string().max(400).nullish(),
});
export type MealCreateInput = z.infer<typeof mealCreateSchema>;

export const mealUpdateSchema = mealCreateSchema.partial().omit({ date: true });
export type MealUpdateInput = z.infer<typeof mealUpdateSchema>;

/* ---------- weight ---------- */
export const weightUpsertSchema = z.object({
  date: dateStr,
  kg: z.coerce.number().min(1).max(1000),
});
export type WeightUpsertInput = z.infer<typeof weightUpsertSchema>;

/* ---------- exercises ---------- */
export const exerciseCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  muscleGroup,
});
export type ExerciseCreateInput = z.infer<typeof exerciseCreateSchema>;

/* ---------- settings ---------- */
export const settingsUpdateSchema = z
  .object({
    unit: z.enum(["kg", "lb"]),
    themePreset: z.string().max(40),
    themeMode: z.enum(["light", "dark"]),
    accent: z.string().max(20).nullish(),
    accent2: z.string().max(20).nullish(),
    targetKcal: z.coerce.number().int().min(0).max(100_000),
    targetProtein: z.coerce.number().int().min(0).max(100_000),
    targetCarbs: z.coerce.number().int().min(0).max(100_000),
    targetFat: z.coerce.number().int().min(0).max(100_000),
    weeklyWorkoutGoal: z.coerce.number().int().min(0).max(100),
    weeklyCardioGoal: z.coerce.number().int().min(0).max(100_000),
    weightGoalStart: z.coerce.number().min(0).max(1000).nullish(),
    weightGoalTarget: z.coerce.number().min(0).max(1000).nullish(),
    weightGoalDate: dateStr.nullish(),
  })
  .partial();
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;

/* ---------- uploads ---------- */
export const uploadSchema = z.object({
  dataUrl: z
    .string()
    .regex(/^data:image\/(png|jpe?g|webp);base64,/, "Expected a base64 image data URL")
    .max(8_000_000),
});
export type UploadInput = z.infer<typeof uploadSchema>;
