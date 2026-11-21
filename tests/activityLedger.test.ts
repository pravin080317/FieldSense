import test from "node:test";
import assert from "node:assert/strict";
import {
  activityLedger,
  activityCsv,
  costPaise,
} from "../src/services/activityLedger.ts";
import type { DiaryEntry } from "../src/types/workspace.ts";
const entry = (
  id: string,
  cost: string,
  patch: Partial<DiaryEntry> = {},
): DiaryEntry => ({
  id,
  cost,
  fieldId: "f",
  seasonId: "s",
  type: "Irrigation",
  date: "2026-11-20",
  notes: "North patch",
  ...patch,
});
test("recorded costs use integer paise and separate missing, zero and invalid costs", () => {
  const result = activityLedger(
    [
      entry("1", "0.10"),
      entry("2", "0.20"),
      entry("3", "0"),
      entry("4", ""),
      entry("5", "1.234"),
    ],
    "f",
    "s",
  );
  assert.equal(result.totalPaise, 30);
  assert.equal(result.withCost, 3);
  assert.equal(result.missing, 1);
  assert.equal(result.invalid, 1);
  assert.equal(result.groups[0].totalPaise, 30);
});
test("ledger isolates field and season and respects inclusive date/activity filters without mutation", () => {
  const rows = [
    entry("late", "20", { date: "2026-11-21" }),
    entry("early", "10"),
    entry("wrong", "999", { seasonId: "old" }),
    entry("other", "999", { fieldId: "other" }),
    entry("task", "40", { type: "Soil sampling" }),
  ];
  const result = activityLedger(rows, "f", "s", {
    from: "2026-11-20",
    to: "2026-11-20",
    type: "Irrigation",
  });
  assert.equal(result.totalPaise, 1000);
  assert.deepEqual(
    result.rows.map((r) => r.id),
    ["early"],
  );
  assert.equal(rows[0].id, "late");
  assert.throws(() =>
    activityLedger(rows, "f", "s", { from: "2026-11-21", to: "2026-11-20" }),
  );
});
test("legacy unscoped records belong to sample scope and totals reject overflow", () => {
  assert.equal(
    activityLedger(
      [entry("old", "2", { fieldId: undefined, seasonId: undefined })],
      "field-01",
      "season-2024-k",
    ).totalPaise,
    200,
  );
  for (const value of ["-1", "NaN", "Infinity", "1e3", " ", "9007199254740991"])
    assert.equal(costPaise(value), null);
  assert.throws(
    () =>
      activityLedger(
        [entry("1", "90071992547409.90"), entry("2", "1")],
        "f",
        "s",
      ),
    /supported total/,
  );
});
test("CSV preserves notes and missing costs while neutralising spreadsheet formula text", () => {
  const csv = activityCsv(
    [
      entry("1", "", { notes: '=HYPERLINK("bad")\nsecond line' }),
      entry("2", "0", { type: "@formula" }),
    ],
    "+Field",
    "Season, 1",
  );
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"\'+Field"'));
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(csv.includes('"Season, 1"'));
  assert.ok(csv.includes('"Not entered"'));
  assert.ok(csv.includes("'@formula"));
  assert.ok(csv.includes('"0","Entered"'));
});
