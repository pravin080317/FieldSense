export interface LeafVisionResult {
  algorithm: "HSV Color Segmentation + Excess Green Index (ExG)";
  sampledPixels: number;
  vegetationPixels: number;
  healthyGreenPct: number;
  chlorosisYellowPct: number;
  necrosisBrownPct: number;
  exgScore: number;
  inferredLeafColor: "normal" | "yellowing" | "browning" | "mottling";
  stressLevel: "Low" | "Moderate" | "Elevated";
  summary: string;
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

/**
 * Pure pixel-buffer Computer Vision analyzer (HSV canopy segmentation + ExG vegetation index).
 * Runs deterministically on RGBA pixel data in browser Canvas or Node unit tests.
 */
export function analyzeLeafPixels(
  rgba: Uint8ClampedArray | number[],
): LeafVisionResult {
  const totalPixels = Math.floor(rgba.length / 4);
  if (totalPixels <= 0) {
    throw new Error("Image contains no readable pixel data.");
  }

  let greenCount = 0;
  let yellowCount = 0;
  let brownCount = 0;
  let exgSum = 0;

  for (let i = 0; i < totalPixels * 4; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    const a = rgba[i + 3];
    if (a < 128) continue;

    const [h, s, v] = rgbToHsv(r, g, b);
    // Excess Green Index normalized to [-1, 1] range
    const exg = (2 * g - r - b) / 255;
    exgSum += exg;

    // Ignore very dark shadows or blown-out white sky/glare
    if (v < 0.14 || (s < 0.14 && v > 0.85)) continue;

    // Healthy chlorophyll green: Hue 68°–165°, meaningful saturation
    if (h >= 68 && h <= 165 && s >= 0.18) {
      greenCount++;
    }
    // Chlorosis / yellowing: Hue 36°–68°, moderate-to-high brightness
    else if (h >= 36 && h < 68 && s >= 0.2 && v >= 0.3) {
      yellowCount++;
    }
    // Necrosis / browning / dry spots: Hue 12°–36°, lower-to-mid brightness
    else if (h >= 12 && h < 36 && s >= 0.2 && v >= 0.16 && v <= 0.78) {
      brownCount++;
    }
  }

  const veg = greenCount + yellowCount + brownCount;
  const denom = Math.max(1, veg);
  const healthyGreenPct = Math.round((greenCount / denom) * 100);
  const chlorosisYellowPct = Math.round((yellowCount / denom) * 100);
  const necrosisBrownPct = Math.round((brownCount / denom) * 100);
  const exgScore = Math.round((exgSum / totalPixels) * 100) / 100;

  let inferredLeafColor: LeafVisionResult["inferredLeafColor"] = "normal";
  if (chlorosisYellowPct >= 22 && necrosisBrownPct >= 18) {
    inferredLeafColor = "mottling";
  } else if (chlorosisYellowPct >= 24) {
    inferredLeafColor = "yellowing";
  } else if (necrosisBrownPct >= 24) {
    inferredLeafColor = "browning";
  }

  const stressPct = chlorosisYellowPct + necrosisBrownPct;
  const stressLevel: LeafVisionResult["stressLevel"] =
    stressPct >= 42 ? "Elevated" : stressPct >= 22 ? "Moderate" : "Low";

  const summary =
    veg === 0
      ? "Few vegetation pixels detected. Retake a closer photo of the crop canopy."
      : stressLevel === "Elevated"
        ? `Elevated foliar stress signal (${chlorosisYellowPct}% yellow chlorosis, ${necrosisBrownPct}% brown tissue). Cross-check with soil drainage and lab records.`
        : stressLevel === "Moderate"
          ? `Moderate colour variation (${chlorosisYellowPct}% yellow, ${healthyGreenPct}% healthy green). Inspect lower vs. upper leaves.`
          : `Predominantly healthy green canopy (${healthyGreenPct}% chlorophyll green, ExG ${exgScore}).`;

  return {
    algorithm: "HSV Color Segmentation + Excess Green Index (ExG)",
    sampledPixels: totalPixels,
    vegetationPixels: veg,
    healthyGreenPct,
    chlorosisYellowPct,
    necrosisBrownPct,
    exgScore,
    inferredLeafColor,
    stressLevel,
    summary,
  };
}

/**
 * Loads an image URL or data URL into an offscreen HTMLCanvasElement (downscaled to 160x160 for instant speed)
 * and runs analyzeLeafPixels.
 */
export async function analyzeLeafImageUrl(
  src: string,
): Promise<LeafVisionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 160;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context is unavailable.");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        resolve(analyzeLeafPixels(data));
      } catch (err) {
        reject(
          err instanceof Error ? err : new Error("Could not analyze image."),
        );
      }
    };
    img.onerror = () =>
      reject(new Error("Could not load image for computer vision analysis."));
    img.src = src;
  });
}
