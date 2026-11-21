export const crops = [
  { id: "rice", name: "Rice (paddy)" },
  { id: "maize", name: "Maize" },
  { id: "millet", name: "Millet" },
  { id: "groundnut", name: "Groundnut" },
  { id: "pulses", name: "Pulses" },
  { id: "cotton", name: "Cotton" },
  { id: "tomato", name: "Tomato" },
  { id: "chilli", name: "Chilli" },
  { id: "wheat", name: "Wheat" },
  { id: "flowers", name: "Flowers" },
  { id: "coconut", name: "Coconut" },
  { id: "garden-plants", name: "Garden plants" },
] as const;
export type CropId = (typeof crops)[number]["id"];
export function isOngoingCrop(id: string) {
  return id === "coconut" || id === "garden-plants";
}
export function cropName(id: string) {
  return crops.find((c) => c.id === id)?.name || "Crop not set";
}
