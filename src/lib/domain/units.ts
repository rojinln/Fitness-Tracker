import type { Unit } from "./types";

export const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lb", label: "Pounds (lb)" },
];

/**
 * Weights are stored as the number the user entered, in their selected unit.
 * Switching units is a display/label change and does not rewrite historical
 * numbers (documented behaviour — avoids surprising conversions on logged lifts).
 */
export function unitLabel(unit: Unit): string {
  return unit;
}

export function formatWeight(value: number, unit: Unit): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${unit}`;
}
