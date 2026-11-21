import { GuidedField } from "./GuidedField";
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
import { crops, isOngoingCrop } from "../data/crops";
function newFieldDraft(count: number): FarmField {
  return {
    id: crypto.randomUUID(),
    name: `Field ${String(count + 1).padStart(2, "0")}`,
    locality: "Salem, Tamil Nadu",
    location: { lat: 11.6643, lng: 78.146 },
    areaHectares: 1,
    boundary: [],
    irrigationSource: "Not specified",
    isIllustrative: false,
  };
}
function newSeasonDraft(fieldId: string): FarmSeason {
  return {
    id: crypto.randomUUID(),
    fieldId,
    name: `Crop season ${new Date().getFullYear()}`,
    crop: "rice",
    variety: "Not specified",
    sowingDate: localDate(),
    expectedHarvestDate: "",
    growthStage: "not-set",
    isIllustrative: false,
  };
}
export function FieldControls({
  fields,
  seasons,
  field,
  season,
  onSelect,
  onSaveField,
  onAddSeason,
  startAdding = false,
}: {
  startAdding?: boolean;
  fields: FarmField[];
  seasons: FarmSeason[];
  field: FarmField;
  season: FarmSeason;
  onSelect: (fieldId: string, seasonId: string) => void;
  onSaveField: (field: FarmField, season?: FarmSeason) => void;
  onAddSeason: (season: FarmSeason) => void;
}) {
  const [initialSetup] = useState(() =>
    startAdding
      ? { field: newFieldDraft(fields.length), season: newSeasonDraft("new") }
      : null,
  );
  const [draft, setDraft] = useState<FarmField | null>(
    initialSetup?.field || null,
  );
  const [seasonDraft, setSeasonDraft] = useState<FarmSeason | null>(
    initialSetup?.season || null,
  );
  const [newField, setNewField] = useState(startAdding);
  const [seasonOnly, setSeasonOnly] = useState(false);
  const [error, setError] = useState("");
  const [cornerLat, setCornerLat] = useState("11.6643");
  const [cornerLng, setCornerLng] = useState("78.1460");
  const makeSeason = newSeasonDraft;
  function start(kind: "field" | "edit" | "season") {
    setError("");
    setNewField(kind === "field");
    setSeasonOnly(kind === "season");
    setDraft(
      kind === "field" ? newFieldDraft(fields.length) : structuredClone(field),
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
        throw new Error("Choose a field boundary file smaller than 1 MB.");
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
        <div className="season-pill-bar">
          <span className="season-bar-label">Crop season</span>
          {(() => {
            const fieldSeasons = seasons.filter((s) => s.fieldId === field.id);
            if (fieldSeasons.length <= 1) {
              return (
                <span className="season-single-chip">
                  <Icon name="calendar" size={14} />
                  <strong>{season.name}</strong>
                  {season.sowingDate && <small>· Sown {season.sowingDate}</small>}
                </span>
              );
            }
            return (
              <div
                className="season-chip-group"
                role="group"
                aria-label="Select crop season"
              >
                {fieldSeasons.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={s.id === season.id}
                    className={s.id === season.id ? "active" : ""}
                    onClick={() => onSelect(field.id, s.id)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
        <div className="field-control-actions">
          <button type="button" onClick={() => start("edit")}>
            Edit field
          </button>
          <button type="button" onClick={() => start("season")}>
            <Icon name="plus" size={15} /> New season
          </button>
        </div>
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
                <GuidedField
                  label="Field name"
                  help="Choose a name you will recognise, such as Paddy Field 02. This helps you keep records for different fields apart."
                >
                  <input
                    required
                    value={draft.name}
                    maxLength={100}
                    onChange={(e) => change({ name: e.target.value })}
                  />
                </GuidedField>
                <GuidedField
                  label="Town or village"
                  help="Enter the nearest town or village, for example Salem, Tamil Nadu."
                >
                  <input
                    required
                    value={draft.locality}
                    maxLength={150}
                    onChange={(e) => change({ locality: e.target.value })}
                  />
                </GuidedField>
                <GuidedField
                  label="Field size (hectares)"
                  help="Enter the size of this field. One hectare is about 2.47 acres. Use your land record if you have it; the map can only give a rough estimate."
                >
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
                </GuidedField>
                <GuidedField
                  label="Where does the water come from?"
                  help="Choose how this field usually gets water, such as rain, a canal or a well. Choose Not recorded if you do not know."
                >
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
                </GuidedField>
                <GuidedField
                  label="Field location: latitude"
                  help="This is the first map number, for example 11.6643. Use Search places, Set field centre or your device location if you do not know it."
                >
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
                </GuidedField>
                <GuidedField
                  label="Field location: longitude"
                  help="This is the second map number, for example 78.1460. It works with latitude to place your field on the map. Moving this point does not move the boundary."
                >
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
                </GuidedField>
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
                <GuidedField
                  label="Load a saved field boundary"
                  help="Choose a field map file ending in .geojson or .json. If you do not have one, use Mark corners on the map. A boundary is the outside edge of your field."
                >
                  <input
                    type="file"
                    accept=".json,.geojson,application/json,application/geo+json"
                    onChange={(e) => void readBoundary(e.target.files?.[0])}
                  />
                </GuidedField>
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
                    Use this rough field size
                  </button>
                </div>
              </div>
              <details className="coordinate-corners">
                <summary>Add a corner using coordinates</summary>
                <div className="form-grid">
                  <GuidedField
                    label="Corner location: latitude"
                    help="Enter the first map number for one corner of the field. Enter its longitude too, then choose Add corner. You can mark corners directly on the map instead."
                  >
                    <input
                      type="number"
                      step="any"
                      value={cornerLat}
                      onChange={(e) => setCornerLat(e.target.value)}
                    />
                  </GuidedField>
                  <GuidedField
                    label="Corner location: longitude"
                    help="Enter the second map number for the same corner. Add corners in order around the field edge."
                  >
                    <input
                      type="number"
                      step="any"
                      value={cornerLng}
                      onChange={(e) => setCornerLng(e.target.value)}
                    />
                  </GuidedField>
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
              <legend>
                {isOngoingCrop(seasonDraft.crop)
                  ? "Trees or ongoing planting"
                  : "Crop season"}
              </legend>
              <p className="muted">
                Choose what you grow in this field for this season. Dates and
                growth stage are entered by you, not predicted. Records work for
                each listed crop; crop-specific review is currently limited to
                rice examples.
              </p>
              {isOngoingCrop(seasonDraft.crop) && (
                <p className="muted">
                  For trees and ongoing plants, leave the planting date blank if
                  you do not know it. A harvest date is optional; this record
                  does not predict harvests or yields.
                </p>
              )}
              <div className="form-grid">
                <GuidedField
                  label="What are you growing?"
                  help="Choose the crop planted for this season. Enter the variety below if you know it. Other crops can have records and tasks, but rice guidance will not be applied to them."
                >
                  <select
                    value={seasonDraft.crop}
                    onChange={(e) =>
                      setSeasonDraft({
                        ...seasonDraft,
                        crop: e.target.value as FarmSeason["crop"],
                        ...(isOngoingCrop(e.target.value)
                          ? {
                              sowingDate: "",
                              expectedHarvestDate: "",
                              name: `Planting record ${new Date().getFullYear()}`,
                            }
                          : {}),
                      })
                    }
                  >
                    {crops.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name}
                      </option>
                    ))}
                  </select>
                </GuidedField>

                <GuidedField
                  label="Crop season name"
                  help="Give this growing period a name, such as Rice season 2026. Older seasons and their records will stay saved."
                >
                  <input
                    required
                    value={seasonDraft.name}
                    onChange={(e) =>
                      setSeasonDraft({ ...seasonDraft, name: e.target.value })
                    }
                  />
                </GuidedField>
                <GuidedField
                  label="Crop variety"
                  help="Enter the variety name printed on the seed packet or planting record. If you are unsure, leave Not specified."
                >
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
                </GuidedField>
                <GuidedField
                  label={
                    isOngoingCrop(seasonDraft.crop)
                      ? "Date planted (if known)"
                      : "Date planted"
                  }
                  help="Choose when you sowed or planted this crop. Use the date for this field, not the date you are filling in the form."
                >
                  <input
                    required={!isOngoingCrop(seasonDraft.crop)}
                    type="date"
                    value={seasonDraft.sowingDate}
                    onChange={(e) =>
                      setSeasonDraft({
                        ...seasonDraft,
                        sowingDate: e.target.value,
                      })
                    }
                  />
                </GuidedField>
                <label>
                  Next expected harvest (optional)
                  <input
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
