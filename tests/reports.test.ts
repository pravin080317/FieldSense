import test from "node:test";
import assert from "node:assert/strict";
import { indexedDB } from "fake-indexeddb";
import { WorkspaceRepository } from "../src/services/WorkspaceRepository.ts";
import { parseReports } from "../src/services/reports.ts";
import {
  createWorkspace,
  parseWorkspace,
  exportBackup,
  parseBackup,
  mergeBackup,
} from "../src/services/workspace.ts";

import type { FieldReport } from "../src/types/reports.ts";

const seed = () => createWorkspace("A", []);
test("entered reports survive database reopen", async () => {
  const name = `reports-${crypto.randomUUID()}`;
  const repo = new WorkspaceRepository(indexedDB, name);
  const loaded = await repo.load({ getItem: () => null }, seed);
  loaded.workspace.fieldReports = [report()];
  await repo.save(loaded.workspace);
  const reopened = await new WorkspaceRepository(indexedDB, name).load(
    { getItem: () => null },
    seed,
  );
  assert.deepEqual(reopened.workspace.fieldReports, [report()]);
});
const report = (): FieldReport => ({
  id: "report1",
  fieldId: "field-01",
  seasonId: "season-2024-k",
  kind: "soil",
  sampledOn: "2024-10-10",
  reportedOn: "2024-10-12",
  recordedAt: "2024-10-13T12:00:00.000Z",
  sourceName: "Example lab",
  sampleLocation: "North patch, 0–15 cm",
  reference: "LAB-1",
  notes: "Original kept on paper",
  interpretation: "Review with agronomist",
  verification: "farmer-entered",
  measurements: [
    { label: "pH", value: 6.5, unit: "pH" },
    { label: "N", value: 120, unit: "kg/ha" },
  ],
});
test("older workspaces open with an empty report collection", () => {
  const w = seed();
  const { fieldReports: _, ...old } = w;
  assert.deepEqual(parseWorkspace(old).fieldReports, []);
});
test("soil and water reports preserve printed values, units and provenance through backup merge", () => {
  const w = seed();
  w.fieldReports = [
    report(),
    {
      ...report(),
      id: "water1",
      kind: "water",
      measurements: [{ label: "EC", value: 1.2, unit: "dS/m" }],
    },
  ];
  const copy = parseBackup(exportBackup(w));
  assert.deepEqual(copy.fieldReports, w.fieldReports);
  assert.equal(mergeBackup(seed(), copy).fieldReports.length, 2);
  assert.equal(mergeBackup(copy, copy).fieldReports.length, 2);
  const conflict = structuredClone(copy);
  conflict.fieldReports[0].notes = "changed";
  assert.throws(() => mergeBackup(copy, conflict), /Conflicting/);
});
test("invalid report dates, values, units, provenance and context are rejected", () => {
  const seasons = seed().seasons;
  for (const patch of [
    { sampledOn: "2024-02-31" },
    { reportedOn: "2024-10-09" },
    { reportedOn: "2025-01-01" },
    { seasonId: "missing" },
    { fieldId: "other" },
    { verification: "verified" },
    { sourceName: " " },
    { measurements: [] },
    { measurements: [{ label: "pH", value: 15, unit: "pH" }] },
    { measurements: [{ label: "N", value: Infinity, unit: "ppm" }] },
    { measurements: [{ label: "N", value: -1, unit: "ppm" }] },
    { measurements: [{ label: "N", value: 5, unit: "" }] },
  ])
    assert.throws(() => parseReports([{ ...report(), ...patch }], seasons));
  assert.throws(() => parseReports([report(), report()], seasons));
});
