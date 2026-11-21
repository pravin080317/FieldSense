import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  riceReferences,
  searchRiceReferences,
  photoResolutionNote,
} from "../src/data/riceReferences.ts";

test("reference search handles case, spaces, multiword queries and no match", () => {
  assert.equal(searchRiceReferences("   BROWN spot ").length, 1);
  assert.equal(
    searchRiceReferences("leaf blight")[0].id,
    "bacterial-leaf-blight",
  );
  assert.equal(searchRiceReferences("tomato").length, 0);
  assert.equal(searchRiceReferences("").length, 3);
});
test("reference images match bundled attribution and original file hashes", async () => {
  const manifest = JSON.parse(
    await readFile("public/images/rice-reference/ATTRIBUTION.json", "utf8"),
  );
  for (const reference of riceReferences) {
    const source = manifest.find((r: { id: string }) => r.id === reference.id);
    assert.ok(source);
    assert.equal(source.license, "CC BY 4.0");
    assert.equal(source.modified, false);
    const bytes = await readFile("public" + reference.image);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      source.sha256,
    );
    assert.equal(bytes.length, source.bytes);
  }
});
test("photo dimension guidance makes no diagnosis or inferred quality score", () => {
  assert.match(photoResolutionNote(200, 200), /Small image/);
  assert.match(
    photoResolutionNote(2000, 1500),
    /not an image-quality or disease score/,
  );
  assert.match(photoResolutionNote(NaN, 10), /Could not read/);
});
