/**
 * Theme presets (pure data) shared by the server defaults and the client
 * ThemeProvider. Each preset is an accent gradient pair; the full light/dark
 * palette is derived from these at runtime.
 */
export interface ThemePreset {
  key: string;
  name: string;
  accent: string;
  accent2: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { key: "blush", name: "Blush", accent: "#ff8fb0", accent2: "#ffc2a0" },
  { key: "lavender", name: "Lavender", accent: "#c79bff", accent2: "#ff9ecf" },
  { key: "mint", name: "Mint", accent: "#5fd6a6", accent2: "#8fe0c8" },
  { key: "sky", name: "Sky", accent: "#73b9ff", accent2: "#9ad0ff" },
  { key: "peach", name: "Peach", accent: "#ffab76", accent2: "#ffd08a" },
  { key: "berry", name: "Berry", accent: "#e37ab0", accent2: "#b58cff" },
];

export const DEFAULT_PRESET_KEY = "lavender";

export function getPreset(key: string): ThemePreset {
  return THEME_PRESETS.find((p) => p.key === key) ?? THEME_PRESETS[1];
}

/* ---------- color math (pure) ---------- */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  };
}

export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function mix(hex: string, base: string, amount: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(base);
  const ch = (x: number, y: number) => Math.round(y + (x - y) * amount);
  return (
    "#" +
    [ch(a.r, b.r), ch(a.g, b.g), ch(a.b, b.b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

export interface ResolvedTheme {
  vars: Record<string, string>;
}

/** Build the full set of CSS variables for a given accent pair + mode. */
export function resolveTheme(
  accent: string,
  accent2: string,
  mode: "light" | "dark",
): ResolvedTheme {
  const vars: Record<string, string> = {
    "--accent": accent,
    "--accent2": accent2,
    "--accent-soft": rgba(accent, 0.16),
    "--good": "#56c596",
    "--warn": "#f3b04b",
    "--bad": "#f07a7a",
  };
  if (mode === "dark") {
    Object.assign(vars, {
      "--bg": "#17141d",
      "--surface": "#211d2a",
      "--surface2": "#2b2636",
      "--text": "#f1edf6",
      "--muted": "#9790a4",
      "--border": "rgba(255,255,255,0.07)",
      "--shadow": "0 6px 22px rgba(0,0,0,0.35)",
      "--on-accent": "#1b1622",
    });
  } else {
    Object.assign(vars, {
      "--bg": mix(accent, "#faf6fb", 0.06),
      "--surface": "#ffffff",
      "--surface2": mix(accent, "#f3eef7", 0.12),
      "--text": "#2c2733",
      "--muted": "#948da0",
      "--border": "rgba(40,30,55,0.08)",
      "--shadow": "0 6px 22px rgba(80,60,110,0.08)",
      "--on-accent": "#ffffff",
    });
  }
  return { vars };
}
