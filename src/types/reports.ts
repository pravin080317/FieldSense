export interface ReportAttachment {
  id: string;
  name: string;
  mime: "application/pdf" | "image/png" | "image/jpeg" | "image/webp";
  size: number;
  attachedAt: string;
  dataUrl: string;
}
export interface FieldReport {
  attachments?: ReportAttachment[];
  id: string;
  fieldId: string;
  seasonId: string;
  kind: "soil" | "water";
  sampledOn: string;
  reportedOn: string;
  recordedAt: string;
  sourceName: string;
  sampleLocation: string;
  reference: string;
  notes: string;
  interpretation: string;
  measurements: { label: string; value: number; unit: string }[];
  verification: "farmer-entered";
}
