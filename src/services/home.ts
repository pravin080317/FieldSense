import type { Workspace } from "../types/workspace.ts";
import { farmDashboard } from "./dashboard.ts";

export function homeSummary(workspace: Workspace, today: string) {
  const farm = farmDashboard(workspace, today);
  const areas = farm.fields;
  const active =
    areas.find((a) => a.field.id === workspace.selectedFieldId) || areas[0];
  const jobs = workspace.tasks
    .filter(
      (t) =>
        t.status !== "completed" &&
        areas.some(
          (a) => a.field.id === t.fieldId && a.season.id === t.seasonId,
        ),
    )
    .sort(
      (a, b) => a.dueDate.localeCompare(b.dueDate) || a.id.localeCompare(b.id),
    );
  const due = jobs.filter((t) => t.dueDate <= today);
  const firstChecks = areas.filter((a) => !a.last);
  return {
    areas,
    active,
    jobs,
    due,
    firstChecks,
    visits: farm.visits,
    pending: farm.pending,
    attention: due
      .slice(0, 3)
      .map((task) => ({
        task,
        area: areas.find((a) => a.field.id === task.fieldId)!,
      })),
  };
}
