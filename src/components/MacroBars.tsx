"use client";
import type { MacroTargets, MacroTotals } from "@/lib/domain";
import { ProgressBar } from "./ui";

/** Daily calories + protein/carbs/fat vs targets. Shared by Today and Meals. */
export function MacroBars({
  macros,
  targets,
}: {
  macros: MacroTotals;
  targets: MacroTargets;
}) {
  const over = (v: number, t: number) => (t > 0 && v > t * 1.05 ? "warn" : undefined);
  const items: { label: string; value: number; target: number }[] = [
    { label: "Protein", value: macros.protein, target: targets.protein },
    { label: "Carbs", value: macros.carbs, target: targets.carbs },
    { label: "Fat", value: macros.fat, target: targets.fat },
  ];
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-bold" style={{ color: "var(--muted)" }}>
          Calories
        </span>
        <span>
          <b>{Math.round(macros.kcal)}</b> / {targets.kcal}
        </span>
      </div>
      <ProgressBar value={macros.kcal} max={targets.kcal} tone={over(macros.kcal, targets.kcal)} />
      <div className="mt-3 grid grid-cols-3 gap-3">
        {items.map((m) => (
          <div key={m.label}>
            <div className="text-center text-xs font-bold" style={{ color: "var(--muted)" }}>
              {m.label}
            </div>
            <div className="text-center text-sm">
              <b>{Math.round(m.value)}</b>
              <span style={{ color: "var(--muted)" }}>/{m.target}g</span>
            </div>
            <div className="mt-1">
              <ProgressBar value={m.value} max={m.target} tone={over(m.value, m.target)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
