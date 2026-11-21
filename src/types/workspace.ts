import type { FarmState } from "./farm.ts";
import type { FieldImagery } from "./imagery.ts";
import type { FieldReport } from "./reports.ts";
import type { Observation } from "./domain.ts";

export type Scenario = "A" | "B" | "C";
export interface Visit {
  id: string;
  fieldId: string;
  seasonId: string;
  observedAt: Date;
  recordedAt: Date;
  observationIds: string[];
  isIllustrative: boolean;
}
export interface StoredPhoto {
  fieldId?: string;
  seasonId?: string;
  id: string;
  url: string;
  point: string;
  kind: string;
  recordedAt?: Date;
  observationId?: string;
}
export interface DiaryEntry {
  fieldId?: string;
  seasonId?: string;
  id: string;
  type: string;
  date: string;
  notes: string;
  cost: string;
}
export interface SavedFollowUp {
  action: string;
  date: string;
  outcome: string;
  notes: string;
}
export interface Workspace extends FarmState {
  imagery: FieldImagery[];
  fieldReports: FieldReport[];
  schemaVersion: 4;
  scenario: Scenario;
  obs: Observation[];
  visits: Visit[];
  photos: StoredPhoto[];
  entries: DiaryEntry[];
  follow: SavedFollowUp | null;
  report: "scenario" | "wrong" | "stale" | "absent";
  rain: number;
  reviewDate: string;
}
