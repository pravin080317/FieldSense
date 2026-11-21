# FieldSense feature tracker

Updated: 21 November 2026. Living execution tracker for the [rewritten plan](FARMER_FEATURE_MASTER_PLAN.md). This is a repository tracker, not an implemented dashboard in the app. No assignee or delivery date is committed yet; assign these when an item starts.

## Status rules

- **Planned:** requirement recorded; acceptance has not passed.
- **In progress:** active implementation with unfinished work. No item is assigned this status merely because it is next.
- **Partial:** some useful foundation exists; material requested behaviour is absent or unverified.
- **Implemented:** scoped behaviour is coded and automated evidence exists; final acceptance remains open.
- **Accepted:** listed browser/device acceptance evidence is recorded.
- **Field validated:** supported farmer/expert pilot evidence recorded for the declared scope.
- **Blocked:** record a concrete dependency/decision and next resolution action.

Priority: P0 dependable core/release gate; P1 everyday usefulness; P2 later specialist or data-dependent work; P3 optional research/hardware. Priority is evaluated within a release; later-release P1 does not bypass core dependencies. No percentage complete: rows differ greatly in scope.

Evidence baseline is the last recorded run of 67 tests plus build/lint, not a new test run for this documentation edit. Partial rows must be split into a concrete increment before implementation. None is marked Accepted or Field validated in this tracker.

## Feature list

| ID | Release | Priority | Farmer outcome / feature | Status | Current evidence | Remaining acceptance / next action | Dependencies | References |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | 1 | P0 | Short setup, optional exact boundary | Partial | FieldControls; location tests | First useful saved area without full mapping; phone/GPS acceptance pending | None | UX-01 |
| F02 | 1 | P0 | Separate growing areas and historical plantings | Implemented | farm/workspace tests; 67-test baseline | Create/reopen two areas and switch without leaking evidence on phone | F01 | R09/R10 |
| F03 | 1 | P0 | Today: reasoned next actions and empty states | Partial | FarmerHome; Home SSR test | Real due work/concerns, understandable reasons and snooze; farmer test pending | F02,F08 | UX-02 |
| F04 | 1 | P0 | Whole-farm dashboard, photos and charts | Implemented | FarmDashboard; dashboard.test.ts | Verify all-area counts, planting scope, navigation and phone layout | F02 | AGR-08/SRC-07 |
| F05 | 1 | P0 | One Record action with relevant short forms | Planned | Existing visit/activity forms are separate | Concern/work/water/cost/harvest choices, correct area and preview before save | F02 | UX-08 |
| F06 | 1 | P0 | Draft recovery, save status and corrections | Partial | Queued writes/conflicts tested; complete draft flow absent | Interrupted forms recover; failed save never claims success; corrections retain originals | F05 | UX-07 |
| F07 | 1 | P0 | Dated visits/photos and same-point comparison | Partial | Observation/comparison/attachment tests | Revisit/photos survive reload/export; phone camera and comparison comprehension | F02 | R09/SRC-01 |
| F08 | 1 | P0 | Concern/objective linked to evidence and revisit | Planned | Existing visits/jobs are foundation only | Unresolved→check→chosen job→revisit; completion does not auto-resolve concern | F07 | SRC-01 |
| F09 | 1 | P0 | Jobs, completion outcomes and revisit prompts | Partial | Task persistence tests | Date/status/outcome phone acceptance; chosen revisit and reschedule history | F02,F07 | UX-09 |
| F10 | 1 | P0 | Backups, offline reopen and conflict recovery | Partial | Workspace/offline worker tests | Real phone production offline reopen, quota/conflict/restore without loss | F06 | R10 |
| F11 | 1 | P0 | Touch, keyboard, contrast and assistive help | Partial | Help icons; limited Chrome check | Core journey keyboard/screen-reader/200% text and low-cost phone review | F03,F05 | UX-05/08 |
| F12 | 1 | P0 | Fast load and honest online/offline states | Partial | Build passes; main JS warning remains | Set device/network budget then measure; tiles/AI unavailable states preserve records | F10 | UX-07 |
| F13 | 2 | P1 | Tamil/English and local units | Planned | English forms only | Reviewed Tamil; acre/ha and quantity conversion preserve exact records/drafts | F05,F11 | UX-03 |
| F14 | 2 | P1 | Perennials and repeated harvest rounds | Partial | 12 crop choices; unknown-date backup tests | Tree/block identity and dated counts; repeated harvests without annual reset | F02,F24 | SRC-04 |
| F15 | 2 | P1 | Simultaneous beds/batches/mixed plantings | Planned | Single planting scope is current foundation | Concurrent batches independently tracked; shared work/cost allocated once | F02 | R12 |
| F16 | 2 | P1 | Seed quantity and bag estimate | Planned | AGRII_REVIEW acceptance spec | Explicit rate/area/units; transparent kg and bag rounding; save estimate separately | F02,F13 | AGR-01 |
| F17 | 2 | P1 | Plant spacing estimate | Planned | AGRII_REVIEW acceptance spec | Two spacings/area; theoretical count with path/boundary limitations | F02,F13 | AGR-02 |
| F18 | 2 | P1 | Seed lots and input inventory | Planned | No stock ledger | Lot/test/source, purchases/use/adjustments; quantities reconcile with history | F16 | SRC-06/R09/R11 |
| F19 | 2 | P1 | Work, labour and equipment use | Partial | Activity ledger records work/costs | Structured labour/units and shared equipment costs; no double counting | F05,F15 | R09/R11 |
| F20 | 2 | P1 | Watering records and schedules | Planned | Soil observations are not water-use records | Amount/duration/source/date; reminders distinct from watering recommendations | F02,F13 | R19 |
| F21 | 2 | P1 | Tanks, pumps, drains and maintenance | Planned | Source PDF review only | Manual dated capacity/readings, shared links and maintenance; no sensor claim | F20 | SRC-05 |
| F22 | 2 | P1 | Soil/water reports with original papers | Implemented | Report/attachment/backup tests | Phone upload/open/export/reload with unit/source and verification distinction | F02 | R09/SRC-02 |
| F23 | 2 | P1 | Comparable soil-test history graphs | Planned | Saved reports provide baseline | Same measurement/unit/method/depth comparison; incompatible tests separated | F22 | SRC-02 |
| F24 | 2 | P1 | Harvest, losses and sales | Planned | No structured harvest/sales ledger | Partial/repeat harvest, quantity/unit/quality/price; sales separate from harvest | F13,F15 | AGR-03 |
| F25 | 2 | P1 | Costs and recorded returns by planting | Partial | Activity ledger tests; no harvest revenue model | Actual sales/costs and completeness; no summing unlike crop quantities | F19,F24 | SRC-07/R11 |
| F26 | 2 | P1 | Recurring jobs and in-app reminders | Planned | One-off jobs exist | Recurrence/exceptions/snooze; no duplicate completion; actual dates | F09 | UX-09 |
| F27 | 2 | P1 | Crop guides and illustrated growth stages | Partial | Rice reference library; no general stage guide | Reviewed crop/region/date and licensed pictures; farmer-confirmed stage | F13 | AGR-04/SRC-03 |
| F28 | 3 | P1 | Prepare an expert question and case | Partial | Case export exists; no expert delivery | Preview selected evidence/questions; no false sent/received status | F08,F22 | AGR-05/UX-10 |
| F29 | 3 | P1 | Weather near each area | Planned | No live field forecast pipeline | Provider/grid/issued time; stale/missing states and explicit forecast label | F02,F12 | AGR-06/R01 |
| F30 | 3 | P1 | Editable Tamil/English voice records | Planned | No voice integration | Permission, noisy/unsupported/offline fallback; review transcript before save | F05,F06,F13 | UX-06 |
| F31 | 3 | P1 | Accounts, family/team access and optional sync | Planned | Local IndexedDB only | Ownership/roles, explicit destinations, offline merge/conflict/revoke tests | F10 | R09/R10 |
| F32 | 3 | P2 | Read-only soil moisture and other sensors | Planned | No telemetry pipeline | Calibration/source/unit/time, duplicate handling and stale/offline status | F20,F31 | R18 |
| F33 | 4 | P1 | Explainable daily priority rules | Planned | Existing due-job labels are limited baseline | Reason/source for each prompt; chosen follow-ups, dismiss/snooze; no health claim | F03,F08,F09 | UX-02 |
| F34 | 4 | P1 | Photo-based crop concern triage | Planned | Educational rice rules/photos are not ML | Declared supported crop; local held-out evaluation; poor/unsupported input abstains | F07,F08,Q01 | R02/R04 |
| F35 | 4 | P1 | Grounded assistant and record drafts | Planned | No grounded AI assistant | Selected-area sources cited, unknowns explicit; review before writing jobs/records | F05,F27,Q01 | R01 |
| F36 | 4 | P2 | Photo/growth change detection | Planned | Manual comparison only | Comparable view/time/scale; uncertainty; change is not treatment effectiveness | F07,Q01 | R03 |
| F37 | 4 | P2 | Watering estimate | Planned | No validated irrigation recommendation | Crop/stage/weather/moisture inputs, unit checks, missing-data fallback and local evaluation | F20,F29,F32,Q01 | R19 |
| F38 | 4 | P2 | Yield forecast with a range | Planned | No predictive model or local ground truth | Measured crop harvest labels, leakage-free local testing and interval coverage | F24,F29,Q01 | R05 |
| F39 | 5 | P2 | Dated satellite/vegetation comparisons | Partial | Manual bounded imagery overlay only | Real acquisition dates/cloud masks/alignment; no inferred diagnosis | F02,F29,Q01 | AGR-08/R01 |
| F40 | 5 | P2 | Boundary suggestions and spatial plans | Planned | Manual map/GeoJSON exists | Farmer confirms geometry; spatial errors measured; plans separate from actuation | F02,F39,Q01 | R06/R07 |
| F41 | 5 | P2 | Mechanised grain harvest-loss tool | Planned | Reference review only | Applicable crop/equipment, reviewed sampling and formula; no universal targets | F24,F27 | AGR-07 |
| F42 | 5 | P3 | Optional orchard 3D/fruit counts | Planned | No reconstruction/counting pipeline | Scale/occlusion/duplicate errors measured; not a coconut yield claim | F14,Q01 | R08 |
| F43 | 6 | P3 | Optional irrigation/robotics controls | Planned | No live actuation | Authenticated commands, acknowledgements, limits, cancellation, override and field safety tests | F31,F32,Q01 | R14–R19 |
| Q01 | 1–6 | P0 | Prediction, source rights and release gates | Planned | QUALITY_GATES checklist; no validated ML | Per-use scope, local labels/test split, thresholds, model card, pilot and rollback | None | PQ-01–10/R20 |
| Q02 | 1–6 | P0 | Farmer pilot and usability measurement | Planned | No documented farmer validation | Recruit representative users; agree targets; measure completion/errors/understanding | F01,F07,F09,F10 | UX-01–10 |
| Q03 | 1–6 | P0 | Privacy, permission and data lifecycle | Partial | Local data; explicit map location; no complete audit | Consent/destinations/export/delete/retention; sharing scope and sensitive logs checked | F06,F10,F31 | QUALITY_GATES |

## Next increment tracker

| Order | Item | State | Completion evidence needed |
| --- | --- | --- | --- |
| 1 | F01/F02/F04/F07/F09/F10 current core-journey acceptance | Pending | Desktop and representative phone: two growing areas → visit/photo → job → revisit → comparison → backup/restore/offline; scope, permission, failure and navigation checks. Record actual defects. |
| 2 | F05/F06 unified Record draft and review | Pending | Agree small record schema, implement first concern/work flow, interrupted draft recovery, save errors and persistence; test and inspect UI. |
| 3 | F08 concern-to-revisit workflow | Pending | Link original evidence and chosen job; completion distinct from resolution; revisit visible on Today and in History. |
| 4 | F11/F13/Q02 local usability review | Pending | Plain/Tamil wording, units, accessibility and measurable pilot results; targets set before pilot. |
| 5 | F16/F17 seed and spacing calculators | Pending | Explicit inputs, units and assumptions, boundary tests, saved estimate provenance and understandable result. |

## Update log

| Date | Change | Evidence / limits |
| --- | --- | --- |
| 21 November 2026 | Created farmer-outcome tracker with 46 items and mapped AGR/SRC/R references. | Status based on code/progress evidence already recorded; no new app capability or field acceptance. |

When starting an item, add an assignee and intended increment here. On completion record dated test/device evidence, remaining limitations and a source/commit reference in PROGRESS.md; only then change the status. New source ideas must map to an existing row or receive a new stable ID. R01–R20 subfeatures remain tracked in TECHNICAL_FEATURE_CATALOGUE.md and require per-adapter verification when selected.
