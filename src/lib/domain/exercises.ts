import type { ExerciseDTO, MuscleGroup } from "./types";

/** Emoji per muscle group (+ Cardio), used across the UI. */
export const GROUP_EMOJI: Record<string, string> = {
  Chest: "🫀",
  Back: "🔙",
  Shoulders: "🤸",
  Biceps: "💪",
  Triceps: "💪",
  Legs: "🦵",
  Glutes: "🍑",
  Core: "🧘",
  Calves: "🦿",
  Forearms: "✊",
  Cardio: "🏃",
};

export const CARDIO_TYPES = [
  "Running",
  "Walking",
  "Cycling",
  "Stairmaster",
  "Rowing",
  "Elliptical",
  "Swimming",
  "HIIT",
  "Other",
] as const;

export const MEAL_SLOT_META: { slot: string; label: string; emoji: string }[] = [
  { slot: "breakfast", label: "Breakfast", emoji: "🌅" },
  { slot: "lunch", label: "Lunch", emoji: "☀️" },
  { slot: "dinner", label: "Dinner", emoji: "🌙" },
  { slot: "snack", label: "Snacks", emoji: "🍪" },
];

/**
 * Built-in exercise catalog. These are constants (not DB rows) with stable,
 * human-readable ids so workout history and strength progression stay linked
 * even across installs. Custom exercises (created by users) come from the DB
 * and are merged with these at read time.
 */
const RAW: [string, MuscleGroup][] = [
  ["Bench Press", "Chest"],
  ["Incline Dumbbell Press", "Chest"],
  ["Push-Up", "Chest"],
  ["Chest Fly", "Chest"],
  ["Cable Crossover", "Chest"],
  ["Pull-Up", "Back"],
  ["Lat Pulldown", "Back"],
  ["Barbell Row", "Back"],
  ["Seated Cable Row", "Back"],
  ["Deadlift", "Back"],
  ["Overhead Press", "Shoulders"],
  ["Lateral Raise", "Shoulders"],
  ["Front Raise", "Shoulders"],
  ["Rear Delt Fly", "Shoulders"],
  ["Arnold Press", "Shoulders"],
  ["Barbell Curl", "Biceps"],
  ["Hammer Curl", "Biceps"],
  ["Dumbbell Curl", "Biceps"],
  ["Preacher Curl", "Biceps"],
  ["Concentration Curl", "Biceps"],
  ["Tricep Pushdown", "Triceps"],
  ["Overhead Tricep Extension", "Triceps"],
  ["Skull Crusher", "Triceps"],
  ["Dips", "Triceps"],
  ["Close-Grip Bench", "Triceps"],
  ["Squat", "Legs"],
  ["Leg Press", "Legs"],
  ["Lunge", "Legs"],
  ["Leg Extension", "Legs"],
  ["Leg Curl", "Legs"],
  ["Romanian Deadlift", "Legs"],
  ["Hip Thrust", "Glutes"],
  ["Glute Bridge", "Glutes"],
  ["Bulgarian Split Squat", "Glutes"],
  ["Plank", "Core"],
  ["Crunch", "Core"],
  ["Hanging Leg Raise", "Core"],
  ["Russian Twist", "Core"],
  ["Cable Crunch", "Core"],
  ["Standing Calf Raise", "Calves"],
  ["Seated Calf Raise", "Calves"],
  ["Wrist Curl", "Forearms"],
  ["Farmer's Carry", "Forearms"],
];

export function slugifyExercise(name: string): string {
  return (
    "builtin-" +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

export const BUILTIN_EXERCISES: ExerciseDTO[] = RAW.map(([name, muscleGroup]) => ({
  id: slugifyExercise(name),
  name,
  muscleGroup,
  isCustom: false,
}));

/** Merge built-ins with a user's custom exercises for the picker. */
export function mergeExercises(custom: ExerciseDTO[]): ExerciseDTO[] {
  return [...BUILTIN_EXERCISES, ...custom].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}
