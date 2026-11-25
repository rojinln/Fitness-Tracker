/**
 * API response contracts shared by the server (return types) and the client
 * (fetch types). Pure types — safe to import from either side, so the two never
 * disagree about a payload shape.
 */
import type {
  CardioDTO,
  MealDTO,
  MuscleCount,
  StrengthPoint,
  Suggestion,
  WeightEntryDTO,
  WorkoutDTO,
} from "@/lib/domain";
import type { DayStats, GoalProgress } from "@/lib/domain/stats";

export type DashboardView = "day" | "week" | "month";

export interface DaySummary {
  stats: DayStats;
  workout: WorkoutDTO | null;
  cardio: CardioDTO[];
  meals: MealDTO[];
  weight: number | null;
}

export interface WeekSummary {
  weekStart: string;
  workoutDays: number;
  cardioMinutes: number;
  totalVolume: number;
  avgKcal: number | null;
  muscleDistribution: MuscleCount[];
  activity: { date: string; active: boolean }[];
  goals: {
    workouts: { value: number; goal: number };
    cardio: { value: number; goal: number };
  };
}

export interface MonthSummary {
  label: string;
  leadingBlanks: number;
  calendar: { date: string; active: boolean }[];
  consistencyPct: number;
  activeDays: number;
  totalDays: number;
  workoutDays: number;
  muscleDistribution: MuscleCount[];
  weightSeries: { date: string; kg: number }[];
}

export interface DashboardResponse {
  view: DashboardView;
  suggestions: Suggestion[];
  day?: DaySummary;
  week?: WeekSummary;
  month?: MonthSummary;
}

export interface ProgressResponse {
  weights: WeightEntryDTO[];
  weightGoal: {
    start: number | null;
    target: number | null;
    date: string | null;
    current: number | null;
    progress: GoalProgress | null;
  };
  usedExercises: { id: string; name: string }[];
  selectedExerciseId: string | null;
  strength: StrengthPoint[];
}
