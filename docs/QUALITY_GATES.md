# Release and prediction quality gates

Preserved on 21 November 2026; required by the rewritten master plan. No completed gate is implied.

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

