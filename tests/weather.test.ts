import test from "node:test";
import assert from "node:assert/strict";
import {
  describeWeatherCode,
  fetchFieldForecast,
  parseForecast,
} from "../src/services/weather.ts";

test("parseForecast extracts current weather, 5-day outlook and rain total", () => {
  const payload = {
    latitude: 11.664,
    longitude: 78.146,
    timezone: "Asia/Kolkata",
    current: {
      temperature_2m: 31.4,
      relative_humidity_2m: 68,
      precipitation: 0.2,
      wind_speed_10m: 11.5,
      weather_code: 2,
    },
    daily: {
      time: [
        "2026-11-21",
        "2026-11-22",
        "2026-11-23",
        "2026-11-24",
        "2026-11-25",
      ],
      temperature_2m_max: [32.1, 30.8, 29.5, 31.0, 32.2],
      temperature_2m_min: [23.0, 22.8, 22.2, 22.6, 23.1],
      precipitation_sum: [0, 8.4, 14.2, 1.1, 0],
      precipitation_probability_max: [10, 65, 80, 25, 10],
      weather_code: [1, 61, 65, 80, 0],
    },
  };
  const result = parseForecast(payload, "2026-11-21T10:00:00.000Z");
  assert.equal(result.provider, "Open-Meteo");
  assert.equal(result.current.tempC, 31.4);
  assert.equal(result.current.condition, "Partly cloudy");
  assert.equal(result.days.length, 5);
  assert.equal(result.days[2].condition, "Heavy rain");
  assert.equal(result.totalRainMm, 23.7);
  assert.equal(describeWeatherCode(95), "Thunderstorm");
});

test("fetchFieldForecast validates coordinates, omits credentials and handles failures", async () => {
  await assert.rejects(
    () => fetchFieldForecast(95, 78),
    /valid field coordinates/i,
  );

  let calledUrl = "";
  let calledInit: RequestInit | undefined;
  const mockFetcher: typeof fetch = async (input, init) => {
    calledUrl = String(input);
    calledInit = init;
    return new Response(
      JSON.stringify({
        latitude: 11.664,
        longitude: 78.146,
        timezone: "Asia/Kolkata",
        current: { temperature_2m: 30, precipitation: 0, weather_code: 0 },
        daily: {
          time: ["2026-11-21"],
          temperature_2m_max: [32],
          temperature_2m_min: [23],
          precipitation_sum: [0],
          precipitation_probability_max: [5],
          weather_code: [0],
        },
      }),
      { status: 200 },
    );
  };

  const forecast = await fetchFieldForecast(
    11.66444,
    78.14611,
    undefined,
    mockFetcher,
  );
  assert.match(calledUrl, /api\.open-meteo\.com\/v1\/forecast/);
  assert.match(calledUrl, /latitude=11\.664/);
  assert.match(calledUrl, /longitude=78\.146/);
  assert.equal(calledInit?.credentials, "omit");
  assert.equal(calledInit?.referrerPolicy, "no-referrer");
  assert.equal(forecast.days.length, 1);

  const failingFetcher: typeof fetch = async () =>
    new Response("Service down", { status: 503 });
  await assert.rejects(
    () => fetchFieldForecast(11.66, 78.14, undefined, failingFetcher),
    /unavailable/i,
  );
});
