"use client";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card mb-3.5 ${className}`}>{children}</div>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-2.5 text-[17px] font-bold tracking-tight">{children}</h2>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "md" | "sm";
  block?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === "ghost" ? "btn-ghost" : variant === "danger" ? "btn-danger" : "";
  const sizeClass = size === "sm" ? "btn-sm" : "";
  const blockClass = block ? "w-full" : "";
  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${blockClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      className="mb-3.5 flex gap-1 rounded-full p-1"
      style={{ background: "var(--surface2)" }}
    >
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex-1 rounded-full py-2 text-sm font-bold transition-colors"
            style={
              on
                ? { background: "var(--surface)", color: "var(--text)", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }
                : { color: "var(--muted)" }
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function ProgressBar({
  value,
  max,
  tone,
}: {
  value: number;
  max: number;
  tone?: "good" | "warn" | "bad";
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const bg =
    tone === "good"
      ? "var(--good)"
      : tone === "warn"
        ? "var(--warn)"
        : tone === "bad"
          ? "var(--bad)"
          : undefined;
  return (
    <div className="bar">
      <span style={{ width: `${pct}%`, ...(bg ? { background: bg } : {}) }} />
    </div>
  );
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div
      className="rounded-sm2 p-3 text-center"
      style={{ background: "var(--surface2)" }}
    >
      <div className="text-xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-0.5 text-[11px] font-semibold" style={{ color: "var(--muted)" }}>
        {label}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="py-6 text-center text-sm" style={{ color: "var(--muted)" }}>
      <span className="mb-2 block text-3xl">{emoji}</span>
      {text}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10" style={{ color: "var(--muted)" }}>
      <div
        className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-label="Loading"
      />
    </div>
  );
}

export function IconButton({
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg"
      style={{ background: "var(--surface2)", color: "var(--muted)" }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Pill({
  children,
  color = "var(--accent)",
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold"
      style={{ background: color, color: "#fff" }}
    >
      {children}
    </span>
  );
}
