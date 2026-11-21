import type { FarmField, FarmSeason } from "../types/farm.ts";
import type { FieldImagery } from "../types/imagery.ts";
import { validateAttachment } from "./attachments.ts";

export function parseImagery(
  value: unknown,
  fields: FarmField[],
  seasons: FarmSeason[],
): FieldImagery[] {
  if (value === undefined) return [];
  if (!Array.isArray(value))
    throw new Error("Invalid field imagery collection.");
  const ids = new Set<string>(),
    counts = new Map<string, number>();
  return value.map((raw) => {
    if (!raw || typeof raw !== "object")
      throw new Error("Invalid imagery record.");
    const r = raw as FieldImagery;
    for (const key of [
      "id",
      "fieldId",
      "seasonId",
      "title",
      "capturedOn",
      "source",
      "notes",
    ] as const)
      if (typeof r[key] !== "string" || r[key].length > 5000)
        throw new Error(`Invalid imagery ${key}.`);
    if (!r.id || ids.has(r.id))
      throw new Error("Missing or duplicate imagery ID.");
    ids.add(r.id);
    const field = fields.find((f) => f.id === r.fieldId);
    if (
      !field ||
      !seasons.some((s) => s.id === r.seasonId && s.fieldId === r.fieldId)
    )
      throw new Error("Imagery field/season does not exist.");
    const scope = r.fieldId + "/" + r.seasonId;
    counts.set(scope, (counts.get(scope) || 0) + 1);
    if (counts.get(scope)! > 3)
      throw new Error("Keep up to three imagery layers per field and season.");
    if (
      !r.title.trim() ||
      !r.source.trim() ||
      r.alignment !== "user-entered-bounds"
    )
      throw new Error("Add imagery title, source and alignment provenance.");
    validateAttachment(r.file);
    if (!r.file.mime.startsWith("image/"))
      throw new Error("Map overlays must be PNG, JPEG or WebP images.");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(r.capturedOn) ||
      !Number.isFinite(+new Date(r.capturedOn)) ||
      new Date(r.capturedOn).toISOString().slice(0, 10) !== r.capturedOn ||
      r.capturedOn > r.file.attachedAt.slice(0, 10)
    )
      throw new Error(
        "Enter a valid capture date, not later than the attachment date.",
      );
    const b = r.bounds;
    if (
      !b ||
      [b.south, b.west, b.north, b.east].some(
        (v) => typeof v !== "number" || !Number.isFinite(v),
      ) ||
      b.south < -85 ||
      b.north > 85 ||
      b.west < -180 ||
      b.east > 180 ||
      b.south >= b.north ||
      b.west >= b.east
    )
      throw new Error(
        "Enter ordered map bounds: south < north and west < east, within valid map coordinates.",
      );
    return structuredClone(r);
  });
}

export function imageryOverlapsField(
  bounds: FieldImagery["bounds"],
  field: FarmField,
): boolean {
  const points = field.boundary.length ? field.boundary : [field.location];
  return !(
    bounds.north < Math.min(...points.map((p) => p.lat)) ||
    bounds.south > Math.max(...points.map((p) => p.lat)) ||
    bounds.east < Math.min(...points.map((p) => p.lng)) ||
    bounds.west > Math.max(...points.map((p) => p.lng))
  );
}
