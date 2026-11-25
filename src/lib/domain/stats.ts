/**
 * Pure statistics over domain DTOs. Every aggregate the app shows — volume,
 * muscle distribution, weekly/monthly summaries, macro totals, strength
 * history, goal progress — is computed here and nowhere else. The server calls
 * these in the dashboard service; the client renders the results. No duplicated
 * math across the stack.
 */
import type {
  CardioDTO,
  MacroTargets,
  MacroTotals,
  MealDTO,
  MuscleCount,
  MuscleGroup,
  StrengthPoint,
  WeightEntryDTO,
  WorkoutDTO,
  WorkoutEntryDTO,
  WorkoutSetDTO,
} from "./types";
import { MUSCLE_GROUPS } from "./types";

export function setVolume(set: WorkoutSetDTO): number {
  return set.reps * set.weight;
}

export function entryTopSet(entry: WorkoutEntryDTO): number {
  return entry.sets.reduce((max, s) => Math.max(max, s.weight), 0);
}

export function entryVolume(entry: WorkoutEntryDTO): number {
  return entry.sets.reduce((total, s) => total + setVolume(s), 0);
}

export function entrySetCount(entry: WorkoutEntryDTO): number {
  return entry.sets.length;
}

export function workoutVolume(workout: WorkoutDTO): number {
  return workout.entries.reduce((total, e) => total + entryVolume(e), 0);
}

export function workoutSetCount(workout: WorkoutDTO): number {
  return workout.entries.reduce((total, e) => total + e.sets.length, 0);
}

/** Sets performed per muscle group across the given workouts, highest first. */
export function muscleDistribution(workouts: WorkoutDTO[]): MuscleCount[] {
  const counts = new Map<MuscleGroup, number>();
  for (const w of workouts) {
    for (const e of w.entries) {
      counts.set(e.muscleGroup, (counts.get(e.muscleGroup) ?? 0) + e.sets.length);
    }
  }
  return MUSCLE_GROUPS.map((group) => ({ group, sets: counts.get(group) ?? 0 }))
    .filter((c) => c.sets > 0)
    .sort((a, b) => b.sets - a.sets);
}

export function trainedGroups(workouts: WorkoutDTO[]): MuscleGroup[] {
  return muscleDistribution(workouts).map((c) => c.group);
}

export function macroTotals(meals: MealDTO[]): MacroTotals {
  return meals.reduce<MacroTotals>(
    (t, m) => ({
      kcal: t.kcal + m.kcal,
      protein: t.protein + m.protein,
      carbs: t.carbs + m.carbs,
      fat: t.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function cardioMinutes(cardio: CardioDTO[]): number {
  return cardio.reduce((t, c) => t + c.minutes, 0);
}

/** Count of distinct dates that have at least one logged exercise. */
export function workoutDayCount(workouts: WorkoutDTO[]): number {
  return workouts.filter((w) => w.entries.length > 0).length;
}

export interface DayStats {
  exerciseCount: number;
  setCount: number;
  volume: number;
  cardioMinutes: number;
  macros: MacroTotals;
  targets: MacroTargets;
}

export function dayStats(
  workout: WorkoutDTO | null,
  cardio: CardioDTO[],
  meals: MealDTO[],
  targets: MacroTargets,
): DayStats {
  return {
    exerciseCount: workout ? workout.entries.length : 0,
    setCount: workout ? workoutSetCount(workout) : 0,
    volume: workout ? workoutVolume(workout) : 0,
    cardioMinutes: cardioMinutes(cardio),
    macros: macroTotals(meals),
    targets,
  };
}

/** Oldest-first strength history for one exercise across all workouts. */
export function strengthHistory(
  workouts: WorkoutDTO[],
  exerciseId: string,
): StrengthPoint[] {
  const points: StrengthPoint[] = [];
  for (const w of workouts) {
    for (const e of w.entries) {
      if (e.exerciseId !== exerciseId) continue;
      points.push({ date: w.date, topSet: entryTopSet(e), volume: entryVolume(e) });
    }
  }
  return points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** Distinct exercises that appear in any workout (for the progression picker). */
export function usedExercises(
  workouts: WorkoutDTO[],
): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const w of workouts) {
    for (const e of w.entries) {
      if (!seen.has(e.exerciseId)) seen.set(e.exerciseId, e.exerciseName);
    }
  }
  return [...seen.entries()].map(([id, name]) => ({ id, name }));
}

/**
 * First exercise whose most recent top set beat the one before it — used to
 * surface "your X is trending up" encouragement.
 */
export function firstImprovingExercise(workouts: WorkoutDTO[]): string | null {
  for (const { id, name } of usedExercises(workouts)) {
    const hist = strengthHistory(workouts, id);
    if (hist.length < 2) continue;
    const prev = hist[hist.length - 2].topSet;
    const last = hist[hist.length - 1].topSet;
    if (last > prev && last > 0) return name;
  }
  return null;
}

export interface GoalProgress {
  pct: number;
  met: boolean;
  remaining: number;
}

export function weightGoalProgress(
  start: number,
  target: number,
  current: number,
): GoalProgress {
  const total = start - target;
  const done = start - current;
  const pct = total !== 0 ? clampPct((done / total) * 100) : 0;
  const met = target > start ? current >= target : current <= target;
  return { pct, met, remaining: Math.abs(current - target) };
}

export function consistencyPct(activeDays: number, totalDays: number): number {
  if (totalDays <= 0) return 0;
  return Math.round((activeDays / totalDays) * 100);
}

export function clampPct(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function latestWeight(weights: WeightEntryDTO[]): number | null {
  if (weights.length === 0) return null;
  const sorted = [...weights].sort((a, b) => (a.date < b.date ? -1 : 1));
  return sorted[sorted.length - 1].kg;
}
