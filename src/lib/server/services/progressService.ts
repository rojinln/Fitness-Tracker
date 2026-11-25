import "server-only";
import {
  latestWeight,
  strengthHistory,
  usedExercises,
  weightGoalProgress,
} from "@/lib/domain";
import type { ProgressResponse } from "@/lib/shared/contracts";
import { getSettings } from "./settingsService";
import { getWeights } from "./weightService";
import { getAllWorkouts } from "./workoutService";

export async function buildProgress(
  userId: string,
  exerciseId: string | null,
): Promise<ProgressResponse> {
  const settings = await getSettings(userId);
  const weights = await getWeights(userId);
  const workouts = await getAllWorkouts(userId);

  const used = usedExercises(workouts);
  const selected =
    exerciseId && used.some((u) => u.id === exerciseId)
      ? exerciseId
      : (used[0]?.id ?? null);
  const strength = selected ? strengthHistory(workouts, selected) : [];

  const current = latestWeight(weights);
  const goal = settings.weightGoal;
  const progress =
    goal.start != null && goal.target != null && current != null
      ? weightGoalProgress(goal.start, goal.target, current)
      : null;

  return {
    weights,
    weightGoal: {
      start: goal.start,
      target: goal.target,
      date: goal.date,
      current,
      progress,
    },
    usedExercises: used,
    selectedExerciseId: selected,
    strength,
  };
}
