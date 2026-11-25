"use client";
import { useState } from "react";
import { useApp } from "@/components/providers";
import { LineChart } from "@/components/charts";
import { GoalBar } from "@/components/GoalBar";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { Button, Card, EmptyState, IconButton, Pill, SectionTitle, Spinner } from "@/components/ui";
import { ApiError, api } from "@/lib/client/api";
import { useApi } from "@/lib/client/useApi";
import { prettyDate, todayStr } from "@/lib/domain";
import type { DashboardResponse, ProgressResponse } from "@/lib/shared/contracts";

export function ProgressScreen() {
  const { settings, reloadSettings } = useApp();
  const unit = settings.unit;
  const toast = useToast();
  const today = todayStr();
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [modal, setModal] = useState<"weight" | "goal" | null>(null);

  const prog = useApi<ProgressResponse>(
    `/api/progress?exerciseId=${exerciseId ?? ""}`,
  );
  const week = useApi<DashboardResponse>(`/api/dashboard?date=${today}&view=week`);

  async function refreshAll() {
    await Promise.all([prog.reload(), reloadSettings()]);
  }

  async function deleteWeight(id: string) {
    await api.del(`/api/weights/${id}`);
    await prog.reload();
  }

  if (prog.loading && !prog.data) {
    return (
      <div>
        <Header />
        <Spinner />
      </div>
    );
  }

  const data = prog.data;
  const goal = data?.weightGoal;
  const selectedId = exerciseId ?? data?.selectedExerciseId ?? "";

  return (
    <div>
      <Header />

      {/* Weight goal */}
      <Card>
        <div className="mb-2.5 flex items-center justify-between">
          <SectionTitle>⚖️ Weight goal</SectionTitle>
          <button className="text-sm font-bold" style={{ color: "var(--accent)" }} onClick={() => setModal("goal")}>
            Edit
          </button>
        </div>
        {goal && goal.start != null && goal.target != null && goal.current != null && goal.progress ? (
          <>
            <div className="mb-2 flex items-end justify-between">
              <div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>Start</div>
                <b>{goal.start}</b>
              </div>
              <div className="text-center">
                <div className="text-xs" style={{ color: "var(--muted)" }}>Current</div>
                <b className="text-2xl">{goal.current}</b>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: "var(--muted)" }}>Target</div>
                <b>{goal.target}</b>
              </div>
            </div>
            <div className="bar">
              <span
                style={{
                  width: `${goal.progress.pct}%`,
                  ...(goal.progress.met ? { background: "var(--good)" } : {}),
                }}
              />
            </div>
            <div className="mt-2 text-center text-xs font-bold">
              {goal.progress.met
                ? "🎉 Goal reached!"
                : `${goal.progress.remaining.toFixed(1)} ${unit} to go · ${Math.round(goal.progress.pct)}%`}
            </div>
          </>
        ) : (
          <EmptyState emoji="🎯" text="Set a start & target weight to track your goal" />
        )}
      </Card>

      {/* Weekly goals */}
      <Card>
        <SectionTitle>🎯 Weekly goals</SectionTitle>
        {week.data?.week ? (
          <>
            <GoalBar label="Workouts" value={week.data.week.goals.workouts.value} goal={week.data.week.goals.workouts.goal} />
            <GoalBar label="Cardio (min)" value={week.data.week.goals.cardio.value} goal={week.data.week.goals.cardio.goal} />
          </>
        ) : (
          <Spinner />
        )}
      </Card>

      {/* Weight history */}
      <Card>
        <div className="mb-2.5 flex items-center justify-between">
          <SectionTitle>Weight history</SectionTitle>
          <Button size="sm" onClick={() => setModal("weight")}>
            Log weight
          </Button>
        </div>
        <LineChart points={(data?.weights ?? []).slice(-30).map((w) => ({ y: w.kg }))} />
        {data && data.weights.length > 0 && (
          <div className="mt-3">
            {[...data.weights]
              .slice(-5)
              .reverse()
              .map((w) => (
                <div
                  key={w.id}
                  className="flex items-center gap-2 border-b py-2 last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="flex-1">{prettyDate(w.date, today)}</span>
                  <b>{w.kg} {unit}</b>
                  <IconButton onClick={() => deleteWeight(w.id)}>✕</IconButton>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Strength progression */}
      <Card>
        <SectionTitle>💪 Strength progression</SectionTitle>
        {data && data.usedExercises.length > 0 ? (
          <>
            <select
              className="input mb-3"
              value={selectedId}
              onChange={(e) => setExerciseId(e.target.value)}
            >
              {data.usedExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
            <LineChart points={data.strength.map((s) => ({ y: s.topSet }))} />
            {data.strength.length > 0 && (
              <StrengthSummary data={data} unit={unit} today={today} />
            )}
          </>
        ) : (
          <EmptyState emoji="📈" text="Log some workouts to see your strength trends" />
        )}
      </Card>

      {modal === "weight" && (
        <WeightModal
          today={today}
          unit={unit}
          lastWeight={data?.weights.at(-1)?.kg ?? null}
          onClose={() => setModal(null)}
          onSaved={async () => {
            setModal(null);
            await prog.reload();
            toast("Logged ⚖️");
          }}
          onError={toast}
        />
      )}
      {modal === "goal" && (
        <GoalModal
          unit={unit}
          goal={goal ?? null}
          onClose={() => setModal(null)}
          onSaved={async () => {
            setModal(null);
            await refreshAll();
            toast("Goal set 🎯");
          }}
          onError={toast}
        />
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="mb-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Progress</h1>
      <p className="mt-0.5 text-[13px]" style={{ color: "var(--muted)" }}>
        Goals, weight &amp; strength
      </p>
    </header>
  );
}

function StrengthSummary({
  data,
  unit,
  today,
}: {
  data: ProgressResponse;
  unit: string;
  today: string;
}) {
  const first = data.strength[0].topSet;
  const last = data.strength[data.strength.length - 1].topSet;
  const change = last - first;
  return (
    <>
      <div className="mt-2 flex items-center justify-between text-xs font-bold">
        <span style={{ color: "var(--muted)" }}>
          Top set: {first} → {last} {unit}
        </span>
        <Pill color={change >= 0 ? "var(--good)" : "var(--bad)"}>
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)} {unit}
        </Pill>
      </div>
      <div className="mt-3">
        {[...data.strength]
          .slice(-5)
          .reverse()
          .map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 border-b py-1.5 text-xs last:border-0"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="flex-1">{prettyDate(s.date, today)}</span>
              <span style={{ color: "var(--muted)" }}>vol {Math.round(s.volume)}</span>
              <b>· {s.topSet} {unit}</b>
            </div>
          ))}
      </div>
    </>
  );
}

function WeightModal({
  today,
  unit,
  lastWeight,
  onClose,
  onSaved,
  onError,
}: {
  today: string;
  unit: string;
  lastWeight: number | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const [date, setDate] = useState(today);
  const [value, setValue] = useState(lastWeight != null ? String(lastWeight) : "");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!value || Number(value) <= 0) {
      onError("Enter a weight");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/weights", { date, kg: Number(value) });
      await onSaved();
    } catch (e) {
      setBusy(false);
      onError(e instanceof ApiError ? e.message : "Could not save");
    }
  }

  return (
    <Modal open onClose={onClose} title="⚖️ Log weight">
      <label className="mb-3 block">
        <span className="label">Date</span>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className="mb-3 block">
        <span className="label">Weight ({unit})</span>
        <input className="input" type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
      </label>
      <Button block disabled={busy} onClick={save}>
        {busy ? "Saving…" : "Save"}
      </Button>
    </Modal>
  );
}

function GoalModal({
  unit,
  goal,
  onClose,
  onSaved,
  onError,
}: {
  unit: string;
  goal: ProgressResponse["weightGoal"] | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const [start, setStart] = useState(goal?.start != null ? String(goal.start) : "");
  const [target, setTarget] = useState(goal?.target != null ? String(goal.target) : "");
  const [date, setDate] = useState(goal?.date ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await api.patch("/api/settings", {
        weightGoalStart: start ? Number(start) : null,
        weightGoalTarget: target ? Number(target) : null,
        weightGoalDate: date || null,
      });
      await onSaved();
    } catch (e) {
      setBusy(false);
      onError(e instanceof ApiError ? e.message : "Could not save");
    }
  }

  return (
    <Modal open onClose={onClose} title="⚖️ Weight goal">
      <div className="grid grid-cols-2 gap-2">
        <label className="mb-3 block">
          <span className="label">Start ({unit})</span>
          <input className="input" type="number" inputMode="decimal" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="mb-3 block">
          <span className="label">Target ({unit})</span>
          <input className="input" type="number" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
        </label>
      </div>
      <label className="mb-3 block">
        <span className="label">Target date (optional)</span>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <Button block disabled={busy} onClick={save}>
        {busy ? "Saving…" : "Save goal"}
      </Button>
    </Modal>
  );
}
