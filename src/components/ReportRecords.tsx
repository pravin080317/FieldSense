import { GuidedField } from "./GuidedField";
import { useState } from "react";
import type { FieldReport, ReportAttachment } from "../types/reports";
import { ReportDocuments } from "./ReportDocuments";
import type { FarmSeason } from "../types/farm";
import { parseReports } from "../services/reports";
import { localDate } from "../services/workspace";

export function ReportRecords({
  records,
  season,
  onSave,
  onAttach,
}: {
  records: FieldReport[];
  season: FarmSeason;
  onSave: (report: FieldReport) => void;
  onAttach: (reportId: string, attachment: ReportAttachment) => void;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"soil" | "water">("soil");
  const [sampledOn, setSampledOn] = useState(localDate());
  const [reportedOn, setReportedOn] = useState(localDate());
  const [sourceName, setSource] = useState("");
  const [sampleLocation, setLocation] = useState("");
  const [reference, setReference] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState([{ label: "pH", value: "", unit: "pH" }]);
  const [error, setError] = useState("");
  return (
    <section className="report-records">
      <div className="report-intro">
        <div>
          <span className="eyebrow">FIELD RECORDS</span>
          <h2>Soil & water reports</h2>
          <p>
            Keep the results for this field and season together. Copy each value
            and unit exactly as printed.
          </p>
        </div>
        <button className="primary" onClick={() => setOpen(!open)}>
          {open ? "Close form" : "Add a report"}
        </button>
      </div>
      <p className="muted">
        Entered records are not independently verified. They are included in
        backups and expert exports, but do not count as verified laboratory
        evidence in crop explanations. No automatic unit conversion or treatment
        advice.
      </p>
      {open && (
        <form
          className="report-form"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            try {
              if (rows.some((r) => !r.value.trim()))
                throw new Error(
                  "Enter each measurement value, or remove the empty row.",
                );
              const record: FieldReport = {
                id: crypto.randomUUID(),
                fieldId: season.fieldId,
                seasonId: season.id,
                kind,
                sampledOn,
                reportedOn,
                recordedAt: new Date().toISOString(),
                sourceName,
                sampleLocation,
                reference,
                interpretation,
                notes,
                verification: "farmer-entered",
                measurements: rows.map((r) => ({
                  ...r,
                  value: Number(r.value),
                })),
              };
              parseReports([record], [season]);
              onSave(record);
              setOpen(false);
              setRows([{ label: "pH", value: "", unit: "pH" }]);
              setReference("");
              setInterpretation("");
              setNotes("");
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Could not save report.",
              );
            }
          }}
        >
          <div className="report-grid">
            <GuidedField
              label="What was tested?"
              help="Choose Soil test for a soil sample or Water test for a water sample."
            >
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as "soil" | "water")}
              >
                <option value="soil">Soil test</option>
                <option value="water">Water test</option>
              </select>
            </GuidedField>
            <GuidedField
              label="Who tested the sample?"
              help="Copy the laboratory name from the report. If it was tested another way, write who or what provided the result."
            >
              <input
                required
                maxLength={200}
                value={sourceName}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Name printed on the report"
              />
            </GuidedField>
            <GuidedField
              label="When was the sample taken?"
              help="Use the date soil or water was collected from the field. This may be earlier than the date printed when the report was issued."
            >
              <input
                required
                type="date"
                max={localDate()}
                value={sampledOn}
                onChange={(e) => setSampledOn(e.target.value)}
              />
            </GuidedField>
            <GuidedField
              label="Date on the report"
              help="Copy the date the laboratory issued the result. It cannot be before the sample was taken."
            >
              <input
                required
                type="date"
                min={sampledOn}
                max={localDate()}
                value={reportedOn}
                onChange={(e) => setReportedOn(e.target.value)}
              />
            </GuidedField>
            <GuidedField
              label="Where was the sample taken?"
              help="Write the part of the field and depth if known, for example north corner, 0 to 15 cm deep. This helps someone review whether the result applies here."
            >
              <input
                required
                maxLength={500}
                value={sampleLocation}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. north patch, 0–15 cm"
              />
            </GuidedField>
            <GuidedField
              label="Report number (if shown)"
              help="Copy the report number from the paper. Leave it blank if there is no number."
            >
              <input
                maxLength={200}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </GuidedField>
          </div>
          <h3>Measurements</h3>
          <p className="muted">
            Use “pH” as the unit for pH. For other tests, copy the printed unit,
            such as mg/kg, kg/ha, % or dS/m. These units are not
            interchangeable.
          </p>
          {rows.map((row, i) => (
            <div className="measurement-row" key={i}>
              <GuidedField
                label="What was measured?"
                help="Copy the test name from the report, such as pH or Nitrogen. Do not guess a result from leaf colour."
              >
                <input
                  required
                  maxLength={100}
                  value={row.label}
                  onChange={(e) =>
                    setRows(
                      rows.map((r, j) =>
                        j === i ? { ...r, label: e.target.value } : r,
                      ),
                    )
                  }
                />
              </GuidedField>
              <GuidedField
                label="Number on the report"
                help="Copy the number exactly. A blank result does not mean zero. Add the printed unit in the next box."
              >
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  value={row.value}
                  onChange={(e) =>
                    setRows(
                      rows.map((r, j) =>
                        j === i ? { ...r, value: e.target.value } : r,
                      ),
                    )
                  }
                />
              </GuidedField>
              <GuidedField
                label="Unit printed beside the number"
                help="Copy the letters or symbol beside the result, such as mg/kg, % or pH. Do not change the unit; different units cannot be compared as if they were the same."
              >
                <input
                  required
                  maxLength={50}
                  value={row.unit}
                  onChange={(e) =>
                    setRows(
                      rows.map((r, j) =>
                        j === i ? { ...r, unit: e.target.value } : r,
                      ),
                    )
                  }
                />
              </GuidedField>
              <button
                type="button"
                disabled={rows.length === 1}
                onClick={() => setRows(rows.filter((_, j) => i !== j))}
              >
                Remove row {i + 1}
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={rows.length >= 30}
            onClick={() =>
              setRows([...rows, { label: "", value: "", unit: "" }])
            }
          >
            + Add measurement
          </button>
          <GuidedField
            label="What does the report say? (optional)"
            help="Copy any written explanation from the laboratory. Leave this blank if the report only contains numbers. Typing a report does not mean the app has checked it."
          >
            <textarea
              maxLength={5000}
              value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
              placeholder="Copy the lab's written interpretation. Leave blank if none is provided."
            />
          </GuidedField>
          <GuidedField
            label="Your notes (optional)"
            help="Add anything useful to remember or explain to an expert. You can leave this blank."
          >
            <textarea
              maxLength={5000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </GuidedField>
          {error && <p role="alert">{error}</p>}
          <button className="primary" type="submit">
            Save report on this device
          </button>
        </form>
      )}
      {!records.length && (
        <div className="report-empty">
          <h3>No reports saved for this season</h3>
          <p>
            Add an existing soil or water report. Sample lab results elsewhere
            in the app remain separate.
          </p>
        </div>
      )}
      {[...records]
        .sort((a, b) => b.sampledOn.localeCompare(a.sampledOn))
        .map((r) => (
          <article className="report-card" key={r.id}>
            <span className="eyebrow">
              {r.kind === "soil" ? "SOIL TEST" : "WATER TEST"} · FARMER-ENTERED
            </span>
            <h3>{r.sourceName}</h3>
            <p>
              Sample: {r.sampledOn} · Report: {r.reportedOn}
            </p>
            <p>
              {r.sampleLocation}
              {r.reference ? ` · Ref ${r.reference}` : ""}
            </p>
            <div className="report-table">
              <table>
                <caption>Values copied from this report</caption>
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Result</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {r.measurements.map((m, i) => (
                    <tr key={i}>
                      <td>{m.label}</td>
                      <td>{m.value}</td>
                      <td>{m.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {r.interpretation && (
              <p>
                <strong>Lab interpretation, as entered:</strong>{" "}
                {r.interpretation}
              </p>
            )}
            {r.notes && (
              <p>
                <strong>Your notes:</strong> {r.notes}
              </p>
            )}
            <small>
              Entered {new Date(r.recordedAt).toLocaleString()}. Keep the
              original document for review. To correct a saved result, add a new
              report and identify the earlier reference in your notes.
            </small>
            <ReportDocuments
              attachments={r.attachments}
              onAttach={(attachment) => onAttach(r.id, attachment)}
            />
          </article>
        ))}
    </section>
  );
}
