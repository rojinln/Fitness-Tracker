/**
 * Rule-based workout-suggestion engine (pure). Given a small, pre-computed
 * snapshot of recent activity it returns friendly, non-medical tips. Kept
 * separate from data access so it is trivially unit-testable.
 */
import type { MuscleGroup, Suggestion } from "./types";

export interface SuggestionInput {
  /** Muscle groups trained yesterday (recovery reminder). */
  yesterdayGroups: MuscleGroup[];
  /** Muscle groups trained at any point this week. */
  weekGroups: MuscleGroup[];
  weekWorkoutDays: number;
  weeklyWorkoutGoal: number;
  weekCardioMinutes: number;
  weeklyCardioGoal: number;
  improvingExercise: string | null;
  activityToday: boolean;
}

/** Core groups we nudge the user not to neglect across a week. */
const CORE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders"];

export function buildSuggestions(input: SuggestionInput): Suggestion[] {
  const out: Suggestion[] = [];

  for (const group of unique(input.yesterdayGroups)) {
    out.push({
      tone: "rest",
      emoji: "😌",
      text: `You trained ${group} yesterday — give it ~48h to recover before hitting it hard again.`,
    });
  }

  if (input.weekWorkoutDays > 0) {
    const trained = new Set(input.weekGroups);
    const missed = CORE_GROUPS.filter((g) => !trained.has(g));
    if (missed.length > 0) {
      out.push({
        tone: "nudge",
        emoji: "🎯",
        text: `Haven't trained ${missed.join(", ")} yet this week.`,
      });
    }
  }

  if (input.weekWorkoutDays < input.weeklyWorkoutGoal) {
    const left = input.weeklyWorkoutGoal - input.weekWorkoutDays;
    out.push({
      tone: "info",
      emoji: "🏋️",
      text: `You're at ${input.weekWorkoutDays}/${input.weeklyWorkoutGoal} workouts this week. ${left} to go!`,
    });
  } else {
    out.push({
      tone: "win",
      emoji: "🎉",
      text: `Weekly workout goal smashed — ${input.weekWorkoutDays}/${input.weeklyWorkoutGoal} done!`,
    });
  }

  if (input.weekCardioMinutes < input.weeklyCardioGoal) {
    out.push({
      tone: "info",
      emoji: "🏃",
      text: `Cardio: ${Math.round(input.weekCardioMinutes)}/${input.weeklyCardioGoal} min this week.`,
    });
  }

  if (input.improvingExercise) {
    out.push({
      tone: "win",
      emoji: "📈",
      text: `Nice — your ${input.improvingExercise} is trending up. Progressive overload is working! 💪`,
    });
  }

  if (!input.activityToday) {
    out.push({
      tone: "nudge",
      emoji: "🌱",
      text: "Nothing logged today yet. Even a short session counts.",
    });
  }

  return out.slice(0, 4);
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
