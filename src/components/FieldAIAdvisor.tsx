import { useMemo, useState } from "react";
import type { FarmField, FarmSeason, FarmTask } from "../types/farm";
import type { Observation } from "../types/domain";
import type { FieldReport } from "../types/reports";
import { localDate } from "../services/workspace";
import { askGeminiAdvisor, runLocalFieldAI } from "../services/aiAdvisor";
import type { GeminiAdvisoryResponse } from "../services/aiAdvisor";
import { analyzeLeafImageUrl } from "../services/leafVision";
import type { LeafVisionResult } from "../services/leafVision";
import { Icon } from "./Visuals";

const ENV_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || "";

export function FieldAIAdvisor({
  field,
  season,
  observations,
  tasks,
  reports,
  onPlanCheck,
}: {
  field: FarmField;
  season: FarmSeason;
  observations: Observation[];
  tasks: FarmTask[];
  reports: FieldReport[];
  onPlanCheck: (title: string) => void;
}) {
  const today = localDate();
  const localAI = useMemo(
    () =>
      runLocalFieldAI({
        field,
        season,
        observations,
        tasks,
        reports,
        today,
      }),
    [field, season, observations, tasks, reports, today],
  );

  const [mode, setMode] = useState<"algorithm" | "vision" | "gemini">(
    "algorithm",
  );
  const [visionLabel, setVisionLabel] = useState("");
  const [visionPreview, setVisionPreview] = useState("");
  const [visionResult, setVisionResult] = useState<LeafVisionResult | null>(
    null,
  );
  const [visionBusy, setVisionBusy] = useState(false);
  const [visionError, setVisionError] = useState("");
  const [apiKey, setApiKey] = useState(ENV_KEY);
  const [question, setQuestion] = useState("");
  const [imageFile, setImageFile] = useState<{
    name: string;
    mimeType: string;
    data: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reply, setReply] = useState<GeminiAdvisoryResponse | null>(null);

  function handleImage(file: File | undefined) {
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Choose a PNG, JPEG or WebP field photo.");
      return;
    }
    if (file.size > 3_000_000) {
      setError("Choose a photo smaller than 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : "";
      if (base64) {
        setImageFile({ name: file.name, mimeType: file.type, data: base64 });
        setError("");
      }
    };
    reader.readAsDataURL(file);
  }

  async function runVision(src: string, label: string) {
    setVisionBusy(true);
    setVisionError("");
    setVisionLabel(label);
    setVisionPreview(src);
    try {
      const res = await analyzeLeafImageUrl(src);
      setVisionResult(res);
    } catch (e) {
      setVisionError(
        e instanceof Error ? e.message : "Could not analyze image.",
      );
      setVisionResult(null);
    } finally {
      setVisionBusy(false);
    }
  }

  function handleVisionUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setVisionError("Choose a PNG, JPEG or WebP photo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      if (url) void runVision(url, file.name);
    };
    reader.readAsDataURL(file);
  }

  async function runGemini() {
    setBusy(true);
    setError("");
    try {
      const res = await askGeminiAdvisor({
        apiKey,
        field,
        season,
        observations,
        reports,
        question,
        imageBase64: imageFile
          ? { mimeType: imageFile.mimeType, data: imageFile.data }
          : null,
      });
      setReply(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gemini request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel ai-advisor-panel" aria-labelledby="ai-advisor-heading">
      <div className="ai-advisor-header">
        <div>
          <span className="eyebrow">3-LAYER HYBRID AI ENGINE · CV + SCORING + LLM</span>
          <h2 id="ai-advisor-heading">FieldSense AI Decision Engine</h2>
          <p>
            Combines in-browser Computer Vision (HSV + ExG), a weighted
            multi-criteria evidence algorithm, and Gemini multimodal reasoning.
          </p>
        </div>
        <div className="ai-mode-switch" role="tablist" aria-label="AI Engine Mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "algorithm"}
            className={mode === "algorithm" ? "active" : ""}
            onClick={() => setMode("algorithm")}
          >
            <Icon name="chart" size={15} />
            Scoring Algorithm
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "vision"}
            className={mode === "vision" ? "active" : ""}
            onClick={() => setMode("vision")}
          >
            <Icon name="scan" size={15} />
            Leaf CV Vision
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "gemini"}
            className={mode === "gemini" ? "active" : ""}
            onClick={() => setMode("gemini")}
          >
            <Icon name="leaf" size={15} />
            Gemini Multimodal
          </button>
        </div>
      </div>

      {mode === "algorithm" ? (
        <div className="ai-algo-body">
          <div className="ai-score-banner">
            <div className="ai-score-ring" data-band={localAI.priorityBand.toLowerCase()}>
              <strong>{localAI.priorityScore}</strong>
              <span>/ 100</span>
            </div>
            <div className="ai-score-meta">
              <div className="ai-score-pills">
                <span className={`pill ${localAI.priorityBand === "Elevated" ? "amber" : localAI.priorityBand === "Moderate" ? "blue" : "neutral"}`}>
                  {localAI.priorityBand} inspection priority
                </span>
                <span className="evidence-chip">
                  Evidence confidence: {localAI.confidenceLabel} ({localAI.coveragePct}% points)
                </span>
              </div>
              <h3>{localAI.topRecommendation}</h3>
              <p>{localAI.limitations}</p>
            </div>
            <button
              type="button"
              className="secondary"
              onClick={() => onPlanCheck(localAI.topRecommendation)}
            >
              Add to Next steps <Icon name="arrow" size={15} />
            </button>
          </div>

          <div className="ai-feature-grid">
            {localAI.contributions.map((c) => (
              <article className="ai-feature-card" key={c.feature}>
                <div className="ai-feature-top">
                  <strong>{c.feature}</strong>
                  <span>
                    +{c.contribution} pts <small>(wt {c.weight}%)</small>
                  </span>
                </div>
                <div className="ai-feature-bar" aria-hidden="true">
                  <i style={{ width: `${c.score}%` }} />
                </div>
                <p>{c.reason}</p>
              </article>
            ))}
          </div>
        </div>
      ) : mode === "vision" ? (
        <div className="ai-vision-body">
          <div className="ai-vision-actions">
            <button
              type="button"
              className="primary"
              disabled={visionBusy}
              onClick={() =>
                void runVision(
                  "/images/samples/point1-yellowing-wet.jpg",
                  "Sample Point 1 (Yellowing & wet corner)",
                )
              }
            >
              <Icon name="scan" size={16} />
              Run CV on Sample Point 1
            </button>
            <button
              type="button"
              disabled={visionBusy}
              onClick={() =>
                void runVision(
                  "/images/samples/point3-healthy-paddy.jpg",
                  "Sample Point 2 (Healthy green paddy)",
                )
              }
            >
              <Icon name="scan" size={16} />
              Run CV on Sample Point 2
            </button>
            <label className="ai-photo-attach">
              <Icon name="camera" size={16} />
              <span>Upload any leaf/field photo</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleVisionUpload(e.target.files?.[0])}
              />
            </label>
          </div>
          {visionError && (
            <p className="weather-error" role="alert">
              {visionError}
            </p>
          )}
          {visionResult ? (
            <div className="ai-vision-result">
              {visionPreview && (
                <img
                  src={visionPreview}
                  alt={visionLabel}
                  className="ai-vision-thumb"
                />
              )}
              <div className="ai-vision-metrics">
                <div className="ai-score-pills">
                  <span
                    className={`pill ${visionResult.stressLevel === "Elevated" ? "amber" : visionResult.stressLevel === "Moderate" ? "blue" : "neutral"}`}
                  >
                    {visionResult.stressLevel} visual stress ·{" "}
                    {visionResult.inferredLeafColor}
                  </span>
                  <span className="evidence-chip">
                    ExG Index: {visionResult.exgScore}
                  </span>
                </div>
                <h4>{visionLabel}</h4>
                <p>{visionResult.summary}</p>
                <div className="ai-cv-bars">
                  <div>
                    <span>Healthy chlorophyll green</span>
                    <div>
                      <i
                        style={{
                          width: `${visionResult.healthyGreenPct}%`,
                          background: "#287a53",
                        }}
                      />
                    </div>
                    <strong>{visionResult.healthyGreenPct}%</strong>
                  </div>
                  <div>
                    <span>Yellow chlorosis stress</span>
                    <div>
                      <i
                        style={{
                          width: `${visionResult.chlorosisYellowPct}%`,
                          background: "#d4a024",
                        }}
                      />
                    </div>
                    <strong>{visionResult.chlorosisYellowPct}%</strong>
                  </div>
                  <div>
                    <span>Brown necrosis / dry area</span>
                    <div>
                      <i
                        style={{
                          width: `${visionResult.necrosisBrownPct}%`,
                          background: "#b55233",
                        }}
                      />
                    </div>
                    <strong>{visionResult.necrosisBrownPct}%</strong>
                  </div>
                </div>
                <small>
                  Algorithm: {visionResult.algorithm} ·{" "}
                  {visionResult.vegetationPixels.toLocaleString()} canopy pixels
                  segmented locally in-browser.
                </small>
              </div>
            </div>
          ) : (
            <div className="weather-empty">
              <p>
                Click <strong>Run CV on Sample Point 1</strong> or upload a leaf
                photo to run live HSV colour segmentation and Excess Green (ExG)
                canopy stress analysis right in your browser.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="ai-gemini-body">
          <div className="ai-gemini-inputs">
            {!ENV_KEY && (
              <label>
                Gemini API Key (session only — never saved to disk)
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </label>
            )}
            <label>
              Ask about {field.name} (optional — uses all saved field records automatically)
              <input
                type="text"
                placeholder="e.g. Compare waterlogging vs nitrogen deficiency and suggest the next check"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </label>
            <div className="ai-gemini-row">
              <label className="ai-photo-attach">
                <Icon name="camera" size={16} />
                <span>
                  {imageFile
                    ? `Photo attached: ${imageFile.name}`
                    : "Attach a leaf/field photo (optional multimodal input)"}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleImage(e.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                className="primary"
                disabled={busy}
                onClick={() => void runGemini()}
              >
                <Icon name="leaf" size={16} />
                {busy ? "Analyzing with Gemini…" : "Run Gemini AI review"}
              </button>
            </div>
          </div>

          {error && (
            <p className="weather-error" role="alert">
              {error}
            </p>
          )}

          {reply && (
            <div className="ai-gemini-reply">
              <div className="ai-reply-head">
                <span className="pill blue">{reply.model}</span>
                <small>
                  Generated{" "}
                  {new Date(reply.generatedAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · Grounded in {field.name} records
                </small>
              </div>
              <pre className="ai-reply-text">{reply.text}</pre>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
