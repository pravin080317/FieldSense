import type { FarmField, FarmSeason, FarmTask } from "../types/farm.ts";
import type { Observation } from "../types/domain.ts";
import type { FieldReport } from "../types/reports.ts";
import { cropName } from "../data/crops.ts";

export interface AIFeatureContribution {
  feature: string;
  weight: number;
  score: number;
  contribution: number;
  reason: string;
}

export interface LocalFieldAIResult {
  algorithm: "Weighted Multi-Criteria Evidence Model (v1)";
  priorityScore: number;
  priorityBand: "Low" | "Moderate" | "Elevated";
  confidenceLabel: "Low" | "Medium" | "High";
  coveragePct: number;
  topRecommendation: string;
  contributions: AIFeatureContribution[];
  limitations: string;
}

export function runLocalFieldAI(input: {
  field: FarmField;
  season: FarmSeason;
  observations: Observation[];
  tasks: FarmTask[];
  reports: FieldReport[];
  today: string;
}): LocalFieldAIResult {
  const { season, observations, tasks, reports, today } = input;
  const latestByPoint = new Map<string, Observation>();
  const sorted = [...observations].sort(
    (a, b) => +b.observedAt - +a.observedAt || +b.recordedAt - +a.recordedAt,
  );
  for (const o of sorted) {
    const key = o.scoutingPointId || o.id;
    if (!latestByPoint.has(key)) latestByPoint.set(key, o);
  }
  const points = [...latestByPoint.values()];
  const coveragePct = Math.min(100, Math.round((points.length / 4) * 100));

  const leafChanged = points.filter(
    (p) => p.leafColor && p.leafColor !== "normal",
  ).length;
  const waterlogged = points.filter(
    (p) => p.soilCondition === "waterlogged",
  ).length;
  const maxPests = points.reduce(
    (m, p) => Math.max(m, p.visiblePestCount || 0),
    0,
  );
  const overdueTasks = tasks.filter(
    (t) => t.status !== "completed" && t.dueDate < today,
  ).length;

  // Feature 1: Spatial leaf-symptom spread (weight 30)
  const leafScore = points.length
    ? Math.round((leafChanged / points.length) * 100)
    : 0;
  // Feature 2: Waterlogging / drainage stress (weight 25)
  const waterScore = points.length
    ? Math.round((waterlogged / points.length) * 100)
    : 0;
  // Feature 3: Pest pressure intensity (weight 20)
  const pestScore = Math.min(100, maxPests * 15);
  // Feature 4: Evidence gap / missing coverage or reports (weight 15)
  const missingPointsPenalty = Math.max(0, 4 - points.length) * 18;
  const missingReportPenalty = reports.length === 0 ? 28 : 0;
  const gapScore = Math.min(100, missingPointsPenalty + missingReportPenalty);
  // Feature 5: Operational urgency from overdue work (weight 10)
  const taskScore = Math.min(100, overdueTasks * 50);

  const contributions: AIFeatureContribution[] = [
    {
      feature: "Leaf symptom spread",
      weight: 30,
      score: leafScore,
      contribution: Math.round((leafScore * 30) / 100),
      reason: points.length
        ? `${leafChanged} of ${points.length} scouted point(s) show yellowing, browning or mottling.`
        : "No scouting points recorded yet.",
    },
    {
      feature: "Drainage & water stress",
      weight: 25,
      score: waterScore,
      contribution: Math.round((waterScore * 25) / 100),
      reason: waterlogged
        ? `${waterlogged} point(s) recorded standing/waterlogged soil.`
        : "No standing water recorded at latest points.",
    },
    {
      feature: "Visible pest pressure",
      weight: 20,
      score: pestScore,
      contribution: Math.round((pestScore * 20) / 100),
      reason: maxPests
        ? `Peak count of ${maxPests} insect(s) at a single scouting point.`
        : "No insects counted at latest points.",
    },
    {
      feature: "Evidence completeness gap",
      weight: 15,
      score: gapScore,
      contribution: Math.round((gapScore * 15) / 100),
      reason: `${points.length}/4 points scouted · ${reports.length} lab report(s) attached.`,
    },
    {
      feature: "Overdue field actions",
      weight: 10,
      score: taskScore,
      contribution: Math.round((taskScore * 10) / 100),
      reason: overdueTasks
        ? `${overdueTasks} planned job(s) are past their due date.`
        : "No overdue jobs for this planting.",
    },
  ];

  const priorityScore = Math.min(
    100,
    contributions.reduce((sum, c) => sum + c.contribution, 0),
  );
  const priorityBand: LocalFieldAIResult["priorityBand"] =
    priorityScore >= 55 ? "Elevated" : priorityScore >= 25 ? "Moderate" : "Low";
  const confidenceLabel: LocalFieldAIResult["confidenceLabel"] =
    points.length >= 3 && reports.length > 0
      ? "High"
      : points.length >= 2
        ? "Medium"
        : "Low";

  let topRecommendation =
    "Continue routine weekly scouting across all four marked points.";
  if (points.length < 2) {
    topRecommendation =
      "Record observations at least at 2–4 marked points (including healthy plants) so the evidence model has spatial contrast.";
  } else if (waterlogged > 0 && leafChanged > 0) {
    topRecommendation =
      "Inspect drainage outlets and check root health in the waterlogged patch before applying any fertiliser or spray.";
  } else if (maxPests >= 3) {
    topRecommendation =
      "Verify insect species on leaf undersides and repeat counts at all four points before deciding on pest control.";
  } else if (leafChanged > 0 && reports.length === 0) {
    topRecommendation =
      "Attach a recent soil or water test report for this field to separate nutrient stress from other causes.";
  } else if (overdueTasks > 0) {
    topRecommendation =
      "Review overdue field jobs and log whether earlier actions improved the affected patch.";
  }

  return {
    algorithm: "Weighted Multi-Criteria Evidence Model (v1)",
    priorityScore,
    priorityBand,
    confidenceLabel,
    coveragePct,
    topRecommendation,
    contributions,
    limitations: `Transparent weighted index for ${cropName(season.crop)} (${season.variety}). Measures inspection priority from saved records — not a confirmed plant disease diagnosis.`,
  };
}

export interface GeminiAdvisoryResponse {
  model: string;
  generatedAt: string;
  text: string;
}

export function buildFieldContextPrompt(input: {
  field: FarmField;
  season: FarmSeason;
  observations: Observation[];
  reports: FieldReport[];
  question: string;
}): string {
  const { field, season, observations, reports, question } = input;
  const obsLines = observations.slice(0, 8).map((o) => {
    const parts = [
      `Point ${o.scoutingPointId || "general"}`,
      `date=${o.observedAt.toISOString().slice(0, 10)}`,
      o.leafColor ? `leaves=${o.leafColor}` : null,
      o.soilCondition ? `soil=${o.soilCondition}` : null,
      o.visiblePestCount !== undefined ? `insects=${o.visiblePestCount}` : null,
      o.generalNotes ? `notes="${o.generalNotes}"` : null,
    ].filter(Boolean);
    return `- ${parts.join(", ")}`;
  });
  const reportLines = reports.slice(0, 4).map(
    (r) =>
      `- ${r.kind} report (${r.sampledOn}, ${r.sourceName}): ${r.measurements.map((m) => `${m.label}=${m.value} ${m.unit}`).join(", ")}`,
  );

  return [
    "You are FieldSense AI, an agricultural decision-support assistant for Indian farms.",
    "Rules: Be concise, practical, and honest about uncertainty. Separate observed facts from possible causes. Never invent lab measurements or prescribe specific chemical pesticide dosages. Always list the most useful next field check.",
    "",
    `Field: ${field.name} (${field.locality}, ${field.areaHectares} ha, irrigation: ${field.irrigationSource})`,
    `Crop & Season: ${cropName(season.crop)} (${season.variety}), stage: ${season.growthStage}, sown: ${season.sowingDate || "unknown"}`,
    "",
    "Recorded observations:",
    obsLines.length ? obsLines.join("\n") : "- None recorded yet.",
    "",
    "Entered soil/water reports:",
    reportLines.length ? reportLines.join("\n") : "- None entered yet.",
    "",
    `Farmer / Presenter Question: ${question.trim() || "Summarize the top likely causes, missing evidence, and the single best next field check."}`,
  ].join("\n");
}

export async function askGeminiAdvisor(input: {
  apiKey: string;
  field: FarmField;
  season: FarmSeason;
  observations: Observation[];
  reports: FieldReport[];
  question: string;
  imageBase64?: { mimeType: string; data: string } | null;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
}): Promise<GeminiAdvisoryResponse> {
  const key = input.apiKey.trim();
  if (!key)
    throw new Error(
      "Enter a Gemini API key (or set VITE_GEMINI_API_KEY) to run live AI analysis.",
    );

  const prompt = buildFieldContextPrompt(input);
  const parts: Array<
    { text: string } | { inline_data: { mime_type: string; data: string } }
  > = [{ text: prompt }];

  if (input.imageBase64) {
    parts.push({
      inline_data: {
        mime_type: input.imageBase64.mimeType,
        data: input.imageBase64.data,
      },
    });
  }

  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const fetcher = input.fetcher || fetch;

  const response = await fetcher(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 550,
      },
    }),
    signal: input.signal,
    credentials: "omit",
    referrerPolicy: "no-referrer",
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 400 || status === 401 || status === 403) {
      throw new Error(
        "Gemini API rejected the key or request. Check that your API key is valid and enabled for Generative Language API.",
      );
    }
    throw new Error(
      `Gemini API returned status ${status}. Please try again in a moment.`,
    );
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();

  if (!text)
    throw new Error("Gemini API returned an empty response. Please try again.");

  return {
    model: "Gemini Multimodal AI",
    generatedAt: new Date().toISOString(),
    text,
  };
}
