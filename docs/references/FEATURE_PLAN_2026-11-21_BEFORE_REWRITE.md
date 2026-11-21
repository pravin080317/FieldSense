# FieldSense farmer product and feature master plan

Requested: 21 November 2026. The user asked to add all features from the supplied 20-project breakdown to the plan before further development, with farmer usefulness, simplicity, reliability and accurate predictions as priorities.

This is a **planning backlog**, not a claim that these integrations exist. Original reference: [user-supplied breakdown](references/USER_REPOSITORY_BREAKDOWN.txt). Detailed upstream capabilities and licences must be verified against a pinned version before reuse. See [OPEN_SOURCE_REVIEW.md](OPEN_SOURCE_REVIEW.md), [DATASET_REVIEW.md](DATASET_REVIEW.md) and [IMAGERY_REVIEW.md](IMAGERY_REVIEW.md) for narrower reviews already performed.

## Product objective

Scope update: the user explicitly requested broader farm/crop coverage. The shared platform now permits eight seasonal crop identities for record-keeping; crop-specific guidance remains separate and gated. See [CROPS_AND_FARM_TYPES.md](CROPS_AND_FARM_TYPES.md) for the staged seasonal/perennial/mixed/other-area models. Earlier rice-first references describe the initial pilot, not a permanent product restriction.

Help a farmer in Salem, Tamil Nadu answer: What needs attention? What did I observe? What should I check next? What work is due? What changed? What did I use, harvest and spend?

Keep farmer flows short and understandable. Expert tools, model settings, connectors and research outputs belong behind secondary navigation. Start with paddy and locally reviewed advice, then expand crops only when their data and workflows are ready. Neutral field names and explicit local units remain required.

Absolute prediction accuracy and a flawless product cannot be guaranteed. Product targets are measured reliability, useful decisions, clear limitations and a way to recover. An uncertain result is preferable to an unsupported diagnosis. Predictions must never silently replace farmer observations, laboratory reports or expert findings.

## Current baseline and gaps

Implemented, with varying verification depth: field/season setup; map centre/coordinates/boundary entry; place search and explicit device location; append-only visits; local photos and report documents; task outcomes; visit comparison; activity-cost summary; manual imagery overlays; rice reference library; IndexedDB backups/conflict protection; production offline shell.

Latest automated baseline: 62 tests, build and lint passed. Live locality-search endpoint checked. Many map, permission, upload, mobile and offline-reopen browser acceptance flows remain pending. Main bundle exceeds the current warning threshold. There is no trained rice classifier, live farm telemetry, automatic farm-boundary detection, backend account system or cloud sync. Full inventory, harvest/sales, Tamil and operational notifications are not yet implemented.

## Farmer experience requirements

| ID | Requirement | Acceptance evidence |
| --- | --- | --- |
| UX-01 | Onboard a real field with coordinates, nearby-place search or deliberate device location; mark/import its boundary. | A farmer can save/reopen a real field and distinguish it from sample data. Centre selection, corner drawing and GPS do not overwrite one another. |
| UX-02 | Home prioritises real overdue/due work, recent changes and the next useful action. | No fabricated crop-health scores, sensor values or live-data labels. Empty states lead to a useful next step. |
| UX-03 | Tamil/English choice, locally reviewed farmer wording and familiar units. | Fluent Tamil farmer/agronomist review, usable fonts, terminology and dates; language switching preserves drafts and record IDs. |
| UX-04 | Simple primary navigation: Home, Fields, Record, Tasks and History. | Farmers can find/complete common tasks without expert terminology or browsing research features. |
| UX-05 | Touch, keyboard, focus order, contrast and assistive technology work across themes. | Test actual phones and keyboard flows, 200% text sizing, labelled errors and visible focus; target WCAG 2.2 AA and record any unmet criteria. |
| UX-06 | Voice/photo-assisted recording where useful, with explicit permission and editable transcript. | Handle Tamil/English, permission refusal, noise, unsupported devices and offline limits without losing typed input. No automatic recording. |
| UX-07 | Clear saving, offline, failed-save and recovery states. | Save/reopen without network, recover a failed write and restore a backup without silent data loss. |
| UX-08 | Progressive disclosure, short forms and actionable help. | Common flows ask only relevant questions; farmers can review/correct before saving. No connector/model jargon in everyday steps. |
| UX-09 | Notifications reflect real task dates and actual permissions. | Show in-app reminders first; any background/SMS/push channel has delivery/failure tests and clear user control. |
| UX-10 | Practical handoff to an agronomist. | Produce a clear case summary with dates, field context, evidence, missing information and farmer-selected sharing; do not imply an expert received an unsent report. |

## Delivery stages and release gates

| Stage | Focus | Exit gate |
| --- | --- | --- |
| A — Trustworthy core | Complete existing UI/map/GPS/upload/offline acceptance, simplify setup, fix discovered defects and reduce load cost. | First-time setup → visit → task → revisit → backup/restore passes on representative phone/desktop/offline conditions. No unresolved blocking data-loss defects. |
| B — Everyday farm work | Tamil-first UX, input inventory, activities, harvest/sales, season summaries, reminders and structured growing guidance. | Real farmer pilot completes common workflows; units and stock/cost arithmetic reconcile; low-literacy usability issues are addressed. |
| C — Connected evidence | Backend identity/permissions, sync, read-only sensor/weather ingestion, provenance and export adapters. | Permission/isolation, sync-conflict/recovery, data freshness and duplicate ingestion tests pass; no stale telemetry described as current. |
| D — Evaluated predictions | Rice datasets, reference labels, model baseline, field validation, calibrated uncertainty and expert review. | Publish model/data cards and pre-agreed performance results on held-out local field data; weak/unsupported cases abstain. |
| E — Advanced spatial analysis | GeoTIFF/CRS, spectral imagery, time series, crop/parcel segmentation, yield research and 3D where useful. | Geospatial alignment, cloud/missing-data handling and each analytical output validated independently; demonstrate farmer benefit. |
| F — Optional hardware | Irrigation controllers, robotics/coverage planning, edge devices and actuators. | Separate bench/simulation/field safety validation, human approval/override and fail-safe behavior before live actuation. |

Stages organise dependencies, not calendar promises. Do not defer core defects to add more visual features. Keep hardware/enterprise/research capabilities as optional modules so they do not burden a small paddy farmer's interface.

## Complete mapping of the 20 supplied projects

Each numbered group captures the supplied technical features as candidate requirements. Status is **Planned / upstream verification required** unless an existing FieldSense subset is explicitly identified. These are capability targets, not mandatory choices of third-party libraries.

### R01 — [FarmVibes.AI](https://github.com/microsoft/farmvibes-ai) — C/D/E

- R01.1 Time/space-aligned inputs: optical/radar imagery, elevation, weather and sensor observations with provenance, resolution and units.
- R01.2 Typed DAG orchestration for ingestion, preprocessing and inference; job states, retries, cancellation and input/output versioning.
- R01.3 Optional local/container compute and authenticated REST/Python adapters; separately scoped cloud/VM deployment plans, resource estimates and approval before provisioning.
- R01.4 Evaluate harvest-date, carbon, microclimate and crop-classification workflows individually. Do not treat example notebooks as ready local predictions.
- Existing subset: dated manual image layers only; no fusion engine or remote inference connected.

### R02 — [AgML](https://github.com/Project-AgML/AgML) — D

- R02.1 Reproducible dataset registry/loaders with task/crop labels, citations and per-dataset rights; native training-framework/Hugging Face adapters as appropriate.
- R02.2 RGB, multispectral and image/text inputs with explicit band, modality and annotation schemas.
- R02.3 Optional synthetic-data generation and dataset diversity/quality benchmarking; identify synthetic versus original samples.
- R02.4 Versioned caching and train/validation/test splits, including stratification and leaf/farm/date grouping to prevent leakage.
- Verify exact APIs before adopting examples; the reviewed current README emphasises Hugging Face DatasetDict and downstream framework processing.

### R03 — [PlantCV](https://github.com/danforthcenter/plantcv) — D/E

- R03.1 Optional plant morphology/colour traits: size, shape, height, leaf count and canopy metrics with calibration/scale, method and error bounds.
- R03.2 Plant/leaf/background segmentation; benchmark representative field backgrounds before use.
- R03.3 Landmark/root/leaf morphometrics for repeat measurements with explicit registration and scale.
- R03.4 Batch/parallel analysis and longitudinal/statistical exports; investigate R/pcvr interoperability separately.
- No pixel-to-centimetre, canopy or leaf count is currently inferred from an uploaded photo.

### R04 — [PlantVillage](https://github.com/spMohanty/PlantVillage-Dataset) — D

- R04.1 Disease/healthy class catalogues and crop compatibility checks before model use; published PlantVillage classes do not cover rice.
- R04.2 Preserve distinctions between RGB, grayscale and segmented input variants and preprocessing.
- R04.3 Leaf-group-aware, duplicate-aware evaluation splits; pin dataset revisions.
- R04.4 Audited dataset loader/Hub integration and provenance; no unreviewed training downloads presented as deployed models.
- Existing subset: separate attributed UCI rice reference examples and local manual comparison, not PlantVillage inference.

### R05 — [CropNet](https://github.com/fudong03/CropNet) — D/E

- R05.1 Spatiotemporal alignment of imagery/vegetation indices, meteorology and measured yield records.
- R05.2 Explicit supported crop/geography registry; US crop/county benchmarks must not become Salem paddy predictions without new validation.
- R05.3 Evaluate seasonal/multi-year yield models such as temporal transformer baselines with held-out years/regions and uncertainty intervals.
- Start with actual farmer-entered harvest weights; do not substitute a research yield estimate for a measured harvest.

### R06 — [U-TAE & PaPs](https://github.com/VSainteuf/utae-paps) — E

- R06.1 Multiscale/temporal satellite feature encoding with acquisition/band metadata.
- R06.2 Separate crop classification from parcel instance segmentation and boundary suggestions.
- R06.3 Variable sequence lengths, missing dates and cloud-quality handling; record valid observation counts.
- R06.4 Reproducible PASTIS/pretrained-model benchmarking and a local transfer evaluation before suggesting field boundaries.
- Any future boundary suggestion must be reviewed by the farmer; it does not establish ownership or surveyed accuracy.

### R07 — [EuroCrops](https://github.com/maja601/EuroCrops) — C/E

- R07.1 Map external crop taxonomies/HCAT to versioned local crop definitions without erasing original codes.
- R07.2 Import parcel vector records with CRS, region/source and spatially blocked evaluation metadata.
- R07.3 Link crop/parcel data to dated satellite series where available.
- European self-declared parcels are not Indian land records; require locally appropriate sources and rights for Salem.

### R08 — [FruitNeRF](https://github.com/meyerls/FruitNeRF) — E, optional orchard module

- R08.1 Multi-view/semantic reconstruction jobs with input coverage/quality reporting.
- R08.2 Point-cloud extraction, outlier filtering and fruit-instance clustering/counting with measured field errors.
- R08.3 Optional Nerfstudio-compatible data preparation, CLI jobs and artifact viewer.
- This is not a paddy-core feature. Enable only for an orchard use case after independent validation; no 3D reconstruction currently runs.

### R09 — [farmOS](https://github.com/farmOS/farmOS) — B/C

- R09.1 Structured assets and dated logs: plantings, equipment, materials, sensors, seeding/input/harvest/observation records with reference validation and audit history.
- R09.2 Spatial records, GPS layers, boundary editing, GeoJSON/WKT interchange and sensible clustering where needed.
- R09.3 Explicit REST/JSON:API adapters and client mappings, including CRUD permissions, schema versions and errors.
- R09.4 Offline entry plus authenticated background sync with conflict review and recovery.
- Existing subset: field/season records, manual maps, observations/tasks, backups and an offline shell. No farmOS-compatible API or cross-device sync is implemented.

### R10 — [LiteFarm](https://github.com/LiteFarmOrg/LiteFarm) — A/B/C

- R10.1 Farmer-friendly mapping of fields, structures, water sources and infrastructure without crowding the main view.
- R10.2 Planting-to-harvest schedules, task templates/crew assignments and unit-aware input applications.
- R10.3 Source-backed certification/credit/environmental record exports; label jurisdiction/scheme/version and require reviewer approval.
- R10.4 Owner/manager/worker roles, farm isolation and localised mobile workflows.
- Existing subset: single-device tasks, mapped fields and recorded-cost CSV. No multi-user role system or certified compliance export exists.

### R11 — [Ekylibre](https://github.com/ekylibre/ekylibre) — B/C, advanced accounting optional

- R11.1 Inventory, purchases, harvests, sales, invoices and reconciliation; full double-entry accounting only as a separately scoped module.
- R11.2 Receipt/document attachment first; optional OCR-assisted entry with original file, confidence and mandatory correction/review.
- R11.3 Jurisdiction-aware input/regulatory references, with dates, crop/label scope and local expert/legal verification before decision support. Do not reuse European rules for Tamil Nadu.
- R11.4 Tested connector/plugin contracts, independent backups and separately authorised hosted deployments.
- Existing subset: entered activity costs and report document attachments only; no ERP or dosage-validation engine.

### R12 — [Tania](https://github.com/usetania/tania-core) — B/C

- R12.1 Areas/sub-areas/reservoirs, planting batches and lifecycle records where they improve real farmer workflows.
- R12.2 Read-only sensor/MQTT ingestion adapter with device identity, time, units, calibration and duplicate handling.
- R12.3 Mobile task templates and role-aware flows, with localised terminology.
- R12.4 Assess a lightweight backend/edge deployment, rather than rewriting the React app merely to match another stack.
- Verify supplied MQTT/role/deployment claims before treating them as upstream-ready modules.

### R13 — [OpenFarm](https://github.com/openfarmcc/OpenFarm) — B

- R13.1 Structured, dated, locally reviewed crop guides by lifecycle stage: water, sun, soil, spacing and sowing context.
- R13.2 Versioned machine-readable guide/crop schema for future integrations; offline copies with source/licence/update date.
- R13.3 Taxonomy/compatibility/icon sources checked separately for rights and local applicability; no unverified companion-planting rules.
- Upstream repository confirms shutdown in April 2025 and archival. Treat it as a reference schema/code source, not a functioning hosted API.

### R14 — [Fields2Cover](https://github.com/Fields2Cover/Fields2Cover) — F

- R14.1 Coverage planning pipeline: headlands, swaths, ordering and smoothing with field holes/obstacles.
- R14.2 Vehicle width/turning constraints and feasible turns, validated against hardware limits.
- R14.3 Compare route patterns/optimisers with distance/coverage metrics and excluded zones.
- R14.4 Optional ROS/Nav2 simulation/adapter after version verification; human review and tested emergency stop before execution.
- No autonomous route/vehicle controller is part of today's browser map.

### R15 — [OpenWeedLocator](https://github.com/geezacoleman/OpenWeedLocator) — D/F

- R15.1 Separate fallow green-on-brown and in-crop detection modes; verify supported algorithms/models by version.
- R15.2 Bench-validated actuation latency/vehicle-speed envelope; never assume a supplied speed claim applies to new hardware.
- R15.3 Reviewed bill of materials, wiring, enclosure and environmental protection requirements.
- R15.4 Bench-only monitoring/tuning/logging before any actuator commands. Live spraying needs an independently assessed operational plan and local rules.

### R16 — [FarmBot OS](https://github.com/FarmBot/farmbot_os) — F

- R16.1 Device-specific motion/sensor/valve interface and limits; no generic control from a farm map.
- R16.2 Versioned sequences/scripts with simulation, preflight review, cancellation and manual override.
- R16.3 Signed/verified update lifecycle and rollback, preserving configuration and credentials.
- R16.4 Deliberate local provisioning/pairing and network recovery; no silent device enrolment.

### R17 — [ROS Agriculture](https://github.com/ros-agriculture) — F

- R17.1 RTK/GNSS/IMU driver inventory, correction-source compatibility and measured localisation quality.
- R17.2 Waypoint/row-navigation simulation and a validated hardware adapter, with exclusion areas and manual control.
- R17.3 Read-only soil sensor interfaces plus repeatable simulation/synthetic scenarios, clearly labelled as simulated.
- This link is an organisation, not a single package. Identify maintained repositories/ROS versions before implementation; phone geolocation is not RTK.

### R18 — [Farm Data Relay System](https://github.com/timmbogner/Farm-Data-Relay-System) — C/F

- R18.1 Document node/gateway topology and radio/network characteristics; evaluate ESP-NOW/LoRa suitability with real coverage tests.
- R18.2 Distinguish measurement/subscriber nodes from actuator nodes, with device identity, timestamps and delivery state.
- R18.3 MQTT/serial/Ethernet bridge contract with schema, authentication, missing-data/out-of-order/deduplication tests and read-only monitoring first.
- Do not present imported files as a live wireless sensor network.

### R19 — [OpenSprinkler](https://github.com/OpenSprinkler/OpenSprinkler-Firmware) — C/F

- R19.1 Irrigation schedules and optional weather/ETo adjustments with verified local crop applicability; advisory calculations first.
- R19.2 Validate actual sensor/channel/expander support and calibration for a pinned controller version.
- R19.3 Authenticated API/MQTT integration, flow/leak events, connectivity and command acknowledgement; verify cloud-relay terms separately.
- R19.4 Zone/pump sequencing and concurrency limits, logs, maximum runtimes, cancellation and manual override.
- The supplied 16-channel/formula/zone specifics are not verified here. No controller or pump should be enabled by a planning document.

### R20 — [Awesome Agriculture](https://github.com/brycejohnston/awesome-agriculture) — research support

- R20.1 Maintain a categorised source registry with review date, owner, URL, version, licence and actual FieldSense integration status.
- R20.2 Assess scientific/weather/soil/crop-modelling references against intended crop, region and validation needs.
- R20.3 Assess hardware/interchange standards individually; use explicit versioned adapters, not claims of general compatibility.
- This directory is a discovery source, not an accuracy guarantee or blanket licence for linked projects.

## Prediction quality programme

| Gate | Required evidence before a farmer-facing prediction |
| --- | --- |
| PQ-01 Scope | Define the question: disease triage, parcel suggestion, weather alert or yield estimate. Specify crop, region, growth stage, units and exclusions. |
| PQ-02 Ground truth | Qualified review of labels; sampling method, disagreement handling, dates, field identity and source rights recorded. |
| PQ-03 Leakage prevention | Keep related leaf/plant/farm/date samples and augmented copies together; separate model tuning from final test data. |
| PQ-04 Representative evaluation | Include unseen Salem/Tamil Nadu fields and seasons, devices, cultivars, light/backgrounds, normal plants, nutrient/water stress and unrelated/poor images. |
| PQ-05 Appropriate metrics | Classification: per-class precision/recall, confusion matrix, calibration and abstention coverage. Regression: MAE/RMSE and interval coverage. Segmentation: spatial overlap/boundary error. Report sample sizes and confidence intervals. |
| PQ-06 Pre-agreed thresholds | Agree acceptable errors with agronomists/farmers for each use before viewing final results. No arbitrary universal accuracy target or borrowed benchmark percentage. |
| PQ-07 Uncertainty | Detect unsupported crop/input and poor/stale/missing evidence; ask for a retake, field check or expert review rather than forcing a class. A model score is not automatically a calibrated probability. |
| PQ-08 Useful action | Recommend a justified next check with source/context. Do not prescribe chemicals from an image label. Show date and provenance, including measured facts that weaken a suggestion. |
| PQ-09 Traceability | Retain model/dataset/preprocessing versions, input IDs, evaluation/model card, failure cases and reviewer feedback separately from farmer observations. |
| PQ-10 Pilot and monitoring | Run a supervised pilot, track false reassurance/false alarms, compare against expert baseline, monitor drift and retain rollback/disable capability. Re-evaluate after model, data or preprocessing changes. |

Until these gates pass, use reference, demonstration or experimental labels and keep automated results out of confirmed evidence. No current feature establishes predictive accuracy.

## Reliability and usability release checklist

- [ ] Real farmer completes field setup without confusing sample geometry, device position, place result and boundary.
- [ ] Save initial visit and revisit at the same point; historical values/photos remain and comparison is understandable.
- [ ] Create/complete/reopen tasks; due dates and actual outcomes survive reload.
- [ ] Save/reopen real soil/water report and original file; restore/export preserves context and provenance.
- [ ] Offline production reopening works after first download; slow/failed installs, cache loss and service updates behave honestly.
- [ ] Multi-tab conflict and backup restore do not silently overwrite records; quota errors offer recovery/export.
- [ ] Online search/tiles fail gracefully; location permission refusal, timeout and inaccurate fixes have usable alternatives.
- [ ] No save or navigation silently drops drafts, photos or pending form changes.
- [ ] Full primary flows work on representative low-cost Android devices, desktop keyboard and all supported themes/languages.
- [ ] Record task completion, time, errors and farmer comprehension from a real pilot. Set usability/performance targets with the pilot team rather than declaring the UI flawless from screenshots.
- [ ] Reduce initial JS/image work and test slow connections/memory limits; offline payload size remains visible in engineering checks.
- [ ] Privacy: deliberate location/camera/mic/sharing, minimised exports, no secrets in browser bundles, explicit server/third-party data destinations and retention.
- [ ] New capabilities have domain, persistence, error/recovery and integration tests proportionate to risk; close known critical defects before release.

## Implementation and tracking rules

1. Finish a reviewable increment with its data model, working UI, persistence, validation and documented limits; avoid empty dashboards.
2. Verify upstream API, maintenance, code/data/weight licences and compatibility before installing or copying anything. The supplied breakdown is not verification.
3. Keep record collection functional without ML. Keep read-only integrations separate from hardware actuation.
4. Update DEVELOPMENT_PLAN.md and PROGRESS.md with actual evidence. Planned, implemented, browser-verified and field-validated are distinct statuses.
5. Approval of this plan does not authorise cloud charges, live spraying/motion, disclosure of farmer data or publication of unvalidated agronomic claims.
6. No source-code implementation or GitHub push is part of this planning increment. Select the next stage/feature after the user reviews the plan.

## Agrii-inspired practical tools — 21 November 2026

[Review and acceptance criteria](AGRII_REVIEW.md): AGR-01 seed quantity; AGR-02 planting spacing; AGR-03 harvest/sales; AGR-04 crop guides; AGR-05 expert handoff; AGR-06 weather; AGR-07 harvest-loss checks; AGR-08 dated satellite comparisons. Planned, not implemented. Reuse existing records/exports and avoid duplicating inventory, weather or spatial workstreams. Prioritise dashboard acceptance, then simple reviewed calculators and harvest records.

## Local source-document review — 21 November 2026

[Eight-PDF review and source page references](SOURCE_DOCUMENT_REVIEW.md) adds SRC-01 objective-to-revisit workflow, SRC-02 comparable soil history, SRC-03 illustrated crop stages, SRC-04 trees/repeat harvests, SRC-05 water/equipment, SRC-06 seed lot records and SRC-07 comparable field outcomes. Planned extensions mapped to existing AGR tools, inventory, harvest and connected-evidence stages. Current app does not implement these additions merely because references were supplied.
