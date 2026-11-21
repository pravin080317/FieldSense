import type {
  FarmField,
  FarmSeason,
  FarmTask,
  FarmState,
  Coordinate,
  TaskStatus,
  TaskOutcome,
} from "../types/farm.ts";
import type { Workspace } from "../types/workspace.ts";
import type { ScoutingPoint } from "../types/domain.ts";
import { crops, isOngoingCrop } from "../data/crops.ts";
const rec = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw new Error("Invalid farm record.");
  return v as Record<string, unknown>;
};
const str = (r: Record<string, unknown>, key: string) => {
  if (typeof r[key] !== "string" || !(r[key] as string).trim())
    throw new Error(`Enter ${key}.`);
  return (r[key] as string).trim();
};
export function coordinate(value: unknown): Coordinate {
  const r = rec(value);
  if (
    typeof r.lat !== "number" ||
    typeof r.lng !== "number" ||
    !Number.isFinite(r.lat) ||
    !Number.isFinite(r.lng) ||
    Math.abs(r.lat) > 90 ||
    Math.abs(r.lng) > 180
  )
    throw new Error(
      "Use valid latitude (-90 to 90) and longitude (-180 to 180).",
    );
  return { lat: r.lat, lng: r.lng };
}
export function calendarDate(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(+new Date(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  )
    throw new Error("Use a valid calendar date.");
  return value;
}
const timestamp = (value: unknown): Date => {
  if (
    !(value instanceof Date || typeof value === "string") ||
    !Number.isFinite(+new Date(value))
  )
    throw new Error("Invalid task timestamp.");
  return new Date(value);
};
export function boundaryArea(points: Coordinate[]): number {
  if (points.length < 3) return 0;
  const lat = points.reduce((n, p) => n + p.lat, 0) / points.length;
  const scale = 111320;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    sum += a.lng * b.lat - b.lng * a.lat;
  }
  return (
    (Math.abs(sum / 2) * scale * scale * Math.cos((lat * Math.PI) / 180)) /
    10000
  );
}
export function validateBoundary(value: unknown): Coordinate[] {
  if (!Array.isArray(value) || value.length > 500)
    throw new Error("A boundary must contain no more than 500 points.");
  const points = value.map(coordinate);
  if (
    points.length > 1 &&
    points[0].lat === points.at(-1)?.lat &&
    points[0].lng === points.at(-1)?.lng
  )
    points.pop();
  if (points.length === 0) return [];
  if (
    points.length < 3 ||
    new Set(points.map((p) => `${p.lat}/${p.lng}`)).size < 3 ||
    boundaryArea(points) < 0.00001
  )
    throw new Error(
      "Mark at least three different corners to form a field boundary.",
    );
  if (new Set(points.map((p) => `${p.lat}/${p.lng}`)).size !== points.length)
    throw new Error("Boundary corners must be distinct.");
  const cross = (a: Coordinate, b: Coordinate, c: Coordinate) =>
    (b.lng - a.lng) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lng - a.lng);
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || (i === 0 && j === points.length - 1)) continue;
      const a = points[i],
        b = points[(i + 1) % points.length],
        c = points[j],
        d = points[(j + 1) % points.length];
      if (
        cross(a, b, c) * cross(a, b, d) < 0 &&
        cross(c, d, a) * cross(c, d, b) < 0
      )
        throw new Error(
          "Boundary edges cross. Mark corners in order around the field.",
        );
    }
  return points;
}
export function parseField(value: unknown): FarmField {
  const r = rec(value);
  if (
    typeof r.areaHectares !== "number" ||
    !Number.isFinite(r.areaHectares) ||
    r.areaHectares <= 0 ||
    r.areaHectares > 100000
  )
    throw new Error("Field area must be greater than zero.");
  if (typeof r.isIllustrative !== "boolean")
    throw new Error("Field source is missing.");
  return {
    id: str(r, "id"),
    name: str(r, "name"),
    locality: str(r, "locality"),
    areaHectares: r.areaHectares,
    location: coordinate(r.location),
    boundary: validateBoundary(r.boundary),
    irrigationSource: str(r, "irrigationSource"),
    isIllustrative: r.isIllustrative,
  };
}
export function parseSeason(value: unknown): FarmSeason {
  const r = rec(value);
  const sow =
    r.sowingDate === "" && isOngoingCrop(String(r.crop))
      ? ""
      : calendarDate(r.sowingDate);
  const harvest =
    r.expectedHarvestDate === "" ? "" : calendarDate(r.expectedHarvestDate);
  if (sow && harvest && harvest <= sow)
    throw new Error("Expected harvest must be after sowing.");
  if (!crops.some((crop) => crop.id === r.crop))
    throw new Error("Choose a crop from the list.");
  if (
    ![
      "not-set",
      "planting",
      "vegetative",
      "reproductive",
      "harvest",
      "finished",
    ].includes(String(r.growthStage)) ||
    typeof r.isIllustrative !== "boolean"
  )
    throw new Error("Invalid crop stage or season source.");
  return {
    id: str(r, "id"),
    fieldId: str(r, "fieldId"),
    name: str(r, "name"),
    crop: r.crop as FarmSeason["crop"],
    variety: str(r, "variety"),
    sowingDate: sow,
    expectedHarvestDate: harvest,
    growthStage: r.growthStage as FarmSeason["growthStage"],
    isIllustrative: r.isIllustrative,
  };
}
export function seedFarm(): FarmState {
  return {
    fields: [
      {
        id: "field-01",
        name: "Paddy Field 01",
        locality: "Yethapur, Salem, Tamil Nadu",
        areaHectares: 1.2,
        location: { lat: 11.6545, lng: 78.4855 },
        boundary: [
          { lat: 11.654, lng: 78.485 },
          { lat: 11.654, lng: 78.486 },
          { lat: 11.655, lng: 78.486 },
          { lat: 11.655, lng: 78.485 },
        ],
        irrigationSource: "Canal + borewell (sample)",
        isIllustrative: true,
      },
    ],
    seasons: [
      {
        id: "season-2024-k",
        fieldId: "field-01",
        name: "Kharif 2024",
        crop: "rice",
        variety: "Ponni",
        sowingDate: "2024-07-15",
        expectedHarvestDate: "2024-11-15",
        growthStage: "reproductive",
        isIllustrative: true,
      },
    ],
    tasks: [],
    selectedFieldId: "field-01",
    selectedSeasonId: "season-2024-k",
    theme: "forest",
  };
}
export function parseFarmState(value: unknown, legacy = false): FarmState {
  const r = rec(value);
  if (legacy) {
    const state = seedFarm();
    if (r.follow) {
      const f = rec(r.follow);
      state.tasks = [
        {
          id: "legacy-follow-up",
          fieldId: "field-01",
          seasonId: "season-2024-k",
          title: str(f, "action"),
          dueDate: calendarDate(f.date),
          status: f.outcome === "unknown" ? "todo" : "completed",
          outcome: f.outcome as TaskOutcome,
          notes: typeof f.notes === "string" ? f.notes : "",
          observationIds: [],
          events: [],
        },
      ];
    }
    return state;
  }
  if (
    !Array.isArray(r.fields) ||
    !r.fields.length ||
    !Array.isArray(r.seasons) ||
    !r.seasons.length ||
    !Array.isArray(r.tasks)
  )
    throw new Error("Fields, seasons and tasks are required.");
  const fields = r.fields.map(parseField).map((f) =>
      f.id === "field-01" &&
      f.isIllustrative &&
      ((Math.abs(f.location.lat - 11.6643) < 0.001 &&
        Math.abs(f.location.lng - 78.146) < 0.001) ||
        (Math.abs(f.location.lat - 11.5845) < 0.001 &&
          Math.abs(f.location.lng - 78.2915) < 0.001))
        ? {
            ...f,
            locality: "Yethapur, Salem, Tamil Nadu",
            location: { lat: 11.6545, lng: 78.4855 },
            boundary: [
              { lat: 11.654, lng: 78.485 },
              { lat: 11.654, lng: 78.486 },
              { lat: 11.655, lng: 78.486 },
              { lat: 11.655, lng: 78.485 },
            ],
            irrigationSource:
              f.irrigationSource === "Not recorded"
                ? "Canal + borewell (sample)"
                : f.irrigationSource,
          }
        : f,
    ),
    seasons = r.seasons.map(parseSeason);
  if (
    new Set(fields.map((f) => f.id)).size !== fields.length ||
    new Set(seasons.map((s) => s.id)).size !== seasons.length
  )
    throw new Error("Duplicate field or season IDs.");
  for (const s of seasons)
    if (!fields.some((f) => f.id === s.fieldId))
      throw new Error("Season belongs to a missing field.");
  for (const f of fields)
    if (!seasons.some((s) => s.fieldId === f.id))
      throw new Error("Each field needs a crop season.");
  if (
    !fields.some((f) => f.id === r.selectedFieldId) ||
    !seasons.some(
      (s) => s.id === r.selectedSeasonId && s.fieldId === r.selectedFieldId,
    )
  )
    throw new Error("Choose a matching field and crop season.");
  if (!["forest", "earth", "night"].includes(String(r.theme)))
    throw new Error("Unknown app theme.");
  const tasks = r.tasks.map((value) => {
    const t = rec(value);
    const fieldId = str(t, "fieldId"),
      seasonId = str(t, "seasonId");
    if (
      !seasons.some((s) => s.id === seasonId && s.fieldId === fieldId) ||
      !["todo", "in-progress", "completed"].includes(String(t.status)) ||
      !["unknown", "better", "same", "worse"].includes(String(t.outcome)) ||
      typeof t.notes !== "string" ||
      !Array.isArray(t.observationIds) ||
      !t.observationIds.every((id) => typeof id === "string") ||
      !Array.isArray(t.events)
    )
      throw new Error("Invalid task or field/season link.");
    const events = t.events.map((value) => {
      const e = rec(value);
      if (
        !["todo", "in-progress", "completed"].includes(String(e.status)) ||
        !["unknown", "better", "same", "worse"].includes(String(e.outcome)) ||
        typeof e.notes !== "string"
      )
        throw new Error("Invalid task history.");
      return {
        status: e.status as TaskStatus,
        at: timestamp(e.at),
        outcome: e.outcome as TaskOutcome,
        notes: e.notes,
      };
    });
    return {
      id: str(t, "id"),
      fieldId,
      seasonId,
      title: str(t, "title"),
      dueDate: calendarDate(t.dueDate),
      status: t.status as TaskStatus,
      outcome: t.outcome as TaskOutcome,
      notes: t.notes,
      observationIds: t.observationIds as string[],
      events,
      ...(t.createdAt ? { createdAt: timestamp(t.createdAt) } : {}),
      ...(t.updatedAt ? { updatedAt: timestamp(t.updatedAt) } : {}),
      ...(t.completedAt ? { completedAt: timestamp(t.completedAt) } : {}),
    } as FarmTask;
  });
  if (new Set(tasks.map((t) => t.id)).size !== tasks.length)
    throw new Error("Duplicate task IDs.");
  return {
    fields,
    seasons,
    tasks,
    selectedFieldId: r.selectedFieldId as string,
    selectedSeasonId: r.selectedSeasonId as string,
    theme: r.theme as FarmState["theme"],
  };
}
export function addField(
  workspace: Workspace,
  field: FarmField,
  season: FarmSeason,
): Workspace {
  const f = parseField(field),
    s = parseSeason(season);
  if (
    s.fieldId !== f.id ||
    workspace.fields.some((x) => x.id === f.id) ||
    workspace.seasons.some((x) => x.id === s.id)
  )
    throw new Error("Field and season IDs must be new and match.");
  return {
    ...workspace,
    fields: [...workspace.fields, f],
    seasons: [...workspace.seasons, s],
    selectedFieldId: f.id,
    selectedSeasonId: s.id,
  };
}
export function addSeason(workspace: Workspace, season: FarmSeason): Workspace {
  const s = parseSeason(season);
  if (
    !workspace.fields.some((f) => f.id === s.fieldId) ||
    workspace.seasons.some((x) => x.id === s.id)
  )
    throw new Error("Select an existing field and a new season ID.");
  return {
    ...workspace,
    seasons: [...workspace.seasons, s],
    selectedFieldId: s.fieldId,
    selectedSeasonId: s.id,
  };
}
export function updateField(workspace: Workspace, field: FarmField): Workspace {
  const f = parseField(field);
  if (!workspace.fields.some((x) => x.id === f.id))
    throw new Error("Field not found.");
  return {
    ...workspace,
    fields: workspace.fields.map((x) => (x.id === f.id ? f : x)),
  };
}
export function createTask(
  workspace: Workspace,
  input: {
    title: string;
    dueDate: string;
    fieldId: string;
    seasonId: string;
    observationIds?: string[];
  },
  at = new Date(),
): FarmTask {
  if (!input.title.trim()) throw new Error("Enter a task title.");
  calendarDate(input.dueDate);
  if (
    !workspace.seasons.some(
      (s) => s.id === input.seasonId && s.fieldId === input.fieldId,
    )
  )
    throw new Error("Choose a matching field and season.");
  const ids = input.observationIds || [];
  if (
    ids.some(
      (id) =>
        !workspace.obs.some(
          (o) =>
            o.id === id &&
            o.fieldId === input.fieldId &&
            o.seasonId === input.seasonId,
        ),
    )
  )
    throw new Error(
      "Linked observations must belong to this field and season.",
    );
  return {
    id: crypto.randomUUID(),
    ...input,
    title: input.title.trim(),
    status: "todo",
    outcome: "unknown",
    notes: "",
    observationIds: ids,
    createdAt: at,
    updatedAt: at,
    events: [{ status: "todo", at, outcome: "unknown", notes: "" }],
  };
}
export function changeTask(
  task: FarmTask,
  status: TaskStatus,
  outcome: TaskOutcome,
  notes: string,
  at = new Date(),
): FarmTask {
  if (
    !["todo", "in-progress", "completed"].includes(status) ||
    !["unknown", "better", "same", "worse"].includes(outcome) ||
    !Number.isFinite(+at)
  )
    throw new Error("Invalid task status, outcome or time.");
  if (status === "completed" && !notes.trim())
    throw new Error("Add a short completion note before finishing the task.");
  return {
    ...task,
    status,
    outcome,
    notes: notes.trim(),
    updatedAt: at,
    completedAt: status === "completed" ? at : undefined,
    events: [...task.events, { status, at, outcome, notes: notes.trim() }],
  };
}
export function fieldPoints(field: FarmField): ScoutingPoint[] {
  let lat = field.location.lat,
    lng = field.location.lng;
  const latSpan = field.boundary.length
    ? Math.max(...field.boundary.map((p) => p.lat)) -
      Math.min(...field.boundary.map((p) => p.lat))
    : 0.0008;
  const lngSpan = field.boundary.length
    ? Math.max(...field.boundary.map((p) => p.lng)) -
      Math.min(...field.boundary.map((p) => p.lng))
    : 0.0008;
  if (field.boundary.length) {
    lat =
      (Math.max(...field.boundary.map((p) => p.lat)) +
        Math.min(...field.boundary.map((p) => p.lat))) /
      2;
    lng =
      (Math.max(...field.boundary.map((p) => p.lng)) +
        Math.min(...field.boundary.map((p) => p.lng))) /
      2;
  }
  return ["NW", "NE", "SW", "SE"].map((q, i) => ({
    id: `pt-${i + 1}`,
    fieldId: field.id,
    position: i + 1,
    quadrat: `${q} check point`,
    coordinates: {
      lat: lat + (i < 2 ? 1 : -1) * latSpan * 0.25,
      lng: lng + (i % 2 ? 1 : -1) * lngSpan * 0.25,
    },
  }));
}
export function importBoundary(json: string): Coordinate[] {
  if (json.length > 1000000)
    throw new Error("Choose a GeoJSON boundary smaller than 1 MB.");
  const data = JSON.parse(json);
  const geometry =
    data.type === "FeatureCollection"
      ? data.features?.find(
          (f: { geometry?: { type?: string } }) =>
            f.geometry?.type === "Polygon",
        )?.geometry
      : data.type === "Feature"
        ? data.geometry
        : data;
  if (
    !geometry ||
    geometry.type !== "Polygon" ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length !== 1
  )
    throw new Error("Choose one Polygon without holes.");
  const ring = geometry.coordinates[0];
  if (
    !Array.isArray(ring) ||
    ring.some((p: unknown) => !Array.isArray(p) || p.length < 2)
  )
    throw new Error("Invalid polygon coordinates.");
  const points = ring.map((p: number[]) =>
    coordinate({ lat: p[1], lng: p[0] }),
  );
  if (
    points.length > 1 &&
    points[0].lat === points.at(-1)?.lat &&
    points[0].lng === points.at(-1)?.lng
  )
    points.pop();
  return validateBoundary(points);
}
export function boundaryGeoJSON(field: FarmField): string {
  const points = validateBoundary(field.boundary);
  if (points.length < 3) throw new Error("This field has no boundary yet.");
  const ring = [...points, points[0]].map((p) => [p.lng, p.lat]);
  return JSON.stringify(
    {
      type: "Feature",
      properties: {
        name: field.name,
        source: field.isIllustrative
          ? "Illustrative sample"
          : "Entered by user",
        areaNote: "Boundary and area require field verification",
      },
      geometry: { type: "Polygon", coordinates: [ring] },
    },
    null,
    2,
  );
}
