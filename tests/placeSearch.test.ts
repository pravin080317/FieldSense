import test from "node:test";
import assert from "node:assert/strict";
import { parsePlaces, searchPlaces } from "../src/services/placeSearch.ts";

test("place results validate coordinates, deduplicate IDs and tolerate absent results", () => {
  const valid = {
    id: 1,
    name: "Salem",
    latitude: 11.66,
    longitude: 78.14,
    admin1: "Tamil Nadu",
    country: "India",
  };
  const rows = parsePlaces({
    results: [
      valid,
      valid,
      { ...valid, id: 2, latitude: NaN },
      { ...valid, id: 3, longitude: 181 },
      { id: 4 },
    ],
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].label, "Salem, Tamil Nadu, India");
  assert.deepEqual(parsePlaces({}), []);
  assert.throws(() => parsePlaces({ error: true }));
  assert.throws(() => parsePlaces({ results: "bad" }));
});
test("explicit search sends an encoded query and optional country filter without credentials", async () => {
  let called = false;
  const fetcher: typeof fetch = async (url, options) => {
    called = true;
    const parsed = new URL(String(url));
    assert.equal(parsed.origin, "https://geocoding-api.open-meteo.com");
    assert.equal(parsed.searchParams.get("name"), "Salem, Tamil Nadu");
    assert.equal(parsed.searchParams.get("countryCode"), "IN");
    assert.equal(options?.credentials, "omit");
    return new Response(
      JSON.stringify({
        results: [{ id: 1, name: "Salem", latitude: 11.66, longitude: 78.14 }],
      }),
    );
  };
  const rows = await searchPlaces(
    " Salem, Tamil Nadu ",
    "IN",
    undefined,
    fetcher,
  );
  assert.equal(called, true);
  assert.equal(rows[0].lat, 11.66);
});
test("invalid queries and service failures return actionable errors", async () => {
  const never: typeof fetch = async () => {
    throw new Error("Should not request");
  };
  await assert.rejects(searchPlaces("a", "IN", undefined, never), /3 and 120/);
  await assert.rejects(
    searchPlaces("Salem", "invalid", undefined, never),
    /country/,
  );
  await assert.rejects(
    searchPlaces(
      "Salem",
      "IN",
      undefined,
      async () => new Response("", { status: 503 }),
    ),
    /unavailable/,
  );
});
