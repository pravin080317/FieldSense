import type { Workspace } from "../types/workspace.ts";
import { cropName } from "../data/crops.ts";

export function farmDashboard(
  workspace: Workspace,
  today: string,
  includeSamples = false,
) {
  const end = new Date(today + "T23:59:59");
  if (!Number.isFinite(+end)) throw new Error("Invalid dashboard date.");
  const fields = workspace.fields
    .filter((f) => includeSamples || !f.isIllustrative)
    .map((field) => {
      const candidates = workspace.seasons.filter(
        (s) => s.fieldId === field.id,
      );
      const season =
        candidates.find(
          (s) =>
            s.id === workspace.selectedSeasonId &&
            field.id === workspace.selectedFieldId,
        ) || candidates.at(-1);
      if (!season) return null;
      const observations = workspace.obs
        .filter(
          (o) =>
            o.fieldId === field.id &&
            o.seasonId === season.id &&
            +o.observedAt <= +end &&
            (includeSamples || !o.isIllustrative),
        )
        .sort(
          (a, b) =>
            +b.observedAt - +a.observedAt || +b.recordedAt - +a.recordedAt,
        );
      const last =
        observations[0] ||
        workspace.visits
          .filter(
            (v) =>
              v.fieldId === field.id &&
              v.seasonId === season.id &&
              +v.observedAt <= +end &&
              (includeSamples || !v.isIllustrative),
          )
          .sort((a, b) => +b.observedAt - +a.observedAt)[0];
      const tasks = workspace.tasks.filter(
        (t) => t.fieldId === field.id && t.seasonId === season.id,
      );
      const pending = tasks.filter((t) => t.status !== "completed"),
        overdue = pending.filter((t) => t.dueDate < today).length;
      const latestAtPoint = new Map<string, (typeof observations)[number]>();
      observations.forEach((o) => {
        const point = o.scoutingPointId || o.id;
        if (!latestAtPoint.has(point)) latestAtPoint.set(point, o);
      });
      const changes = [...latestAtPoint.values()].filter(
        (o) =>
          +end - +o.observedAt <= 14 * 86400000 &&
          ((o.leafColor && o.leafColor !== "normal") ||
            (o.visiblePestCount || 0) > 0 ||
            o.soilCondition === "waterlogged"),
      ).length;
      const status = overdue
        ? "Work overdue"
        : changes
          ? "Changes recorded"
          : !last
            ? "No visit recorded"
            : +end - +last.observedAt > 14 * 86400000
              ? "Time for a field check"
              : "Recent visit saved";
      const photos = workspace.photos.filter(
        (p) =>
          (p.fieldId || "field-01") === field.id &&
          (p.seasonId || "season-2024-k") === season.id,
      );
      const photo = [...photos]
        .sort((a, b) => +(b.recordedAt || 0) - +(a.recordedAt || 0))
        .at(0);
      const visits = workspace.visits.filter(
        (v) =>
          v.fieldId === field.id &&
          v.seasonId === season.id &&
          +v.observedAt <= +end &&
          (includeSamples || !v.isIllustrative),
      );
      return {
        field,
        season,
        crop: cropName(season.crop),
        last,
        pending: pending.length,
        overdue,
        completed: tasks.length - pending.length,
        status,
        changes,
        photo,
        visits,
        latestPoints: [...latestAtPoint.values()],
      };
    })
    .filter((r) => r !== null);
  const weekly = Array.from({ length: 6 }, (_, i) => {
    const from = new Date(today + "T00:00:00");
    from.setDate(from.getDate() - (5 - i) * 7 - 6);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);
    return {
      label: from.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      count: fields
        .flatMap((f) => f.visits)
        .filter((v) => +v.observedAt >= +from && +v.observedAt < +to).length,
    };
  });
  const totalAreaHa =
    Math.round(
      fields.reduce((sum, f) => sum + (f.field.areaHectares || 0), 0) * 100,
    ) / 100;
  const cropMap = new Map<
    string,
    { cropId: string; cropName: string; count: number; areaHa: number }
  >();
  for (const f of fields) {
    const existing = cropMap.get(f.season.crop);
    if (existing) {
      existing.count += 1;
      existing.areaHa =
        Math.round((existing.areaHa + (f.field.areaHectares || 0)) * 100) / 100;
    } else {
      cropMap.set(f.season.crop, {
        cropId: f.season.crop,
        cropName: f.crop,
        count: 1,
        areaHa: Math.round((f.field.areaHectares || 0) * 100) / 100,
      });
    }
  }
  const cropBreakdown = [...cropMap.values()].sort(
    (a, b) => b.areaHa - a.areaHa || b.count - a.count,
  );
  const allLatestPoints = fields.flatMap((f) => f.latestPoints);
  const observationsSummary = {
    totalPoints: allLatestPoints.length,
    normalLeaves: allLatestPoints.filter((o) => o.leafColor === "normal")
      .length,
    yellowingOrBrowning: allLatestPoints.filter(
      (o) =>
        o.leafColor === "yellowing" ||
        o.leafColor === "browning" ||
        o.leafColor === "mottling",
    ).length,
    waterlogged: allLatestPoints.filter((o) => o.soilCondition === "waterlogged")
      .length,
    withPests: allLatestPoints.filter((o) => (o.visiblePestCount || 0) > 0)
      .length,
  };
  return {
    fields,
    weekly,
    totalAreaHa,
    cropBreakdown,
    observationsSummary,
    pending: fields.reduce((n, f) => n + f.pending, 0),
    overdue: fields.reduce((n, f) => n + f.overdue, 0),
    completed: fields.reduce((n, f) => n + f.completed, 0),
    visits: fields.reduce((n, f) => n + f.visits.length, 0),
  };
}
