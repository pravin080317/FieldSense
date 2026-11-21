import test from "node:test";
import assert from "node:assert/strict";
import { crops } from "../src/data/crops.ts";
import {
  createWorkspace,
  exportBackup,
  parseBackup,
} from "../src/services/workspace.ts";
import { parseSeason } from "../src/services/farm.ts";
import { EvidenceEngine } from "../src/services/EvidenceEngine.ts";
import type { Field, Observation } from "../src/types/domain.ts";

test("all listed crops preserve their season identity through backup without changing old rice records", () => {
  const w = createWorkspace("A", []);
  for (const crop of crops)
    w.seasons.push(
      parseSeason({
        ...w.seasons[0],
        id: `season-${crop.id}`,
        crop: crop.id,
        isIllustrative: false,
      }),
    );
  const restored = parseBackup(exportBackup(w));
  assert.deepEqual(
    restored.seasons.map((s) => s.crop),
    w.seasons.map((s) => s.crop),
  );
  assert.equal(restored.seasons[0].crop, "rice");
  assert.throws(() => parseSeason({ ...w.seasons[0], crop: "unsupported" }));
});
test("rice review rules abstain for other crops even with strong-looking rice symptom inputs", () => {
  const season = {
    id: "s",
    fieldId: "f",
    year: 2026,
    season: "custom" as const,
    sowingDate: new Date("2026-06-01"),
    expectedHarvestDate: new Date("2026-12-01"),
  };
  const observation: Observation = {
    id: "o",
    fieldId: "f",
    seasonId: "s",
    scoutingPointId: "pt-1",
    observedAt: new Date("2026-11-20"),
    recordedAt: new Date("2026-11-20"),
    source: "farmer",
    verificationStatus: "observed",
    isIllustrative: false,
    leafColor: "yellowing",
    leafLocation: "lower",
    soilCondition: "waterlogged",
  };
  for (const crop of crops.filter((c) => c.id !== "rice")) {
    const field: Field = {
      id: "f",
      name: "Field",
      location: { lat: 11, lng: 78 },
      areaHectares: 1,
      cropId: crop.id,
      cropType: crop.name,
      season,
    };
    const result = EvidenceEngine.analyze(
      field,
      [observation],
      [],
      [],
      new Date("2026-11-21"),
    );
    assert.equal(result.explanations.length, 0);
    assert.match(result.summaryPlainLanguage, /rice review rules are not used/);
  }
  const rice: Field = {
    id: "f",
    name: "Field",
    location: { lat: 11, lng: 78 },
    areaHectares: 1,
    cropId: "rice",
    cropType: "Rice",
    season,
  };
  assert.ok(
    EvidenceEngine.analyze(rice, [observation], [], [], new Date("2026-11-21"))
      .explanations.length > 0,
  );
});
