// Core domain types for FieldSense

export type SourceType = "farmer" | "laboratory" | "weather" | "agronomist";

export type VerificationStatus =
  "observed" | "verified" | "pending" | "unverified";

export interface Field {
  id: string;

  name: string;

  location: { lat: number; lng: number };

  areaHectares: number;

  cropType: string;

  season: CropSeason;
}

export interface CropSeason {
  id: string;

  fieldId: string;

  year: number;

  season: "kharif" | "rabi" | "summer" | "custom";

  sowingDate: Date;

  expectedHarvestDate: Date;
}

export interface ScoutingPoint {
  id: string;

  fieldId: string;

  position: number; // 1, 2, 3, 4

  coordinates: { lat: number; lng: number };

  quadrat: string; // e.g., "NW quadrant", "NE quadrant"
}

export interface Photo {
  id: string;

  url: string; // data URL for local storage

  capturedAt: Date;

  photoType: "whole_plant" | "closeup" | "soil" | "affected_area";

  scoutingPointId?: string;

  notes?: string;

  isIllustrative: boolean;
}

export interface Observation {
  visitId?: string;
  seasonId?: string;
  id: string;

  fieldId: string;

  scoutingPointId?: string;

  observedAt: Date;

  recordedAt: Date;

  source: SourceType;

  verificationStatus: VerificationStatus;

  isIllustrative: boolean;

  leafColor?: "normal" | "yellowing" | "browning" | "mottling";

  leafPattern?: "uniform" | "patchy" | "sectoral" | "interveinal";

  leafLocation?: "lower" | "middle" | "upper" | "mixed";

  soilCondition?: "dry" | "moist" | "waterlogged" | "cracked";

  soilColor?: string;

  visiblePestCount?: number;

  pestType?: string;

  plantHeight?: number;

  tillerCount?: number;

  symptoms?: string;

  generalNotes?: string;

  weatherRecent?: string;
}

export interface SoilTest {
  id: string;

  fieldId: string;

  testedAt: Date;

  nitrogen: number;

  phosphorus: number;

  potassium: number;

  pH: number;

  organicMatter: number;

  units?: "ppm";

  labInterpretation?: "low nitrogen" | "no deficiency reported";

  source: SourceType;

  verificationStatus: VerificationStatus;

  isIllustrative: boolean;
}

export interface WaterTest {
  id: string;

  fieldId: string;

  testedAt: Date;

  depth: number;

  standingWater: boolean;

  drainageStatus: string;

  source: SourceType;

  verificationStatus: VerificationStatus;

  isIllustrative: boolean;
}

export interface WorkingExplanation {
  id: string;

  hypothesis: string;

  evidence: EvidenceLink[];

  supportingEvidence: string[];

  weakeningEvidence: string[];

  missingEvidence: string[];

  confidence: "high" | "medium" | "low";

  status: "supported" | "unresolved" | "insufficient evidence";

  nextCheck: string;
}

export interface EvidenceLink {
  observationId: string;

  relevance: string;
}

export interface Investigation {
  id: string;

  fieldId: string;

  startedAt: Date;

  observations: Observation[];

  soilTests: SoilTest[];

  waterTests: WaterTest[];

  workingExplanations: WorkingExplanation[];

  missingCriticalEvidence: string[];

  recommendedNextCheck: string;
}

export interface FarmOperation {
  id: string;

  fieldId: string;

  operationType: string;

  date: Date;

  details: string;

  isIllustrative: boolean;
}

export interface FollowUp {
  id: string;

  investigationId: string;

  fieldId: string;

  scheduledDate: Date;

  completedDate?: Date;

  sameSamplingPoints: boolean;

  beforePhotos: Photo[];

  afterPhotos: Photo[];

  observations: Observation[];

  response: "better" | "same" | "worse" | "unknown";

  actionOutcome: string;

  nextSteps: string;
}

export interface DemoSession {
  id: string;

  startedAt: Date;

  scenario: "A" | "B" | "C";

  interactions: InteractionLog[];

  demonstratorNotes: string;
}

export interface InteractionLog {
  timestamp: Date;

  action: string;

  details: Record<string, unknown>;
}

export interface WeatherRecord {
  id: string;
  fieldId: string;
  observedAt: Date;
  recordedAt: Date;

  source: "weather";
  verificationStatus: VerificationStatus;
  isIllustrative: boolean;

  rainfallMm: number;
  units: "mm";
}
