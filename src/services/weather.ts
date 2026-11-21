export interface DailyForecast {
  date: string;
  maxC: number;
  minC: number;
  rainMm: number;
  rainProbPct: number | null;
  condition: string;
}

export interface FieldForecast {
  provider: "Open-Meteo";
  fetchedAt: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    tempC: number;
    humidityPct: number | null;
    rainMm: number;
    windKmh: number | null;
    condition: string;
  };
  days: DailyForecast[];
  totalRainMm: number;
}

export function describeWeatherCode(code: unknown): string {
  const n = typeof code === "number" ? code : -1;
  if (n === 0) return "Clear sky";
  if (n === 1 || n === 2) return "Partly cloudy";
  if (n === 3) return "Overcast";
  if (n === 45 || n === 48) return "Fog or mist";
  if (n >= 51 && n <= 57) return "Drizzle";
  if (n === 61 || n === 63) return "Rain";
  if (n === 65 || n === 66 || n === 67) return "Heavy rain";
  if (n >= 80 && n <= 82) return "Rain showers";
  if (n >= 95 && n <= 99) return "Thunderstorm";
  return "Variable conditions";
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseForecast(
  value: unknown,
  fetchedAt = new Date().toISOString(),
): FieldForecast {
  if (!value || typeof value !== "object")
    throw new Error("The weather service returned an invalid response.");
  const data = value as Record<string, unknown>;
  if (data.error)
    throw new Error("The weather service could not return a forecast.");

  const latitude = finiteNumber(data.latitude);
  const longitude = finiteNumber(data.longitude);
  const current = data.current as Record<string, unknown> | undefined;
  const daily = data.daily as Record<string, unknown> | undefined;

  if (
    latitude === null ||
    longitude === null ||
    !current ||
    typeof current !== "object" ||
    !daily ||
    typeof daily !== "object"
  ) {
    throw new Error("Weather response is missing forecast measurements.");
  }

  const tempC = finiteNumber(current.temperature_2m);
  if (tempC === null)
    throw new Error("Weather response is missing current temperature.");

  const times = Array.isArray(daily.time) ? daily.time : [];
  const maxs = Array.isArray(daily.temperature_2m_max)
    ? daily.temperature_2m_max
    : [];
  const mins = Array.isArray(daily.temperature_2m_min)
    ? daily.temperature_2m_min
    : [];
  const rains = Array.isArray(daily.precipitation_sum)
    ? daily.precipitation_sum
    : [];
  const probs = Array.isArray(daily.precipitation_probability_max)
    ? daily.precipitation_probability_max
    : [];
  const codes = Array.isArray(daily.weather_code) ? daily.weather_code : [];

  const days: DailyForecast[] = [];
  for (let i = 0; i < Math.min(times.length, 5); i++) {
    const date = typeof times[i] === "string" ? times[i] : "";
    const maxC = finiteNumber(maxs[i]);
    const minC = finiteNumber(mins[i]);
    const rainMm = finiteNumber(rains[i]) ?? 0;
    if (!date || maxC === null || minC === null) continue;
    days.push({
      date,
      maxC: Math.round(maxC * 10) / 10,
      minC: Math.round(minC * 10) / 10,
      rainMm: Math.round(rainMm * 10) / 10,
      rainProbPct: finiteNumber(probs[i]),
      condition: describeWeatherCode(codes[i]),
    });
  }

  if (!days.length)
    throw new Error("Weather response contained no valid daily forecasts.");

  const totalRainMm =
    Math.round(days.reduce((sum, d) => sum + d.rainMm, 0) * 10) / 10;

  return {
    provider: "Open-Meteo",
    fetchedAt,
    latitude,
    longitude,
    timezone: typeof data.timezone === "string" ? data.timezone : "local",
    current: {
      tempC: Math.round(tempC * 10) / 10,
      humidityPct: finiteNumber(current.relative_humidity_2m),
      rainMm: Math.round((finiteNumber(current.precipitation) ?? 0) * 10) / 10,
      windKmh: finiteNumber(current.wind_speed_10m),
      condition: describeWeatherCode(current.weather_code),
    },
    days,
    totalRainMm,
  };
}

export async function fetchFieldForecast(
  lat: number,
  lng: number,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<FieldForecast> {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 85 ||
    Math.abs(lng) > 180
  ) {
    throw new Error("Set valid field coordinates before fetching weather.");
  }

  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(roundedLat),
    longitude: String(roundedLng),
    current:
      "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code",
    timezone: "auto",
    forecast_days: "5",
  }).toString();

  const response = await fetcher(url, {
    signal,
    credentials: "omit",
    referrerPolicy: "no-referrer",
  });
  if (!response.ok) {
    throw new Error(
      "Live weather forecast is unavailable right now. Your saved field records are unaffected.",
    );
  }
  return parseForecast(await response.json());
}
