import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FarmField, Coordinate } from "../types/farm";
import type { FieldImagery } from "../types/imagery";
import { fieldPoints, boundaryGeoJSON } from "../services/farm";
import { HelpHint } from "./Help";
import { Icon } from "./Visuals";
import { requestDevicePosition } from "../services/location";

export function GeographicMap({
  field,
  point = "pt-1",
  onSelect,
  editing = false,
  onBoundary,
  imagery,
  opacity = 0.65,
  onLocation,
}: {
  field: FarmField;
  point?: string;
  onSelect?: (id: string) => void;
  editing?: boolean;
  onBoundary?: (points: Coordinate[]) => void;
  imagery?: FieldImagery;
  opacity?: number;
  onLocation?: (location: Coordinate) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const shapes = useRef<L.LayerGroup | null>(null);
  const tiles = useRef<L.TileLayer | null>(null);
  const [mapMode, setMapMode] = useState<"satellite" | "streets" | "local">(
    "satellite",
  );
  const [draw, setDraw] = useState(false);
  const [picking, setPicking] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [notice, setNotice] = useState("");
  const deviceLayer = useRef<L.LayerGroup | null>(null);
  const locating = useRef(false);
  const [locationStatus, setLocationStatus] = useState<{
    fieldId: string;
    busy: boolean;
    text: string;
  }>({ fieldId: field.id, busy: false, text: "" });
  useEffect(() => {
    if (!host.current) return;
    const view = L.map(host.current, {
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView([0, 0], 17);
    view.createPane("field-imagery").style.zIndex = "350";
    map.current = view;
    shapes.current = L.layerGroup().addTo(view);
    deviceLayer.current = L.layerGroup().addTo(view);
    const resize = new ResizeObserver(() => view.invalidateSize());
    resize.observe(host.current);
    return () => {
      resize.disconnect();
      view.remove();
      map.current = null;
      shapes.current = null;
      tiles.current = null;
      deviceLayer.current = null;
      locating.current = false;
    };
  }, [field.id]);
  useEffect(() => {
    map.current?.setView([field.location.lat, field.location.lng], 17);
  }, [field.id, field.location.lat, field.location.lng]);
  useEffect(() => {
    const view = map.current;
    if (!view || !imagery || imagery.fieldId !== field.id) return;
    const layer = L.imageOverlay(
      imagery.file.dataUrl,
      [
        [imagery.bounds.south, imagery.bounds.west],
        [imagery.bounds.north, imagery.bounds.east],
      ],
      {
        opacity,
        interactive: false,
        alt: imagery.title,
        pane: "field-imagery",
      },
    ).addTo(view);
    return () => {
      view.removeLayer(layer);
    };
  }, [field.id, imagery, opacity]);
  useEffect(() => {
    const view = map.current;
    if (!view || mapMode === "local") return;
    const url =
      mapMode === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    const attribution =
      mapMode === "satellite"
        ? "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics"
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const layer = L.tileLayer(url, {
      maxZoom: 19,
      attribution,
    }).addTo(view);
    tiles.current = layer;
    layer.on("tileerror", () => setTileError(true));
    return () => {
      view.removeLayer(layer);
      tiles.current = null;
    };
  }, [mapMode, field.id]);
  useEffect(() => {
    const group = shapes.current;
    if (!group) return;
    group.clearLayers();
    if (editing && onLocation)
      L.circleMarker([field.location.lat, field.location.lng], {
        radius: 7,
        color: "#ae5a26",
        fillOpacity: 1,
      })
        .bindTooltip("Field centre · draft location")
        .addTo(group);
    if (field.boundary.length >= 2)
      L.polygon(
        field.boundary.map((p) => [p.lat, p.lng] as L.LatLngTuple),
        {
          color: mapMode === "satellite" ? "#e5f4d4" : "#2f6c47",
          weight: 3,
          fillColor: mapMode === "satellite" ? "#8cc474" : "#94b46e",
          fillOpacity: mapMode === "satellite" ? 0.25 : 0.24,
        },
      ).addTo(group);
    fieldPoints(field).forEach((p) => {
      const marker = L.marker([p.coordinates.lat, p.coordinates.lng], {
        icon: L.divIcon({
          className: "geo-checkpoint",
          html: `<span class="${p.id === point ? "chosen" : ""}">${p.position}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
        keyboard: true,
        title: `Select check point ${p.position}`,
      }).addTo(group);
      const text = document.createElement("span");
      text.textContent = `${p.quadrat} · suggested location`;
      marker.bindTooltip(text);
      marker.on("click", () => onSelect?.(p.id));
    });
    if (editing)
      field.boundary.forEach((p, i) =>
        L.circleMarker([p.lat, p.lng], {
          radius: 5,
          color: "#a47c37",
          fillOpacity: 1,
        })
          .bindTooltip(`Corner ${i + 1}`)
          .addTo(group),
      );
  }, [field, point, editing, mapMode, onSelect, onLocation]);
  useEffect(() => {
    const view = map.current;
    if (!view) return;
    const click = (e: L.LeafletMouseEvent) => {
      if (editing && picking && onLocation) {
        onLocation({
          lat: Number(e.latlng.lat.toFixed(7)),
          lng: Number(e.latlng.lng.toFixed(7)),
        });
        setPicking(false);
        setNotice(
          "Draft field centre updated. Existing boundary corners stayed in place. Save the field to keep this location.",
        );
        return;
      }
      if (editing && draw)
        onBoundary?.([
          ...field.boundary,
          {
            lat: Number(e.latlng.lat.toFixed(7)),
            lng: Number(e.latlng.lng.toFixed(7)),
          },
        ]);
    };
    view.on("click", click);
    return () => {
      view.off("click", click);
    };
  }, [draw, picking, editing, field.boundary, onBoundary, onLocation]);
  function fit() {
    const points = field.boundary.length
      ? field.boundary
      : fieldPoints(field).map((p) => p.coordinates);
    map.current?.fitBounds(
      L.latLngBounds(points.map((p) => [p.lat, p.lng] as L.LatLngTuple)),
      { padding: [28, 28], maxZoom: 18 },
    );
  }
  async function locateMe() {
    if (locating.current) return;
    const view = map.current;
    if (!view) return;
    locating.current = true;
    setLocationStatus({
      fieldId: field.id,
      busy: true,
      text: "Waiting for device location. Allow the browser prompt if shown.",
    });
    try {
      const position = await requestDevicePosition(
        navigator.geolocation,
        window.isSecureContext,
      );
      if (map.current !== view) return;
      const group = deviceLayer.current;
      group?.clearLayers();
      if (group) {
        L.circle([position.lat, position.lng], {
          radius: position.accuracy,
          color: "#2878bd",
          fillOpacity: 0.1,
          interactive: false,
        }).addTo(group);
        L.circleMarker([position.lat, position.lng], {
          radius: 8,
          color: "#fff",
          fillColor: "#2878bd",
          fillOpacity: 1,
          weight: 3,
        })
          .bindTooltip("Your device location · not a field boundary")
          .addTo(group);
      }
      view.setView(
        [position.lat, position.lng],
        position.accuracy > 1000 ? 12 : 17,
      );
      setLocationStatus({
        fieldId: field.id,
        busy: false,
        text: `Device location found at ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)} (reported accuracy ±${Math.round(position.accuracy)} m). ${position.accuracy > 100 ? "This is approximate; do not use it to mark field corners. " : ""}Shown on this map only. It does not change the saved field or check points.`,
      });
    } catch (error) {
      if (map.current === view)
        setLocationStatus({
          fieldId: field.id,
          busy: false,
          text:
            error instanceof Error
              ? error.message
              : "Could not read device location.",
        });
    } finally {
      if (map.current === view) locating.current = false;
    }
  }
  function exportGeometry() {
    try {
      const url = URL.createObjectURL(
        new Blob([boundaryGeoJSON(field)], { type: "application/geo+json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "fieldsense-boundary.geojson";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "No boundary to export.");
    }
  }
  return (
    <div className="geographic-map">
      <HelpHint title="How do I use this map?">
        <p>
          Drag the map to move around. Use + and − to zoom. Locate me shows
          where your device is; Fit field takes you back to your saved field.
        </p>
        <p>
          When adding or editing a field, Set field centre lets you tap its
          location. Mark corners lets you tap around the outside edge. Choose
          Save field afterwards to keep your changes. The centre is a single
          point; the boundary is the whole field edge.
        </p>
      </HelpHint>
      <div className="map-toolbar">
        <button type="button" onClick={fit}>
          <Icon name="field" size={16} /> Fit field
        </button>
        <button
          type="button"
          onClick={locateMe}
          disabled={locationStatus.fieldId === field.id && locationStatus.busy}
        >
          <Icon name="pin" size={16} />{" "}
          {locationStatus.fieldId === field.id && locationStatus.busy
            ? "Locating…"
            : "Locate me"}
        </button>
        <div className="map-mode-group" role="group" aria-label="Map layer">
          {(
            [
              ["satellite", "Satellite"],
              ["streets", "Streets"],
              ["local", "Offline grid"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={mapMode === id ? "primary" : ""}
              aria-pressed={mapMode === id}
              onClick={() => {
                setMapMode(id);
                setTileError(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {editing && (
          <button
            type="button"
            className={draw ? "primary" : ""}
            aria-pressed={draw}
            onClick={() => {
              setPicking(false);
              setDraw((v) => !v);
            }}
          >
            <Icon name="plus" size={15} />
            {draw ? "Finish marking" : "Mark corners"}
          </button>
        )}
        {editing && onLocation && (
          <button
            type="button"
            aria-pressed={picking}
            className={picking ? "primary" : ""}
            onClick={() => {
              setDraw(false);
              setPicking((v) => !v);
            }}
          >
            <Icon name="pin" size={16} />
            {picking ? "Cancel centre selection" : "Set field centre"}
          </button>
        )}
        <button type="button" onClick={exportGeometry}>
          <Icon name="down" size={15} /> Download field boundary
        </button>
      </div>
      <div
        className={`geographic-canvas ${draw || picking ? "drawing" : ""}`}
        ref={host}
        aria-label={`Interactive map of ${field.name}. Use the controls to zoom or mark field corners.`}
      />
      {picking && (
        <p className="map-notice" role="status">
          Click or tap the map once to set the draft field centre. Use the
          coordinate inputs as a keyboard alternative. This does not draw or
          move a boundary.
        </p>
      )}
      {editing && (
        <div className="boundary-toolbar">
          <span>
            {field.boundary.length} corners ·{" "}
            {draw
              ? "Click the map to add each corner."
              : "Mark or import a boundary, then save the field."}
          </span>
          <button
            type="button"
            disabled={!field.boundary.length}
            onClick={() => onBoundary?.(field.boundary.slice(0, -1))}
          >
            Undo corner
          </button>
          <button
            type="button"
            disabled={!field.boundary.length}
            onClick={() => onBoundary?.([])}
          >
            Clear draft corners
          </button>
        </div>
      )}
      <p className="map-source">
        {field.isIllustrative
          ? "Showing the Salem sample field, not your detected location. Use My field to add your own field."
          : "Boundary entered by you; check it against the field."}{" "}
        Check points are suggested locations, not GPS measurements.
        {mapMode === "satellite"
          ? " Live satellite imagery: Esri World Imagery (internet required)."
          : mapMode === "streets"
            ? " Live street map: OpenStreetMap (internet required)."
            : " Offline geometry view; no tile service is contacted."}
      </p>
      <p className="map-source">
        Locate me asks your device for its current position; allow location
        permission when prompted. It does not detect farm boundaries. Online
        street tiles are optional background maps.
      </p>
      {locationStatus.fieldId === field.id && locationStatus.text && (
        <p className="map-notice" role="status">
          {locationStatus.text}
        </p>
      )}
      {tileError && (
        <p className="map-notice" role="status">
          Street tiles could not load. Your boundary and points are still
          available.
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}
