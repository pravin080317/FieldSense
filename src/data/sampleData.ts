import type {
  Field,
  ScoutingPoint,
  Observation,
  SoilTest,
  WaterTest,
} from "../types/domain";

export const demoField: Field = {
  id: "field-01",

  name: "Paddy Field 01 - Salem",

  location: { lat: 11.6643, lng: 78.146 },

  areaHectares: 1.2,

  cropType: "Rice (Ponni variety)",

  season: {
    id: "season-2024-k",

    fieldId: "field-01",

    year: 2024,

    season: "kharif",

    sowingDate: new Date("2024-07-15"),

    expectedHarvestDate: new Date("2024-11-15"),
  },
};

// Scenario A: Yellowing in a low patch after rain

export const scenarioA = {
  field: demoField,

  observations: [
    // Scouting Point 1 (NW - affected area)

    {
      id: "obs-a-1",

      fieldId: "field-01",

      scoutingPointId: "pt-1",

      observedAt: new Date("2024-10-18"),

      recordedAt: new Date("2024-10-18T14:30:00"),

      source: "farmer" as const,

      verificationStatus: "observed" as const,

      isIllustrative: true,

      leafColor: "yellowing" as const,

      leafPattern: "uniform" as const,

      leafLocation: "lower" as const,

      soilCondition: "waterlogged" as const,

      visiblePestCount: 0,

      generalNotes: "Low patch after 3 days of heavy rain",

      weatherRecent: "Heavy rain 3 days ago, still waterlogged",
    },

    // Scouting Point 2 (NE - normal)

    {
      id: "obs-a-2",

      fieldId: "field-01",

      scoutingPointId: "pt-2",

      observedAt: new Date("2024-10-18"),

      recordedAt: new Date("2024-10-18T14:35:00"),

      source: "farmer" as const,

      verificationStatus: "observed" as const,

      isIllustrative: true,

      leafColor: "normal" as const,

      soilCondition: "moist" as const,

      visiblePestCount: 0,

      generalNotes: "Normal growth pattern",
    },

    // Scouting Point 3 (SW - low patch)

    {
      id: "obs-a-3",

      fieldId: "field-01",

      scoutingPointId: "pt-3",

      observedAt: new Date("2024-10-18"),

      recordedAt: new Date("2024-10-18T14:40:00"),

      source: "farmer" as const,

      verificationStatus: "observed" as const,

      isIllustrative: true,

      leafColor: "yellowing" as const,

      leafLocation: "lower" as const,

      soilCondition: "waterlogged" as const,

      visiblePestCount: 0,

      generalNotes: "Another low patch, waterlogged",
    },
  ] as Observation[],

  soilTests: [
    {
      id: "soil-a-1",

      fieldId: "field-01",

      testedAt: new Date("2024-09-30"),

      nitrogen: 420,

      phosphorus: 32,

      potassium: 280,

      pH: 6.8,

      organicMatter: 2.1,

      source: "laboratory" as const,

      verificationStatus: "verified" as const,

      isIllustrative: true,
    },
  ] as SoilTest[],

  waterTests: [] as WaterTest[],
};

// Scenario B: Yellowing with low N soil test

export const scenarioB = {
  field: demoField,

  observations: [
    {
      id: "obs-b-1",

      fieldId: "field-01",

      scoutingPointId: "pt-1",

      observedAt: new Date("2024-10-18"),

      recordedAt: new Date("2024-10-18T14:30:00"),

      source: "farmer" as const,

      verificationStatus: "observed" as const,

      isIllustrative: true,

      leafColor: "yellowing" as const,

      leafLocation: "lower" as const,

      soilCondition: "moist" as const,

      visiblePestCount: 0,

      generalNotes: "Lower leaves yellowing across the patch",

      weatherRecent: "Normal monsoon rains, no waterlogging signs",
    },

    {
      id: "obs-b-2",

      fieldId: "field-01",

      scoutingPointId: "pt-2",

      observedAt: new Date("2024-10-18"),

      recordedAt: new Date("2024-10-18T14:35:00"),

      source: "farmer" as const,

      verificationStatus: "observed" as const,

      isIllustrative: true,

      leafColor: "yellowing" as const,

      leafLocation: "lower" as const,

      soilCondition: "moist" as const,

      visiblePestCount: 0,
    },

    {
      id: "obs-b-3",

      fieldId: "field-01",

      scoutingPointId: "pt-3",

      observedAt: new Date("2024-10-18"),

      recordedAt: new Date("2024-10-18T14:40:00"),

      source: "farmer" as const,

      verificationStatus: "observed" as const,

      isIllustrative: true,

      leafColor: "yellowing" as const,

      leafLocation: "lower" as const,

      soilCondition: "moist" as const,

      visiblePestCount: 0,
    },
  ] as Observation[],

  soilTests: [
    {
      id: "soil-b-1",

      fieldId: "field-01",

      testedAt: new Date("2024-10-15"),

      nitrogen: 220,
      labInterpretation: "low nitrogen", // sample laboratory interpretation

      phosphorus: 25,

      potassium: 200,

      pH: 6.9,

      organicMatter: 1.8,

      source: "laboratory" as const,

      verificationStatus: "verified" as const,

      isIllustrative: true,
    },
  ] as SoilTest[],

  waterTests: [] as WaterTest[],
};

// Scenario C: Leaf damage with pest counts

export const scenarioC = {
  field: demoField,

  observations: [
    {
      id: "obs-c-1",

      fieldId: "field-01",

      scoutingPointId: "pt-1",

      observedAt: new Date("2024-10-18"),

      recordedAt: new Date("2024-10-18T14:30:00"),

      source: "farmer" as const,

      verificationStatus: "observed" as const,

      isIllustrative: true,

      leafColor: "browning" as const,

      visiblePestCount: 8,

      pestType: "Brown planthoppers",

      symptoms: "Leaf spots and stippling",

      generalNotes: "First sampling point shows clear pest damage",
    },

    {
      id: "obs-c-2",

      fieldId: "field-01",

      scoutingPointId: "pt-2",

      observedAt: new Date("2024-10-18"),

      recordedAt: new Date("2024-10-18T14:35:00"),

      source: "farmer" as const,

      verificationStatus: "observed" as const,

      isIllustrative: true,

      leafColor: "normal" as const,

      visiblePestCount: 1,

      pestType: "Brown planthoppers",

      generalNotes: "Minimal pest activity",
    },

    {
      id: "obs-c-3",

      fieldId: "field-01",

      scoutingPointId: "pt-3",

      observedAt: new Date("2024-10-18"),

      recordedAt: new Date("2024-10-18T14:40:00"),

      source: "farmer" as const,

      verificationStatus: "observed" as const,

      isIllustrative: true,

      leafColor: "browning" as const,

      visiblePestCount: 6,

      pestType: "Brown planthoppers",

      symptoms: "Leaf hopper damage, yellowing edge necrosis",

      generalNotes: "Third point also shows pest damage",
    },
  ] as Observation[],

  soilTests: [
    {
      id: "soil-c-1",

      fieldId: "field-01",

      testedAt: new Date("2024-10-10"),

      nitrogen: 350,

      phosphorus: 28,

      potassium: 220,

      pH: 6.8,

      organicMatter: 2.0,

      source: "laboratory" as const,

      verificationStatus: "verified" as const,

      isIllustrative: true,
    },
  ] as SoilTest[],

  waterTests: [] as WaterTest[],
};

// Scouting points

export const scoutingPoints: ScoutingPoint[] = [
  {
    id: "pt-1",

    fieldId: "field-01",

    position: 1,

    coordinates: { lat: 11.6646, lng: 78.1457 },

    quadrat: "NW quadrant",
  },

  {
    id: "pt-2",

    fieldId: "field-01",

    position: 2,

    coordinates: { lat: 11.6646, lng: 78.1463 },

    quadrat: "NE quadrant",
  },

  {
    id: "pt-3",

    fieldId: "field-01",

    position: 3,

    coordinates: { lat: 11.664, lng: 78.1457 },

    quadrat: "SW quadrant",
  },

  {
    id: "pt-4",

    fieldId: "field-01",

    position: 4,

    coordinates: { lat: 11.664, lng: 78.1463 },

    quadrat: "SE quadrant",
  },
];
