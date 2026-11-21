import type { DiaryEntry } from "../types/workspace.ts";

/** Integer paise avoids floating-point rupee addition. Legacy unsupported values remain visible. */
export function costPaise(value: string): number | null {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  const paise = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(paise) && paise >= 0 ? paise : null;
}

export function activityLedger(
  entries: DiaryEntry[],
  fieldId: string,
  seasonId: string,
  filters: { from?: string; to?: string; type?: string } = {},
) {
  if (filters.from && filters.to && filters.from > filters.to)
    throw new Error("Start date must be on or before the end date.");
  const rows = entries
    .filter(
      (e) =>
        (e.fieldId || "field-01") === fieldId &&
        (e.seasonId || "season-2024-k") === seasonId &&
        (!filters.from || e.date >= filters.from) &&
        (!filters.to || e.date <= filters.to) &&
        (!filters.type || e.type === filters.type),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  let totalPaise = 0,
    missing = 0,
    invalid = 0,
    withCost = 0;
  const groups = new Map<
    string,
    {
      type: string;
      count: number;
      totalPaise: number;
      missing: number;
      invalid: number;
    }
  >();
  for (const row of rows) {
    const group = groups.get(row.type) || {
      type: row.type,
      count: 0,
      totalPaise: 0,
      missing: 0,
      invalid: 0,
    };
    group.count++;
    const cost = costPaise(row.cost);
    if (row.cost === "") {
      missing++;
      group.missing++;
    } else if (cost === null) {
      invalid++;
      group.invalid++;
    } else {
      if (!Number.isSafeInteger(totalPaise + cost))
        throw new Error(
          "Recorded costs exceed the supported total. Narrow the date range.",
        );
      totalPaise += cost;
      group.totalPaise += cost;
      withCost++;
    }
    groups.set(row.type, group);
  }
  return {
    rows,
    totalPaise,
    missing,
    invalid,
    withCost,
    groups: [...groups.values()].sort(
      (a, b) => b.totalPaise - a.totalPaise || a.type.localeCompare(b.type),
    ),
  };
}

function csvCell(value: string): string {
  // Prevent text fields becoming spreadsheet formulae when a CSV is opened.
  const safe = /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
  return '"' + safe.replaceAll('"', '""') + '"';
}
export function activityCsv(
  rows: DiaryEntry[],
  fieldName: string,
  seasonName: string,
): string {
  const header = [
    "Field",
    "Season",
    "Activity ID",
    "Date",
    "Activity",
    "Notes",
    "Recorded cost (INR)",
    "Cost status",
  ];
  return (
    "\uFEFF" +
    [
      header,
      ...rows.map((e) => {
        const paise = costPaise(e.cost);
        return [
          fieldName,
          seasonName,
          e.id,
          e.date,
          e.type,
          e.notes,
          e.cost,
          e.cost === ""
            ? "Not entered"
            : paise === null
              ? "Excluded from total: unsupported format"
              : "Entered",
        ];
      }),
    ]
      .map((r) => r.map(csvCell).join(","))
      .join("\r\n")
  );
}
