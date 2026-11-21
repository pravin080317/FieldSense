import { test } from "node:test";
import assert from "node:assert/strict";
import { indexedDB } from "fake-indexeddb";
import {
  createWorkspace,
  newObservation,
  appendObservation,
  parseWorkspace,
  exportBackup,
  parseBackup,
  mergeBackup,
} from "../src/services/workspace.ts";
import {
  addField,
  addSeason,
  updateField,
  createTask,
  changeTask,
  seedFarm,
  parseField,
  parseSeason,
  coordinate,
  calendarDate,
  validateBoundary,
  importBoundary,
  boundaryGeoJSON,
  boundaryArea,
  fieldPoints,
} from "../src/services/farm.ts";
import { WorkspaceRepository } from "../src/services/WorkspaceRepository.ts";
import { EvidenceEngine } from "../src/services/EvidenceEngine.ts";
import type { FarmField, FarmSeason } from "../src/types/farm.ts";
import type { Field } from "../src/types/domain.ts";
const seed = () => createWorkspace("A", []);
const field = (id = "own-field"): FarmField => ({
  ...structuredClone(seedFarm().fields[0]),
  id,
  name: "Paddy Field 02",
  isIllustrative: false,
  irrigationSource: "Borewell",
});
const season = (fieldId = "own-field", id = "own-season"): FarmSeason => ({
  id,
  fieldId,
  name: "Rice season 2026",
  crop: "rice",
  variety: "Ponni",
  sowingDate: "2026-07-01",
  expectedHarvestDate: "2026-12-01",
  growthStage: "vegetative",
  isIllustrative: false,
});

test("version 3 migrates field/season metadata and the existing follow-up without removing evidence", () => {
  const old: any = {
    schemaVersion: 3,
    scenario: "A",
    obs: [],
    visits: [],
    photos: [],
    entries: [],
    report: "scenario",
    rain: 48,
    reviewDate: "2024-10-19",
    follow: {
      action: "Check drainage",
      date: "2024-10-21",
      outcome: "same",
      notes: "No change",
    },
  };
  const w = parseWorkspace(old);
  assert.equal(w.schemaVersion, 4);
  assert.equal(w.fields[0].name, "Paddy Field 01");
  assert.equal(w.tasks[0].title, "Check drainage");
  assert.equal(w.tasks[0].status, "completed");
  assert.equal(w.tasks[0].createdAt, undefined);
  assert.deepEqual(w.follow, old.follow);
});
test("field creation and a second season keep the previous field and season", () => {
  let w = addField(seed(), field(), season());
  assert.equal(w.fields.length, 2);
  assert.equal(w.seasons.length, 2);
  assert.equal(w.selectedFieldId, "own-field");
  w = addSeason(w, season("own-field", "second-season"));
  assert.equal(w.seasons.length, 3);
  assert.equal(w.selectedSeasonId, "second-season");
  assert.equal(w.seasons[1].id, "own-season");
  w = updateField(w, { ...field(), name: "North Paddy" });
  assert.equal(w.fields.find((f) => f.id === "own-field")?.name, "North Paddy");
  assert.equal(w.fields[0].id, "field-01");
});
test("invalid coordinates, dates, area, season links and duplicate fields are rejected", () => {
  assert.throws(() => coordinate({ lat: 91, lng: 78 }));
  assert.throws(() => coordinate({ lat: 11, lng: NaN }));
  assert.throws(() => calendarDate("2026-02-31"));
  assert.throws(() => parseField({ ...field(), areaHectares: 0 }));
  assert.throws(() =>
    parseSeason({ ...season(), expectedHarvestDate: "2026-01-01" }),
  );
  assert.throws(() => addField(seed(), field(), season("other-field")));
  const w = addField(seed(), field(), season());
  assert.throws(() => addField(w, field(), season()));
  assert.throws(() => addSeason(w, season("missing", "new")));
});
test("new observations use the selected field and season and cannot link to another season", () => {
  let w = addField(seed(), field(), season());
  const first = newObservation(
    undefined,
    { leafColor: "yellowing", soilCondition: "waterlogged" },
    "pt-1",
    new Date("2026-11-20T09:00:00Z"),
    new Date("2026-11-20T09:01:00Z"),
    { fieldId: "own-field", seasonId: "own-season" },
  );
  w = appendObservation(w, first);
  w = addSeason(w, season("own-field", "second-season"));
  const second = newObservation(
    undefined,
    { leafColor: "normal", soilCondition: "dry" },
    "pt-1",
    new Date("2026-11-20T10:00:00Z"),
    new Date("2026-11-20T10:01:00Z"),
    { fieldId: "own-field", seasonId: "second-season" },
  );
  w = appendObservation(w, second);
  assert.equal(parseWorkspace(w).obs.length, 2);
  const context = {
    id: "own-field",
    season: {
      id: "second-season",
      expectedHarvestDate: new Date("2026-12-01"),
    },
  } as Field;
  const result = EvidenceEngine.analyze(
    context,
    w.obs,
    [],
    [],
    new Date("2026-11-20T12:00:00Z"),
  );
  assert.notEqual(
    result.explanations.find((e) => e.id === "waterlogging")?.status,
    "supported",
  );
  assert.throws(() =>
    createTask(w, {
      title: "Wrong link",
      dueDate: "2026-11-21",
      fieldId: "own-field",
      seasonId: "second-season",
      observationIds: [first.id],
    }),
  );
});
test("multiple tasks retain statuses, completion results and reopen history", () => {
  let w = addField(seed(), field(), season());
  const a = createTask(w, {
    title: "Check roots",
    dueDate: "2026-11-21",
    fieldId: "own-field",
    seasonId: "own-season",
  });
  const b = createTask(w, {
    title: "Arrange water test",
    dueDate: "2026-11-22",
    fieldId: "own-field",
    seasonId: "own-season",
  });
  w = { ...w, tasks: [a, b] };
  assert.equal(parseWorkspace(w).tasks.length, 2);
  assert.throws(() => changeTask(a, "completed", "better", ""));
  const started = changeTask(a, "in-progress", "unknown", "Started checking");
  const done = changeTask(
    started,
    "completed",
    "better",
    "Leaves looked better at the same point",
  );
  const reopened = changeTask(done, "todo", "unknown", "Needs another visit");
  assert.equal(done.status, "completed");
  assert.ok(done.completedAt);
  assert.equal(reopened.events.length, 4);
  assert.equal(reopened.events[2].outcome, "better");
  assert.equal(reopened.completedAt, undefined);
  assert.equal(b.status, "todo");
});
test("GeoJSON imports valid polygon coordinates and rejects unsafe geometry", () => {
  const original = field();
  const read = importBoundary(boundaryGeoJSON(original));
  assert.deepEqual(read, original.boundary);
  assert.ok(boundaryArea(read) > 1 && boundaryArea(read) < 1.4);
  assert.throws(() => importBoundary("{bad"));
  assert.throws(() =>
    importBoundary(JSON.stringify({ type: "Point", coordinates: [78, 11] })),
  );
  assert.throws(() =>
    validateBoundary([
      { lat: 11, lng: 78 },
      { lat: 11, lng: 78 },
    ]),
  );
  assert.throws(() =>
    validateBoundary([
      { lat: 11, lng: 78 },
      { lat: 12, lng: 79 },
      { lat: 11, lng: 79 },
      { lat: 12, lng: 78 },
    ]),
  );
  assert.equal(fieldPoints(original).length, 4);
});
test("v4 backups retain user fields, seasons, scoped images/diary, multiple tasks and theme", () => {
  let w = addField(seed(), field(), season());
  w.theme = "night";
  w.tasks = [
    createTask(w, {
      title: "Inspect",
      dueDate: "2026-11-21",
      fieldId: "own-field",
      seasonId: "own-season",
    }),
  ];
  w.photos = [
    {
      id: "p",
      fieldId: "own-field",
      seasonId: "own-season",
      point: "pt-1",
      kind: "whole plant",
      url: "data:image/png;base64,YQ==",
    },
  ];
  w.entries = [
    {
      id: "e",
      fieldId: "own-field",
      seasonId: "own-season",
      type: "Irrigation",
      date: "2026-11-20",
      notes: "Field watered",
      cost: "50",
    },
  ];
  const backup = parseBackup(exportBackup(w));
  assert.deepEqual(backup, parseWorkspace(w));
  const current = seed();
  const merged = mergeBackup(current, backup);
  assert.equal(merged.fields.length, 2);
  assert.equal(merged.tasks.length, 1);
  assert.equal(merged.theme, "forest");
  assert.equal(merged.selectedFieldId, "field-01");
  assert.equal(mergeBackup(merged, backup).tasks.length, 1);
});
test("invalid field/season, photo and task references are rejected before saving", () => {
  const w = seed();
  assert.throws(() => parseWorkspace({ ...w, selectedSeasonId: "missing" }));
  assert.throws(() => parseWorkspace({ ...w, theme: "invalid" }));
  assert.throws(() =>
    parseWorkspace({
      ...w,
      entries: [
        {
          id: "e",
          fieldId: "missing",
          seasonId: "missing",
          type: "Irrigation",
          date: "2026-11-20",
          notes: "test",
          cost: "",
        },
      ],
    }),
  );
  const t = createTask(w, {
    title: "Inspect",
    dueDate: "2026-11-21",
    fieldId: "field-01",
    seasonId: "season-2024-k",
  });
  assert.throws(() =>
    parseWorkspace({ ...w, tasks: [{ ...t, observationIds: ["missing"] }] }),
  );
});
test("IndexedDB persists the multi-field workspace and theme across reopen", async () => {
  const name = crypto.randomUUID();
  const a = new WorkspaceRepository(indexedDB, name);
  await a.load({ getItem: () => null }, seed);
  let w = addField(seed(), field(), season());
  w.theme = "earth";
  w.tasks = [
    createTask(w, {
      title: "Inspect",
      dueDate: "2026-11-21",
      fieldId: "own-field",
      seasonId: "own-season",
    }),
  ];
  await a.save(w);
  const b = new WorkspaceRepository(indexedDB, name);
  const reopened = (await b.load({ getItem: () => null }, seed)).workspace;
  assert.equal(reopened.fields.length, 2);
  assert.equal(reopened.selectedFieldId, "own-field");
  assert.equal(reopened.theme, "earth");
  assert.equal(reopened.tasks.length, 1);
});
