export const riceReferenceSource = {
  url: "https://archive.ics.uci.edu/dataset/486/rice+leaf+diseases",
  doi: "https://doi.org/10.24432/C5R013",
  license: "https://creativecommons.org/licenses/by/4.0/",
  credit:
    "Jitesh Shah, Harshadkumar Prajapati and Vipul Dabhi · UCI Machine Learning Repository",
};

// Dataset labels are reference categories, not predictions or diagnostic rules.
export const riceReferences = [
  {
    id: "bacterial-leaf-blight",
    label: "Bacterial leaf blight",
    image: "/images/rice-reference/bacterial-leaf-blight.jpg",
    prompts: [
      "Photograph the full leaf, including its tip and edges.",
      "Record whether the change occurs on one plant or several nearby plants.",
    ],
  },
  {
    id: "brown-spot",
    label: "Brown spot",
    image: "/images/rice-reference/brown-spot.jpg",
    prompts: [
      "Take a sharp close-up and a second photo of the whole leaf.",
      "Note the colour, shape and distribution of the marks you actually see.",
    ],
  },
  {
    id: "leaf-smut",
    label: "Leaf smut",
    image: "/images/rice-reference/leaf-smut.jpg",
    prompts: [
      "Photograph both sides of the leaf without changing the marks.",
      "Compare with a nearby plant that looks normal and record the difference.",
    ],
  },
] as const;

export function searchRiceReferences(query: string) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return riceReferences.filter((r) =>
    words.every((word) =>
      `${r.label} ${r.prompts.join(" ")}`.toLowerCase().includes(word),
    ),
  );
}

export function photoResolutionNote(width: number, height: number): string {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < 1 ||
    height < 1
  )
    return "Could not read image dimensions. Try another image.";
  return Math.min(width, height) < 512
    ? "Small image: fine leaf details may be hard to review. Use the original photo if available."
    : "Image dimensions are sufficient for a reference view. Check focus and lighting yourself; this is not an image-quality or disease score.";
}
