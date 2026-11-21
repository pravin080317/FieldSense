import { test } from "node:test";
import assert from "node:assert/strict";
import { indexedDB, IDBDatabase } from "fake-indexeddb";
import { WorkspaceRepository } from "../src/services/WorkspaceRepository.ts";
import {
  createWorkspace,
  appendObservation,
  newObservation,
  latestObservations,
  historyNewestFirst,
  exportBackup,
  parseBackup,
  mergeBackup,
  LEGACY_KEY,
} from "../src/services/workspace.ts";
import { EvidenceEngine } from "../src/services/EvidenceEngine.ts";
import type { Observation, Field } from "../src/types/domain.ts";
const original: Observation = {
  id: "original",
  fieldId: "field-01",
  seasonId: "season-2024-k",
  scoutingPointId: "pt-1",
  observedAt: new Date("2024-10-18T10:00:00Z"),
  recordedAt: new Date("2024-10-18T10:01:00Z"),
  source: "farmer",
  verificationStatus: "observed",
  isIllustrative: true,
  leafColor: "yellowing",
  soilCondition: "waterlogged",
};
const seed = () => createWorkspace("A", [original]);
const noLegacy = { getItem: () => null };
const repo = () => new WorkspaceRepository(indexedDB, crypto.randomUUID());
const field = {
  id: "field-01",
  season: { id: "season-2024-k", expectedHarvestDate: new Date("2024-11-15") },
} as Field;

test("migration preserves every legacy collection and leaves the old key intact", async () => {
  const r = repo();
  let reads = 0;
  const legacy = {
    scenario: "A",
    obs: [original],
    photos: [],
    entries: [
      {
        id: "entry",
        type: "Irrigation",
        date: "2024-10-18",
        notes: "Irrigated NW point",
        cost: "10",
      },
    ],
    follow: {
      action: "Inspect",
      date: "2024-10-21",
      outcome: "unknown",
      notes: "",
    },
    report: "wrong",
    rain: 42,
  };
  const json = JSON.stringify(legacy);
  const storage = {
    getItem: (key: string) => {
      assert.equal(key, LEGACY_KEY);
      reads++;
      return json;
    },
  };
  const result = await r.load(storage, seed);
  assert.equal(result.migrated, true);
  assert.equal(result.workspace.obs[0].id, "original");
  assert.equal(result.workspace.visits[0].observationIds[0], "original");
  assert.equal(result.workspace.entries[0].notes, "Irrigated NW point");
  assert.equal(result.workspace.report, "wrong");
  assert.equal(result.workspace.rain, 42);
  assert.equal(result.workspace.follow?.action, "Inspect");
  const reopened = await r.load(storage, seed);
  assert.equal(reads, 1);
  assert.equal(reopened.migrated, false);
  assert.deepEqual(reopened.workspace, result.workspace);
});
test("invalid legacy data is not overwritten by an illustrative seed", async () => {
  const r = repo();
  await assert.rejects(r.load({ getItem: () => "{bad" }, seed));
  let seeded = false;
  const valid = await r.load(noLegacy, () => {
    seeded = true;
    return seed();
  });
  assert.equal(seeded, true);
  assert.equal(valid.workspace.obs[0].id, "original");
});
test("a second visit survives database reload without erasing the first", async () => {
  const r = repo();
  const first = await r.load(noLegacy, seed);
  const saved = newObservation(
    original,
    { soilCondition: "dry", leafColor: "normal" },
    "pt-1",
    new Date("2026-11-20T09:00:00Z"),
    new Date("2026-11-20T09:01:00Z"),
  );
  const next = appendObservation(first.workspace, saved);
  await r.save(next);
  const reopened = (await r.load(noLegacy, seed)).workspace;
  assert.equal(reopened.obs.length, 2);
  assert.equal(reopened.visits.length, 2);
  assert.equal(reopened.obs[0].soilCondition, "waterlogged");
  assert.notEqual(reopened.obs[1].id, reopened.obs[0].id);
  assert.notEqual(reopened.visits[0].id, reopened.visits[1].id);
  assert.equal(
    reopened.obs[1].observedAt.toISOString(),
    "2026-11-20T09:00:00.000Z",
  );
  assert.equal(
    reopened.obs[1].recordedAt.toISOString(),
    "2026-11-20T09:01:00.000Z",
  );
  assert.equal(
    latestObservations(reopened.obs, new Date("2026-11-20T10:00:00Z"))[0].id,
    saved.id,
  );
});
test("engine uses the latest visit without deleting or mixing old seasons", () => {
  const later = newObservation(
    original,
    { soilCondition: "dry", leafColor: "normal" },
    "pt-1",
    new Date("2024-10-19T10:00:00Z"),
    new Date("2024-10-19T10:01:00Z"),
  );
  const obs = [
    original,
    later,
    {
      ...original,
      id: "other-season",
      seasonId: "different-season",
      observedAt: new Date("2024-10-19T11:00:00Z"),
    },
  ];
  const a = EvidenceEngine.analyze(
    field,
    obs,
    [],
    [],
    new Date("2024-10-19T12:00:00Z"),
  );
  assert.notEqual(
    a.explanations.find((e) => e.id === "waterlogging")?.status,
    "supported",
  );
  assert.equal(obs.length, 3);
});
test("observation cannot be future-dated and IDs are unique across saves", () => {
  const now = new Date("2026-11-20T09:00:00Z");
  assert.throws(() =>
    newObservation(original, {}, "pt-1", new Date("2027-01-01"), now),
  );
  assert.throws(() =>
    newObservation(original, {}, "pt-1", new Date("bad"), now),
  );
  const a = newObservation(original, {}, "pt-1", now, now);
  const b = newObservation(original, {}, "pt-1", now, now);
  assert.notEqual(a.id, b.id);
  assert.notEqual(a.visitId, b.visitId);
});
test("backup round trip retains dates, photo provenance, diary and follow-up", () => {
  const w = seed();
  w.photos = [
    {
      id: "photo",
      url: "data:image/png;base64,YQ==",
      point: "pt-1",
      kind: "whole plant",
      recordedAt: new Date("2026-11-20T09:00:00Z"),
      observationId: "original",
    },
  ];
  w.entries = [
    {
      id: "e",
      date: "2024-10-18",
      type: "Scouting",
      notes: "Checked roots",
      cost: "",
    },
  ];
  w.follow = {
    action: "Revisit",
    date: "2024-10-21",
    notes: "",
    outcome: "same",
  };
  assert.deepEqual(parseBackup(exportBackup(w)), w);
});
test("additive restore keeps current records and does not duplicate matching IDs", () => {
  const a = seed();
  const fresh = newObservation(
    original,
    { soilCondition: "dry" },
    "pt-1",
    new Date("2024-10-19"),
    new Date("2024-10-19T10:00:00Z"),
  );
  const b = appendObservation(seed(), fresh);
  const merged = mergeBackup(a, parseBackup(exportBackup(b)));
  assert.equal(merged.obs.length, 2);
  assert.deepEqual(mergeBackup(merged, b), merged);
  assert.equal(a.obs.length, 1);
});
test("bad versions, broken references, invalid dates and conflicting backups are rejected", () => {
  const w = seed();
  for (const mutate of [
    (r: any) => (r.version = 99),
    (r: any) => (r.workspace.obs[0].observedAt = "bad"),
    (r: any) => (r.workspace.visits[0].observationIds = ["missing"]),
    (r: any) => (r.workspace.obs[0].generalNotes = { bad: true }),
  ]) {
    const raw = JSON.parse(exportBackup(w));
    mutate(raw);
    assert.throws(() => parseBackup(JSON.stringify(raw)));
  }
  const b = parseBackup(exportBackup(w));
  b.obs[0].soilCondition = "dry";
  assert.throws(() => mergeBackup(w, b), /Conflicting/);
  assert.equal(w.obs[0].soilCondition, "waterlogged");
  assert.throws(
    () => mergeBackup(w, createWorkspace("B", [original])),
    /another sample case/,
  );
});
test("an aborted transaction leaves the previous snapshot available", async (t) => {
  const r = repo();
  await r.load(noLegacy, seed);
  const transaction = IDBDatabase.prototype.transaction;
  const mock = t.mock.method(
    IDBDatabase.prototype,
    "transaction",
    function (this: IDBDatabase, ...args: Parameters<typeof transaction>) {
      const tx = transaction.apply(this, args);
      if (args[1] === "readwrite") queueMicrotask(() => tx.abort());
      return tx;
    },
  );
  const changed = seed();
  changed.rain = 99;
  await assert.rejects(r.save(changed));
  mock.mock.restore();
  assert.equal((await r.load(noLegacy, seed)).workspace.rain, 48);
  await r.save(changed);
  assert.equal((await r.load(noLegacy, seed)).workspace.rain, 99);
});
test("queued writes persist the newest snapshot", async () => {
  const r = repo();
  await r.load(noLegacy, seed);
  const a = seed(),
    b = seed();
  a.rain = 12;
  b.rain = 17;
  await Promise.all([r.save(a), r.save(b)]);
  assert.equal((await r.load(noLegacy, seed)).workspace.rain, 17);
});

test("another tab cannot overwrite records saved after it loaded", async () => {
  const name = crypto.randomUUID();
  const a = new WorkspaceRepository(indexedDB, name),
    b = new WorkspaceRepository(indexedDB, name);
  const initial = (await a.load(noLegacy, seed)).workspace;
  await b.load(noLegacy, seed);
  const newest = appendObservation(
    initial,
    newObservation(
      original,
      { soilCondition: "dry" },
      "pt-1",
      new Date("2024-10-19"),
      new Date("2024-10-19T10:00:00Z"),
    ),
  );
  await a.save(newest);
  await assert.rejects(b.save(initial), /Another tab/);
  assert.equal((await a.load(noLegacy, seed)).workspace.obs.length, 2);
});

test("same-time visits display and evaluate the later recording first without mutating history", () => {
  const first = newObservation(
    original,
    { generalNotes: "first recording" },
    "pt-1",
    new Date("2026-11-20T09:00:00Z"),
    new Date("2026-11-20T09:01:00Z"),
  );
  const second = newObservation(
    original,
    { generalNotes: "later recording" },
    "pt-1",
    new Date("2026-11-20T09:00:00Z"),
    new Date("2026-11-20T09:02:00Z"),
  );
  const history = [first, second];
  assert.equal(historyNewestFirst(history)[0].id, second.id);
  assert.equal(
    latestObservations(history, new Date("2026-11-20T10:00:00Z"))[0].id,
    second.id,
  );
  assert.equal(history[0].id, first.id);
});
