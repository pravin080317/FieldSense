# FieldSense farmer-first product plan

Rewritten: 21 November 2026. Status: agreed planning direction from the conversation; implementation and acceptance remain feature-specific. This plan replaces the earlier technology-led delivery order. It does not claim the current UI already behaves this way.

## Purpose and first useful result

Help a farmer understand what needs attention across their growing areas, record what happened, choose the next action and return to see what changed.

The first useful journey is: **Add a growing area → record a concern → gather useful evidence → choose a check or job → record completion → revisit → compare.** It must work without a trained model, exact mapped boundary or complete historical data.

Primary users are farmers managing several seasonal fields, trees, beds or planting batches, initially with Salem/Tamil Nadu language and unit needs. Crop records can be broad; advice and models must have a narrower declared crop/region scope. Rice and paddy are one crop identity.

## How the app should behave

1. **Understand my farm.** Ask location, growing areas, crops and the farmer's immediate goal in short steps. Allow a neutral familiar area name and approximate location. Exact boundaries, optional details and old records can be added later. Keep examples visibly separate.
2. **Tell me what needs attention.** Home provides a few reasoned actions from actual due jobs, unresolved concerns and chosen follow-up dates. Acknowledge no new information; never equate no alerts with healthy crops. Include dismiss, snooze and correction with retained history.
3. **Show my whole farm.** Dashboard cards show crop/photo, last check and next job. Filters and a farm-wide/area-specific scope stay visible. Charts answer a question and offer their underlying records; no unexplained health percentage.
4. **Make recording easy.** One Record action offers concern, work, watering, spending, harvest or sale. Ask only relevant questions. Photo, text and later voice produce an editable draft. Confirm crop/area/date, preview, save, show save status and preserve interrupted drafts.
5. **Help me investigate.** Ask crop-relevant questions, request a better photo if needed, show plausible causes only when supported, explain missing evidence and suggest the next useful check. Unsupported crops/inputs receive an honest fallback, not a forced result.
6. **Help me follow through.** Link an objective or concern to observations, advice, agreed work and a return visit. Make a suggested action a job only after the farmer chooses it. Completion and outcome are separate: doing work does not prove improvement.
7. **Explain results over time.** Compare dated observations/photos at the same place, compatible soil tests, actual spending and crop-specific harvests. Keep predictions, estimates and confirmed entries distinct.
8. **Recover gracefully.** Explain offline/online limits, preserve drafts, expose save errors and conflicts, support correction and backups, and make camera/location/microphone/sharing deliberate. Typed input remains available if voice or AI fails.

## Navigation and information layout

Target primary destinations: **Today, My farm, Record, Jobs, History**. My farm contains the whole-farm dashboard and individual growing areas. Tools, Guides, expert preparation and settings are secondary. These are target labels, not a claim that current routes have migrated.

- Today: next useful action, reasons, chosen follow-ups, first-use setup and visible farm context.
- My farm: all-area cards; within an area, planting/batches, photos, concerns, work, soil/water papers, costs and harvests.
- Record: short task-based entry, persistent draft, review and save; avoid asking the farmer to select technical record types.
- Jobs: due/overdue/scheduled work, completion, outcome and return visit; optional recurring jobs with exceptions.
- History: chronological evidence, comparisons and exports. Preserve original values and show later corrections.

## Model the farm properly

| Concept | Required behaviour |
| --- | --- |
| Growing area | Stable identity, name, location/optional boundary and area source/unit. Area survives crop changes. Shared water/equipment can link to several areas without duplicate totals. |
| Seasonal planting | Crop/variety, planting dates, stage confirmed by farmer, optional harvest expectation and end/archive state. Historical plantings remain accessible. |
| Trees/perennials | Ongoing planting/block, unknown planting date allowed, dated tree counts, maintenance and repeated harvest rounds over years. |
| Beds/batches/mixed areas | Several simultaneous plantings with their own dates, crop, evidence and harvest. Explicit scope for shared work/costs; do not silently duplicate shared expenses. |
| Observation and visit | Date, location/point, crop context, source and optional photo. Missing is different from zero; correction history is retained. |
| Concern and objective | Unresolved question/problem linked to evidence, advice, jobs and revisit; resolution supplied by farmer/expert, never inferred merely from a completed task. |
| Estimate/prediction | Separate dated output with inputs, assumptions, supported scope, model/formula version and uncertainty. Does not overwrite actual records. |

Livestock/fisheries, machinery automation and research tools are optional later modules with their own models; do not force them into crop forms.

## Feature scope and useful AI

The authoritative item-by-item status is [FEATURE_TRACKER.md](FEATURE_TRACKER.md). Every row has an acceptance condition; none is declared farmer-validated solely from code or automated tests.

- Daily work: setup, multiple areas, useful Home, dashboard, unified recording, concerns, jobs/revisits, crop/batch/perennial models, comparison and recovery.
- Operations: seed/spacing calculators, seed lots/input stock, work/labour, water logs, equipment maintenance, harvest/losses/sales, costs and recorded returns, recurring work and locally reviewed guides.
- Access: Tamil/English, familiar units, illustrated stages, help icons, readable touch/keyboard/screen-reader flows and editable voice drafts.
- Connected evidence: weather with timestamps, read-only moisture sensors, accounts/roles, optional synchronisation and explicit expert handoff.
- Algorithms: transparent quantities, units, cost arithmetic, due dates and explainable priority rules. Prefer these when they answer the question reliably.
- ML: narrowly scoped photo triage, change detection and later watering/yield estimates when required data exists. Evaluate on representative local fields and support abstention.
- AI assistant: draft structured records, ask relevant follow-up questions and explain reviewed evidence in plain language. Ground answers in selected field records and dated reviewed sources; no invented measurements, automatic chemical prescription or unchosen jobs.
- Advanced/optional: satellite monitoring, boundaries suggested for confirmation, spatial application plans, 3D/fruit counts and hardware. Existing imported images or GPS do not establish these capabilities.

## Delivery sequence and release gates

| Release | Outcome | Required exit evidence |
| --- | --- | --- |
| 1 — Dependable daily companion | Finish the core journey, simpler setup/recording, Home/dashboard scope, concerns/revisits, drafts, recovery and accessibility. | Real browser/phone setup→visit→job→revisit→comparison→backup/recovery; no critical data-loss defect; farmers understand the next action. |
| 2 — Useful farm operations | Tamil, appropriate planting models, seed/spacing, stock, work, water, harvest/sales and cost coverage. | Local wording review; arithmetic/units and persistence tests; repeated harvest/shared costs reconcile; farmer pilot can complete common work. |
| 3 — Connected evidence | Weather/sensor provenance, accounts and optional sync, expert preparation and voice drafts. | Freshness/refusal/offline states, role/isolation/conflict tests, explicit external destinations and no lost typed drafts. |
| 4 — Evaluated intelligence | One supported photo-triage use case first; grounded explanations and later water/yield estimates as data permits. | All prediction gates pass, held-out local evaluation, expert-reviewed useful next steps, supervised pilot and rollback. |
| 5 — Spatial and specialist tools | Dated satellite comparisons, validated segmentation, spatial plans and optional orchard 3D. | Alignment/cloud/error tests and measured farmer benefit for each independent output. |
| 6 — Optional hardware | Sensor-to-controller and robotics work, separately from advisory app. | Bench/simulation/field validation, explicit operator controls, acknowledgements, cancellation and fail-safe behaviour. |

Releases express dependencies, not calendar promises. Prototype intelligence can run in isolated evaluation while the records/UX work progresses, but must not appear as validated advice. Use [QUALITY_GATES.md](QUALITY_GATES.md) for prediction, privacy, recovery and release checks.

## Current baseline and execution queue

Current app remains a Level 1 prototype with substantial record functionality. Latest recorded automated run: **67 tests, build and lint passed**; desktop/mobile/farmer acceptance remains incomplete and the main bundle warning persists. Twelve crop choices and unknown dates for some ongoing plantings are not full orchard/mixed-crop support. Current rice rules/reference images are educational; there is no deployed validated ML classifier or live sensor/weather pipeline. Local changes are unpushed.

Next execution order:

1. Capture and fix the current desktop/phone core-journey defects, including dashboard scope/navigation and draft loss risks.
2. Implement simple onboarding, unified record draft/review and concern→job→revisit linkage; retain compatible existing data.
3. Review Tamil/plain-language flow and units with farmers; establish pilot task-time/comprehension targets before testing.
4. Seed/spacing plus seed lot foundations; then structured harvest/sales and repeat-harvest model before new income graphs.
5. Add connected evidence and narrow ML only behind their data/quality gates.

## Success measures and tracker maintenance

Measure first useful record completion, independent completion of the full journey, navigation/input errors, recovery success, return-visit completion and farmer understanding of suggestions. Set numerical usability targets with the pilot team; none has yet been measured. For ML measure per-class errors, false reassurance, calibration/abstention and useful next actions, not a single advertised accuracy score.

For every meaningful increment update tracker implementation status, verification evidence, remaining acceptance, dependency and next action, plus PROGRESS.md. A feature is Done only after its acceptance evidence is recorded. Do not invent completion percentages, owners, dates or field validation. Product scope changes require updating this plan rather than appending contradictory priorities.

## Preserved research and traceability

- [Technical catalogue](TECHNICAL_FEATURE_CATALOGUE.md): all R01–R20 projects and subfeatures retained, pending upstream verification.
- [Agrii tools](AGRII_REVIEW.md): AGR-01–08, mapped in the tracker.
- [Local PDFs](SOURCE_DOCUMENT_REVIEW.md): SRC-01–07, with page anchors and applicability limits.
- [Crop models](CROPS_AND_FARM_TYPES.md), [Home critique](HOME_JOURNEY_REVIEW.md), [open-source review](OPEN_SOURCE_REVIEW.md), [dataset review](DATASET_REVIEW.md), [imagery review](IMAGERY_REVIEW.md).
- [Previous plan snapshot](references/FEATURE_PLAN_2026-11-21_BEFORE_REWRITE.md): historical only; superseded for priorities. Original user breakdown remains unchanged.
