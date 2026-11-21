import type { CropId } from "../data/crops.ts";
export type Coordinate = { lat: number; lng: number };
export interface FarmField {
  id: string;
  name: string;
  locality: string;
  areaHectares: number;
  location: Coordinate;
  boundary: Coordinate[];
  irrigationSource: string;
  isIllustrative: boolean;
}
export interface FarmSeason {
  id: string;
  fieldId: string;
  name: string;
  crop: CropId;
  variety: string;
  sowingDate: string;
  expectedHarvestDate: string;
  growthStage:
    | "not-set"
    | "planting"
    | "vegetative"
    | "reproductive"
    | "harvest"
    | "finished";
  isIllustrative: boolean;
}
export type TaskStatus = "todo" | "in-progress" | "completed";
export type TaskOutcome = "unknown" | "better" | "same" | "worse";
export interface FarmTask {
  id: string;
  fieldId: string;
  seasonId: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  observationIds: string[];
  outcome: TaskOutcome;
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
  events: {
    status: TaskStatus;
    at: Date;
    outcome: TaskOutcome;
    notes: string;
  }[];
}
export type Theme = "forest" | "earth" | "night";
export interface FarmState {
  fields: FarmField[];
  seasons: FarmSeason[];
  tasks: FarmTask[];
  selectedFieldId: string;
  selectedSeasonId: string;
  theme: Theme;
}
