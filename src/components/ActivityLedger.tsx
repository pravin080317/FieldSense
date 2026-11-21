import { useState } from "react";
import type { DiaryEntry } from "../types/workspace";
import type { FarmField, FarmSeason } from "../types/farm";
import {
  activityCsv,
  activityLedger,
  costPaise,
} from "../services/activityLedger";

const rupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    paise / 100,
  );
export default function ActivityLedger({
  entries,
  field,
  season,
}: {
  entries: DiaryEntry[];
  field: FarmField;
  season: FarmSeason;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("");
  const own = entries.filter(
    (e) =>
      (e.fieldId || "field-01") === field.id &&
      (e.seasonId || "season-2024-k") === season.id,
  );
  let error = "";
  let ledger: ReturnType<typeof activityLedger> | undefined;
  try {
    ledger = activityLedger(own, field.id, season.id, { from, to, type });
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not total these records.";
  }
  function download() {
    if (!ledger) return;
    const url = URL.createObjectURL(
      new Blob([activityCsv(ledger.rows, field.name, season.name)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "fieldsense-season-activities.csv";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section
      className="report-records activity-ledger"
      aria-label="Season activities and recorded costs"
    >
      <div className="report-intro">
        <div>
          <span className="eyebrow">FARM WORK · RECORDED COSTS</span>
          <h2>Where did this season’s costs go?</h2>
          <p>
            {field.name} · {season.name}
          </p>
        </div>
        <button onClick={download} disabled={!ledger?.rows.length}>
          Download filtered CSV
        </button>
      </div>
      <p className="muted">
        Totals use the optional costs entered in your activity log below, in
        Indian rupees. Missing costs are not zero. This is a record summary, not
        a profit, budget or payment calculation.
      </p>
      <div className="ledger-filters">
        <label>
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label>
          Activity
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All activities</option>
            {[...new Set(own.map((e) => e.type))].sort().map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setFrom("");
            setTo("");
            setType("");
          }}
        >
          Clear filters
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      {ledger && (
        <>
          <div className="ledger-stats" role="status">
            <article>
              <small>Recorded total</small>
              <strong>{rupees(ledger.totalPaise)}</strong>
            </article>
            <article>
              <small>Activities in view</small>
              <strong>{ledger.rows.length}</strong>
            </article>
            <article>
              <small>Costs entered</small>
              <strong>{ledger.withCost}</strong>
            </article>
            <article>
              <small>Costs not entered</small>
              <strong>{ledger.missing}</strong>
            </article>
          </div>
          {ledger.invalid > 0 && (
            <p role="status">
              {ledger.invalid} older cost value(s) excluded from totals because
              their format or size is unsupported. The original records remain
              visible and export unchanged.
            </p>
          )}
          {ledger.rows.length ? (
            <>
              <div className="report-table">
                <table>
                  <caption>
                    Recorded costs by activity for the current filters
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Activity</th>
                      <th scope="col">Records</th>
                      <th scope="col">Entered costs</th>
                      <th scope="col">Missing / excluded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.groups.map((g) => (
                      <tr key={g.type}>
                        <th scope="row">{g.type}</th>
                        <td>{g.count}</td>
                        <td>{rupees(g.totalPaise)}</td>
                        <td>
                          {g.missing} / {g.invalid}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <details>
                <summary>View {ledger.rows.length} activity records</summary>
                <div className="report-table">
                  <table>
                    <caption>Original saved activity values</caption>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Activity</th>
                        <th>Notes</th>
                        <th>Recorded cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.rows.map((e) => (
                        <tr key={e.id}>
                          <td>{e.date}</td>
                          <th scope="row">{e.type}</th>
                          <td>{e.notes}</td>
                          <td>
                            {e.cost === ""
                              ? "Not entered"
                              : costPaise(e.cost) === null
                                ? `${e.cost} (excluded)`
                                : rupees(costPaise(e.cost)!)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          ) : (
            <div className="report-empty">
              <h3>No activities in this view</h3>
              <p>
                Clear the filters or use Log a farm activity below to save field
                work and an optional cost.
              </p>
            </div>
          )}
        </>
      )}
      <small>
        CSV contains the selected activities only; use Download backup in Expert
        report for a restorable workspace.
      </small>
    </section>
  );
}
