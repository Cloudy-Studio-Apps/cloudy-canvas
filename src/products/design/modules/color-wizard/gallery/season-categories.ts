import type { GalleryCategory } from "./gallery.types";
import { mixPalette, rangePalette } from "./recipes";
import { t } from "../color-wizard.i18n";

/** Palettes by season. */
export const SEASON_CATEGORIES: readonly GalleryCategory[] = [
  {
    group: "Seasons",
    id: "spring",
    label: t("gallery.season.spring"),
    description: t("gallery.season.springHint"),
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
    label: t("gallery.season.summer"),
    description: t("gallery.season.summerHint"),
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
    label: t("gallery.season.autumn"),
    description: t("gallery.season.autumnHint"),
    generate: rangePalette({ l: [0.35, 0.8], c: [0.08, 0.17], hues: [[25, 90]] }),
  },
  {
    group: "Seasons",
    id: "winter",
    label: t("gallery.season.winter"),
    description: t("gallery.season.winterHint"),
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
