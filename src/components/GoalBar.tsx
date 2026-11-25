"use client";
import { Pill, ProgressBar } from "./ui";

export function GoalBar({
  label,
  value,
  goal,
}: {
  label: string;
  value: number;
  goal: number;
}) {
  const met = value >= goal && goal > 0;
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-bold">{label}</span>
        <span>
          <b>{value}</b> <span style={{ color: "var(--muted)" }}>/ {goal}</span>{" "}
          {met && <Pill color="var(--good)">✓ met</Pill>}
        </span>
      </div>
      <ProgressBar value={value} max={goal} tone={met ? "good" : undefined} />
    </div>
  );
}
