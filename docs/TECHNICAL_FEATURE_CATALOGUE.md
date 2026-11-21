# Technical capability catalogue

Preserved from the earlier master plan on 21 November 2026. All R01–R20 subfeatures remain in scope as candidates, not installed integrations. Farmer outcomes and current priorities are controlled by [master plan](FARMER_FEATURE_MASTER_PLAN.md) and [tracker](FEATURE_TRACKER.md). Old stage letters map to the new releases: A→1, B→2, C→3, D→4, E→5, F→6. Verify upstream claims, versions, maintenance and licences before implementation.

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

