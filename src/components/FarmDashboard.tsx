import { useState } from "react";
import type { Workspace } from "../types/workspace";
import { farmDashboard } from "../services/dashboard";
import { localDate } from "../services/workspace";
import { crops } from "../data/crops";
import { Icon } from "./Visuals";

const CROP_COLORS = [
  "#24744f",
  "#4c9a68",
  "#c99235",
  "#3b82a0",
  "#8e5a7c",
  "#6e8b3d",
];

export default function FarmDashboard({
  workspace,
  onAdd,
  onOpen,
}: {
  workspace: Workspace;
  onAdd: () => void;
  onOpen: (
    field: string,
    season: string,
    destination: "field" | "visit" | "tasks" | "concerns",
  ) => void;
}) {
  const own = workspace.fields.some((f) => !f.isIllustrative);
  const [includeSamples, setIncludeSamples] = useState(!own);
  const [query, setQuery] = useState("");
  const [crop, setCrop] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "attention" | "ok">(
    "all",
  );
  const today = localDate();
  const model = farmDashboard(workspace, today, includeSamples);

  const rows = model.fields.filter((r) => {
    const matchesCrop = !crop || r.season.crop === crop;
    const matchesQuery = `${r.field.name} ${r.field.locality}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const needsAttention = Boolean(r.overdue || r.changes);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "attention" && needsAttention) ||
      (statusFilter === "ok" && !needsAttention);
    return matchesCrop && matchesQuery && matchesStatus;
  });

  const maxWeekly = Math.max(1, ...model.weekly.map((w) => w.count));
  const workTotal = model.completed + model.pending;
  const onTimePending = Math.max(0, model.pending - model.overdue);
  const completionPct = workTotal
    ? Math.round((model.completed / workTotal) * 100)
    : 0;

  // SVG Donut geometry (r = 52, circumference = 2 * pi * 52 ≈ 326.73)
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const doneLen = workTotal ? (model.completed / workTotal) * circ : 0;
  const pendingLen = workTotal ? (onTimePending / workTotal) * circ : 0;
  const overdueLen = workTotal ? (model.overdue / workTotal) * circ : 0;

  // SVG Column + Trend chart coordinates
  const chartW = 420;
  const chartH = 165;
  const padTop = 22;
  const padBottom = 30;
  const plotH = chartH - padTop - padBottom;
  const colStep = chartW / model.weekly.length;
  const trendPoints = model.weekly
    .map((w, i) => {
      const x = i * colStep + colStep / 2;
      const y = padTop + plotH - (w.count / maxWeekly) * plotH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const obsMax = Math.max(
    1,
    model.observationsSummary.normalLeaves,
    model.observationsSummary.yellowingOrBrowning,
    model.observationsSummary.waterlogged,
    model.observationsSummary.withPests,
  );

  return (
    <div className="farm-dashboard">
      <section className="dashboard-intro">
        <div>
          <span className="dashboard-hero-pill">
            <Icon name="chart" size={13} />
            WHOLE-FARM ANALYTICS · {model.fields.length}{" "}
            {model.fields.length === 1 ? "AREA" : "AREAS"} ·{" "}
            {model.totalAreaHa} HA
          </span>
          <h2>One clear view of all your growing areas.</h2>
          <p>
            Track visits, field changes, crop mix and job progress across every
            field, bed or grove. All charts come strictly from your saved
            records.
          </p>
        </div>
        <button className="primary" onClick={onAdd}>
          <Icon name="plus" size={18} />
          Add a growing area
        </button>
      </section>

      <div className="dashboard-scope">
        <label>
          <input
            type="checkbox"
            checked={includeSamples}
            onChange={(e) => setIncludeSamples(e.target.checked)}
          />
          Include the example field (Salem paddy sample)
        </label>
        <p>
          Showing the selected planting for your active field and the latest
          planting for other areas. Earlier seasons stay in History.
        </p>
      </div>

      {includeSamples && (
        <p className="dashboard-sample" role="status">
          Example records are included and labelled. They are illustrative demo
          data, not live measurements from your farm.
        </p>
      )}

      <div className="farm-dashboard-stats">
        <article className="dash-kpi-card">
          <div className="dash-kpi-top">
            <small>Growing areas</small>
            <span className="dash-kpi-icon">
              <Icon name="field" size={17} />
            </span>
          </div>
          <strong>{model.fields.length}</strong>
          <span className="dash-kpi-sub">
            {model.totalAreaHa} ha total mapped
          </span>
        </article>
        <article className="dash-kpi-card">
          <div className="dash-kpi-top">
            <small>Visits saved</small>
            <span className="dash-kpi-icon">
              <Icon name="camera" size={17} />
            </span>
          </div>
          <strong>{model.visits}</strong>
          <span className="dash-kpi-sub">
            {model.weekly.reduce((s, w) => s + w.count, 0)} in last 6 weeks
          </span>
        </article>
        <article className="dash-kpi-card">
          <div className="dash-kpi-top">
            <small>Jobs to do</small>
            <span className="dash-kpi-icon">
              <Icon name="calendar" size={17} />
            </span>
          </div>
          <strong>{model.pending}</strong>
          <span className="dash-kpi-sub">{model.completed} completed</span>
        </article>
        <article
          className={`dash-kpi-card ${model.overdue > 0 ? "dash-kpi-alert" : ""}`}
        >
          <div className="dash-kpi-top">
            <small>Jobs overdue</small>
            <span className="dash-kpi-icon">
              <Icon name="alert" size={17} />
            </span>
          </div>
          <strong>{model.overdue}</strong>
          <span className="dash-kpi-sub">
            {model.overdue > 0 ? "Needs review first" : "All caught up"}
          </span>
        </article>
      </div>

      <div className="dashboard-charts-bento">
        {/* Chart 1: 6-Week Visits Column + Trend SVG */}
        <figure className="dash-chart-card">
          <figcaption>
            <div>
              <strong>Field visit activity (6 weeks)</strong>
              <span>Saved visits per 7-day window ending {today}</span>
            </div>
            <span className="dash-chart-badge">
              {model.weekly.reduce((s, w) => s + w.count, 0)} total
            </span>
          </figcaption>
          <div className="dash-svg-wrap">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              role="img"
              aria-label="Bar and trend chart of field visits over the last six weeks"
              className="dash-column-svg"
            >
              <defs>
                <linearGradient id="visitBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#287a53" />
                  <stop offset="100%" stopColor="#81be74" />
                </linearGradient>
              </defs>
              {[0, 0.5, 1].map((ratio) => {
                const y = padTop + plotH * (1 - ratio);
                return (
                  <line
                    key={ratio}
                    x1="8"
                    x2={chartW - 8}
                    y1={y}
                    y2={y}
                    className="dash-grid-line"
                  />
                );
              })}
              {model.weekly.map((week, i) => {
                const barW = 28;
                const x = i * colStep + (colStep - barW) / 2;
                const h = Math.max(
                  week.count ? 6 : 2,
                  (week.count / maxWeekly) * plotH,
                );
                const y = padTop + plotH - h;
                return (
                  <g key={week.label}>
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={h}
                      rx="7"
                      fill={week.count ? "url(#visitBarGrad)" : "currentColor"}
                      className={week.count ? "" : "dash-bar-empty"}
                    />
                    <text
                      x={x + barW / 2}
                      y={y - 6}
                      textAnchor="middle"
                      className="dash-bar-val"
                    >
                      {week.count}
                    </text>
                    <text
                      x={x + barW / 2}
                      y={chartH - 8}
                      textAnchor="middle"
                      className="dash-bar-axis"
                    >
                      {week.label}
                    </text>
                  </g>
                );
              })}
              <polyline
                points={trendPoints}
                fill="none"
                className="dash-trend-line"
              />
              {model.weekly.map((week, i) => {
                const cx = i * colStep + colStep / 2;
                const cy = padTop + plotH - (week.count / maxWeekly) * plotH;
                return (
                  <circle
                    key={`dot-${week.label}`}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    className="dash-trend-dot"
                  />
                );
              })}
            </svg>
          </div>
        </figure>

        {/* Chart 2: Work Completion SVG Donut */}
        <figure className="dash-chart-card">
          <figcaption>
            <div>
              <strong>Work completion</strong>
              <span>Saved job progress — not a crop health score</span>
            </div>
          </figcaption>
          <div className="dash-donut-layout">
            <div className="dash-donut-wrap">
              <svg
                viewBox="0 0 132 132"
                role="img"
                aria-label={`Work completion chart: ${completionPct}% finished`}
                className="dash-donut-svg"
              >
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  strokeWidth="14"
                  className="dash-donut-track"
                />
                {workTotal > 0 && (
                  <>
                    <circle
                      cx="66"
                      cy="66"
                      r={radius}
                      fill="none"
                      strokeWidth="14"
                      stroke="#24744f"
                      strokeDasharray={`${doneLen} ${circ}`}
                      strokeDashoffset={0}
                      transform="rotate(-90 66 66)"
                    />
                    <circle
                      cx="66"
                      cy="66"
                      r={radius}
                      fill="none"
                      strokeWidth="14"
                      stroke="#d5a84b"
                      strokeDasharray={`${pendingLen} ${circ}`}
                      strokeDashoffset={-doneLen}
                      transform="rotate(-90 66 66)"
                    />
                    <circle
                      cx="66"
                      cy="66"
                      r={radius}
                      fill="none"
                      strokeWidth="14"
                      stroke="#c85d38"
                      strokeDasharray={`${overdueLen} ${circ}`}
                      strokeDashoffset={-(doneLen + pendingLen)}
                      transform="rotate(-90 66 66)"
                    />
                  </>
                )}
              </svg>
              <div className="dash-donut-center">
                <strong>{workTotal ? `${completionPct}%` : "—"}</strong>
                <small>{workTotal ? "done" : "no jobs"}</small>
              </div>
            </div>
            <ul className="dash-donut-legend">
              <li>
                <span style={{ background: "#24744f" }} />
                <span>Finished</span>
                <strong>{model.completed}</strong>
              </li>
              <li>
                <span style={{ background: "#d5a84b" }} />
                <span>On-track pending</span>
                <strong>{onTimePending}</strong>
              </li>
              <li>
                <span style={{ background: "#c85d38" }} />
                <span>Overdue</span>
                <strong>{model.overdue}</strong>
              </li>
            </ul>
          </div>
        </figure>

        {/* Chart 3: Crop Mix & Recorded Scouting Signals */}
        <figure className="dash-chart-card dash-chart-wide">
          <figcaption>
            <div>
              <strong>Crop mix &amp; recorded scouting signals</strong>
              <span>
                Area breakdown by crop and latest saved point observations
              </span>
            </div>
            <span className="dash-chart-badge">
              {model.observationsSummary.totalPoints} scouted points
            </span>
          </figcaption>
          <div className="dash-mix-grid">
            <div className="dash-mix-col">
              <h4>Crop area distribution</h4>
              {model.cropBreakdown.length ? (
                <>
                  <div className="dash-stacked-bar" aria-hidden="true">
                    {model.cropBreakdown.map((item, idx) => {
                      const pct =
                        model.totalAreaHa > 0
                          ? (item.areaHa / model.totalAreaHa) * 100
                          : 100 / model.cropBreakdown.length;
                      return (
                        <i
                          key={item.cropId}
                          style={{
                            width: `${Math.max(8, pct)}%`,
                            background: CROP_COLORS[idx % CROP_COLORS.length],
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="dash-crop-chips">
                    {model.cropBreakdown.map((item, idx) => (
                      <span key={item.cropId}>
                        <i
                          style={{
                            background: CROP_COLORS[idx % CROP_COLORS.length],
                          }}
                        />
                        {item.cropName} · {item.areaHa} ha ({item.count})
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="dash-empty-note">
                  Add a growing area to see your crop distribution.
                </p>
              )}
            </div>
            <div className="dash-mix-col">
              <h4>Latest point observations</h4>
              <div className="dash-signal-bars">
                {[
                  [
                    "Normal leaves",
                    model.observationsSummary.normalLeaves,
                    "#2b7a53",
                  ],
                  [
                    "Leaf colour changes",
                    model.observationsSummary.yellowingOrBrowning,
                    "#cf912e",
                  ],
                  [
                    "Standing water",
                    model.observationsSummary.waterlogged,
                    "#357b99",
                  ],
                  [
                    "Insects counted",
                    model.observationsSummary.withPests,
                    "#c4573b",
                  ],
                ].map(([label, count, color]) => (
                  <div className="dash-signal-row" key={label as string}>
                    <span>{label as string}</span>
                    <div aria-hidden="true">
                      <i
                        style={{
                          width: `${((count as number) / obsMax) * 100}%`,
                          background: color as string,
                        }}
                      />
                    </div>
                    <strong>{count as number}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </figure>
      </div>

      <div className="dashboard-field-heading">
        <div>
          <h2>Your fields &amp; growing areas</h2>
          <p>
            Status comes from saved visits and tasks. It does not confirm that a
            crop is healthy or diseased.
          </p>
        </div>
        <div
          className="dash-status-pills"
          role="group"
          aria-label="Filter by status"
        >
          {(
            [
              ["all", "All areas"],
              ["attention", "Needs attention"],
              ["ok", "On track"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              className={statusFilter === id ? "active" : ""}
              onClick={() => setStatusFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-field-filters">
        <label>
          Find a field
          <input
            type="search"
            placeholder="Field name or town"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Crop
          <select value={crop} onChange={(e) => setCrop(e.target.value)}>
            <option value="">All crops</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <span>
          Showing {rows.length} of {model.fields.length} area(s) · charts cover
          all included areas
        </span>
      </div>

      <div className="dashboard-field-grid">
        {rows.map((row) => (
          <article className="dashboard-field-card" key={row.field.id}>
            <div className={`dashboard-field-visual crop-${row.season.crop}`}>
              {row.photo ? (
                <img
                  src={row.photo.url}
                  alt={`Your saved ${row.photo.kind} photo for ${row.field.name}`}
                  loading="lazy"
                />
              ) : row.field.isIllustrative ? (
                <img
                  src="/images/samples/point1-yellowing-wet.jpg"
                  alt={`Illustrative sample view for ${row.field.name}`}
                  loading="lazy"
                />
              ) : (
                <div>
                  <Icon
                    name={row.season.crop === "coconut" ? "sun" : "leaf"}
                    size={42}
                  />
                  <span>{row.crop}</span>
                  <small>No field photo added</small>
                </div>
              )}
              <span className="dashboard-crop-tag">
                {row.crop}
                {row.field.isIllustrative ? " · Example" : ""}
              </span>
            </div>
            <div className="dashboard-field-body">
              <span
                className={`dashboard-status ${row.overdue || row.changes ? "attention" : ""}`}
              >
                {row.status}
              </span>
              <h3>{row.field.name}</h3>
              <p>
                {row.field.locality} · {row.field.areaHectares} hectares
              </p>
              <p>
                {row.season.name} · {row.season.variety}
              </p>
              <dl>
                <div>
                  <dt>Growth stage</dt>
                  <dd>
                    {row.season.growthStage === "not-set"
                      ? "Not set"
                      : row.season.growthStage}
                  </dd>
                </div>
                <div>
                  <dt>Last field check</dt>
                  <dd>
                    {row.last
                      ? row.last.observedAt.toLocaleDateString("en-GB")
                      : "Not recorded"}
                  </dd>
                </div>
                <div>
                  <dt>Visits &amp; changes</dt>
                  <dd>
                    {row.visits.length}{" "}
                    {row.visits.length === 1 ? "visit" : "visits"}
                    {row.changes
                      ? ` · ${row.changes} ${row.changes === 1 ? "point" : "points"} changed`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt>Jobs still to do</dt>
                  <dd>
                    {row.pending}
                    {row.overdue ? ` · ${row.overdue} overdue` : ""}
                  </dd>
                </div>
              </dl>
              <div className="dashboard-card-actions">
                <button
                  onClick={() => onOpen(row.field.id, row.season.id, "field")}
                >
                  Open field
                </button>
                <button
                  onClick={() => onOpen(row.field.id, row.season.id, "visit")}
                >
                  Record visit
                </button>
                <button
                  onClick={() =>
                    onOpen(row.field.id, row.season.id, "concerns")
                  }
                >
                  Concerns
                </button>
                <button
                  onClick={() => onOpen(row.field.id, row.season.id, "tasks")}
                >
                  Jobs
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!rows.length && (
        <div className="report-empty">
          <h3>
            {model.fields.length
              ? "No fields match these filters"
              : "Add your first growing area"}
          </h3>
          <p>
            {model.fields.length
              ? "Clear the name, crop or status filter to see more fields."
              : "Give each field or planting area a name and crop. Your cards and charts will fill as you save visits and work."}
          </p>
          <button onClick={onAdd}>Add a growing area</button>
        </div>
      )}
    </div>
  );
}
