import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorkspace,
  exportBackup,
  parseBackup,
} from "../src/services/workspace.ts";
import { farmDashboard } from "../src/services/dashboard.ts";
import { parseSeason } from "../src/services/farm.ts";

test("dashboard separates growing areas and planting records, excluding examples by default", () => {
  const w = createWorkspace("A", []);
  assert.equal(farmDashboard(w, "2026-11-21").fields.length, 0);
  for (const [id, crop] of [
    ["wheat-area", "wheat"],
    ["tree-area", "coconut"],
  ] as const) {
    w.fields.push({ ...w.fields[0], id, name: id, isIllustrative: false });
    w.seasons.push({
      ...w.seasons[0],
      id: `${id}-planting`,
      fieldId: id,
      crop,
      isIllustrative: false,
    });
  }
  w.tasks = [
    {
      id: "job",
      fieldId: "tree-area",
      seasonId: "tree-area-planting",
      title: "Check trees",
      dueDate: "2026-11-20",
      status: "todo",
      observationIds: [],
      outcome: "unknown",
      notes: "",
      events: [],
    },
  ];
  w.visits = [
    {
      id: "visit",
      fieldId: "wheat-area",
      seasonId: "wheat-area-planting",
      observedAt: new Date("2026-11-21T12:00:00"),
      recordedAt: new Date("2026-11-21T12:00:00"),
      observationIds: [],
      isIllustrative: false,
    },
  ];
  const result = farmDashboard(w, "2026-11-21");
  assert.equal(result.fields.length, 2);
  assert.equal(result.totalAreaHa, 2.4);
  assert.equal(result.cropBreakdown.length, 2);
  assert.equal(result.observationsSummary.totalPoints, 0);
  assert.equal(
    result.fields.find((f) => f.field.id === "tree-area")?.status,
    "Work overdue",
  );
  assert.equal(
    result.fields.find((f) => f.field.id === "wheat-area")?.overdue,
    0,
  );
  assert.equal(result.overdue, 1);
  assert.equal(
    result.weekly.reduce((sum, week) => sum + week.count, 0),
    1,
  );
  assert.ok(result.fields.every((f) => !f.photo));
  w.seasons.push({ ...w.seasons.at(-1)!, id: "new-tree-planting" });
  assert.equal(farmDashboard(w, "2026-11-21").overdue, 0);
  w.selectedFieldId = "tree-area";
  w.selectedSeasonId = "tree-area-planting";
  assert.equal(farmDashboard(w, "2026-11-21").overdue, 1);
});

test("ongoing plantings preserve unknown dates in backups without weakening seasonal planting checks", () => {
  const w = createWorkspace("A", []);
  const planting = { ...w.seasons[0], sowingDate: "", expectedHarvestDate: "" };
  for (const crop of ["coconut", "garden-plants"]) {
    w.seasons[0] = parseSeason({ ...planting, crop });
    assert.equal(parseBackup(exportBackup(w)).seasons[0].sowingDate, "");
  }
  assert.throws(() => parseSeason({ ...planting, crop: "wheat" }));
  assert.equal(
    parseSeason({ ...planting, crop: "wheat", sowingDate: "2026-11-01" })
      .expectedHarvestDate,
    "",
  );
});
