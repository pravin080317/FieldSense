import type { Workspace } from "../types/workspace";
import { localDate } from "../services/workspace";
import { homeSummary } from "../services/home";
import { Icon } from "./Visuals";

export type HomeDestination =
  | "field"
  | "record"
  | "tasks"
  | "history"
  | "reports";

function dateLabel(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

const WORKFLOW_STEPS = [
  {
    step: "01",
    icon: "pin",
    title: "Geospatial mapping",
    copy: "Pin live satellite boundaries, drone orthomosaic layers and crop stage.",
  },
  {
    step: "02",
    icon: "scan",
    title: "Computer Vision scan",
    copy: "Run live HSV + Excess Green (ExG) pixel analysis on field photos to quantify leaf stress.",
  },
  {
    step: "03",
    icon: "leaf",
    title: "Hybrid AI reasoning",
    copy: "Fuse CV metrics, soil/water reports and rainfall in our weighted AI model + Gemini AI.",
  },
  {
    step: "04",
    icon: "book",
    title: "Verify & track",
    copy: "Plan follow-up checks, compare revisits side by side and audit every AI decision.",
  },
] as const;

const FEATURE_PILLARS = [
  {
    icon: "scan",
    tag: "COMPUTER VISION (HSV + ExG)",
    title: "In-browser leaf stress segmentation",
    copy: "Quantifies healthy green canopy, yellow chlorosis and brown necrosis directly from field photos using real pixel-level HSV and Excess Green algorithms.",
  },
  {
    icon: "chart",
    tag: "EXPLAINABLE AI SCORING",
    title: "Weighted multi-criteria evidence engine",
    copy: "Fuses spatial symptom spread, drainage state, pest pressure and soil lab reports into a transparent 0–100 priority index with feature weights.",
  },
  {
    icon: "leaf",
    tag: "MULTIMODAL GEMINI AI",
    title: "Grounded AI agronomist synthesis",
    copy: "Combines structured field records, weather forecasts and crop imagery in Gemini AI to recommend the highest-value next field check.",
  },
] as const;

const CROP_CHIPS = [
  "Rice",
  "Wheat",
  "Tomato",
  "Chilli",
  "Flowers",
  "Coconut",
  "Groundnut",
];

export function FarmerHome({
  workspace,
  onAddField,
  onOpen,
  onSample,
  onDashboard,
  onHelp,
  today = localDate(),
}: {
  workspace: Workspace;
  onAddField: () => void;
  onOpen: (field: string, season: string, destination: HomeDestination) => void;
  onSample: () => void;
  onDashboard: () => void;
  onHelp: () => void;
  today?: string;
}) {
  const { areas, active, jobs, due, attention, firstChecks, visits } =
    homeSummary(workspace, today);
  const firstTime = !areas.length;

  function open(destination: HomeDestination) {
    if (active) onOpen(active.field.id, active.season.id, destination);
    else onAddField();
  }

  return (
    <div className="farmer-home today-home">
      <header className="today-topline">
        <div className="today-topline-left">
          <span className="today-date-pill">
            <Icon name="sun" size={16} />
            {new Date(today + "T12:00:00").toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
          <span className="today-mode-pill">
            <i aria-hidden="true" />
            {firstTime ? "Offline-ready · Sample included" : "Saved on device"}
          </span>
        </div>
        <button className="today-help-btn" onClick={onHelp}>
          <Icon name="help" size={16} />
          Help guide
        </button>
      </header>

      <section
        className={`today-hero ${firstTime ? "today-hero-new" : "today-hero-returning"}`}
        aria-labelledby="today-title"
      >
        <div className="today-hero-copy">
          <span className="today-eyebrow-pill">
            <Icon name="leaf" size={13} />
            FIELDSENSE AI · MULTIMODAL CROP DECISION SYSTEM
          </span>
          <h1 id="today-title">
            {firstTime ? (
              <>
                Your farm,
                <br />
                <span>guided by explainable AI.</span>
              </>
            ) : (
              <>
                Your farm <span>today.</span>
              </>
            )}
          </h1>
          <p className="today-hero-lead">
            {firstTime
              ? "A 3-layer agricultural AI system combining in-browser Computer Vision (HSV + ExG), a weighted multi-criteria evidence engine, and Gemini multimodal reasoning."
              : due.length
                ? `${due.length} ${due.length === 1 ? "job needs" : "jobs need"} your attention across your growing areas. Review planned work and update your AI evidence model with your latest check.`
                : "Your field schedule is clear today. Record a quick field check or run a Computer Vision leaf scan to update your AI priority score."}
          </p>

          <div className="today-hero-actions">
            <button
              className="primary today-cta-primary"
              onClick={firstTime ? onAddField : () => open("record")}
            >
              <Icon name={firstTime ? "plus" : "camera"} size={18} />
              {firstTime ? "Add my first growing area" : "Record a field check"}
              <Icon name="arrow" size={16} />
            </button>
            <button
              className="today-cta-secondary"
              onClick={firstTime ? onSample : onDashboard}
            >
              <Icon name={firstTime ? "field" : "chart"} size={17} />
              {firstTime ? "Explore sample field" : "Whole-farm dashboard"}
            </button>
          </div>

          {firstTime ? (
            <div className="today-crop-chips" aria-label="Supported crops">
              {CROP_CHIPS.map((crop) => (
                <span key={crop}>{crop}</span>
              ))}
              <span className="today-chip-more">+5 more</span>
            </div>
          ) : (
            <div className="today-active-pill">
              <Icon name="pin" size={14} />
              <span>
                Active area: <strong>{active!.field.name}</strong> ·{" "}
                {active!.crop}
              </span>
            </div>
          )}
        </div>

        {firstTime ? (
          <div className="today-hero-visual" aria-label="Illustrative animated field preview">
            <img
              src="/images/paddy-hero.gif"
              alt="Animated field reel transitioning between sunlit Tamil Nadu paddy, lush green rice tillers, and top-down drone orthomosaic view"
            />
            <div className="today-visual-scrim" aria-hidden="true" />
            <span className="today-visual-badge">
              <i className="today-pulse-dot" aria-hidden="true" />
              Illustrative field view · Salem sample
            </span>
            <div className="today-visual-card">
              <span className="today-visual-card-label">
                AI EVIDENCE PIPELINE
              </span>
              <div className="today-visual-steps">
                <span>
                  <Icon name="camera" size={15} />
                  Capture
                </span>
                <Icon name="chevron" size={14} />
                <span>
                  <Icon name="leaf" size={15} />
                  AI Score
                </span>
                <Icon name="chevron" size={14} />
                <span>
                  <Icon name="check" size={15} />
                  Follow up
                </span>
              </div>
              <p>Computer Vision (HSV/ExG) · Weighted AI · Gemini AI.</p>
            </div>
          </div>
        ) : (
          <div className="today-farm-snapshot" aria-label="Saved farm records">
            <span className="today-snapshot-eyebrow">SAVED FARM SNAPSHOT</span>
            <div className="today-kpi-grid">
              <div className="today-kpi-tile">
                <strong>{areas.length}</strong>
                <span>
                  {areas.length === 1 ? "Growing area" : "Growing areas"}
                </span>
              </div>
              <div
                className={`today-kpi-tile ${due.length ? "today-kpi-alert" : ""}`}
              >
                <strong>{due.length}</strong>
                <span>{due.length === 1 ? "Job due" : "Jobs due"}</span>
              </div>
              <div className="today-kpi-tile">
                <strong>{visits}</strong>
                <span>{visits === 1 ? "Saved visit" : "Saved visits"}</span>
              </div>
            </div>
            <p className="today-snapshot-note">
              Counts reflect your saved records on this device, not a live
              sensor reading.
            </p>
          </div>
        )}
      </section>

      {firstTime ? (
        <>
          <section
            className="today-workflow-section"
            aria-labelledby="workflow-title"
          >
            <div className="today-section-heading">
              <div>
                <span className="today-eyebrow">HOW FIELDSENSE WORKS</span>
                <h2 id="workflow-title">
                  From first observation to verified follow-up
                </h2>
              </div>
              <button className="today-link-btn" onClick={onAddField}>
                Start in 1 minute
                <Icon name="arrow" size={15} />
              </button>
            </div>
            <div className="today-workflow-grid">
              {WORKFLOW_STEPS.map((item) => (
                <article className="today-workflow-card" key={item.step}>
                  <div className="today-workflow-head">
                    <span className="today-icon">
                      <Icon name={item.icon} size={20} />
                    </span>
                    <span className="today-step-code">{item.step}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            className="today-pillars"
            aria-label="What you can keep track of"
          >
            {FEATURE_PILLARS.map((pillar) => (
              <article className="today-pillar-card" key={pillar.title}>
                <div className="today-pillar-top">
                  <span className="today-icon">
                    <Icon name={pillar.icon} size={20} />
                  </span>
                  <span className="today-eyebrow">{pillar.tag}</span>
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
              </article>
            ))}
          </section>

          <aside className="today-demo-banner">
            <div className="today-demo-banner-copy">
              <span className="today-demo-pill">INTERACTIVE DEMO</span>
              <div>
                <h3>Want to see a complete field investigation first?</h3>
                <p>
                  Open the clearly labelled <strong>Salem paddy sample</strong>{" "}
                  to explore scouting points, soil/rain evidence and follow-up
                  comparisons without mixing into your own records.
                </p>
              </div>
            </div>
            <button className="today-demo-btn" onClick={onSample}>
              Open sample field
              <Icon name="arrow" size={16} />
            </button>
          </aside>
        </>
      ) : (
        <>
          <section
            className="today-attention"
            aria-labelledby="today-attention-title"
          >
            <div className="today-section-heading">
              <div>
                <span className="today-eyebrow">PRIORITY QUEUE</span>
                <h2 id="today-attention-title">What needs attention?</h2>
              </div>
              <button className="today-link-btn" onClick={() => open("tasks")}>
                Jobs for {active!.field.name}
                <Icon name="arrow" size={15} />
              </button>
            </div>
            <div className="today-attention-grid">
              {attention.map(({ task, area }) => (
                <article className="today-action-card" key={task.id}>
                  <span
                    className={`today-status ${task.dueDate < today ? "today-status-overdue" : ""}`}
                  >
                    <Icon name="calendar" size={14} />
                    {task.dueDate < today ? "Overdue" : "Due today"} ·{" "}
                    {dateLabel(task.dueDate)}
                  </span>
                  <span className="today-area-name">
                    {area.field.name} · {area.crop}
                  </span>
                  <h3>{task.title}</h3>
                  <p>
                    Planned for {dateLabel(task.dueDate)}. Review the job and
                    record what was done.
                  </p>
                  <button
                    onClick={() =>
                      onOpen(area.field.id, area.season.id, "tasks")
                    }
                  >
                    Review this job
                    <Icon name="arrow" size={16} />
                  </button>
                </article>
              ))}
              {!attention.length && (
                <article className="today-action-card today-calm">
                  <span className="today-icon">
                    <Icon name="check" size={20} />
                  </span>
                  <h3>No jobs due today.</h3>
                  <p>
                    {jobs[0]
                      ? `Your next planned job is “${jobs[0].title}” on ${dateLabel(jobs[0].dueDate)}.`
                      : "Choose a date for your next visit or add work you want to remember."}{" "}
                    This reflects your saved job list, not the condition of your
                    crops.
                  </p>
                  <button
                    onClick={() =>
                      jobs[0]
                        ? onOpen(jobs[0].fieldId, jobs[0].seasonId, "tasks")
                        : open("tasks")
                    }
                  >
                    {jobs[0] ? "See the next job" : "Plan a job"}
                    <Icon name="arrow" size={16} />
                  </button>
                </article>
              )}
              {attention.length < 3 && (
                <article className="today-action-card today-action-accent">
                  <span className="today-icon">
                    <Icon name="camera" size={20} />
                  </span>
                  <span className="today-area-name">
                    {(firstChecks[0] || active)!.field.name} ·{" "}
                    {(firstChecks[0] || active)!.crop}
                  </span>
                  <h3>
                    {firstChecks.length
                      ? "Start a first field check"
                      : "Log what you notice today"}
                  </h3>
                  <p>
                    {firstChecks.length
                      ? "No field check is saved for this planting yet. Add a photo and a few observations."
                      : "Save a dated photo and note so you can compare changes on your next visit."}
                  </p>
                  <button
                    onClick={() => {
                      const a = firstChecks[0] || active!;
                      onOpen(a.field.id, a.season.id, "record");
                    }}
                  >
                    Record a check
                    <Icon name="arrow" size={16} />
                  </button>
                </article>
              )}
            </div>
            {due.length > 3 && (
              <p className="today-muted">
                Showing the first 3 of {due.length} due jobs. Open the farm
                dashboard to see work across all areas.
              </p>
            )}
          </section>

          <section className="today-areas" aria-labelledby="today-areas-title">
            <div className="today-section-heading">
              <div>
                <span className="today-eyebrow">SEPARATE FIELD RECORDS</span>
                <h2 id="today-areas-title">Your growing areas</h2>
              </div>
              <button className="today-add-area-btn" onClick={onAddField}>
                <Icon name="plus" size={15} />
                Add an area
              </button>
            </div>
            <div className="today-area-grid">
              {areas.slice(0, 3).map((a) => (
                <button
                  className="today-area-card"
                  key={a.field.id}
                  onClick={() => onOpen(a.field.id, a.season.id, "field")}
                >
                  <span className="today-area-media">
                    {a.photo ? (
                      <img
                        src={a.photo.url}
                        alt={`Saved photo for ${a.field.name}`}
                        loading="lazy"
                      />
                    ) : (
                      <span
                        className={`today-crop-art today-crop-${a.season.crop}`}
                      >
                        <Icon name="leaf" size={28} />
                        <small>No field photo yet</small>
                      </span>
                    )}
                    <span className="today-area-crop-tag">{a.crop}</span>
                  </span>
                  <span className="today-area-body">
                    <strong>{a.field.name}</strong>
                    <span className="today-area-meta">
                      {a.last
                        ? `Last check: ${a.last.observedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                        : "No check saved for this planting"}
                    </span>
                    <span className="today-area-footer">
                      <span>
                        {a.pending} {a.pending === 1 ? "job" : "jobs"} to do
                      </span>
                      <Icon name="arrow" size={15} />
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="today-areas-bar">
              <button className="today-all-areas" onClick={onDashboard}>
                See all {areas.length} growing{" "}
                {areas.length === 1 ? "area" : "areas"} &amp; graphs
                <Icon name="arrow" size={16} />
              </button>
              <p className="today-muted">
                Showing your chosen planting for the open area and latest added
                planting for others. Earlier records stay in History.
              </p>
            </div>
          </section>

          <nav
            className="today-shortcuts"
            aria-label={`Records for ${active!.field.name}`}
          >
            <span className="today-shortcuts-label">
              Quick records for <strong>{active!.field.name}</strong>
            </span>
            <div className="today-shortcut-pills">
              <button onClick={() => open("field")}>
                <Icon name="field" size={16} />
                Field &amp; map
              </button>
              <button onClick={() => open("history")}>
                <Icon name="book" size={16} />
                Visits, work &amp; costs
              </button>
              <button onClick={() => open("reports")}>
                <Icon name="report" size={16} />
                Soil &amp; water papers
              </button>
            </div>
          </nav>
        </>
      )}

      <footer className="today-storage">
        <span className="today-storage-icon">
          <Icon name="book" size={16} />
        </span>
        <p>
          Saved locally on this device in your browser. Export a backup before
          switching phones.
        </p>
        <button onClick={onHelp}>
          Backup guide
          <Icon name="arrow" size={14} />
        </button>
      </footer>
    </div>
  );
}
