export interface PlaceResult {
  id: string;
  name: string;
  label: string;
  lat: number;
  lng: number;
}
export function parsePlaces(value: unknown): PlaceResult[] {
  if (!value || typeof value !== "object")
    throw new Error("The place service returned an invalid response.");
  const data = value as { results?: unknown; error?: boolean };
  if (
    data.error ||
    (data.results !== undefined && !Array.isArray(data.results))
  )
    throw new Error("The place service could not complete this search.");
  const results: PlaceResult[] = [];
  for (const raw of (data.results || []) as unknown[]) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (
      (typeof r.id !== "number" && typeof r.id !== "string") ||
      typeof r.name !== "string" ||
      !r.name.trim() ||
      r.name.length > 200 ||
      typeof r.latitude !== "number" ||
      typeof r.longitude !== "number" ||
      !Number.isFinite(r.latitude) ||
      !Number.isFinite(r.longitude) ||
      Math.abs(r.latitude) > 85 ||
      Math.abs(r.longitude) > 180
    )
      continue;
    const label = [r.name, r.admin2, r.admin1, r.country]
      .filter((v): v is string => typeof v === "string" && Boolean(v.trim()))
      .join(", ")
      .slice(0, 600);
    if (!results.some((p) => p.id === String(r.id)))
      results.push({
        id: String(r.id),
        name: r.name,
        label,
        lat: r.latitude,
        lng: r.longitude,
      });
    if (results.length >= 8) break;
  }
  return results;
}
export async function searchPlaces(
  query: string,
  country: string,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<PlaceResult[]> {
  const name = query.trim();
  if (name.length < 3 || name.length > 120)
    throw new Error(
      "Enter a town or village name between 3 and 120 characters.",
    );
  if (country && !/^[A-Z]{2}$/.test(country))
    throw new Error("Invalid country filter.");
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({
    name,
    count: "8",
    language: "en",
    format: "json",
    ...(country ? { countryCode: country } : {}),
  }).toString();
  const response = await fetcher(url, {
    signal,
    credentials: "omit",
    referrerPolicy: "no-referrer",
  });
  if (!response.ok)
    throw new Error(
      "Place search is unavailable. Try later or enter coordinates directly.",
    );
  return parsePlaces(await response.json());
}
