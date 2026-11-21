import { parseFarmState } from "./farm.ts";
import { parseImagery } from "./imagery.ts";
import { parseReports } from "./reports.ts";
import type { Observation } from "../types/domain.ts";
import type { Workspace, Visit, Scenario } from "../types/workspace.ts";

export const LEGACY_KEY = "fieldsense-workspace-v2";
export const BACKUP_FORMAT = "fieldsense-workspace";
const validDate = (value: unknown): Date => {
  if (!(typeof value === "string" || value instanceof Date))
    throw new Error("Missing or invalid record timestamp.");
  const date = new Date(value);
  if (!Number.isFinite(+date)) throw new Error("Invalid record timestamp.");
  return date;
};
const obj = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a record object.");
  return value as Record<string, unknown>;
};
const text = (r: Record<string, unknown>, k: string) => {
  if (typeof r[k] !== "string" || !r[k]) throw new Error(`Missing ${k}.`);
  return r[k] as string;
};
const array = (
  r: Record<string, unknown>,
  k: string,
  optional = false,
): unknown[] => {
  if (optional && r[k] === undefined) return [];
  if (!Array.isArray(r[k])) throw new Error(`Invalid ${k} collection.`);
  return r[k] as unknown[];
};
const unique = (rows: { id: string }[], label: string) => {
  if (new Set(rows.map((r) => r.id)).size !== rows.length)
    throw new Error(`Duplicate IDs in ${label}.`);
};
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function visitsFor(observations: Observation[]): Visit[] {
  return observations.map((o) => ({
    id: o.visitId || `visit-${o.id}`,
    fieldId: o.fieldId,
    seasonId: o.seasonId || "season-2024-k",
    observedAt: o.observedAt,
    recordedAt: o.recordedAt,
    observationIds: [o.id],
    isIllustrative: o.isIllustrative,
  }));
}
export function latestObservations(
  observations: Observation[],
  asOf: Date,
): Observation[] {
  const latest = new Map<string, Observation>();
  for (const o of [...observations]
    .filter((o) => +o.observedAt <= +asOf)
    .sort(
      (a, b) => +a.observedAt - +b.observedAt || +a.recordedAt - +b.recordedAt,
    ))
    latest.set(
      `${o.fieldId}/${o.seasonId || "season-2024-k"}/${o.scoutingPointId || o.id}`,
      o,
    );
  return [...latest.values()];
}
export function newObservation(
  previous: Observation | undefined,
  patch: Partial<Observation>,
  point: string,
  observedAt: Date,
  recordedAt = new Date(),
  context?: { fieldId: string; seasonId: string },
): Observation {
  if (!Number.isFinite(+observedAt) || observedAt > recordedAt)
    throw new Error(
      "Observation time must be valid and cannot be in the future.",
    );
  return {
    ...previous,
    ...patch,
    id: crypto.randomUUID(),
    visitId: crypto.randomUUID(),
    seasonId: context?.seasonId || previous?.seasonId || "season-2024-k",
    fieldId: context?.fieldId || previous?.fieldId || "field-01",
    scoutingPointId: point,
    observedAt,
    recordedAt,
    source: "farmer",
    verificationStatus: "observed",
    isIllustrative: false,
  };
}
export function appendObservation(
  workspace: Workspace,
  observation: Observation,
): Workspace {
  if (workspace.obs.some((o) => o.id === observation.id))
    throw new Error("An observation with this ID already exists.");
  if (!observation.visitId)
    throw new Error("New observations require a visit ID.");
  return {
    ...workspace,
    obs: [...workspace.obs, observation],
    visits: [...workspace.visits, ...visitsFor([observation])],
  };
}
export function parseWorkspace(value: unknown, legacy = false): Workspace {
  const r = obj(value);
  if (!legacy && r.schemaVersion !== 3 && r.schemaVersion !== 4)
    throw new Error("Unsupported workspace version.");
  if (!["A", "B", "C"].includes(String(r.scenario)))
    throw new Error("Invalid scenario.");
  const farm = parseFarmState(r, legacy || r.schemaVersion === 3);
  const obs = array(r, "obs").map((value) => {
    const row = obj(value);
    const id = text(row, "id");
    text(row, "fieldId");
    if (
      !["farmer", "laboratory", "weather", "agronomist"].includes(
        String(row.source),
      )
    )
      throw new Error("Invalid evidence source.");
    if (
      !["observed", "verified", "pending", "unverified"].includes(
        String(row.verificationStatus),
      ) ||
      typeof row.isIllustrative !== "boolean"
    )
      throw new Error("Missing evidence provenance.");
    for (const key of [
      "symptoms",
      "generalNotes",
      "weatherRecent",
      "pestType",
      "soilColor",
    ])
      if (row[key] !== undefined && typeof row[key] !== "string")
        throw new Error(`Invalid text in ${key}.`);
    if (
      row.visiblePestCount !== undefined &&
      (!Number.isInteger(row.visiblePestCount) ||
        Number(row.visiblePestCount) < 0)
    )
      throw new Error("Invalid pest count.");
    for (const [key, allowed] of Object.entries({
      leafColor: ["normal", "yellowing", "browning", "mottling", ""],
      soilCondition: ["dry", "moist", "waterlogged", "cracked", ""],
      leafLocation: ["lower", "middle", "upper", "mixed", ""],
    }))
      if (row[key] !== undefined && !allowed.includes(String(row[key])))
        throw new Error(`Invalid ${key}.`);
    if (
      row.scoutingPointId !== undefined &&
      !["pt-1", "pt-2", "pt-3", "pt-4"].includes(String(row.scoutingPointId))
    )
      throw new Error("Unknown sampling point.");
    return {
      ...row,
      id,
      observedAt: validDate(row.observedAt),
      recordedAt: validDate(row.recordedAt),
      visitId: typeof row.visitId === "string" ? row.visitId : `visit-${id}`,
      seasonId:
        typeof row.seasonId === "string" ? row.seasonId : "season-2024-k",
    } as unknown as Observation;
  });
  unique(obs, "observations");
  const photos = array(r, "photos", legacy).map((value) => {
    const row = obj(value);
    text(row, "id");
    text(row, "point");
    text(row, "kind");
    const url = text(row, "url");
    if (
      !/^data:image\/(png|jpeg|webp|gif|avif|bmp);base64,/i.test(url) ||
      url.length > 4500000
    )
      throw new Error("Invalid photo data or photo too large.");
    return {
      ...row,
      recordedAt:
        row.recordedAt === undefined ? undefined : validDate(row.recordedAt),
    } as unknown as Workspace["photos"][number];
  });
  unique(photos, "photos");
  for (const photo of photos) {
    if (
      photo.observationId !== undefined &&
      !obs.some(
        (o) =>
          o.id === photo.observationId &&
          o.fieldId === (photo.fieldId || "field-01") &&
          (o.seasonId || "season-2024-k") ===
            (photo.seasonId || "season-2024-k") &&
          o.scoutingPointId === photo.point,
      )
    )
      throw new Error(
        "Photo visit link is missing or belongs to another point, field or season.",
      );
  }
  const entries = array(r, "entries", legacy).map((value) => {
    const row = obj(value);
    for (const key of ["id", "type", "date", "notes"]) text(row, key);
    if (
      typeof row.cost !== "string" ||
      (row.cost !== "" &&
        (!Number.isFinite(Number(row.cost)) || Number(row.cost) < 0))
    )
      throw new Error("Invalid activity cost.");
    validDate(row.date);
    return row as unknown as Workspace["entries"][number];
  });
  unique(entries, "diary entries");
  let follow: Workspace["follow"] = null;
  if (r.follow) {
    const f = obj(r.follow);
    text(f, "action");
    validDate(text(f, "date"));
    if (
      !["unknown", "better", "same", "worse"].includes(String(f.outcome)) ||
      typeof f.notes !== "string"
    )
      throw new Error("Invalid follow-up.");
    follow = f as unknown as Workspace["follow"];
  }
  if (
    !["scenario", "wrong", "stale", "absent"].includes(String(r.report)) ||
    typeof r.rain !== "number" ||
    !Number.isFinite(r.rain) ||
    r.rain < 0
  )
    throw new Error("Invalid environmental context.");
  const visits = legacy
    ? visitsFor(obs)
    : array(r, "visits").map((value) => {
        const v = obj(value);
        for (const k of ["id", "fieldId", "seasonId"]) text(v, k);
        if (
          typeof v.isIllustrative !== "boolean" ||
          !Array.isArray(v.observationIds) ||
          !v.observationIds.every(
            (id) => typeof id === "string" && obs.some((o) => o.id === id),
          )
        )
          throw new Error("Invalid visit references.");
        return {
          ...v,
          observedAt: validDate(v.observedAt),
          recordedAt: validDate(v.recordedAt),
        } as unknown as Visit;
      });
  unique(visits, "visits");
  for (const o of obs)
    if (
      !visits.some(
        (v) =>
          v.id === o.visitId &&
          v.fieldId === o.fieldId &&
          v.seasonId === o.seasonId &&
          v.observationIds.includes(o.id),
      )
    )
      throw new Error("Observation is missing its matching visit.");
  for (const o of obs)
    if (
      !farm.seasons.some((s) => s.id === o.seasonId && s.fieldId === o.fieldId)
    )
      throw new Error("Observation belongs to a missing field or season.");
  for (const task of farm.tasks)
    if (
      task.observationIds.some(
        (id) =>
          !obs.some(
            (o) =>
              o.id === id &&
              o.fieldId === task.fieldId &&
              o.seasonId === task.seasonId,
          ),
      )
    )
      throw new Error("Task evidence belongs to another field or season.");
  for (const row of [...photos, ...entries])
    if (
      !farm.seasons.some(
        (s) =>
          s.fieldId === (row.fieldId || "field-01") &&
          s.id === (row.seasonId || "season-2024-k"),
      )
    )
      throw new Error(
        "Photo or diary entry belongs to a missing field/season.",
      );
  const reviewDate = legacy ? "2024-10-19" : text(r, "reviewDate");
  validDate(reviewDate);
  return {
    ...farm,
    imagery: parseImagery(r.imagery, farm.fields, farm.seasons),
    fieldReports: parseReports(r.fieldReports, farm.seasons),
    schemaVersion: 4,
    scenario: r.scenario as Scenario,
    obs,
    visits,
    photos,
    entries,
    follow,
    report: r.report as Workspace["report"],
    rain: r.rain,
    reviewDate,
  };
}
export function createWorkspace(
  scenario: Scenario,
  observations: Observation[],
): Workspace {
  return parseWorkspace({
    schemaVersion: 3,
    scenario,
    obs: observations,
    visits: visitsFor(observations),
    photos: [],
    entries: [],
    follow: null,
    report: "scenario",
    rain: scenario === "A" ? 48 : 8,
    reviewDate: "2024-10-19",
  });
}
export function exportBackup(workspace: Workspace): string {
  return JSON.stringify(
    {
      format: BACKUP_FORMAT,
      version: 4,
      exportedAt: new Date().toISOString(),
      workspace: parseWorkspace(workspace),
    },
    null,
    2,
  );
}
export function parseBackup(json: string): Workspace {
  if (json.length > 50000000)
    throw new Error("Backup is too large (maximum 50 MB).");
  const r = obj(JSON.parse(json));
  if (r.format !== BACKUP_FORMAT || ![3, 4].includes(Number(r.version)))
    throw new Error("Choose a FieldSense version 3 or 4 workspace backup.");
  return parseWorkspace(r.workspace);
}
export function mergeBackup(
  current: Workspace,
  incoming: Workspace,
): Workspace {
  const a = parseWorkspace(current),
    b = parseWorkspace(incoming);
  if (a.scenario !== b.scenario)
    throw new Error(
      "Backup belongs to another sample case. Select that case before restoring.",
    );
  function merge<T extends { id: string }>(left: T[], right: T[]): T[] {
    const rows = new Map(left.map((v) => [v.id, v]));
    for (const v of right) {
      const existing = rows.get(v.id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(v))
        throw new Error(
          `Conflicting record ${v.id}; current records were kept.`,
        );
      rows.set(v.id, v);
    }
    return [...rows.values()];
  }
  return parseWorkspace({
    ...a,
    fields: merge(a.fields, b.fields),
    seasons: merge(a.seasons, b.seasons),
    tasks: merge(a.tasks, b.tasks),
    fieldReports: merge(a.fieldReports, b.fieldReports),
    imagery: merge(a.imagery, b.imagery),
    obs: merge(a.obs, b.obs),
    visits: merge(a.visits, b.visits),
    photos: merge(a.photos, b.photos),
    entries: merge(a.entries, b.entries),
    follow: a.follow || b.follow,
    reviewDate: a.reviewDate > b.reviewDate ? a.reviewDate : b.reviewDate,
  });
}

/** Stable newest-first presentation uses the same tie-breaker as evidence selection. */
export function historyNewestFirst(observations: Observation[]): Observation[] {
  return [...observations].sort(
    (a, b) => +b.observedAt - +a.observedAt || +b.recordedAt - +a.recordedAt,
  );
}
