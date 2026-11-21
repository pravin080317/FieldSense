import { useId } from "react";
import type { CSSProperties } from "react";

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    help: "M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3 M12 16v1 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
    search: "M20 20l-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
    home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
    field: "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15",
    leaf: "M20 3C10 2 3 6 4 13c1 7 10 9 14 2 2-4 2-8 2-12Z M3 21 15 9",
    scan: "M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5 M8 12h8 M12 8v8",
    drop: "M12 3c-2 4-7 9-7 13a7 7 0 0 0 14 0c0-4-5-9-7-13z",
    calendar: "M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16 M8 14h2 M14 14h2 M8 18h2",
    book: "M4 3h13a3 3 0 0 1 3 3v15H6a2 2 0 0 1-2-2z M4 17h16 M8 7h8 M8 11h6",
    chart: "M4 3v17h17 M8 15l4-5 4 2 5-7",
    arrow: "M4 12h16 M14 6l6 6-6 6",
    down: "M12 3v12 M7 10l5 5 5-5 M4 17v4h16v-4",
    pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0z M14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
    check: "m5 12 4 4L19 6",
    plus: "M12 4v16 M4 12h16",
    sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1 1 M18 18l1 1 M5 19l1-1 M18 6l1-1",
    cloud:
      "M6 17a5 5 0 1 1 1-10 6 6 0 0 1 11 2 4 4 0 0 1 0 8z M8 20l-1 2 M14 20l-1 2",
    clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2",
    alert: "m12 3 10 18H2z M12 9v5 M12 17v1",
    camera: "M3 7h5l2-3h4l2 3h5v14H3z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    chevron: "m9 5 7 7-7 7",
    settings: "M4 7h16 M4 17h16 M8 4v6 M16 14v6",
    report: "M5 3h10l4 4v14H5z M14 3v5h5 M9 12h6 M9 16h6",
    bug: "M8 9h8v7a4 4 0 0 1-8 0z M9 9V6a3 3 0 0 1 6 0v3 M4 10h4 M16 10h4 M4 16h4 M16 16h4 M12 10v9",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.leaf} />
    </svg>
  );
}
export function FieldMap({
  point,
  onSelect,
  affected,
  compact = false,
}: {
  point: string;
  onSelect: (p: string) => void;
  affected: string[];
  compact?: boolean;
}) {
  const patternId = useId();
  return (
    <div className={`farm-map ${compact ? "compact" : ""}`}>
      <svg
        className="terrain"
        viewBox="0 0 800 470"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={`${patternId}-rows`}
            width="14"
            height="14"
            patternTransform="rotate(-25)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="14" height="14" fill="#b4c78a" />
            <path d="M0 0v14" stroke="#9db477" strokeWidth="5" />
          </pattern>
          <pattern
            id={`${patternId}-rows2`}
            width="10"
            height="10"
            patternTransform="rotate(24)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="10" height="10" fill="#c6d39d" />
            <path d="M0 0v10" stroke="#b2c185" strokeWidth="3" />
          </pattern>
        </defs>
        <rect width="800" height="470" fill="#e5e7d1" />
        <path
          d="M0 0h270l-25 150L0 180z M290 0h260l40 133-320 15z M615 0h185v180l-170-28z M0 220l205-26-35 276H0z M560 240l240-32v262H610z"
          fill={`url(#${patternId}-rows2)`}
        />
        <path
          d="m248 178 328-28 35 253-390 24z"
          fill={`url(#${patternId}-rows)`}
          stroke="#fffde5"
          strokeWidth="8"
        />
        <path d="m240 180-17 247 180-12-5-251z" fill="#e2c86d" opacity=".52" />
        <path
          d="m248 178 328-28 35 253-390 24z"
          fill="none"
          stroke="#3b6d45"
          strokeWidth="3"
          strokeDasharray="8 4"
        />
        <path
          d="M-20 200C170 170 230 156 400 145S650 150 830 182"
          fill="none"
          stroke="#f8f4e7"
          strokeWidth="19"
        />
        <path
          d="M600-20C550 90 660 230 614 500"
          fill="none"
          stroke="#b5d5ce"
          strokeWidth="13"
        />
        <g fill="#6d9660">
          {[60, 100, 170, 650, 680, 720, 755].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={i < 3 ? 170 - i * 5 : 200 + i * 3}
              r={9 + (i % 3) * 3}
            />
          ))}
        </g>
      </svg>
      <span className="map-label">
        PADDY FIELD 01 <small>1.2 ha · Ponni rice</small>
      </span>
      <span className="map-north">N ↑</span>
      {["pt-1", "pt-2", "pt-3", "pt-4"].map((p, i) => (
        <button
          key={p}
          aria-label={`Open scouting point ${i + 1}`}
          aria-pressed={p === point}
          className={`map-point ${affected.includes(p) ? "attention" : ""} ${p === point ? "active" : ""}`}
          style={
            {
              "--x": i % 2 ? "65%" : "35%",
              "--y": i < 2 ? "46%" : "77%",
            } as CSSProperties
          }
          onClick={() => onSelect(p)}
        >
          {i + 1}
        </button>
      ))}
      <span className="map-key">
        <i /> Reported symptoms <b /> Scouting point
      </span>
      <span className="map-caption">
        Illustrative field diagram · 18 Oct 2024
      </span>
    </div>
  );
}
