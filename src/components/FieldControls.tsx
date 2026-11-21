import { useState } from "react";
import type { FarmField, FarmSeason, Coordinate } from "../types/farm";
import {
  parseField,
  parseSeason,
  coordinate,
  importBoundary,
  boundaryArea,
} from "../services/farm";
import { localDate } from "../services/workspace";
import { GeographicMap } from "./GeographicMap";
import { PlaceSearch } from "./PlaceSearch";
import { Icon } from "./Visuals";
export function FieldControls({
  fields,
  seasons,
  field,
  season,
  onSelect,
  onSaveField,
  onAddSeason,
  onStage,
}: {
  fields: FarmField[];
  seasons: FarmSeason[];
  field: FarmField;
  season: FarmSeason;
  onSelect: (fieldId: string, seasonId: string) => void;
  onSaveField: (field: FarmField, season?: FarmSeason) => void;
  onAddSeason: (season: FarmSeason) => void;
  onStage: (season: FarmSeason) => void;
}) {
  const [draft, setDraft] = useState<FarmField | null>(null);
  const [seasonDraft, setSeasonDraft] = useState<FarmSeason | null>(null);
  const [newField, setNewField] = useState(false);
  const [seasonOnly, setSeasonOnly] = useState(false);
  const [error, setError] = useState("");
  const [cornerLat, setCornerLat] = useState("11.6643");
  const [cornerLng, setCornerLng] = useState("78.1460");
  const makeSeason = (fieldId: string): FarmSeason => ({
    id: crypto.randomUUID(),
    fieldId,
    name: `Rice season ${new Date().getFullYear()}`,
    crop: "rice",
    variety: "Not specified",
    sowingDate: localDate(),
    expectedHarvestDate: "",
    growthStage: "not-set",
    isIllustrative: false,
  });
  function start(kind: "field" | "edit" | "season") {
    setError("");
    setNewField(kind === "field");
    setSeasonOnly(kind === "season");
    setDraft(
      kind === "field"
        ? {
            id: crypto.randomUUID(),
            name: `Paddy Field ${String(fields.length + 1).padStart(2, "0")}`,
            locality: "Salem, Tamil Nadu",
            location: { lat: 11.6643, lng: 78.146 },
            areaHectares: 1,
            boundary: [],
            irrigationSource: "Not specified",
            isIllustrative: false,
          }
        : structuredClone(field),
    );
    if (kind !== "edit")
      setSeasonDraft(makeSeason(kind === "field" ? "new" : field.id));
    else setSeasonDraft(null);
  }
  const change = (patch: Partial<FarmField>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));
  const corners = (points: Coordinate[]) => change({ boundary: points });
  async function readBoundary(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 1000000)
        throw new Error("Choose a GeoJSON smaller than 1 MB.");
      const points = importBoundary(await file.text());
      change({
        boundary: points,
        location: {
          lat: points.reduce((n, p) => n + p.lat, 0) / points.length,
          lng: points.reduce((n, p) => n + p.lng, 0) / points.length,
        },
      });
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read the boundary.");
    }
  }
  function locate() {
    if (!navigator.geolocation) {
      setError(
        "This browser cannot provide a GPS position. Enter coordinates instead.",
      );
      return;
    }
    const id = draft?.id;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDraft((d) =>
          d && d.id === id
            ? {
                ...d,
                location: {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                },
              }
            : d,
        );
        setError(
          `Device location added (accuracy approximately ${Math.round(pos.coords.accuracy)} m). Check it before saving.`,
        );
      },
      () =>
        setError(
          "Location was not available or permission was declined. You can still enter coordinates.",
        ),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }
  return (
    <section className="panel field-controls">
      <div className="panel-heading">
        <div>
          <h2>Your fields</h2>
          <p>
            Choose a field and season. Earlier records stay attached to the
            season where they were saved.
          </p>
        </div>
        <button className="primary" onClick={() => start("field")}>
          <Icon name="plus" size={16} /> Add field
        </button>
      </div>
      <div className="field-switch-grid">
        {fields.map((f) => {
          const own = seasons.filter((s) => s.fieldId === f.id);
          return (
            <button
              key={f.id}
              className={field.id === f.id ? "selected" : ""}
              aria-pressed={field.id === f.id}
              onClick={() =>
                onSelect(
                  f.id,
                  own.find((s) => s.id === season.id)?.id || own.at(-1)!.id,
                )
              }
            >
              <Icon name="field" />
              <span>
                <strong>{f.name}</strong>
                <small>
                  {f.locality} · {f.areaHectares} ha ·{" "}
                  {f.isIllustrative ? "Sample" : "Your field"}
                </small>
              </span>
              <Icon name="chevron" size={15} />
            </button>
          );
        })}
      </div>
      <div className="field-control-bar">
        <label>
          Selected crop season
          <select
            value={season.id}
            onChange={(e) => onSelect(field.id, e.target.value)}
          >
            {seasons
              .filter((s) => s.fieldId === field.id)
              .map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name} · {s.sowingDate}
                </option>
              ))}
          </select>
        </label>
        <label>
          Crop stage (set by you)
          <select
            value={season.growthStage}
            onChange={(e) =>
              onStage({
                ...season,
                growthStage: e.target.value as FarmSeason["growthStage"],
              })
            }
          >
            {[
              ["not-set", "Not confirmed"],
              ["planting", "Planting"],
              ["vegetative", "Leaf and stem growth"],
              ["reproductive", "Flowering / grain formation"],
              ["harvest", "Ready for harvest"],
              ["finished", "Season finished"],
            ].map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => start("edit")}>Edit field</button>
        <button onClick={() => start("season")}>
          <Icon name="calendar" size={16} /> New season
        </button>
      </div>
      {draft && (
        <form
          className="field-editor"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              const f = parseField(draft);
              if (seasonDraft) {
                const s = parseSeason({ ...seasonDraft, fieldId: f.id });
                if (seasonOnly) onAddSeason(s);
                else onSaveField(f, s);
              } else onSaveField(f);
              setDraft(null);
              setSeasonDraft(null);
              setError("");
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Check the field details.",
              );
            }
          }}
        >
          <div className="panel-heading">
            <div>
              <h3>
                {seasonOnly
                  ? "Start a new crop season"
                  : newField
                    ? "Set up your field"
                    : "Edit field details"}
              </h3>
              <p>No existing observations or tasks will be deleted.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
          {!seasonOnly && (
            <>
              <PlaceSearch
                key={draft.id}
                onChoose={(place) =>
                  change({
                    location: { lat: place.lat, lng: place.lng },
                    locality: place.label.slice(0, 150),
                  })
                }
              />
              <div className="form-grid">
                <label>
                  Field name
                  <input
                    required
                    value={draft.name}
                    maxLength={100}
                    onChange={(e) => change({ name: e.target.value })}
                  />
                </label>
                <label>
                  Location / locality
                  <input
                    required
                    value={draft.locality}
                    maxLength={150}
                    onChange={(e) => change({ locality: e.target.value })}
                  />
                </label>
                <label>
                  Field area (hectares)
                  <input
                    required
                    type="number"
                    step="any"
                    min="0.0001"
                    max="100000"
                    value={draft.areaHectares}
                    onChange={(e) =>
                      change({ areaHectares: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Irrigation source
                  <select
                    value={draft.irrigationSource}
                    onChange={(e) =>
                      change({ irrigationSource: e.target.value })
                    }
                  >
                    {[
                      "Not specified",
                      "Not recorded",
                      "Rain-fed",
                      "Canal",
                      "Borewell",
                      "Open well",
                      "Pond",
                      "Other",
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Centre latitude
                  <input
                    required
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={draft.location.lat}
                    onChange={(e) =>
                      change({
                        location: {
                          ...draft.location,
                          lat: Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Centre longitude
                  <input
                    required
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={draft.location.lng}
                    onChange={(e) =>
                      change({
                        location: {
                          ...draft.location,
                          lng: Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
              </div>
              <button type="button" onClick={locate}>
                <Icon name="pin" size={16} /> Use my device location
              </button>
              <p className="muted">
                You can register a centre point now and add a boundary later.
                Suggested check points must be verified in your field.
              </p>
              <GeographicMap
                field={draft}
                editing
                onBoundary={corners}
                onLocation={(location) => change({ location })}
              />
              <div className="boundary-inputs">
                <label>
                  Import boundary (GeoJSON Polygon)
                  <input
                    type="file"
                    accept=".json,.geojson,application/json,application/geo+json"
                    onChange={(e) => void readBoundary(e.target.files?.[0])}
                  />
                </label>
                <div>
                  <strong>{boundaryArea(draft.boundary).toFixed(3)} ha</strong>
                  <small>Approximate boundary area, not a survey</small>
                  <button
                    type="button"
                    disabled={draft.boundary.length < 3}
                    onClick={() =>
                      change({
                        areaHectares: Number(
                          boundaryArea(draft.boundary).toFixed(3),
                        ),
                      })
                    }
                  >
                    Use this area estimate
                  </button>
                </div>
              </div>
              <details className="coordinate-corners">
                <summary>Add a corner using coordinates</summary>
                <div className="form-grid">
                  <label>
                    Corner latitude
                    <input
                      type="number"
                      step="any"
                      value={cornerLat}
                      onChange={(e) => setCornerLat(e.target.value)}
                    />
                  </label>
                  <label>
                    Corner longitude
                    <input
                      type="number"
                      step="any"
                      value={cornerLng}
                      onChange={(e) => setCornerLng(e.target.value)}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      corners([
                        ...draft.boundary,
                        coordinate({
                          lat: Number(cornerLat),
                          lng: Number(cornerLng),
                        }),
                      ]);
                      setError("");
                    } catch (e) {
                      setError(
                        e instanceof Error ? e.message : "Invalid corner.",
                      );
                    }
                  }}
                >
                  Add corner
                </button>
              </details>
            </>
          )}
          {seasonDraft && (
            <fieldset>
              <legend>Crop season</legend>
              <p className="muted">
                Paddy (rice) is the supported crop. Dates and growth stage are
                entered by you, not predicted.
              </p>
              <div className="form-grid">
                <label>
                  Season name
                  <input
                    required
                    value={seasonDraft.name}
                    onChange={(e) =>
                      setSeasonDraft({ ...seasonDraft, name: e.target.value })
                    }
                  />
                </label>
                <label>
                  Rice variety
                  <input
                    required
                    value={seasonDraft.variety}
                    onChange={(e) =>
                      setSeasonDraft({
                        ...seasonDraft,
                        variety: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Sowing date
                  <input
                    required
                    type="date"
                    value={seasonDraft.sowingDate}
                    onChange={(e) =>
                      setSeasonDraft({
                        ...seasonDraft,
                        sowingDate: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Expected harvest (your estimate)
                  <input
                    required
                    type="date"
                    min={seasonDraft.sowingDate}
                    value={seasonDraft.expectedHarvestDate}
                    onChange={(e) =>
                      setSeasonDraft({
                        ...seasonDraft,
                        expectedHarvestDate: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
            </fieldset>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary" type="submit">
            <Icon name="check" size={17} />
            {seasonOnly
              ? "Save new season"
              : newField
                ? "Create field & season"
                : "Save field changes"}
          </button>
        </form>
      )}
    </section>
  );
}
