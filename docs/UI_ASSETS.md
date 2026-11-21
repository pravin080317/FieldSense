# Farmer experience: images and guidance

Added: 20 November 2026

## Saved image

- Project asset: [`public/images/paddy-field-v2.png`](../public/images/paddy-field-v2.png).
- Generated with the built-in image-generation tool, then copied into the project. No API/CLI fallback was used.
- Use: illustrative paddy-field banner on Home. It is labelled “AI-generated illustration · not a field photo” and is never stored as observation evidence.
- The previous SVG field map remains the interactive location diagram. The generated image does not represent measured field boundaries, crop health, or live conditions.

Current app location: **Salem, Tamil Nadu**. The banner is a generic southern Indian paddy illustration, not a photograph of the sample field. The original generation prompt below is retained verbatim as asset provenance; its earlier place reference is not the app location.

Original generation prompt:

```text
Use case: photorealistic-natural. Asset type: wide photographic banner for FieldSense, a paddy farm companion web app for Thanjavur Tamil Nadu. Create a premium natural editorial photograph of a lush southern Indian paddy field in soft early morning light. Close rice panicles and healthy green rice leaves in the right foreground, gently curving field bund leading to a distant low palm-lined horizon. Spacious calm field on the left, organically textured green and warm straw palette, restrained contrast, real agricultural setting rather than generic tropical jungle. Wide landscape composition, no people required. No text, numbers, logos, UI, borders, watermarks, field boundaries, disease claims or data overlays. This is illustrative app imagery, not evidence of a particular farm. Save as a project raster asset.
```

## Code-native illustrations

`src/components/Help.tsx` includes accessible SVG diagrams showing whole-plant and close-up photo framing. They are instructional diagrams, not symptom-identification or diagnostic reference images.

## Plain-language interface

- Primary farmer actions: Home, My field, Record visit, Next steps and History.
- Secondary tools: Crop concerns, Soil & rain and Expert report. Phone users access these through More.
- Internal routes are preserved so existing bookmarks still work. No record schema or stored evidence was changed for this UI increment.
- Practical labels replace technical wording in common tasks. Original dated evidence remains accessible in the details and exported report.
- Help includes searchable questions about visits, photos, soil wording, report relevance, follow-up, storage, backups and demo limitations.
- Inline guidance explains soil labels and comparable insect counts. Select values retain their existing domain meanings.
- Mobile photo inputs can request the rear camera; actual device-camera behaviour still needs phone hardware testing.

## Verification and limits

Manually inspected Chrome Home on desktop and at 400-pixel responsive width. Opened Help, searched “backup” and received the relevant answers, then closed with Escape. Navigated to Record visit using the mobile bottom bar and expanded the photo guide; diagrams exposed descriptive accessible names. The final header-action, dialog-label, guide-deduplication and search-reset cleanups were build/lint checked after that browser pass.

All 20 existing domain/repository tests pass, as do build and lint. This is a farmer-experience increment, not completion of Level 2. Tamil translation, true field onboarding, multiple tasks, backend sync, agronomic validation and an offline app shell remain separate roadmap work.
