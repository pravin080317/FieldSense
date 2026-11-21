import type {
  Observation,
  SoilTest,
  WaterTest,
  WorkingExplanation,
  Field,
  WeatherRecord,
} from "../types/domain.ts";

// Educational evidence rules, not validated diagnostic or treatment thresholds.

export class EvidenceEngine {
  static analyze(
    field: Field,
    observations: Observation[],
    soilTests: SoilTest[],
    waterTests: WaterTest[],
    asOf = new Date(),
    weather: WeatherRecord[] = [],
  ) {
    const riceReview = field.cropId
      ? field.cropId === "rice"
      : !field.cropType || /^(rice\b|paddy\b)/i.test(field.cropType);
    if (!riceReview)
      return {
        explanations: [] as WorkingExplanation[],
        missingCritical: [
          "Crop-specific review is not available for this crop yet. Keep clear photos and notes for an agronomist.",
        ],
        nextRecommendedCheck:
          "Record what you see and ask an agronomist familiar with this crop to review it.",
        summaryPlainLanguage:
          "Your records are available, but rice review rules are not used for this crop. No cause has been suggested automatically.",
      };
    const recent = (date: Date, days: number) => {
      const age = asOf.getTime() - new Date(date).getTime();
      return age >= 0 && age <= days * 86400000;
    };

    // Latest observation at each point prevents earlier symptoms from overriding a revisit.

    const latest = new Map<string, Observation>();

    observations
      .filter(
        (o) =>
          o.fieldId === field.id &&
          (!o.seasonId || o.seasonId === field.season.id) &&
          recent(o.observedAt, 14),
      )
      .sort(
        (a, b) =>
          +new Date(a.observedAt) - +new Date(b.observedAt) ||
          +new Date(a.recordedAt) - +new Date(b.recordedAt),
      )
      .forEach((o) => latest.set(o.scoutingPointId || o.id, o));

    const obs = [...latest.values()];

    const soil = soilTests.filter(
      (s) =>
        s.fieldId === field.id &&
        recent(s.testedAt, 90) &&
        s.verificationStatus === "verified",
    );

    const water = waterTests.filter(
      (w) => w.fieldId === field.id && recent(w.testedAt, 7),
    );

    const rain = weather.filter(
      (w) => w.fieldId === field.id && recent(w.observedAt, 7),
    );

    const cite = (o: Observation) =>
      `${o.id} · ${new Date(o.observedAt).toISOString().slice(0, 10)} · ${o.scoutingPointId || field.id}`;

    const make = (
      id: string,
      hypothesis: string,
      matched: Observation[],
      supported: boolean,
      missing: string[],
      nextCheck: string,
      extra: string[] = [],
      weakening: string[] = [],
    ): WorkingExplanation => ({
      id,
      hypothesis,
      status: supported
        ? "supported"
        : matched.length || extra.length
          ? "unresolved"
          : "insufficient evidence",

      confidence: supported ? "medium" : "low",
      supportingEvidence: [
        ...matched.map(
          (o) =>
            `${cite(o)}: leaves ${o.leafColor || "not recorded"}, soil ${o.soilCondition || "unknown"}, pests ${o.visiblePestCount ?? "unknown"}.`,
        ),
        ...extra,
      ],

      evidence: matched.map((o) => ({
        observationId: o.id,
        relevance: cite(o),
      })),
      weakeningEvidence: weakening,
      missingEvidence: missing,
      nextCheck,
    });

    const wet = obs.filter((o) => o.soilCondition === "waterlogged");

    const yellow = obs.filter(
      (o) => o.leafColor === "yellowing" && o.leafLocation === "lower",
    );

    const lesions = obs.filter((o) => /spot|lesion/i.test(o.symptoms || ""));

    const pests = obs.filter((o) => (o.visiblePestCount ?? 0) > 0);

    const low = soil.filter((s) => s.labInterpretation === "low nitrogen");

    const stage =
      field.season.expectedHarvestDate &&
      asOf.getTime() > +new Date(field.season.expectedHarvestDate)
        ? [
            "Season is past expected harvest; verify crop stage before interpreting yellowing.",
          ]
        : [];

    const explanations = [
      make(
        "waterlogging",
        "Waterlogging / root stress",
        wet,
        wet.some((o) => o.leafColor === "yellowing"),
        [
          "Inspect roots and compare the low patch with a healthy point.",
          ...(!water.length
            ? ["Current field water depth and drainage assessment"]
            : []),
          ...stage,
        ],
        "Inspect roots, water depth and drainage at the wettest point.",
        rain.map(
          (w) =>
            `${w.id} · ${new Date(w.observedAt).toISOString().slice(0, 10)}: district rainfall ${w.rainfallMm} mm is context, not proof of field waterlogging.`,
        ),
        obs
          .filter((o) => o.soilCondition === "dry")
          .map(
            (o) =>
              `${cite(o)}: dry soil weakens a waterlogging explanation at this point.`,
          ),
      ),

      make(
        "nutrient",
        "Nutrient / soil stress",
        yellow,
        yellow.length > 0 && low.length > 0,
        [
          ...(!soil.length
            ? [
                "Recent, verified soil report from this field (demo review window: 90 days)",
              ]
            : []),
          "Confirm report method, crop stage and leaf pattern with an agronomist.",
          ...stage,
        ],
        soil.length
          ? "Compare lower and upper leaves and review the laboratory interpretation."
          : "Collect a representative soil sample from this field.",
        low.map(
          (s) =>
            `${s.id} · ${new Date(s.testedAt).toISOString().slice(0, 10)}: laboratory interpretation reports low nitrogen.`,
        ),
      ),

      make(
        "disease",
        "Disease requiring inspection",
        lesions,
        false,
        [
          "Whole-plant and leaf-underside inspection; specialist confirmation if lesions persist.",
        ],
        "Photograph both sides of affected leaves and compare with healthy plants.",
      ),

      make(
        "pest",
        "Pest feeding damage",
        pests,
        pests.length >= 2,
        ["Identify insects and repeat counts using the same sampling method."],
        "Identify the insects and repeat counts at all four points; record feeding damage.",
      ),
    ].sort(
      (a, b) =>
        ({ supported: 0, unresolved: 1, "insufficient evidence": 2 })[
          a.status
        ] -
        { supported: 0, unresolved: 1, "insufficient evidence": 2 }[b.status],
    );

    const missingCritical = [
      ...new Set(explanations.flatMap((e) => e.missingEvidence)),
    ];

    if (new Set(obs.map((o) => o.scoutingPointId)).size < 4)
      missingCritical.unshift(
        "Complete observations at all four scouting points.",
      );

    return {
      explanations,
      missingCritical,
      nextRecommendedCheck: obs.length
        ? explanations[0].nextCheck
        : "Scout all four points and record symptoms and soil condition.",
      summaryPlainLanguage:
        "Working explanations remain open. Supporting evidence is not a confirmed diagnosis; collect the next observation before deciding on treatment.",
    };
  }
}
