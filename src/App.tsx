import { ReportRecords } from "./components/ReportRecords";
import { OfflineStatus } from "./components/OfflineStatus";
import { VisitComparison } from "./components/VisitComparison";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { EvidenceEngine } from "./services/EvidenceEngine";
import { scenarioA, scenarioB, scenarioC } from "./data/sampleData";
import type { FarmField, FarmSeason, Theme } from "./types/farm";
import type { Observation, Field } from "./types/domain";
import type {
  Workspace,
  StoredPhoto,
  DiaryEntry,
  SavedFollowUp,
  Visit,
} from "./types/workspace";
import { WorkspaceRepository } from "./services/WorkspaceRepository";
import {
  createWorkspace,
  latestObservations,
  newObservation,
  appendObservation,
  exportBackup,
  parseBackup,
  mergeBackup,
  localDate,
  historyNewestFirst,
} from "./services/workspace";
import { Icon } from "./components/Visuals";
import { HelpCenter, HelpHint, PhotoGuide } from "./components/Help";
import "./App.css";
import { FieldControls } from "./components/FieldControls";
import { TaskBoard } from "./components/TaskBoard";
import { GeographicMap } from "./components/GeographicMap";
import {
  addField,
  addSeason,
  updateField,
  createTask,
  fieldPoints,
  parseSeason,
} from "./services/farm";
import "./Farmer.css";
import "./Controls.css";
const RiceReferenceLibrary = lazy(
  () => import("./components/RiceReferenceLibrary"),
);
const FieldImagery = lazy(() => import("./components/FieldImagery"));
const ActivityLedger = lazy(() => import("./components/ActivityLedger"));
const cases = { A: scenarioA, B: scenarioB, C: scenarioC };
type Case = keyof typeof cases;
const pages = [
  ["Overview", "home"],
  ["My field", "field"],
  ["Field scouting", "scan"],
  ["Crop health", "leaf"],
  ["Soil & weather", "drop"],
  ["Farm diary", "book"],
  ["Action plan", "calendar"],
  ["Case report", "report"],
] as const;
type Page = (typeof pages)[number][0];
const pageLabels: Record<Page, string> = {
  Overview: "Home",
  "My field": "My field",
  "Field scouting": "Record visit",
  "Crop health": "Crop concerns",
  "Soil & weather": "Soil & rain",
  "Farm diary": "History",
  "Action plan": "Next steps",
  "Case report": "Expert report",
};
const mainPages = pages
  .filter(([p]) =>
    [
      "Overview",
      "My field",
      "Field scouting",
      "Action plan",
      "Farm diary",
    ].includes(p),
  )
  .sort(
    ([a], [b]) =>
      [
        "Overview",
        "My field",
        "Field scouting",
        "Action plan",
        "Farm diary",
      ].indexOf(a) -
      [
        "Overview",
        "My field",
        "Field scouting",
        "Action plan",
        "Farm diary",
      ].indexOf(b),
  );
const toolPages = pages.filter(
  ([p]) => !mainPages.some(([primary]) => primary === p),
);
const farmerChecks: Record<string, { title: string; check: string }> = {
  waterlogging: {
    title: "Very wet soil around the roots",
    check: "Check the wet patch and see whether water can drain away.",
  },
  nutrient: {
    title: "A possible soil or nutrient problem",
    check:
      "Compare leaves near the ground with leaves near the top. Check whether a soil report is available for this field.",
  },
  disease: {
    title: "Leaf marks that need checking",
    check:
      "Take clear photos of both sides of the affected leaves and compare with a healthy plant.",
  },
  pest: {
    title: "Possible damage from insects",
    check:
      "Look closely at the insects and repeat the count at all four marked places.",
  },
};
type Photo = StoredPhoto;
type Entry = DiaryEntry;
type Follow = SavedFollowUp;
// Retain the repository's loaded revision while React preserves state on a dev hot update.
const repository: WorkspaceRepository | null =
  import.meta.hot?.data.workspaceRepository ??
  (typeof indexedDB === "undefined"
    ? null
    : new WorkspaceRepository(indexedDB));
if (import.meta.hot)
  import.meta.hot.dispose((data) => {
    data.workspaceRepository = repository;
  });
const routeFor = (p: Page) =>
  p.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-");
const pageFromHash = (): Page =>
  pages.find(([p]) => routeFor(p) === window.location.hash.slice(1))?.[0] ||
  "Overview";
export default function App() {
  const [loaded, setLoaded] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        if (!repository)
          throw new Error("IndexedDB is unavailable in this browser.");
        const result = await repository.load(localStorage, () =>
          createWorkspace("A", scenarioA.observations),
        );
        if (active) {
          setLoaded(result.workspace);
          setError("");
        }
      } catch (e) {
        if (active)
          setError(
            e instanceof Error ? e.message : "Could not read saved data.",
          );
      }
    };
    void initialize();
    return () => {
      active = false;
    };
  }, [attempt]);
  if (!loaded)
    return (
      <main className="startup-screen">
        <Icon name="leaf" size={40} />
        <h1>
          {error
            ? "Your saved records need attention"
            : "Opening your field records…"}
        </h1>
        <p role={error ? "alert" : "status"}>
          {error ||
            "Reading your device workspace. Existing records will not be replaced."}
        </p>
        {error && (
          <>
            <p>
              The original saved data has been kept. Enable device storage or
              retry after closing other FieldSense tabs.
            </p>
            <button onClick={() => setAttempt((a) => a + 1)}>
              Retry loading records
            </button>
          </>
        )}
      </main>
    );
  return <FarmApp initial={loaded} />;
}
function Panel({
  title,
  detail,
  children,
  action,
}: {
  title: string;
  detail?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {detail && <p>{detail}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function FarmApp({ initial }: { initial: Workspace }) {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [scenario, setScenario] = useState<Case>(initial?.scenario || "A");
  const [history, setHistory] = useState<Observation[]>(
    initial?.obs || scenarioA.observations,
  );
  const [allPhotos, setPhotos] = useState<Photo[]>(initial?.photos || []);
  const [allEntries, setEntries] = useState<Entry[]>(initial?.entries || []);
  const [legacyFollow, setLegacyFollow] = useState<Follow | null>(
    initial?.follow || null,
  );
  const [fields, setFields] = useState(initial.fields);
  const [seasons, setSeasons] = useState(initial.seasons);
  const [tasks, setTasks] = useState(initial.tasks);
  const [fieldReports, setFieldReports] = useState(initial.fieldReports);
  const [imagery, setImagery] = useState(initial.imagery);
  const [selectedFieldId, setSelectedFieldId] = useState(
    initial.selectedFieldId,
  );
  const [selectedSeasonId, setSelectedSeasonId] = useState(
    initial.selectedSeasonId,
  );
  const [theme, setTheme] = useState<Theme>(initial.theme);
  const activeField = fields.find((f) => f.id === selectedFieldId)!;
  const activeSeason = seasons.find(
    (s) => s.id === selectedSeasonId && s.fieldId === selectedFieldId,
  )!;
  const demoField: Field = {
    id: activeField.id,
    name: activeField.name,
    location: activeField.location,
    areaHectares: activeField.areaHectares,
    cropType: `Rice (${activeSeason.variety})`,
    season: {
      id: activeSeason.id,
      fieldId: activeField.id,
      year: Number(activeSeason.sowingDate.slice(0, 4)),
      season: activeField.isIllustrative ? "kharif" : "custom",
      sowingDate: new Date(activeSeason.sowingDate),
      expectedHarvestDate: new Date(activeSeason.expectedHarvestDate),
    },
  };
  const scoutingPoints = fieldPoints(activeField);
  const currentHistory = history.filter(
    (o) => o.fieldId === activeField.id && o.seasonId === activeSeason.id,
  );
  const photos = allPhotos.filter(
    (p) =>
      (p.fieldId || "field-01") === activeField.id &&
      (p.seasonId || "season-2024-k") === activeSeason.id,
  );
  const entries = allEntries.filter(
    (e) =>
      (e.fieldId || "field-01") === activeField.id &&
      (e.seasonId || "season-2024-k") === activeSeason.id,
  );
  const fieldTasks = tasks.filter(
    (t) => t.fieldId === activeField.id && t.seasonId === activeSeason.id,
  );
  const pendingTasks = fieldTasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const follow: Follow | null = pendingTasks[0]
    ? {
        action: pendingTasks[0].title,
        date: pendingTasks[0].dueDate,
        outcome: pendingTasks[0].outcome,
        notes: pendingTasks[0].notes,
      }
    : null;
  const [point, setPoint] = useState("pt-1");
  const [report, setReport] = useState(initial?.report || "scenario");
  const [rain, setRain] = useState<number>(initial?.rain ?? 48);
  const [message, setMessage] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [lastSaved, setLastSaved] = useState<Workspace>(initial);
  const [saveFailure, setSaveFailure] = useState("");
  const [visits, setVisits] = useState<Visit[]>(initial.visits);
  const [reviewDate, setReviewDate] = useState(initial.reviewDate);
  const nowInput = () => {
    const now = new Date();
    return `${localDate(now)}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };
  const [observationTime, setObservationTime] = useState(nowInput);
  const [restorePreview, setRestorePreview] = useState<Workspace | null>(null);
  const [retrySave, setRetrySave] = useState(0);
  const workspace = useMemo<Workspace>(() => {
    const snapshot: Workspace = {
      schemaVersion: 4,
      scenario,
      obs: history,
      visits,
      photos: allPhotos,
      entries: allEntries,
      follow: legacyFollow,
      fields,
      seasons,
      tasks,
      fieldReports,
      imagery,
      selectedFieldId,
      selectedSeasonId,
      theme,
      report,
      rain,
      reviewDate,
    };
    return (Object.keys(snapshot) as (keyof Workspace)[]).every(
      (key) => snapshot[key] === initial[key],
    )
      ? initial
      : snapshot;
  }, [
    scenario,
    history,
    visits,
    allPhotos,
    allEntries,
    legacyFollow,
    fields,
    seasons,
    tasks,
    fieldReports,
    imagery,
    selectedFieldId,
    selectedSeasonId,
    theme,
    report,
    rain,
    reviewDate,
    initial,
  ]);
  const saveStatus = storageError
    ? "error"
    : lastSaved === workspace
      ? "saved"
      : "saving";
  const obs = latestObservations(
    currentHistory,
    new Date(reviewDate + "T23:59:59"),
  );

  const [demoOpen, setDemoOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [photoGuideOpen, setPhotoGuideOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Observation | null>(null);
  const [operation, setOperation] = useState("Irrigation");
  const [operationDate, setOperationDate] = useState(localDate());
  const [operationNotes, setOperationNotes] = useState("");
  const [cost, setCost] = useState("");
  const [action, setAction] = useState(initial?.follow?.action || "");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    // Opening a saved workspace must not write or invalidate another tab.
    if (lastSaved === workspace) return;
    let active = true;
    if (repository)
      repository.save(workspace).then(
        () => {
          if (active) {
            setStorageError(false);
            setSaveFailure("");
            setLastSaved(workspace);
          }
        },
        (e) => {
          if (active) {
            setStorageError(true);
            setSaveFailure(
              e instanceof Error ? e.message : "Could not save records.",
            );
          }
        },
      );
    return () => {
      active = false;
    };
  }, [workspace, retrySave, lastSaved]);
  useEffect(() => {
    const protectUnsaved = (e: BeforeUnloadEvent) => {
      if (lastSaved !== workspace) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", protectUnsaved);
    return () => window.removeEventListener("beforeunload", protectUnsaved);
  }, [workspace, lastSaved]);
  useEffect(() => {
    const onRoute = () => {
      setPage(pageFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onRoute);
    return () => window.removeEventListener("hashchange", onRoute);
  }, []);
  useEffect(() => {
    document.title = pageLabels[page] + " | FieldSense";
  }, [page]);
  const soil =
    report === "absent" ||
    !activeField.isIllustrative ||
    activeSeason.id !== "season-2024-k"
      ? []
      : cases[scenario].soilTests.map((s) => ({
          ...s,
          fieldId: report === "wrong" ? "other-field" : s.fieldId,
          testedAt: report === "stale" ? new Date("2023-01-01") : s.testedAt,
        }));
  const weather =
    activeField.isIllustrative && activeSeason.id === "season-2024-k"
      ? [
          {
            id: "rain-1",
            fieldId: demoField.id,
            observedAt: new Date("2024-10-17"),
            recordedAt: new Date("2024-10-18"),
            source: "weather" as const,
            verificationStatus: "unverified" as const,
            isIllustrative: true,
            rainfallMm: rain,
            units: "mm" as const,
          },
        ]
      : [];
  const analysis = EvidenceEngine.analyze(
    demoField,
    currentHistory,
    soil,
    [],
    new Date(reviewDate + "T23:59:59"),
    weather,
  );
  const recentObs = obs.filter(
    (o) =>
      new Date(reviewDate + "T23:59:59").getTime() - o.observedAt.getTime() <=
      14 * 86400000,
  );
  const affected = recentObs
    .filter((o) => o.leafColor && o.leafColor !== "normal")
    .map((o) => o.scoutingPointId || "");
  const supported = analysis.explanations.filter(
    (e) => e.status === "supported",
  );
  const selected = obs.find((o) => o.scoutingPointId === point);
  const current = draft || selected;
  const progress = new Set(recentObs.map((o) => o.scoutingPointId)).size;
  function go(p: Page) {
    window.location.hash = routeFor(p);
    setPage(p);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function selectPoint(p: string) {
    setPoint(p);
    setDraft(null);
  }
  function edit(patch: Partial<Observation>) {
    setDraft({ ...current, ...patch } as Observation);
  }
  function saveObservation() {
    if (!current?.leafColor || !current?.soilCondition) {
      setMessage("Record leaf appearance and soil condition before saving.");
      return false;
    }
    try {
      if (localDate(new Date(observationTime)) < activeSeason.sowingDate)
        throw new Error(
          "This visit is before the selected season started. Choose the correct season or observation date.",
        );
      const observation = newObservation(
        current,
        {},
        point,
        new Date(observationTime),
        new Date(),
        { fieldId: activeField.id, seasonId: activeSeason.id },
      );
      const next = appendObservation(workspace, observation);
      setHistory(next.obs);
      setVisits(next.visits);
      const day = localDate(observation.observedAt);
      if (day > reviewDate) setReviewDate(day);
      setDraft(null);
      setMessage(
        "New visit saved. Earlier observations remain in your history.",
      );
      return true;
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not save observation.",
      );
      return false;
    }
  }
  function reset(s: Case) {
    const sampleIds = new Set(
      history
        .filter((o) => o.isIllustrative && o.fieldId === "field-01")
        .map((o) => o.id),
    );
    if (
      tasks.some((task) =>
        task.observationIds.some((id) => sampleIds.has(id)),
      ) ||
      allPhotos.some(
        (photo) => photo.observationId && sampleIds.has(photo.observationId),
      )
    ) {
      setMessage(
        "Sample evidence is linked to a saved task or photo. Keep this sample case to preserve those links; use My field to add your own field or season.",
      );
      return;
    }
    setScenario(s);
    const seed = createWorkspace(s, cases[s].observations);
    setHistory((prev) => [
      ...prev.filter((o) => !(o.isIllustrative && o.fieldId === "field-01")),
      ...seed.obs,
    ]);
    setVisits((prev) => [
      ...prev.filter((v) => !(v.isIllustrative && v.fieldId === "field-01")),
      ...seed.visits,
    ]);
    setSelectedFieldId("field-01");
    setSelectedSeasonId("season-2024-k");
    setReviewDate(seed.reviewDate);
    setDraft(null);
    setReport("scenario");
    setRain(s === "A" ? 48 : 8);
    setStep(0);
    setMessage(
      "Sample records refreshed. Your entered records, fields and tasks were kept.",
    );
  }
  function selectScope(fieldId: string, seasonId: string) {
    if (!seasons.some((s) => s.id === seasonId && s.fieldId === fieldId))
      return;
    setSelectedFieldId(fieldId);
    setSelectedSeasonId(seasonId);
    setDraft(null);
    setPoint("pt-1");
    setStep(0);
    const own = history.filter(
      (o) => o.fieldId === fieldId && o.seasonId === seasonId,
    );
    const fallback = seasonId === "season-2024-k" ? "2024-10-19" : localDate();
    setReviewDate(
      own.reduce(
        (day, o) =>
          localDate(o.observedAt) > day ? localDate(o.observedAt) : day,
        fallback,
      ),
    );
    setAction("");
  }
  function saveFieldDetails(field: FarmField, season?: FarmSeason) {
    const next = season
      ? addField(workspace, field, season)
      : updateField(workspace, field);
    setFields(next.fields);
    setSeasons(next.seasons);
    setSelectedFieldId(next.selectedFieldId);
    setSelectedSeasonId(next.selectedSeasonId);
    setDraft(null);
    setPoint("pt-1");
    setAction("");
    if (season) setReviewDate(localDate());
    setMessage(
      season
        ? "Field and first crop season saved."
        : "Field details saved. Earlier evidence was kept.",
    );
  }
  function saveNewSeason(season: FarmSeason) {
    const next = addSeason(workspace, season);
    setSeasons(next.seasons);
    setSelectedFieldId(next.selectedFieldId);
    setSelectedSeasonId(next.selectedSeasonId);
    setDraft(null);
    setPoint("pt-1");
    setAction("");
    setReviewDate(localDate());
    setMessage(
      "New season saved. Earlier seasons and records are still available.",
    );
  }
  function upload(
    file: File | undefined,
    kind: string,
    observationId?: string,
  ) {
    if (!file) return;
    if (
      !/^image\/(png|jpeg|webp|gif|avif|bmp)$/i.test(file.type) ||
      file.size > 3000000
    ) {
      setMessage(
        "Choose a PNG, JPEG, WebP, GIF, AVIF or BMP image smaller than 3 MB.",
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotos((p) => [
        ...p,
        {
          id: crypto.randomUUID(),
          url: String(reader.result),
          point: observationId
            ? currentHistory.find((o) => o.id === observationId)
                ?.scoutingPointId || point
            : point,
          observationId,
          kind,
          recordedAt: new Date(),
          fieldId: activeField.id,
          seasonId: activeSeason.id,
        },
      ]);
      setMessage("Photo attached to " + point + ".");
    };
    reader.readAsDataURL(file);
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              field: demoField,
              imagery: imagery.filter(
                (r) =>
                  r.fieldId === selectedFieldId &&
                  r.seasonId === selectedSeasonId,
              ),
              fieldReports: fieldReports.filter(
                (r) =>
                  r.fieldId === selectedFieldId &&
                  r.seasonId === selectedSeasonId,
              ),
              scenario,
              evaluatedAt: reviewDate,
              observations: currentHistory,
              visits: visits.filter(
                (v) =>
                  v.fieldId === activeField.id &&
                  v.seasonId === activeSeason.id,
              ),
              tasks: fieldTasks,
              soil,
              weather,
              photos,
              analysis,
              operations: entries,
              followUp: follow,
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
    a.download = "fieldsense-case.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Case report exported.");
  }
  function downloadBackup() {
    const url = URL.createObjectURL(
      new Blob([exportBackup(workspace)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `fieldsense-backup-${localDate()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Restorable workspace backup downloaded.");
  }
  async function previewRestore(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 50000000)
        throw new Error("Backup must be smaller than 50 MB.");
      const incoming = parseBackup(await file.text());
      mergeBackup(workspace, incoming);
      setRestorePreview(incoming);
      setMessage("Backup validated. Review the restore preview below.");
    } catch (e) {
      setRestorePreview(null);
      setMessage(
        e instanceof Error
          ? e.message
          : "Invalid backup. Current records were kept.",
      );
    }
  }
  async function restoreBackup() {
    if (!restorePreview || !repository) return;
    try {
      const merged = mergeBackup(workspace, restorePreview);
      await repository.save(merged);
      setHistory(merged.obs);
      setVisits(merged.visits);
      setPhotos(merged.photos);
      setEntries(merged.entries);
      setLegacyFollow(merged.follow);
      setFields(merged.fields);
      setSeasons(merged.seasons);
      setTasks(merged.tasks);
      setSelectedFieldId(merged.selectedFieldId);
      setSelectedSeasonId(merged.selectedSeasonId);
      setTheme(merged.theme);
      setFieldReports(merged.fieldReports);
      setImagery(merged.imagery);
      setAction(merged.follow?.action || "");
      setReviewDate(merged.reviewDate);
      setRestorePreview(null);
      setMessage(
        "Backup merged. Existing records and current weather/report settings were retained.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Restore failed. Current records were kept.",
      );
    }
  }
  const map = (
    <GeographicMap field={activeField} point={point} onSelect={selectPoint} />
  );
  const gallery = (kind?: string) => (
    <div className="photo-grid">
      {photos
        .filter((p) => p.point === point && (!kind || p.kind === kind))
        .map((p) => (
          <figure key={p.id}>
            <img src={p.url} alt={`${p.kind} at ${p.point}`} />
            <figcaption>
              {p.kind} · {p.point}
            </figcaption>
          </figure>
        ))}
    </div>
  );
  const farmerNextCheck = recentObs.length
    ? farmerChecks[analysis.explanations[0]?.id]?.check ||
      analysis.nextRecommendedCheck
    : "Visit the four marked places and record what you see.";
  const nextTask = (
    <div className="next-task">
      <span className="icon-box amber">
        <Icon name="alert" />
      </span>
      <div>
        <span className="eyebrow">WHAT TO CHECK NEXT</span>
        <h3>{farmerNextCheck}</h3>
        <p>
          Look at plants with changes and plants that look normal. A photo alone
          cannot tell us the cause.
        </p>
        <button className="primary" onClick={() => go("Field scouting")}>
          Record a field visit <Icon name="arrow" size={17} />
        </button>
      </div>
    </div>
  );
  const explanations = (
    <div className="explanation-list">
      {analysis.explanations.map((e, i) => (
        <article className="explanation" key={e.id}>
          <div className="explanation-top">
            <span className="rank">0{i + 1}</span>
            <div>
              <h3>{farmerChecks[e.id]?.title || e.hypothesis}</h3>
              <span
                className={`pill ${e.status === "supported" ? "amber" : e.status === "unresolved" ? "blue" : "neutral"}`}
              >
                {e.status === "supported"
                  ? "Worth checking first"
                  : e.status === "unresolved"
                    ? "Still possible"
                    : "Not enough information"}
              </span>
            </div>
            <Icon
              name={
                e.id === "waterlogging"
                  ? "drop"
                  : e.id === "pest"
                    ? "bug"
                    : "leaf"
              }
            />
          </div>
          <p className="explanation-next">
            {farmerChecks[e.id]?.check || e.nextCheck}
          </p>
          <details open={page === "Case report"}>
            <summary>Why this is suggested</summary>
            <div className="evidence-content">
              <h4>What your records show</h4>
              {e.supportingEvidence.length ? (
                e.supportingEvidence.map((s) => <p key={s}>{s}</p>)
              ) : (
                <p>No matching signs have been recorded yet.</p>
              )}
              {e.weakeningEvidence.map((s) => (
                <p key={s}>Weakening: {s}</p>
              ))}
              <h4>What we still need</h4>
              {e.missingEvidence.map((s) => (
                <p key={s}>{s}</p>
              ))}
            </div>
          </details>
        </article>
      ))}
    </div>
  );
  const titles: Record<Page, string> = {
    Overview: "Your field at a glance.",
    "My field": "A closer look at your field.",
    "Field scouting": "What do you see in your field?",
    "Crop health": "Let’s understand the changes.",
    "Soil & weather": "Your soil, water and rainfall.",
    "Farm diary": "Your visits and farm work.",
    "Action plan": "Your next field visit.",
    "Case report": "A clear record to share with an expert.",
  };
  const descriptions: Record<Page, string> = {
    Overview:
      "Your latest records, what needs checking, and a simple next step.",
    "My field":
      "Keep your crop dates and return to the same places each visit.",
    "Field scouting":
      "Choose a marked place, look at the plants and soil, and save a few details.",
    "Crop health":
      "These are possible reasons for the changes you recorded. Start with a closer look.",
    "Soil & weather":
      "See when reports were taken and what the rainfall record can tell you.",
    "Farm diary":
      "Record field work and costs to give each observation context.",
    "Action plan":
      "Plan a check, return to the same plants, and record what changed.",
    "Case report":
      "Bring your photos, notes and unanswered questions to an agronomist or extension worker.",
  };
  return (
    <div className="app">
      <a
        className="skip-link"
        href="#content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("content")?.focus();
        }}
      >
        Skip to content
      </a>
      <aside className="sidebar">
        <button className="brand" onClick={() => go("Overview")}>
          <span className="brand-symbol">
            <Icon name="leaf" size={24} />
          </span>
          field<span>sense</span>
          <i />
        </button>
        <div className="workspace">
          <span className="workspace-icon">
            <Icon name="field" />
          </span>
          <div>
            <strong>Salem Farm</strong>
            <small>{activeField.locality}</small>
          </div>
        </div>
        <p className="nav-caption">YOUR FARM</p>
        <nav aria-label="Farm navigation" className="primary-nav">
          {mainPages.map(([p, icon]) => (
            <button
              key={p}
              className={page === p ? "active" : ""}
              aria-current={page === p ? "page" : undefined}
              onClick={() => go(p)}
            >
              <Icon name={icon} />
              <span>{pageLabels[p]}</span>
              {p === "Action plan" && <b>{pendingTasks.length}</b>}
              {page === p && <i />}
            </button>
          ))}
        </nav>
        <div className="secondary-navigation">
          <p className="nav-caption">FIELD TOOLS</p>
          <nav aria-label="Field tools" className="tool-nav">
            {toolPages.map(([p, icon]) => (
              <button
                key={p}
                className={page === p ? "active" : ""}
                aria-current={page === p ? "page" : undefined}
                onClick={() => go(p)}
              >
                <Icon name={icon} />
                <span>{pageLabels[p]}</span>
              </button>
            ))}
            <button
              className="help-nav-button"
              onClick={() => setHelpOpen(true)}
            >
              <Icon name="help" />
              <span>Help & photo guides</span>
            </button>
          </nav>
        </div>
        <button
          className="mobile-help-button"
          aria-label="Open help and photo guides"
          onClick={() => setHelpOpen(true)}
        >
          <Icon name="help" size={20} />
        </button>
        <div className="sidebar-bottom">
          <div className="season-mini">
            <span className="green-dot" /> {activeSeason.name.toUpperCase()}
            <p>{activeSeason.variety} rice</p>
            <div className="mini-progress">
              <i />
            </div>
            <small>
              {activeField.isIllustrative
                ? "Sample season"
                : activeSeason.growthStage === "not-set"
                  ? "Crop stage not confirmed"
                  : activeSeason.growthStage}
            </small>
          </div>
          <button className="profile" onClick={() => setDemoOpen(true)}>
            <span className="avatar">SF</span>
            <div>
              <strong>Salem Farm</strong>
              <small>Local demo workspace</small>
            </div>
            <Icon name="settings" size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <OfflineStatus />
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <Icon name="chevron" size={13} />
            <strong>{pageLabels[page]}</strong>
          </div>
          <div className="topbar-right">
            <span className="local-status">
              <span className="green-dot" />
              {saveStatus === "error"
                ? "Save failed — export a backup"
                : saveStatus === "saving"
                  ? "Saving records…"
                  : "Saved on this device"}
            </span>
            <button className="topbar-help" onClick={() => setHelpOpen(true)}>
              <Icon name="help" size={17} /> Help
            </button>
            <details className="mobile-tools">
              <summary>
                More <Icon name="settings" size={16} />
              </summary>
              <div>
                {toolPages.map(([p, icon]) => (
                  <button
                    key={p}
                    onClick={(e) => {
                      go(p);
                      e.currentTarget
                        .closest("details")
                        ?.removeAttribute("open");
                    }}
                  >
                    <Icon name={icon} size={17} />
                    {pageLabels[p]}
                  </button>
                ))}
              </div>
            </details>
            <button
              className="demo-button"
              aria-expanded={demoOpen}
              onClick={() => setDemoOpen(!demoOpen)}
            >
              <Icon name="settings" size={15} /> Demo controls
            </button>
            <label className="theme-control">
              <Icon name="sun" size={16} />
              <select
                aria-label="App theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
              >
                <option value="forest">Forest</option>
                <option value="earth">Earth</option>
                <option value="night">Night</option>
              </select>
            </label>
          </div>
        </header>
        <main id="content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {page === "Overview"
                  ? "YOUR FIELD COMPANION"
                  : "SALEM FARM · PADDY"}
              </p>
              <h1>{titles[page]}</h1>
              <p className="page-description">{descriptions[page]}</p>
            </div>
            <button
              className={page === "Overview" ? "primary" : "secondary"}
              onClick={() => {
                if (page === "Case report") download();
                else if (page === "Field scouting")
                  setPhotoGuideOpen((v) => !v);
                else if (page === "Soil & weather" || page === "Action plan")
                  setHelpOpen(true);
                else go("Field scouting");
              }}
            >
              <Icon
                name={
                  page === "Case report"
                    ? "down"
                    : page === "Field scouting"
                      ? "camera"
                      : page === "Soil & weather" || page === "Action plan"
                        ? "help"
                        : "plus"
                }
                size={17}
              />
              {page === "Case report"
                ? "Download report"
                : page === "Field scouting"
                  ? "Photo guide"
                  : page === "Soil & weather" || page === "Action plan"
                    ? "Help with this page"
                    : "Record a visit"}
            </button>
          </div>
          <div className="sample-strip">
            <span className="sample-tag">
              {activeField.isIllustrative ? "SAMPLE FIELD" : "YOUR FIELD"}
            </span>
            <span>
              {activeField.isIllustrative ? "Sample field" : "Your field"} ·
              records shown up to {reviewDate}
            </span>
            <span className="sample-tail">
              {currentHistory.length} records ·{" "}
              {
                visits.filter(
                  (v) =>
                    v.fieldId === activeField.id &&
                    v.seasonId === activeSeason.id,
                ).length
              }{" "}
              visits
            </span>
          </div>
          {demoOpen && (
            <section className="demo-controls">
              <div>
                <h3>Explore how evidence changes a decision</h3>
                <p>
                  Switching refreshes only prepared sample observations. Your
                  entered visits, fields and tasks are kept. Download a backup
                  before making major changes.
                </p>
              </div>
              <label>
                Sample case
                <select
                  value={scenario}
                  onChange={(e) => reset(e.target.value as Case)}
                >
                  <option value="A">A · Wet low patch after rain</option>
                  <option value="B">B · Yellowing and nutrition</option>
                  <option value="C">C · Leaf damage and insects</option>
                </select>
              </label>
              <button onClick={() => reset(scenario)}>Reset sample case</button>
              <button
                aria-label="Close demo controls"
                onClick={() => setDemoOpen(false)}
              >
                ×
              </button>
            </section>
          )}
          <div className="workspace-selectors">
            <label>
              Field
              <select
                aria-label="Active field"
                value={activeField.id}
                onChange={(e) => {
                  const next = seasons
                    .filter((s) => s.fieldId === e.target.value)
                    .at(-1)!;
                  selectScope(e.target.value, next.id);
                }}
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                    {f.isIllustrative ? " · sample" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Season
              <select
                aria-label="Active season"
                value={activeSeason.id}
                onChange={(e) => selectScope(activeField.id, e.target.value)}
              >
                {seasons
                  .filter((s) => s.fieldId === activeField.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </label>
            <button onClick={() => go("My field")}>
              <Icon name="plus" size={16} /> Manage fields
            </button>
          </div>
          {page === "Overview" && (
            <>
              <section className="overview-hero">
                <div className="hero-copy">
                  <span className="hero-tag">
                    <span className="green-dot" /> SMALL CHECKS. BETTER FIELD
                    RECORDS.
                  </span>
                  <h2>
                    Get to know your crop.
                    <br />
                    One visit at a time.
                  </h2>
                  <p>
                    Notice yellow leaves, insects or a wet patch? Record what
                    you see. We’ll help you choose what to check next.
                  </p>
                  <div className="hero-actions">
                    <button onClick={() => go("Field scouting")}>
                      <Icon name="camera" size={17} /> Record a visit{" "}
                      <Icon name="arrow" size={16} />
                    </button>
                    <button
                      className="hero-help-action"
                      onClick={() => setHelpOpen(true)}
                    >
                      How does it work?
                    </button>
                  </div>
                  <div className="hero-bottom">
                    <Icon name="pin" size={14} /> {activeField.locality}{" "}
                    <span>•</span> {activeField.areaHectares} hectares
                  </div>
                </div>
                <div className="hero-landscape">
                  <img
                    className="paddy-hero-photo"
                    src={`${import.meta.env.BASE_URL}images/paddy-field-v2.png`}
                    alt="Illustrative rice field with green leaves and rice panicles in warm morning light"
                    fetchPriority="high"
                  />
                  <span className="illustrative-image-label">
                    AI-generated illustration · not a field photo
                  </span>
                  <div className="hero-float">
                    <span className="icon-box">
                      <Icon name="leaf" />
                    </span>
                    <div>
                      <strong>{activeSeason.variety} rice</strong>
                      <small>
                        {activeField.name} ·{" "}
                        {activeField.isIllustrative ? "sample" : "your field"}
                      </small>
                    </div>
                  </div>
                </div>
              </section>
              <div className="stats-grid">
                {[
                  [
                    "field",
                    "Field size",
                    String(activeField.areaHectares),
                    "hectares",
                    `${fields.length} saved field${fields.length === 1 ? "" : "s"}`,
                  ],
                  [
                    "scan",
                    "Places checked",
                    `${progress}/4`,
                    "points",
                    "Recorded in the last 14 days of this case",
                  ],
                  [
                    "leaf",
                    "Places with changes",
                    String(affected.length),
                    "points",
                    "From your recent field notes",
                  ],
                  [
                    "calendar",
                    "Next visit",
                    String(pendingTasks.length),
                    "scheduled",
                    follow ? follow.date : "Plan your next field check",
                  ],
                ].map(([icon, label, value, unit, note]) => (
                  <article className="stat-card" key={label}>
                    <div className="stat-label">
                      {label}
                      <span className="stat-icon">
                        <Icon name={icon} size={19} />
                      </span>
                    </div>
                    <strong>
                      {value}
                      <small>{unit}</small>
                    </strong>
                    <p>{note}</p>
                  </article>
                ))}
              </div>
              <div className="dashboard-grid">
                <Panel
                  title="Where to look"
                  detail={`${activeField.name} · ${activeField.areaHectares} ha`}
                  action={
                    <button
                      className="text-button"
                      onClick={() => go("My field")}
                    >
                      View field <Icon name="arrow" size={15} />
                    </button>
                  }
                >
                  {map}
                  <div className="field-card-foot">
                    <span>
                      <i className="green-dot" /> {progress} places checked
                    </span>
                    <span
                      className={`pill ${affected.length ? "amber" : "neutral"}`}
                    >
                      {affected.length
                        ? "Changes to check"
                        : progress
                          ? "Records available"
                          : "No recent visits"}
                    </span>
                  </div>
                </Panel>
                <Panel
                  title="Your next steps"
                  detail="A closer look can make the picture clearer"
                >
                  {nextTask}
                  <button
                    className="task-row"
                    onClick={() => go("Soil & weather")}
                  >
                    <span className="icon-box blue">
                      <Icon name="drop" />
                    </span>
                    <span>
                      <strong>Review soil & water records</strong>
                      <small>
                        {soil.length
                          ? "Check report date and relevance"
                          : "Soil report missing"}{" "}
                        · Water test not recorded
                      </small>
                    </span>
                    <Icon name="chevron" size={16} />
                  </button>
                  <button
                    className="task-row"
                    onClick={() => go("Action plan")}
                  >
                    <span className="icon-box purple">
                      <Icon name="calendar" />
                    </span>
                    <span>
                      <strong>
                        {follow
                          ? "Return to the same points"
                          : "Plan a follow-up visit"}
                      </strong>
                      <small>
                        {follow
                          ? `Scheduled for ${follow.date}`
                          : "See whether your next check helped"}
                      </small>
                    </span>
                    <Icon name="chevron" size={16} />
                  </button>
                </Panel>
              </div>
              <div className="dashboard-grid lower-grid">
                <Panel
                  title="Your latest field notes"
                  detail="See what changed and when"
                  action={
                    <button
                      className="text-button"
                      onClick={() => go("Farm diary")}
                    >
                      Farm diary <Icon name="arrow" size={15} />
                    </button>
                  }
                >
                  <div className="observation-table">
                    {obs.slice(0, 3).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          selectPoint(o.scoutingPointId || "pt-1");
                          go("Field scouting");
                        }}
                      >
                        <span
                          className={`point-number ${o.leafColor === "normal" ? "healthy" : ""}`}
                        >
                          {o.scoutingPointId?.slice(-1)}
                        </span>
                        <span>
                          <strong>
                            {o.leafColor === "normal"
                              ? "Normal leaf appearance"
                              : o.leafColor === "browning"
                                ? "Leaf damage reported"
                                : "Yellowing leaves reported"}
                          </strong>
                          <small>
                            {
                              scoutingPoints.find(
                                (p) => p.id === o.scoutingPointId,
                              )?.quadrat
                            }{" "}
                            · {o.observedAt.toISOString().slice(0, 10)}
                          </small>
                        </span>
                        <span className="pill neutral">
                          {o.isIllustrative ? "Sample" : "User input"}
                        </span>
                        <Icon name="chevron" size={15} />
                      </button>
                    ))}
                  </div>
                </Panel>
                <Panel
                  title="Rainfall near your field"
                  detail={
                    weather.length
                      ? "District sample · 17 Oct 2024"
                      : "No weather feed connected"
                  }
                >
                  <div className="weather-summary">
                    <span className="weather-symbol">
                      <Icon name="cloud" size={50} />
                    </span>
                    <div>
                      <strong>
                        {weather.length ? rain : "—"}
                        <small>{weather.length ? " mm" : ""}</small>
                      </strong>
                      <p>
                        {weather.length
                          ? "Rain recorded across the district"
                          : "No rainfall measurement for this field"}
                      </p>
                    </div>
                  </div>
                  <p className="muted">
                    Rainfall tells you about the wider area. Look at the soil in
                    your own field before deciding what to do.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => go("Soil & weather")}
                  >
                    Review field conditions <Icon name="arrow" size={15} />
                  </button>
                </Panel>
              </div>
            </>
          )}
          {page === "Overview" && (
            <section className="learn-section">
              <div className="section-intro">
                <div>
                  <span className="eyebrow">A LITTLE HELP GOES A LONG WAY</span>
                  <h2>Make your next field visit count.</h2>
                  <p>
                    No special equipment needed. Start with what you can see.
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setHelpOpen(true)}
                >
                  All help & guides <Icon name="arrow" size={16} />
                </button>
              </div>
              <div className="learning-cards">
                <button
                  onClick={() => {
                    setPhotoGuideOpen(true);
                    go("Field scouting");
                  }}
                >
                  <div className="learning-visual">
                    <Icon name="camera" size={37} />
                    <span>01</span>
                  </div>
                  <h3>Take two useful photos</h3>
                  <p>A whole plant and a close-up help show what changed.</p>
                  <span className="learn-link">
                    See the photo guide <Icon name="arrow" size={15} />
                  </span>
                </button>
                <button onClick={() => go("Farm diary")}>
                  <div className="learning-visual warm">
                    <Icon name="book" size={37} />
                    <span>02</span>
                  </div>
                  <h3>Keep a simple field diary</h3>
                  <p>Note irrigation, field work and the things you notice.</p>
                  <span className="learn-link">
                    Open your history <Icon name="arrow" size={15} />
                  </span>
                </button>
                <button onClick={() => go("Action plan")}>
                  <div className="learning-visual blue">
                    <Icon name="calendar" size={37} />
                    <span>03</span>
                  </div>
                  <h3>Return to the same plants</h3>
                  <p>
                    Use similar photos to record better, the same, or worse.
                  </p>
                  <span className="learn-link">
                    Plan your next visit <Icon name="arrow" size={15} />
                  </span>
                </button>
              </div>
            </section>
          )}
          {page === "My field" && (
            <Suspense fallback={<p>Opening field imagery…</p>}>
              <FieldImagery
                key={activeSeason.id}
                field={activeField}
                season={activeSeason}
                records={imagery}
                onSave={(record) => setImagery((prev) => [...prev, record])}
              />
            </Suspense>
          )}
          {page === "My field" && (
            <>
              <FieldControls
                fields={fields}
                seasons={seasons}
                field={activeField}
                season={activeSeason}
                onSelect={selectScope}
                onSaveField={saveFieldDetails}
                onAddSeason={saveNewSeason}
                onStage={(season) => {
                  const next = parseSeason(season);
                  setSeasons((prev) =>
                    prev.map((s) => (s.id === next.id ? next : s)),
                  );
                }}
              />
              <div className="field-profile">
                <div className="field-profile-copy">
                  <span className="pill green">{activeSeason.name}</span>
                  <h2>{activeField.name}</h2>
                  <p>
                    <Icon name="pin" size={16} /> {activeField.locality}
                  </p>
                  <div className="profile-metrics">
                    <div>
                      <small>Field area</small>
                      <strong>{activeField.areaHectares} ha</strong>
                    </div>
                    <div>
                      <small>Crop & variety</small>
                      <strong>{activeSeason.variety} rice</strong>
                    </div>
                    <div>
                      <small>Water source</small>
                      <strong>{activeField.irrigationSource}</strong>
                    </div>
                  </div>
                  <button
                    className="primary"
                    onClick={() => go("Field scouting")}
                  >
                    Scout this field <Icon name="arrow" size={17} />
                  </button>
                </div>
                {map}
              </div>
              <Panel
                title="Your crop season"
                detail={
                  activeSeason.isIllustrative
                    ? "Illustrative season dates; confirm growth stage in the field"
                    : "Season dates and stage entered by you"
                }
              >
                <dl className="season-facts">
                  <div>
                    <dt>Sowing date</dt>
                    <dd>{activeSeason.sowingDate}</dd>
                  </div>
                  <div>
                    <dt>Expected harvest (entered)</dt>
                    <dd>{activeSeason.expectedHarvestDate}</dd>
                  </div>
                  <div>
                    <dt>Current stage (entered)</dt>
                    <dd>
                      {activeSeason.growthStage === "not-set"
                        ? "Not confirmed"
                        : activeSeason.growthStage}
                    </dd>
                  </div>
                  <div>
                    <dt>Record source</dt>
                    <dd>
                      {activeSeason.isIllustrative
                        ? "Illustrative sample"
                        : "Entered by you"}
                    </dd>
                  </div>
                </dl>
              </Panel>
              <div className="two-col">
                <Panel
                  title="Places to check"
                  detail="Inspect the same locations each visit"
                >
                  <div className="point-list">
                    {scoutingPoints.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          selectPoint(p.id);
                          go("Field scouting");
                        }}
                      >
                        <span className="point-number">{p.position}</span>
                        <span>
                          <strong>{p.quadrat}</strong>
                          <small>
                            {p.coordinates.lat}° N, {p.coordinates.lng}° E
                          </small>
                        </span>
                        <span className="pill neutral">
                          {obs.some((o) => o.scoutingPointId === p.id)
                            ? "Recorded"
                            : "To inspect"}
                        </span>
                        <Icon name="chevron" size={16} />
                      </button>
                    ))}
                  </div>
                </Panel>
                <Panel
                  title="Field records"
                  detail="Keep context close to your observations"
                >
                  <button
                    className="task-row"
                    onClick={() => go("Soil & weather")}
                  >
                    <Icon name="drop" />
                    <span>
                      <strong>Soil & water reports</strong>
                      <small>
                        {soil.length} sample soil report · no water report
                      </small>
                    </span>
                    <Icon name="chevron" />
                  </button>
                  <button className="task-row" onClick={() => go("Farm diary")}>
                    <Icon name="book" />
                    <span>
                      <strong>Farm activity history</strong>
                      <small>{entries.length} activities recorded by you</small>
                    </span>
                    <Icon name="chevron" />
                  </button>
                  <p className="muted">
                    Open the map controls to fit your field, view street tiles,
                    or export its boundary. Edit field details to mark or import
                    corners.
                  </p>
                </Panel>
              </div>
            </>
          )}
          {page === "Field scouting" && (
            <>
              <div className="page-help-banner">
                <div>
                  <Icon name="camera" />
                  <span>
                    <strong>New to recording a visit?</strong> Two clear photos
                    and a few notes are a good start.
                  </span>
                </div>
                <button
                  className="text-button"
                  aria-expanded={photoGuideOpen}
                  onClick={() => setPhotoGuideOpen((v) => !v)}
                >
                  {photoGuideOpen ? "Hide photo guide" : "Show photo guide"}{" "}
                  <Icon name="chevron" size={15} />
                </button>
              </div>
              {photoGuideOpen && <PhotoGuide />}
              <div className="workflow-steps">
                {["Choose a point", "Record observations", "Review & save"].map(
                  (t, i) => (
                    <button
                      key={t}
                      className={step === i ? "active" : step > i ? "done" : ""}
                      onClick={() => setStep(i)}
                    >
                      <span>
                        {step > i ? <Icon name="check" size={14} /> : i + 1}
                      </span>
                      {t}
                    </button>
                  ),
                )}
                <span className="coverage">{progress}/4 points recorded</span>
              </div>
              <div className="scouting-layout">
                <Panel
                  title="Your four check points"
                  detail="Visit each place, including plants that look normal"
                >
                  {map}
                  <div className="point-tabs">
                    {scoutingPoints.map((p) => (
                      <button
                        key={p.id}
                        aria-pressed={point === p.id}
                        className={point === p.id ? "active" : ""}
                        onClick={() => {
                          selectPoint(p.id);
                          setStep(0);
                        }}
                      >
                        {p.position}
                        <Icon
                          name={
                            obs.some((o) => o.scoutingPointId === p.id)
                              ? "check"
                              : "pin"
                          }
                          size={13}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="muted">
                    Point {point.slice(-1)} ·{" "}
                    {scoutingPoints.find((p) => p.id === point)?.quadrat}
                    <br />
                    These are sample map locations, not your phone’s GPS
                    position.
                  </p>
                </Panel>
                <Panel
                  title={
                    step === 0
                      ? "Start with a whole-plant view"
                      : step === 1
                        ? "What do you see?"
                        : "Review your visit"
                  }
                  detail={`Point ${point.slice(-1)} · ${scoutingPoints.find((p) => p.id === point)?.quadrat}`}
                >
                  {step === 0 ? (
                    <>
                      <div className="scout-intro">
                        <span className="large-icon">
                          <Icon name="scan" size={38} />
                        </span>
                        <h3>Take a moment to look around.</h3>
                        <p>
                          Look at the whole plant, inspect upper and lower
                          leaves, and check the soil around the roots.
                          Photograph affected and healthy plants.
                        </p>
                      </div>
                      <div className="tip">
                        <Icon name="camera" />
                        <span>
                          Capture a whole-plant photo and a close-up. Photos are
                          stored as evidence; this app does not classify images.
                        </span>
                      </div>
                      {!photoGuideOpen && <PhotoGuide compact />}
                      <button
                        className="primary full-width"
                        onClick={() => setStep(1)}
                      >
                        Continue to field notes <Icon name="arrow" size={17} />
                      </button>
                    </>
                  ) : step === 1 ? (
                    <>
                      <label>
                        When did you observe this plant?
                        <input
                          type="datetime-local"
                          required
                          value={observationTime}
                          max={nowInput()}
                          onChange={(e) => setObservationTime(e.target.value)}
                        />
                      </label>
                      <p className="muted">
                        Previous values are shown for reference. Verify each
                        value before saving a new visit. Observation and
                        recording times are stored separately.
                      </p>

                      <div className="form-grid">
                        <label>
                          What colour are the leaves?
                          <select
                            value={current?.leafColor || ""}
                            onChange={(e) =>
                              edit({
                                leafColor: e.target
                                  .value as Observation["leafColor"],
                              })
                            }
                          >
                            <option value="">Choose appearance</option>
                            {[
                              "normal",
                              "yellowing",
                              "browning",
                              "mottling",
                            ].map((v) => (
                              <option key={v} value={v}>
                                {
                                  {
                                    normal: "Green / usual colour",
                                    yellowing: "Turning yellow",
                                    browning: "Brown / dried areas",
                                    mottling: "Mixed light and dark patches",
                                  }[v]
                                }
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          How does the soil look?
                          <select
                            value={current?.soilCondition || ""}
                            onChange={(e) =>
                              edit({
                                soilCondition: e.target
                                  .value as Observation["soilCondition"],
                              })
                            }
                          >
                            <option value="">Choose condition</option>
                            {["dry", "moist", "waterlogged", "cracked"].map(
                              (v) => (
                                <option key={v} value={v}>
                                  {
                                    {
                                      dry: "Dry to the touch",
                                      moist: "Damp / moist",
                                      waterlogged: "Very wet / standing water",
                                      cracked: "Dry with visible cracks",
                                    }[v]
                                  }
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <label>
                          Where are the changed leaves?
                          <select
                            value={current?.leafLocation || ""}
                            onChange={(e) =>
                              edit({
                                leafLocation: e.target
                                  .value as Observation["leafLocation"],
                              })
                            }
                          >
                            <option value="">Not recorded</option>
                            {["lower", "middle", "upper", "mixed"].map((v) => (
                              <option key={v} value={v}>
                                {
                                  {
                                    lower: "Near the ground",
                                    middle: "Middle of the plant",
                                    upper: "Near the top",
                                    mixed: "More than one part",
                                  }[v]
                                }
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          How many insects did you count?
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={current?.visiblePestCount ?? ""}
                            onChange={(e) =>
                              edit({
                                visiblePestCount:
                                  e.target.value === ""
                                    ? undefined
                                    : Math.max(
                                        0,
                                        Math.floor(Number(e.target.value)),
                                      ),
                              })
                            }
                          />
                        </label>
                      </div>
                      <div className="form-help-row">
                        <HelpHint title="What do these soil words mean?">
                          <p>
                            Dry: little moisture to the touch. Damp: some
                            moisture. Very wet: saturated soil or visible
                            standing water. Cracked: visible cracks in the
                            surface. Describe what you see in the notes if you
                            are unsure.
                          </p>
                        </HelpHint>
                        <HelpHint title="How should I count insects?">
                          <p>
                            Use the same number of plants each visit so the
                            counts can be compared. Enter 0 only if you checked
                            and found none. Leave it blank if you did not count.
                          </p>
                        </HelpHint>
                      </div>
                      <label>
                        What else looks different?
                        <input
                          placeholder="e.g. spots, holes, wilting"
                          value={current?.symptoms || ""}
                          onChange={(e) => edit({ symptoms: e.target.value })}
                        />
                      </label>
                      <label>
                        Field notes
                        <textarea
                          placeholder="Where did the problem start? What changed?"
                          value={current?.generalNotes || ""}
                          onChange={(e) =>
                            edit({ generalNotes: e.target.value })
                          }
                        />
                      </label>
                      <div className="form-grid">
                        {["whole plant", "close-up"].map((kind) => (
                          <label className="upload-zone" key={kind}>
                            <Icon name="camera" />
                            <strong>{kind} photo</strong>
                            <small>Image · up to 3 MB</small>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp"
                              capture="environment"
                              onChange={(e) =>
                                upload(e.target.files?.[0], kind)
                              }
                            />
                          </label>
                        ))}
                      </div>
                      {gallery()}
                      <div className="form-actions">
                        <button onClick={() => setStep(0)}>Back</button>
                        <button className="primary" onClick={() => setStep(2)}>
                          Review this visit <Icon name="arrow" size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <dl className="review-facts">
                        <div>
                          <dt>Leaf appearance</dt>
                          <dd>{current?.leafColor || "Not recorded"}</dd>
                        </div>
                        <div>
                          <dt>Soil condition</dt>
                          <dd>{current?.soilCondition || "Not recorded"}</dd>
                        </div>
                        <div>
                          <dt>Insect count</dt>
                          <dd>{current?.visiblePestCount ?? "Not recorded"}</dd>
                        </div>
                        <div>
                          <dt>Symptoms</dt>
                          <dd>{current?.symptoms || "Not recorded"}</dd>
                        </div>
                        <div>
                          <dt>Notes</dt>
                          <dd>{current?.generalNotes || "No notes"}</dd>
                        </div>
                      </dl>
                      <p className="tip">
                        Observation time: {observationTime.replace("T", " ")}.
                        Saving creates a new visit; previous evidence is
                        preserved.
                      </p>
                      <div className="form-actions">
                        <button onClick={() => setStep(1)}>Edit details</button>
                        <button
                          className="primary"
                          onClick={() => {
                            if (saveObservation()) go("Crop health");
                          }}
                        >
                          Save & see next steps <Icon name="check" size={16} />
                        </button>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => {
                          if (saveObservation()) {
                            const next =
                              scoutingPoints.findIndex((p) => p.id === point) +
                              1;
                            selectPoint(scoutingPoints[next % 4].id);
                            setStep(0);
                          }
                        }}
                      >
                        Save & check the next place{" "}
                        <Icon name="arrow" size={16} />
                      </button>
                    </>
                  )}
                </Panel>
              </div>
            </>
          )}
          {page === "Crop health" && (
            <>
              <Suspense fallback={<p>Opening rice reference library…</p>}>
                <RiceReferenceLibrary
                  onRecord={() => go("Field scouting")}
                  onPlan={(title) => {
                    setAction(title);
                    go("Action plan");
                  }}
                />
              </Suspense>
              <div className="health-banner">
                <span className="large-icon amber">
                  <Icon name="leaf" size={32} />
                </span>
                <div>
                  <span className="eyebrow">WHAT YOUR NOTES SUGGEST</span>
                  <h2>
                    {supported.length
                      ? `${supported.length} possible reason${supported.length > 1 ? "s are" : " is"} worth checking`
                      : "A little more evidence is needed"}
                  </h2>
                  <p>
                    Several causes can occur together. These are investigation
                    priorities, not confirmed diagnoses.
                  </p>
                </div>
                <button
                  className="secondary"
                  onClick={() => go("Field scouting")}
                >
                  Add an observation <Icon name="plus" size={16} />
                </button>
              </div>
              <div className="two-col health-columns">
                <Panel
                  title="What might be happening"
                  detail="Start with these checks; several reasons can occur together"
                >
                  {explanations}
                </Panel>
                <div className="stack">
                  <Panel
                    title="Start here"
                    detail="One practical step for your next visit"
                  >
                    {nextTask}
                    <button
                      className="text-button"
                      onClick={() => {
                        setAction(farmerNextCheck);
                        go("Action plan");
                      }}
                    >
                      Add to action plan <Icon name="arrow" size={16} />
                    </button>
                  </Panel>
                  <Panel
                    title="What would help us understand more"
                    detail="A checklist for your next visit"
                  >
                    <ul className="missing-list">
                      {analysis.missingCritical.slice(0, 6).map((m) => (
                        <li key={m}>
                          <span />
                          <p>
                            {m.includes("all four scouting")
                              ? "Check all four marked places."
                              : m.includes("water depth")
                                ? "Note any standing water and whether it can drain."
                                : m.includes("Recent, verified soil")
                                  ? "A recent soil report for this field is missing."
                                  : m.includes("past expected harvest")
                                    ? "The sample season has ended. Confirm the crop stage before deciding what to do."
                                    : m.includes("Confirm report method")
                                      ? "Ask an agronomist to review the leaf changes with the soil report."
                                      : m}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </div>
              </div>
            </>
          )}
          {page === "Soil & weather" && (
            <ReportRecords
              key={activeSeason.id}
              season={activeSeason}
              records={fieldReports.filter(
                (r) =>
                  r.fieldId === selectedFieldId &&
                  r.seasonId === selectedSeasonId,
              )}
              onSave={(record) => {
                setFieldReports((prev) => [...prev, record]);
                setMessage(
                  "Report added. Wait for the saved indicator before closing.",
                );
              }}
              onAttach={(reportId, attachment) => {
                setFieldReports((prev) =>
                  prev.map((report) =>
                    report.id === reportId &&
                    (report.attachments?.length || 0) < 3
                      ? {
                          ...report,
                          attachments: [
                            ...(report.attachments || []),
                            attachment,
                          ],
                        }
                      : report,
                  ),
                );
              }}
            />
          )}
          {page === "Soil & weather" &&
            (!activeField.isIllustrative ||
              activeSeason.id !== "season-2024-k") && (
              <Panel
                title="Weather and expert review"
                detail="Sample records from the demo are not used for your field."
              >
                <p className="muted">
                  Add your laboratory results above, record field conditions
                  during a visit, or plan a test in Next steps. Live weather and
                  independent report verification are not connected.
                </p>
                <button
                  onClick={() => {
                    setAction(
                      "Arrange a soil and water test for this field and season.",
                    );
                    go("Action plan");
                  }}
                >
                  Plan a test <Icon name="arrow" size={16} />
                </button>
              </Panel>
            )}
          {page === "Soil & weather" &&
            activeField.isIllustrative &&
            activeSeason.id === "season-2024-k" && (
              <>
                <div className="two-col">
                  <Panel
                    title="Soil laboratory record"
                    detail="Sample laboratory data · field and date matter"
                    action={
                      <span className="icon-box">
                        <Icon name="leaf" />
                      </span>
                    }
                  >
                    <label>
                      Report relevance
                      <select
                        value={report}
                        onChange={(e) =>
                          setReport(e.target.value as Workspace["report"])
                        }
                      >
                        <option value="scenario">
                          Report from the sample case
                        </option>
                        <option value="wrong">
                          Test a report from another field
                        </option>
                        <option value="stale">
                          Test an old report (January 2023)
                        </option>
                        <option value="absent">No report available</option>
                      </select>
                    </label>
                    {soil.length ? (
                      soil.map((s) => (
                        <div key={s.id}>
                          <div
                            className={`report-status ${report === "scenario" ? "" : "invalid"}`}
                          >
                            <Icon
                              name={report === "scenario" ? "report" : "alert"}
                              size={20}
                            />
                            <span>
                              <strong>
                                {report === "wrong"
                                  ? "Excluded: different field"
                                  : report === "stale"
                                    ? "Excluded: old sample"
                                    : "Illustrative soil report"}
                              </strong>
                              <small>
                                {s.testedAt.toISOString().slice(0, 10)} ·{" "}
                                {s.fieldId} · laboratory / verified
                              </small>
                            </span>
                          </div>
                          <div className="soil-metrics">
                            {[
                              ["N", s.nitrogen, "Nitrogen", "ppm"],
                              ["P", s.phosphorus, "Phosphorus", "ppm"],
                              ["K", s.potassium, "Potassium", "ppm"],
                              ["pH", s.pH, "Soil acidity", ""],
                            ].map(([symbol, v, label, unit]) => (
                              <div key={label}>
                                <span>{symbol}</span>
                                <strong>
                                  {v}
                                  <small>{unit}</small>
                                </strong>
                                <p>{label}</p>
                              </div>
                            ))}
                          </div>
                          <div className="tip">
                            <Icon name="report" />
                            <p>
                              {s.labInterpretation === "low nitrogen"
                                ? "Sample laboratory interpretation: low nitrogen. Review crop stage and leaf symptoms before deciding what to do."
                                : "No laboratory nutrient interpretation supplied. The app does not infer deficiency from raw numbers alone."}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <Icon name="report" size={34} />
                        <h3>No soil report available</h3>
                        <p>
                          Arrange a representative sample from this field. Until
                          then, nutrient stress remains an open question.
                        </p>
                      </div>
                    )}
                  </Panel>
                  <Panel
                    title="Rainfall near your field"
                    detail="District record · illustrative, not live"
                  >
                    <div className="weather-large">
                      <Icon name="cloud" size={68} />
                      <div>
                        <strong>
                          {weather.length ? rain : "—"}
                          <small>{weather.length ? " mm" : ""}</small>
                        </strong>
                        <p>District rainfall · 17 October 2024</p>
                      </div>
                    </div>
                    <label>
                      Explore a different rainfall record (mm)
                      <input
                        type="number"
                        min="0"
                        value={rain}
                        onChange={(e) =>
                          setRain(Math.max(0, Number(e.target.value)))
                        }
                      />
                    </label>
                    <div className="tip blue-tip">
                      <Icon name="drop" />
                      <p>
                        District rainfall provides context. It does not measure
                        standing water or soil moisture in this field.
                      </p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => go("Crop health")}
                    >
                      See how this affects the investigation{" "}
                      <Icon name="arrow" size={16} />
                    </button>
                  </Panel>
                </div>
                <Panel
                  title="Irrigation water & drainage"
                  detail="No report has been entered"
                >
                  <div className="water-empty">
                    <span className="large-icon blue">
                      <Icon name="drop" size={32} />
                    </span>
                    <div>
                      <h3>Complete the water picture</h3>
                      <p>
                        Water quality, water depth and drainage are different
                        measurements. No current values are available in this
                        case.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAction(
                          "Check field water depth and drainage; arrange a water-quality sample if needed.",
                        );
                        go("Action plan");
                      }}
                    >
                      Plan a water check <Icon name="arrow" size={16} />
                    </button>
                  </div>
                </Panel>
              </>
            )}
          {page === "Farm diary" && (
            <Suspense fallback={<p>Opening season activity summary…</p>}>
              <ActivityLedger
                key={activeSeason.id}
                entries={allEntries}
                field={activeField}
                season={activeSeason}
              />
            </Suspense>
          )}
          {page === "Farm diary" && (
            <VisitComparison
              key={activeSeason.id}
              observations={currentHistory}
              photos={photos}
              fieldId={activeField.id}
              seasonId={activeSeason.id}
              onAttach={(file, id) => upload(file, "Visit evidence", id)}
              onRecord={() => go("Field scouting")}
            />
          )}
          {page === "Farm diary" && (
            <div className="two-col diary-columns">
              <Panel
                title="Season activity"
                detail="Field work and observations, connected"
              >
                <div className="timeline">
                  <article>
                    <span className="timeline-icon">
                      <Icon name="leaf" size={17} />
                    </span>
                    <div>
                      <small>
                        {activeSeason.sowingDate} ·{" "}
                        {activeSeason.isIllustrative
                          ? "SAMPLE RECORD"
                          : "ENTERED BY YOU"}
                      </small>
                      <h3>{activeSeason.variety} rice sowing</h3>
                      <p>Start of {activeSeason.name}.</p>
                    </div>
                  </article>
                  {historyNewestFirst(currentHistory).map((o) => (
                    <article key={o.id}>
                      <span className="timeline-icon">
                        <Icon name="scan" size={17} />
                      </span>
                      <div>
                        <small>
                          {o.observedAt.toISOString().slice(0, 10)} ·{" "}
                          {o.isIllustrative ? "SAMPLE" : "USER INPUT"}
                        </small>
                        <h3>Scouting point {o.scoutingPointId?.slice(-1)}</h3>
                        <p>
                          Leaves: {o.leafColor || "not recorded"} · Soil:{" "}
                          {o.soilCondition || "not recorded"} · Insects:{" "}
                          {o.visiblePestCount ?? "not counted"}
                        </p>
                        {o.generalNotes && <p>{o.generalNotes}</p>}
                      </div>
                    </article>
                  ))}
                  {entries.map((e) => (
                    <article key={e.id}>
                      <span className="timeline-icon">
                        <Icon name="book" size={17} />
                      </span>
                      <div>
                        <small>{e.date} · USER INPUT</small>
                        <h3>{e.type}</h3>
                        <p>{e.notes}</p>
                        {e.cost && (
                          <span className="pill neutral">Cost ₹{e.cost}</span>
                        )}
                      </div>
                    </article>
                  ))}
                  {follow && (
                    <article>
                      <span className="timeline-icon">
                        <Icon name="calendar" size={17} />
                      </span>
                      <div>
                        <small>{follow.date} · PLANNED FOLLOW-UP</small>
                        <h3>{follow.action}</h3>
                        <p>Outcome: {follow.outcome}</p>
                      </div>
                    </article>
                  )}
                </div>
              </Panel>
              <Panel
                title="Log a farm activity"
                detail="Small records make the bigger picture clearer"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setEntries((p) => [
                      ...p,
                      {
                        id: crypto.randomUUID(),
                        fieldId: activeField.id,
                        seasonId: activeSeason.id,
                        type: operation,
                        date: operationDate,
                        notes: operationNotes,
                        cost,
                      },
                    ]);
                    setOperationNotes("");
                    setCost("");
                    setMessage("Activity added to your farm diary.");
                  }}
                >
                  <label>
                    Activity
                    <select
                      value={operation}
                      onChange={(e) => setOperation(e.target.value)}
                    >
                      {[
                        "Irrigation",
                        "Fertiliser application",
                        "Drainage check",
                        "Pest scouting",
                        "Soil sampling",
                        "Other field work",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Activity date
                    <input
                      type="date"
                      required
                      value={operationDate}
                      onChange={(e) => setOperationDate(e.target.value)}
                    />
                  </label>
                  <label>
                    What did you do?
                    <textarea
                      required
                      placeholder="Include location, amount and what you noticed."
                      value={operationNotes}
                      onChange={(e) => setOperationNotes(e.target.value)}
                    />
                  </label>
                  <label>
                    Cost (₹, optional)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </label>
                  <button className="primary full-width" type="submit">
                    <Icon name="plus" size={17} /> Save activity
                  </button>
                </form>
              </Panel>
            </div>
          )}
          {page === "Action plan" && (
            <>
              <TaskBoard
                key={`${activeField.id}/${activeSeason.id}/${action}`}
                tasks={fieldTasks}
                observations={currentHistory}
                suggestion={action}
                onCreate={(input) => {
                  const task = createTask(workspace, {
                    ...input,
                    fieldId: activeField.id,
                    seasonId: activeSeason.id,
                  });
                  setTasks((prev) => [...prev, task]);
                  setMessage("Task saved for this field and crop season.");
                }}
                onUpdate={(task) => {
                  setTasks((prev) =>
                    prev.map((t) => (t.id === task.id ? task : t)),
                  );
                  setMessage(
                    "Task updated. Its earlier status changes were kept.",
                  );
                }}
              />
              <Panel
                title="Photos from your return visit"
                detail="Choose the same point to compare earlier and follow-up images."
              >
                <label>
                  Check point
                  <select
                    value={point}
                    onChange={(e) => selectPoint(e.target.value)}
                  >
                    {scoutingPoints.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.position} · {p.quadrat}
                      </option>
                    ))}
                  </select>
                </label>
                {gallery()}
                <label className="upload-zone">
                  Add a return-visit photo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    capture="environment"
                    onChange={(e) => upload(e.target.files?.[0], "after")}
                  />
                </label>
              </Panel>
            </>
          )}
          {page === "Case report" && (
            <>
              <div className="report-cover">
                <span className="large-icon">
                  <Icon name="report" size={34} />
                </span>
                <div>
                  <span className="eyebrow">AGRONOMIST HANDOFF</span>
                  <h2>{activeField.name} · Crop health case</h2>
                  <p>
                    {activeSeason.variety} rice · {activeField.areaHectares} ha
                    · {activeField.locality} · {activeSeason.name}
                  </p>
                  <span className="pill neutral">
                    {activeField.isIllustrative
                      ? "Illustrative sample + labelled user inputs"
                      : "User-entered field and dated visit records"}
                  </span>
                </div>
                <button className="primary" onClick={download}>
                  <Icon name="down" size={17} /> Download full case
                </button>
              </div>
              <div className="two-col">
                <Panel
                  title="All saved field notes"
                  detail="Dates, sources and verification remain attached"
                >
                  <div className="ledger">
                    {historyNewestFirst(currentHistory).map((o) => (
                      <article key={o.id}>
                        <span className="pill neutral">
                          {o.isIllustrative ? "Sample record" : "User input"}
                        </span>
                        <h3>
                          {o.scoutingPointId} ·{" "}
                          {o.observedAt.toISOString().slice(0, 10)}
                        </h3>
                        <p>
                          Leaves {o.leafColor || "unknown"} · Soil{" "}
                          {o.soilCondition || "unknown"} · Pest count{" "}
                          {o.visiblePestCount ?? "unknown"}
                        </p>
                        <small>
                          {o.id} · {o.source} · {o.verificationStatus}
                          <br />
                          Recorded: {o.recordedAt.toISOString()}
                        </small>
                      </article>
                    ))}
                  </div>
                </Panel>
                <Panel
                  title="Possible reasons and next checks"
                  detail="Educational rules; specialist review required"
                >
                  {explanations}
                </Panel>
              </div>
              <Panel
                title="What’s in this report"
                detail="Included in the exported JSON report"
              >
                <div className="completeness">
                  {[
                    [
                      "Scouting observations",
                      `${currentHistory.length} records`,
                    ],
                    [
                      "Verified/sample soil evidence",
                      `${soil.length} record(s)`,
                    ],
                    [
                      "Entered soil/water reports",
                      `${fieldReports.filter((r) => r.fieldId === selectedFieldId && r.seasonId === selectedSeasonId).length} record(s)`,
                    ],
                    ["Photo evidence", `${photos.length} photo(s)`],
                    ["Farm activities", `${entries.length} activities`],
                    ["Follow-up", follow ? follow.date : "Not scheduled"],
                    [
                      "Weather",
                      weather.length
                        ? "District sample only"
                        : "No connected weather record",
                    ],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span>{k}</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                </div>
                <p className="muted">
                  No confirmed diagnosis, image classification, live weather,
                  treatment prescription or automatic notification is claimed.
                </p>
              </Panel>
            </>
          )}

          {page === "Case report" && (
            <Panel
              title="Keep a backup of your records"
              detail="Versioned backups include permanent visits, photos, activities and your follow-up."
            >
              <div className="backup-actions">
                <button className="primary" onClick={downloadBackup}>
                  <Icon name="down" size={17} /> Download backup
                </button>
                <label>
                  Restore a backup file
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => {
                      void previewRestore(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <p className="muted">
                Restore adds missing records; duplicate IDs are not added twice.
                Conflicting records and backups from another sample case are
                rejected. Your current report/weather settings and saved
                follow-up take precedence.
              </p>
              {restorePreview && (
                <div className="tip">
                  <div>
                    <h3>Restore preview</h3>
                    <p>
                      {restorePreview.obs.length} observations ·{" "}
                      {restorePreview.visits.length} visits ·{" "}
                      {restorePreview.photos.length} photos ·{" "}
                      {restorePreview.fieldReports.length} soil/water reports.
                      Existing records will be kept.
                    </p>
                    <button
                      className="primary"
                      onClick={() => void restoreBackup()}
                    >
                      Merge backup records
                    </button>{" "}
                    <button onClick={() => setRestorePreview(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Panel>
          )}
          <HelpCenter
            open={helpOpen}
            onClose={() => setHelpOpen(false)}
            onRecord={() => go("Field scouting")}
            onPlan={() => go("Action plan")}
          />
          {message && (
            <div className="toast" role="status">
              <Icon name="check" size={18} />
              <span>{message}</span>
              <button
                aria-label="Dismiss message"
                onClick={() => setMessage("")}
              >
                ×
              </button>
            </div>
          )}
          {storageError && (
            <div className="storage-warning" role="alert">
              Device database save failed. Export your case before leaving;{" "}
              {saveFailure} Changes may only remain in this session.
              <button onClick={() => setRetrySave((v) => v + 1)}>
                Retry save
              </button>{" "}
              <button onClick={downloadBackup}>Download backup</button>
            </div>
          )}
          <footer>
            <span className="footer-brand">
              <Icon name="leaf" size={16} /> fieldsense
            </span>
            <span>Observe. Understand. Act. Follow through.</span>
            <span>Educational demo · Data stays on this device</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
