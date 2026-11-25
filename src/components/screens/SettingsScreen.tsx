"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/providers";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { Button, Card, IconButton, SectionTitle, Segmented } from "@/components/ui";
import { api } from "@/lib/client/api";
import { useApi } from "@/lib/client/useApi";
import {
  GROUP_EMOJI,
  MUSCLE_GROUPS,
  THEME_PRESETS,
  UNIT_OPTIONS,
  getPreset,
  type ExerciseDTO,
  type MuscleGroup,
  type SettingsDTO,
  type ThemeMode,
  type Unit,
} from "@/lib/domain";
import type { SettingsUpdateInput } from "@/lib/validation/schemas";

export function SettingsScreen() {
  const { user, settings, setSettings } = useApp();
  const toast = useToast();
  const router = useRouter();
  const exercises = useApi<ExerciseDTO[]>("/api/exercises");
  const [addOpen, setAddOpen] = useState(false);

  async function patch(update: SettingsUpdateInput) {
    const updated = await api.patch<SettingsDTO>("/api/settings", update);
    setSettings(updated);
  }

  async function logout() {
    await api.post("/api/auth/logout");
    router.push("/login");
    router.refresh();
  }

  const preset = getPreset(settings.themePreset);
  const customActive = Boolean(settings.accent);
  const custom = exercises.data?.filter((e) => e.isCustom) ?? [];

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">You</h1>
        <p className="mt-0.5 text-[13px]" style={{ color: "var(--muted)" }}>
          Profile, theme &amp; data
        </p>
      </header>

      {/* Profile */}
      <Card>
        <SectionTitle>👤 Profile</SectionTitle>
        <div className="mb-3">
          <span className="label">Name</span>
          <div className="input !bg-transparent">{user.name || "—"}</div>
        </div>
        <div className="mb-3">
          <span className="label">Email</span>
          <div className="input !bg-transparent">{user.email}</div>
        </div>
        <label className="block">
          <span className="label">Weight unit</span>
          <select
            className="input"
            value={settings.unit}
            onChange={(e) => patch({ unit: e.target.value as Unit })}
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </Card>

      {/* Theme */}
      <Card>
        <SectionTitle>🎨 Theme</SectionTitle>
        <Segmented<ThemeMode>
          value={settings.themeMode}
          onChange={(mode) => patch({ themeMode: mode })}
          options={[
            { value: "light", label: "☀️ Light" },
            { value: "dark", label: "🌙 Dark" },
          ]}
        />
        <div className="mb-2 ml-1 text-xs font-bold" style={{ color: "var(--muted)" }}>
          PRESET
        </div>
        <div className="mb-3 grid grid-cols-6 gap-2.5">
          {THEME_PRESETS.map((p) => {
            const on = settings.themePreset === p.key && !customActive;
            return (
              <button
                key={p.key}
                onClick={() => patch({ themePreset: p.key, accent: null, accent2: null })}
                className="aspect-square rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${p.accent}, ${p.accent2})`,
                  border: on ? "3px solid var(--text)" : "3px solid transparent",
                }}
                aria-label={p.name}
              />
            );
          })}
        </div>
        <div className="mb-2 ml-1 text-xs font-bold" style={{ color: "var(--muted)" }}>
          CUSTOM COLORS
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="label">Primary</span>
            <input
              type="color"
              className="input h-12 !p-1"
              value={settings.accent ?? preset.accent}
              onChange={(e) => patch({ accent: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="label">Secondary</span>
            <input
              type="color"
              className="input h-12 !p-1"
              value={settings.accent2 ?? preset.accent2}
              onChange={(e) => patch({ accent2: e.target.value })}
            />
          </label>
        </div>
        {customActive && (
          <button
            className="mt-2 text-sm font-bold"
            style={{ color: "var(--accent)" }}
            onClick={() => patch({ accent: null, accent2: null })}
          >
            ↺ Reset to preset
          </button>
        )}
      </Card>

      {/* Nutrition targets */}
      <Card>
        <SectionTitle>🍓 Daily nutrition targets</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Calories" value={settings.targets.kcal} onSave={(n) => patch({ targetKcal: n })} />
          <NumberField label="Protein (g)" value={settings.targets.protein} onSave={(n) => patch({ targetProtein: n })} />
          <NumberField label="Carbs (g)" value={settings.targets.carbs} onSave={(n) => patch({ targetCarbs: n })} />
          <NumberField label="Fat (g)" value={settings.targets.fat} onSave={(n) => patch({ targetFat: n })} />
        </div>
      </Card>

      {/* Weekly goals */}
      <Card>
        <SectionTitle>🎯 Weekly goals</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Workouts / week" value={settings.weeklyWorkoutGoal} onSave={(n) => patch({ weeklyWorkoutGoal: n })} />
          <NumberField label="Cardio min / week" value={settings.weeklyCardioGoal} onSave={(n) => patch({ weeklyCardioGoal: n })} />
        </div>
      </Card>

      {/* Exercise library */}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <SectionTitle>🏋️ Exercise library</SectionTitle>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            + Add
          </Button>
        </div>
        <div className="mb-2 text-xs" style={{ color: "var(--muted)" }}>
          {custom.length} custom exercise{custom.length === 1 ? "" : "s"}
        </div>
        {custom.map((e) => (
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
            <div className="flex-1">
              <b>{e.name}</b>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {e.muscleGroup}
              </div>
            </div>
            <IconButton
              onClick={async () => {
                await api.del(`/api/exercises/${e.id}`);
                await exercises.reload();
              }}
            >
              ✕
            </IconButton>
          </div>
        ))}
      </Card>

      {/* Account */}
      <Card>
        <SectionTitle>Account</SectionTitle>
        <Button variant="ghost" block onClick={logout}>
          Sign out
        </Button>
      </Card>

      <p className="pb-2 pt-1 text-center text-xs" style={{ color: "var(--muted)" }}>
        Bloom · add to Home Screen for an app-like experience 🌸
      </p>

      {addOpen && (
        <AddExerciseModal
          onClose={() => setAddOpen(false)}
          onAdded={async () => {
            setAddOpen(false);
            await exercises.reload();
            toast("Exercise added");
          }}
        />
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: number;
  onSave: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        className="input"
        type="number"
        inputMode="numeric"
        defaultValue={value}
        onBlur={(e) => {
          const n = Math.round(Number(e.target.value) || 0);
          if (n !== value) onSave(n);
        }}
      />
    </label>
  );
}

function AddExerciseModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<MuscleGroup>("Chest");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    await api.post("/api/exercises", { name: name.trim(), muscleGroup: group });
    await onAdded();
  }

  return (
    <Modal open onClose={onClose} title="Custom exercise">
      <label className="mb-3 block">
        <span className="label">Name</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cable Y-Raise" />
      </label>
      <label className="mb-3 block">
        <span className="label">Muscle group</span>
        <select className="input" value={group} onChange={(e) => setGroup(e.target.value as MuscleGroup)}>
          {MUSCLE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>
      <Button block disabled={busy} onClick={add}>
        {busy ? "Adding…" : "Add exercise"}
      </Button>
    </Modal>
  );
}
