import test from "node:test";
import assert from "node:assert/strict";
import { compareVisits, pointVisits } from "../src/services/comparison.ts";
import type { Observation } from "../src/types/domain.ts";
import {
  createWorkspace,
  parseWorkspace,
  exportBackup,
  parseBackup,
} from "../src/services/workspace.ts";

test("visit-linked photos retain provenance in backups and reject broken links", () => {
  const w = createWorkspace("A", []);
  w.obs = [
    visit("photo-visit", { fieldId: "field-01", seasonId: "season-2024-k" }),
  ];
  w.visits = [
    {
      id: "v",
      fieldId: "field-01",
      seasonId: "season-2024-k",
      observedAt: w.obs[0].observedAt,
      recordedAt: w.obs[0].recordedAt,
      observationIds: ["photo-visit"],
      isIllustrative: false,
    },
  ];
  w.obs[0].visitId = "v";
  w.photos = [
    {
      id: "photo",
      point: "pt-1",
      kind: "Visit evidence",
      fieldId: "field-01",
      seasonId: "season-2024-k",
      observationId: "photo-visit",
      url: "data:image/png;base64,YQ==",
      recordedAt: new Date(),
    },
  ];
  assert.equal(
    parseBackup(exportBackup(w)).photos[0].observationId,
    "photo-visit",
  );
  assert.throws(() =>
    parseWorkspace({
      ...w,
      photos: [{ ...w.photos[0], observationId: "missing" }],
    }),
  );
  assert.throws(() =>
    parseWorkspace({ ...w, photos: [{ ...w.photos[0], point: "pt-2" }] }),
  );
});

const visit = (id: string, patch: Partial<Observation> = {}): Observation => ({
  id,
  fieldId: "field",
  seasonId: "season",
  scoutingPointId: "pt-1",
  observedAt: new Date("2026-11-19T10:00:00Z"),
  recordedAt: new Date("2026-11-19T11:00:00Z"),
  source: "farmer",
  verificationStatus: "observed",
  isIllustrative: false,
  ...patch,
});
test("comparison keeps zero counts distinct from missing values and rounds numeric changes", () => {
  const rows = compareVisits(
    visit("a", { visiblePestCount: 3, plantHeight: 20.1 }),
    visit("b", { visiblePestCount: 0, plantHeight: 20.4 }),
  );
  assert.equal(rows.find((r) => r.label === "Insects counted")?.change, "-3");
  assert.equal(rows.find((r) => r.label === "Insects counted")?.later, "0");
  assert.equal(rows.find((r) => r.label === "Plant height")?.change, "+0.3 cm");
  assert.equal(
    rows.find((r) => r.label === "Tillers counted")?.change,
    "Cannot compare",
  );
});
test("comparison describes categorical changes without diagnosing improvement", () => {
  const rows = compareVisits(
    visit("a", { leafColor: "yellowing", soilCondition: "moist" }),
    visit("b", { leafColor: "normal", soilCondition: "moist" }),
  );
  assert.equal(rows[0].change, "Changed");
  assert.equal(
    rows.find((r) => r.label === "Soil condition")?.change,
    "No recorded change",
  );
});
test("cross-field, season, point, duplicate and reversed comparisons are rejected", () => {
  const a = visit("a");
  for (const b of [
    visit("a"),
    visit("b", { fieldId: "other" }),
    visit("b", { seasonId: "other" }),
    visit("b", { scoutingPointId: "pt-2" }),
    visit("b", { scoutingPointId: undefined }),
    visit("b", { observedAt: new Date("2026-11-18") }),
    visit("b", { recordedAt: new Date("2026-11-19T10:30:00Z") }),
  ])
    assert.throws(() => compareVisits(a, b));
});
test("point histories isolate context, sort same-time visits by recording time and do not mutate history", () => {
  const first = visit("first"),
    second = visit("second", { recordedAt: new Date("2026-11-19T12:00:00Z") });
  const records = [
    second,
    visit("other", { seasonId: "old" }),
    first,
    visit("different", { scoutingPointId: "pt-2" }),
  ];
  assert.deepEqual(
    pointVisits(records, "field", "season", "pt-1").map((o) => o.id),
    ["first", "second"],
  );
  assert.equal(records[0].id, "second");
});
