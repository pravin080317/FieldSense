import { useRef, useState } from "react";
import type { FarmField, FarmSeason } from "../types/farm";
import type { FieldImagery as Imagery } from "../types/imagery";
import {
  readReportAttachment,
  downloadAttachment,
} from "../services/attachments";
import { imageryOverlapsField, parseImagery } from "../services/imagery";
import { localDate } from "../services/workspace";
import { GeographicMap } from "./GeographicMap";

export default function FieldImagery({
  field,
  season,
  records,
  onSave,
}: {
  field: FarmField;
  season: FarmSeason;
  records: Imagery[];
  onSave: (record: Imagery) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(65);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(localDate());
  const [notes, setNotes] = useState("");
  const [bounds, setBounds] = useState({
    south: "",
    west: "",
    north: "",
    east: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState("");
  const own = records
    .filter((r) => r.fieldId === field.id && r.seasonId === season.id)
    .sort((a, b) => b.capturedOn.localeCompare(a.capturedOn));
  const current = own.find((r) => r.id === selected) || own[0];
  return (
    <section
      className="report-records field-imagery"
      aria-label="Dated field imagery"
    >
      <div className="report-intro">
        <div>
          <span className="eyebrow">FIELD IMAGERY · DATE & SOURCE</span>
          <h2>See a field image on your map</h2>
          <p>
            Add an already-processed north-up drone or satellite image with its
            geographic bounds.
          </p>
        </div>
        <button disabled={own.length >= 3} onClick={() => setOpen(!open)}>
          {open ? "Close imagery form" : "Add field imagery"}
        </button>
      </div>
      <p className="muted">
        This viewer places an image using bounds you enter. It does not stitch
        drone photos, read GeoTIFFs, reconstruct terrain or calculate NDVI.
        Ordinary photos are not survey maps. Check alignment against known field
        features before using an overlay.
      </p>
      {open && (
        <form
          className="report-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (pending.current) return;
            pending.current = true;
            setBusy(true);
            setError("");
            try {
              if (
                !file ||
                !["image/png", "image/jpeg", "image/webp"].includes(file.type)
              )
                throw new Error(
                  "Choose a PNG, JPEG or WebP map export up to 3 MB.",
                );
              const attachment = await readReportAttachment(file);
              const record: Imagery = {
                id: crypto.randomUUID(),
                fieldId: field.id,
                seasonId: season.id,
                title,
                source,
                capturedOn: date,
                notes,
                alignment: "user-entered-bounds",
                bounds: {
                  south: Number(bounds.south),
                  west: Number(bounds.west),
                  north: Number(bounds.north),
                  east: Number(bounds.east),
                },
                file: attachment,
              };
              if (Object.values(bounds).some((v) => !v.trim()))
                throw new Error(
                  "Enter all four geographic bounds from your map export.",
                );
              parseImagery([...own, record], [field], [season]);
              if (!imageryOverlapsField(record.bounds, field))
                throw new Error(
                  "Image bounds do not overlap this field. Check the coordinates.",
                );
              onSave(record);
              setSelected(record.id);
              setVisible(true);
              setOpen(false);
              setFile(null);
              setTitle("");
              setNotes("");
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Could not save imagery.",
              );
            } finally {
              pending.current = false;
              setBusy(false);
            }
          }}
        >
          <fieldset disabled={busy}>
            <legend>
              New image for {field.name} · {season.name}
            </legend>
            <div className="report-grid">
              <label>
                Image title
                <input
                  required
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. North field survey"
                />
              </label>
              <label>
                Capture date
                <input
                  required
                  type="date"
                  max={localDate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                Source / processing tool
                <input
                  required
                  maxLength={500}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Provider, flight or orthomosaic export reference"
                />
              </label>
              <label>
                North-up image export
                <input
                  required
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              {(["south", "west", "north", "east"] as const).map((key) => (
                <label key={key}>
                  {key === "south"
                    ? "South latitude"
                    : key === "north"
                      ? "North latitude"
                      : key === "west"
                        ? "West longitude"
                        : "East longitude"}
                  <input
                    required
                    type="number"
                    step="any"
                    min={key === "south" || key === "north" ? -85 : -180}
                    max={key === "south" || key === "north" ? 85 : 180}
                    value={bounds[key]}
                    onChange={(e) =>
                      setBounds({ ...bounds, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <p>
              Use WGS84 latitude/longitude in decimal degrees, not metres or
              pixel coordinates. The image is fitted to a rectangle; rotation
              and distortion are not corrected.
            </p>
            <label>
              Alignment or quality notes
              <textarea
                maxLength={5000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record export resolution, cloud cover or known alignment limitations."
              />
            </label>
            <button className="primary" type="submit">
              {busy ? "Saving imagery…" : "Save image on this device"}
            </button>
          </fieldset>
        </form>
      )}
      {error && <p role="alert">{error}</p>}
      {current ? (
        <>
          <div className="imagery-controls">
            <label>
              Image date & source
              <select
                value={current.id}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setVisible(true);
                }}
              >
                {own.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.capturedOn} · {r.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Image opacity: {opacity}%
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
            </label>
            <button aria-pressed={visible} onClick={() => setVisible(!visible)}>
              {visible ? "Hide image layer" : "Show image layer"}
            </button>
          </div>
          <GeographicMap
            field={field}
            imagery={visible ? current : undefined}
            opacity={opacity / 100}
          />
          <article className="report-card">
            <h3>{current.title}</h3>
            {!imageryOverlapsField(current.bounds, field) && (
              <p role="status">
                The field has changed and no longer overlaps these image bounds.
                The original imagery record is retained.
              </p>
            )}
            <p>
              Captured {current.capturedOn} · Source: {current.source}
            </p>
            <p>
              Bounds entered by you; not independently georeferenced. Attached{" "}
              {new Date(current.file.attachedAt).toLocaleString()}.
            </p>
            {current.notes && <p>{current.notes}</p>}
            <button
              onClick={() => {
                try {
                  downloadAttachment(current.file);
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Could not download image.",
                  );
                }
              }}
            >
              Download original image
            </button>
          </article>
        </>
      ) : (
        <div className="report-empty">
          <h3>No imagery saved for this field and season</h3>
          <p>
            Use an existing map export with known geographic bounds. Leaf and
            plant photos belong in Record visit.
          </p>
        </div>
      )}
      <p className="muted">
        Up to three images per field/season, 3 MB each. Images stay in this
        browser and are included in backups and expert exports. Changing the
        field boundary later does not realign the image. No live imagery service
        or automated crop-health score is connected.
      </p>
    </section>
  );
}
