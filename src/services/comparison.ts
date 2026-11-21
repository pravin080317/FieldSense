import type { Observation } from "../types/domain.ts";

export function pointVisits(
  observations: Observation[],
  fieldId: string,
  seasonId: string,
  pointId: string,
) {
  return observations
    .filter(
      (o) =>
        o.fieldId === fieldId &&
        (o.seasonId || "season-2024-k") === seasonId &&
        o.scoutingPointId === pointId,
    )
    .sort(
      (a, b) =>
        +new Date(a.observedAt) - +new Date(b.observedAt) ||
        +new Date(a.recordedAt) - +new Date(b.recordedAt) ||
        a.id.localeCompare(b.id),
    );
}

export interface ComparisonRow {
  label: string;
  earlier: string;
  later: string;
  change: string;
}
export function compareVisits(
  earlier: Observation,
  later: Observation,
): ComparisonRow[] {
  if (
    earlier.id === later.id ||
    earlier.fieldId !== later.fieldId ||
    (earlier.seasonId || "season-2024-k") !==
      (later.seasonId || "season-2024-k") ||
    !earlier.scoutingPointId ||
    earlier.scoutingPointId !== later.scoutingPointId
  )
    throw new Error(
      "Choose two different visits at the same point, field and season.",
    );
  if (
    +new Date(earlier.observedAt) > +new Date(later.observedAt) ||
    (+new Date(earlier.observedAt) === +new Date(later.observedAt) &&
      +new Date(earlier.recordedAt) > +new Date(later.recordedAt))
  )
    throw new Error("Choose the earlier visit first.");
  const rows: ComparisonRow[] = [];
  for (const [key, label] of [
    ["leafColor", "Leaf colour"],
    ["leafPattern", "Leaf pattern"],
    ["leafLocation", "Leaves affected"],
    ["soilCondition", "Soil condition"],
    ["pestType", "Insect type"],
    ["symptoms", "Visible symptoms"],
  ] as const) {
    const a = earlier[key]?.trim(),
      b = later[key]?.trim();
    rows.push({
      label,
      earlier: a || "Not recorded",
      later: b || "Not recorded",
      change:
        !a || !b
          ? "Cannot compare"
          : a === b
            ? "No recorded change"
            : "Changed",
    });
  }
  for (const [key, label, unit] of [
    ["visiblePestCount", "Insects counted", ""],
    ["plantHeight", "Plant height", "cm"],
    ["tillerCount", "Tillers counted", ""],
  ] as const) {
    const a = earlier[key],
      b = later[key];
    const validA = typeof a === "number" && Number.isFinite(a),
      validB = typeof b === "number" && Number.isFinite(b);
    const delta =
      validA && validB ? Math.round((b - a) * 100) / 100 : undefined;
    rows.push({
      label,
      earlier: validA ? `${a}${unit ? ` ${unit}` : ""}` : "Not recorded",
      later: validB ? `${b}${unit ? ` ${unit}` : ""}` : "Not recorded",
      change:
        delta === undefined
          ? "Cannot compare"
          : delta === 0
            ? "No recorded change"
            : `${delta > 0 ? "+" : ""}${delta}${unit ? ` ${unit}` : ""}`,
    });
  }
  return rows;
}
