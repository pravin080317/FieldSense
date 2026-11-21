import { useEffect, useRef, useState } from "react";
import { searchPlaces } from "../services/placeSearch";
import type { PlaceResult } from "../services/placeSearch";

export function PlaceSearch({
  onChoose,
}: {
  onChoose: (place: PlaceResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("IN");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const request = useRef<AbortController | null>(null);
  const cache = useRef(new Map<string, PlaceResult[]>());
  useEffect(() => () => request.current?.abort(), []);
  async function search() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const key = `${country}/${query.trim().toLowerCase()}`;
    setBusy(true);
    setMessage("");
    setResults([]);
    const timer = window.setTimeout(() => controller.abort(), 12000);
    try {
      const matches =
        cache.current.get(key) ||
        (await searchPlaces(query, country, controller.signal));
      if (controller.signal.aborted || request.current !== controller) return;
      if (cache.current.size >= 20) cache.current.clear();
      cache.current.set(key, matches);
      setResults(matches);
      setMessage(
        matches.length
          ? `${matches.length} places found. Select the area, then mark the exact field centre on the map.`
          : "No places found. Try the nearest town or enter coordinates directly.",
      );
    } catch (error) {
      if (request.current === controller)
        setMessage(
          controller.signal.aborted
            ? "Search timed out. Check your connection or enter coordinates directly."
            : error instanceof Error
              ? error.message
              : "Could not search. Check your connection or enter coordinates.",
        );
    } finally {
      clearTimeout(timer);
      if (request.current === controller) setBusy(false);
    }
  }
  return (
    <section className="place-search" aria-label="Find a town or village">
      <h4>Find your area</h4>
      <p>
        Search a nearby town or village, then choose the exact field location on
        the map. Place results do not identify farm boundaries.
      </p>
      <div className="place-search-controls">
        <label>
          Town or village
          <input
            value={query}
            maxLength={120}
            onChange={(e) => {
              request.current?.abort();
              request.current = null;
              setBusy(false);
              setQuery(e.target.value);
              setResults([]);
              setMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!busy) void search();
              }
            }}
            placeholder="e.g. Salem, Tamil Nadu"
          />
        </label>
        <label>
          Search area
          <select
            value={country}
            onChange={(e) => {
              request.current?.abort();
              request.current = null;
              setBusy(false);
              setCountry(e.target.value);
              setResults([]);
              setMessage("");
            }}
          >
            <option value="IN">India</option>
            <option value="">Worldwide</option>
          </select>
        </label>
        <button
          type="button"
          disabled={busy || query.trim().length < 3}
          onClick={() => void search()}
        >
          {busy ? "Searching…" : "Search places"}
        </button>
      </div>
      <p className="muted">
        Pressing Search sends the place name to Open-Meteo. Use a town/village
        name, not personal information. Internet required.{" "}
        <a
          href="https://open-meteo.com/en/docs/geocoding-api"
          target="_blank"
          rel="noreferrer"
        >
          Open-Meteo / GeoNames
        </a>
        .
      </p>
      {message && <p role="status">{message}</p>}
      <ul className="place-results">
        {results.map((place) => (
          <li key={place.id}>
            <button
              type="button"
              onClick={() => {
                onChoose(place);
                setMessage(
                  `Area selected: ${place.label}. Check the map and set the exact field centre before saving.`,
                );
              }}
            >
              <strong>{place.label}</strong>
              <small>
                {place.lat.toFixed(5)}, {place.lng.toFixed(5)} · Use this area
              </small>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
