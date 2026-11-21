# Open-source agriculture review

Reviewed: 21 November 2026. User supplied [awesome-agriculture](https://github.com/brycejohnston/awesome-agriculture) after requesting repository-inspired improvements. This is a discovery directory, not an installable feature bundle. Reviewed primary repository descriptions; did not test authenticated product deployments or copy third-party implementation code.

## Shortlist and FieldSense decisions

| Project | Published scope / declared repository licence | Decision for FieldSense |
| --- | --- | --- |
| [farmOS](https://github.com/farmOS/farmOS) | Farm management, planning and record keeping; Drupal/PHP; GPL-2.0. | Learn from durable records and traceable operations. Keep existing local record model; do not claim farmOS API compatibility. A future adapter needs explicit mapping, authentication and sync-conflict tests. |
| [LiteFarm](https://github.com/LiteFarmOrg/LiteFarm) | Farmer-centred platform for social, environmental and economic farm outputs; web/API services; GPL-3.0. | Prioritise understandable summaries of entered work and costs. Implemented an original, small activity-cost summary over existing records; no LiteFarm code, calculators or economic claims copied. |
| [Tania](https://github.com/usetania/tania-core) | Farm management for hobbyists and smallholders; Apache-2.0. | Reference for keeping small-farm workflows manageable. Candidate future work: input stock movements, harvest logs and season summaries. No module imported. |
| [AgML](https://github.com/Project-AgML/AgML) | Agricultural ML data/annotation access and pipelines; Apache-2.0 for repository code. | Candidate tooling for a reproducible rice evaluation pipeline. Dataset and model rights remain separate from framework licence. No dependency, trained model or accuracy claim added. See DATASET_REVIEW.md. |

The directory also lists weather, GIS, irrigation, sensors and satellite tooling. Those sections were surveyed for direction, not individually validated as integrations. Do not infer that listed code works for Salem, supports rice or has compatible data/service terms.

## Implemented increment

History now has a season activity/cost ledger: selected field/season isolation, inclusive date and activity filters, category totals, explicit missing/excluded cost counts, original record details and filtered CSV export. Currency is INR, as in the existing activity form. Integer paise avoids floating-point addition errors. Zero costs differ from blank costs. Unsupported legacy costs remain visible and export unchanged; they are excluded with a notice. Safe-integer overflow stops the total instead of displaying an inaccurate number.

This uses already-saved activities; there is no schema migration or new accounting store. CSV is a portable view, not a restore backup or farmOS interchange format. CSV quoting preserves multiline notes and neutralises text that spreadsheet programs might interpret as a formula. The app computes entered costs only, not profit, yield, outstanding payments, market prices or a complete season budget.

Validation: 52 tests, build and lint pass. New tests cover paise arithmetic, zero/missing/unsupported values, context isolation, inclusive filters, chronology, overflow and CSV escaping/formula handling. Browser/mobile acceptance remains pending. Existing main-chunk performance warning remains.

## Proposed priorities, not implemented integrations

1. Finish map, file, offline-reopen and new summary UI acceptance before field readiness claims.
2. Tamil localisation with fluent farmer review and measured accessibility checks.
3. Input inventory with units, purchases and usage linked to activities; no stock inferred from free text.
4. Harvest weight and sales records with clear dates, units and scope, followed by measured season economics.
5. Dated weather adapter with location/provenance/staleness and connectivity status; keep weather context separate from observed field water conditions.
6. Rice-specific ML evaluation and an uncertain result path; do not ship a generic model as a field diagnosis.
7. Explicit, tested interoperability adapters. Satellite indicators and irrigation automation require separate data/hardware validation.

Repository licences above are published metadata observed on the review date, not a blanket licence for all linked datasets or assets. This increment is newly written FieldSense code and has no new runtime dependency.
