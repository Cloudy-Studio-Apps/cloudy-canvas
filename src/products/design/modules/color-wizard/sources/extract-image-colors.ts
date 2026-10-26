import { colorOklch, rgbToHex, seededRandom } from "../color";
import type { ImageColor, ImageMood, PixelData } from "./sources.types";

interface Sample {
  lab: [number, number, number];
  rgb: [number, number, number];
  x: number;
  y: number;
  weight: number;
}

const distance = (a: readonly number[], b: readonly number[]) =>
  (a[0]! - b[0]!) ** 2 + (a[1]! - b[1]!) ** 2 + (a[2]! - b[2]!) ** 2;

function samples(pixels: PixelData, mood: ImageMood): Sample[] {
  const { data, width, height } = pixels;
  const out: Sample[] = [];
  for (let i = 0; i < width * height; i++) {
    if ((data[i * 4 + 3] ?? 0) < 128) continue;
    const rgb: [number, number, number] = [data[i * 4]!, data[i * 4 + 1]!, data[i * 4 + 2]!];
    const { L, C, h } = colorOklch(rgbToHex(rgb));
    const rad = (h * Math.PI) / 180;
    const weight = mood === "vivid" ? 0.3 + C * 6 : mood === "muted" ? 1.2 - Math.min(C * 5, 1) : 1;
    out.push({
      lab: [L, C * Math.cos(rad), C * Math.sin(rad)],
      rgb,
      x: (i % width) / width,
      y: Math.floor(i / width) / height,
      weight,
    });
  }
  return out;
}

/**
 * An image's `k` main colors (k-means in OKLab, seeded so it's repeatable), most covered first.
 * Each is a real pixel of the image (the one nearest its cluster's center) with where it is, so
 * a pin can sit on it. Give it a small copy of the image (about 100 px wide).
 */
export function extractImageColors(pixels: PixelData, k: number, mood: ImageMood): ImageColor[] {
  const px = samples(pixels, mood);
  if (!px.length || k < 1) return [];
  const random = seededRandom(42);
  const centers = [px[Math.floor(random() * px.length)]!.lab];
  while (centers.length < k) {
    // k-means++: far pixels are likelier next centers.
    const far = px.map((p) => Math.min(...centers.map((c) => distance(p.lab, c))) * p.weight);
    let target = random() * far.reduce((a, b) => a + b, 0);
    const at = far.findIndex((d) => (target -= d) <= 0);
    centers.push(px[at < 0 ? px.length - 1 : at]!.lab);
  }
  let owner: number[] = [];
  for (let round = 0; round < 12; round++) {
    owner = px.map((p) => {
      let best = 0;
      centers.forEach((c, j) => {
        if (distance(p.lab, c) < distance(p.lab, centers[best]!)) best = j;
      });
      return best;
    });
    centers.forEach((_, j) => {
      const sum = [0, 0, 0];
      let total = 0;
      px.forEach((p, i) => {
        if (owner[i] !== j) return;
        p.lab.forEach((v, q) => (sum[q]! += v * p.weight));
        total += p.weight;
      });
      if (total) centers[j] = sum.map((v) => v / total) as [number, number, number];
    });
  }
  return centers
    .map((center, j) => {
      let best: Sample | null = null;
      let count = 0;
      px.forEach((p, i) => {
        if (owner[i] !== j) return;
        count++;
        if (!best || distance(p.lab, center) < distance(best.lab, center)) best = p;
      });
      const found = best as Sample | null;
      return found ? { hex: rgbToHex(found.rgb), x: found.x, y: found.y, count } : null;
    })
    .filter((c): c is ImageColor => c !== null)
    .sort((a, b) => b.count - a.count);
}
