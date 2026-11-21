# FieldSense implementation progress

Last updated: 21 November 2026

Product direction: [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)

Execution plan: [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)

Current maturity: **Level 1 prototype**. Level 2 development has started; Milestone 1 (evidence preservation) is active. Existing visual improvements do not establish field readiness.

## Farmer-first plan rewrite and tracker — 21 November 2026

- Replaced technology-led master plan with farmer journeys, target navigation, appropriate growing-area/season/perennial/batch models, useful algorithms/ML/AI roles, six outcome-based releases and acceptance gates.
- Added FEATURE_TRACKER.md: 46 stable items, priorities, dependencies, current evidence, remaining acceptance and an ordered next-increment queue. None claimed accepted or field validated; no artificial completion percentage or delivery dates.
- Preserved the prior plan snapshot, every R01–R20 subfeature in TECHNICAL_FEATURE_CATALOGUE.md, and existing prediction/reliability gates in QUALITY_GATES.md. AGR-01–08 and SRC-01–07 mapped to tracker rows.
- Added current-authority notices to development plan/roadmap and updated README. Review covers planning only; no application features, ML deployment, git commit or push. Verified relative documentation links and tracker/reference structure; app tests not rerun for prose.

## Latest implementation status — fields, maps, tasks and themes

### 3-Layer Hybrid AI Engine & In-Browser Computer Vision (HSV + ExG) — 21 November 2026

- Implemented a real, deterministic in-browser Computer Vision leaf stress analyzer (`src/services/leafVision.ts`) using HSV colour segmentation and the Excess Green Vegetation Index (ExG) to quantify healthy green canopy %, yellow chlorosis %, and brown necrosis % on any uploaded or sample photo.
- Upgraded `FieldAIAdvisor.tsx` into the **3-Layer Hybrid AI Decision Engine** (`Scoring Algorithm` · `Leaf CV Vision` · `Gemini Multimodal`) with 1-click CV scans on Sample Point 1 & Point 2 as well as custom photo uploads.
- Centered the Home page (`FarmerHome.tsx`) around the 3-layer AI architecture (Computer Vision HSV/ExG + Weighted Multi-Criteria AI Engine + Gemini 2.5 Flash) so AI is the clear core of the project rather than an optional side feature.
- Validation: **73 tests pass** (added `tests/leafVision.test.ts`), `oxlint` passes with 0 warnings/errors, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser visual acceptance remains pending.

### Practical pest pressure levels & sample drone orthomosaic — 21 November 2026

- Replaced the literal "How many insects did you count?" prompt in `Record visit` (`App.tsx`) with practical **Visible pest pressure (per 5 hills)** tap pills (`None (0)`, `Few (1–3)`, `Moderate (4–8)`, `Heavy (10+)`) plus an optional exact count stepper, and removed the two redundant inline soil/insect `HelpHint` boxes.
- Generated a realistic top-down aerial drone orthomosaic (`public/images/samples/salem-drone-orthomosaic.jpg`) and wired it into `FieldImagery.tsx` as a built-in illustrative sample layer for the Salem sample field, aligned to the field's WGS84 bounds with working opacity slider and show/hide controls.
- Validation: **71 tests pass**, `oxlint` passes with 0 warnings/errors, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser visual acceptance remains pending.

### Record Visit visual picker & workflow upgrade — 21 November 2026

- Upgraded `Field scouting` (`Record visit`) in `App.tsx` and `Farmer.css`: defaulted directly to the observation form (`step = 1`) instead of an instruction wall, while keeping `Photo guide` 1 click away on Step 1.
- Replaced bare `1/2/3/4` point buttons with rich 2-column point cards displaying quadrat names and live status dots (amber = changes noted, emerald = checked normal, neutral = unrecorded).
- Replaced native `<select>` dropdowns for Leaf colour, Soil condition, and Leaf location with color-coded visual tap-card pickers and added a `− / +` stepper for Insect count across Forest, Earth, and Night themes.
- Validation: **71 tests pass**, `oxlint` passes with 0 warnings/errors, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser mobile/desktop acceptance remains pending.

### My Field architecture & sample data refinement — 21 November 2026

- Audited `My field` end-to-end and eliminated redundant selectors: hid the duplicate top `.workspace-selectors` bar on `My field` (since `FieldControls` already provides full field/season selection) and merged the static `Your crop season` summary directly into the Field Profile card.
- Added an interactive 5-stage crop lifecycle stepper (`Planting → Vegetative → Reproductive → Harvest → Finished`) right inside the Field Profile so farmers can update growth stage in one click.
- Improved Salem sample field realism (`farm.ts`): moved illustrative coordinates from downtown Salem (`11.6643, 78.146`) to rural farmland outside Salem (`11.6485, 78.2215`) so the live satellite view shows agricultural plots, and set `irrigationSource` to `Canal + borewell (sample)`.
- Added direct `Inspect Point 1` / `Inspect Point 2` links on the sample photo gallery and moved the technical `FieldImagery` uploader into a clean collapsible drawer (`Advanced: Georeferenced drone & orthomosaic layers`) to declutter the farmer view.
- Validation: **71 tests pass**, `oxlint` passes with 0 warnings/errors, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser visual acceptance remains pending.

### My Field live satellite map, sample photos & FieldSense AI Assistant — 21 November 2026

- Updated `GeographicMap.tsx` to default to **Live Satellite imagery** (Esri World Imagery) with a 3-way **Satellite / Streets / Offline grid** switcher so the map is no longer blank on load, while gracefully preserving boundaries and check points if offline.
- Generated two realistic illustrative Tamil Nadu paddy scouting photos (`public/images/samples/point1-yellowing-wet.jpg` and `point3-healthy-paddy.jpg`) and displayed them as a labelled sample gallery in `My field` and as the illustrative cover for the Salem sample field card on `FarmDashboard`.
- Added **FieldSense AI Assistant** (`src/services/aiAdvisor.ts`, `src/components/FieldAIAdvisor.tsx`) to `My field` with two modes:
  1. **Local AI Algorithm**: Transparent weighted multi-criteria evidence model (5 features: leaf spread, drainage stress, pest pressure, evidence completeness, overdue actions) computing a 0–100 inspection priority index and feature breakdown with zero API key needed.
  2. **Gemini API (Live)**: Optional multimodal Gemini 2.5 Flash integration (`VITE_GEMINI_API_KEY` or session-only key input) that sends structured field records + an optional uploaded leaf/field photo for grounded advisory.
- Validation: **71 tests pass** (added `tests/aiAdvisor.test.ts`), `oxlint` passes with 0 warnings/errors, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser map tile and live Gemini API checks remain pending.

### My Field live satellite map, sample photos & FieldSense AI Assistant — 21 November 2026

- Updated `GeographicMap.tsx` to default to **Live Satellite imagery** (Esri World Imagery) with a 3-way **Satellite / Streets / Offline grid** switcher so the map is no longer blank on load, while gracefully preserving boundaries and check points if offline.
- Generated two realistic illustrative Tamil Nadu paddy scouting photos (`public/images/samples/point1-yellowing-wet.jpg` and `point3-healthy-paddy.jpg`) and displayed them as a labelled sample gallery in `My field` and as the illustrative cover for the Salem sample field card on `FarmDashboard`.
- Added **FieldSense AI Assistant** (`src/services/aiAdvisor.ts`, `src/components/FieldAIAdvisor.tsx`) to `My field` with two modes:
  1. **Local AI Algorithm**: Transparent weighted multi-criteria evidence model (5 features: leaf spread, drainage stress, pest pressure, evidence completeness, overdue actions) computing a 0–100 inspection priority index and feature breakdown with zero API key needed.
  2. **Gemini API (Live)**: Optional multimodal Gemini 2.5 Flash integration (`VITE_GEMINI_API_KEY` or session-only key input) that sends structured field records + an optional uploaded leaf/field photo for grounded advisory.
- Validation: **71 tests pass** (added `tests/aiAdvisor.test.ts`), `oxlint` passes with 0 warnings/errors, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser map tile and live Gemini API checks remain pending.

### Modern Analytics Dashboard charts — 21 November 2026

- Upgraded `FarmDashboard.tsx`, `dashboard.ts`, and `Dashboard.css` with zero-dependency vector charts: a 6-week SVG column + trend-line visit chart, an SVG radial work-completion donut chart (`Finished` / `On-track pending` / `Overdue`), a crop-area stacked distribution bar with hectare chips, and latest scouting signal bars (`Normal leaves`, `Leaf colour changes`, `Standing water`, `Insects counted`).
- Added KPI icon tiles with sub-metrics (mapped hectares, 6-week visits, completed jobs, overdue highlight) and 1-click status filter pills (`All areas`, `Needs attention`, `On track`) across Forest, Earth, and Night themes.
- Validation: **69 tests pass** (expanded `tests/dashboard.test.ts`), `oxlint` passes with 0 warnings/errors, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser visual acceptance remains pending.

### Demo Scenarios, Dashboard, My Field & Record Visit clarity — 21 November 2026

- Replaced the bare sample `<select>` with a 3-card interactive Demo Scenario switcher (`App.tsx`, `Farmer.css`) explaining starting evidence, what to change live, and one-click `Inspect causes` for Cases A, B, and C.
- Enhanced `FarmDashboard.tsx` field cards with growth stage, visit & changed-point counts, and a direct `Concerns` navigation button.
- Upgraded `My field` with growth-stage badge, coordinates, quick-action buttons (`Record visit`, `Crop concerns`, `Weather & reports`), actual per-point observation summaries (leaf/soil/insects) in **Places to check**, and real entered report counts in **Field records**.
- Added one-click quick-fill symptom presets in `Record visit` (Step 1) for faster logging and smoother live demos.
- Validation: **69 tests pass**, `oxlint` passes with 0 warnings/errors, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser visual acceptance remains pending.

### Live field weather forecast (F29) — 21 November 2026

- Added opt-in 5-day live weather forecast (`src/services/weather.ts`, `src/components/FieldWeather.tsx`) using the public Open-Meteo forecast API for the active field's rounded coordinates, with explicit `credentials: "omit"` and `referrerPolicy: "no-referrer"`.
- Displays current temperature, humidity, wind speed, 5-day rainfall total, daily high/low/rain cards, explicit Open-Meteo model-grid provenance and fetch time, offline/error fallback without affecting saved records, and a quick "Plan post-rain check" action when 5-day expected rain ≥ 10 mm.
- Validation: **69 tests pass** (added `tests/weather.test.ts`), `oxlint` passes with 0 warnings/errors, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser live fetch and mobile layout checks remain pending.

### Sleek Crop Concerns / Investigation polish — 21 November 2026

- Upgraded the Crop Concerns / Investigation screen (`App.tsx`, `Farmer.css`) with a dark-emerald summary banner, status-accented cause cards (`supported` / `unresolved` / `insufficient_evidence`), at-a-glance `supporting · missing` evidence count chips, color-coded `Supporting` / `Weakening` / `Missing` evidence badges, refined Next Check callout, and checklist cards across Forest, Earth, and Night themes.
- Validation: **67 tests pass**, `oxlint` passes with 0 errors/warnings, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser visual acceptance remains pending.

### Sleek App Shell & Farm Dashboard polish — 21 November 2026

- Aligned the navigation shell (`Farmer.css`) and whole-farm dashboard (`Dashboard.css`) with the new Home aesthetic: deep-emerald gradient sidebar, pill-rounded active states, translucent topbar with status pills, elevated KPI tiles with top accents, rounded visit/job bars, and growing-area cards with translucent crop tags across Forest, Earth, and Night themes.
- Validation: **67 tests pass**, `oxlint` passes with 0 errors/warnings, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser visual acceptance remains pending.

### Sleek Home page redesign — 21 November 2026

- Redesigned the Home screen (`FarmerHome.tsx`, `Home.css`, `home.ts`) for a modern, presentation-ready look suited to a college project demo while preserving FieldSense's provenance rules.
- Added a dark-emerald hero banner with the bundled illustrative paddy field visual (`/images/paddy-field-v2.png`), clearly labelled as an illustrative view, alongside a glassmorphic workflow preview, crop support pills, a 4-step workflow strip, 3 feature pillars, and an interactive Salem sample callout.
- Upgraded the returning-farmer view with a 3-tile saved-records snapshot (growing areas, jobs due, saved visits), refined priority cards, growing-area cards with crop badges, quick-record pills, and full Forest/Earth/Night theme support.
- Updated `tests/home.test.ts` to match the `workspace`-based `FarmerHome` interface and verified both first-time and returning journeys.
- Validation: **67 tests pass**, `oxlint` passes with 0 errors/warnings, and `tsc -b && vite build && node scripts/build-offline.mjs` passes. Real-browser visual inspection across desktop/mobile and themes remains pending (Chrome remote debugging was not active).

### Whole-farm dashboard — 21 November 2026

- Added Dashboard navigation and a Home entry, with growing-area cards, saved photos or clearly empty crop placeholders, crop/name filters, last checks and scoped job actions.
- Added six-week saved-visit bars and completed/pending/overdue job summaries. Counts use saved records; status labels describe recorded changes or work, never predicted crop health. Examples are explicitly labelled and excluded by default once real areas exist.
- Added wheat, flowers, coconut and garden plants (12 crop choices total). Rice/paddy stays one crop. Coconut and garden plantings allow unknown planting dates; expected harvest is optional. Existing records and backup schema remain compatible.
- Dashboard uses the selected planting for the open field and latest-added planting for others, with this scope explained onscreen. Older plantings remain in History.
- Validation: 67 tests pass, production build and lint pass. Added field/planting isolation, chart totals and unknown-date backup coverage. Final desktop/mobile visual acceptance remains pending. Main bundle size warning remains. Local changes are unpushed.
- Limits/next: no automatic diagnosis, yield forecast, full orchard harvest model or simultaneous mixed-crop batch model. Next verify dashboard on desktop/mobile and review wording with farmers before field readiness claims.

### Home benefits made explicit — 21 November 2026

- User reported the Home still looked awkward and failed to say what a farmer gains. Inspected the actual existing desktop Home in Chrome: large illustration, generic diary promise and process-first content were the key shortcomings.
- Replaced generic headline with See crop changes. Keep work on track. Added specific outcomes, supported record crops and a labelled wet-patch → job → return-visit example. Reduced image dominance.
- Four described links now explain usable outputs: dated crop comparison, jobs/results, recorded spending and test papers. Benefits are immediately visible for sample/new users, collapsible for returning users so actual work remains accessible.
- Validation: 65 tests/build/lint pass; Home regression updated. Previous Home visually inspected. Post-change screenshot/navigation verification was attempted but blocked by native geometry/foreground mismatch; mobile and final visual acceptance remain pending. Changes are local/unpushed; no new predictive capability claimed.

### Crop-aware record foundation — 21 November 2026

- User questioned rice-only scope. Updated farm-diary positioning and added crop selection for eight crops: rice, maize, millet, groundnut, pulses, cotton, tomato and chilli. Crop belongs to the season so the same land can have different crops over time; old rice records/IDs remain intact.
- Shared record tools remain available. Displays/exports use actual crop identity; neutral new field names and Crop variety replace rice-only setup labels. Rice references are shown only for rice.
- Evidence engine now receives crop identity and abstains for non-rice crops, explaining that expert review is needed. No general-purpose disease or agronomic support is implied by adding crop names.
- [CROPS_AND_FARM_TYPES.md](CROPS_AND_FARM_TYPES.md) defines seasonal, vegetable-batch, perennial/orchard, mixed-planting, nursery and separate livestock/fisheries requirements. Present required-season dates do not establish perennial/mixed-farm support.
- Validation: **65 tests, build and lint pass**; crop backup/compatibility and non-rice abstention tests added. Real-browser crop setup/guidance isolation remains pending; main bundle warning remains. Changes are local and unpushed.

### Home-first farmer journey — 21 November 2026

- User requested a Home redesign with clear purpose/navigation and two challenging reviewers. Used two reviewer agents: one designed the journey, the other challenged overload/sample confusion; combined recommendations in [HOME_JOURNEY_REVIEW.md](HOME_JOURNEY_REVIEW.md).
- Replaced the Home dashboard with purpose, sample-aware setup/record actions and three introductory steps. Returning real-field view shows field/season, actual next job/latest visit and small described report/help links. No invented metrics, historical rain or map clutter on Home.
- Add my field directly opens a fresh setup draft. My field controls precede advanced image tools. Navigation does not reset evidence; selecting a saved real field differs from creating a new one. Form/save and storage behavior are retained.
- Validation: **63 tests, build and lint pass**. New server-render regression covers sample first-use, sample with real fields, and empty real-field states. Browser inspection attempted but blocked by minimised Chrome/failed target recovery and unavailable browser host. Desktop/mobile/theme/keyboard acceptance remains pending. Main-bundle size warning remains.
- Home changes, input-help changes and the full master plan are local and unpushed. This is not a prediction or field-readiness milestone.

### Plain-language input help — 21 November 2026

- User requested assistive icons explaining what screens/inputs mean and how to enter information without difficult terminology.
- Added reusable GuidedField labels with a separate, tap/keyboard-operated Help icon/button, expanded-state announcement, unique input IDs and linked help text. No hover-only instructions or second control nested inside an input label. Help does not submit the form or edit input values.
- Added contextual examples throughout field/season setup, coordinate/place entry, report measurements/dates, work/cost recording, visit observations, tasks and backups. Zero versus unknown and sample versus real data are explained where relevant.
- Simplified visible wording: field size, water source, date planted, number/unit on report, image strength and Download field boundary. Advanced image-map terms were replaced with instructions about copying map numbers and checking edges. Necessary printed units/file formats remain accurate.
- Validation: 62 existing tests pass; build and lint pass. Chrome accessibility tree exposed named Help controls and preserved input names. Visually inspected Next steps, clicked Help for Which marked place?, and observed the explanatory block appear without changing the selected point. Other form toggles, full keyboard/screen-reader use, phone layout and all themes still need acceptance checks. Main-bundle size warning remains.
- No data-model, record or decision-rule change. This UI increment and the preceding full-feature plan remain local and unpushed.

### Full farmer feature plan — 21 November 2026

- User clarified: add **all** features from the supplied 20-project breakdown to the plan before developing further; prioritise farmer usefulness, simplicity, reliability and prediction quality.
- Preserved original reference in `docs/references/USER_REPOSITORY_BREAKDOWN.txt`; it is supplied material, not a verified capability catalogue.
- Added [FARMER_FEATURE_MASTER_PLAN.md](FARMER_FEATURE_MASTER_PLAN.md): all 20 projects and their supplied technical subfeatures mapped to six dependency stages; current subsets and unimplemented integrations distinguished. Includes Tamil/accessibility/low-effort flows, inventory/harvest, provenance, interoperability, data/ML, imagery and optional hardware requirements.
- Defined model quality gates: labelled scope, local ground truth, leakage prevention, representative held-out fields/seasons, appropriate metrics/calibration/uncertainty, pre-agreed error thresholds, expert review, pilot monitoring and rollback. No absolute-accuracy guarantee or currently validated classifier is claimed.
- Recommended next stage: verify and improve the existing core before adding more features. Map/location/upload/offline/browser acceptance, data recovery, mobile farmer usability and performance remain open.
- Spot-checked primary OpenFarm, AgML, Fields2Cover and OpenSprinkler pages; OpenFarm explicitly confirms April 2025 shutdown/archival. Remaining detailed supplied claims still require per-integration verification. Earlier targeted source reviews remain linked.
- Validation: documentation mapping checked for all IDs R01–R20 and all 20 source headings preserved. No app behavior changed; tests not rerun for prose. Last app baseline remains 62 tests/build/lint passing with documented browser and bundle-size limits. Changes are local; no push performed.

### Place search and map centre selection — 21 November 2026

- User approved place search and click-to-set field location. Add/Edit field now includes explicit town/village search with India/worldwide filtering, labelled results and manual result selection. Search fills draft centre/locality only; saving remains explicit.
- Added Set field centre mode and a visible draft centre marker. Centre selection and Mark corners are mutually exclusive. Existing corners are never translated when a centre changes. Coordinate inputs remain the keyboard/offline alternative.
- Search uses Open-Meteo/GeoNames with provider attribution and disclosure that the place name is sent on Search. No search-as-you-type, device-coordinate transmission or private-address requirement. Requests time out/cancel, stale results are ignored, and repeated session queries are cached. Public endpoint is for the current non-commercial demonstration; commercial operation needs provider terms/plan review. No Nominatim service is used.
- Validation: **62 tests, build and lint pass**. Tests cover result coordinate validation/deduplication, encoded country-filtered queries and error handling. Live HTTP smoke returned Salem, Tamil Nadu and other distinct matches; browser CORS/layout/click-to-set/permission acceptance is still pending. Unit tests do not verify map gestures.
- Offline: saved geometry/coordinate entry remain usable, but place search and optional street tiles require internet. Place results are locality centres, not farm boundaries or ownership. The user subsequently authorised checking in these changes to main.

### Map location discovery — 21 November 2026

- User reported that the map was not detecting location. Existing GPS capture was only inside the field editor; map background tiles did not request device location.
- Added explicit Locate me to GeographicMap, with fresh high-accuracy browser request, temporary position marker/accuracy circle and recentering. No automatic permission prompt, field rewrite, generated GPS check points or inferred farm ownership/boundary.
- Added distinct unsupported-browser, insecure-origin, permission, unavailable-position and timeout guidance. Sample text now explains the starter Salem field and where to create a real field. Device position remains transient and is not saved in backups/reports. Online tile requests, when enabled by the user, follow the viewed map area.
- Validation: 59 tests, build and lint pass. New tests use synthetic providers to cover secure context, request options, returned coordinates/accuracy and failure messages. No real device location was requested during automation. Browser permission/GPS/pan/zoom acceptance remains pending; existing bundle-size warning remains.

### Repository publication — 21 November 2026

- User authorised publishing this project to `pravin080317/FieldSense` on `main`.
- Initialised Git at the runnable app root. Preserved original requirements in `docs/requirements`; excluded dependencies, production output and local environment files while keeping the empty `.env.example`.
- Latest application validation: 55 tests, build and lint pass; browser/map acceptance and the bundle-size warning remain documented above/below. Publication does not establish deployed hosting or field readiness.

### Dated field imagery — 21 November 2026

- Reviewed supplied Photogrammetry Guide, farmOS 4.x changelog and FarmVibes.AI; fit and integration boundaries recorded in [IMAGERY_REVIEW.md](IMAGERY_REVIEW.md).
- Added dated image layers in My field: upload an already-processed PNG/JPEG/WebP map export, enter capture date/source/WGS84 bounds and select/show/hide layers with opacity. Labels distinguish manual alignment from georeferencing. No stitching, 3D, GeoTIFF analysis, NDVI or live satellite service is claimed.
- Saved images retain source-file/attachment provenance, field/season links and quality notes; included in backups and expert exports. Defaults keep older workspaces compatible. New-upload overlap checks catch obviously unrelated coordinates without deleting history after later boundary edits.
- Validation: **55 tests, build and lint pass**. New tests cover backup/reopen, old records, invalid bounds/context/dates/types/limits, overlap and retention. Browser upload/alignment/pan/zoom/date switching remain pending; previous map acceptance remains open. Main-bundle size warning remains.
- Limits: up to three 3 MB images per field/season, embedded in the workspace snapshot. Provider integrations, independent blob storage and validated field analytics remain future work.

### Open-source review and season activity ledger — 21 November 2026

- Reviewed the user-supplied awesome-agriculture directory and primary farmOS, LiteFarm, Tania and AgML repository pages. Recorded fit, declared licences, integration limits and priorities in [OPEN_SOURCE_REVIEW.md](OPEN_SOURCE_REVIEW.md). No third-party code or runtime package copied.
- History now summarises existing field/season activity records: date/activity filters, INR category totals, missing/unsupported costs, expandable original records and filtered CSV download. Uses integer paise, preserves zero versus missing and stops unsafe totals.
- Scope is recorded costs, not profit/payment/complete-budget analysis. CSV is not a workspace restore file. Original records remain unchanged, including unsupported legacy values. No schema changes.
- Validation: **52 tests, build and lint pass**. New coverage includes context isolation, inclusive filters, immutability, currency addition, legacy formats, overflow and spreadsheet-safe CSV. Lazy ledger chunk is included in the production shell.
- Visual/mobile acceptance is pending; no new live integration or field-readiness claim. Existing map/offline/photo acceptance and main-bundle size warning remain open. Proposed next items: Tamil, inventory, harvest/sales records, dated weather and evaluated rice ML.

### Dataset-inspired rice reference library — 21 November 2026

- Reviewed PlantVillage, PlantDoc and UCI Rice Leaf Diseases primary documentation; decisions and recognition plan recorded in [DATASET_REVIEW.md](DATASET_REVIEW.md). PlantVillage's published classes exclude rice, so no generic classifier was represented as a rice model.
- Added three unmodified CC BY 4.0 rice reference photos with author credit, original paths and hashes. Crop concerns now includes search, reference selection, temporary local side-by-side photo preview, dimension guidance and links into visit recording/expert-review task drafting.
- References remain separate from farmer evidence. No automatic matching, disease prediction or accuracy score is produced. Browser preview is temporary; saving evidence still uses Record visit/History.
- Added offline caching for the lazy-loaded library, references and attribution manifest. Assets visually inspected as local images; browser layout/file interaction acceptance is pending.
- Validation: **48 tests, build and lint pass**, covering reference search, asset hashes/provenance and dimension messaging in addition to existing regressions. Main-bundle size warning remains.
- Model training/evaluation, broader rice classes, local field validation and agronomist review remain planned. The earlier requested map interaction verification was interrupted by the dataset request and is still open; no successful pan/zoom/boundary interaction is claimed.

### Original report documents — implemented, visual verification pending

- Soil/water reports now accept up to three original PDF, PNG, JPEG or WebP files, up to 3 MB each. Saved records show filenames, sizes and attachment times, with downloads. Content is not embedded as an active PDF viewer or processed as a diagnosis.
- Documents remain linked to the report's field/season and are included in existing backups and expert JSON exports. Older reports need no migration. Restores validate encoding, size, allowed MIME, basic content signature, timestamps and duplicate IDs. Signature checks do not establish laboratory authenticity or full document validity.
- Validation: **45 tests pass**, build and lint pass. Added file-reader validation, malformed/oversized/mismatched input rejection, backup preservation and IndexedDB reopen coverage. Browser file-picker/download and physical-phone acceptance remain pending.
- Storage limit: files are embedded in the workspace snapshot; independent blob storage remains pending. Larger backups and save transactions are expected. Modified same-ID reports still trigger the existing restore conflict protection, rather than silently overwriting another version.
- L2-06 remains **In progress** until independent review/provenance and browser acceptance. Next priorities: visual acceptance, Tamil localisation and performance work; production build now flags the main chunk above 500 KB (about 150 KB gzip).

### Repeated-visit comparison — implemented, visual verification pending

- L2-05 **In progress**: History now compares two observations at the same point, field and season. Includes leaf/soil/symptom differences, insect counts and any recorded plant-height/tiller values. It retains originals, distinguishes missing from zero and exports both records plus differences as JSON.
- Earlier/later selection uses observation time with recording-time ordering. Cross-field/season/point and reversed comparisons are rejected. Sample/entered provenance and notes remain visible. No diagnosis, treatment-response claim or measured spread is inferred.
- Photos can now be explicitly attached to a selected visit. Only exact visit-linked photos appear in comparison; older point-only photos are not assigned a date. Attachment time is labelled separately from capture time. Backup validation rejects broken or cross-context photo links. Sample switching protects linked photos as well as tasks.
- Validation: 42 tests, build and lint pass. Added comparisons, missing/zero handling, chronology, isolation, immutable ordering and visit-photo backup/link tests. UI/phone acceptance remains pending under the existing browser automation limitation.
- Remaining L2-05 scope: field-level affected-area measurements and physical-device photography/visual acceptance. Tamil localisation, report attachments and offline browser acceptance remain open.

### Offline app shell — implemented, browser acceptance pending

- L2-09 **Implemented — verification pending**: production builds generate a versioned service worker from the actual HTML, JS, CSS and bundled images/icons. After an initial successful download, the worker serves the shell without network access. Farmer records remain in IndexedDB.
- Added connection, preparing/ready/unavailable states, cache completeness checks and a retry control that repairs missing shell files. Readiness is separate from saved-record status. Cache eviction or cleared site data can remove availability.
- Worker caches only an explicit shell allowlist, excluding tiles, APIs, unrelated routes and writes. It never clears IndexedDB. Failed installation removes only the incomplete new cache; activation removes only old shell caches in its own scope.
- Updates wait for open tabs to close; no forced reload during forms. Development builds do not register the worker. Production requires HTTPS or localhost.
- Validation: **37 tests pass**, including offline requests, exclusions, install failure, scoped cleanup and missing-cache detection/repair. Build and lint pass. Worker tests use a simulated environment, not browser end-to-end testing.
- Remaining: real-browser initial download, closed-app offline reopening, visit/task/report persistence, multi-tab updates, failed downloads and mobile states. Earlier visual automation blocker remains unresolved. Tamil and report attachments remain pending.

### Soil and water report entry — next increment

- L2-06 **In progress**: implemented field/season-scoped soil and water report entry with sample/report dates, source, sample location/depth, reference, printed values/units, lab interpretation and farmer notes. Saved records are retained; corrections use a new report with a reference to the original.
- Added validation for impossible/reversed/future report dates, missing sources/units, invalid measurements, duplicate IDs and broken field/season references. pH accepts 0–14; no nutrient interpretation thresholds or automatic unit conversions are invented.
- Entered reports are explicitly unverified. They appear in report exports and backups, but cannot silently become verified laboratory evidence in the explanation engine. There is no independent verification workflow yet.
- Existing v4 workspaces default to an empty report collection. Backups merge reports by ID and reject conflicts. Sample laboratory evidence remains separate.
- Validation: 33 tests pass, including report validation, older workspace compatibility, backup round trips/conflicts and IndexedDB reopen. Build and lint pass. Visual acceptance remains pending under the browser automation limitation recorded below.
- Remaining L2-06 scope: original document attachments, independent review/provenance workflow and agronomist evaluation. Next product items: Tamil localisation and offline application shell; previous field/map/theme browser acceptance remains open.

- L2-01 and L2-04: **Implemented — verification pending**. Create/edit/select fields and rice seasons, growth stage controls, scoped tasks with due dates/status/results/notes and reopening history.
- Version 4 migration retains observations, visits, photos, diary entries and the old follow-up. Version 3 backups remain importable. Field/season boundaries apply to evidence, photos, notes, tasks and case exports. New fields receive no sample weather/lab data.
- Bundled Leaflet map supports pan/zoom, point selection, boundary corner entry, GeoJSON import/export and estimated area. Optional street tiles require internet; local geometry requires no API key. Coordinates, suggested points and estimated area are not surveyed measurements.
- Forest, Earth and Night themes persist with the workspace. Neutral Salem labels remain.
- Sample switching is blocked when tasks link to its evidence, preventing dangling references. Entered records and other fields remain intact.
- Validation: **29 tests pass; production build and lint pass**. New tests cover v3 migration, field/season isolation, invalid coordinates/dates/references, task audit history, polygon import, v4 backups and IndexedDB reopen.
- Browser acceptance is **blocked**: browser host unavailable, native Chrome input reported unavailable coordinate geometry and keyboard fallback did not change tabs. No visual verification is claimed for this increment.
- Next: inspect desktop/mobile themes and field/map/task flows; verify reload, online tiles and GPS on physical devices. Then farmer-entered soil/water reports, Tamil localisation and offline reopening. Full Level 2 readiness is not complete.

Earlier tables below retain the previous baseline; this dated section supersedes their field/task/map/schema statuses.

## How to maintain this tracker

- Update this file as implementation proceeds, in the same change as the feature or fix.
- Use **Not started**, **In progress**, **Implemented — verification pending**, **Verified**, or **Blocked**.
- Mark work Verified only when its completion criteria have been checked. Record the checks and any limits.
- Keep planned work separate from implemented behaviour. Do not imply that a demo or placeholder is a live integration.
- Record decisions, blockers and the next concrete step. Keep source links and roadmap criteria current when scope changes.
- Do not start roadmap features solely because they appear in this file; follow the user's current task scope.

## Existing baseline

| Capability | Current implementation | Validation / limits |
| --- | --- | --- |
| App experience | Eight distinct screens, responsive navigation and hash routes | Overview and scouting visually inspected in Chrome desktop and 400-pixel responsive preview; all screens/forms have not been exhaustively tested. |
| Evidence engine | Deterministic educational rules; field/date relevance; separate pest and disease explanations; multiple possible causes | Eight evidence tests passed. Rules are not agronomically validated diagnoses. |
| Scouting | Four sample points, capture/review/save flow, image attachments; append-only observations and visits with real date/time | Browser check saved two revisits at point 1, reloaded, and confirmed both revisits plus the three original sample records remained. The field/season itself remains illustrative. |
| Persistence | Version 3 IndexedDB snapshot, validated localStorage migration, queued saves, revision conflict detection and error recovery | Old localStorage key retained. Same-device only; no service worker, sync or cloud backup. Photos are still data URLs in the snapshot. |
| Farm diary | User-entered activities, dates, notes and optional cost | Not a full operational or economic analysis system. |
| Follow-up | One editable action/date/outcome with photo comparison | No task collection or automatic notifications. |
| Mapping | Interactive SVG diagram and optional ArcGIS map using sample geometry | Geometry is illustrative; remote ArcGIS was not fully verified. |
| Reports | JSON case export plus versioned backup export, preview and additive restore | Browser download/import/merge passed: the same 5-record backup restored without duplication. Invalid/conflicting backups are covered by automated tests. No expert collaboration. |

Current implementation checks: `npm run build`, `npm run lint` and `npm test` passed; 20 tests passed. Browser revisit, reload, historical ledger and duplicate-safe backup/restore checks passed on the isolated `127.0.0.1:5174` demo origin. The earlier computer-use block did not recur. Real-browser legacy migration, malformed-backup interaction and the full two-tab recovery flow remain unverified; repository tests cover those cases.

## Level 2 delivery tracker

| ID | Work item | Status | Evidence / next step |
| --- | --- | --- | --- |
| L2-00 | Record model, IndexedDB storage, migration and backup foundation | In progress | Implemented the versioned workspace, IndexedDB repository, safe migration, backup/restore and concurrent-tab protection. 12 workspace/repository tests plus 8 evidence tests pass. Farmer-owned field/season/task/report models and independent photo blob storage remain for the next increments. |
| L2-01 | Field and season onboarding | Not started | Replace the fixed demo field with create/edit/reopen workflows. |
| L2-02 | Permanent observation history and real dates | Verified | Automated coverage plus browser saves of two revisits, current observation time, successful database status, reload persistence, original sample history and latest-record evidence. Same-time display ordering uses recording time as a tested tie-breaker. Field/season remains a sample until L2-01. |
| L2-03 | Fast problem reporting and targeted questions | In progress | Added plain-language form choices, inline soil/count help and illustrated photo guidance. Severity/location capture and adaptive follow-up questions remain. |
| L2-04 | Multiple tasks and linked outcomes | Not started | Replace the single follow-up object with task records and states. |
| L2-05 | Dated field change comparison | Not started | Link revisits to sampling points and compare measured/entered values. |
| L2-06 | Farmer-entered soil and water reports | Not started | Define units, test/sample dates, locations, attachments and interpretation fields. |
| L2-07 | Tamil-first, accessible farmer experience | In progress | Plain English, readable farmer visual layer, touch controls, accessible guide illustrations and searchable Help added. Tamil translation/review and phone-camera hardware verification remain. |
| L2-08 | Home / Fields / Record / Tasks / History navigation | In progress | Five primary actions now read Home / My field / Record visit / Next steps / History. Secondary field tools remain accessible; mobile uses a bottom bar and More menu. Actual farmer-owned field and multi-task records are still pending. |
| L2-09 | Offline application and recovery | Not started | Service worker, offline reopen, storage states and export/import backup. |
| L2-10 | Level 2 acceptance verification | Not started | Complete an initial visit and revisit, reload offline, confirm historical evidence and tasks survive, and test phone/keyboard flows. |

## Later stages

| ID | Work item | Status |
| --- | --- | --- |
| L3-01 | Accounts, permissions, backup and synchronisation | Not started |
| L3-02 | Sourced weather and reviewed crop-stage guidance | Not started |
| L3-03 | Attributed expert case review | Not started |
| L4-01 | Agronomist-reviewed evaluation and farmer usability trials | Not started |
| L4-02 | Evaluated image assistance, if justified | Not started |
| L4-03 | Satellite monitoring for a defined decision, if justified | Not started |

## Decisions

- 20 November 2026: Saved the comparative assessment and maturity roadmap at the user's request. Track progress in the repository as work proceeds.
- Prioritise a useful Level 2 field companion over more decorative UI changes or unvalidated AI features.
- Retain paddy/Salem as the initial agronomy scope. Broader field record support does not imply validated rules for other crops or regions.
- The initial documentation task changed no application behaviour.
- 20 November 2026: User authorised development. Started Milestone 1: evidence preservation, IndexedDB migration and backup/restore.

## Next concrete step

Finish the remaining migration/error/two-tab browser recovery checks, then continue L2-00/L2-01: farmer-owned fields and seasons with storage migration. Build multiple linked tasks (L2-04) on those records. Do not call Level 2 complete until the full acceptance journey passes.

## Change log

| Date | Change | Validation |
| --- | --- | --- |
| 20 November 2026 | Created product roadmap and progress baseline; linked them from the README; added contributor guidance to keep progress current. | Documentation links and baseline checked against current source and previous validation output. No application behaviour changed. |
| 20 November 2026 | Started Level 2 development: versioned IndexedDB workspace, safe legacy migration, append-only visits, actual observation dates, latest-evidence/season selection, versioned backup/restore, and cross-tab conflict protection. | 19 tests passed; build and lint passed. Browser smoke verification pending after computer-use URL policy block. |

| 20 November 2026 | Rechecked in Chrome: two revisits persisted after reload; original history retained; exported backup imported and merged without duplication. Fixed development hot-update revision handling, initial read-only opening, and same-time history ordering. | Browser workflow passed before the cleanup changes; final build/lint and all 20 tests passed. Remaining recovery checks are listed below. |

## Milestone 1 verification evidence

- Added 12 repository/domain tests to the existing 8 evidence tests.
- Verified legacy migration preserves collections, follow-up and context; malformed legacy data cannot be silently replaced by sample data.
- Verified two visits at one point survive database reload with distinct IDs and observed/recorded times.
- Verified latest evidence and season isolation without deleting history.
- Verified backup round trip, duplicate handling, conflict rejection and malformed record rejection.
- Verified aborted transactions retain the last snapshot, queued writes keep the newest snapshot, and a stale browser-tab repository cannot overwrite a newer save.
- Browser-verified: initial database load, successful-save indicator, current observation time, two revisit saves, preserved original and new history after reload, backup download, restore preview and duplicate-safe merge.
- Remaining manual checks: malformed backup rejection, legacy migration with real browser storage, save-error retry and genuine concurrent-tab recovery.
- Fixed two recheck findings: retain repository revision during development hot updates and skip writes when initially opening an unchanged workspace; use recordedAt to order visits with the same observedAt. The ordering has a new automated regression test; the development-only hot-update path has not been separately replayed after the fix.
- This milestone does not implement farmer field creation, multiple tasks, independent photo blob storage, offline app shell or backend sync.


## Farmer experience increment — 20 November 2026

- User requested another UI review, modern styling, plain-language content, images and help. This explicit request sets the current UI scope while the larger field/task milestones remain pending.
- Implemented a forest-green navigation shell, larger readable text, calmer cards, clear primary actions and a phone bottom navigation bar.
- Added a bundled AI-generated paddy banner; it is visibly labelled as an illustration and not used as farmer evidence. Source/prompt documented in [UI_ASSETS.md](UI_ASSETS.md).
- Added whole-plant and close-up framing diagrams, a photo-guide toggle in Record visit, inline explanations of soil/count inputs and a searchable Help dialog.
- Reworded everyday navigation, leaf/soil choices, possible-cause cards, next-check messages and backup labels. Kept underlying routes, rule evidence and storage schema intact.
- Chrome verification: desktop Home, 400-pixel Home, mobile Record visit navigation and guide toggle; Help search for “backup” returned relevant answers; Escape closed Help. All 20 tests, production build and lint passed after final cleanups.
- Remaining limits: More-menu behaviour across additional devices, rear-camera capture on physical phones, Tamil localisation and the rest of Level 2 still need work.


## Neutral names and Salem location — 20 November 2026

- User requested neutral farm/field names and Salem, Tamil Nadu as the location.
- Updated app labels, avatars, reports and sample metadata to **Salem Farm** and **Paddy Field 01**.
- Moved illustrative map centre, boundary, affected patch and scouting points to sample coordinates near Salem. These remain illustrative, not surveyed farm locations.
- Updated project guides and the roadmap. Kept the original generated-image prompt verbatim as historical asset provenance, with a note that the current app location is Salem.
- Record IDs, existing observations, visit history and backups retain their relationships; no saved farmer evidence was deleted or rewritten.
- Validation: build and lint passed; all 20 tests passed. Source/public/README search found no old farm name, old location or old map coordinates in the active app.


## Active increment — field controls, maps, tasks and themes

- User authorised proceeding with real controls, modern themes, maps and the next roadmap items.
- Started L2-01/L2-04 and the associated L2-00 version 4 migration. Plan and verification checklist added to DEVELOPMENT_PLAN.md.
- No completed status is claimed until implementation and checks finish.


### Location controls check-in — 21 November 2026

- User authorised committing and pushing the map Locate me, place search and click-to-set centre increment to main. Includes source, tests, help and roadmap/progress updates.
- Validation: 62 tests, production build and lint pass; live Salem place-search endpoint smoke passed previously. Browser/GPS acceptance and bundle-size warning remain pending.


### Agrii reference review — 21 November 2026

- Reviewed public Tools/Resources, seed, two harvest-loss calculator pages and Contour description; saved sources, comparison and AGR-01–08 acceptance criteria in AGRII_REVIEW.md and linked master backlog.
- Prioritised seed quantity, spacing and harvest/sales around existing field records. Weather/satellite and crop-specific loss tools remain later stages. Break Crop Calculator correctly identified as harvest-loss tooling, not rotation planning.
- Documentation-only increment; no new integrations, calculator execution or signed-in product verification claimed. No app tests rerun for prose changes. Changes local/unpushed.

### Local sources reviewed — 21 November 2026

- Inventoried all eight PDFs (359 PDF pages) in docs/sources, extracted text, reviewed contents/relevant sections and visually inspected three representative pages. Review scope is not a cover-to-cover agronomic audit.
- Saved SOURCE_DOCUMENT_REVIEW.md with per-document page anchors, current-versus-planned distinctions, SRC-01–07 acceptance requirements and delivery order. Linked master plan. No app or supplied PDF changes.
- Identified UK/older commercial material and crop-specific models; no automatic transfer of recommendations, images or claimed results into local farmer guidance. Documentation only, so app tests were not rerun. Local/unpushed.
