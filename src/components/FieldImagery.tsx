import { GuidedField } from "./GuidedField";
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
  const sampleLayer: Imagery | null =
    field.isIllustrative && own.length === 0
      ? {
          id: "sample-drone-salem",
          fieldId: field.id,
          seasonId: season.id,
          title: "Salem paddy drone orthomosaic (Illustrative sample)",
          capturedOn: "2024-10-18",
          source: "Illustrative top-down UAV sample",
          notes:
            "Shows mild pale-yellow drainage stress in the northwest corner (Point 1) compared to lush green paddy rows elsewhere. Use the opacity slider above to blend with the live satellite basemap.",
          alignment: "user-entered-bounds",
          bounds: {
            south: 11.654,
            west: 78.485,
            north: 11.655,
            east: 78.486,
          },
          file: {
            id: "sample-drone-file",
            name: "salem-drone-orthomosaic.jpg",
            mime: "image/jpeg",
            size: 1100000,
            attachedAt: "2024-10-18T09:00:00.000Z",
            dataUrl: "/images/samples/salem-drone-orthomosaic.jpg",
          },
        }
      : null;
  const available = sampleLayer ? [sampleLayer] : own;
  const current = available.find((r) => r.id === selected) || available[0];
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
            Add a ready-made field map image. You will need its date and the map
            numbers for its edges.
          </p>
        </div>
        <button disabled={own.length >= 3} onClick={() => setOpen(!open)}>
          {open ? "Close imagery form" : "Add field imagery"}
        </button>
      </div>
      <p className="muted">
        This places your image over the field map. It does not turn ordinary
        photos into a measured map or judge crop health. Check that paths and
        field edges line up. If you do not have a prepared map image, use Record
        visit for your plant photos.
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
              <GuidedField
                label="Name this field image"
                help="Choose a name you will recognise, such as North field image. This is for an image that is already prepared as a map."
              >
                <input
                  required
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. North field survey"
                />
              </GuidedField>
              <GuidedField
                label="When was the image taken?"
                help="Use the day the drone or satellite took the image, not the day you downloaded it."
              >
                <input
                  required
                  type="date"
                  max={localDate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </GuidedField>
              <GuidedField
                label="Where did this image come from?"
                help="Write who supplied the map image or the name of the service used. This helps an expert understand the picture."
              >
                <input
                  required
                  maxLength={500}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="For example, the name of the person who supplied the map"
                />
              </GuidedField>
              <GuidedField
                label="Choose the field map image"
                help="Choose a PNG, JPEG or WebP image under 3 MB. North must be at the top. Normal leaf photos belong in Record visit."
              >
                <input
                  required
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </GuidedField>
              {(["south", "west", "north", "east"] as const).map((key) => (
                <GuidedField
                  key={key}
                  help="Copy this edge location from the person or service that supplied your field map image. Do not guess it from a plant photo."
                  label={
                    key === "south"
                      ? "South latitude"
                      : key === "north"
                        ? "North latitude"
                        : key === "west"
                          ? "West longitude"
                          : "East longitude"
                  }
                >
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
                </GuidedField>
              ))}
            </div>
            <p>
              Copy the edge locations from the map supplier, using numbers like
              11.6643 and 78.1460. Ask the supplier if you do not know them. The
              app stretches the image to these edges; it cannot fix a tilted or
              uneven image.
            </p>
            <GuidedField
              label="Anything unclear in this image?"
              help="Mention cloud, blur, an old picture or parts that do not line up with the field. Leave blank if there is nothing to add."
            >
              <textarea
                maxLength={5000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="For example: clouds hide the north corner, or the path does not line up."
              />
            </GuidedField>
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
            <GuidedField
              label="Choose a saved image"
              help="Choose the date and image you want to see. Switching images does not change your field records."
            >
              <select
                value={current.id}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setVisible(true);
                }}
              >
                {available.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.capturedOn} · {r.title}
                  </option>
                ))}
              </select>
            </GuidedField>
            <GuidedField
              label={`Image strength: ${opacity}%`}
              help="Move the slider left to see more of the map underneath. Move it right to see more of your saved image. This changes the view only."
            >
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
            </GuidedField>
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
              Image edges entered by you; the map position has not been checked.
              Added {new Date(current.file.attachedAt).toLocaleString()}.
            </p>
            {current.notes && <p>{current.notes}</p>}
            {current.id !== "sample-drone-salem" && (
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
            )}
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
