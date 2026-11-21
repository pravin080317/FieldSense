# FieldSense product assessment and roadmap

Assessment date: 20 November 2026

Status: recorded product direction for ongoing work; individual features below are not implemented unless recorded in [PROGRESS.md](PROGRESS.md).

## Implementation update — 20 November 2026

21 November: dated field imagery viewer added in My field, inspired by the supplied photogrammetry/farmOS/FarmVibes sources. It displays user-supplied north-up exports with manual bounds and opacity; processing, georeferencing and analytics remain external/future work. See [IMAGERY_REVIEW.md](IMAGERY_REVIEW.md).

21 November: reviewed awesome-agriculture and relevant upstream projects. Added an original season activity/cost ledger with filters, category totals, missing-cost coverage and CSV export. See [OPEN_SOURCE_REVIEW.md](OPEN_SOURCE_REVIEW.md) for source comparisons and proposed inventory/harvest/weather priorities; external integrations remain planned.

21 November: dataset-inspired rice reference library added, including attributed UCI examples, local manual photo comparison and visit/task entry actions. Research and the staged rice-recognition plan are in [DATASET_REVIEW.md](DATASET_REVIEW.md). Automatic image classification remains unimplemented.

Original soil/water report attachments are implemented: bounded PDF/report-photo files with provenance, download, backup and export support. L2-06 now awaits independent review and browser acceptance; document authenticity is not automatically verified. This supersedes earlier attachment-pending notes.

History now includes same-point revisit comparison, recorded differences, visit-linked photos and comparison export. L2-05 remains in progress: measured affected-area comparison and visual acceptance are pending. Recorded changes do not establish treatment effectiveness.

The production offline app shell is implemented with readiness/retry controls and deferred updates. Browser acceptance remains pending; simulated worker tests do not establish closed-app offline readiness on real devices. This supersedes older statements that no service worker exists.

Soil/water report entry has now been added: dated, scoped, unit-preserving records with provenance, backup and expert export. L2-06 remains in progress until document attachments, independent review and browser acceptance are addressed. Farmer-entered data is not promoted to verified laboratory evidence.

Permanent history, actual visit dates, field/rice-season setup, multiple tasks, geographic boundary controls and persisted themes are now implemented. The latest controls need browser acceptance. Soil/water report entry, Tamil localisation, independent photo storage and offline reopening remain pending. See [PROGRESS.md](PROGRESS.md) for validation evidence. The assessment below records the original baseline.

## Current assessment

FieldSense is a Level 1 prototype. The redesign improved its appearance, but the underlying capability remains a demonstration: one fixed field, historical scenarios, deterministic educational rules and limited record management. The recent work improved interface quality more than product maturity.

The next objective is a usable field companion for paddy farmers in Salem, with a complete season-long workflow and dependable farmer records.

## Related products reviewed

This assessment uses official public websites and documentation, not hands-on testing of authenticated apps. Product capabilities can change. These are design references, not endorsements or claims of equivalent functionality in FieldSense.

| Product | Published strengths | What FieldSense should learn |
| --- | --- | --- |
| [Plantix](https://plantix.net/en/) | Photo-led crop problem reporting, guidance, experts and a knowledge library. | Make reporting a crop problem immediately obvious and easy. |
| [Cropwise Protector](https://www.cropwise.com/us/protector) | Georeferenced scouting, photos, text and voice notes, offline collection and field histories. | Build around repeatable field visits and reliable records. |
| [Cropin Grow](https://www.cropin.com/cropin-grow-smartfarm-plus/) | Plot records, crop-specific schedules, activity tracking, weather advisories and pest alerts. | Connect crop stage, field work and monitoring throughout a season. |
| [DeHaat](https://agrevolution.in/solution-for-farmers) | Farmer reminders, regional-language calls, weather and expert consultations. | Design for local language, low effort and access to real help. |
| [AGRIVI](https://www.agrivi.com/products/farm-management-software) | Connected agronomy, operations and economics, including activities and cost per hectare. | Show practical and economic consequences of decisions. |
| [EOSDA Crop Monitoring](https://eos.com/user-guide/crop-monitoring/) | Field maps, dated imagery, historical comparisons, weather charts and scouting tasks. | Support investigation across location and time. |

The common strength is continuity: field evidence becomes a task, the task becomes a recorded action, and the next visit shows what changed.

Combining data and explaining evidence is already a direction taken by established platforms. FieldSense must distinguish itself through a well-executed local workflow and demonstrated usefulness, rather than that claim alone.

## Concrete gaps in the current implementation

- No genuine farm setup: users cannot create their own field, draw its boundary or start a new season.
- Observation history is replaced: saving a sampling point removes its previous observation. This undermines longitudinal comparison.
- The workflow is tied to October 2024: new observations receive a fixed historical observation date.
- Only one follow-up is stored: there is no proper collection of tasks, visits, investigations or completed cases.
- The field map is illustrative: it does not measure changes in affected area between visits.
- Soil records are scenario controls: users cannot enter a complete report with sample location, units and laboratory interpretation.
- Browser localStorage is basic persistence, not a complete offline application, backup or cross-device account.
- Farmer screens still expose too much technical material. Detailed investigation language should mainly live in expert review.

## Product and navigation direction

The farmer home screen should answer:

1. What needs my attention?
2. Where is it?
3. What should I do next?

Example, explicitly labelled as sample data:

> Paddy Field 01 — revisit needed. Yellowing was reported at two sampling points. Last visit: 18 October. Next check: roots and drainage. Continue field check.

Proposed farmer navigation: **Home · Fields · Record · Tasks · History**.

Detailed evidence, rule explanations and technical reports belong in a separate expert review workspace. Slogans, repeated field illustrations and demo controls should receive less attention than current farm work.

Problem reporting should ask targeted questions. For yellowing, distinguish older versus younger leaves, spatial pattern, low-lying patches and root observations. Ask fewer, more informative questions instead of showing every input at once.

## Prioritised enhancements

| ID | Priority | Enhancement | Useful completion criteria |
| --- | --- | --- | --- |
| L2-01 | 1 | Field and season onboarding | Create and reopen a field with location/boundary, crop, variety, sowing date and irrigation source; start a new season without losing the previous one. |
| L2-02 | 2 | Permanent observation history | Every visit has a unique ID and observed/recorded timestamps; revisits append records; the engine uses relevant current evidence without deleting history. |
| L2-03 | 3 | Fast problem reporting | Report symptoms, affected location, photos and severity with a short farmer-friendly flow; ask targeted follow-up questions. |
| L2-04 | 4 | Real task management | Store multiple tasks with due dates, status, linked evidence and completion outcomes; show due work on Home. |
| L2-05 | 5 | Field change comparison | Compare dated photos, pest counts and reported affected area at the same locations; distinguish missing measurements from zero change. |
| L2-06 | 6 | Proper soil and water records | Enter dated measurements with units, sample locations, report attachments and laboratory interpretation; exclude irrelevant evidence transparently. |
| L2-07 | 7 | Tamil-first farmer experience | Provide reviewed Tamil and plain English, accessible controls and optional voice notes; retain technical detail for expert review. |
| L3-03 | 8 | Expert case review | An expert requests missing evidence, annotates a case and records a reviewed recommendation with attribution and date. |

## Maturity stages

### Level 1 — Current prototype

Responsive screens, sample scenarios, a transparent rule engine, local saving, a diary, a single follow-up and case export. A useful demonstration, not a field-ready product.

### Level 2 — Usable field companion

Build onboarding, real dates, permanent visit history, multiple tasks, photo records and reliable local storage. Simplify farmer navigation. Much of this can work without a backend.

Use IndexedDB for structured records and images. Add a service worker so the application itself can reopen offline. Provide explicit storage/error handling and export/import backup. A completed stage must support a repeat visit after closing and reopening the app without losing earlier evidence.

### Level 3 — Connected pilot

Add accounts, secure backup and synchronisation, farmer/expert roles, sourced weather integration and reviewed crop-stage guidance. Show pending uploads, last successful sync and data freshness. Handle shared access and offline conflicts explicitly.

### Level 4 — Validated decision support

Evaluate investigations against agronomist-reviewed cases and field use. Measure next-check usefulness, likely-cause ranking, appropriate uncertainty and farmer task completion. Introduce image analysis only with measured performance and uncertain-result handling. Add satellite monitoring only where it improves a specific decision.

## Recommended implementation order

Build Level 2 thoroughly before adding more AI or satellite features. Keep the initial agronomy scope to paddy in Salem while allowing farmer-owned records.

Within Level 2, establish the record model and storage foundation alongside onboarding and permanent history; then build the reporting, task and comparison workflows on those records. Validate each completed increment and update the progress tracker with actual evidence.

The next major improvement must be something a farmer can repeatedly use, rather than another round of dashboard decoration.
