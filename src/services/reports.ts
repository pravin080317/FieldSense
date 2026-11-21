import type { FieldReport } from "../types/reports.ts";
import type { FarmSeason } from "../types/farm.ts";
import { MAX_REPORT_ATTACHMENTS, validateAttachment } from "./attachments.ts";

export function parseReports(
  value: unknown,
  seasons: FarmSeason[],
): FieldReport[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("Invalid reports collection.");
  const ids = new Set<string>();
  return value.map((raw) => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid report.");
    const r = raw as FieldReport;
    for (const key of [
      "id",
      "fieldId",
      "seasonId",
      "sampledOn",
      "reportedOn",
      "recordedAt",
      "sourceName",
      "sampleLocation",
      "reference",
      "notes",
      "interpretation",
    ] as const)
      if (typeof r[key] !== "string" || r[key].length > 5000)
        throw new Error(`Invalid report ${key}.`);
    if (!r.id || ids.has(r.id))
      throw new Error("Missing or duplicate report ID.");
    ids.add(r.id);
    if (!seasons.some((s) => s.id === r.seasonId && s.fieldId === r.fieldId))
      throw new Error("Report field/season does not exist.");
    if (
      !["soil", "water"].includes(r.kind) ||
      r.verification !== "farmer-entered"
    )
      throw new Error("Invalid report provenance.");
    for (const day of [r.sampledOn, r.reportedOn]) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
        !Number.isFinite(+new Date(day)) ||
        new Date(day).toISOString().slice(0, 10) !== day
      )
        throw new Error("Enter a valid report date.");
    }
    if (
      !Number.isFinite(+new Date(r.recordedAt)) ||
      r.sampledOn > r.reportedOn ||
      r.reportedOn > r.recordedAt.slice(0, 10)
    )
      throw new Error(
        "Sample date must precede report date; future reports are not allowed.",
      );
    if (!r.sourceName.trim() || !r.sampleLocation.trim())
      throw new Error("Add the source and sample location.");
    if (
      !Array.isArray(r.measurements) ||
      !r.measurements.length ||
      r.measurements.length > 30
    )
      throw new Error("Add at least one measurement.");
    r.measurements.forEach((m) => {
      if (
        !m ||
        typeof m.label !== "string" ||
        !m.label.trim() ||
        m.label.length > 100 ||
        typeof m.unit !== "string" ||
        !m.unit.trim() ||
        m.unit.length > 50 ||
        typeof m.value !== "number" ||
        !Number.isFinite(m.value) ||
        m.value < 0
      )
        throw new Error(
          "Each measurement needs a name, non-negative number and unit.",
        );
      if (m.label.toLowerCase() === "ph" && m.value > 14)
        throw new Error("pH must be between 0 and 14.");
    });
    if (r.attachments !== undefined) {
      if (
        !Array.isArray(r.attachments) ||
        r.attachments.length > MAX_REPORT_ATTACHMENTS
      )
        throw new Error("A report can hold up to three original documents.");
      const attachmentIds = new Set<string>();
      for (const attachment of r.attachments) {
        validateAttachment(attachment);
        if (attachmentIds.has(attachment.id))
          throw new Error("Duplicate document attachment ID.");
        attachmentIds.add(attachment.id);
      }
    }
    return structuredClone(r);
  });
}
