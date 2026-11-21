import test from "node:test";
import assert from "node:assert/strict";
import { indexedDB } from "fake-indexeddb";
import {
  validateAttachment,
  readReportAttachment,
} from "../src/services/attachments.ts";
import {
  createWorkspace,
  parseWorkspace,
  exportBackup,
  parseBackup,
  mergeBackup,
} from "../src/services/workspace.ts";
import { WorkspaceRepository } from "../src/services/WorkspaceRepository.ts";
import type { ReportAttachment, FieldReport } from "../src/types/reports.ts";

const attachment = (): ReportAttachment => ({
  id: "document1",
  name: "soil-report.pdf",
  mime: "application/pdf",
  size: 14,
  attachedAt: "2026-11-20T12:00:00Z",
  dataUrl: "data:application/pdf;base64," + btoa("%PDF-1.4\n%%EOF"),
});
const record = (): FieldReport => ({
  id: "r",
  fieldId: "field-01",
  seasonId: "season-2024-k",
  kind: "soil",
  sampledOn: "2024-10-10",
  reportedOn: "2024-10-12",
  recordedAt: "2024-10-13T12:00:00Z",
  sourceName: "Lab",
  sampleLocation: "North patch",
  reference: "ref",
  notes: "",
  interpretation: "",
  verification: "farmer-entered",
  measurements: [{ label: "pH", value: 6, unit: "pH" }],
  attachments: [attachment()],
});

test("original documents retain bytes and metadata in backup and database reopen", async () => {
  const w = createWorkspace("A", []);
  w.fieldReports = [record()];
  assert.deepEqual(parseBackup(exportBackup(w)).fieldReports, w.fieldReports);
  assert.equal(
    mergeBackup(createWorkspace("A", []), w).fieldReports[0].attachments?.[0]
      .dataUrl,
    attachment().dataUrl,
  );
  const name = `document-${crypto.randomUUID()}`;
  const repo = new WorkspaceRepository(indexedDB, name);
  await repo.load({ getItem: () => null }, () => createWorkspace("A", []));
  await repo.save(w);
  const loaded = await new WorkspaceRepository(indexedDB, name).load(
    { getItem: () => null },
    () => createWorkspace("A", []),
  );
  assert.deepEqual(loaded.workspace.fieldReports[0].attachments, [
    attachment(),
  ]);
});
test("file reader checks content type, size and basic signatures", async () => {
  const file = new File(["%PDF-1.4\n%%EOF"], "original.pdf", {
    type: "application/pdf",
  });
  const saved = await readReportAttachment(file);
  assert.equal(saved.size, file.size);
  assert.equal(saved.name, file.name);
  await assert.rejects(
    readReportAttachment(
      new File(["text"], "wrong.pdf", { type: "application/pdf" }),
    ),
    /content/,
  );
  await assert.rejects(
    readReportAttachment(
      new File(["<svg/>"], "vector.svg", { type: "image/svg+xml" }),
    ),
  );
  await assert.rejects(
    readReportAttachment(
      new File([new Uint8Array(3_000_001)], "large.pdf", {
        type: "application/pdf",
      }),
    ),
  );
});
test("malformed, mismatched and duplicate attachments are rejected during restore validation", () => {
  for (const patch of [
    { size: 100 },
    { size: 3_000_001 },
    { attachedAt: "invalid" },
    { name: "../report.pdf" },
    { mime: "text/html" },
    { dataUrl: "https://example.test/file.pdf" },
    { dataUrl: "data:application/pdf;base64,@@@" },
  ])
    assert.throws(() => validateAttachment({ ...attachment(), ...patch }));
  const w = createWorkspace("A", []);
  w.fieldReports = [record()];
  assert.throws(() =>
    parseWorkspace({
      ...w,
      fieldReports: [
        { ...record(), attachments: [attachment(), attachment()] },
      ],
    }),
  );
  assert.throws(() =>
    parseWorkspace({
      ...w,
      fieldReports: [
        {
          ...record(),
          attachments: Array.from({ length: 4 }, (_, i) => ({
            ...attachment(),
            id: String(i),
          })),
        },
      ],
    }),
  );
});
