import type { GalleryCategory } from "./gallery.types";
import { mixPalette, rangePalette } from "./recipes";
import { t } from "../color-wizard.i18n";

/** Palettes of moods, things and occasions: happy, coffee, food, wedding, the holidays, … */
export const OCCASION_CATEGORIES: readonly GalleryCategory[] = [
  {
    group: "Themes",
    id: "happy",
    label: t("gallery.occasion.happy"),
    description: t("gallery.occasion.happyHint"),
    generate: mixPalette([
      [
        [0.88, 0.93],
        [0.15, 0.19],
        [95, 105],
      ],
      [
        [0.72, 0.78],
        [0.16, 0.2],
        [0, 15],
      ],
      [
        [0.78, 0.85],
        [0.12, 0.15],
        [190, 205],
      ],
      [
        [0.75, 0.8],
        [0.15, 0.19],
        [55, 70],
      ],
      [
        [0.65, 0.72],
        [0.15, 0.2],
        [300, 330],
      ],
    ]),
  },
  {
    group: "Themes",
    id: "coffee",
    label: t("gallery.occasion.coffee"),
    description: t("gallery.occasion.coffeeHint"),
    generate: rangePalette({ l: [0.25, 0.92], c: [0.03, 0.08], hues: [[45, 70]] }),
  },
  {
    group: "Themes",
    id: "cream",
    label: t("gallery.occasion.cream"),
    description: t("gallery.occasion.creamHint"),
    generate: rangePalette({ l: [0.86, 0.97], c: [0.02, 0.05], hues: [[60, 95]] }),
  },
  {
    group: "Themes",
    id: "skin",
    label: t("gallery.occasion.skin"),
    description: t("gallery.occasion.skinHint"),
    generate: rangePalette({ l: [0.35, 0.9], c: [0.05, 0.1], hues: [[40, 65]] }),
  },
  {
    group: "Themes",
    id: "food",
    label: t("gallery.occasion.food"),
    description: t("gallery.occasion.foodHint"),
    generate: mixPalette([
      [
        [0.55, 0.62],
        [0.18, 0.21],
        [25, 35],
      ],
      [
        [0.55, 0.62],
        [0.13, 0.16],
        [140, 150],
      ],
      [
        [0.88, 0.93],
        [0.14, 0.18],
        [100, 108],
      ],
      [
        [0.75, 0.82],
        [0.08, 0.11],
        [70, 80],
      ],
      [
        [0.94, 0.97],
        [0.02, 0.04],
        [80, 95],
      ],
    ]),
  },
  {
    group: "Themes",
    id: "wedding",
    label: t("gallery.occasion.wedding"),
    description: t("gallery.occasion.weddingHint"),
    generate: mixPalette([
      [
        [0.96, 0.98],
        [0.01, 0.02],
        [80, 90],
      ],
      [
        [0.88, 0.92],
        [0.03, 0.05],
        [10, 30],
      ],
      [
        [0.8, 0.86],
        [0.03, 0.05],
        [130, 150],
      ],
      [
        [0.75, 0.8],
        [0.08, 0.1],
        [80, 90],
      ],
      [
        [0.45, 0.5],
        [0.03, 0.05],
        [130, 150],
      ],
    ]),
  },
  {
    group: "Themes",
    id: "christmas",
    label: t("gallery.occasion.christmas"),
    description: t("gallery.occasion.christmasHint"),
    generate: mixPalette([
      [
        [0.45, 0.52],
        [0.16, 0.19],
        [22, 30],
      ],
      [
        [0.38, 0.45],
        [0.08, 0.11],
        [150, 160],
      ],
      [
        [0.75, 0.8],
        [0.12, 0.14],
        [80, 90],
      ],
      [
        [0.96, 0.99],
        [0.005, 0.015],
        [80, 100],
      ],
      [
        [0.25, 0.3],
        [0.05, 0.07],
        [150, 160],
      ],
    ]),
  },
  {
    group: "Themes",
    id: "halloween",
    label: t("gallery.occasion.halloween"),
    description: t("gallery.occasion.halloweenHint"),
    generate: mixPalette([
      [
        [0.68, 0.72],
        [0.17, 0.2],
        [45, 55],
      ],
      [
        [0.15, 0.2],
        [0.01, 0.03],
        [280, 300],
      ],
      [
        [0.4, 0.48],
        [0.14, 0.18],
        [300, 315],
      ],
      [
        [0.75, 0.82],
        [0.17, 0.21],
        [125, 135],
      ],
      [
        [0.9, 0.95],
        [0.03, 0.05],
        [90, 100],
      ],
    ]),
  },
];
