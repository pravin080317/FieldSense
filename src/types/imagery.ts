import type { ReportAttachment } from "./reports.ts";
export interface FieldImagery {
  id: string;
  fieldId: string;
  seasonId: string;
  title: string;
  capturedOn: string;
  source: string;
  notes: string;
  alignment: "user-entered-bounds";
  bounds: { south: number; west: number; north: number; east: number };
  file: ReportAttachment;
}
