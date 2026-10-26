import type { GalleryCategory } from "./gallery.types";
import { mixPalette, rangePalette } from "./recipes";

/** Palettes by season. */
export const SEASON_CATEGORIES: readonly GalleryCategory[] = [
  {
    group: "Seasons",
    id: "spring",
    label: "Spring",
    description: "Fresh greens, blossoms and sunshine.",
    generate: mixPalette([
      [
        [0.9, 0.96],
        [0.04, 0.08],
        [90, 130],
      ],
      [
        [0.78, 0.86],
        [0.1, 0.15],
        [120, 150],
      ],
      [
        [0.82, 0.9],
        [0.06, 0.1],
        [340, 360],
      ],
      [
        [0.88, 0.94],
        [0.08, 0.13],
        [85, 100],
      ],
      [
        [0.6, 0.7],
        [0.1, 0.14],
        [140, 160],
      ],
    ]),
  },
  {
    group: "Seasons",
    id: "summer",
    label: "Summer",
    description: "Sun, sea and ice cream.",
    generate: mixPalette([
      [
        [0.9, 0.95],
        [0.08, 0.12],
        [90, 100],
      ],
      [
        [0.72, 0.8],
        [0.15, 0.2],
        [45, 65],
      ],
      [
        [0.65, 0.72],
        [0.18, 0.23],
        [10, 30],
      ],
      [
        [0.75, 0.82],
        [0.1, 0.14],
        [195, 210],
      ],
      [
        [0.55, 0.62],
        [0.12, 0.15],
        [220, 235],
      ],
    ]),
  },
  {
    group: "Seasons",
    id: "autumn",
    label: "Autumn",
    description: "Rust, mustard and fallen leaves.",
    generate: rangePalette({ l: [0.35, 0.8], c: [0.08, 0.17], hues: [[25, 90]] }),
  },
  {
    group: "Seasons",
    id: "winter",
    label: "Winter",
    description: "Snow, frost and long nights.",
    generate: mixPalette([
      [
        [0.95, 0.99],
        [0.005, 0.02],
        [220, 250],
      ],
      [
        [0.82, 0.9],
        [0.03, 0.06],
        [215, 240],
      ],
      [
        [0.6, 0.7],
        [0.05, 0.09],
        [225, 250],
      ],
      [
        [0.38, 0.48],
        [0.05, 0.09],
        [240, 265],
      ],
      [
        [0.2, 0.28],
        [0.03, 0.06],
        [250, 270],
      ],
    ]),
  },
];
