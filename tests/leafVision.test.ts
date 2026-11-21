import test from "node:test";
import assert from "node:assert/strict";
import { analyzeLeafPixels } from "../src/services/leafVision.ts";

function makeSolidRGBA(r: number, g: number, b: number, count = 100) {
  const arr = new Uint8ClampedArray(count * 4);
  for (let i = 0; i < count * 4; i += 4) {
    arr[i] = r;
    arr[i + 1] = g;
    arr[i + 2] = b;
    arr[i + 3] = 255;
  }
  return arr;
}

test("analyzeLeafPixels identifies healthy green paddy canopy with positive ExG", () => {
  const green = makeSolidRGBA(58, 148, 62, 200);
  const res = analyzeLeafPixels(green);
  assert.equal(res.inferredLeafColor, "normal");
  assert.equal(res.stressLevel, "Low");
  assert.equal(res.healthyGreenPct, 100);
  assert.ok(res.exgScore > 0.5);
});

test("analyzeLeafPixels detects yellow chlorosis and brown necrosis stress", () => {
  // 50% yellow + 50% green -> yellowing
  const yellow = makeSolidRGBA(215, 195, 55, 100);
  const green = makeSolidRGBA(55, 140, 60, 100);
  const mixed = new Uint8ClampedArray(yellow.length + green.length);
  mixed.set(yellow, 0);
  mixed.set(green, yellow.length);

  const res = analyzeLeafPixels(mixed);
  assert.equal(res.inferredLeafColor, "yellowing");
  assert.equal(res.chlorosisYellowPct, 50);
  assert.equal(res.stressLevel, "Elevated");

  const brown = makeSolidRGBA(145, 82, 42, 100);
  const resBrown = analyzeLeafPixels(brown);
  assert.equal(resBrown.inferredLeafColor, "browning");
  assert.equal(resBrown.necrosisBrownPct, 100);
});
