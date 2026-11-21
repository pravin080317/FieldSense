# Level 2 development plan

## Approved place search and field pin

- [x] Explicit town/village search, India/worldwide filters, source attribution and clear results.
- [x] Apply chosen area to draft locality/coordinates; do not move the boundary.
- [x] Set field centre with one map click; separate corner-marking mode and keyboard coordinates.
- [x] Request cancellation/timeouts, session cache, response validation and tests (62 total); build/lint and live endpoint smoke.
- [ ] Browser/phone acceptance: search Salem, select Tamil Nadu result, place centre, mark corners, save/reload and confirm retained geometry. Test offline and provider/CORS failures.


## Map location discovery fix

- [x] Locate me directly on the map; separate device marker and accuracy circle.
- [x] Clarify sample field versus device location; do not infer boundaries.
- [x] Secure-context/permission/unavailable/timeout guidance and synthetic tests.
- [ ] Physical-phone permission/location checks over HTTPS; desktop approximate accuracy and map recentering acceptance.


## Dated field imagery — 21 November 2026

- [x] Review Photogrammetry Guide, farmOS changelog and FarmVibes; document decisions in IMAGERY_REVIEW.md.
- [x] Add scoped, dated north-up image exports with source, notes and WGS84 bounds.
- [x] Map overlay selection, visibility and opacity; download original file.
- [x] Backup/export/reopen and validation regression checks (55 tests); build/lint.
- [ ] Browser/mobile alignment, pan/zoom, switching and offline persistence acceptance using a real map export.
- [ ] Separate future work: GeoTIFF/CRS handling, external photogrammetry processing, 3D, satellite connectors and evaluated spectral indices. No service deployment is authorised or claimed by this increment.


## Open-source agriculture review and cost ledger — 21 November 2026

- [x] Review awesome-agriculture and primary farmOS/LiteFarm/Tania/AgML pages; save decisions in OPEN_SOURCE_REVIEW.md.
- [x] Add field/season activity summaries using existing entered costs.
- [x] Date/activity filters, category totals and explicit missing/excluded values.
- [x] Filtered CSV export with quoting/formula protection; preserve originals.
- [x] Tests/build/lint: 52 tests pass.
- [ ] Browser/mobile acceptance, including filters, zero/blank costs and CSV download.
- [ ] Proposed later work: Tamil, inventory, harvest/sales, dated weather and evaluated rice ML. None is claimed as an implemented external integration.


## Dataset-inspired crop references — 21 November 2026

- [x] Review original PlantVillage, PlantDoc and rice-specific dataset documentation.
- [x] Add attributed rice examples, search, local side-by-side preview and capture prompts.
- [x] Connect reference review to saved visit/task workflows without generating diagnoses.
- [x] Include reference assets in offline production cache; verify bundled hashes.
- [x] Tests, build and lint (48 tests).
- [ ] Browser/mobile acceptance, including file preview and reference/task navigation.
- [ ] Rice-model training, field evaluation, uncertain-input handling and agronomist review. See DATASET_REVIEW.md; automatic recognition remains unimplemented.
- [ ] Finish the earlier map zoom/point/boundary interaction check.


## Original report document increment

- [x] Attach original PDF/report photos to saved soil/water reports.
- [x] Preserve filename, size, type, attachment time and bytes in backups/exports.
- [x] Download documents; validate file limits, encoding and basic signatures.
- [x] Regression checks for invalid files, backup round trip and database reopen.
- [ ] Browser/mobile file-picker and download acceptance; independent blob storage and expert verification remain pending.


## Revisit comparison increment

- [x] Same-point, same-field/season earlier and later selectors in History.
- [x] Recorded categorical changes and numeric differences; missing is not zero.
- [x] Notes/provenance and explicit visit-photo attachment/display.
- [x] Download originals and comparison; preserve history and validate photo links.
- [x] Regression tests, build and lint.
- [ ] Desktop/mobile/keyboard acceptance and photo workflow; affected-area measurements remain separate future work.


## Offline shell increment

- [x] Versioned production shell generated from build assets; farmer records stay in IndexedDB.
- [x] Connection/readiness states and cache repair retry.
- [x] Deferred updates without forced form reloads; scoped cache cleanup.
- [x] Worker regression tests, production build and lint.
- [ ] Browser acceptance: open production online, wait for Offline app ready, save a visit/task/report, close the app, disconnect, reopen the same URL and verify records. Reconnect and test updates across two tabs. Never clear real farmer data for a test.


Started: 20 November 2026

User instruction: add the enhancement roadmap to the plan and start development. The roadmap remains in [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md); verified delivery status lives in [PROGRESS.md](PROGRESS.md).

## Milestone 1 — Preserve the evidence (core workflow verified; recovery checks pending)

- [x] Versioned workspace model, permanent visit/observation IDs and explicit record dates.
- [x] IndexedDB repository with safe migration from existing localStorage; leave the original data intact.
- [x] Append new visits instead of replacing a sampling point's history; evaluate the latest relevant observations.
- [x] Show current point state separately from chronological visit history.
- [x] Versioned JSON backup export and validated, additive restore with duplicate handling.
- [x] Test migration, reload, history, invalid backups and transaction failures; build and lint.

- [x] Browser acceptance: current timestamp, two visits at the same point, reload, original history retained, backup download/import/preview and duplicate-safe restore. Verified on the isolated demo origin.
- [ ] Remaining browser recovery checks: legacy migration, malformed/conflicting backup interaction and genuine stale-tab recovery. Automated tests cover these paths.
- [x] Recheck fixes: avoid development hot-update revision resets, avoid writing an unchanged workspace on open, and consistently sort same-time visits using recordedAt. Final build/lint and 20 tests pass; development hot-update replay is still a manual follow-up.

This is the first reviewable development increment. It does not claim complete Level 2 readiness.

## Milestone 2 — Farmer-owned fields and tasks

- [ ] Field/season creation and reopening, including current dates and irrigation source.
- [ ] Multiple tasks linked to fields, visits and outcomes; due work on Home.
- [ ] Simplified Home / Fields / Record / Tasks / History navigation.

## Milestone 3 — Complete the local workflow

- [ ] Targeted symptom reporting, repeated-point comparison and dated photos.
- [ ] Farmer-entered soil/water reports with units, provenance and relevance checks.
- [ ] Tamil farmer copy and accessible mobile interaction.
- [ ] Offline application shell, recovery and full Level 2 acceptance checks.

Connected accounts, live integrations, expert collaboration and evaluated image AI remain later milestones. Update this plan and the progress tracker with actual completion and verification results.


## Farmer experience increment — requested 20 November 2026

The user prioritised a further UI review, modern styling, understandable content, images and help before continuing the larger field/task milestones.

- [x] Five clearly labelled primary farmer actions; secondary tools stay available.
- [x] Farmer-facing titles, form choices and next-check descriptions use plain language.
- [x] Bundled paddy imagery with a visible illustration label; preserve actual observation photos separately.
- [x] Accessible whole-plant/close-up framing diagrams and in-flow photo guidance.
- [x] Searchable Help, common questions, keyboard dismissal and inline form explanations.
- [x] Desktop and 400-pixel phone inspection; help search and mobile guide navigation checked.
- [x] Production build, lint and all 20 existing tests pass.
- [ ] Validate rear-camera capture on phone hardware and More-menu interaction across additional device sizes.

Details and asset prompt: [UI_ASSETS.md](UI_ASSETS.md). This increment does not claim new agronomic capabilities or complete Level 2 readiness.


## Naming and locality preference

## Soil and water report increment

- [x] Farmer-entered soil/water records scoped to selected field and season.
- [x] Sample/report dates, source, sample location/depth, reference and notes.
- [x] Add/remove measurement rows and preserve printed units and written lab interpretation.
- [x] Mark typed reports unverified; retain the evidence engine's verified-lab requirement.
- [x] Persist records, include them in expert exports and restorable backups, reject conflicting imports.
- [x] Automated validation and database reopen checks; build/lint.
- [ ] Browser/mobile/keyboard acceptance; original document attachments and independent review.

## Naming and locality preference (continued)

Use neutral labels (**Salem Farm**, **Paddy Field 01**) and **Salem, Tamil Nadu** for the current sample workspace. Avoid personal/community-based farm names in new demo records. Map positions remain explicitly illustrative.


## Active increment — working field controls, maps, tasks and themes

Implementation complete; automated validation passes (29 tests, build, lint). The checklist below remains open for end-to-end browser acceptance: browser host/native input unavailable during this increment. Next run: create/edit/reopen field, add season, mark/import/export boundary, complete/reopen linked tasks, reload each theme and inspect desktop/mobile. Test street tiles and GPS on a real device. See PROGRESS.md for limits.

Requested: 20 November 2026. Preserve neutral Salem/Tamil Nadu defaults.

- [ ] Version 4 migration: retain all existing observations, photos, diary entries and follow-up; add fields, seasons, tasks and theme preference.
- [ ] Create/edit/reopen fields, select a season and add a new season without deleting earlier evidence.
- [ ] Interactive geographic map with pan/zoom, check-point selection, editable field boundary, coordinate entry and GeoJSON import/export. Provide local geometry when online tiles are unavailable.
- [ ] Multiple field/season tasks with due dates, status, linked observations and recorded outcomes; show pending work on Home.
- [ ] Forest, Earth and Night app themes persisted with the workspace.
- [ ] Partition notes/photos/reports by field and season; prevent sample weather/lab data from becoming evidence for user-created fields.
- [ ] Regression tests for migration, field/season isolation, validation, tasks and backups; build/lint and UI verification.

Later items (lab-report entry, Tamil localisation, offline app shell and connected services) remain in Milestone 3 and beyond.
