"use client";
import { EmptyState } from "./ui";

export interface LinePoint {
  y: number;
}

/** Minimal dependency-free SVG line chart with a soft area fill. */
export function LineChart({
  points,
  width = 320,
  height = 120,
}: {
  points: LinePoint[];
  width?: number;
  height?: number;
}) {
  if (points.length === 0) {
    return <EmptyState emoji="📊" text="No data yet" />;
  }
  const data = points.length === 1 ? [points[0], points[0]] : points;
  const ys = data.map((p) => p.y);
  let min = Math.min(...ys);
  let max = Math.max(...ys);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad = 8;
  const iw = width - pad * 2;
  const ih = height - pad * 2;
  const n = data.length;
  const x = (i: number) => pad + (n === 1 ? iw / 2 : (iw * i) / (n - 1));
  const y = (v: number) => pad + ih - (ih * (v - min)) / (max - min);

  const line = data
    .map((p, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(p.y).toFixed(1)}`)
    .join(" ");
  const area = `${line} L ${x(n - 1).toFixed(1)} ${(pad + ih).toFixed(1)} L ${x(0).toFixed(1)} ${(pad + ih).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block w-full overflow-visible">
      <defs>
        <linearGradient id="bloom-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#bloom-area)" />
      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((p, i) => (
        <circle
          key={i}
          cx={x(i).toFixed(1)}
          cy={y(p.y).toFixed(1)}
          r={n > 20 ? 1.6 : 2.8}
          fill="var(--accent)"
        />
      ))}
    </svg>
  );
}

export interface DistRow {
  label: string;
  value: number;
  emoji?: string;
}

export function BarDistribution({ rows }: { rows: DistRow[] }) {
  if (rows.length === 0) return <EmptyState emoji="🧩" text="No data yet" />;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2.5">
          <div className="w-[84px] truncate text-[12.5px] font-semibold">
            {r.emoji ? `${r.emoji} ` : ""}
            {r.label}
          </div>
          <div className="bar flex-1">
            <span style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <div className="w-7 text-right text-[13px] font-extrabold">{r.value}</div>
        </div>
      ))}
    </div>
  );
}
