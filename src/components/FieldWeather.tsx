import { useEffect, useRef, useState } from "react";
import type { FarmField } from "../types/farm";
import { fetchFieldForecast } from "../services/weather";
import type { FieldForecast } from "../services/weather";
import { Icon } from "./Visuals";

const cache = new Map<string, FieldForecast>();

function formatDay(isoDate: string) {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function FieldWeather({
  field,
  onPlanCheck,
}: {
  field: FarmField;
  onPlanCheck: (title: string) => void;
}) {
  const key = `${Math.round(field.location.lat * 1000)},${Math.round(field.location.lng * 1000)}`;
  const [forecast, setForecast] = useState<FieldForecast | null>(
    () => cache.get(key) || null,
  );
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function loadForecast() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");
    setError("");
    const timer = window.setTimeout(() => controller.abort(), 10000);
    try {
      const data = await fetchFieldForecast(
        field.location.lat,
        field.location.lng,
        controller.signal,
      );
      cache.set(key, data);
      setForecast(data);
      setStatus("idle");
    } catch (e) {
      if (controller.signal.aborted) {
        setError(
          "Weather request timed out or was cancelled. Check your connection and try again.",
        );
      } else {
        setError(
          e instanceof Error
            ? e.message
            : "Could not load weather forecast right now.",
        );
      }
      setStatus("error");
    } finally {
      window.clearTimeout(timer);
    }
  }

  return (
    <section className="panel weather-panel" aria-labelledby="weather-heading">
      <div className="weather-header">
        <div>
          <span className="eyebrow">LIVE FIELD FORECAST · OPEN-METEO</span>
          <h2 id="weather-heading">
            5-day weather near {field.name}
          </h2>
          <p>
            {field.locality} · {field.location.lat.toFixed(3)}°N,{" "}
            {field.location.lng.toFixed(3)}°E
          </p>
        </div>
        <button
          className={forecast ? "secondary" : "primary"}
          onClick={() => void loadForecast()}
          disabled={status === "loading"}
        >
          <Icon name="cloud" size={17} />
          {status === "loading"
            ? "Fetching forecast…"
            : forecast
              ? "Refresh forecast"
              : "Fetch 5-day forecast"}
        </button>
      </div>

      {!forecast && status !== "error" && (
        <div className="weather-empty">
          <p>
            Fetch a live 5-day rainfall and temperature forecast for this
            field’s coordinates. Only rounded coordinates are sent to Open-Meteo
            when you click Fetch.
          </p>
        </div>
      )}

      {status === "error" && (
        <p className="weather-error" role="alert">
          {error}
        </p>
      )}

      {forecast && (
        <>
          <div className="weather-current-grid">
            <article className="weather-stat">
              <span>Current temp</span>
              <strong>{forecast.current.tempC}°C</strong>
              <small>{forecast.current.condition}</small>
            </article>
            <article className="weather-stat">
              <span>Humidity</span>
              <strong>
                {forecast.current.humidityPct !== null
                  ? `${Math.round(forecast.current.humidityPct)}%`
                  : "—"}
              </strong>
              <small>Model grid estimate</small>
            </article>
            <article className="weather-stat">
              <span>Wind</span>
              <strong>
                {forecast.current.windKmh !== null
                  ? `${Math.round(forecast.current.windKmh)} km/h`
                  : "—"}
              </strong>
              <small>10 m height</small>
            </article>
            <article className="weather-stat weather-stat-rain">
              <span>5-day rain total</span>
              <strong>{forecast.totalRainMm} mm</strong>
              <small>
                {forecast.totalRainMm >= 10
                  ? "Plan a drainage check"
                  : "Light or dry outlook"}
              </small>
            </article>
          </div>

          <div className="weather-days-grid">
            {forecast.days.map((day) => (
              <article className="weather-day-card" key={day.date}>
                <span className="weather-day-date">{formatDay(day.date)}</span>
                <strong className="weather-day-temp">
                  {Math.round(day.maxC)}° / {Math.round(day.minC)}°
                </strong>
                <span className="weather-day-cond">{day.condition}</span>
                <span
                  className={`weather-day-rain ${day.rainMm >= 5 ? "heavy" : ""}`}
                >
                  <Icon name="drop" size={13} />
                  {day.rainMm} mm
                  {day.rainProbPct !== null ? ` · ${day.rainProbPct}%` : ""}
                </span>
              </article>
            ))}
          </div>

          <div className="weather-footer">
            <p>
              <strong>Forecast provenance:</strong> {forecast.provider} model
              grid ({forecast.timezone}) · fetched{" "}
              {new Date(forecast.fetchedAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              . Regional forecast context only — does not confirm standing water
              or soil moisture inside the field.
            </p>
            {forecast.totalRainMm >= 10 && (
              <button
                className="text-button"
                onClick={() =>
                  onPlanCheck(
                    `Inspect drainage and low-lying patches in ${field.name} after forecasted rain (${forecast.totalRainMm} mm expected).`,
                  )
                }
              >
                Plan post-rain check <Icon name="arrow" size={15} />
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
