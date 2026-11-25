import type { Config } from "tailwindcss";

/**
 * Colors are driven by CSS variables (see globals.css + ThemeProvider) so the
 * whole palette can be re-themed at runtime from user settings.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        text: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        accent2: "var(--accent2)",
        "on-accent": "var(--on-accent)",
        border: "var(--border)",
        good: "var(--good)",
        warn: "var(--warn)",
        bad: "var(--bad)",
      },
      borderRadius: {
        card: "20px",
        sm2: "14px",
      },
      boxShadow: {
        card: "var(--shadow)",
      },
      maxWidth: {
        app: "520px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
