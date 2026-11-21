import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { workerSource } from "../scripts/build-offline.mjs";

function harness(failInstall = false) {
  const scope = "https://example.test/farm/";
  const prefix = "fieldsense-shell:" + scope + ":";
  const handlers: Record<string, (event: any) => void> = {};
  const stores = new Map<string, Map<string, Response>>();
  const removed: string[] = [];
  const requested: string[] = [];
  let claimed = false;
  const caches = {
    async open(name: string) {
      if (!stores.has(name)) stores.set(name, new Map());
      const rows = stores.get(name)!;
      return {
        async addAll(requests: Request[]) {
          if (failInstall) throw new Error("Download interrupted");
          requests.forEach((r) =>
            rows.set(r.url, new Response("cached:" + r.url)),
          );
        },
        async match(url: string) {
          return rows.get(url)?.clone();
        },
      };
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name: string) {
      removed.push(name);
      return stores.delete(name);
    },
  };
  runInNewContext(workerSource(["index.html", "assets/app.js"], "new"), {
    self: {
      registration: { scope },
      clients: {
        async claim() {
          claimed = true;
        },
      },
      addEventListener: (name: string, handler: (event: any) => void) => {
        handlers[name] = handler;
      },
    },
    caches,
    URL,
    Request,
    fetch: async (request: Request) => {
      requested.push(request.url);
      throw new Error("Offline");
    },
  });
  async function lifecycle(name: string) {
    let pending: Promise<unknown> | undefined;
    handlers[name]({
      waitUntil: (p: Promise<unknown>) => {
        pending = p;
      },
    });
    await pending;
  }
  async function request(url: string, mode = "cors", method = "GET") {
    let response: Promise<Response> | undefined;
    handlers.fetch({
      request: { url, method, mode },
      respondWith: (p: Promise<Response>) => {
        response = p;
      },
    });
    return response ? (await response).text() : undefined;
  }
  async function ready(repair = false) {
    let result: boolean | undefined;
    let pending: Promise<unknown> | undefined;
    handlers.message({
      data: repair ? "REPAIR_SHELL" : "CHECK_SHELL",
      ports: [
        {
          postMessage: (value: boolean) => {
            result = value;
          },
        },
      ],
      waitUntil: (p: Promise<unknown>) => {
        pending = p;
      },
    });
    await pending;
    return result;
  }
  return {
    scope,
    prefix,
    stores,
    removed,
    requested,
    lifecycle,
    request,
    ready,
    claimed: () => claimed,
  };
}

test("installed app serves navigation and bundled assets while network is offline", async () => {
  const h = harness();
  await h.lifecycle("install");
  assert.equal(await h.ready(), true);
  assert.equal(
    await h.request(h.scope, "navigate"),
    "cached:" + h.scope + "index.html",
  );
  assert.equal(
    await h.request(h.scope + "assets/app.js"),
    "cached:" + h.scope + "assets/app.js",
  );
  assert.deepEqual(h.requested, []);
});
test("worker leaves tiles, unrelated routes and writes out of shell cache", async () => {
  const h = harness();
  await h.lifecycle("install");
  assert.equal(
    await h.request("https://tile.openstreetmap.org/1/2/3.png"),
    undefined,
  );
  assert.equal(await h.request(h.scope + "api/records"), undefined);
  assert.equal(await h.request(h.scope + "elsewhere", "navigate"), undefined);
  assert.equal(await h.request(h.scope, "navigate", "POST"), undefined);
});
test("failed install discards partial new cache without touching an older shell", async () => {
  const h = harness(true);
  h.stores.set(h.prefix + "old", new Map());
  await assert.rejects(h.lifecycle("install"), /interrupted/);
  assert.ok(h.stores.has(h.prefix + "old"));
  assert.ok(!h.stores.has(h.prefix + "new"));
});
test("activation only removes old shells in its own scope and readiness detects lost assets", async () => {
  const h = harness();
  await h.lifecycle("install");
  h.stores.set(h.prefix + "old", new Map());
  h.stores.set("another-app", new Map());
  await h.lifecycle("activate");
  assert.equal(h.claimed(), true);
  assert.deepEqual(h.removed, [h.prefix + "old"]);
  assert.ok(h.stores.has("another-app"));
  h.stores.get(h.prefix + "new")!.delete(h.scope + "assets/app.js");
  assert.equal(await h.ready(), false);
  assert.equal(await h.ready(true), true);
});
