# Agrii tools review — 21 November 2026

Reviewed the public pages below, not a signed-in Contour product or calculator execution. These are inspiration for original FieldSense work; no code, images or agronomic defaults were copied. Proposed additions below are not implemented.

## Observed sources

- [Tools and Resources](https://www.agrii.co.uk/our-services/tools-resources/): calculators alongside a document library, audio content and specialist access.
- [Seed calculator](https://www.agrii.co.uk/calculators/seed-rate-calculator/): seed planning and plant-population inputs with visible units, help and result panels.
- [Combine losses](https://www.agrii.co.uk/calculators/combine-losses-calculator/) and [break-crop losses](https://www.agrii.co.uk/calculators/break-crop-calculator/): measured grain-loss workflows. The latter is a harvest-loss calculator, not a crop-rotation planner.
- [Contour](https://www.agrii.co.uk/our-services/tools-resources/contour/): describes weather, satellite vegetation/growth monitoring, fertiliser models and variable-rate work maps. Marketing descriptions do not establish performance or API availability.

## FieldSense design decisions and backlog

| ID | Farmer-facing tool | Priority and acceptance |
| --- | --- | --- |
| AGR-01 | How much seed do I need? | Next practical tools increment after dashboard acceptance. Select saved area, acre/hectare unit and a farmer-entered seed amount per unit area. Show total kg, inputs and arithmetic; optional bag count needs explicit bag size. Store a dated estimate separately from actual purchases/use. No universal recommended rate. Test conversions, zero/missing/invalid inputs and rounding. Advanced seed weight/germination model requires independently sourced formula and crop review. |
| AGR-02 | How many plants will fit? | Next, for trees/flowers/garden beds. Area and two spacing values with explicit units. Label theoretical estimate, excluding paths, irregular boundaries and mortality; do not claim measured tree counts. Review with farmers before default spacing suggestions. |
| AGR-03 | What did I harvest and earn? | Extend existing costs with dated harvest/sales, quantities/units, prices and explicit missing-cost coverage. Dashboard charts separate actual sales from forecasts. Seasonal grain kg, flower bunches and coconut counts must not be added into one meaningless total. |
| AGR-04 | Guides for this crop | Searchable plain-language resources by crop and task, with diagrams, source, region, reviewed date and optional locally reviewed Tamil/audio. Keep guides separate from farmer evidence. Existing rice reference photos are not a general crop guide. |
| AGR-05 | Prepare a question for an expert | Reuse case export, adding farmer-selected context and questions. No automatic sending or false claim that advice was received; directory contacts need verification. |
| AGR-06 | Weather near my field | Later connected-evidence stage: provider, forecast place/grid, issued time and stale/offline states. Forecast rain is not measured soil moisture. No automatic spray-safe declaration. |
| AGR-07 | Check harvest losses | Later grain/mechanised-harvest tool with reviewed sampling instructions and independently verified calculations. Hide for unrelated crops rather than force the same form on flowers/coconut. |
| AGR-08 | Compare field growth on a map | Later spatial stage: licensed satellite input, actual acquisition dates, cloud masks, geometry checks and time comparisons. Green colour is not a diagnosis; imported imagery remains manual until a real pipeline exists. |

## Interface placement

Home answers what the app helps with and the next action. Dashboard shows all growing areas and recorded status. A secondary Tools area presents short questions and remembers the chosen field/crop. Every tool follows Choose area → Enter values with examples → Review result → Save estimate or create a job. Crop-specific tools only appear where applicable. Local units and unknown inputs must remain visible.

Do not reproduce Agrii's UK crop assumptions, product recommendations, branding or claimed outcomes as advice for Salem. This review prioritises seed/spacing arithmetic and harvest records before prediction-heavy additions. Full perennial harvest and simultaneous mixed planting remain separate modelling work.
