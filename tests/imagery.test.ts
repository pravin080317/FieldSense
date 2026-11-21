import test from "node:test";
import assert from "node:assert/strict";
import { indexedDB } from "fake-indexeddb";
import { parseImagery, imageryOverlapsField } from "../src/services/imagery.ts";
import {
  createWorkspace,
  parseWorkspace,
  exportBackup,
  parseBackup,
  mergeBackup,
} from "../src/services/workspace.ts";
import { WorkspaceRepository } from "../src/services/WorkspaceRepository.ts";
import type { FieldImagery } from "../src/types/imagery.ts";
const seed = () => createWorkspace("A", []);
const image = (): FieldImagery => ({
  id: "image1",
  fieldId: "field-01",
  seasonId: "season-2024-k",
  title: "Field export",
  capturedOn: "2026-11-19",
  source: "User map export",
  notes: "Check alignment",
  alignment: "user-entered-bounds",
  bounds: { south: 11.65, west: 78.48, north: 11.66, east: 78.49 },
  file: {
    id: "file1",
    name: "field.png",
    mime: "image/png",
    size: 8,
    dataUrl: "data:image/png;base64,iVBORw0KGgo=",
    attachedAt: "2026-11-20T12:00:00Z",
  },
});
test("old workspaces default imagery to empty and dated layers survive backups and reopen", async () => {
  const w = seed();
  const { imagery: _, ...old } = w;
  assert.deepEqual(parseWorkspace(old).imagery, []);
  w.imagery = [image()];
  assert.deepEqual(parseBackup(exportBackup(w)).imagery, w.imagery);
  assert.equal(mergeBackup(seed(), w).imagery.length, 1);
  assert.equal(mergeBackup(w, w).imagery.length, 1);
  const repo = new WorkspaceRepository(indexedDB, "imagery-test");
  await repo.load({ getItem: () => null }, seed);
  await repo.save(w);
  const reopened = await new WorkspaceRepository(
    indexedDB,
    "imagery-test",
  ).load({ getItem: () => null }, seed);
  assert.deepEqual(reopened.workspace.imagery, w.imagery);
});
test("invalid imagery contexts, dates, bounds, file types and duplicates are rejected", () => {
  const w = seed();
  for (const patch of [
    { fieldId: "missing" },
    { seasonId: "other" },
    { capturedOn: "2026-02-31" },
    { capturedOn: "2027-01-01" },
    { source: "" },
    { alignment: "surveyed" },
    { bounds: { south: 20, north: 10, west: 78, east: 79 } },
    { bounds: { south: 10, north: Infinity, west: 78, east: 79 } },
    { bounds: { south: 10, north: 11, west: 79, east: 78 } },
    {
      file: {
        ...image().file,
        mime: "application/pdf",
        dataUrl: "data:application/pdf;base64," + btoa("%PDF-1"),
        size: 6,
      },
    },
  ])
    assert.throws(() =>
      parseImagery([{ ...image(), ...patch }], w.fields, w.seasons),
    );
  assert.throws(() => parseImagery([image(), image()], w.fields, w.seasons));
  assert.throws(() =>
    parseImagery(
      Array.from({ length: 4 }, (_, i) => ({ ...image(), id: String(i) })),
      w.fields,
      w.seasons,
    ),
  );
});
test("overlap check catches unrelated imagery without discarding layers after field edits", () => {
  const w = seed();
  assert.equal(imageryOverlapsField(image().bounds, w.fields[0]), true);
  assert.equal(
    imageryOverlapsField({ south: 0, north: 1, west: 0, east: 1 }, w.fields[0]),
    false,
  );
  w.imagery = [image()];
  w.fields[0].location = { lat: 0, lng: 0 };
  w.fields[0].boundary = [];
  assert.equal(parseWorkspace(w).imagery.length, 1);
});
