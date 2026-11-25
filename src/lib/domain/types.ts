/**
 * Framework-agnostic domain types shared by the server (services) and the
 * client (UI). These are the DTO shapes crossing the API boundary — they are
 * NOT the Prisma models. Services map Prisma rows -> these DTOs.
 *
 * This file (and the rest of src/lib/domain) imports nothing external: no React,
 * no Prisma, no zod. That keeps all business logic in one pure, testable place.
 */

export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Glutes",
  "Core",
  "Calves",
  "Forearms",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export type Unit = "kg" | "lb";
export type ThemeMode = "light" | "dark";

export interface WorkoutSetDTO {
  reps: number;
  weight: number;
}

export interface WorkoutEntryDTO {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  notes: string | null;
  sets: WorkoutSetDTO[];
}

export interface WorkoutDTO {
  id: string;
  date: string; // YYYY-MM-DD
  entries: WorkoutEntryDTO[];
}

export interface CardioDTO {
  id: string;
  date: string;
  type: string;
  minutes: number;
  distanceKm: number | null;
  pace: string | null;
  kcal: number | null;
  notes: string | null;
}

export interface MealDTO {
  id: string;
  date: string;
  slot: MealSlot;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  photoUrl: string | null;
}

export interface WeightEntryDTO {
  id: string;
  date: string;
  kg: number;
}

export interface ExerciseDTO {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  isCustom: boolean;
}

export interface MacroTargets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WeightGoal {
  start: number | null;
  target: number | null;
  date: string | null;
}

export interface SettingsDTO {
  unit: Unit;
  themePreset: string;
  themeMode: ThemeMode;
  accent: string | null;
  accent2: string | null;
  targets: MacroTargets;
  weeklyWorkoutGoal: number;
  weeklyCardioGoal: number;
  weightGoal: WeightGoal;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
}

/** A single value in a muscle-group distribution chart. */
export interface MuscleCount {
  group: MuscleGroup;
  sets: number;
}

/** One point of an exercise's strength history, oldest first. */
export interface StrengthPoint {
  date: string;
  topSet: number;
  volume: number;
}

export type SuggestionTone = "info" | "win" | "rest" | "nudge";

export interface Suggestion {
  emoji: string;
  text: string;
  tone: SuggestionTone;
}
