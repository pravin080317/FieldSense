import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspace } from "../src/services/workspace.ts";
import { scenarioA } from "../src/data/sampleData.ts";
import {
  askGeminiAdvisor,
  buildFieldContextPrompt,
  runLocalFieldAI,
} from "../src/services/aiAdvisor.ts";

test("runLocalFieldAI computes transparent weighted priority score and adapts to evidence", () => {
  const w = createWorkspace("A", scenarioA.observations);
  const result = runLocalFieldAI({
    field: w.fields[0],
    season: w.seasons[0],
    observations: w.obs,
    tasks: [],
    reports: [],
    today: "2026-11-21",
  });

  assert.equal(result.contributions.length, 5);
  assert.ok(result.priorityScore > 25);
  assert.equal(result.coveragePct, 75);
  assert.match(result.topRecommendation, /drainage|root/i);

  const empty = runLocalFieldAI({
    field: w.fields[0],
    season: w.seasons[0],
    observations: [],
    tasks: [],
    reports: [],
    today: "2026-11-21",
  });
  assert.equal(empty.coveragePct, 0);
  assert.match(empty.topRecommendation, /2–4 marked points/i);
});

test("askGeminiAdvisor validates API key, builds grounded prompt and parses response", async () => {
  const w = createWorkspace("A", scenarioA.observations);
  const prompt = buildFieldContextPrompt({
    field: w.fields[0],
    season: w.seasons[0],
    observations: w.obs,
    reports: [],
    question: "What should I check first?",
  });
  assert.match(prompt, /Paddy Field 01/);
  assert.match(prompt, /waterlogged/);

  await assert.rejects(
    () =>
      askGeminiAdvisor({
        apiKey: "",
        field: w.fields[0],
        season: w.seasons[0],
        observations: w.obs,
        reports: [],
        question: "Check",
      }),
    /Gemini API key/i,
  );

  const mockFetcher: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [{ text: "Check drainage in Point 1 and inspect roots." }],
            },
          },
        ],
      }),
      { status: 200 },
    );

  const reply = await askGeminiAdvisor({
    apiKey: "test-key",
    field: w.fields[0],
    season: w.seasons[0],
    observations: w.obs,
    reports: [],
    question: "Next step?",
    fetcher: mockFetcher,
  });
  assert.equal(reply.model, "Gemini Multimodal AI");
  assert.match(reply.text, /Check drainage/);
});
