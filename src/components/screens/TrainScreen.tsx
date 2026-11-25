"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/components/providers";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { Button, Card, EmptyState, IconButton, Segmented, Spinner } from "@/components/ui";
import { ApiError, api } from "@/lib/client/api";
import { useApi } from "@/lib/client/useApi";
import {
  CARDIO_TYPES,
  GROUP_EMOJI,
  MUSCLE_GROUPS,
  addDays,
  prettyDate,
  todayStr,
  workoutVolume,
  type CardioDTO,
  type ExerciseDTO,
  type MuscleGroup,
  type WorkoutDTO,
  type WorkoutEntryDTO,
} from "@/lib/domain";

type Modal =
  | { kind: "pick" }
  | { kind: "sets"; exercise: ExerciseDTO; entry?: WorkoutEntryDTO }
  | { kind: "cardio"; cardio?: CardioDTO }
  | null;

export function TrainScreen() {
  const { settings } = useApp();
  const unit = settings.unit;
  const toast = useToast();
  const [date, setDate] = useState(todayStr());
  const [tab, setTab] = useState<"strength" | "cardio">("strength");
  const [modal, setModal] = useState<Modal>(null);

  const workout = useApi<WorkoutDTO | null>(`/api/workouts?date=${date}`);
  const cardio = useApi<CardioDTO[]>(`/api/cardio?date=${date}`);
  const exercises = useApi<ExerciseDTO[]>("/api/exercises");

  const totalVolume = useMemo(
    () => (workout.data ? Math.round(workoutVolume(workout.data)) : 0),
    [workout.data],
  );

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Train</h1>
        <p className="mt-0.5 text-[13px]" style={{ color: "var(--muted)" }}>
          {prettyDate(date, todayStr())}
        </p>
      </header>

      <div className="mb-3.5 flex items-center justify-between gap-2">
        <IconButton onClick={() => setDate(addDays(date, -1))}>‹</IconButton>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="input flex-1 text-center"
        />
        <IconButton onClick={() => setDate(addDays(date, 1))}>›</IconButton>
      </div>

      <Segmented<"strength" | "cardio">
        value={tab}
        onChange={setTab}
        options={[
          { value: "strength", label: "🏋️ Strength" },
          { value: "cardio", label: "🏃 Cardio" },
        ]}
      />

      {tab === "strength" ? (
        <>
          <Card>
            {workout.loading && !workout.data ? (
              <Spinner />
            ) : workout.data && workout.data.entries.length > 0 ? (
              workout.data.entries.map((e) => (
                <button
                  key={e.id}
                  onClick={() =>
                    setModal({
                      kind: "sets",
                      exercise: {
                        id: e.exerciseId,
                        name: e.exerciseName,
                        muscleGroup: e.muscleGroup,
                        isCustom: false,
                      },
                      entry: e,
                    })
                  }
                  className="flex w-full items-center gap-3 border-b py-2.5 text-left last:border-0"
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
                      {e.sets.map((s) => `${s.reps}×${s.weight}`).join(", ")} {unit}
                      {e.notes ? ` · ${e.notes}` : ""}
                    </div>
                  </div>
                  <span style={{ color: "var(--muted)" }}>›</span>
                </button>
              ))
            ) : (
              <EmptyState emoji="💪" text="No exercises yet. Tap + to add one." />
            )}
          </Card>
          {workout.data && workout.data.entries.length > 0 && (
            <Card className="flex items-center justify-between !py-3">
              <span className="font-bold" style={{ color: "var(--muted)" }}>
                Total volume
              </span>
              <b>
                {totalVolume.toLocaleString()} {unit}
              </b>
            </Card>
          )}
          <Button block onClick={() => setModal({ kind: "pick" })}>
            + Add exercise
          </Button>
        </>
      ) : (
        <>
          <Card>
            {cardio.loading && !cardio.data ? (
              <Spinner />
            ) : cardio.data && cardio.data.length > 0 ? (
              cardio.data.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setModal({ kind: "cardio", cardio: c })}
                  className="flex w-full items-center gap-3 border-b py-2.5 text-left last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                    style={{ background: "var(--accent-soft)" }}
                  >
                    🏃
                  </div>
                  <div className="min-w-0 flex-1">
                    <b>{c.type}</b>
                    <div className="truncate text-xs" style={{ color: "var(--muted)" }}>
                      {c.minutes} min
                      {c.distanceKm ? ` · ${c.distanceKm} km` : ""}
                      {c.pace ? ` · ${c.pace}` : ""}
                      {c.kcal ? ` · ${c.kcal} kcal` : ""}
                    </div>
                  </div>
                  <span style={{ color: "var(--muted)" }}>›</span>
                </button>
              ))
            ) : (
              <EmptyState emoji="🏃" text="No cardio logged." />
            )}
          </Card>
          <Button block onClick={() => setModal({ kind: "cardio" })}>
            + Add cardio
          </Button>
        </>
      )}

      {modal?.kind === "pick" && (
        <ExercisePicker
          exercises={exercises.data ?? []}
          onClose={() => setModal(null)}
          onPick={(exercise) => setModal({ kind: "sets", exercise })}
          onCreated={async () => {
            await exercises.reload();
          }}
        />
      )}

      {modal?.kind === "sets" && (
        <SetEditor
          date={date}
          unit={unit}
          exercise={modal.exercise}
          entry={modal.entry}
          onClose={() => setModal(null)}
          onSaved={async () => {
            setModal(null);
            await workout.reload();
            toast("Saved 💪");
          }}
          onError={(m) => toast(m)}
        />
      )}

      {modal?.kind === "cardio" && (
        <CardioEditor
          date={date}
          cardio={modal.cardio}
          onClose={() => setModal(null)}
          onSaved={async () => {
            setModal(null);
            await cardio.reload();
            toast("Saved 🏃");
          }}
          onError={(m) => toast(m)}
        />
      )}
    </div>
  );
}

/* ---------------- Exercise picker ---------------- */
function ExercisePicker({
  exercises,
  onClose,
  onPick,
  onCreated,
}: {
  exercises: ExerciseDTO[];
  onClose: () => void;
  onPick: (exercise: ExerciseDTO) => void;
  onCreated: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<"All" | MuscleGroup>("All");
  const [showCustom, setShowCustom] = useState(false);
  const [name, setName] = useState("");
  const [customGroup, setCustomGroup] = useState<MuscleGroup>("Chest");
  const [busy, setBusy] = useState(false);

  const filtered = exercises.filter(
    (e) =>
      (group === "All" || e.muscleGroup === group) &&
      e.name.toLowerCase().includes(query.toLowerCase()),
  );

  async function createCustom() {
    if (!name.trim()) return;
    setBusy(true);
    const created = await api.post<ExerciseDTO>("/api/exercises", {
      name: name.trim(),
      muscleGroup: customGroup,
    });
    await onCreated();
    setBusy(false);
    onPick(created);
  }

  return (
    <Modal open onClose={onClose} title="Pick exercise">
      <input
        className="input mb-3"
        placeholder="🔍 Search exercises…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
        {(["All", ...MUSCLE_GROUPS] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`chip flex-shrink-0 ${group === g ? "chip-on" : ""}`}
          >
            {g === "All" ? "All" : `${GROUP_EMOJI[g]} ${g}`}
          </button>
        ))}
      </div>
      <div className="max-h-[48vh] overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState emoji="🔍" text="Nothing found" />
        ) : (
          filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => onPick(e)}
              className="flex w-full items-center gap-3 border-b py-2.5 text-left last:border-0"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ background: "var(--accent-soft)" }}
              >
                {GROUP_EMOJI[e.muscleGroup] ?? "💪"}
              </div>
              <div className="min-w-0 flex-1">
                <b>{e.name}</b>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {e.muscleGroup}
                  {e.isCustom ? " · custom" : ""}
                </div>
              </div>
              <span style={{ color: "var(--muted)" }}>＋</span>
            </button>
          ))
        )}
      </div>

      <div className="my-3 h-px" style={{ background: "var(--border)" }} />
      {showCustom ? (
        <div>
          <input
            className="input mb-2"
            placeholder="Exercise name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="input mb-2"
            value={customGroup}
            onChange={(e) => setCustomGroup(e.target.value as MuscleGroup)}
          >
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <Button block disabled={busy} onClick={createCustom}>
            {busy ? "Adding…" : "Add exercise"}
          </Button>
        </div>
      ) : (
        <Button variant="ghost" block onClick={() => setShowCustom(true)}>
          ＋ Create custom exercise
        </Button>
      )}
    </Modal>
  );
}

/* ---------------- Set editor ---------------- */
interface LocalSet {
  reps: number;
  weight: number;
}

function SetEditor({
  date,
  unit,
  exercise,
  entry,
  onClose,
  onSaved,
  onError,
}: {
  date: string;
  unit: string;
  exercise: ExerciseDTO;
  entry?: WorkoutEntryDTO;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [sets, setSets] = useState<LocalSet[]>(
    entry && entry.sets.length > 0
      ? entry.sets.map((s) => ({ ...s }))
      : [
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 },
        ],
  );
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [busy, setBusy] = useState(false);

  function update(i: number, key: keyof LocalSet, value: string) {
    const n = key === "reps" ? Math.round(Number(value) || 0) : Number(value) || 0;
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: n } : s)));
  }
  function addSet() {
    setSets((prev) => [...prev, prev[prev.length - 1] ?? { reps: 10, weight: 0 }]);
  }
  function removeSet(i: number) {
    setSets((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    if (sets.length === 0) {
      onError("Add at least one set");
      return;
    }
    setBusy(true);
    try {
      if (entry) {
        await api.patch(`/api/workouts/entries/${entry.id}`, { sets, notes });
      } else {
        await api.post("/api/workouts/entries", {
          date,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          muscleGroup: exercise.muscleGroup,
          notes,
          sets,
        });
      }
      await onSaved();
    } catch (e) {
      setBusy(false);
      onError(e instanceof ApiError ? e.message : "Could not save");
    }
  }

  async function remove() {
    if (!entry) return;
    setBusy(true);
    try {
      await api.del(`/api/workouts/entries/${entry.id}`);
      await onSaved();
    } catch (e) {
      setBusy(false);
      onError(e instanceof ApiError ? e.message : "Could not delete");
    }
  }

  return (
    <Modal open onClose={onClose} title={`${GROUP_EMOJI[exercise.muscleGroup] ?? "💪"} ${exercise.name}`}>
      <p className="mb-3 text-[13px]" style={{ color: "var(--muted)" }}>
        {exercise.muscleGroup} · {prettyDate(date, todayStr())}
      </p>

      <div className="mb-1 grid grid-cols-[32px_1fr_1fr_36px] gap-2 text-center text-[11px] font-bold" style={{ color: "var(--muted)" }}>
        <span />
        <span>REPS</span>
        <span>WEIGHT ({unit})</span>
        <span />
      </div>
      {sets.map((s, i) => (
        <div key={i} className="mb-2 grid grid-cols-[32px_1fr_1fr_36px] items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[13px] font-extrabold"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            {i + 1}
          </span>
          <input
            className="input text-center"
            type="number"
            inputMode="numeric"
            value={s.reps}
            onChange={(e) => update(i, "reps", e.target.value)}
          />
          <input
            className="input text-center"
            type="number"
            inputMode="decimal"
            value={s.weight}
            onChange={(e) => update(i, "weight", e.target.value)}
          />
          <IconButton onClick={() => removeSet(i)}>✕</IconButton>
        </div>
      ))}

      <Button variant="ghost" size="sm" block className="mt-1" onClick={addSet}>
        ＋ Add set
      </Button>

      <label className="mb-3 mt-3 block">
        <span className="label">Notes (optional)</span>
        <input
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. felt strong"
        />
      </label>

      <div className="flex gap-2.5">
        {entry && (
          <Button variant="danger" size="sm" disabled={busy} onClick={remove}>
            Delete
          </Button>
        )}
        <Button block disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </Modal>
  );
}

/* ---------------- Cardio editor ---------------- */
function CardioEditor({
  date,
  cardio,
  onClose,
  onSaved,
  onError,
}: {
  date: string;
  cardio?: CardioDTO;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [type, setType] = useState(cardio?.type ?? CARDIO_TYPES[0]);
  const [minutes, setMinutes] = useState(cardio ? String(cardio.minutes) : "");
  const [distance, setDistance] = useState(cardio?.distanceKm != null ? String(cardio.distanceKm) : "");
  const [pace, setPace] = useState(cardio?.pace ?? "");
  const [kcal, setKcal] = useState(cardio?.kcal != null ? String(cardio.kcal) : "");
  const [notes, setNotes] = useState(cardio?.notes ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!minutes || Number(minutes) <= 0) {
      onError("Add duration");
      return;
    }
    setBusy(true);
    const payload = {
      date,
      type,
      minutes: Number(minutes),
      distanceKm: distance ? Number(distance) : null,
      pace: pace.trim() || null,
      kcal: kcal ? Number(kcal) : null,
      notes: notes.trim() || null,
    };
    try {
      if (cardio) await api.patch(`/api/cardio/${cardio.id}`, payload);
      else await api.post("/api/cardio", payload);
      await onSaved();
    } catch (e) {
      setBusy(false);
      onError(e instanceof ApiError ? e.message : "Could not save");
    }
  }

  async function remove() {
    if (!cardio) return;
    setBusy(true);
    try {
      await api.del(`/api/cardio/${cardio.id}`);
      await onSaved();
    } catch (e) {
      setBusy(false);
      onError(e instanceof ApiError ? e.message : "Could not delete");
    }
  }

  return (
    <Modal open onClose={onClose} title={`🏃 ${cardio ? "Edit" : "Add"} cardio`}>
      <label className="mb-3 block">
        <span className="label">Type</span>
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          {CARDIO_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="mb-3 block">
          <span className="label">Duration (min)</span>
          <input className="input" type="number" inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </label>
        <label className="mb-3 block">
          <span className="label">Distance (km)</span>
          <input className="input" type="number" inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="mb-3 block">
          <span className="label">Pace / speed</span>
          <input className="input" value={pace} onChange={(e) => setPace(e.target.value)} placeholder="e.g. 5:30 /km" />
        </label>
        <label className="mb-3 block">
          <span className="label">Calories</span>
          <input className="input" type="number" inputMode="numeric" value={kcal} onChange={(e) => setKcal(e.target.value)} />
        </label>
      </div>
      <label className="mb-3 block">
        <span className="label">Notes</span>
        <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <div className="flex gap-2.5">
        {cardio && (
          <Button variant="danger" size="sm" disabled={busy} onClick={remove}>
            Delete
          </Button>
        )}
        <Button block disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </Modal>
  );
}
