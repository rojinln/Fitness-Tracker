import "server-only";
import {
  addDays,
  buildSuggestions,
  cardioMinutes,
  consistencyPct,
  dayStats,
  firstImprovingExercise,
  isSameMonth,
  monthDates,
  monthLabel,
  monthLeadingBlanks,
  muscleDistribution,
  trainedGroups,
  weekDates,
  workoutDayCount,
  workoutVolume,
} from "@/lib/domain";
import type { CardioDTO, MealDTO, WorkoutDTO } from "@/lib/domain";
import type {
  DashboardResponse,
  DashboardView,
  MonthSummary,
  WeekSummary,
} from "@/lib/shared/contracts";
import { getCardioByDate, getCardioBetween } from "./cardioService";
import { getMealsByDate, getMealsBetween } from "./mealService";
import { getSettings } from "./settingsService";
import { getWeights, getWeightsBetween } from "./weightService";
import { getAllWorkouts } from "./workoutService";

export async function buildDashboard(
  userId: string,
  date: string,
  view: DashboardView,
): Promise<DashboardResponse> {
  const settings = await getSettings(userId);
  const allWorkouts = await getAllWorkouts(userId);
  const workoutOn = (d: string): WorkoutDTO | null =>
    allWorkouts.find((w) => w.date === d) ?? null;

  const week = weekDates(date);
  const weekSet = new Set(week);
  const weekWorkouts = allWorkouts.filter((w) => weekSet.has(w.date));
  const weekCardio = await getCardioBetween(userId, week[0], week[6]);

  const todayWorkout = workoutOn(date);
  const todayCardio = await getCardioByDate(userId, date);

  const yesterdayWorkout = workoutOn(addDays(date, -1));
  const suggestions = buildSuggestions({
    yesterdayGroups: yesterdayWorkout ? trainedGroups([yesterdayWorkout]) : [],
    weekGroups: trainedGroups(weekWorkouts),
    weekWorkoutDays: workoutDayCount(weekWorkouts),
    weeklyWorkoutGoal: settings.weeklyWorkoutGoal,
    weekCardioMinutes: cardioMinutes(weekCardio),
    weeklyCardioGoal: settings.weeklyCardioGoal,
    improvingExercise: firstImprovingExercise(allWorkouts),
    activityToday:
      (todayWorkout?.entries.length ?? 0) > 0 || todayCardio.length > 0,
  });

  const response: DashboardResponse = { view, suggestions };

  if (view === "day") {
    const meals = await getMealsByDate(userId, date);
    const weights = await getWeights(userId);
    response.day = {
      stats: dayStats(todayWorkout, todayCardio, meals, settings.targets),
      workout: todayWorkout,
      cardio: todayCardio,
      meals,
      weight: weights.find((w) => w.date === date)?.kg ?? null,
    };
  } else if (view === "week") {
    const weekMeals = await getMealsBetween(userId, week[0], week[6]);
    response.week = buildWeek(
      week,
      weekWorkouts,
      weekCardio,
      weekMeals,
      settings.weeklyWorkoutGoal,
      settings.weeklyCardioGoal,
    );
  } else {
    const days = monthDates(date);
    const first = days[0];
    const last = days[days.length - 1];
    const monthWorkouts = allWorkouts.filter((w) => isSameMonth(w.date, date));
    const monthCardio = await getCardioBetween(userId, first, last);
    const weightSeries = (await getWeightsBetween(userId, first, last)).map((w) => ({
      date: w.date,
      kg: w.kg,
    }));
    response.month = buildMonth(date, days, monthWorkouts, monthCardio, weightSeries);
  }

  return response;
}

function buildWeek(
  week: string[],
  workouts: WorkoutDTO[],
  cardio: CardioDTO[],
  meals: MealDTO[],
  workoutGoal: number,
  cardioGoal: number,
): WeekSummary {
  const cardioDates = new Set(cardio.map((c) => c.date));
  const workoutDates = new Set(
    workouts.filter((w) => w.entries.length > 0).map((w) => w.date),
  );
  const activity = week.map((d) => ({
    date: d,
    active: workoutDates.has(d) || cardioDates.has(d),
  }));

  const kcalByDate = new Map<string, number>();
  for (const m of meals) {
    kcalByDate.set(m.date, (kcalByDate.get(m.date) ?? 0) + m.kcal);
  }
  const kcals = [...kcalByDate.values()].filter((v) => v > 0);
  const avgKcal =
    kcals.length > 0
      ? Math.round(kcals.reduce((a, b) => a + b, 0) / kcals.length)
      : null;

  const workoutDays = workoutDayCount(workouts);
  const cardioMin = Math.round(cardioMinutes(cardio));

  return {
    weekStart: week[0],
    workoutDays,
    cardioMinutes: cardioMin,
    totalVolume: Math.round(workouts.reduce((t, w) => t + workoutVolume(w), 0)),
    avgKcal,
    muscleDistribution: muscleDistribution(workouts),
    activity,
    goals: {
      workouts: { value: workoutDays, goal: workoutGoal },
      cardio: { value: cardioMin, goal: cardioGoal },
    },
  };
}

function buildMonth(
  date: string,
  days: string[],
  workouts: WorkoutDTO[],
  cardio: CardioDTO[],
  weightSeries: { date: string; kg: number }[],
): MonthSummary {
  const cardioDates = new Set(cardio.map((c) => c.date));
  const workoutDates = new Set(
    workouts.filter((w) => w.entries.length > 0).map((w) => w.date),
  );
  const activeDates = new Set<string>([...workoutDates, ...cardioDates]);

  return {
    label: monthLabel(date),
    leadingBlanks: monthLeadingBlanks(date),
    calendar: days.map((d) => ({ date: d, active: activeDates.has(d) })),
    consistencyPct: consistencyPct(activeDates.size, days.length),
    activeDays: activeDates.size,
    totalDays: days.length,
    workoutDays: workoutDayCount(workouts),
    muscleDistribution: muscleDistribution(workouts),
    weightSeries,
  };
}
