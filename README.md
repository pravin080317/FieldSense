# FieldSense

Current direction: [farmer-first product plan](docs/FARMER_FEATURE_MASTER_PLAN.md) · [feature tracker](docs/FEATURE_TRACKER.md). The tracker separates implementation from device acceptance and farmer validation.

A local-first React + TypeScript farm-record prototype with multiple growing areas, crop plantings, visits and tasks. The starter field is illustrative and located near Salem, Tamil Nadu. Original requirements are preserved in [details.txt](docs/requirements/details.txt) and [prompts.txt](docs/requirements/prompts.txt).

## Latest increment — 20 November 2026

**Find and position a field:** open My field → Add field/Edit field, search a town/village, select the correct result, then choose **Set field centre** and click the exact location. Use **Mark corners** for the boundary, then save. Centre movement never moves existing corners. Coordinate inputs work as a keyboard/offline alternative. Search uses [Open-Meteo/GeoNames](https://open-meteo.com/en/docs/geocoding-api), runs only on Search and needs internet; its public endpoint is used for this non-commercial demo. Commercial use needs an appropriate service plan/terms review. Checks: 62 tests, build/lint and a live Salem endpoint response pass; browser interaction acceptance is pending. Location and place-search controls are included in this repository.

**Map location:** use **Locate me** and allow browser location permission to show a temporary device marker and accuracy circle. The initial Salem sample field is not your detected farm. Use My field to create/save your actual field and boundary. HTTPS or localhost and device location services are required; an HTTP LAN preview may display tiles while blocking geolocation. Desktop location may be approximate. Reference: [browser geolocation requirements](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition). Checks: 59 tests, build and lint pass; real GPS/browser acceptance remains pending.

**21 November: dated field imagery in My field.** Upload a north-up PNG/JPEG/WebP map export (3 MB, up to three per field/season), enter its date, source and WGS84 bounds, then switch image layers or adjust opacity over the interactive map. Originals stay in backups/expert exports. Placement is user-entered, not surveyed; no photogrammetry reconstruction, GeoTIFF processing, NDVI or live imagery service is included. [Source review and limits](docs/IMAGERY_REVIEW.md). Checks: 55 tests, build and lint pass; browser alignment/map acceptance remains pending.

**21 November: season activity and recorded costs in History.** Filter saved work by date and activity, see INR category totals and missing-cost coverage, inspect original records and export the filtered view as CSV. No inferred expenses or profit calculation; blank costs are not zero. Existing records/schema are unchanged. [Open-source agriculture review and next priorities](docs/OPEN_SOURCE_REVIEW.md). Validation: 52 tests, build and lint pass; visual/mobile acceptance remains pending.

**21 November: rice reference library in Crop concerns.** Search three attributed research categories, select a reference, view your own photo beside it locally and continue to Record visit or plan an expert review. The reference images are included in the production offline cache. This is manual comparison, not automatic disease recognition; PlantVillage's published classes do not include rice. [Dataset review and model plan](docs/DATASET_REVIEW.md). Validation: 48 tests, build and lint pass; browser/mobile acceptance remains pending.

**Original report documents:** in Soil & rain, save a report and attach up to three PDF, PNG, JPEG or WebP files (3 MB each). Files retain their names and attachment timestamps, download for review and travel with workspace backups/expert JSON exports. Attaching files does not verify laboratory results. They are embedded in the local snapshot; independent blob storage remains pending. Current checks: 45 tests, build and lint pass. Browser/phone file-picker and download acceptance remain pending. The build reports a main-bundle size warning (about 501 KB, 150 KB gzip).

**Visit comparison is available in History.** Select a check point and two visits from the selected field/season to compare recorded leaves, soil, symptoms and counts. Missing values stay missing. Attach photos explicitly to each visit and download the two original records plus their differences. Point-only legacy photos are not guessed into a visit. Differences do not imply a diagnosis or successful treatment. Checks: 42 tests, build and lint pass; visual/phone acceptance remains pending.

**Production offline shell added.** Run `npm run build` then `npm run preview` (or serve `dist/` over HTTPS). Connect once and wait for **Offline app ready**. The same URL can then use its cached shell and local IndexedDB records without a connection. Development mode does not register the worker. Street tiles need internet. Clearing site data removes caches and records; keep backups.

Updates wait until old FieldSense tabs close, without forcing a field form to reload. A status panel shows connection/offline readiness and offers cache repair retry. Current checks: 37 tests, build and lint pass. Real-browser offline reopening/update acceptance remains pending. Lifecycle reference: [MDN service worker guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers). Earlier baseline sections below describe the pre-offline prototype.

**Soil/water report entry is now available in Soil & rain.** Save sample/report dates, laboratory/source, location/depth, printed measurement values/units, report reference and interpretation. Records persist per field/season and are included in backups and expert JSON exports. Typed reports remain unverified and do not count as verified laboratory evidence. Existing v4 workspaces open with no entered reports. Document attachments and independent verification remain pending. Current checks: 33 tests, build and lint pass; new UI acceptance remains pending.

The sections below include the original demo baseline. This increment adds:

- Create/edit/select fields and rice seasons, with saved growth stages.
- Leaflet geographic maps, optional OpenStreetMap tiles, editable boundary corners, coordinate entry and GeoJSON import/export. Suggested points and area estimates are not GPS or survey measurements.
- Multiple tasks per field/season with due dates, linked observations, status, completion notes/outcomes and reopen history.
- Forest, Earth and Night themes saved on this device.
- Version 4 workspaces/backups; version 3 imports and the old follow-up migrate without discarding evidence. Fields, photos, notes, tasks and reports follow the selected season. New fields receive no sample weather or lab evidence.

Validation: 29 tests, build and lint pass. Browser acceptance of these new controls remains pending: browser host unavailable and native Chrome input returned unavailable window geometry. Check mobile themes, boundary controls, task completion/reload, tiles and device GPS manually. No background task notifications, live weather, offline app shell, Tamil localisation or farmer-entered lab reports yet. Independent photo blobs also remain pending.

Map geometry works without external tiles or an API key. Street tiles require internet and show OpenStreetMap attribution. Sample switching is blocked when sample evidence is linked to a saved task, preserving those references.

## Product direction and progress

- [Crop coverage, shared tools and future farm types](docs/CROPS_AND_FARM_TYPES.md): seasonal record choices now include rice, maize, millet, groundnut, pulses, cotton, tomato and chilli. These are record-keeping choices, not validated disease-model support. Rice reference images/rules are withheld for other crops. Orchard, mixed-crop and livestock models remain planned.

- [Complete farmer feature master plan: all 20 reference projects, delivery stages and prediction-quality gates](docs/FARMER_FEATURE_MASTER_PLAN.md)
- [Original user-supplied repository breakdown](docs/references/USER_REPOSITORY_BREAKDOWN.txt)

- [Product assessment, competitor references and roadmap](docs/PRODUCT_ROADMAP.md)
- [Implementation progress, validation and next steps](docs/PROGRESS.md)
- [Active Level 2 development plan](docs/DEVELOPMENT_PLAN.md)

The current maturity baseline is Level 1, with the Level 2 evidence-preservation workflow now implemented and browser-checked; recovery-path acceptance remains pending. Update the progress tracker with each meaningful implementation increment; planned features are not completed capabilities.

## Run

Use Node.js 24 LTS and npm:

```sh
npm install
npm run dev
npm test
npm run lint
npm run build
```

`dist/` is the static production output. No backend or credentials are required for the offline diagram and evidence workflow.

## Implemented

- Responsive farmer navigation and detailed agronomist review.
- Three editable historical cases, four sampling points, symptom/soil/pest entry, notes, photo previews and scenario reset.
- Immediate deterministic evidence recomputation with dated supporting facts, weakening evidence, missing information and next checks.
- Different-field, stale, future and unverified soil report exclusion; laboratory interpretation rather than invented nutrient thresholds.
- Separate disease and pest explanations, with simultaneous possible causes.
- Local persistent timeline, action and revisit entry, before/after photo attachments, outcome selection and JSON case export including images.
- Optional ArcGIS map and a permanently available offline diagram.

## Architecture and rules

`src/types/domain.ts` contains the domain types. `src/data/sampleData.ts` contains illustrative historical cases. `src/services/EvidenceEngine.ts` contains the reviewable educational rules. `src/App.tsx` implements the workflow and `src/App.css` provides responsive styling. `public/geojson/field.json` provides map geometry.

Sample cases initially evaluate evidence at 19 October 2024. New visits accept an actual observation date/time, defaulting to the current device time. The assessment date advances when a later visit is saved. New records retain both observation and recording timestamps. Every save appends a uniquely identified observation and visit; earlier evidence remains in the diary and ledger. The engine evaluates only the latest relevant observation per point within the selected season. Observations use a 14-day review window, soil reports 90 days, and water/weather 7 days. These are demonstration review policies, not validated agronomic shelf lives. All windows exclude future dates. Crop stage and harvest timing must be checked by a specialist.

Yellowing plus field-observed wet soil supports investigating root stress. Rain alone cannot establish field waterlogging. Lower-leaf yellowing plus a verified, relevant laboratory interpretation supports investigating nutrition. Insects do not establish disease. Status means supported, unresolved or insufficient evidence; none confirms a diagnosis or authorizes treatment.

## ArcGIS

The optional map is isolated in `public/map.html`, loads SDK 5.2 from Esri's CDN, and renders local GeoJSON graphics. Selecting a point selects its observation in the app. The app retains a CSS field diagram when the internet, SDK or services are unavailable. The geometry is illustrative, not surveyed or satellite measured; it must not be used to calculate the stated field area.

For an online basemap, copy `.env.example` to `.env.local` and set `VITE_ARCGIS_API_KEY`. Without a key, local graphics render without a basemap. Enable only the required basemap service privileges and restrict allowed referrers. Browser keys are public, including in network requests; never use a secret administrative token. No farmer records are uploaded to a hosted feature layer.

Verified integration references: [Esri CDN integration](https://developers.arcgis.com/javascript/latest/get-started/), [authentication](https://developers.arcgis.com/javascript/latest/authentication/access-tokens/), [licensing](https://developers.arcgis.com/javascript/latest/licensing/index.html). Account/service access and usage terms apply to basemaps.

## Five-minute panel demonstration

1. Open case A. Explain the historical sample indicator and dated low-patch observations. Read the next root/drainage check.
2. Select points 1 and 3. Change waterlogged soil to moist at both. Watch the waterlogging explanation change. Rainfall alone cannot restore a supported status.
3. Open B. Show the laboratory interpretation. Select a different-field, old or absent report and show the nutrient explanation lose support.
4. Open C. Review recorded insect counts. Edit counts at individual points and compare pest and disease explanations. Open the detailed evidence review.
5. Attach whole-plant and close-up images. Record an action, revisit date and outcome in Follow-up, add an after photo, and export the case. Reset the scenario.

## Validation and limits

Twenty automated tests cover evidence rules, migration, permanent history, database reload, real dates, season isolation, backup round trips, additive restore, invalid input rejection, transaction rollback, queued saves conflicting writes from another tab and same-time visit ordering. They use fake-indexeddb for deterministic repository tests. Production build and lint pass. Browser interaction, device keyboard navigation and the remote ArcGIS service require manual verification; automated checks do not establish visual correctness.

Data and images now use a versioned IndexedDB workspace. Existing `fieldsense-workspace-v2` localStorage records are migrated only after validation; the original key is left untouched as a recovery copy. Invalid legacy data stops startup instead of being replaced by sample data. A failed save leaves the last committed database snapshot intact. Revision checks reject stale writes from other tabs. The header shows pending, successful and failed saves; navigation away from unsaved changes is guarded.

Images remain embedded data URLs inside the IndexedDB snapshot, capped at 3 MB each. Independent blob storage and multi-field database records are still future work. Clearing browser site data removes local records.

In **Case report → Device backup & restore**, download a version 3 restorable workspace backup or choose a backup to validate and preview. Restore adds missing records, skips identical duplicate IDs, and rejects conflicting IDs or a different sample case. Current report/weather settings and an existing follow-up take precedence. The original case-report JSON remains available for handoff but is not the versioned restore format.

There is no service worker yet: IndexedDB persistence does not guarantee that a closed app can reopen without network access. Follow-up dates are plans, not background notifications. Accounts, cross-device sync, field onboarding, multiple tasks, farmer-entered lab reports, image classification, live weather, measured spread analysis and agronomic validation remain unimplemented. Reset/switch demo controls deliberately replace the active sample case; export a restorable backup first.


## Modern app experience

Home now explains what a farmer gets: dated visit comparisons, planned work/results, entered-cost summaries and soil/water papers organised by field. Each benefit links to its working tool. A labelled example shows how a field note leads to a job and a return comparison. The illustration is smaller; returning farmers can expand the benefit explanation. Current checks: 65 tests/build/lint pass; final visual/mobile acceptance remains pending. Local changes are unpushed.

Home now explains the app as **a simple diary for your rice field**. New users can add a real field or explicitly try a sample, followed by three short steps. Returning farmers see their field, actual next job and latest saved visit. Add my field opens setup directly; maps/weather/details stay on their own screens. Two-reviewer design decisions and remaining checks: [HOME_JOURNEY_REVIEW.md](docs/HOME_JOURNEY_REVIEW.md). Automated baseline: 63 tests/build/lint pass. Browser/mobile acceptance of the redesign is pending; changes are not pushed yet.

Small **Help** icons beside the main inputs explain what to enter, with everyday examples. Tap/click the icon or focus it with the keyboard and press Enter/Space. Explanations open beside the input; they do not change what you entered. Field setup, reports, visits, tasks and costs use simpler labels, and the map has a How do I use this map? guide. Chrome verified one expanded help flow; full mobile/accessibility acceptance remains pending.

Eight independent screens replace the earlier single-page layout: Overview, My field, Field scouting, Crop health, Soil & weather, Farm diary, Action plan and Case report. Hash routes support browser back/forward and direct links. The overview displays values derived from the current case, not invented crop-health scores or sensor readings.

The overview uses a custom SVG field illustration, consistent icons, a green/cream visual system and responsive cards. Phone layouts switch to horizontal navigation and stacked content. Google Fonts are optional; local sans-serif fallbacks work without the network. The diagrams are bundled code assets.

Scouting follows three steps: choose point, record observations, review/save. Draft observations enter the shared engine after Save; soil relevance and weather edits recalculate immediately. Farm diary entries accept activity dates, notes and optional rupee costs; dated scouting history is retained rather than overwritten. The action plan saves one editable follow-up per case, with outcome and before/after photo evidence. The report exports all current case records as JSON. Demo controls are separated from the normal farm workflow; switching cases explicitly warns that the current local case will be replaced.

Manual visual verification: Chrome desktop overview and scouting screens, plus a 400-pixel responsive overview/scouting preview. Exhaustive end-to-end testing of all forms and remote ArcGIS is not included.


## Milestone 1 acceptance smoke test (core checks passed; recovery checks pending)

1. Open the existing origin to migrate a legacy workspace; confirm its photos, diary and follow-up remain. Never clear site data to test migration on a real workspace.
2. In a separate test origin, save two observations at the same sampling point with different times. Verify both appear in the diary/ledger and the latest drives investigation.
3. Wait for **Saved in device database**, reload and verify both visits remain.
4. Download a restorable backup, import it, review the preview and merge. Record counts must not double.
5. Try a malformed or conflicting backup. Current records must remain intact.
6. Open two tabs of the test workspace, save in one, then save in the stale tab. It must report a conflict and offer a backup, rather than overwrite the first tab.

The initial browser attempt was blocked by the computer-use URL check. A subsequent attempt succeeded on the isolated `127.0.0.1:5174` demo origin: two new point-1 visits were saved, all 5 records survived reload, the original sample history remained, and downloading/importing/merging the backup kept the count at 5. Real-browser legacy migration, malformed-backup interaction and genuine two-tab recovery remain manual follow-ups; automated tests cover them.


## Farmer-friendly interface and help

Home, My field, Record visit, Next steps and History are the primary farmer actions. Crop concerns, Soil & rain and Expert report remain secondary tools. The phone layout uses a five-action bottom bar with More for the additional tools. Existing hash routes are preserved.

Help is available from the sidebar, header and phone help button. It includes searchable questions, accessible whole-plant/close-up framing diagrams and links to the recording/follow-up flows. Record visit includes a photo-guide toggle and inline explanations for soil conditions and insect counting. Form wording changes preserve the existing stored values and evidence rules.

The Home paddy image is a bundled AI-generated illustration, explicitly labelled and separate from user photos. Its saved path, exact prompt, tool mode and verification are documented in [UI_ASSETS.md](docs/UI_ASSETS.md).

Chrome desktop and 400-pixel responsive checks covered Home, Record visit, guide expansion, help search and Escape dismissal. Phone hardware camera capture and broader device testing remain pending. This interface increment does not add live data, diagnosis, Tamil translation or new field/task management capabilities.

### Whole-farm dashboard

Open Dashboard from navigation or Home to see growing-area cards, saved photos, crop filters, visit activity and job progress. Twelve crop choices include wheat, flowers and coconut; rice and paddy share one choice. Ongoing coconut/garden plantings can have unknown planting dates. Status describes saved records, not predicted crop health. Desktop/mobile acceptance remains pending.
