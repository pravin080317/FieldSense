import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createWorkspace } from "../src/services/workspace.ts";
import { scenarioA } from "../src/data/sampleData.ts";

test("Home clearly separates first-time and returning farmer journeys", async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    const { FarmerHome } = await server.ssrLoadModule(
      "/src/components/FarmerHome.tsx",
    );
    const callbacks = {
      onAddField() {},
      onOpen() {},
      onSample() {},
      onDashboard() {},
      onHelp() {},
    };
    const sampleWorkspace = createWorkspace("A", scenarioA.observations);

    const initial = renderToStaticMarkup(
      createElement(FarmerHome, {
        workspace: sampleWorkspace,
        today: "2026-11-21",
        ...callbacks,
      }),
    );
    assert.match(initial, /Your farm/);
    assert.match(initial, /Add my first growing area/);
    assert.match(initial, /Explore sample field/);
    assert.match(initial, /Illustrative field view/);
    assert.match(initial, /Salem paddy sample/);
    assert.doesNotMatch(initial, /What needs attention\?/);

    const ownField = {
      ...sampleWorkspace.fields[0],
      id: "own-field",
      name: "East paddy plot",
      isIllustrative: false,
    };
    const ownSeason = {
      ...sampleWorkspace.seasons[0],
      id: "own-season",
      fieldId: "own-field",
      isIllustrative: false,
    };
    const returningWorkspace = {
      ...sampleWorkspace,
      fields: [...sampleWorkspace.fields, ownField],
      seasons: [...sampleWorkspace.seasons, ownSeason],
      selectedFieldId: ownField.id,
      selectedSeasonId: ownSeason.id,
      tasks: [
        {
          id: "task-1",
          fieldId: ownField.id,
          seasonId: ownSeason.id,
          title: "Check drainage channel",
          dueDate: "2026-11-20",
          status: "open" as const,
          createdAt: "2026-11-18T08:00:00.000Z",
          updatedAt: "2026-11-18T08:00:00.000Z",
          history: [],
        },
      ],
    };

    const returning = renderToStaticMarkup(
      createElement(FarmerHome, {
        workspace: returningWorkspace,
        today: "2026-11-21",
        ...callbacks,
      }),
    );
    assert.match(returning, /Your farm.*today/);
    assert.match(returning, /Record a field check/);
    assert.match(returning, /What needs attention\?/);
    assert.match(returning, /Check drainage channel/);
    assert.match(returning, /East paddy plot/);
    assert.match(returning, /Overdue/);
    assert.doesNotMatch(returning, /Add my first growing area/);
  } finally {
    await server.close();
  }
});
