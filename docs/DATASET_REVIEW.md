# Plant image datasets and FieldSense

Reviewed: 21 November 2026. The user requested PlantVillage-like capabilities in the app. This review uses the original repositories and dataset documentation; no published model accuracy is treated as FieldSense accuracy.

## Sources reviewed

| Source | What it provides | Fit and decision |
| --- | --- | --- |
| [PlantVillage](https://github.com/spMohanty/PlantVillage-Dataset) / [dataset card](https://huggingface.co/datasets/mohanty/PlantVillage) | Labelled crop-leaf classification data, colour/grayscale/segmented versions and leaf-group-aware splits. The published class list has no rice. The card declares CC BY-SA 3.0; the loader itself cautions that its licence assumption needs verification. | Useful pipeline reference, not a rice detector. No PlantVillage imagery, code or weights bundled. Verify exact dataset/model terms before training or redistribution. |
| [PlantDoc](https://github.com/pratikkayal/PlantDoc-Dataset) | Cropped classification data and a linked object-detection dataset; authors report 2,598 examples over 13 species. Repository declares CC BY 4.0. Images were sourced from the internet. | Useful for thinking about non-laboratory backgrounds and detection versus classification. Not a ready-made validated rice model. No images/code copied. |
| [UCI Rice Leaf Diseases](https://archive.ics.uci.edu/dataset/486/rice+leaf+diseases) | 120 rice images in three classes: bacterial leaf blight, brown spot and leaf smut. UCI describes white-background photography and declares CC BY 4.0. | Three unmodified examples bundled for a rice reference library, with attribution. This small, controlled dataset cannot establish reliable recognition in Salem fields. |

## Implemented now

- Searchable, rice-specific reference gallery in Crop concerns, clearly labelled as dataset examples.
- Local side-by-side viewer for a farmer-selected JPEG/PNG/WebP image up to 3 MB. No upload, classifier, similarity ranking or confidence percentage.
- Basic resolution guidance; focus and lighting remain manual checks. The preview is temporary and does not silently become a saved observation.
- Per-reference capture prompts and actions to Record visit or draft an expert-review task. Selecting a reference does not confirm a disease or feed the explanation engine.
- Bundled references in the production offline shell. External source links still require connectivity.
- Three original assets total about 862 KB. Original archive paths, SHA-256 hashes, sizes, source, credits and licence are in [ATTRIBUTION.json](../public/images/rice-reference/ATTRIBUTION.json). Display fit is CSS only; source image bytes are unchanged.

Credit: Shah, J., Prajapati, H., & Dabhi, V. (2017). *Rice Leaf Diseases*. UCI Machine Learning Repository. [DOI: 10.24432/C5R013](https://doi.org/10.24432/C5R013). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Dataset labels are reproduced as supplied, not independently diagnosed by FieldSense.

## Recognition work still required

1. Choose rice datasets with documented rights, raw image IDs, class definitions and collection conditions. Include normal rice, common non-disease stresses and unfamiliar inputs; the UCI set has no healthy class.
2. Keep the same leaf/plant, augmented variants and duplicates in one split. Separate farms/dates/devices for field evaluation; never tune on the final test set.
3. Train a compact baseline and evaluate per class with confusion matrix, precision/recall and explicit unknown/uncertain behavior. Compare controlled-image performance with untouched local field images, including poor lighting and non-rice photos.
4. Have an agronomist review taxonomy and representative errors. Record model version, dataset licences, preprocessing, input size, limitations and evaluation results in a model card.
5. Only then integrate browser inference or an authorised endpoint with measured performance. Store model suggestions separately from farmer observations and expert-confirmed findings. No pesticide prescription from a classifier label.

No model has been trained, downloaded or enabled in this increment. The map interaction check from the previous request remains open; the user redirected work to datasets before a successful click/zoom verification was observed.
