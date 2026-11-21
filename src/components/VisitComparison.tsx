import { useState } from "react";
import type { Observation } from "../types/domain";
import type { StoredPhoto } from "../types/workspace";
import { compareVisits, pointVisits } from "../services/comparison";

export function VisitComparison({
  observations,
  photos,
  fieldId,
  seasonId,
  onAttach,
  onRecord,
}: {
  observations: Observation[];
  photos: StoredPhoto[];
  fieldId: string;
  seasonId: string;
  onAttach: (file: File | undefined, observationId: string) => void;
  onRecord: () => void;
}) {
  const scoped = observations.filter(
    (o) =>
      o.fieldId === fieldId && (o.seasonId || "season-2024-k") === seasonId,
  );
  const points = [
    ...new Set(
      scoped
        .map((o) => o.scoutingPointId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const [selectedPoint, setPoint] = useState("");
  const point = points.includes(selectedPoint)
    ? selectedPoint
    : points[0] || "";
  const visits = pointVisits(scoped, fieldId, seasonId, point);
  const [earlierId, setEarlier] = useState("");
  const [laterId, setLater] = useState("");
  const earlier =
    visits.find((o) => o.id === earlierId) ||
    visits[Math.max(0, visits.length - 2)];
  const laterChoices = earlier
    ? visits.filter(
        (o) =>
          o.id !== earlier.id &&
          (+new Date(o.observedAt) > +new Date(earlier.observedAt) ||
            (+new Date(o.observedAt) === +new Date(earlier.observedAt) &&
              +new Date(o.recordedAt) >= +new Date(earlier.recordedAt))),
      )
    : [];
  const later =
    laterChoices.find((o) => o.id === laterId) || laterChoices.at(-1);
  const rows = earlier && later ? compareVisits(earlier, later) : [];
  const label = (o: Observation) =>
    `${new Date(o.observedAt).toLocaleString()} · ${o.isIllustrative ? "sample" : "entered"} · ${o.id.slice(-8)}`;
  const linkedPhotos = (o: Observation) =>
    photos.filter(
      (p) =>
        p.observationId === o.id &&
        (p.fieldId || "field-01") === fieldId &&
        (p.seasonId || "season-2024-k") === seasonId,
    );
  function download() {
    if (!earlier || !later) return;
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              fieldId,
              seasonId,
              pointId: point,
              earlier,
              later,
              comparison: rows,
              note: "Recorded differences only; not proof of treatment response or measured spread.",
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "fieldsense-visit-comparison.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="visit-comparison report-records">
      <div className="report-intro">
        <div>
          <span className="eyebrow">RETURN TO THE SAME PLACE</span>
          <h2>What changed between visits?</h2>
          <p>
            Compare recorded observations at one check point in this season.
          </p>
        </div>
        <button onClick={onRecord}>Record another visit</button>
      </div>
      {points.length > 0 && (
        <label>
          Check point
          <select
            value={point}
            onChange={(e) => {
              setPoint(e.target.value);
              setEarlier("");
              setLater("");
            }}
          >
            {points.map((id) => (
              <option key={id} value={id}>
                {id} · {pointVisits(scoped, fieldId, seasonId, id).length}{" "}
                visit(s)
              </option>
            ))}
          </select>
        </label>
      )}
      {visits.length < 2 ? (
        <div className="report-empty">
          <h3>Two visits at the same point are needed</h3>
          <p>
            Save a visit, then return to the same marked place and record it
            again. Nothing has been estimated from missing records.
          </p>
        </div>
      ) : (
        <>
          <div className="report-grid">
            <label>
              Earlier visit
              <select
                value={earlier?.id || ""}
                onChange={(e) => {
                  setEarlier(e.target.value);
                  setLater("");
                }}
              >
                {visits.slice(0, -1).map((o) => (
                  <option key={o.id} value={o.id}>
                    {label(o)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Later visit
              <select
                value={later?.id || ""}
                onChange={(e) => setLater(e.target.value)}
              >
                {laterChoices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {label(o)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="report-table">
            <table>
              <caption>
                Values as recorded; a missing value does not mean zero.
              </caption>
              <thead>
                <tr>
                  <th>Observation</th>
                  <th>Earlier</th>
                  <th>Later</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    <td>{r.earlier}</td>
                    <td>{r.later}</td>
                    <td>{r.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="report-grid">
            {[earlier, later].map(
              (o, i) =>
                o && (
                  <article className="report-card" key={o.id}>
                    <h3>{i === 0 ? "Earlier" : "Later"} visit notes</h3>
                    <small>
                      {label(o)}
                      <br />
                      Recorded {new Date(o.recordedAt).toLocaleString()} ·{" "}
                      {o.verificationStatus}
                    </small>
                    <p>{o.generalNotes || "No notes recorded."}</p>
                    <label>
                      Attach a photo to this visit
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          onAttach(e.target.files?.[0], o.id);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <small>
                      Use an image under 3 MB. The attachment time is recorded;
                      capture time is not inferred.
                    </small>
                    {linkedPhotos(o).length ? (
                      <div className="comparison-photos">
                        {linkedPhotos(o).map((p) => (
                          <figure key={p.id}>
                            <img
                              src={p.url}
                              alt={`${i === 0 ? "Earlier" : "Later"} visit: ${p.kind}`}
                            />
                            <figcaption>
                              {p.kind}
                              {p.recordedAt
                                ? ` · attached ${new Date(p.recordedAt).toLocaleDateString()}`
                                : " · attachment date unknown"}
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    ) : (
                      <p className="muted">
                        No photos explicitly linked to this visit. Point-only
                        attachments are not assigned a visit date.
                      </p>
                    )}
                  </article>
                ),
            )}
          </div>
          <p className="muted">
            These are recorded differences, not a diagnosis or proof that an
            action worked. Use the same counting method and similar photo
            angles. No affected-area or spread estimate is calculated.
          </p>
          <button onClick={download}>Download this comparison</button>
        </>
      )}
    </section>
  );
}
