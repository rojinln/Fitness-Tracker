"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/components/providers";
import { MacroBars } from "@/components/MacroBars";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { Button, Card, IconButton, SectionTitle, Spinner } from "@/components/ui";
import { ApiError, api } from "@/lib/client/api";
import { compressImage } from "@/lib/client/photo";
import { useApi } from "@/lib/client/useApi";
import {
  MEAL_SLOT_META,
  addDays,
  macroTotals,
  prettyDate,
  todayStr,
  type MealDTO,
  type MealSlot,
} from "@/lib/domain";

type Editor = { slot: MealSlot; meal?: MealDTO } | null;

export function MealsScreen() {
  const { settings } = useApp();
  const toast = useToast();
  const [date, setDate] = useState(todayStr());
  const [editor, setEditor] = useState<Editor>(null);
  const meals = useApi<MealDTO[]>(`/api/meals?date=${date}`);

  const totals = useMemo(() => macroTotals(meals.data ?? []), [meals.data]);

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Meals</h1>
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

      <Card>
        <SectionTitle>Daily nutrition</SectionTitle>
        <MacroBars macros={totals} targets={settings.targets} />
      </Card>

      {meals.loading && !meals.data ? (
        <Spinner />
      ) : (
        MEAL_SLOT_META.map((slotMeta) => {
          const items = (meals.data ?? []).filter((m) => m.slot === slotMeta.slot);
          return (
            <Card key={slotMeta.slot}>
              <div className="mb-2 flex items-center justify-between">
                <SectionTitle>
                  {slotMeta.emoji} {slotMeta.label}
                </SectionTitle>
                <button
                  className="text-sm font-bold"
                  style={{ color: "var(--accent)" }}
                  onClick={() => setEditor({ slot: slotMeta.slot as MealSlot })}
                >
                  Add +
                </button>
              </div>
              {items.length === 0 ? (
                <p className="py-2 text-xs" style={{ color: "var(--muted)" }}>
                  Nothing logged
                </p>
              ) : (
                items.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setEditor({ slot: m.slot, meal: m })}
                    className="flex w-full items-center gap-3 border-b py-2.5 text-left last:border-0"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {m.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photoUrl}
                        alt=""
                        className="h-11 w-11 flex-shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                        style={{ background: "var(--accent-soft)" }}
                      >
                        {slotMeta.emoji}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <b>{m.name}</b>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {m.kcal} kcal · P{m.protein} C{m.carbs} F{m.fat}
                      </div>
                    </div>
                    <span style={{ color: "var(--muted)" }}>›</span>
                  </button>
                ))
              )}
            </Card>
          );
        })
      )}

      {editor && (
        <MealEditor
          date={date}
          slot={editor.slot}
          meal={editor.meal}
          onClose={() => setEditor(null)}
          onSaved={async () => {
            setEditor(null);
            await meals.reload();
            toast("Saved 🍓");
          }}
          onError={(m) => toast(m)}
        />
      )}
    </div>
  );
}

function MealEditor({
  date,
  slot,
  meal,
  onClose,
  onSaved,
  onError,
}: {
  date: string;
  slot: MealSlot;
  meal?: MealDTO;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState(meal?.name ?? "");
  const [kcal, setKcal] = useState(meal ? String(meal.kcal) : "");
  const [protein, setProtein] = useState(meal ? String(meal.protein) : "");
  const [carbs, setCarbs] = useState(meal ? String(meal.carbs) : "");
  const [fat, setFat] = useState(meal ? String(meal.fat) : "");
  const [preview, setPreview] = useState<string | null>(meal?.photoUrl ?? null);
  const [pendingDataUrl, setPendingDataUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setPendingDataUrl(dataUrl);
      setPreview(dataUrl);
      setRemoved(false);
    } catch {
      onError("Couldn't read image");
    }
  }

  async function save() {
    if (!name.trim() && !kcal) {
      onError("Add a name or calories");
      return;
    }
    setBusy(true);
    try {
      let photoUrl: string | null | undefined;
      if (pendingDataUrl) {
        const { url } = await api.post<{ url: string }>("/api/uploads", {
          dataUrl: pendingDataUrl,
        });
        photoUrl = url;
      } else if (removed) {
        photoUrl = null;
      } else {
        photoUrl = undefined; // unchanged
      }

      const base = {
        name: name.trim(),
        kcal: Number(kcal) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      };

      if (meal) {
        await api.patch(`/api/meals/${meal.id}`, {
          ...base,
          slot,
          ...(photoUrl !== undefined ? { photoUrl } : {}),
        });
      } else {
        await api.post("/api/meals", {
          date,
          slot,
          ...base,
          photoUrl: photoUrl ?? null,
        });
      }
      await onSaved();
    } catch (e) {
      setBusy(false);
      onError(e instanceof ApiError ? e.message : "Could not save");
    }
  }

  async function remove() {
    if (!meal) return;
    setBusy(true);
    try {
      await api.del(`/api/meals/${meal.id}`);
      await onSaved();
    } catch (e) {
      setBusy(false);
      onError(e instanceof ApiError ? e.message : "Could not delete");
    }
  }

  return (
    <Modal open onClose={onClose} title={`${meal ? "Edit" : "Add"} meal`}>
      <label className="mb-3 block">
        <span className="label">Name</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Greek yogurt bowl" />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="mb-3 block">
          <span className="label">Calories</span>
          <input className="input" type="number" inputMode="numeric" value={kcal} onChange={(e) => setKcal(e.target.value)} />
        </label>
        <label className="mb-3 block">
          <span className="label">Protein (g)</span>
          <input className="input" type="number" inputMode="numeric" value={protein} onChange={(e) => setProtein(e.target.value)} />
        </label>
        <label className="mb-3 block">
          <span className="label">Carbs (g)</span>
          <input className="input" type="number" inputMode="numeric" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
        </label>
        <label className="mb-3 block">
          <span className="label">Fat (g)</span>
          <input className="input" type="number" inputMode="numeric" value={fat} onChange={(e) => setFat(e.target.value)} />
        </label>
      </div>

      <label className="mb-2 block">
        <span className="label">Photo (optional, compressed)</span>
        <input className="input !py-2.5" type="file" accept="image/*" onChange={onFile} />
      </label>
      {preview && (
        <div className="mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="max-h-56 w-full rounded-xl object-cover" />
          <button
            className="mt-1 text-sm font-bold"
            style={{ color: "var(--bad)" }}
            onClick={() => {
              setPreview(null);
              setPendingDataUrl(null);
              setRemoved(true);
            }}
          >
            Remove photo
          </button>
        </div>
      )}

      <div className="flex gap-2.5">
        {meal && (
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
