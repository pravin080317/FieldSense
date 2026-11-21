# Field imagery, photogrammetry and farm records

Reviewed: 21 November 2026. User supplied the three sources below. Reviewed their published documentation; did not deploy a reconstruction engine, farmOS instance or FarmVibes cluster. No upstream code copied or new dependency installed.

| Source | Findings | FieldSense decision |
| --- | --- | --- |
| [Photogrammetry Guide](https://github.com/mikeroyal/Photogrammetry-Guide) | A broad guide to overlapping-photo reconstruction, surveying, GIS, point clouds and associated tools. It is not a browser photogrammetry engine. | Accept an already-processed, north-up image export with explicit bounds. Raw flight-image stitching, terrain reconstruction, coordinate correction and surveyed accuracy remain external work. No guide content or software assets copied. |
| [farmOS 4.x changelog](https://github.com/farmOS/farmOS/blob/4.x/CHANGELOG.md) | Includes changes to same-farm log/asset validation, geometry/import handling and upstream compatibility. Unreleased changes are distinct from release entries. | Reinforce same-field/season record references and validated imports. Existing React/IndexedDB app is not farmOS and does not inherit its APIs or release features. No farmOS installation or migration attempted. |
| [FarmVibes.AI](https://github.com/microsoft/farmvibes-ai) | MIT-licensed geospatial workflow platform combining dated imagery/weather data, preparation, training examples and an inference engine. README describes local cluster execution via containerised workflows and Python/REST interaction. | Adopt explicit spatial bounds, date and source metadata. No remote processing, cloud deployment, imagery provider, satellite access or trained workflow connected. NDVI and other analytical results need appropriate bands, preprocessing and validation, not ordinary RGB screenshots. |

## Implemented locally

My field now includes dated field imagery. Add up to three PNG/JPEG/WebP map exports per field and season, 3 MB each. Capture date, source, title and alignment/quality notes are required or explicitly entered; attachment time is preserved independently. Enter WGS84 south/west/north/east bounds from the export. New uploads must overlap the field's bounding box; this is a basic coordinate check, not a containment or georeferencing guarantee.

The map can show/hide a selected layer and vary its opacity beneath field boundaries/check points. The overlay is a rectangular image fit using Leaflet, not orthorectification. Source images can be downloaded. Bounds are labelled user-entered. Changing field geometry later does not alter or discard saved image provenance; an overlap warning appears if it no longer matches.

Records are scoped by field and season, kept in the IndexedDB snapshot, included in full backups and selected-field expert exports. Older workspaces default to no imagery. Restore validates contexts, dates, file signatures, sizes, coordinate ordering and limits, then merges by ID with existing conflict protection. Files remain embedded; a large imagery collection increases snapshot/backup size. Existing clearing-site-data caveats apply. No demo image is presented as a user's satellite observation.

## Validation and remaining work

- 55 tests, build and lint pass. New coverage includes old-workspace compatibility, backup/reopen, invalid date/context/file/bounds, layer limits, overlap checking and retained history after field edits.
- Leaflet API checked against its [official ImageOverlay documentation](https://leafletjs.com/reference-1.9.4.html#imageoverlay). Imagery uses a dedicated pane beneath boundary vectors.
- Browser/mobile acceptance remains pending: upload a real orthomosaic export, verify placement, pan/zoom, switch dates, vary opacity, toggle tiles and reopen after saving. No map interaction acceptance is claimed by unit tests.
- The earlier map interaction request is still open. A true georeferenced GeoTIFF pipeline, world-file/CRS parsing, flight processing, 3D viewer and FarmVibes integration are separate future increments.
- For vegetation indices, require measured spectral bands, band/scaling metadata, acquisition date, cloud masks and an appropriate field evaluation. No index, crop-health score, yield estimate or treatment recommendation is computed here.

The HTML and raw views of the moving farmOS branch returned differing recent-release lists during review. No latest-version claim is made; any future integration must pin and verify a commit/release and its corresponding changelog.
