# Crop-aware farm companion

21 November 2026. User challenged rice-only positioning and requested consideration of other farming areas.

## Product direction

FieldSense should organise a farmer's work, rather than assume every farm is a rice plot. Keep two concepts separate:

- **Place:** field, garden plot, orchard block or other growing area, with a saved name/location/boundary.
- **What grows there:** a crop season, planting batch, perennial planting or mixed planting. Crop identity belongs to that record, not permanently to the land.

Shared tools include maps, visits/photos, tasks, soil/water papers, activities/costs, history and backup. Crop-specific questions, guides, measurements, rules and future models must declare their supported crops and cannot be transferred merely by changing the UI label.

## Implemented first expansion

- Home now describes a farm diary, rather than a rice-only companion. The existing image is still honestly labelled a rice illustration.
- New crop seasons offer rice, maize, millet, groundnut, pulses, cotton, tomato and chilli. Crop variety is recorded separately. New field names are neutral; old sample names/IDs remain unchanged.
- Saved seasons, case exports, backup parsing and displayed crop names retain the selected crop. Existing rice records are compatible without destructive migration.
- Shared visits/tasks/photos/reports/costs remain scoped to field/season. No new disease models or treatment guides were added.
- Rice image references render only for rice. The evidence engine receives an explicit crop ID and abstains for other crops; it requests expert review instead of applying rice rules.
- Rice explanations remain educational, unvalidated possibilities, not confirmed diagnoses. An enabled crop in a record form is not an accuracy or agronomic-support claim.

## Planned area/planting types

| Type | Required model/workflow before claiming support |
| --- | --- |
| Seasonal field crops | Crop/variety/planting dates; observed stages; appropriate measurement questions and locally reviewed guides. Shared record-keeping is available for the eight listed crops; tailored guidance beyond rice examples remains pending. |
| Vegetables / staggered beds | Multiple planting batches per area, repeated harvests, bed identifiers and batch-aware inputs/tasks. Current tomato/chilli season records are basic single-crop records, not a complete market-garden system. |
| Orchards / perennial crops | Tree/planting year and ongoing crop cycles; harvest date optional, repeat yields and tree/block-level observations. Do not force perennial plants into the present mandatory seasonal harvest-date form. |
| Mixed/intercropped areas | Multiple crops per planting/area, crop-specific observations and shared-input allocation without duplicated costs. Not implemented by selecting a single crop today. |
| Nurseries / protected growing | Trays/batches, transplant movements, structures and appropriate environmental records. Requires dedicated validation. |
| Livestock / fisheries | Animal/group or pond records, health/veterinary workflow, feed/water and permissions. A separate product module, not an extension of leaf observations. |

## Next work and acceptance

1. Verify crop selection, new-season save/reopen and backup with a real browser; verify that non-rice screens never show rice explanations/images as applicable advice.
2. Have farmers identify priority crops/area types; do not infer regional suitability or recommendations from these illustrative choices.
3. Extend planting models for perennial/mixed/multiple-batch cases before showing unsupported forms.
4. Add locally reviewed crop guides/questions and future evaluated models one crop at a time. Record source, region, stage, version, evidence gaps and supported outputs. Keep the master plan's prediction-quality gates.
5. Broaden crop illustrations/icons with appropriate rights; do not present the current rice illustration as an image of another crop.

Validation: 65 tests, build and lint pass. New tests cover crop identity through backups, legacy rice compatibility, unsupported identifiers and non-rice rule abstention. Existing Home state regression still passes. Browser/mobile crop-flow acceptance remains pending. This increment is local and unpushed.

## Dashboard expansion — 21 November 2026

Added wheat, flowers, coconut and garden plants. Coconut/garden planting dates may be unknown and harvest dates are optional. This is a shared-record foundation, not a complete orchard or mixed-crop management model. Whole-farm Dashboard shows saved photos, visits and work by area; it does not infer yield or health.
