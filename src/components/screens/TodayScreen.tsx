"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers";
import { BarDistribution, LineChart } from "@/components/charts";
import { GoalBar } from "@/components/GoalBar";
import { MacroBars } from "@/components/MacroBars";
import { Card, EmptyState, SectionTitle, Segmented, Spinner, Stat } from "@/components/ui";
import { useApi } from "@/lib/client/useApi";
import {
  GROUP_EMOJI,
  WEEKDAYS_SHORT,
  type WorkoutEntryDTO,
  todayStr,
} from "@/lib/domain";
import type { DashboardResponse, DashboardView } from "@/lib/shared/contracts";

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function setSummary(entry: WorkoutEntryDTO): string {
  return entry.sets.map((s) => `${s.reps}×${s.weight}`).join(", ");
}

export function TodayScreen() {
  const { settings, user } = useApp();
  const today = todayStr();
  const [view, setView] = useState<DashboardView>("day");
  const { data, loading } = useApi<DashboardResponse>(
    `/api/dashboard?date=${today}&view=${view}`,
  );
  const unit = settings.unit;
  const firstName = user.name ? `, ${user.name.split(" ")[0]}` : "";

  const prettyToday = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {greeting()}
          {firstName} 🌸
        </h1>
        <p className="mt-0.5 text-[13px]" style={{ color: "var(--muted)" }}>
          {prettyToday}
        </p>
      </header>

      <Segmented<DashboardView>
        value={view}
        onChange={setView}
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
      />

      {data && data.suggestions.length > 0 && (
        <Card className="!bg-[linear-gradient(135deg,var(--accent-soft),transparent)]">
          <SectionTitle>✨ For you today</SectionTitle>
          {data.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5">
              <span>{s.emoji}</span>
              <div className="flex-1 text-[13.5px] leading-snug">{s.text}</div>
            </div>
          ))}
        </Card>
      )}

      {loading && !data ? (
        <Spinner />
      ) : !data ? (
        <EmptyState emoji="😕" text="Couldn't load your dashboard" />
      ) : data.view === "day" && data.day ? (
        <DayView data={data} unit={unit} />
      ) : data.view === "week" && data.week ? (
        <WeekView data={data} unit={unit} />
      ) : data.view === "month" && data.month ? (
        <MonthView data={data} today={today} />
      ) : (
        <Spinner />
      )}
    </div>
  );
}

function DayView({ data, unit }: { data: DashboardResponse; unit: string }) {
  const day = data.day!;
  return (
    <>
      <div className="mb-3.5 grid grid-cols-2 gap-2.5">
        <Stat value={day.stats.exerciseCount} label="Exercises" />
        <Stat value={day.stats.setCount} label="Sets" />
        <Stat value={Math.round(day.stats.cardioMinutes)} label="Cardio min" />
        <Stat value={Math.round(day.stats.macros.kcal)} label="Calories" />
      </div>

      <Card>
        <div className="mb-2.5 flex items-center justify-between">
          <SectionTitle>💪 Workout</SectionTitle>
          <Link href="/train" className="text-sm font-bold" style={{ color: "var(--accent)" }}>
            Log +
          </Link>
        </div>
        {day.workout && day.workout.entries.length > 0 ? (
          day.workout.entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 border-b py-2.5 last:border-0"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ background: "var(--accent-soft)" }}
              >
                {GROUP_EMOJI[e.muscleGroup] ?? "💪"}
              </div>
              <div className="min-w-0 flex-1">
                <b>{e.exerciseName}</b>
                <div className="truncate text-xs" style={{ color: "var(--muted)" }}>
                  {setSummary(e) || "no sets"} {unit}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState emoji="🏋️" text="No exercises logged today" />
        )}
      </Card>

      {day.cardio.length > 0 && (
        <Card>
          <SectionTitle>🏃 Cardio</SectionTitle>
          {day.cardio.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-1.5 text-sm">
              <b>{c.type}</b>
              <span style={{ color: "var(--muted)" }}>
                {c.minutes} min{c.distanceKm ? ` · ${c.distanceKm} km` : ""}
              </span>
            </div>
          ))}
        </Card>
      )}

      <Card>
        <div className="mb-2.5 flex items-center justify-between">
          <SectionTitle>🍓 Nutrition</SectionTitle>
          <Link href="/meals" className="text-sm font-bold" style={{ color: "var(--accent)" }}>
            Log +
          </Link>
        </div>
        <MacroBars macros={day.stats.macros} targets={day.stats.targets} />
      </Card>

      {day.weight != null && (
        <Card className="flex items-center justify-between">
          <b>⚖️ Weight</b>
          <span className="text-xl font-extrabold">
            {day.weight} {unit}
          </span>
        </Card>
      )}
    </>
  );
}

function WeekView({ data, unit }: { data: DashboardResponse; unit: string }) {
  const week = data.week!;
  return (
    <>
      <div className="mb-3.5 grid grid-cols-2 gap-2.5">
        <Stat value={week.workoutDays} label="Workouts" />
        <Stat value={week.cardioMinutes} label="Cardio min" />
        <Stat value={week.totalVolume.toLocaleString()} label={`Volume ${unit}`} />
        <Stat value={week.avgKcal ?? "–"} label="Avg kcal/day" />
      </div>

      <Card>
        <SectionTitle>🎯 Weekly goals</SectionTitle>
        <GoalBar label="Workouts" value={week.goals.workouts.value} goal={week.goals.workouts.goal} />
        <GoalBar label="Cardio (min)" value={week.goals.cardio.value} goal={week.goals.cardio.goal} />
      </Card>

      <Card>
        <SectionTitle>Muscle groups trained</SectionTitle>
        <BarDistribution
          rows={week.muscleDistribution.map((d) => ({
            label: d.group,
            value: d.sets,
            emoji: GROUP_EMOJI[d.group],
          }))}
        />
      </Card>

      <Card>
        <SectionTitle>This week</SectionTitle>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS_SHORT.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold" style={{ color: "var(--muted)" }}>
              {d}
            </div>
          ))}
          {week.activity.map((a) => (
            <div
              key={a.date}
              className="flex aspect-square items-center justify-center rounded-lg text-xs font-bold"
              style={
                a.active
                  ? { background: "linear-gradient(135deg,var(--accent),var(--accent2))", color: "var(--on-accent)" }
                  : { background: "var(--surface2)", color: "var(--muted)" }
              }
            >
              {Number(a.date.slice(-2))}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function MonthView({ data, today }: { data: DashboardResponse; today: string }) {
  const month = data.month!;
  return (
    <>
      <Card>
        <div className="mb-2.5 flex items-center justify-between">
          <SectionTitle>{month.label}</SectionTitle>
          <span className="chip">{month.workoutDays} workout days</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS_SHORT.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold" style={{ color: "var(--muted)" }}>
              {d}
            </div>
          ))}
          {Array.from({ length: month.leadingBlanks }).map((_, i) => (
            <div key={`b${i}`} />
          ))}
          {month.calendar.map((c) => (
            <div
              key={c.date}
              className="flex aspect-square items-center justify-center rounded-lg text-xs font-bold"
              style={{
                ...(c.active
                  ? { background: "linear-gradient(135deg,var(--accent),var(--accent2))", color: "var(--on-accent)" }
                  : { background: "var(--surface2)", color: "var(--muted)" }),
                ...(c.date === today ? { outline: "2px solid var(--accent)", outlineOffset: "-2px" } : {}),
              }}
            >
              {Number(c.date.slice(-2))}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>⚖️ Weight trend</SectionTitle>
        <LineChart points={month.weightSeries.map((w) => ({ y: w.kg }))} />
      </Card>

      <Card>
        <SectionTitle>Muscle focus this month</SectionTitle>
        <BarDistribution
          rows={month.muscleDistribution.slice(0, 6).map((d) => ({
            label: d.group,
            value: d.sets,
            emoji: GROUP_EMOJI[d.group],
          }))}
        />
      </Card>

      <Card className="text-center">
        <div className="text-[11px] font-bold" style={{ color: "var(--muted)" }}>
          CONSISTENCY
        </div>
        <div className="text-3xl font-extrabold">{month.consistencyPct}%</div>
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          {month.activeDays} of {month.totalDays} days active
        </div>
      </Card>
    </>
  );
}
